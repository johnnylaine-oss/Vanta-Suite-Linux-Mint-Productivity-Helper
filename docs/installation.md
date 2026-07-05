# Vanta Suite — Installation

## Quick Start (Portable Mode — Recommended)

```bash
cd vanta-suite
chmod +x install.sh
./install.sh
./start.sh
```

This installs dependencies, builds the app, and starts it. All data stays in the `data/` folder. Nothing is written outside the app directory.

## Requirements

- **Node.js 18+** (required) — install from https://nodejs.org or your package manager
- **npm** (required) — ships with Node.js
- **Ollama** (optional, for AI Assistant) — install from https://ollama.com

## What install.sh Does

1. Verifies Node.js and npm are installed
2. Runs `npm install`
3. Runs `npm run build`
4. Makes `start.sh` executable
5. Checks if Ollama is available

## Optional: System Installation

By default, Vanta Suite runs in portable mode. To integrate with your system:
1. Open Settings → Startup
2. Enable "Launch on Login" — this creates an autostart `.desktop` entry
3. The app can also install itself system-wide (adds to application menu)

## Uninstalling

### Portable mode
Quit the app from the tray icon and delete the `vanta-suite` folder. Done.

### System installation
Open Settings → Startup and click "Remove autostart entry" first, then delete the folder.

## Troubleshooting

See `docs/troubleshooting.md` for common issues and fixes.
