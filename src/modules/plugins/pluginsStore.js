// Vanta Suite — Plugins Store (Pinia).

import { defineStore } from 'pinia';

export const usePluginsStore = defineStore('plugins', {
  state: () => ({
    plugins: [],
    loading: false,
  }),

  actions: {
    async load() {
      this.loading = true;
      try {
        if (window.vanta) {
          this.plugins = await window.vanta.plugins.getAll() || [];
        } else {
          this.plugins = [];
        }
      } catch (err) {
        console.warn('Failed to load plugins:', err);
        this.plugins = [];
      } finally {
        this.loading = false;
      }
    },

    async enable(pluginId) {
      try {
        if (window.vanta) await window.vanta.plugins.enable(pluginId);
        const p = this.plugins.find(p => p.id === pluginId);
        if (p) p.status = 'enabled';
      } catch (err) {
        console.error('Failed to enable plugin:', err);
      }
    },

    async disable(pluginId) {
      try {
        if (window.vanta) await window.vanta.plugins.disable(pluginId);
        const p = this.plugins.find(p => p.id === pluginId);
        if (p) p.status = 'disabled';
      } catch (err) {
        console.error('Failed to disable plugin:', err);
      }
    },

    async install(pluginId, sourcePath) {
      this.loading = true;
      try {
        if (window.vanta) await window.vanta.plugins.install(pluginId, sourcePath);
        await this.load();
      } catch (err) {
        console.error('Failed to install plugin:', err);
      } finally {
        this.loading = false;
      }
    },

    async uninstall(pluginId) {
      this.loading = true;
      try {
        if (window.vanta) await window.vanta.plugins.uninstall(pluginId);
        await this.load();
      } catch (err) {
        console.error('Failed to uninstall plugin:', err);
      } finally {
        this.loading = false;
      }
    },
  },
});
