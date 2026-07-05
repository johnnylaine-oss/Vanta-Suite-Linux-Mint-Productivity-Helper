// Vanta Suite — Plugin Manager.
// Sandboxed plugin execution using Node.js vm module.
// Manages plugin lifecycle: load, enable, disable, unload.
// Plugins run in restricted VM contexts — no require(), no fs access.

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'fs';
import { join } from 'path';
import vm from 'vm';
import logger from '../core/logger.js';
import { getAllCommands, addCommand, removeCommand } from './commandExecutor.js';
import { getAllWorkflows, runWorkflow, addWorkflow, removeWorkflow } from './workflowEngine.js';

const PLUGINS_DIR = join(process.cwd(), 'data', 'plugins');
const PLUGINS_CACHE = join(process.cwd(), 'data', 'plugins', '.registry.json');

// Sandbox API surface exposed to plugin code
function createSandboxAPI(pluginId) {
  return {
    // Console (proxied through logger)
    console: {
      log: (...args) => logger.info(`plugin:${pluginId}`, args.join(' ')),
      warn: (...args) => logger.warn(`plugin:${pluginId}`, args.join(' ')),
      error: (...args) => logger.error(`plugin:${pluginId}`, args.join(' ')),
    },

    // Command system — plugins can register custom commands
    commands: {
      register(command) {
        if (!command.id || !command.trigger || !command.action) {
          throw new Error('Plugin command must have id, trigger, and action');
        }
        command._source = `plugin:${pluginId}`;
        return addCommand(command);
      },
      unregister(id) { return removeCommand(id); },
      list: () => getAllCommands(),
    },

    // Workflow system
    workflows: {
      register(workflow) {
        workflow._source = `plugin:${pluginId}`;
        return addWorkflow(workflow);
      },
      run(id) { return runWorkflow(id); },
      list: () => getAllWorkflows(),
    },

    // Shell execution (sandboxed — destructive commands still require confirmation)
    shell: {
      exec: async (cmd) => {
        const mod = await import('./commandExecutor.js');
        return mod.executeCommand(`plugin:${pluginId}:shell`, {
          variables: {},
          _inline: { type: 'run-shell', value: cmd },
        });
      },
    },

    // Settings (per-plugin namespace)
    settings: {
      _store: {},
      get(key) { return this._store[key]; },
      set(key, value) { this._store[key] = value; },
      getAll() { return { ...this._store }; },
    },

    // Events (in-process event emitter)
    events: {
      _handlers: {},
      on(event, handler) {
        if (!this._handlers[event]) this._handlers[event] = [];
        this._handlers[event].push(handler);
      },
      emit(event, data) {
        const handlers = this._handlers[event] || [];
        for (const h of handlers) {
          try { h(data); } catch (e) { /* silently catch */ }
        }
      },
    },

    // Plugin metadata
    meta: {
      id: pluginId,
      getDataDir() {
        const dir = join(PLUGINS_DIR, pluginId, 'data');
        try { mkdirSync(dir, { recursive: true }); } catch {}
        return dir;
      },
    },
  };
}

class PluginManager {
  constructor() {
    this._plugins = new Map(); // pluginId -> { manifest, status, context, exports }
    this._registry = null; // Loaded from .registry.json (known installable plugins)
  }

  // --- Lifecycle ---

  /** Discover and load all installed plugins at startup */
  async loadAll() {
    if (!existsSync(PLUGINS_DIR)) {
      logger.info('plugin-manager', 'No plugins directory — skipping');
      return;
    }

    let entries;
    try { entries = readdirSync(PLUGINS_DIR, { withFileTypes: true }); }
    catch (err) { logger.error('plugin-manager', 'Failed to read plugins dir', { error: err.message }); return; }

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      try { await this._loadPlugin(entry.name); }
      catch (err) {
        logger.error('plugin-manager', `Failed to load plugin: ${entry.name}`, { error: err.message });
      }
    }

    logger.info('plugin-manager', `Loaded ${this._plugins.size} plugin(s)`);
  }

  /** Load a single plugin (validate manifest, create sandbox, run code) */
  async _loadPlugin(pluginId) {
    const pluginDir = join(PLUGINS_DIR, pluginId);
    const manifestPath = join(pluginDir, 'manifest.json');

    if (!existsSync(manifestPath)) {
      throw new Error(`Plugin "${pluginId}" missing manifest.json`);
    }

    let manifest;
    try { manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')); }
    catch { throw new Error(`Plugin "${pluginId}" has invalid manifest.json`); }

    // Validate required fields
    if (!manifest.name || !manifest.version) {
      throw new Error(`Plugin "${pluginId}" manifest missing name or version`);
    }
    if (!manifest.main) manifest.main = 'index.js';

    const mainPath = join(pluginDir, manifest.main);
    if (!existsSync(mainPath)) {
      throw new Error(`Plugin "${pluginId}" main script not found: ${manifest.main}`);
    }

    // Read plugin code
    const code = readFileSync(mainPath, 'utf-8');

    // Create sandboxed VM context
    const sandbox = createSandboxAPI(pluginId);
    const context = vm.createContext(sandbox);

    // Run plugin code in sandbox
    vm.runInContext(code, context, {
      filename: mainPath,
      timeout: 10000, // 10s max for plugin init
    });

    // Determine initial status
    const status = manifest.disabled ? 'disabled' : 'loaded';

    this._plugins.set(pluginId, {
      manifest,
      status,
      context,
      exports: sandbox,
    });

    logger.info('plugin-manager', `Loaded: ${manifest.name} v${manifest.version}`, { pluginId, status });
  }

  /** Enable a plugin */
  enable(pluginId) {
    const p = this._plugins.get(pluginId);
    if (!p) throw new Error(`Plugin "${pluginId}" not found`);
    p.status = 'enabled';
    // Call onEnable if defined
    if (p.exports && typeof p.exports.onEnable === 'function') {
      p.exports.onEnable();
    }
    // Update manifest to persist enabled state
    this._updateManifestDisabled(pluginId, false);
    return true;
  }

  /** Disable a plugin */
  disable(pluginId) {
    const p = this._plugins.get(pluginId);
    if (!p) throw new Error(`Plugin "${pluginId}" not found`);
    p.status = 'disabled';
    // Call onDisable if defined
    if (p.exports && typeof p.exports.onDisable === 'function') {
      p.exports.onDisable();
    }
    this._updateManifestDisabled(pluginId, true);
    return true;
  }

  /** Unload a plugin completely */
  async unload(pluginId) {
    const p = this._plugins.get(pluginId);
    if (!p) throw new Error(`Plugin "${pluginId}" not found`);

    // Call onUnload if defined
    if (p.exports && typeof p.exports.onUnload === 'function') {
      p.exports.onUnload();
    }

    this._plugins.delete(pluginId);
    // Clean up plugin commands/workflows
    const allCmds = getAllCommands();
    for (const cmd of allCmds) {
      if (cmd._source === `plugin:${pluginId}`) removeCommand(cmd.id);
    }
    const allWfs = getAllWorkflows();
    for (const wf of allWfs) {
      if (wf._source === `plugin:${pluginId}`) removeWorkflow(wf.id);
    }
  }

  /** Destroy all plugins (called on app quit) */
  destroyAll() {
    for (const [id, p] of this._plugins) {
      if (p.exports && typeof p.exports.onUnload === 'function') {
        try { p.exports.onUnload(); } catch {}
      }
    }
    this._plugins.clear();
  }

  // --- Registry / Marketplace ---

  /** Load the plugin registry (list of known installable plugins) */
  _loadRegistry() {
    if (this._registry) return this._registry;
    try {
      if (existsSync(PLUGINS_CACHE)) {
        this._registry = JSON.parse(readFileSync(PLUGINS_CACHE, 'utf-8'));
      }
    } catch {}
    if (!this._registry) {
      this._registry = {
        plugins: [
          {
            id: 'example-hello-world',
            name: 'Hello World',
            version: '1.0.0',
            description: 'Example plugin that adds a "hello" command',
            author: 'Vanta Suite',
            capabilities: ['commands'],
            url: null,
          },
        ],
      };
    }
    return this._registry;
  }

  /** Get the combined list of all known + installed plugins */
  getAllPlugins() {
    const registry = this._loadRegistry();
    const installed = new Map();
    for (const [id, p] of this._plugins) {
      installed.set(id, {
        id,
        name: p.manifest.name,
        version: p.manifest.version,
        description: p.manifest.description || '',
        author: p.manifest.author || '',
        capabilities: p.manifest.capabilities || [],
        status: p.status,
        installed: true,
      });
    }

    // Merge registry entries with installed status
    const all = [];
    for (const rp of registry.plugins) {
      const ip = installed.get(rp.id);
      if (ip) {
        all.push(ip);
        installed.delete(rp.id);
      } else {
        all.push({ ...rp, status: 'available', installed: false });
      }
    }
    // Add any installed plugins not in registry
    for (const ip of installed.values()) all.push(ip);

    return all;
  }

  /** Install a plugin from the registry (download source) or from a local path */
  async install(pluginId, sourcePath) {
    // If sourcePath provided, copy from local path
    if (sourcePath) {
      const src = join(sourcePath, pluginId);
      const dest = join(PLUGINS_DIR, pluginId);
      if (!existsSync(src)) throw new Error(`Plugin source not found: ${src}`);
      cpSync(src, dest, { recursive: true });
      await this._loadPlugin(pluginId);
      return true;
    }

    // Otherwise, check registry for URL
    const registry = this._loadRegistry();
    const entry = registry.plugins.find(p => p.id === pluginId);
    if (!entry) throw new Error(`Plugin "${pluginId}" not found in registry`);
    if (!entry.url) throw new Error(`Plugin "${pluginId}" has no download URL`);

    // Create a basic placeholder and mark as "needs manual install"
    const pluginDir = join(PLUGINS_DIR, pluginId);
    mkdirSync(pluginDir, { recursive: true });
    const manifest = {
      name: entry.name,
      version: entry.version,
      description: entry.description,
      author: entry.author,
      capabilities: entry.capabilities || [],
    };
    writeFileSync(join(pluginDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    writeFileSync(join(pluginDir, 'index.js'), `// Plugin: ${entry.name}\n// Install manually: ${entry.url || 'No URL provided'}\nconsole.log('Plugin ${entry.name} loaded — add your logic below');\n`);

    await this._loadPlugin(pluginId);
    return true;
  }

  /** Uninstall a plugin (disable, unload, remove directory) */
  async uninstall(pluginId) {
    await this.unload(pluginId);
    const pluginDir = join(PLUGINS_DIR, pluginId);
    if (existsSync(pluginDir)) {
      rmSync(pluginDir, { recursive: true, force: true });
    }
    return true;
  }

  // --- Helpers ---

  _updateManifestDisabled(pluginId, disabled) {
    const manifestPath = join(PLUGINS_DIR, pluginId, 'manifest.json');
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
      manifest.disabled = disabled;
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    } catch {}
  }
}

// Singleton
const pluginManager = new PluginManager();
export default pluginManager;
