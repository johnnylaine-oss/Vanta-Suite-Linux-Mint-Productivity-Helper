import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: {
      portableMode: true,
      darkMode: true,
      theme: 'dark',
      startupLaunchOnLogin: false,
      startupMinimized: false,
      ollamaHost: 'http://localhost:11434',
      clipboardMaxItems: 500,
      terminalFontFamily: 'JetBrains Mono',
      terminalFontSize: 14,
    },
    profiles: ['default'],
    activeProfile: 'default',
    loading: false,
  }),
  actions: {
    async load() {
      this.loading = true;
      try {
        if (window.vanta) {
          const s = await window.vanta.settings.getAll();
          if (s) Object.assign(this.settings, {
            portableMode: s.portableMode !== false,
            darkMode: s.theme !== 'light',
            theme: s.theme || 'dark',
            startupLaunchOnLogin: s.startup?.launchOnLogin || false,
            startupMinimized: s.startup?.launchMinimized || false,
            ollamaHost: s.ai?.ollamaHost || 'http://localhost:11434',
            clipboardMaxItems: s.clipboard?.maxItems || 500,
            terminalFontFamily: s.terminal?.fontFamily || 'JetBrains Mono',
            terminalFontSize: s.terminal?.fontSize || 14,
          });
          this.profiles = s.profiles || ['default'];
          this.activeProfile = s.activeProfile || 'default';
        }
      } catch {} finally {
        this.loading = false;
      }
    },
    async save(key, value) {
      if (window.vanta) await window.vanta.settings.set(key, value);
    },
    toggleTheme() {
      this.settings.darkMode = !this.settings.darkMode;
      this.settings.theme = this.settings.darkMode ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', this.settings.theme);
      this.save('theme', this.settings.theme);
    },
    async exportAll() {
      if (window.vanta) {
        const data = await window.vanta.settings.export();
        console.log('Settings exported:', data);
      }
    },
    async importAll() {
      if (window.vanta) {
        // In production, open a file dialog
        await window.vanta.settings.import();
      }
    },
  },
});
