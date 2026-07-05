// Vanta Suite — IPC Contracts.
// All IPC channel names are defined here and used everywhere — never hardcode a channel string.
// This is the single source of truth for main ↔ renderer communication.

export const IPC_CHANNELS = {
  // Hotkey
  HOTKEY_REGISTER: 'hotkey:register',
  HOTKEY_UNREGISTER: 'hotkey:unregister',
  HOTKEY_PRESSED: 'hotkey:pressed',
  HOTKEY_CONFLICT_CHECK: 'hotkey:conflict-check',

  // Window
  WINDOW_SHOW: 'window:show',
  WINDOW_HIDE: 'window:hide',
  WINDOW_TOGGLE: 'window:toggle',
  WINDOW_FOCUS: 'window:focus',
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_GET_ALL: 'settings:get-all',
  SETTINGS_EXPORT: 'settings:export',
  SETTINGS_IMPORT: 'settings:import',
  SETTINGS_RESET: 'settings:reset',

  // Commands
  COMMAND_EXECUTE: 'command:execute',
  COMMAND_SEARCH: 'command:search',
  COMMAND_GET_ALL: 'command:get-all',
  COMMAND_ADD: 'command:add',
  COMMAND_REMOVE: 'command:remove',
  COMMAND_UPDATE: 'command:update',
  COMMAND_HISTORY_ADD: 'command:history:add',
  COMMAND_HISTORY_GET: 'command:history:get',

  // Favorites
  FAVORITES_GET_GROUPS: 'favorites:get-groups',
  FAVORITES_ADD_GROUP: 'favorites:add-group',
  FAVORITES_REMOVE_GROUP: 'favorites:remove-group',
  FAVORITES_UPDATE_GROUP: 'favorites:update-group',
  FAVORITES_LAUNCH_APP: 'favorites:launch-app',
  FAVORITES_GET_RECENT: 'favorites:get-recent',
  FAVORITES_OPEN_GROUP: 'favorites:open-group',

  // Terminal
  TERMINAL_CREATE: 'terminal:create',
  TERMINAL_DESTROY: 'terminal:destroy',
  TERMINAL_RESIZE: 'terminal:resize',
  TERMINAL_WRITE: 'terminal:write',
  TERMINAL_DATA: 'terminal:data',
  TERMINAL_EXIT: 'terminal:exit',

  // AI Assistant
  AI_CHAT: 'ai:chat',
  AI_CHAT_STREAM: 'ai:chat:stream',
  AI_TOOLS_LIST: 'ai:tools:list',
  AI_MODELS_LIST: 'ai:models:list',
  AI_CANCEL: 'ai:cancel',

  // Clipboard
  CLIPBOARD_GET_HISTORY: 'clipboard:get-history',
  CLIPBOARD_ADD: 'clipboard:add',
  CLIPBOARD_DELETE: 'clipboard:delete',
  CLIPBOARD_PIN: 'clipboard:pin',
  CLIPBOARD_CLEAR: 'clipboard:clear',
  CLIPBOARD_PASTE: 'clipboard:paste',
  CLIPBOARD_EXPORT: 'clipboard:export',
  CLIPBOARD_IMPORT: 'clipboard:import',

  // Reminders
  REMINDERS_GET_ALL: 'reminders:get-all',
  REMINDERS_ADD: 'reminders:add',
  REMINDERS_REMOVE: 'reminders:remove',
  REMINDERS_UPDATE: 'reminders:update',
  REMINDERS_SNOOZE: 'reminders:snooze',
  REMINDERS_FIRE: 'reminders:fire',

  // Notifications
  NOTIFICATIONS_GET_HISTORY: 'notifications:get-history',
  NOTIFICATIONS_SHOW: 'notifications:show',
  NOTIFICATIONS_DISMISS: 'notifications:dismiss',
  NOTIFICATIONS_PIN: 'notifications:pin',
  NOTIFICATIONS_MUTE_APP: 'notifications:mute-app',
  NOTIFICATIONS_UNMUTE_APP: 'notifications:unmute-app',

  // Workflows
  WORKFLOWS_GET_ALL: 'workflows:get-all',
  WORKFLOWS_RUN: 'workflows:run',
  WORKFLOWS_ADD: 'workflows:add',
  WORKFLOWS_REMOVE: 'workflows:remove',
  WORKFLOWS_UPDATE: 'workflows:update',

  // Plugins
  PLUGINS_GET_ALL: 'plugins:get-all',
  PLUGINS_LOAD: 'plugins:load',
  PLUGINS_UNLOAD: 'plugins:unload',
  PLUGINS_ENABLE: 'plugins:enable',
  PLUGINS_DISABLE: 'plugins:disable',
  PLUGINS_INSTALL: 'plugins:install',
  PLUGINS_UNINSTALL: 'plugins:uninstall',

  // Hotkey Profiles
  HOTKEY_PROFILE_GET: 'hotkey-profile:get',
  HOTKEY_PROFILE_SET: 'hotkey-profile:set',
  HOTKEY_PROFILE_LIST: 'hotkey-profile:list',
  HOTKEY_PROFILE_EXPORT: 'hotkey-profile:export',
  HOTKEY_PROFILE_IMPORT: 'hotkey-profile:import',

  // Module
  MODULE_OPEN: 'module:open',

  // System
  SHELL_EXEC: 'shell:exec',
  PATH_OPEN: 'path:open',
  URL_OPEN: 'url:open',
};

// IPC event names emitted from main to renderer
export const IPC_EVENTS = {
  HOTKEY_PRESSED: 'hotkey:pressed',
  COMMAND_EXECUTE_REQUESTED: 'command:execute-requested',
  MODULE_OPEN_REQUESTED: 'module:open-requested',
  NOTIFICATION_ARRIVED: 'notification:arrived',
  REMINDER_FIRED: 'reminder:fired',
  CLIPBOARD_CHANGED: 'clipboard:changed',
  TERMINAL_DATA: 'terminal:data',
  TERMINAL_EXIT: 'terminal:exit',
  AI_STREAM_CHUNK: 'ai:stream:chunk',
  AI_STREAM_DONE: 'ai:stream:done',
  AI_STREAM_ERROR: 'ai:stream:error',
  WORKFLOW_STEP_STARTED: 'workflow:step:started',
  WORKFLOW_STEP_COMPLETED: 'workflow:step:completed',
  WORKFLOW_STEP_ERROR: 'workflow:step:error',
  WORKFLOW_COMPLETED: 'workflow:completed',
};
