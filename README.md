# Vanta Suite

A keyboard-first productivity suite for Linux Mint Cinnamon. Built with Electron + Vue 3 — terminal, clipboard manager, reminders, notifications, custom commands, workflows, and a plugin system, all running as a persistent background daemon.

---

## Quick Start

```bash
# 1. Install system dependencies (one time)
sudo apt-get install -y build-essential python3 libgtk-3-dev libfuse2 wmctrl curl

# 2. Clone and run the installer
git clone https://github.com/johnnylaine/Vanta-Suite-Linux-Mint-Productivity-Helper.git
cd Vanta-Suite-Linux-Mint-Productivity-Helper
chmod +x install.sh
./install.sh
```

The installer:
- Installs npm dependencies and builds the app
- Creates a **desktop entry** — Vanta Suite appears in your app menu
- Sets up **autostart** — Vanta Suite launches minimized to tray on every login
- Creates a **terminal command** `vanta-suite` so you can launch from anywhere

**Vanta Suite will auto-start the next time you log in.** To start it now, run:

---

## How to Launch

| Method | Command / Action |
|--------|-----------------|
| **App menu** | Search "Vanta Suite" in your Linux Mint menu |
| **Terminal** | `vanta-suite` (normal) or `vanta-suite --background` (minimized to tray) |
| **File Manager** | Double-click `vanta-suite.sh` |
| **AppImage** | Double-click `release/Vanta Suite-1.0.0.AppImage` |
| **npm** | `npm start` |

---

## Background Daemon

Vanta Suite is designed to run **24/7** as a system tray daemon.

- **Close ≠ Quit** — Closing the window hides it to the tray. The daemon stays alive.
- **Autostart** — The installer configures `~/.config/autostart/` so Vanta Suite starts minimized when you log in.
- **Global hotkeys work anytime** — `Ctrl+Space`, `` Ctrl+` `` work even when the window is hidden.
- **To quit** — Right-click the tray icon → Quit.
- **To restart** — Run `vanta-suite --background`.

**Verifying it's running:**
- Look for the gold "V" icon in your system tray
- Press `Ctrl+Space` — if the Command Palette appears, the daemon is live
- Run `ps aux | grep electron` in a terminal

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Space` | Open Command Palette |
| `` Ctrl+` `` | Toggle Quake Terminal (dropdown) |
| `Ctrl+K S` | Keyboard shortcuts reference overlay |
| `Ctrl+Shift+?` | Interactive onboarding tour |
| `Escape` | Close any overlay / go back |

### Per-module shortcuts

| Module | Shortcuts |
|--------|----------|
| **Terminal** | `Ctrl+Shift+T` new tab, `Ctrl+Tab` next tab, `Ctrl+L` clear |
| **Clipboard** | `Ctrl+P` pin item, `Delete` remove, `Enter` paste, `Ctrl+F` search |

---

## Features

### Command Palette (`Ctrl+Space`)
Universal launcher — search and run shell commands, open apps, files, URLs, and more. 20+ built-in commands. Create your own custom commands in Settings.

### Terminal (`` Ctrl+` ``)
Quake-style dropdown terminal. Multiple tabs, full PTY support (bash/zsh/fish), Vanta Gold theme. Resizable by dragging.

### Clipboard Manager
Captures everything you copy. Search, pin, delete, and paste from history. Export/import your clipboard database.

### Reminders
Natural language input: `"in 30 minutes"`, `"tomorrow 9am"`, `"every monday 2pm"`, `"noon"`, `"midnight"`. Recurring reminders, snooze, and edit support.

### Notifications
History of all system notifications. Per-app mute. Focus Mode to block everything temporarily.

### Workflows
Multi-step automation. Shell commands, open files/URLs, switch workspaces, focus windows. Step-by-step runner with progress tracking.

### Custom Commands
Create your own palette commands in Settings. Supports variable prompting (`{value}`), shell execution, file/URL opening.

### Plugins
Sandboxed JavaScript plugins that register new commands, workflows, and event handlers. Marketplace UI with install/enable/disable/uninstall.

---

## Architecture

```
vanta-suite/
├── src/
│   ├── main/           # Electron main process
│   │   ├── daemon.js           # App lifecycle, IPC handlers
│   │   ├── hotkeyEngine.js     # Global shortcut management
│   │   ├── commandExecutor.js  # Command execution + destructive pattern detection
│   │   ├── workflowEngine.js   # Multi-step runner with cycle detection
│   │   ├── terminalManager.js  # node-pty shell spawning
│   │   ├── pluginManager.js    # Sandboxed VM plugin execution
│   │   ├── dataManager.js      # JSON-file persistence + natural language parser
│   │   ├── windowManager.js    # BrowserWindow + dev/built renderer loading
│   │   └── tray.js             # System tray icon + menu
│   ├── core/           # Shared modules
│   │   ├── ipcContracts.js     # All IPC channel + event definitions
│   │   ├── pluginApi.js        # Plugin API facade
│   │   └── logger.js           # Structured JSON logger
│   ├── preload/        # contextBridge preload (renderer sandbox)
│   ├── app/            # Vue 3 entry point (App.vue)
│   ├── modules/        # Lazy-loaded feature modules (9 modules)
│   └── design-system/  # V* component library (29 components) + Vanta Gold tokens
├── data/               # Portable user data
│   ├── config/         # Settings, hotkey profiles
│   ├── commands/       # Custom commands
│   ├── workflows/      # Workflow definitions
│   └── plugins/        # Installed plugins
└── release/            # Built AppImage
```

---

## Plugin Development

Plugins live in `data/plugins/<id>/`:

```json
// manifest.json
{
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Adds custom commands",
  "main": "index.js",
  "capabilities": ["commands"]
}
```

```js
// index.js — sandboxed VM context
vanta.commands.register({
  id: 'hello-world',
  trigger: 'hello',
  action: { type: 'run-shell', value: 'echo "Hello!"' }
});
```

**Sandbox API:** `vanta.console`, `vanta.commands`, `vanta.workflows`, `vanta.shell`, `vanta.settings`, `vanta.events`, `vanta.meta`.

---

## Building from Source

```bash
npm install                    # Install dependencies
npm run dev                    # Vite dev server (hot reload)
npm start                      # Launch Electron
npm run build:renderer         # Build Vue renderer only
npm run build                  # Build AppImage (outputs to release/)
```

---

## File Reference

| File | Purpose |
|------|---------|
| `install.sh` | One-command installer (deps + build + desktop entry + autostart) |
| `vanta-suite.sh` | Double-clickable launcher with `--background` flag |
| `USER_GUIDE.md` | Full 12-section user manual |
| `CONTRIBUTING.md` | Development setup and code style guide |
| `README.md` | This file |

---

## Troubleshooting

**App doesn't start:**
```bash
# Reinstall dependencies
rm -rf node_modules && npm install --legacy-peer-deps
# Rebuild renderer
npx vite build
# Try again
npm start
```

**"Electron failed to install":**
```bash
rm -rf node_modules/electron
npm install --legacy-peer-deps
```

**Global hotkeys not working:** Some desktop environments intercept certain key combos. Customize shortcuts in Settings → Shortcuts.

**AppImage won't launch:** Ensure `libfuse2` is installed: `sudo apt-get install -y libfuse2`

---

## License

MIT
