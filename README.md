# Vanta Suite

A keyboard-first productivity suite for Linux Mint Cinnamon. Built with Electron + Vue 3, Vanta Suite gives you a unified interface for all your productivity tools — terminal, clipboard manager, reminders, notifications, custom commands, workflows, and a plugin system.

## Features

### Core
- **Command Palette** (`Ctrl+Space`) — Search and execute commands, launch apps, run shell scripts
- **Custom Commands** — Create your own commands with variables, shell execution, file/URL opening
- **Workflows** — Chain multiple steps into automated sequences
- **Plugin System** — Extend Vanta Suite with sandboxed JavaScript plugins

### Modules
- **Terminal** (`Ctrl+``) — Quake-style dropdown terminal with multiple tabs and Vanta Gold theme
- **Clipboard Manager** — Persistent clipboard history with search, pin, and keyboard navigation
- **Reminders** — Natural language reminders with recurrence support ("every Monday 9am")
- **Notifications** — Notification history with per-app mute and focus mode
- **Favorites** — Quick-launch groups for apps, files, and folders
- **AI Assistant** — Built-in AI chat with streaming support

### Global Hotkeys
All hotkeys are customizable in Settings.

| Shortcut | Action |
|----------|--------|
| `Ctrl+Space` | Open Command Palette |
| `` Ctrl+` `` | Toggle Quake Terminal |
| `Ctrl+K S` | Keyboard Shortcuts Reference |
| `Ctrl+Shift+?` | Onboarding Tour |

## Installation

### Prerequisites
- **Linux Mint Cinnamon** (or any Debian-based Linux with Cinnamon)
- **Node.js 18+** 
- **build-essential, python3** (for native module compilation)

### Quick Install

```bash
# 1. Install system dependencies
sudo apt-get install -y build-essential python3 libgtk-3-dev wmctrl curl

# 2. Clone and install
git clone <repo-url>
cd Vanta-Suite-Linux-Mint-Productivity-Helper
chmod +x install.sh
./install.sh
```

### Run

```bash
# Development (with hot-reload)
npm run dev

# Production
npm start

# Build distributable (AppImage + .deb)
npm run build
```

## Architecture

```
vanta-suite/
├── src/
│   ├── main/           # Electron main process
│   │   ├── daemon.js           # App lifecycle, IPC handlers
│   │   ├── hotkeyEngine.js     # Global shortcut management
│   │   ├── commandExecutor.js  # Command execution engine
│   │   ├── workflowEngine.js   # Multi-step workflow runner
│   │   ├── terminalManager.js  # node-pty terminal spawning
│   │   ├── pluginManager.js    # Sandboxed plugin execution
│   │   ├── dataManager.js      # JSON-file backed persistence
│   │   ├── windowManager.js    # BrowserWindow management
│   │   └── tray.js             # System tray icon
│   ├── core/           # Shared core modules
│   │   ├── ipcContracts.js     # All IPC channel definitions
│   │   ├── pluginApi.js        # Plugin API facade
│   │   └── logger.js           # Structured JSON logger
│   ├── preload/        # contextBridge preload script
│   ├── app/            # Vue 3 renderer entry point
│   ├── modules/        # Lazy-loaded feature modules
│   │   ├── terminal/
│   │   ├── clipboard/
│   │   ├── reminders/
│   │   ├── notifications/
│   │   ├── workflows/
│   │   ├── plugins/
│   │   ├── settings/
│   │   ├── favorites/
│   │   └── ai-assistant/
│   └── design-system/  # V* component library + design tokens
│       ├── tokens.css          # Vanta Gold design tokens
│       └── components/         # 30+ reusable components
├── data/               # User data (portable)
│   ├── config/         # Settings, hotkey profiles
│   ├── commands/       # Custom commands
│   ├── workflows/      # Workflow definitions
│   └── plugins/        # Installed plugins
└── docs/               # Documentation
```

## Plugin Development

Plugins are self-contained folders in `data/plugins/<id>/`:

```
data/plugins/my-plugin/
├── manifest.json    # Plugin metadata
└── index.js         # Sandboxed plugin code
```

### manifest.json

```json
{
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Adds custom commands",
  "author": "You",
  "main": "index.js",
  "capabilities": ["commands"]
}
```

### index.js (Sandbox API)

```js
// Register a command
vanta.commands.register({
  id: 'hello-world',
  trigger: 'hello',
  aliases: ['hi'],
  category: 'Custom',
  icon: '👋',
  action: { type: 'run-shell', value: 'echo "Hello from plugin!"' }
});

// Listen for lifecycle events
vanta.events.on('command:executed', (data) => {
  vanta.console.log('Command executed:', data.id);
});
```

The sandbox provides: `vanta.console`, `vanta.commands`, `vanta.workflows`, `vanta.shell`, `vanta.settings`, `vanta.events`, `vanta.meta`.

## Keyboard Shortcuts

Press `Ctrl+K S` anytime to see all keyboard shortcuts, or `Ctrl+Shift+?` for the interactive onboarding tour.

## License

MIT
