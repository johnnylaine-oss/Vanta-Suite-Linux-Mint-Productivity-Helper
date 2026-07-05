# Vanta Suite — User Guide

A keyboard-first productivity suite for Linux Mint Cinnamon. Think of it as Spotlight/Alfred meets a terminal, clipboard manager, reminder system, and automation engine — all in one tray-resident daemon.

---

## Table of Contents

1. [How It Works (The Daemon)](#1-how-it-works-the-daemon)
2. [Keyboard Shortcuts](#2-keyboard-shortcuts)
3. [Command Palette](#3-command-palette)
4. [Terminal](#4-terminal)
5. [Clipboard Manager](#5-clipboard-manager)
6. [Reminders](#6-reminders)
7. [Notifications](#7-notifications)
8. [Workflows](#8-workflows)
9. [Custom Commands](#9-custom-commands)
10. [Plugins](#10-plugins)
11. [Settings](#11-settings)
12. [Keeping It Running 24/7](#12-keeping-it-running-247)

---

## 1. How It Works (The Daemon)

Vanta Suite runs as a **daemon** — a background process that starts when you log in and stays running in your system tray. The main window can be opened or closed freely; the daemon keeps going.

**Key behaviors:**
- **Close ≠ Quit** — Clicking the close button hides the window to tray. The daemon stays alive.
- **Global hotkeys work anytime** — `Ctrl+Space` for Command Palette, `` Ctrl+` `` for Quake Terminal, etc.
- **Tray icon** — Right-click for Show/Hide, Settings, and Quit.
- **Single instance** — You can't accidentally open two copies. If you try, it just shows the existing window.

**To truly quit:** Right-click the tray icon → Quit.

---

## 2. Keyboard Shortcuts

### Global (work anywhere)

| Shortcut | Action |
|----------|--------|
| `Ctrl+Space` | Open Command Palette |
| `` Ctrl+` `` | Toggle Quake Terminal (dropdown) |
| `Ctrl+K S` | Keyboard shortcuts reference overlay |
| `Ctrl+Shift+?` | Interactive onboarding tour |

### Navigation

Navigate via the sidebar icons on the left — click any icon to jump to that module.

| Shortcut | Action |
|----------|--------|
| `Escape` | Close overlay / cancel / go back |
| `Ctrl+F` | Search within current view |
| `Ctrl+P` | Pin selected item (clipboard, notification) |
| `Delete` | Remove selected item |

> **Tip:** Press `Ctrl+K S` anytime to see all shortcuts with search.

---

## 3. Command Palette

The Command Palette is your universal launcher. Press `Ctrl+Space` anywhere to open it.

**What you can do:**
- **Type to search** — Fuzzy search across all commands and modules
- **Built-in commands** — Calculator, timer, volume control, brightness, WiFi, Bluetooth, lock screen, shutdown, reboot
- **Launch apps** — Chrome, Firefox, Files, Terminal, Settings
- **Open folders** — Downloads, Documents, Home
- **Open modules** — Jump directly to any Vanta module

**Examples:**
- Type `calc` → Opens Calculator
- Type `timer 5 min` → Creates a 5-minute timer (prompts for variable)
- Type `chrome` → Launches Chrome
- Type `lock` → Locks screen
- Type `focus mode` → Toggles Do Not Disturb

**Custom commands** (see §9) appear here too. Type any trigger word to execute your own shell commands, open paths, or URLs.

---

## 4. Terminal

A full-featured terminal emulator with Quake-style dropdown mode.

**Quake Mode** — Press `` Ctrl+` `` to drop down a terminal from the top of the screen. Press again to hide.

**Features:**
- **Multiple tabs** — `Ctrl+Shift+T` new tab, `Ctrl+Tab` next tab, `Ctrl+Shift+W` close tab
- **Full PTY support** — Real shell sessions (bash, zsh, fish), not a web terminal
- **Vanta Gold theme** — Dark background with gold cursor and accents
- **Resize** — Drag the terminal edge to resize
- **Your shell, your config** — Uses your `$SHELL` and runs your `.bashrc`/`.zshrc`

---

## 5. Clipboard Manager

Vanta Suite monitors your clipboard and keeps a searchable history.

**Features:**
- **Automatic capture** — Every copy (text/HTML/image) is saved
- **Search** — `Ctrl+F` to filter your history
- **Pin** — `Ctrl+P` to keep important clips from being pushed out
- **Keyboard navigation** — Arrow keys + Enter to select and paste
- **Export/Import** — Backup and restore your clipboard history
- **Clear** — Wipe all history

**How to paste from history:** Open Clipboard module → select an entry → press `Enter` (or click paste).

---

## 6. Reminders

Never forget anything. Set reminders with natural language.

**Natural language examples:**
| You type | Parsed as |
|----------|-----------|
| `in 30 minutes` | 30 minutes from now |
| `tomorrow 9am` | Tomorrow at 9:00 AM |
| `every monday 2pm` | Recurring every Monday at 2 PM |
| `noon` | Today at 12:00 PM |
| `midnight` | Tonight at 12:00 AM |
| `in 2 hours` | 2 hours from now |
| `next friday 3pm` | Next Friday at 3 PM |

**Features:**
- **Recurring reminders** — "every weekday", "every monday", "every month"
- **Snooze** — Remind again in 5/15/30/60 minutes
- **Mark done** — Dismiss after completing
- **Edit/Delete** — Update or remove existing reminders

> Reminders trigger a system notification when due, even if Vanta Suite is minimized.

---

## 7. Notifications

A history of all system notifications, with focus mode.

**Features:**
- **History** — Every notification is logged with timestamp and source app
- **Per-app mute** — Mute noisy apps while keeping important ones
- **Focus Mode** — Block all notifications temporarily (toggle via Command Palette: `focus mode`)
- **Pin** — Keep important notifications visible
- **Dismiss** — Clear individual or all notifications

---

## 8. Workflows

Automate multi-step sequences. A workflow is a list of steps executed in order.

**Step types:**
- **Run shell** — Execute a bash command
- **Open path** — Open a file or folder
- **Open URL** — Open a website
- **Switch workspace** — Move to a different Cinnamon workspace
- **Focus window** — Bring a specific window to front

**Features:**
- **Step-by-step runner** — See progress as each step completes
- **Cycle detection** — Prevents infinite loops (workflow A → workflow B → workflow A)
- **Run on demand** — Launch any workflow from the Command Palette
- **Create & Edit** — Build workflows through the UI

**Example: "Start Work Day"**
1. `run-shell`: `firefox` — Open browser
2. `run-shell`: `code` — Open VS Code
3. `switch-workspace`: `2` — Move to workspace 2
4. `open-path`: `~/Documents/Notes/today.md` — Open daily notes

---

## 9. Custom Commands

Create your own commands that appear in the Command Palette. Go to **Settings → Custom Commands**.

**Each command has:**
- **Trigger** — The word you type to find it (e.g., `hello`)
- **Aliases** — Alternative trigger words (e.g., `hi`, `greet`)
- **Action type** — What happens when executed:
  - `run-shell` — Run a shell command
  - `open-path` — Open a file or folder
  - `open-url` — Open a URL in browser
  - `open-module` — Jump to a Vanta module
  - `create-timer` — Start a timer
- **Variables** — Commands can prompt for input (e.g., `{value}` is replaced at runtime)
- **Requires confirmation** — For dangerous commands (toggle on for destructive operations)

**Example custom commands:**
- **"screenshot"** → `gnome-screenshot -i` (opens screenshot tool)
- **"update"** → `sudo apt update && sudo apt upgrade -y` (requires confirmation)
- **"notes"** → `open-path: ~/Documents/Notes/` (opens Notes folder)
- **"pr"** → `open-url: https://github.com/pulls` (opens GitHub PRs)

---

## 10. Plugins

Extend Vanta Suite with JavaScript plugins. Go to the **Plugins** module.

**Plugin capabilities:**
- Register new commands for the Command Palette
- Create custom workflows
- Run shell commands (sandboxed, confirmation required for destructive patterns)
- Listen for events
- Store plugin-specific settings

**Installation:**
1. Open Plugins module
2. Browse the marketplace or click "Install from Disk"
3. Enable/disable plugins with the toggle

**Development:** See the Plugin API documentation in the Plugins module, or check `README.md#plugin-development`.

---

## 11. Settings

Access via the sidebar gear icon or `Ctrl+8`.

**Sections:**
- **General** — Theme (dark/light), active hotkey profile
- **Shortcuts** — Customize all global hotkeys
- **Custom Commands** — Create and edit your commands (see §9)
- **Startup** — Launch on login, launch minimized

**Configuration files** (portable, stored in `data/`):
- `data/config/settings.json` — All settings
- `data/config/shortcuts.json` — Hotkey bindings (per-profile)
- `data/commands/commands.json` — Custom commands
- `data/workflows/workflows.json` — Workflow definitions

---

## 12. Keeping It Running 24/7

Vanta Suite is designed to run as a persistent background daemon. Here's how to ensure it's always running:

### Automatic (recommended)

Run the installer to set up autostart:

```bash
./install.sh
```

This creates:
- **`~/.local/share/applications/vanta-suite.desktop`** — Appears in your app menu
- **`~/.config/autostart/vanta-suite-autostart.desktop`** — Launches Vanta Suite minimized on login
- **`~/.local/bin/vanta-suite`** — Terminal command

After install, Vanta Suite will:
- Start automatically when you log in
- Launch minimized to the system tray (no window popping up)
- Register all global hotkeys (`Ctrl+Space`, `` Ctrl+` ``)
- Stay running even when you close the window

### Manual autostart

If you prefer to set it up manually, add Vanta Suite to Cinnamon's Startup Applications:

1. Open **System Settings → Startup Applications**
2. Click **+** → **Custom command**
3. Name: `Vanta Suite`
4. Command: `/path/to/vanta-suite.sh --background`
5. Delay: `2` seconds (lets the desktop settle first)
6. Click **Save**

### Running in background mode manually

```bash
# Start minimized to tray (background mode)
./vanta-suite.sh --background

# Or from anywhere after install
vanta-suite --background
```

### Verifying it's running

- Look for the **Vanta tray icon** (gold "V") in your system tray
- Press `Ctrl+Space` — if the Command Palette opens, the daemon is running
- Run `ps aux | grep vanta` in a terminal

### Restarting if it crashes

```bash
vanta-suite --background
```

Or from the app menu, launch "Vanta Suite" — if already running, it just shows the window.

### To stop the daemon

Right-click the tray icon → **Quit**, or:
```bash
pkill -f "electron.*vanta"
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────┐
│              VANTA SUITE v1.0                │
│─────────────────────────────────────────────│
│  Ctrl+Space    Command Palette               │
│  Ctrl+`        Quake Terminal                │
│  Ctrl+K S      Keyboard Shortcuts            │
│  Ctrl+Shift+?  Onboarding Tour               │
│─────────────────────────────────────────────│
│  Ctrl+1        Favorites                     │
│  Ctrl+2        Terminal                      │
│  Ctrl+3        AI Assistant                  │
│  Ctrl+4        Clipboard                     │
│  Ctrl+5        Reminders                     │
│  Ctrl+6        Notifications                 │
│  Ctrl+7        Workflows                     │
│  Ctrl+8        Settings                      │
│─────────────────────────────────────────────│
│  Close window  → hides to tray (daemon runs) │
│  Tray → Quit  → fully exits                  │
│─────────────────────────────────────────────│
│  Autostart: runs minimized on login          │
│  Global hotkeys work anytime                 │
└─────────────────────────────────────────────┘
```
