<template>
  <teleport to="body">
    <transition name="palette">
      <div v-if="visible" class="palette-backdrop" @mousedown.self="close">
        <div class="palette-container v-glass">
          <VSearchBox
            ref="searchRef"
            v-model="query"
            placeholder="Type a command..."
            @keydown="onKeydown"
          />
          <div v-if="results.length > 0" ref="resultsRef" class="palette-results">
            <div
              v-for="(item, index) in results"
              :key="item.id"
              class="palette-item v-focus-ring"
              :class="{ 'palette-item--focused': index === focusedIndex }"
              @click="execute(item)"
              @mouseenter="focusedIndex = index"
            >
              <span class="palette-item__icon">{{ item.icon || '&#x25CF;' }}</span>
              <div class="palette-item__content">
                <span class="palette-item__name">{{ item.trigger }}</span>
                <span class="palette-item__category">{{ item.category }}</span>
              </div>
              <span v-if="item.aliases?.length" class="palette-item__aliases">{{ item.aliases[0] }}</span>
            </div>
          </div>
          <div v-else-if="query.length > 0" class="palette-empty">
            No results for "{{ query }}"
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import VSearchBox from './VSearchBox.vue';
import Fuse from 'fuse.js';

const props = defineProps({
  visible: { type: Boolean, default: false },
  commands: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:visible', 'execute']);

const query = ref('');
const focusedIndex = ref(0);
const searchRef = ref(null);
const resultsRef = ref(null);

const fuse = computed(() => new Fuse(props.commands, {
  keys: ['trigger', 'aliases', 'category'],
  threshold: 0.4,
  includeScore: true,
}));

const results = computed(() => {
  if (!query.value.trim()) return props.commands.slice(0, 12);
  return fuse.value.search(query.value).map(r => r.item);
});

function close() { emit('update:visible', false); query.value = ''; focusedIndex.value = 0; }
function execute(item) { emit('execute', item); close(); }

function onKeydown(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); focusedIndex.value = Math.min(focusedIndex.value + 1, results.value.length - 1); scrollToFocused(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); focusedIndex.value = Math.max(focusedIndex.value - 1, 0); scrollToFocused(); }
  else if (e.key === 'Enter') { if (results.value[focusedIndex.value]) execute(results.value[focusedIndex.value]); }
  else if (e.key === 'Escape') close();
}

function scrollToFocused() {
  nextTick(() => {
    const el = resultsRef.value?.children[focusedIndex.value];
    el?.scrollIntoView({ block: 'nearest' });
  });
}

watch(() => props.visible, (v) => {
  if (v) { nextTick(() => searchRef.value?.focus()); focusedIndex.value = 0; query.value = ''; }
});
</script>

<style scoped>
.palette-backdrop { position: fixed; inset: 0; z-index: 2000; display: flex; justify-content: center; padding-top: 15vh; background: rgba(0,0,0,0.4); }
.palette-container { width: 620px; max-height: 400px; border-radius: var(--radius-lg); box-shadow: var(--elevation-3); overflow: hidden; display: flex; flex-direction: column; padding: var(--space-3); }
.palette-results { flex: 1; overflow-y: auto; margin-top: var(--space-3); }
.palette-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-sm); cursor: pointer; transition: background var(--motion-fast); }
.palette-item--focused { background: rgba(212, 175, 55, 0.08); }
.palette-item__icon { font-size: 18px; width: 28px; text-align: center; flex-shrink: 0; }
.palette-item__content { flex: 1; display: flex; flex-direction: column; }
.palette-item__name { font-size: 14px; font-weight: 500; color: var(--text-primary); }
.palette-item__category { font-size: 11px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
.palette-item__aliases { font-size: 12px; color: var(--text-disabled); }
.palette-empty { padding: var(--space-6); text-align: center; color: var(--text-disabled); font-size: 14px; }
.palette-enter-active { transition: opacity 0.2s ease-out; }
.palette-leave-active { transition: opacity 0.15s ease-in; }
.palette-enter-from, .palette-leave-to { opacity: 0; }
.palette-enter-active .palette-container { animation: palette-in 0.25s ease-out; }
@keyframes palette-in { from { transform: scale(0.95) translateY(-12px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
</style>
