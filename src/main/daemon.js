// Vanta Suite — Daemon (Electron Main Process).
// Starts first on launch: registers global hotkeys, creates tray icon,
// and lazily spawns/shows the renderer window only when needed.
// The renderer window can close without killing the daemon.

import { app, BrowserWindow, Tray, Menu, globalShortcut, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { IPC_CHANNELS, IPC_EVENTS } from '../core/ipcContracts.js';
import logger from '../core/logger.js';
import { BRAND_NAME } from '../config/brand.js';
import { createWindow, getMainWindow } from './windowManager.js';
import { createTray, updateTrayMenu } from './tray.js';
import { initHotkeyEngine, destroyHotkeyEngine, handleAppKeyEvent } from './hotkeyEngine.js';
import {
  executeCommand, getAllCommands, addCommand, updateCommand, removeCommand,
} from './commandExecutor.js';
import {
  runWorkflow, getAllWorkflows, addWorkflow, updateWorkflow, removeWorkflow,
} from './workflowEngine.js';
import {
  createTerminal, writeToTerminal, resizeTerminal, destroyTerminal, destroyAllTerminals,
} from './terminalManager.js';
import {
  addClipboardItem, getClipboardHistory, clipboardStore,
  addNotification, getNotificationHistory,
  dismissNotification, pinNotification,
  addReminder, getReminders, removeReminder, snoozeReminder, updateReminder, parseNaturalTime,
} from './dataManager.js';
import pluginApi from '../core/pluginApi.js';
// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) { app.quit(); }

let tray = null;
let isQuitting = false;

const DATA_DIR = join(process.cwd(), 'data');
const CONFIG_DIR = join(DATA_DIR, 'config');
const SETTINGS_PATH = join(CONFIG_DIR, 'settings.json');
const SHORTCUTS_PATH = join(CONFIG_DIR, 'shortcuts.json');

function ensureDataDirs() {
  const dirs = [
    join(DATA_DIR, 'config', 'profiles'),
    join(DATA_DIR, 'commands'), join(DATA_DIR, 'workflows'),
    join(DATA_DIR, 'plugins'), join(DATA_DIR, 'db'), join(DATA_DIR, 'logs'),
  ];
  for (const dir of dirs) { try { mkdirSync(dir, { recursive: true }); } catch {} }
}

function loadSettings() {
  try { if (existsSync(SETTINGS_PATH)) return JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8')); } catch {}
  return { activeProfile: 'default', theme: 'dark', portableMode: true, startup: { launchOnLogin: false, launchMinimized: false, restorePreviousState: true, rememberWindowPositions: true }, profiles: ['default'] };
}
function saveSettings(settings) { try { writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8'); } catch {} }

function registerIpcHandlers() {
  // Settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, (_e, key) => { const s = loadSettings(); return key ? s[key] : s; });
  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, (_e, key, value) => { const s = loadSettings(); s[key] = value; saveSettings(s); return true; });
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET_ALL, () => loadSettings());

  // Commands
  ipcMain.handle(IPC_CHANNELS.COMMAND_GET_ALL, () => getAllCommands());
  ipcMain.handle(IPC_CHANNELS.COMMAND_EXECUTE, async (_e, id, ctx) => executeCommand(id, ctx || {}));
  ipcMain.handle(IPC_CHANNELS.COMMAND_ADD, async (_e, c) => addCommand(c));
  ipcMain.handle(IPC_CHANNELS.COMMAND_REMOVE, async (_e, id) => removeCommand(id));
  ipcMain.handle(IPC_CHANNELS.COMMAND_UPDATE, async (_e, id, u) => updateCommand(id, u));

  // Workflows
  ipcMain.handle(IPC_CHANNELS.WORKFLOWS_GET_ALL, () => getAllWorkflows());
  ipcMain.handle(IPC_CHANNELS.WORKFLOWS_RUN, async (_e, id) => runWorkflow(id));
  ipcMain.handle(IPC_CHANNELS.WORKFLOWS_ADD, async (_e, w) => addWorkflow(w));
  ipcMain.handle(IPC_CHANNELS.WORKFLOWS_REMOVE, async (_e, id) => removeWorkflow(id));
  ipcMain.handle(IPC_CHANNELS.WORKFLOWS_UPDATE, async (_e, id, u) => updateWorkflow(id, u));

  // Window
  ipcMain.on(IPC_CHANNELS.WINDOW_HIDE, () => { const w = getMainWindow(); if (w) w.hide(); });
  ipcMain.on(IPC_CHANNELS.WINDOW_SHOW, () => { const w = getMainWindow(); if (w) { w.show(); w.focus(); } });
  ipcMain.on(IPC_CHANNELS.WINDOW_TOGGLE, () => { const w = getMainWindow(); if (w) { w.isVisible() ? w.hide() : (w.show(), w.focus()); } });

  // Shell/Path/URL
  ipcMain.handle(IPC_CHANNELS.SHELL_EXEC, async (_e, cmd, needsConfirm) => {
    if (needsConfirm) {
      const { response } = await dialog.showMessageBox({ type: 'warning', title: 'Confirm', message: 'Run this?', detail: cmd, buttons: ['Cancel', 'Run'], defaultId: 0, cancelId: 0 });
      if (response !== 1) return { cancelled: true };
    }
    try { const { execSync } = await import('child_process'); return { success: true, output: execSync(cmd, { encoding: 'utf-8', timeout: 30000 }) }; } catch (err) { return { success: false, error: err.message }; }
  });
  ipcMain.handle(IPC_CHANNELS.PATH_OPEN, async (_e, p) => { const { shell } = await import('electron'); const r = await shell.openPath(p); return { success: !r, error: r || undefined }; });
  ipcMain.handle(IPC_CHANNELS.URL_OPEN, async (_e, url) => { const { shell } = await import('electron'); await shell.openExternal(url); return { success: true }; });
  ipcMain.on(IPC_CHANNELS.MODULE_OPEN, (_e, m) => { const w = getMainWindow(); if (w) { w.show(); w.focus(); w.webContents.send(IPC_EVENTS.MODULE_OPEN_REQUESTED, m); } });
  ipcMain.on(IPC_CHANNELS.HOTKEY_REGISTER, (_e, ke) => handleAppKeyEvent(ke));

  // --- Terminal ---
  ipcMain.handle(IPC_CHANNELS.TERMINAL_CREATE, (_e, options) => createTerminal(options.id, options));
  ipcMain.handle(IPC_CHANNELS.TERMINAL_WRITE, (_e, id, data) => { writeToTerminal(id, data); return true; });
  ipcMain.handle(IPC_CHANNELS.TERMINAL_RESIZE, (_e, id, cols, rows) => { resizeTerminal(id, cols, rows); return true; });
  ipcMain.handle(IPC_CHANNELS.TERMINAL_DESTROY, (_e, id) => { destroyTerminal(id); return true; });

  // --- Clipboard ---
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_GET_HISTORY, () => getClipboardHistory());
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_ADD, (_e, item) => { addClipboardItem(item.content, item.type); return true; });
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_DELETE, (_e, id) => clipboardStore.remove(id));
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_PIN, (_e, id) => { const item = clipboardStore.findById(id); if (item) clipboardStore.update(id, { pinned: !item.pinned }); return true; });
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_CLEAR, () => { clipboardStore.clear(); return true; });
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_PASTE, (_e, id) => { const item = clipboardStore.findById(id); return item ? { success: true, content: item.content } : { success: false }; });
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_EXPORT, () => clipboardStore.export());
  ipcMain.handle(IPC_CHANNELS.CLIPBOARD_IMPORT, (_e, data) => clipboardStore.import(data));

  // --- Notifications ---
  ipcMain.handle(IPC_CHANNELS.NOTIFICATIONS_GET_HISTORY, () => getNotificationHistory());
  ipcMain.handle(IPC_CHANNELS.NOTIFICATIONS_SHOW, (_e, n) => { addNotification(n.content, n.variant, n.appName); const w = getMainWindow(); if (w) w.webContents.send(IPC_EVENTS.NOTIFICATION_ARRIVED, n); return true; });
  ipcMain.handle(IPC_CHANNELS.NOTIFICATIONS_DISMISS, (_e, id) => dismissNotification(id));
  ipcMain.handle(IPC_CHANNELS.NOTIFICATIONS_PIN, (_e, id) => pinNotification(id));
  ipcMain.handle(IPC_CHANNELS.NOTIFICATIONS_MUTE_APP, (_e, appName) => { /* Future: store muted apps in settings */ return true; });
  ipcMain.handle(IPC_CHANNELS.NOTIFICATIONS_UNMUTE_APP, (_e, appName) => { return true; });

  // --- Plugins ---
  ipcMain.handle(IPC_CHANNELS.PLUGINS_GET_ALL, () => pluginApi.getAll());
  ipcMain.handle(IPC_CHANNELS.PLUGINS_ENABLE, async (_e, id) => pluginApi.enable(id));
  ipcMain.handle(IPC_CHANNELS.PLUGINS_DISABLE, async (_e, id) => pluginApi.disable(id));
  ipcMain.handle(IPC_CHANNELS.PLUGINS_INSTALL, async (_e, id, srcPath) => pluginApi.install(id, srcPath));
  ipcMain.handle(IPC_CHANNELS.PLUGINS_UNINSTALL, async (_e, id) => pluginApi.uninstall(id));

  // --- Reminders ---
  ipcMain.handle(IPC_CHANNELS.REMINDERS_GET_ALL, () => getReminders());
  ipcMain.handle(IPC_CHANNELS.REMINDERS_ADD, (_e, reminder) => {
    if (reminder.naturalLanguage) {
      const parsed = parseNaturalTime(reminder.naturalLanguage);
      addReminder({ ...reminder, time: parsed.time, recurring: parsed.recurring || reminder.recurring });
    } else {
      addReminder(reminder);
    }
    return true;
  });
  ipcMain.handle(IPC_CHANNELS.REMINDERS_REMOVE, (_e, id) => removeReminder(id));
  ipcMain.handle(IPC_CHANNELS.REMINDERS_UPDATE, (_e, reminder) => updateReminder(reminder.id, reminder));
  ipcMain.handle(IPC_CHANNELS.REMINDERS_SNOOZE, (_e, id, duration) => { snoozeReminder(id, duration); return true; });
}

// --- App Lifecycle ---
app.whenReady().then(async () => {
  logger.info('daemon', `Starting ${BRAND_NAME} daemon...`);
  ensureDataDirs();
  registerIpcHandlers();
  const settings = loadSettings();
  initHotkeyEngine(SHORTCUTS_PATH);
  await pluginApi.loadAll();
  const win = createWindow(settings);
  tray = createTray(win);
  if (!settings.startup?.launchMinimized) win.show();

  app.on('second-instance', () => { const w = getMainWindow(); if (w) { if (w.isMinimized()) w.restore(); w.show(); w.focus(); } });
  win.on('show', () => updateTrayMenu(tray, win, true));
  win.on('hide', () => updateTrayMenu(tray, win, false));
  logger.info('daemon', `${BRAND_NAME} daemon started successfully`);
});

app.on('window-all-closed', () => {});
app.on('before-quit', () => { isQuitting = true; destroyHotkeyEngine(); destroyAllTerminals(); pluginApi.destroyAll(); globalShortcut.unregisterAll(); });
app.on('will-quit', () => { logger.info('daemon', `${BRAND_NAME} shutting down`); });
