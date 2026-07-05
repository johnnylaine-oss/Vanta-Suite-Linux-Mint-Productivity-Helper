import { defineStore } from 'pinia';
export const useNotificationsStore = defineStore('notifications', {
  state: () => ({ notifications: [], focusMode: false, loading: false, _unsub: null }),
  actions: {
    async load() { try { if (window.vanta) this.notifications = await window.vanta.notifications.getHistory() || []; } catch {} },
    async dismiss(id) { if (window.vanta) await window.vanta.notifications.dismiss(id); this.notifications = this.notifications.filter(n => n.id !== id); },
    clearAll() { this.notifications = []; },
    async toggleFocusMode() { this.focusMode = !this.focusMode; },
    subscribeToArrivals() {
      if (window.vanta) {
        this._unsub = window.vanta.notifications.onArrived((n) => {
          if (!this.focusMode) { this.notifications.unshift(n); if (this.notifications.length > 250) this.notifications.pop(); }
        });
      }
    },
  },
});
