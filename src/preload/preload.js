// Vanta Suite — Preload Script.
// Exposes a strict, typed API surface to the renderer via contextBridge.
// The renderer has ZERO direct access to Node.js or Electron APIs —
// everything goes through the channels defined here.

import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, IPC_EVENTS } from '../core/ipcContracts.js';

const api = {
  // --- Settings ---
  settings: {
    get: (key) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET, key),
    set: (key, value) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, key, value),
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_ALL),
    export: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_EXPORT),
    import: (data) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_IMPORT, data),
    reset: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_RESET),
  },

  // --- Commands ---
  commands: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.COMMAND_GET_ALL),
    execute: (commandId, context) => ipcRenderer.invoke(IPC_CHANNELS.COMMAND_EXECUTE, commandId, context),
    add: (command) => ipcRenderer.invoke(IPC_CHANNELS.COMMAND_ADD, command),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.COMMAND_REMOVE, id),
    update: (command) => ipcRenderer.invoke(IPC_CHANNELS.COMMAND_UPDATE, command),
    getHistory: () => ipcRenderer.invoke(IPC_CHANNELS.COMMAND_HISTORY_GET),
    addHistory: (entry) => ipcRenderer.invoke(IPC_CHANNELS.COMMAND_HISTORY_ADD, entry),
  },

  // --- Favorites ---
  favorites: {
    getGroups: () => ipcRenderer.invoke(IPC_CHANNELS.FAVORITES_GET_GROUPS),
    addGroup: (group) => ipcRenderer.invoke(IPC_CHANNELS.FAVORITES_ADD_GROUP, group),
    removeGroup: (id) => ipcRenderer.invoke(IPC_CHANNELS.FAVORITES_REMOVE_GROUP, id),
    updateGroup: (group) => ipcRenderer.invoke(IPC_CHANNELS.FAVORITES_UPDATE_GROUP, group),
    launchApp: (app) => ipcRenderer.invoke(IPC_CHANNELS.FAVORITES_LAUNCH_APP, app),
    getRecent: () => ipcRenderer.invoke(IPC_CHANNELS.FAVORITES_GET_RECENT),
    openGroup: (groupId) => ipcRenderer.invoke(IPC_CHANNELS.FAVORITES_OPEN_GROUP, groupId),
  },

  // --- Terminal ---
  terminal: {
    create: (options) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_CREATE, options),
    destroy: (id) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_DESTROY, id),
    resize: (id, cols, rows) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_RESIZE, id, cols, rows),
    write: (id, data) => ipcRenderer.invoke(IPC_CHANNELS.TERMINAL_WRITE, id, data),
    onData: (callback) => {
      const handler = (_event, id, data) => callback(id, data);
      ipcRenderer.on(IPC_EVENTS.TERMINAL_DATA, handler);
      return () => ipcRenderer.removeListener(IPC_EVENTS.TERMINAL_DATA, handler);
    },
    onExit: (callback) => {
      const handler = (_event, id, code) => callback(id, code);
      ipcRenderer.on(IPC_EVENTS.TERMINAL_EXIT, handler);
      return () => ipcRenderer.removeListener(IPC_EVENTS.TERMINAL_EXIT, handler);
    },
  },

  // --- AI Assistant ---
  ai: {
    chat: (message, context) => ipcRenderer.invoke(IPC_CHANNELS.AI_CHAT, message, context),
    chatStream: (message, context) => ipcRenderer.invoke(IPC_CHANNELS.AI_CHAT_STREAM, message, context),
    getTools: () => ipcRenderer.invoke(IPC_CHANNELS.AI_TOOLS_LIST),
    getModels: () => ipcRenderer.invoke(IPC_CHANNELS.AI_MODELS_LIST),
    cancel: () => ipcRenderer.invoke(IPC_CHANNELS.AI_CANCEL),
    onStreamChunk: (callback) => {
      const handler = (_event, chunk) => callback(chunk);
      ipcRenderer.on(IPC_EVENTS.AI_STREAM_CHUNK, handler);
      return () => ipcRenderer.removeListener(IPC_EVENTS.AI_STREAM_CHUNK, handler);
    },
    onStreamDone: (callback) => {
      const handler = (_event) => callback();
      ipcRenderer.on(IPC_EVENTS.AI_STREAM_DONE, handler);
      return () => ipcRenderer.removeListener(IPC_EVENTS.AI_STREAM_DONE, handler);
    },
    onStreamError: (callback) => {
      const handler = (_event, error) => callback(error);
      ipcRenderer.on(IPC_EVENTS.AI_STREAM_ERROR, handler);
      return () => ipcRenderer.removeListener(IPC_EVENTS.AI_STREAM_ERROR, handler);
    },
  },

  // --- Clipboard ---
  clipboard: {
    getHistory: () => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_GET_HISTORY),
    add: (item) => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_ADD, item),
    delete: (id) => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_DELETE, id),
    pin: (id) => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_PIN, id),
    clear: () => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_CLEAR),
    paste: (id) => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_PASTE, id),
    export: () => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_EXPORT),
    import: (data) => ipcRenderer.invoke(IPC_CHANNELS.CLIPBOARD_IMPORT, data),
    onChange: (callback) => {
      const handler = (_event) => callback();
      ipcRenderer.on(IPC_EVENTS.CLIPBOARD_CHANGED, handler);
      return () => ipcRenderer.removeListener(IPC_EVENTS.CLIPBOARD_CHANGED, handler);
    },
  },

  // --- Reminders ---
  reminders: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.REMINDERS_GET_ALL),
    add: (reminder) => ipcRenderer.invoke(IPC_CHANNELS.REMINDERS_ADD, reminder),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.REMINDERS_REMOVE, id),
    update: (reminder) => ipcRenderer.invoke(IPC_CHANNELS.REMINDERS_UPDATE, reminder),
    snooze: (id, duration) => ipcRenderer.invoke(IPC_CHANNELS.REMINDERS_SNOOZE, id, duration),
    onFire: (callback) => {
      const handler = (_event, reminder) => callback(reminder);
      ipcRenderer.on(IPC_EVENTS.REMINDER_FIRED, handler);
      return () => ipcRenderer.removeListener(IPC_EVENTS.REMINDER_FIRED, handler);
    },
  },

  // --- Notifications ---
  notifications: {
    getHistory: () => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS_GET_HISTORY),
    show: (notification) => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS_SHOW, notification),
    dismiss: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS_DISMISS, id),
    pin: (id) => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS_PIN, id),
    muteApp: (appName) => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS_MUTE_APP, appName),
    unmuteApp: (appName) => ipcRenderer.invoke(IPC_CHANNELS.NOTIFICATIONS_UNMUTE_APP, appName),
    onArrived: (callback) => {
      const handler = (_event, notification) => callback(notification);
      ipcRenderer.on(IPC_EVENTS.NOTIFICATION_ARRIVED, handler);
      return () => ipcRenderer.removeListener(IPC_EVENTS.NOTIFICATION_ARRIVED, handler);
    },
  },

  // --- Workflows ---
  workflows: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.WORKFLOWS_GET_ALL),
    run: (id) => ipcRenderer.invoke(IPC_CHANNELS.WORKFLOWS_RUN, id),
    add: (workflow) => ipcRenderer.invoke(IPC_CHANNELS.WORKFLOWS_ADD, workflow),
    remove: (id) => ipcRenderer.invoke(IPC_CHANNELS.WORKFLOWS_REMOVE, id),
    update: (workflow) => ipcRenderer.invoke(IPC_CHANNELS.WORKFLOWS_UPDATE, workflow),
    onStepStarted: (callback) => {
      const handler = (_event, data) => callback(data);
      ipcRenderer.on(IPC_EVENTS.WORKFLOW_STEP_STARTED, handler);
      return () => ipcRenderer.removeListener(IPC_EVENTS.WORKFLOW_STEP_STARTED, handler);
    },
    onStepCompleted: (callback) => {
      const handler = (_event, data) => callback(data);
      ipcRenderer.on(IPC_EVENTS.WORKFLOW_STEP_COMPLETED, handler);
      return () => ipcRenderer.removeListener(IPC_EVENTS.WORKFLOW_STEP_COMPLETED, handler);
    },
    onCompleted: (callback) => {
      const handler = (_event, data) => callback(data);
      ipcRenderer.on(IPC_EVENTS.WORKFLOW_COMPLETED, handler);
      return () => ipcRenderer.removeListener(IPC_EVENTS.WORKFLOW_COMPLETED, handler);
    },
  },

  // --- Plugins ---
  plugins: {
    getAll: () => ipcRenderer.invoke(IPC_CHANNELS.PLUGINS_GET_ALL),
    load: (pluginId) => ipcRenderer.invoke(IPC_CHANNELS.PLUGINS_LOAD, pluginId),
    unload: (pluginId) => ipcRenderer.invoke(IPC_CHANNELS.PLUGINS_UNLOAD, pluginId),
    enable: (pluginId) => ipcRenderer.invoke(IPC_CHANNELS.PLUGINS_ENABLE, pluginId),
    disable: (pluginId) => ipcRenderer.invoke(IPC_CHANNELS.PLUGINS_DISABLE, pluginId),
    install: (pluginId, sourcePath) => ipcRenderer.invoke(IPC_CHANNELS.PLUGINS_INSTALL, pluginId, sourcePath),
    uninstall: (pluginId) => ipcRenderer.invoke(IPC_CHANNELS.PLUGINS_UNINSTALL, pluginId),
  },

  // --- Hotkey Profiles ---
  hotkeyProfiles: {
    get: (name) => ipcRenderer.invoke(IPC_CHANNELS.HOTKEY_PROFILE_GET, name),
    set: (name) => ipcRenderer.invoke(IPC_CHANNELS.HOTKEY_PROFILE_SET, name),
    list: () => ipcRenderer.invoke(IPC_CHANNELS.HOTKEY_PROFILE_LIST),
    export: (name) => ipcRenderer.invoke(IPC_CHANNELS.HOTKEY_PROFILE_EXPORT, name),
    import: (data) => ipcRenderer.invoke(IPC_CHANNELS.HOTKEY_PROFILE_IMPORT, data),
  },

  // --- Window ---
  window: {
    hide: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_HIDE),
    show: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_SHOW),
    toggle: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_TOGGLE),
    minimize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.send(IPC_CHANNELS.WINDOW_MAXIMIZE),
    sendHotkey: (accel) => ipcRenderer.send(IPC_CHANNELS.HOTKEY_REGISTER, accel),
  },

  // --- Tray ---
  tray: {
    setIcon: (dataUrl) => ipcRenderer.invoke(IPC_CHANNELS.TRAY_SET_ICON, dataUrl),
    getIcon: () => ipcRenderer.invoke(IPC_CHANNELS.TRAY_GET_ICON),
    ready: () => ipcRenderer.invoke(IPC_CHANNELS.TRAY_READY),
  },

  // --- Shell ---
  shell: {
    exec: (command, requiresConfirmation) =>
      ipcRenderer.invoke(IPC_CHANNELS.SHELL_EXEC, command, requiresConfirmation),
  },

  // --- Events ---
  on: (channel, callback) => {
    const validChannels = Object.values(IPC_EVENTS);
    if (validChannels.includes(channel)) {
      const subscription = (_event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    console.warn(`[Preload] Ignored event subscription to unknown channel: ${channel}`);
    return () => {};
  },
};

contextBridge.exposeInMainWorld('vanta', api);
