# Vanta Suite — Configuration Reference

All user data lives under `data/` by default (portable mode).

## Files

| File | Purpose | Format |
|---|---|---|
| `data/config/settings.json` | App settings | JSON |
| `data/config/shortcuts.json` | Hotkey bindings | JSON |
| `data/config/brand.json` | App branding | JSON |
| `data/config/profiles/<name>.json` | Hotkey profiles | JSON |
| `data/commands/commands.json` | Custom commands | JSON |
| `data/workflows/workflows.json` | Automation workflows | JSON |
| `data/db/clipboard.db` | Clipboard history | SQLite |
| `data/db/notifications.db` | Notification history | SQLite |
| `data/db/reminders.db` | Reminders | SQLite |

## settings.json Fields

```json
{
  "activeProfile": "default",       // Currently active shortcut profile
  "theme": "dark",                  // "dark" | "light"
  "portableMode": true,             // Store all data in app folder
  "startup": {
    "launchOnLogin": false,         // Auto-start on login
    "launchMinimized": false,       // Start minimized to tray
    "restorePreviousState": true,   // Restore last session
    "rememberWindowPositions": true // Save window size/position
  },
  "favoriteGroups": [...],          // App groups
  "recentApps": [...],              // Recently launched apps
  "ai": {
    "ollamaHost": "http://localhost:11434",
    "model": "",
    "allowNetworkTools": false,
    "shareDataExternally": false
  },
  "notifications": {
    "autoDismissMinutes": 120,
    "focusModeEnabled": false,
    "mutedApps": []
  },
  "clipboard": { "maxItems": 500 },
  "terminal": {
    "shell": "auto",
    "fontFamily": "JetBrains Mono",
    "fontSize": 14,
    "quakeModeHotkeyAction": "toggle-quake-terminal"
  },
  "profiles": ["default"]
}
```

## shortcuts.json Fields

Simple key-value map: `{ "accelerator": "actionId" }`

## export/import

Use Settings → Data → Export/Import to backup or transfer all settings. JSON format, human-editable and git-friendly.
