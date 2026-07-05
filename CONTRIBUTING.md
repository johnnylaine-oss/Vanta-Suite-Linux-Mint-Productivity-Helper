# Contributing to Vanta Suite

Thanks for your interest in contributing! Vanta Suite is a keyboard-first productivity suite for Linux Mint Cinnamon built with Electron + Vue 3.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/Vanta-Suite-Linux-Mint-Productivity-Helper.git`
3. **Install dependencies**:
   ```bash
   sudo apt-get install -y build-essential python3 libgtk-3-dev wmctrl curl
   npm install
   ```
4. **Run in development**:
   ```bash
   npm run dev    # Starts Vite dev server
   npm start      # Launches Electron app
   ```

## Project Structure

```
src/
├── main/           # Electron main process (daemon, hotkeys, engines)
├── core/           # Shared modules (IPC contracts, logger, plugin API)
├── preload/        # contextBridge preload script
├── app/            # Vue 3 renderer entry point
├── modules/        # Lazy-loaded feature modules
├── design-system/  # V* component library + tokens
└── config/         # Branding and app constants
```

## Code Style

- **ES modules only** (`import`/`export`) — `"type": "module"` is set in package.json
- Import paths use `.js` extensions (e.g., `import { foo } from './bar.js'`)
- No inline `require()` calls — they will fail in ES module mode
- Follow existing naming conventions:
  - Vue components: `PascalCase` (e.g., `VButton.vue`)
  - Stores: `camelCase` + `Store` suffix (e.g., `pluginsStore.js`)
  - IPC channels: `UPPER_SNAKE_CASE` in `ipcContracts.js`

## Submitting Changes

1. Create a branch: `git checkout -b feature/my-feature`
2. Make your changes following the code style
3. Test locally: `npm run dev` and `npm start`
4. Commit with a clear message
5. Push and open a Pull Request

## Plugin Development

See [README.md](README.md#plugin-development) for the plugin API reference.
