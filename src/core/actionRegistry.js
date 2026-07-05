// Vanta Suite — Action Registry.
// Central registry mapping action identifiers to handler functions.
// Used by: Command Palette, Hotkey Engine, Workflows, AI Assistant tools.
// All actions are resolved through this registry — never hardcode a function reference.

import eventBus from './eventBus.js';

class ActionRegistry {
  constructor() {
    this._actions = new Map();
  }

  /**
   * Register an action handler.
   * @param {string} actionId - Unique action identifier (e.g., "open-group-development", "toggle-quake-terminal")
   * @param {Function} handler - Async function to execute when the action is triggered
   * @param {object} [meta] - Optional metadata: { description, category, icon }
   */
  register(actionId, handler, meta = {}) {
    if (this._actions.has(actionId)) {
      console.warn(`[ActionRegistry] Overwriting action: ${actionId}`);
    }
    this._actions.set(actionId, { handler, meta });
  }

  /**
   * Unregister an action.
   * @param {string} actionId
   */
  unregister(actionId) {
    this._actions.delete(actionId);
  }

  /**
   * Execute an action by its identifier.
   * @param {string} actionId - The action to execute
   * @param {object} [context={}] - Additional context (e.g., variables from command input)
   * @returns {Promise<any>}
   */
  async execute(actionId, context = {}) {
    const entry = this._actions.get(actionId);
    if (!entry) {
      throw new Error(`[ActionRegistry] Unknown action: ${actionId}`);
    }
    return entry.handler(context);
  }

  /**
   * Check if an action exists.
   * @param {string} actionId
   * @returns {boolean}
   */
  has(actionId) {
    return this._actions.has(actionId);
  }

  /**
   * Get metadata for an action.
   * @param {string} actionId
   * @returns {object|undefined}
   */
  getMeta(actionId) {
    return this._actions.get(actionId)?.meta;
  }

  /**
   * List all registered action IDs.
   * @returns {string[]}
   */
  listAll() {
    return Array.from(this._actions.keys());
  }
}

// Singleton
export const actionRegistry = new ActionRegistry();

export default actionRegistry;
