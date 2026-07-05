import { defineStore } from 'pinia';
export const useClipboardStore = defineStore('clipboard', {
  state: () => ({ items: [], loading: false }),
  actions: {
    async loadHistory() { try { if (window.vanta) this.items = await window.vanta.clipboard.getHistory() || []; } catch {} },
    async togglePin(id) { if (window.vanta) await window.vanta.clipboard.pin(id); this.loadHistory(); },
    async paste(id) {
      if (window.vanta) { const r = await window.vanta.clipboard.paste(id); if (r?.content) navigator.clipboard?.writeText(r.content); }
    },
    async deleteItem(id) { if (window.vanta) await window.vanta.clipboard.delete(id); this.items = this.items.filter(i => i.id !== id); },
    async clear() { if (window.vanta) await window.vanta.clipboard.clear(); this.items = []; },
    async exportItems() { if (window.vanta) { const d = await window.vanta.clipboard.export(); const blob = new Blob([d], {type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'clipboard-export.json'; a.click(); } },
    async importItems(data) { if (window.vanta) await window.vanta.clipboard.import(data); this.loadHistory(); },
  },
});
