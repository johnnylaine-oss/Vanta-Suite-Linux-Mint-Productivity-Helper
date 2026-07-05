// Vanta Suite — Terminal Store (Pinia).

import { defineStore } from 'pinia';

export const useTerminalStore = defineStore('terminal', {
  state: () => ({
    tabs: [],
    activeTabId: null,
    quakeModeVisible: false,
    options: {
      fontFamily: 'JetBrains Mono',
      fontSize: 14,
      shell: 'auto',
      cwd: null,
    },
    terminalInstance: null,
  }),
  actions: {
    setTerminal(terminal) { this.terminalInstance = terminal; },
    writeData(data) {
      if (window.vanta && this.activeTabId) {
        window.vanta.terminal.write(this.activeTabId, data);
      }
    },
    createTab(options = {}) {
      const id = `tab-${Date.now()}`;
      this.tabs.push({ id, title: options.title || 'Shell', ...options });
      this.activeTabId = id;
      if (window.vanta) {
        window.vanta.terminal.create({
          id,
          shell: options.shell || this.options.shell,
          cwd: options.cwd || this.options.cwd,
        });
      }
      return id;
    },
    closeTab(id) {
      if (window.vanta) window.vanta.terminal.destroy(id);
      this.tabs = this.tabs.filter(t => t.id !== id);
      if (this.activeTabId === id) {
        this.activeTabId = this.tabs.length > 0 ? this.tabs[this.tabs.length - 1].id : null;
      }
    },
  },
});
