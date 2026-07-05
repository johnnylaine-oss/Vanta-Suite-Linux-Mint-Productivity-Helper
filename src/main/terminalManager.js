// Vanta Suite — Terminal Manager.
// Spawns and manages real shell processes via node-pty.
// Streams terminal output to the renderer over IPC.
// Supports multiple tabs, resize, and shell auto-detection.

import { spawn } from 'node-pty';
import { existsSync } from 'fs';
import { IPC_EVENTS } from '../core/ipcContracts.js';
import logger from '../core/logger.js';
import { getMainWindow } from './windowManager.js';

// Map of terminalId -> { pty, cwd, shell }
const terminals = new Map();

/**
 * Auto-detect the user's shell from $SHELL, falling back to /bin/bash.
 * @returns {string}
 */
function detectShell() {
  const envShell = process.env.SHELL;
  if (envShell && existsSync(envShell)) return envShell;
  if (existsSync('/bin/bash')) return '/bin/bash';
  if (existsSync('/bin/zsh')) return '/bin/zsh';
  if (existsSync('/bin/fish')) return '/bin/fish';
  return '/bin/sh';
}

/**
 * Create a new terminal PTY and start streaming to the renderer.
 * @param {string} terminalId - Unique ID for this terminal
 * @param {object} options - { shell, cwd, cols, rows }
 * @returns {object} - { success, pid }
 */
export function createTerminal(terminalId, options = {}) {
  if (terminals.has(terminalId)) {
    destroyTerminal(terminalId);
  }

  const shell = options.shell || detectShell();
  const cwd = options.cwd || process.env.HOME || '/';
  const cols = options.cols || 80;
  const rows = options.rows || 24;

  logger.info('terminal-manager', `Spawning shell: ${shell} (id: ${terminalId})`, { cwd, cols, rows });

  let pty;
  try {
    pty = spawn(shell, [], {
      name: 'xterm-256color',
      cols,
      rows,
      cwd,
      env: process.env,
    });
  } catch (err) {
    logger.error('terminal-manager', 'Failed to spawn PTY', { error: err.message });
    return { success: false, error: err.message };
  }

  const termData = { pty, cwd, shell, cols, rows };
  terminals.set(terminalId, termData);

  // Stream output to renderer
  pty.onData((data) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_EVENTS.TERMINAL_DATA, terminalId, data);
    }
  });

  // Handle exit
  pty.onExit(({ exitCode, signal }) => {
    logger.info('terminal-manager', `PTY exited: ${terminalId}`, { exitCode, signal });
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send(IPC_EVENTS.TERMINAL_EXIT, terminalId, exitCode, signal);
    }
    terminals.delete(terminalId);
  });

  return { success: true, pid: pty.pid };
}

/**
 * Write data to a terminal PTY (from renderer user input).
 * @param {string} terminalId
 * @param {string} data
 */
export function writeToTerminal(terminalId, data) {
  const term = terminals.get(terminalId);
  if (term && term.pty) {
    term.pty.write(data);
  }
}

/**
 * Resize a terminal PTY.
 * @param {string} terminalId
 * @param {number} cols
 * @param {number} rows
 */
export function resizeTerminal(terminalId, cols, rows) {
  const term = terminals.get(terminalId);
  if (term && term.pty) {
    term.cols = cols;
    term.rows = rows;
    try {
      term.pty.resize(cols, rows);
    } catch (err) {
      logger.warn('terminal-manager', 'Failed to resize PTY', { terminalId, error: err.message });
    }
  }
}

/**
 * Destroy a terminal PTY.
 * @param {string} terminalId
 */
export function destroyTerminal(terminalId) {
  const term = terminals.get(terminalId);
  if (term && term.pty) {
    try {
      term.pty.kill();
    } catch (err) {
      logger.warn('terminal-manager', 'Failed to kill PTY', { terminalId, error: err.message });
    }
  }
  terminals.delete(terminalId);
}

/**
 * Destroy all terminal PTYs (on app quit).
 */
export function destroyAllTerminals() {
  for (const [id] of terminals) {
    destroyTerminal(id);
  }
}

/**
 * Get the list of active terminal IDs.
 * @returns {string[]}
 */
export function getActiveTerminals() {
  return Array.from(terminals.keys());
}
