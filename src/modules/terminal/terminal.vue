<template>
  <div class="module-page">
    <VToolbar title="Terminal">
      <template #left>
        <div class="terminal-tabs">
          <button
            v-for="tab in store.tabs"
            :key="tab.id"
            class="terminal-tab v-focus-ring"
            :class="{ 'terminal-tab--active': tab.id === store.activeTabId }"
            @click="store.activeTabId = tab.id"
          >
            {{ tab.title }}
            <span class="terminal-tab__close" @click.stop="store.closeTab(tab.id)">×</span>
          </button>
        </div>
      </template>
      <template #right>
        <VButton variant="ghost" size="sm" @click="store.createTab()">+ Tab</VButton>
      </template>
    </VToolbar>
    <div class="module-body">
      <VTerminal
        v-if="store.activeTabId"
        :key="store.activeTabId"
        ref="terminalRef"
        :options="store.options"
        @data="onTerminalData"
        @ready="onTerminalReady"
      />
      <div v-else class="terminal-empty">No terminal open. Click "+ Tab" to start.</div>
    </div>

    <!-- Quake dropdown overlay -->
    <teleport to="body">
      <transition name="quake">
        <div v-if="quakeVisible" class="quake-overlay">
          <div class="quake-terminal">
            <VTerminal
              v-if="quakeTabId"
              :key="quakeTabId"
              ref="quakeRef"
              :options="store.options"
              @data="onQuakeData"
              @ready="onQuakeReady"
            />
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import VToolbar from '../../design-system/components/VToolbar.vue';
import VButton from '../../design-system/components/VButton.vue';
import VTerminal from '../../design-system/components/VTerminal.vue';
import { useTerminalStore } from './terminalStore.js';

const store = useTerminalStore();
const terminalRef = ref(null);
const quakeRef = ref(null);
const quakeVisible = ref(false);
const quakeTabId = ref(null);

function onTerminalData(data) {
  store.writeData(data);
}

function onTerminalReady(terminal) {
  store.setTerminal(terminal);
  // Create first tab only if no tabs exist at all (prevents duplicates on remount)
  if (store.tabs.length === 0) {
    store.createTab({ title: 'Shell' });
  }
}

// Quake mode
function onQuakeData(data) {
  // Write to quake PTY
  if (window.vanta) {
    window.vanta.terminal.write(quakeTabId.value, data);
  }
}

function onQuakeReady(terminal) {
  // Quake terminal is separate from main terminal
}

function toggleQuake() {
  if (quakeVisible.value) {
    quakeVisible.value = false;
    if (quakeTabId.value) {
      store.closeTab(quakeTabId.value);
      quakeTabId.value = null;
    }
  } else {
    const id = `quake-${Date.now()}`;
    quakeTabId.value = id;
    if (window.vanta) {
      window.vanta.terminal.create({ id, shell: store.options.shell, cwd: store.options.cwd });
    }
    quakeVisible.value = true;
  }
}

// Listen for quake hotkey
const onKeydown = (e) => {
  if (e.key === 'Escape' && quakeVisible.value) {
    toggleQuake();
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  // Listen for quake terminal hotkey
  if (window.vanta) {
    window.vanta.on('hotkey:pressed', (action) => {
      if (action === 'toggle-quake-terminal') toggleQuake();
    });
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});

defineExpose({ toggleQuake });
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; height: 100%; }
.module-body { flex: 1; overflow: hidden; padding: var(--space-2); }
.terminal-tabs { display: flex; gap: var(--space-1); margin-right: var(--space-2); overflow-x: auto; }
.terminal-tab { display: flex; align-items: center; gap: var(--space-1); padding: var(--space-1) var(--space-3); background: var(--bg-surface-2); border: 1px solid var(--bg-hairline); border-radius: var(--radius-sm) var(--radius-sm) 0 0; font-size: 13px; color: var(--text-secondary); cursor: pointer; font-family: var(--font-body); border-bottom: none; }
.terminal-tab--active { background: var(--bg-void); color: var(--gold-core); border-color: var(--gold-core); }
.terminal-tab__close { font-size: 14px; color: var(--text-disabled); padding: 0 2px; }
.terminal-tab__close:hover { color: var(--state-error); }
.terminal-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-disabled); }

/* Quake mode */
.quake-overlay { position: fixed; top: 0; left: 0; right: 0; z-index: 3000; }
.quake-terminal { height: 350px; background: var(--bg-void); border-bottom: 2px solid var(--gold-core); box-shadow: var(--elevation-3); }
.quake-enter-active { transition: transform 0.25s ease-out; }
.quake-leave-active { transition: transform 0.2s ease-in; }
.quake-enter-from, .quake-leave-to { transform: translateY(-100%); }
</style>
