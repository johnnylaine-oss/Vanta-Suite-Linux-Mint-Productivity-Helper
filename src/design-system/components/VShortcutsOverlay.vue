<template>
  <teleport to="body">
    <transition name="v-modal">
      <div v-if="visible" class="shortcuts-overlay" @mousedown.self="close">
        <div class="shortcuts-overlay__panel v-glass">
          <div class="shortcuts-overlay__header">
            <h2 class="shortcuts-overlay__title">Keyboard Shortcuts</h2>
            <div class="shortcuts-overlay__search">
              <span class="shortcuts-overlay__search-icon">🔍</span>
              <input
                ref="searchInput"
                v-model="query"
                type="text"
                class="shortcuts-overlay__input"
                placeholder="Filter shortcuts..."
                aria-label="Filter keyboard shortcuts"
              />
            </div>
            <button class="shortcuts-overlay__close v-focus-ring" @click="close" aria-label="Close shortcuts">&times;</button>
          </div>
          <div class="shortcuts-overlay__body">
            <section v-for="section in filteredSections" :key="section.name" class="shortcuts-section">
              <h3 class="shortcuts-section__title">{{ section.name }}</h3>
              <div class="shortcuts-section__items">
                <div v-for="item in section.items" :key="item.key" class="shortcut-item">
                  <span class="shortcut-item__label">{{ item.label }}</span>
                  <span class="shortcut-item__keys">
                    <kbd v-for="(key, i) in item.keys" :key="i">{{ key }}</kbd>
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
});
const emit = defineEmits(['update:visible', 'close']);

const query = ref('');
const searchInput = ref(null);

function close() {
  emit('update:visible', false);
  emit('close');
}

// Watch visibility to autofocus search
watch(() => props.visible, async (v) => {
  if (v) {
    await nextTick();
    searchInput.value?.focus();
  }
  query.value = '';
});

const sections = [
  {
    name: 'Global',
    items: [
      { label: 'Open Command Palette', keys: ['Super', 'Space'] },
      { label: 'Keyboard Shortcuts', keys: ['Super', 'K', 'S'] },
      { label: 'Toggle Quake Terminal', keys: ['Super', '`'] },
      { label: 'Start Onboarding Tour', keys: ['Super', 'Shift', '?'] },
      { label: 'Close / Back', keys: ['Escape'] },
    ],
  },
  {
    name: 'Navigation',
    items: [
      { label: 'Favorites', keys: ['Super', '1'] },
      { label: 'Terminal', keys: ['Super', '2'] },
      { label: 'AI Assistant', keys: ['Super', '3'] },
      { label: 'Clipboard', keys: ['Super', '4'] },
      { label: 'Reminders', keys: ['Super', '5'] },
      { label: 'Notifications', keys: ['Super', '6'] },
      { label: 'Workflows', keys: ['Super', '7'] },
      { label: 'Settings', keys: ['Super', '8'] },
    ],
  },
  {
    name: 'Terminal',
    items: [
      { label: 'New Tab', keys: ['Super', 'Shift', 'T'] },
      { label: 'Close Tab', keys: ['Super', 'Shift', 'W'] },
      { label: 'Next Tab', keys: ['Super', 'Tab'] },
      { label: 'Previous Tab', keys: ['Super', 'Shift', 'Tab'] },
      { label: 'Clear Terminal', keys: ['Super', 'L'] },
    ],
  },
  {
    name: 'Clipboard',
    items: [
      { label: 'Pin Item', keys: ['Super', 'P'] },
      { label: 'Delete Item', keys: ['Delete'] },
      { label: 'Copy Selected', keys: ['Enter'] },
      { label: 'Search History', keys: ['Super', 'F'] },
    ],
  },
  {
    name: 'Workflows',
    items: [
      { label: 'Run Workflow', keys: ['Super', 'R'] },
      { label: 'Stop Workflow', keys: ['Escape'] },
    ],
  },
];

const filteredSections = computed(() => {
  if (!query.value.trim()) return sections;
  const q = query.value.toLowerCase();
  return sections
    .map(s => ({
      ...s,
      items: s.items.filter(i =>
        i.label.toLowerCase().includes(q) ||
        i.keys.some(k => k.toLowerCase().includes(q))
      ),
    }))
    .filter(s => s.items.length > 0);
});
</script>

<style scoped>
.shortcuts-overlay {
  position: fixed; inset: 0; z-index: 2000;
  display: flex; align-items: flex-start; justify-content: center;
  padding-top: 10vh;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
}
.shortcuts-overlay__panel {
  border-radius: var(--radius-lg);
  box-shadow: var(--elevation-3);
  width: 620px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.shortcuts-overlay__header {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--bg-hairline);
}
.shortcuts-overlay__title {
  font-family: var(--font-body);
  font-size: 18px; font-weight: 600;
  color: var(--text-primary); margin: 0; white-space: nowrap;
}
.shortcuts-overlay__search {
  flex: 1; display: flex; align-items: center; gap: var(--space-2);
  background: var(--bg-surface-2); border-radius: var(--radius-sm);
  padding: var(--space-1) var(--space-3);
  border: 1px solid transparent;
  transition: border-color var(--motion-fast);
}
.shortcuts-overlay__search:focus-within { border-color: var(--gold-core); }
.shortcuts-overlay__search-icon { font-size: 14px; opacity: 0.5; }
.shortcuts-overlay__input {
  flex: 1; background: none; border: none; color: var(--text-primary);
  font-family: var(--font-body); font-size: 14px; outline: none;
}
.shortcuts-overlay__input::placeholder { color: var(--text-disabled); }
.shortcuts-overlay__close {
  background: none; border: none; color: var(--text-secondary);
  font-size: 24px; cursor: pointer; padding: 0; line-height: 1;
  border-radius: var(--radius-sm);
}
.shortcuts-overlay__close:hover { color: var(--text-primary); }
.shortcuts-overlay__body {
  flex: 1; overflow-y: auto; padding: var(--space-4) var(--space-6) var(--space-6);
  display: flex; flex-direction: column; gap: var(--space-6);
}
.shortcuts-section__title {
  font-family: var(--font-body); font-size: 13px; font-weight: 600;
  color: var(--gold-core); text-transform: uppercase; letter-spacing: 1px;
  margin: 0 0 var(--space-3);
}
.shortcuts-section__items { display: flex; flex-direction: column; gap: var(--space-1); }
.shortcut-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  transition: background var(--motion-fast);
}
.shortcut-item:hover { background: var(--bg-surface-2); }
.shortcut-item__label { font-size: 14px; color: var(--text-primary); }
.shortcut-item__keys { display: flex; gap: var(--space-1); align-items: center; }
.shortcut-item__keys kbd {
  display: inline-block; padding: 2px 8px;
  font-family: var(--font-mono); font-size: 12px;
  background: var(--bg-surface); border: 1px solid var(--bg-hairline);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  min-width: 20px; text-align: center;
}
.v-modal-enter-active { transition: opacity 0.15s ease-out; }
.v-modal-leave-active { transition: opacity 0.1s ease-in; }
.v-modal-enter-from, .v-modal-leave-to { opacity: 0; }
.v-modal-enter-active .shortcuts-overlay__panel {
  animation: shortcuts-in 0.2s ease-out;
}
@keyframes shortcuts-in {
  from { transform: scale(0.96) translateY(-8px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
</style>
