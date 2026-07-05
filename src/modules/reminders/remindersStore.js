import { defineStore } from 'pinia';
export const useRemindersStore = defineStore('reminders', {
  state: () => ({ reminders: [], loading: false }),
  actions: {
    async load() { try { if (window.vanta) this.reminders = await window.vanta.reminders.getAll() || []; } catch {} },
    async add(reminder) { if (window.vanta) await window.vanta.reminders.add(reminder); this.load(); },
    async remove(id) { if (window.vanta) await window.vanta.reminders.remove(id); this.reminders = this.reminders.filter(r => r.id !== id); },
    async snooze(id, duration) { if (window.vanta) await window.vanta.reminders.snooze(id, duration); this.load(); },
    async markDone(id) {
      if (window.vanta) await window.vanta.reminders.update({ id, done: true });
      const r = this.reminders.find(r => r.id === id);
      if (r) r.done = true;
    },
  },
});
