// Vanta Suite — Global Hotkey Engine.
// Wraps Electron's globalShortcut module in a custom engine.
// Supported bindings: modifier combos, double-tap, key sequences.
// Context-aware scoping: "global" (always active) vs "app-focused" (only when Vanta has focus).
// Stores { action, keys, scope, profile } records per spec Section 7.

import { globalShortcut, BrowserWindow } from 'electron';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { IPC_EVENTS } from '../core/ipcContracts.js';
import logger from '../core/logger.js';
import { getMainWindow } from './windowManager.js';

// Array of binding records: { action: string, keys: string, scope: 'global'|'app-focused', profile: string }
let activeBindings = [];
let profileBindings = new Map();  // profile name -> binding record array
let shortcutsPath = '';
let activeProfile = 'default';
let isInitialized = false;

/**
 * Initialize the hotkey engine.
 * @param {string} path - Path to shortcuts.json
 */
export function initHotkeyEngine(path) {
  shortcutsPath = path;
  activeProfile = 'default';
  isInitialized = true;

  loadShortcuts();
  registerAllShortcuts();

  logger.info('hotkey-engine', 'Hotkey engine initialized', {
    profile: activeProfile,
    bindings: activeBindings.length,
  });
}

/**
 * Load shortcut definitions from disk.
 * Supports both legacy format ({accelerator: action}) and new format ([{action, keys, scope, profile}]).
 */
function loadShortcuts() {
  if (!existsSync(shortcutsPath)) {
    const defaults = getDefaultShortcuts();
    try {
      mkdirSync(dirname(shortcutsPath), { recursive: true });
      writeFileSync(shortcutsPath, JSON.stringify(defaults, null, 2), 'utf-8');
    } catch (err) {
      logger.error('hotkey-engine', 'Failed to write default shortcuts', { error: err.message });
    }
    activeBindings = defaults;
    return;
  }

  try {
    const data = JSON.parse(readFileSync(shortcutsPath, 'utf-8'));

    if (Array.isArray(data)) {
      // New format: array of { action, keys, scope, profile }
      activeBindings = data.map(b => ({
        action: b.action,
        keys: b.keys || b.accelerator,
        scope: b.scope || 'global',
        profile: b.profile || activeProfile,
      }));
    } else if (typeof data === 'object') {
      // Legacy format: { "Ctrl+Space": "command-palette" }
      activeBindings = Object.entries(data).map(([keys, action]) => ({
        action,
        keys,
        scope: 'global',
        profile: activeProfile,
      }));
    }

    // Migrate legacy Ctrl-based global bindings to Super to match the new defaults.
    if (migrateLegacyCtrlBindings(activeBindings)) {
      try {
        writeFileSync(shortcutsPath, JSON.stringify(activeBindings, null, 2), 'utf-8');
        logger.info('hotkey-engine', 'Migrated legacy Ctrl+ global shortcuts to Super+');
      } catch (err) {
        logger.warn('hotkey-engine', 'Failed to persist migrated shortcuts', { error: err.message });
      }
    }
  } catch (err) {
    logger.error('hotkey-engine', 'Failed to load shortcuts', { error: err.message });
    activeBindings = getDefaultShortcuts();
  }
}

/**
 * Get sensible default shortcuts as array format.
 * All global bindings use the Super key so they remain accessible without
 * conflicting with text editor / IDE Ctrl-combos.
 */
function getDefaultShortcuts() {
  return [
    { action: 'command-palette', keys: 'Super+Space', scope: 'global', profile: 'default' },
    { action: 'toggle-quake-terminal', keys: 'Super+Shift+Space', scope: 'global', profile: 'default' },
    { action: 'open-group-development', keys: 'Super+Shift+1', scope: 'global', profile: 'default' },
    { action: 'open-group-gaming', keys: 'Super+Shift+2', scope: 'global', profile: 'default' },
    { action: 'open-group-media', keys: 'Super+Shift+3', scope: 'global', profile: 'default' },
    { action: 'open-group-communication', keys: 'Super+Shift+4', scope: 'global', profile: 'default' },
    { action: 'settings', keys: 'Super+Shift+S', scope: 'global', profile: 'default' },
    { action: 'clipboard', keys: 'Super+Shift+C', scope: 'global', profile: 'default' },
    { action: 'notifications', keys: 'Super+Shift+N', scope: 'global', profile: 'default' },
    { action: 'ai-assistant', keys: 'Super+Shift+A', scope: 'global', profile: 'default' },
    { action: 'focus-mode', keys: 'Super+Shift+F', scope: 'global', profile: 'default' },
  ];
}

/**
 * Migrate legacy "Ctrl+..." global bindings to "Super+..." so existing users
 * get the new behavior on next launch without manual editing.
 * App-focused (in-app) bindings are left alone — Ctrl is the conventional
 * text-editor modifier and we keep those stable.
 */
function migrateLegacyCtrlBindings(bindings) {
  let changed = false;
  for (const b of bindings) {
    if (b.scope === 'global' && /^Ctrl\+/i.test(b.keys || '')) {
      b.keys = b.keys.replace(/^Ctrl\+/i, 'Super+');
      changed = true;
    }
  }
  return changed;
}

/**
 * Normalize an accelerator string for consistent comparison.
 * @param {string} accel
 * @returns {string}
 */
function normalizeAccelerator(accel) {
  return accel
    .replace(/Control/g, 'Ctrl')
    .replace(/Command/g, 'Cmd')
    .replace(/\s+/g, '');
}

/**
 * Register all global-scope shortcuts with Electron.
 * App-focused shortcuts are tracked but not globally registered.
 */
function registerAllShortcuts() {
  globalShortcut.unregisterAll();
  let registered = 0;
  let skipped = 0;

  for (const binding of activeBindings) {
    if (binding.scope !== 'global') {
      skipped++;
      continue;
    }

    try {
      const success = globalShortcut.register(binding.keys, () => {
        handleHotkeyPress(binding.keys, binding.action, binding.scope);
      });

      if (success) {
        registered++;
      } else {
        logger.warn('hotkey-engine', `Failed to register: ${binding.keys}`, {
          action: binding.action,
          note: 'May conflict with another application',
        });
      }
    } catch (err) {
      logger.error('hotkey-engine', `Error registering: ${binding.keys}`, {
        action: binding.action,
        error: err.message,
      });
    }
  }

  logger.info('hotkey-engine', `Registered ${registered} global shortcut(s), ${skipped} app-focused`);
}

/**
 * Handle a hotkey press with scope checking.
 * @param {string} accelerator
 * @param {string} action
 * @param {string} scope
 */
function handleHotkeyPress(accelerator, action, scope) {
  logger.debug('hotkey-engine', `Hotkey pressed: ${accelerator} -> ${action} (scope: ${scope})`);

  // Check scope: app-focused shortcuts only work when Vanta window is focused
  if (scope === 'app-focused') {
    const focusedWin = BrowserWindow.getFocusedWindow();
    const mainWin = getMainWindow();
    if (!focusedWin || focusedWin !== mainWin) {
      return;
    }
  }

  dispatchAction(action, accelerator);
}

/**
 * Dispatch an action to the renderer.
 * @param {string} action
 * @param {string} accelerator
 */
function dispatchAction(action, accelerator) {
  const win = getMainWindow();
  if (!win || win.isDestroyed()) return;

  if (win.webContents && !win.webContents.isDestroyed()) {
    win.webContents.send(IPC_EVENTS.HOTKEY_PRESSED, action, accelerator);
  }
}

// --- Conflict Detection ---

/**
 * Check if a key combination is already bound.
 * @param {string} keys - Normalized accelerator string
 * @returns {object|null} - { action, profile } or null
 */
export function checkConflict(keys) {
  const normalized = normalizeAccelerator(keys);
  const existing = activeBindings.find(
    b => normalizeAccelerator(b.keys) === normalized && b.profile === activeProfile
  );
  if (existing) {
    return { action: existing.action, profile: existing.profile };
  }
  return null;
}

// --- Bind / Unbind ---

/**
 * Add or update a shortcut binding.
 * @param {object} binding - { action, keys, scope, profile }
 * @returns {object}
 */
export function bindShortcut(binding) {
  const normalized = normalizeAccelerator(binding.keys);
  const conflict = checkConflict(normalized);
  if (conflict && conflict.action !== binding.action) {
    return { success: false, conflict };
  }

  // Remove existing binding for same action if it exists
  activeBindings = activeBindings.filter(
    b => !(b.action === binding.action && b.profile === (binding.profile || activeProfile))
  );

  activeBindings.push({
    action: binding.action,
    keys: normalized,
    scope: binding.scope || 'global',
    profile: binding.profile || activeProfile,
  });

  saveShortcuts();
  registerAllShortcuts();

  return { success: true };
}

/**
 * Remove a shortcut binding.
 * @param {string} accelerator
 */
export function unbindShortcut(accelerator) {
  const normalized = normalizeAccelerator(accelerator);
  activeBindings = activeBindings.filter(b => normalizeAccelerator(b.keys) !== normalized);
  globalShortcut.unregister(accelerator);
  saveShortcuts();
}

/**
 * Get all current bindings.
 * @returns {Array}
 */
export function getAllBindings() {
  return activeBindings;
}

// --- Profile Management ---

/**
 * Get the active profile name.
 * @returns {string}
 */
export function getActiveProfile() {
  return activeProfile;
}

/**
 * Switch to a named hotkey profile.
 * @param {string} profileName
 */
export function switchProfile(profileName) {
  // Save current profile bindings
  profileBindings.set(activeProfile, [...activeBindings]);

  // Load target profile
  if (profileBindings.has(profileName)) {
    activeBindings = profileBindings.get(profileName);
  } else {
    activeBindings = getDefaultShortcuts();
  }

  activeProfile = profileName;
  registerAllShortcuts();

  logger.info('hotkey-engine', `Switched to profile: ${profileName}`);
}

/**
 * Get all profile names.
 * @returns {string[]}
 */
export function getProfileNames() {
  return Array.from(profileBindings.keys());
}

// --- Persistence ---

/**
 * Save current bindings to disk as array format.
 */
function saveShortcuts() {
  try {
    writeFileSync(shortcutsPath, JSON.stringify(activeBindings, null, 2), 'utf-8');
  } catch (err) {
    logger.error('hotkey-engine', 'Failed to save shortcuts', { error: err.message });
  }
}

// --- Cleanup ---

/**
 * Clean up — unregister all shortcuts.
 */
export function destroyHotkeyEngine() {
  globalShortcut.unregisterAll();
  activeBindings = [];
  isInitialized = false;
  logger.info('hotkey-engine', 'Hotkey engine destroyed');
}

// --- App-Focused Shortcut Registration ---

/**
 * Handle keydown events from the renderer for app-focused shortcuts.
 * Called via IPC when the renderer captures keydown events.
 * @param {string} keyEvent - key representation from the renderer
 */
export function handleAppKeyEvent(keyEvent) {
  if (!isInitialized) return;

  // Normalize the key event
  const normalized = normalizeAccelerator(keyEvent);

  // Check app-focused bindings
  for (const binding of activeBindings) {
    if (binding.scope !== 'app-focused') continue;
    if (normalizeAccelerator(binding.keys) === normalized) {
      dispatchAction(binding.action, binding.keys);
      return;
    }
  }
}

export default {
  init: initHotkeyEngine,
  checkConflict,
  bind: bindShortcut,
  unbind: unbindShortcut,
  getAll: getAllBindings,
  switchProfile,
  getProfileNames,
  getActiveProfile,
  handleAppKeyEvent,
  destroy: destroyHotkeyEngine,
};
