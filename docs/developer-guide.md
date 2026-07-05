# Vanta Suite — Developer Guide

## Adding a New Module

1. Create a directory: `src/modules/<module-name>/`
2. Create the module's Pinia store: `<moduleName>Store.js`
3. Create the module's Vue component: `<module-name>.vue`
4. Register IPC channels in `src/core/ipcContracts.js` (if needed)
5. Add IPC handlers in `src/main/daemon.js` (if backend logic needed)
6. Expose API methods in `src/preload/preload.js`
7. Add a navigation entry in `src/app/App.vue`

## Adding a New Command Type

1. Define the action type in `src/core/actionRegistry.js`
2. Add handler logic for execution (shell, open-path, open-url, etc.)
3. Register built-in commands in `data/commands/commands.json`
4. Commands are automatically available in the Command Palette via fuzzy search

## Adding a New AI Tool

1. Create a tool file in `src/modules/ai-assistant/tools/<tool-name>.js`
2. Export: `{ name, description, parameters (JSON schema), handler (async function), safety ('safe' | 'destructive') }`
3. Register in the AI Assistant's tool registry
4. Destructive tools automatically trigger a confirmation modal

## Adding a New V* Component

1. Create `src/design-system/components/V<Name>.vue`
2. Use only CSS custom properties from `tokens.css` — never hardcoded hex values
3. Implement all required states: default, hover, active, focus-visible, disabled
4. Use `.v-focus-ring` class for the gold focus ring
5. Follow VButton.vue and VCard.vue conventions for props/emits

## Build & Development

- `npm run dev` — Start Vite dev server (port 5173) + Electron
- `npm run build` — Production build
- `npm run start` — Run built app
