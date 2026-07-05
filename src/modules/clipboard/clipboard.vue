<template>
  <div class="module-page">
    <VToolbar title="Clipboard">
      <template #left><span class="clip-count">{{ store.items.length }} items</span></template>
      <template #right>
        <VButton variant="ghost" size="sm" @click="store.exportItems()">Export</VButton>
        <VButton variant="ghost" size="sm" @click="store.clear()">Clear</VButton>
      </template>
    </VToolbar>
    <div class="module-body">
      <VSearchBox v-model="searchQuery" placeholder="Search clipboard..." @keydown="onSearchKeydown" />
      <div class="clip-filters">
        <VButton variant="ghost" size="sm" :class="{ 'clip-filter--active': filterType === 'all' }" @click="filterType = 'all'">All</VButton>
        <VButton variant="ghost" size="sm" :class="{ 'clip-filter--active': filterType === 'pinned' }" @click="filterType = 'pinned'">Pinned</VButton>
        <VButton variant="ghost" size="sm" :class="{ 'clip-filter--active': filterType === 'text' }" @click="filterType = 'text'">Text</VButton>
        <VButton variant="ghost" size="sm" :class="{ 'clip-filter--active': filterType === 'code' }" @click="filterType = 'code'">Code</VButton>
      </div>
      <VListView ref="listRef">
        <VCard
          v-for="(item, idx) in filteredItems"
          :key="item.id"
          :interactive="true"
          class="clip-item"
          :class="{ 'clip-item--focused': idx === focusedIndex, 'clip-item--pinned': item.pinned }"
          @click="paste(item)"
          @mouseenter="focusedIndex = idx"
        >
          <div class="clip-item__header">
            <span class="clip-item__type">{{ item.type }}</span>
            <span class="clip-item__time">{{ formatTime(item.timestamp) }}</span>
            <div class="clip-item__actions">
              <VIconButton variant="ghost" size="sm" :label="item.pinned ? 'Unpin' : 'Pin'" @click.stop="store.togglePin(item.id)">{{ item.pinned ? '📌' : '📍' }}</VIconButton>
              <VIconButton variant="ghost" size="sm" label="Delete" @click.stop="store.deleteItem(item.id)">🗑️</VIconButton>
            </div>
          </div>
          <div class="clip-item__preview">{{ item.content?.slice(0, 200) || '(empty)' }}</div>
        </VCard>
      </VListView>
      <div v-if="filteredItems.length === 0" class="clip-empty">No clipboard items{{ searchQuery ? ' matching "' + searchQuery + '"' : '' }}.</div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import VToolbar from '../../design-system/components/VToolbar.vue';
import VButton from '../../design-system/components/VButton.vue';
import VIconButton from '../../design-system/components/VIconButton.vue';
import VCard from '../../design-system/components/VCard.vue';
import VSearchBox from '../../design-system/components/VSearchBox.vue';
import VListView from '../../design-system/components/VListView.vue';
import { useClipboardStore } from './clipboardStore.js';
const store = useClipboardStore();
const searchQuery = ref('');
const filterType = ref('all');
const focusedIndex = ref(0);
const listRef = ref(null);

const filteredItems = computed(() => {
  let items = store.items;
  if (filterType.value === 'pinned') items = items.filter(i => i.pinned);
  else if (filterType.value === 'text') items = items.filter(i => i.type === 'text');
  else if (filterType.value === 'code') items = items.filter(i => i.type === 'code');
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    items = items.filter(i => i.content?.toLowerCase().includes(q));
  }
  return items;
});

function paste(item) { store.paste(item.id); }
function formatTime(ts) { try { return new Date(ts).toLocaleString(); } catch { return ''; } }

function onSearchKeydown(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); focusedIndex.value = Math.min(focusedIndex.value + 1, filteredItems.value.length - 1); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); focusedIndex.value = Math.max(focusedIndex.value - 1, 0); }
  else if (e.key === 'Enter' && filteredItems.value[focusedIndex.value]) { paste(filteredItems.value[focusedIndex.value]); }
}

store.loadHistory();
</script>
<style scoped>
.module-page { display: flex; flex-direction: column; height: 100%; }
.module-body { flex: 1; padding: var(--space-4); overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-3); }
.clip-count { font-size: 13px; color: var(--text-secondary); }
.clip-filters { display: flex; gap: var(--space-1); }
.clip-filter--active { color: var(--gold-core) !important; }
.clip-item { transition: border-color var(--motion-fast); }
.clip-item--focused { border-color: rgba(212, 175, 55, 0.3); }
.clip-item--pinned { border-left: 3px solid var(--gold-core); }
.clip-item__header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
.clip-item__type { font-size: 11px; color: var(--gold-core); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.clip-item__time { font-family: var(--font-mono); font-size: 11px; color: var(--text-disabled); }
.clip-item__actions { margin-left: auto; display: flex; gap: var(--space-1); }
.clip-item__preview { font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); white-space: pre-wrap; word-break: break-all; line-height: 1.5; }
.clip-empty { display: flex; align-items: center; justify-content: center; height: 100px; color: var(--text-disabled); }
</style>
