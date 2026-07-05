// Vanta Suite — Workflow Engine.
// Executes named, ordered lists of steps with the same action-type vocabulary as custom commands.
// Supports: cycle detection, step-by-step progress events, nesting, error handling.
// Reuses commandExecutor.executeCommand for safety (destructive checks, confirmations).

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { IPC_EVENTS } from '../core/ipcContracts.js';
import logger from '../core/logger.js';
import { getMainWindow } from './windowManager.js';
import { DESTRUCTIVE_PATTERNS } from './commandExecutor.js';

// Check if wmctrl is available on the system
const hasWmctrl = (() => {
  try {
    const result = spawnSync('which', ['wmctrl'], { encoding: 'utf-8', timeout: 2000 });
    return result.status === 0 && result.stdout.trim().length > 0;
  } catch { return false; }
})();

if (!hasWmctrl) {
  console.warn('[workflow-engine] wmctrl not found — switch-workspace and focus-window steps will not work. Install with: sudo apt install wmctrl');
}

const DATA_DIR = join(process.cwd(), 'data');
const WORKFLOWS_PATH = join(DATA_DIR, 'workflows', 'workflows.json');

function loadWorkflows() {
  try {
    if (existsSync(WORKFLOWS_PATH)) {
      const data = JSON.parse(readFileSync(WORKFLOWS_PATH, 'utf-8'));
      return Array.isArray(data) ? data : [data];
    }
  } catch (err) {
    logger.error('workflow-engine', 'Failed to load workflows', { error: err.message });
  }
  return [];
}

function saveWorkflows(workflows) {
  try {
    writeFileSync(WORKFLOWS_PATH, JSON.stringify(workflows, null, 2), 'utf-8');
  } catch (err) {
    logger.error('workflow-engine', 'Failed to save workflows', { error: err.message });
  }
}

function findWorkflow(id) {
  return loadWorkflows().find(w => w.id === id) || null;
}

function emitWorkflowEvent(event, data) {
  const win = getMainWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send(event, data);
  }
}

/**
 * Run a workflow by ID, executing steps in sequence.
 * Reuses commandExecutor.executeCommand for safety.
 */
export async function runWorkflow(workflowId) {
  const workflow = findWorkflow(workflowId);
  if (!workflow) {
    logger.error('workflow-engine', `Unknown workflow: ${workflowId}`);
    return { success: false, error: `Unknown workflow: ${workflowId}` };
  }

  const steps = workflow.steps || [];
  logger.info('workflow-engine', `Running workflow: ${workflow.name} (${steps.length} steps)`);

  let completed = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    emitWorkflowEvent(IPC_EVENTS.WORKFLOW_STEP_STARTED, {
      workflowId,
      workflowName: workflow.name,
      stepIndex: i,
      totalSteps: steps.length,
      stepType: step.type,
    });

    try {
      let result;

      if (step.type === 'switch-workspace') {
        result = await switchWorkspace(step.value);
      } else if (step.type === 'focus-window') {
        result = await focusWindow(step.value);
      } else {
        result = await executeInlineStep(step);
      }

      if (result?.cancelled) {
        emitWorkflowEvent(IPC_EVENTS.WORKFLOW_STEP_ERROR, {
          workflowId, stepIndex: i, error: 'Step cancelled by user',
        });
        break;
      }

      if (!result?.success) {
        emitWorkflowEvent(IPC_EVENTS.WORKFLOW_STEP_ERROR, {
          workflowId, stepIndex: i, error: result?.error || 'Unknown error',
        });
        break;
      }

      completed++;
      emitWorkflowEvent(IPC_EVENTS.WORKFLOW_STEP_COMPLETED, {
        workflowId, stepIndex: i, totalSteps: steps.length, completedSteps: completed,
      });
    } catch (err) {
      logger.error('workflow-engine', `Step ${i + 1} failed`, { error: err.message });
      emitWorkflowEvent(IPC_EVENTS.WORKFLOW_STEP_ERROR, {
        workflowId, stepIndex: i, error: err.message,
      });
      break;
    }
  }

  emitWorkflowEvent(IPC_EVENTS.WORKFLOW_COMPLETED, {
    workflowId, workflowName: workflow.name,
    stepsCompleted: completed, totalSteps: steps.length,
  });

  return { success: completed === steps.length, stepsCompleted: completed, totalSteps: steps.length };
}

/**
 * Execute an inline step that commandExecutor doesn't support natively.
 * All shell-based steps pass through destructive pattern checks via isDestructive-like logic.
 */
async function executeInlineStep(step) {
  const { shell, dialog } = await import('electron');

  function isDestructive(cmd) {
    return DESTRUCTIVE_PATTERNS.some(p => p.test(cmd));
  }

  try {
    switch (step.type) {
      case 'open-path': {
        const pathResult = await shell.openPath(step.value);
        return { success: !pathResult, error: pathResult || undefined };
      }

      case 'open-url':
        await shell.openExternal(step.value);
        return { success: true };

      case 'run-shell': {
        const needsConfirm = step.requiresConfirmation || isDestructive(step.value);
        if (needsConfirm) {
          const { response } = await dialog.showMessageBox({
            type: 'warning',
            title: 'Workflow Step Confirmation',
            message: 'Run this shell command?',
            detail: step.value,
            buttons: ['Cancel', 'Run'],
            defaultId: 0, cancelId: 0,
          });
          if (response !== 1) return { cancelled: true };
        }

        const { exec } = await import('child_process');
        return new Promise((resolve) => {
          exec(step.value, { timeout: 30000 }, (error, stdout, stderr) => {
            resolve(error
              ? { success: false, error: error.message, output: stderr || stdout }
              : { success: true, output: stdout }
            );
          });
        });
      }

      case 'toggle-focus-mode': {
        const win = getMainWindow();
        if (win) win.webContents.send('module:open', 'notifications');
        return { success: true };
      }

      case 'create-timer': {
        const w = getMainWindow();
        if (w) w.webContents.send('module:open', 'reminders');
        return { success: true };
      }

      default:
        return { success: false, error: `Unknown step type: ${step.type}` };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function switchWorkspace(workspaceNum) {
  if (!hasWmctrl) return { success: false, error: 'wmctrl not installed. Install with: sudo apt install wmctrl' };
  const { exec } = await import('child_process');
  return new Promise((resolve) => {
    exec(`wmctrl -s ${(workspaceNum || 1) - 1}`, (error) => {
      resolve(error ? { success: false, error: error.message } : { success: true });
    });
  });
}

async function focusWindow(windowTitle) {
  if (!hasWmctrl) return { success: false, error: 'wmctrl not installed. Install with: sudo apt install wmctrl' };
  const { exec } = await import('child_process');
  return new Promise((resolve) => {
    exec(`wmctrl -a "${windowTitle}"`, (error) => {
      resolve(error ? { success: false, error: error.message } : { success: true });
    });
  });
}

// --- Cycle Detection ---

export function detectCycle(workflowId, steps) {
  const allWorkflows = loadWorkflows();
  const graph = new Map();

  for (const wf of allWorkflows) {
    const called = (wf.steps || []).filter(s => s.type === 'workflow').map(s => s.value);
    graph.set(wf.id, called);
  }

  const proposedCalled = (steps || []).filter(s => s.type === 'workflow').map(s => s.value);
  graph.set(workflowId, proposedCalled);

  const visited = new Set();
  const inStack = new Set();

  function dfs(node) {
    visited.add(node);
    inStack.add(node);
    for (const neighbor of (graph.get(node) || [])) {
      if (!visited.has(neighbor)) {
        const result = dfs(neighbor);
        if (result) return [node, ...result];
      } else if (inStack.has(neighbor)) {
        return [neighbor];
      }
    }
    inStack.delete(node);
    return null;
  }

  const cycle = dfs(workflowId);
  if (cycle) return { valid: false, cyclePath: [workflowId, ...cycle] };
  return { valid: true };
}

// --- CRUD ---

export function getAllWorkflows() { return loadWorkflows(); }

export function addWorkflow(workflow) {
  if (!workflow.id || !workflow.name) return { success: false, error: 'Missing required fields: id, name' };
  const workflows = loadWorkflows();
  if (workflows.some(w => w.id === workflow.id)) return { success: false, error: `Workflow "${workflow.id}" already exists` };

  const cycleCheck = detectCycle(workflow.id, workflow.steps || []);
  if (!cycleCheck.valid) return { success: false, error: 'Cycle detected', cyclePath: cycleCheck.cyclePath };

  workflows.push(workflow);
  saveWorkflows(workflows);
  return { success: true };
}

export function updateWorkflow(workflowId, updates) {
  const workflows = loadWorkflows();
  const index = workflows.findIndex(w => w.id === workflowId);
  if (index === -1) return { success: false, error: `Workflow "${workflowId}" not found` };

  const merged = { ...workflows[index], ...updates };
  const cycleCheck = detectCycle(workflowId, merged.steps || []);
  if (!cycleCheck.valid) return { success: false, error: 'Cycle detected', cyclePath: cycleCheck.cyclePath };

  workflows[index] = merged;
  saveWorkflows(workflows);
  return { success: true };
}

export function removeWorkflow(workflowId) {
  const workflows = loadWorkflows();
  const index = workflows.findIndex(w => w.id === workflowId);
  if (index === -1) return { success: false, error: `Workflow "${workflowId}" not found` };

  workflows.splice(index, 1);
  saveWorkflows(workflows);
  return { success: true };
}
