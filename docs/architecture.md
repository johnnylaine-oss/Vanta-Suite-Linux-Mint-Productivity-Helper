# Vanta Suite — Architecture

## Overview

Vanta Suite is an Electron + Vue 3 desktop application with a single daemon process managing a renderer window. All cross-module communication flows through a central Event Bus and typed IPC channels.

## Module Map

```
┌─────────────────────────────────────────────────────────┐
│                    MAIN PROCESS (daemon.js)               │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌───────────┐ │
│  │   Tray   │ │  Window  │ │  Hotkey    │ │   IPC     │ │
│  │ Manager  │ │ Manager  │ │  Engine    │ │ Handlers  │ │
│  └──────────┘ └──────────┘ └────────────┘ └───────────┘ │
│                          │                                │
│              contextBridge (preload.js)                   │
│                          │                                │
├──────────────────────────┼────────────────────────────────┤
│                    RENDERER PROCESS                       │
│                          │                                │
│  ┌───────────────────────┴────────────────────────────┐  │
│  │                   App.vue (root)                    │  │
│  └───┬────────────────────────────────────────────┬───┘  │
│      │                                            │       │
│  ┌───┴───────────┐                        ┌──────┴─────┐ │
│  │ Design System │                        │  Modules   │ │
│  │  (V* comps)   │                        │  (10 dirs) │ │
│  └───────────────┘                        └──────┬─────┘ │
│                                                  │       │
│  ┌───────────────────────────────────────────────┴─────┐ │
│  │               Core Services                         │ │
│  │  EventBus │ ActionRegistry │ Logger │ PluginApi    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                  │       │
│  ┌───────────────────────────────────────────────┴─────┐ │
│  │              Pinia Stores (per module)               │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Event Bus Contract

All cross-module communication uses `src/core/eventBus.js`. Key events:

- `module:open:<name>` — Opens a module in the main area
- `command:execute:<id>` — Execute a command from the palette
- `hotkey:pressed:<action>` — Global hotkey triggered
- `notification:arrived` — New system notification
- `reminder:fired` — Reminder due
- `clipboard:changed` — Clipboard content changed
- `theme:changed` — Dark/light mode toggle

## IPC Contract

Defined in `src/core/ipcContracts.js`. All main↔renderer communication uses named channels. The renderer has no direct Node.js access — everything goes through `contextBridge` in `preload.js`.

## Data Flow

1. User presses global hotkey → main process sends IPC event to renderer
2. Renderer opens Command Palette or navigates to module
3. Module component loads data through Pinia store
4. Store calls preload-exposed IPC method
5. Main process handler reads/writes JSON files or SQLite databases
6. Response flows back through IPC → store → component

## State Ownership

Each module owns its state via its Pinia store. No module directly accesses another module's store. Cross-module state sharing uses the Event Bus.
