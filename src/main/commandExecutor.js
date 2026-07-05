// Vanta Suite — Command Executor.
// Resolves and executes any command by its ID. Handles all action types:
// run-shell, open-path, open-url, open-module, toggle-focus-mode, create-timer, prompt-then-run.
// Supports variable substitution and confirmation dialogs for destructive actions.

import { exec } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { dialog, shell } from 'electron';
import { IPC_EVENTS } from '../core/ipcContracts.js';
import logger from '../core/logger.js';
import { getMainWindow } from './windowManager.js';

const DATA_DIR = join(process.cwd(), 'data');
const COMMANDS_PATH = join(DATA_DIR, 'commands', 'commands.json');

// Keywords that force requiresConfirmation=true for run-shell actions
// Exported so workflowEngine can reuse the same check.
export const DESTRUCTIVE_PATTERNS = [
  /\brm\b/, /\bshutdown\b/, /\breboot\b/, /\bdd\b/, /\bmkfs\b/,
  /\bfdisk\b/, /\bmount\b/, /\bumount\b/, /\bchmod\b.*777/, />\s*\//
];

/**
 * Load all commands from disk.
 * @returns {Array}
 */
function loadCommands() {
  try {
    if (existsSync(COMMANDS_PATH)) {
      const data = JSON.parse(readFileSync(COMMANDS_PATH, 'utf-8'));
      return data.commands || [];
    }
  } catch (err) {
    logger.error('command-executor', 'Failed to load commands', { error: err.message });
  }
  return [];
}

/**
 * Save commands to disk.
 * @param {Array} commands
 */
function saveCommands(commands) {
  try {
    writeFileSync(COMMANDS_PATH, JSON.stringify({ commands }, null, 2), 'utf-8');
  } catch (err) {
    logger.error('command-executor', 'Failed to save commands', { error: err.message });
  }
}

/**
 * Find a command by ID.
 * @param {string} commandId
 * @returns {object|null}
 */
function findCommand(commandId) {
  return loadCommands().find(c => c.id === commandId) || null;
}

/**
 * Check if a shell command contains destructive patterns.
 * @param {string} command
 * @returns {boolean}
 */
function isDestructive(command) {
  return DESTRUCTIVE_PATTERNS.some(p => p.test(command));
}

/**
 * Substitute variables in a command string.
 * Handles both {varName} and $ENV_VAR patterns.
 * @param {string} template
 * @param {object} variables
 * @returns {string}
 */
function substituteVariables(template, variables = {}) {
  let result = template;

  // Replace env vars like $HOME, $USER
  result = result.replace(/\$(\w+)/g, (_, name) => process.env[name] || `$${name}`);

  // Replace {variable} placeholders
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  return result;
}

/**
 * Check if a command requires variable input that hasn't been provided.
 * @param {object} command
 * @param {object} variables
 * @returns {string[]} - list of missing variable names
 */
function getMissingVariables(command, variables = {}) {
  const required = command.action?.variables || [];
  return required.filter(v => !(v in variables));
}

/**
 * Execute a command by its ID.
 * @param {string} commandId
 * @param {object} context - { variables: { value: "50" } }
 * @returns {Promise<object>} - { success, output?, expectingVariables?, cancelled? }
 */
export async function executeCommand(commandId, context = {}) {
  const command = findCommand(commandId);
  if (!command) {
    logger.error('command-executor', `Unknown command: ${commandId}`);
    return { success: false, error: `Unknown command: ${commandId}` };
  }

  const { variables = {} } = context;
  const action = command.action;

  logger.info('command-executor', `Executing: ${command.trigger}`, {
    id: commandId,
    actionType: action.type,
    variables,
  });

  try {
    switch (action.type) {
      case 'run-shell':
        return await executeShell(command, variables);

      case 'open-path':
        return await openPath(action.value, variables, action.args);

      case 'open-url':
        return await openUrl(action.value, variables);

      case 'open-module':
        return openModule(action.value);

      case 'toggle-focus-mode':
        return toggleFocusMode();

      case 'create-timer':
        return createTimer(command, variables);

      case 'prompt-then-run':
        return await executePromptThenRun(command, variables);

      default:
        logger.warn('command-executor', `Unknown action type: ${action.type}`);
        return { success: false, error: `Unknown action type: ${action.type}` };
    }
  } catch (err) {
    logger.error('command-executor', `Execution failed for: ${commandId}`, {
      error: err.message,
    });
    return { success: false, error: err.message };
  }
}

/**
 * Execute a shell command with optional confirmation.
 */
async function executeShell(command, variables = {}) {
  const action = command.action;
  const shellCmd = substituteVariables(action.value, variables);

  // Sanitize: check destructive patterns on the fully-substituted command
  const needsConfirmation = action.requiresConfirmation || isDestructive(shellCmd);

  if (needsConfirmation) {
    const { response } = await dialog.showMessageBox({
      type: 'warning',
      title: 'Confirm Shell Execution',
      message: `Run this command?`,
      detail: shellCmd,
      buttons: ['Cancel', 'Run'],
      defaultId: 0,
      cancelId: 0,
    });
    if (response !== 1) return { cancelled: true };
  }

  return new Promise((resolve) => {
    exec(shellCmd, { timeout: 30000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message, output: stderr || stdout });
      } else {
        resolve({ success: true, output: stdout });
      }
    });
  });
}

/**
 * Prompt for variables, then run a shell command.
 */
async function executePromptThenRun(command, variables = {}) {
  const action = command.action;
  const promptFor = action.promptFor || [];
  const missing = promptFor.filter(v => !(v in variables) || !variables[v]);

  if (missing.length > 0) {
    return { expectingVariables: missing };
  }

  // All variables present — run the shell command
  return await executeShell(command, variables);
}

/**
 * Open a file, folder, or application.
 */
async function openPath(pathTemplate, variables = {}, args = []) {
  const resolvedPath = substituteVariables(pathTemplate, variables);
  try {
    const result = await shell.openPath(resolvedPath);
    if (result) {
      // openPath returns an error string if it fails
      return { success: false, error: result };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Open a URL in the default browser.
 */
async function openUrl(urlTemplate, variables = {}) {
  const resolvedUrl = substituteVariables(urlTemplate, variables);
  try {
    await shell.openExternal(resolvedUrl);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Open a module in the Vanta Suite window.
 */
function openModule(moduleName) {
  const win = getMainWindow();
  if (win && !win.isDestroyed()) {
    win.show();
    win.focus();
    win.webContents.send(IPC_EVENTS.MODULE_OPEN_REQUESTED, moduleName);
  }
  return { success: true };
}

/**
 * Toggle notification focus/Do Not Disturb mode.
 */
function toggleFocusMode() {
  const win = getMainWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send(IPC_EVENTS.MODULE_OPEN_REQUESTED, 'notifications');
  }
  return { success: true, data: { focusModeToggled: true } };
}

/**
 * Create a countdown timer.
 */
function createTimer(command, variables = {}) {
  const duration = variables.duration || command.action?.value || '5m';
  const win = getMainWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send(IPC_EVENTS.MODULE_OPEN_REQUESTED, 'reminders');
  }
  return { success: true, data: { timerDuration: duration } };
}

/**
 * Check if a command needs variable input.
 * Returns array of missing variable names, or empty if all provided.
 */
export function checkVariables(commandId, variables = {}) {
  const command = findCommand(commandId);
  if (!command) return [];
  return getMissingVariables(command, variables);
}

// --- CRUD Operations ---

/**
 * Get all commands.
 * @returns {Array}
 */
export function getAllCommands() {
  return loadCommands();
}

/**
 * Add a new command.
 * @param {object} command
 * @returns {object}
 */
export function addCommand(command) {
  const commands = loadCommands();

  // Validate required fields
  if (!command.id || !command.trigger || !command.action?.type) {
    return { success: false, error: 'Missing required fields: id, trigger, action.type' };
  }

  // Check for duplicates
  if (commands.some(c => c.id === command.id)) {
    return { success: false, error: `Command "${command.id}" already exists` };
  }

  // Enforce requiresConfirmation for destructive patterns
  if (command.action.type === 'run-shell' && isDestructive(command.action.value || '')) {
    command.action.requiresConfirmation = true;
  }

  commands.push(command);
  saveCommands(commands);
  logger.info('command-executor', `Added command: ${command.trigger}`);
  return { success: true };
}

/**
 * Update an existing command.
 * @param {string} commandId
 * @param {object} updates
 * @returns {object}
 */
export function updateCommand(commandId, updates) {
  const commands = loadCommands();
  const index = commands.findIndex(c => c.id === commandId);

  if (index === -1) {
    return { success: false, error: `Command "${commandId}" not found` };
  }

  commands[index] = { ...commands[index], ...updates };

  // Enforce requiresConfirmation for destructive patterns
  if (commands[index].action?.type === 'run-shell' && isDestructive(commands[index].action.value || '')) {
    commands[index].action.requiresConfirmation = true;
  }

  saveCommands(commands);
  return { success: true };
}

/**
 * Remove a command.
 * @param {string} commandId
 * @returns {object}
 */
export function removeCommand(commandId) {
  const commands = loadCommands();
  const index = commands.findIndex(c => c.id === commandId);

  if (index === -1) {
    return { success: false, error: `Command "${commandId}" not found` };
  }

  commands.splice(index, 1);
  saveCommands(commands);
  return { success: true };
}
