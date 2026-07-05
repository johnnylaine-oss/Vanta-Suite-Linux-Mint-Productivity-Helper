<template>
  <div class="module-page">
    <VToolbar title="Notifications">
      <template #left>
        <VToggle v-model="store.focusMode" label="Focus" @update:modelValue="store.toggleFocusMode()" />
      </template>
      <template #right>
        <VButton variant="ghost" size="sm" @click="store.clearAll()">Clear All</VButton>
      </template>
    </VToolbar>
    <div class="module-body">
      <VSearchBox v-model="searchQuery" placeholder="Search notifications..." />
      <VListView>
        <VNotification
          v-for="n in filteredNotifications"
          :key="n.id"
          :variant="n.variant || 'info'"
          :dismissible="true"
          @dismiss="store.dismiss(n.id)"
        >
          <div class="notif-content">
            <div class="notif-header">
              <span class="notif-app">{{ n.appName || 'system' }}</span>
              <span class="notif-time">{{ formatTime(n.timestamp) }}</span>
            </div>
            <div class="notif-body">{{ n.content }}</div>
          </div>
        </VNotification>
      </VListView>
      <div v-if="store.notifications.length === 0" class="notif-empty">
        No notifications yet. They'll appear here as they arrive.
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import VToolbar from '../../design-system/components/VToolbar.vue';
import VButton from '../../design-system/components/VButton.vue';
import VToggle from '../../design-system/components/VToggle.vue';
import VSearchBox from '../../design-system/components/VSearchBox.vue';
import VListView from '../../design-system/components/VListView.vue';
import VNotification from '../../design-system/components/VNotification.vue';
import { useNotificationsStore } from './notificationsStore.js';
const store = useNotificationsStore();
const searchQuery = ref('');
const filteredNotifications = computed(() =>
  searchQuery.value
    ? store.notifications.filter(n => n.content?.toLowerCase().includes(searchQuery.value.toLowerCase()))
    : store.notifications
);
function formatTime(ts) { try { return new Date(ts).toLocaleString(); } catch { return ''; } }
store.load();
store.subscribeToArrivals();
</script>
<style scoped>
.module-page { display: flex; flex-direction: column; height: 100%; }
.module-body { flex: 1; padding: var(--space-4); overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-3); }
.notif-content { flex: 1; }
.notif-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-1); }
.notif-app { font-size: 11px; color: var(--gold-core); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
.notif-time { font-family: var(--font-mono); font-size: 11px; color: var(--text-disabled); }
.notif-body { font-size: 14px; color: var(--text-primary); }
.notif-empty { display: flex; align-items: center; justify-content: center; height: 100px; color: var(--text-disabled); text-align: center; }
</style>
