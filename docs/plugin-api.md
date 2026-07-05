# Vanta Suite — Plugin API

Plugins extend Vanta Suite with custom commands, AI tools, settings sections, and tray menu items.

## Plugin Structure

```
data/plugins/<plugin-id>/
├── manifest.json   # Required
└── index.js        # Entry point (optional)
```

## manifest.json

```json
{
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "Does something useful",
  "author": "Your Name",
  "capabilities": ["commands", "ai-tools", "settings", "tray-menu"],
  "permissions": ["filesystem:read", "shell:exec"]
}
```

### Capabilities

- `commands` — Register custom Command Palette actions
- `ai-tools` — Register AI Assistant tools
- `settings` — Add a Settings section
- `tray-menu` — Add items to the system tray menu

### Permissions

- `filesystem:read` — Read access to filesystem
- `shell:exec` — Execute shell commands
- All destructive operations require explicit user confirmation

## Registration Examples

### Command Palette Action
```javascript
// Via pluginApi.registerCommandAction(pluginId, {
//   id: 'my-action',
//   trigger: 'my command',
//   aliases: ['mc'],
//   category: 'Custom',
//   icon: 'star',
//   handler: async (context) => { ... }
// });
```

### AI Tool
```javascript
// Via pluginApi.registerAiTool(pluginId, {
//   name: 'my_tool',
//   description: 'Does something',
//   schema: { parameters: {} },
//   handler: async (params) => { ... },
//   safety: 'safe' // or 'destructive' — destructive tools require confirmation
// });
```

## Sandbox Rules

- Plugins run in the main process but with restricted access
- No unrestricted filesystem write without explicit permission
- No network access by default
- Destructive operations require user confirmation via modal dialog
