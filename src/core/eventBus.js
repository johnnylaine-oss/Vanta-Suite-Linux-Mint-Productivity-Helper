// Vanta Suite — Central Event Bus.
// All cross-module communication flows through this bus.
// Modules emit and listen on named events — never import another module's internals directly.

class EventBus {
  constructor() {
    this._listeners = new Map();
    this._onceListeners = new Map();
  }

  /**
   * Register a listener for an event.
   * @param {string} event - Event name
   * @param {Function} callback - Listener function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /**
   * Register a one-time listener.
   * @param {string} event - Event name
   * @param {Function} callback - Listener function
   */
  once(event, callback) {
    if (!this._onceListeners.has(event)) {
      this._onceListeners.set(event, new Set());
    }
    this._onceListeners.get(event).add(callback);
  }

  /**
   * Remove a listener.
   * @param {string} event - Event name
   * @param {Function} callback - Listener function to remove
   */
  off(event, callback) {
    this._listeners.get(event)?.delete(callback);
    this._onceListeners.get(event)?.delete(callback);
  }

  /**
   * Emit an event with optional data.
   * @param {string} event - Event name
   * @param {...*} args - Arguments to pass to listeners
   */
  emit(event, ...args) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(...args);
        } catch (err) {
          console.error(`[EventBus] Error in listener for "${event}":`, err);
        }
      }
    }

    const onceListeners = this._onceListeners.get(event);
    if (onceListeners) {
      for (const callback of onceListeners) {
        try {
          callback(...args);
        } catch (err) {
          console.error(`[EventBus] Error in once listener for "${event}":`, err);
        }
      }
      this._onceListeners.delete(event);
    }
  }

  /**
   * Remove all listeners for an event, or all events if no event specified.
   * @param {string} [event] - Event name (optional)
   */
  removeAllListeners(event) {
    if (event) {
      this._listeners.delete(event);
      this._onceListeners.delete(event);
    } else {
      this._listeners.clear();
      this._onceListeners.clear();
    }
  }

  /**
   * Get count of listeners for an event.
   * @param {string} event - Event name
   * @returns {number}
   */
  listenerCount(event) {
    let count = 0;
    if (this._listeners.has(event)) count += this._listeners.get(event).size;
    if (this._onceListeners.has(event)) count += this._onceListeners.get(event).size;
    return count;
  }
}

// Singleton instance used across the application
export const eventBus = new EventBus();

export default eventBus;
