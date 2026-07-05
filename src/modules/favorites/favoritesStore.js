// Vanta Suite — Favorites Store (Pinia).
// Manages favorite app groups, app entries, and recent apps.

import { defineStore } from 'pinia';

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    groups: [],
    apps: [],
    recentApps: [],
    loading: false,
  }),
  getters: {
    pinnedApps: (state) => state.apps.filter((a) => a.pinned),
    groupById: (state) => (id) => state.groups.find((g) => g.id === id),
  },
  actions: {
    async loadGroups() {
      this.loading = true;
      try {
        if (window.vanta) {
          const settings = await window.vanta.settings.getAll();
          this.groups = settings?.favoriteGroups || [];
          this.apps = this.groups.flatMap((g) => g.apps || []);
          this.recentApps = settings?.recentApps || [];
        }
      } finally {
        this.loading = false;
      }
    },
    async addGroup(group) {
      if (window.vanta) await window.vanta.favorites.addGroup(group);
      this.groups.push(group);
    },
    async removeGroup(id) {
      if (window.vanta) await window.vanta.favorites.removeGroup(id);
      this.groups = this.groups.filter((g) => g.id !== id);
    },
    async launchApp(app) {
      if (window.vanta) await window.vanta.favorites.launchApp(app);
      this.recentApps.unshift(app);
      if (this.recentApps.length > 20) this.recentApps.pop();
    },
  },
});
