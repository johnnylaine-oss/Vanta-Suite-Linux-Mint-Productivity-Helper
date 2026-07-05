// Vanta Suite — AI Assistant Store (Pinia).

import { defineStore } from 'pinia';

export const useAiStore = defineStore('ai', {
  state: () => ({
    available: false,
    model: '',
    models: [],
    messages: [],
    loading: false,
  }),
  actions: {
    async checkAvailability() {
      try {
        if (window.vanta) {
          const models = await window.vanta.ai.getModels();
          this.models = models || [];
          this.available = !!models && models.length > 0;
          if (models?.length > 0) this.model = models[0];
        }
      } catch {
        this.available = false;
      }
    },
    async sendMessage(content) {
      this.messages.push({ role: 'user', content });
      this.loading = true;
      try {
        if (window.vanta) {
          const response = await window.vanta.ai.chat(content, { model: this.model });
          if (response?.content) {
            this.messages.push({ role: 'assistant', content: response.content });
          }
        }
      } catch (err) {
        this.messages.push({ role: 'assistant', content: 'Sorry, an error occurred: ' + err.message });
      } finally {
        this.loading = false;
      }
    },
  },
});
