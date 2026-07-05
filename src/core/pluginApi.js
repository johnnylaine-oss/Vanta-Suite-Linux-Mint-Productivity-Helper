// Vanta Suite — Plugin API.
// The public-facing API that plugins interact with at runtime.
// This module re-exports the plugin manager and provides documentation helpers.
// The actual sandboxed execution is handled by src/main/pluginManager.js.

import pluginManager from '../main/pluginManager.js';
import logger from './logger.js';

/**
 * The PluginApi is the public interface for plugin management.
 * It delegates to the PluginManager singleton in the main process.
 */
class PluginApi {
  constructor() {
    this._manager = pluginManager;
  }

  /**
   * Discover and load all installed plugins from data/plugins/.
   * Called once at startup by the daemon.
   */
  async loadAll() {
    return this._manager.loadAll();
  }

  /**
   * Get all plugins (installed + registry entries).
   * @returns {Array<{id, name, version, description, author, capabilities, status, installed}>}
   */
  getAll() {
    return this._manager.getAllPlugins();
  }

  /**
   * Enable a plugin by ID.
   * @param {string} pluginId
   */
  enable(pluginId) {
    return this._manager.enable(pluginId);
  }

  /**
   * Disable a plugin by ID.
   * @param {string} pluginId
   */
  disable(pluginId) {
    return this._manager.disable(pluginId);
  }

  /**
   * Unload a plugin by ID.
   * @param {string} pluginId
   */
  async unload(pluginId) {
    return this._manager.unload(pluginId);
  }

  /**
   * Install a plugin from registry or local path.
   * @param {string} pluginId
   * @param {string} [sourcePath] - optional local path to plugin source
   */
  async install(pluginId, sourcePath) {
    return this._manager.install(pluginId, sourcePath);
  }

  /**
   * Uninstall a plugin completely (remove directory).
   * @param {string} pluginId
   */
  async uninstall(pluginId) {
    return this._manager.uninstall(pluginId);
  }

  /**
   * Clean up all plugins on app quit.
   */
  destroyAll() {
    return this._manager.destroyAll();
  }
}

// Singleton
const pluginApi = new PluginApi();
export default pluginApi;
