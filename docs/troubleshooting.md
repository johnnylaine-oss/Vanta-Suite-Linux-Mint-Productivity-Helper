# Vanta Suite — Troubleshooting

## App Won't Start

**Symptom:** `./start.sh` fails or the app window doesn't appear.

**Fixes:**
1. Check Node.js version: `node --version` — must be 18+
2. Re-run install: `./install.sh`
3. Check log: `cat data/logs/vanta-suite.log`
4. Verify no port conflict on Vite dev server (default: 5173)

## AI Assistant Shows as Unavailable

**Symptom:** The AI Assistant panel says "Ollama is not running."

**Fixes:**
1. Install Ollama: https://ollama.com
2. Start Ollama: `ollama serve`
3. Pull a model: `ollama pull llama3.2` (or any model)
4. Restart Vanta Suite

## Global Hotkeys Don't Work

**Symptom:** Pressing Ctrl+Space does nothing.

**Fixes:**
1. Check if another app is using the same shortcut
2. Rebind in Settings → Shortcuts
3. On some desktop environments, Electron global shortcuts may conflict with system bindings — try a different combination

## Terminal Won't Spawn

**Symptom:** Terminal module shows blank or errors.

**Fixes:**
1. Verify your shell is valid: `echo $SHELL`
2. Check `node-pty` dependencies: `sudo apt install build-essential python3`
3. Override shell in Settings → Terminal → Shell (set explicit path like `/bin/bash`)

## Clipboard History Empty

**Symptom:** No clipboard items shown.

**Fixes:**
1. Clipboard monitoring starts when the daemon runs — copy something new and check
2. Verify `data/db/clipboard.db` exists and is writable

## Window Shows as Blank/White

**Symptom:** App window opens but shows only white/black.

**Fixes:**
1. Make sure `npm run build` completed successfully
2. Check console: DevTools accessible in dev mode (`npm run dev`)
3. Verify `src/app/index.html` loads the correct main.js

## High CPU Usage

**Symptom:** Vanta Suite uses significant CPU while idle.

**Fixes:**
1. The daemon is event-driven — high CPU usually means a polling loop in a module. Check Settings → Debug Mode to enable verbose logging and identify the source
2. Restart the app

## Files Not Found in Portable Mode

All data is under the `data/` folder inside the app directory. If you moved the app folder, the data moves with it. Nothing is stored in `~/.config/` unless system installation was explicitly enabled.
