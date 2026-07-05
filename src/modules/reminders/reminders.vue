<template>
  <div class="module-page">
    <VToolbar title="Reminders" />
    <div class="module-body">
      <div class="reminder-add">
        <VInput v-model="newReminder" placeholder='e.g., "Call dentist tomorrow 2pm" or "every Monday 9am"' @keydown.enter="addReminder" />
        <VButton variant="primary" size="sm" @click="addReminder">Add</VButton>
      </div>
      <VListView>
        <VReminderCard
          v-for="r in sortedReminders"
          :key="r.id"
          :title="r.title"
          :description="r.description"
          :time="r.time"
          :overdue="r.overdue"
          :done="r.done"
          :recurring="!!r.recurring"
          @snooze="onSnooze(r)"
          @done="store.markDone(r.id)"
        />
      </VListView>
      <div v-if="store.reminders.length === 0" class="remind-empty">
        No reminders yet. Type one above using natural language like "tomorrow 2pm" or "in 30 minutes".
      </div>
    </div>

    <!-- Snooze modal -->
    <VModal v-model:visible="snoozeModal.visible" :title="'Snooze'" :size="'sm'">
      <div class="snooze-options">
        <VButton v-for="opt in snoozeOptions" :key="opt.label" variant="ghost" @click="applySnooze(opt.duration)">{{ opt.label }}</VButton>
        <VInput v-model.number="snoozeCustom" type="number" placeholder="Custom minutes" />
        <VButton variant="primary" size="sm" @click="applySnooze(snoozeCustom * 60000)">Custom</VButton>
      </div>
    </VModal>

    <!-- Natural language quick tips -->
    <div class="remind-tips">
      <VButton variant="ghost" size="sm" @click="newReminder = 'in 15 minutes'">in 15 min</VButton>
      <VButton variant="ghost" size="sm" @click="newReminder = 'tomorrow 9am'">tomorrow 9am</VButton>
      <VButton variant="ghost" size="sm" @click="newReminder = 'every Monday 9am'">every Mon</VButton>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed } from 'vue';
import VToolbar from '../../design-system/components/VToolbar.vue';
import VButton from '../../design-system/components/VButton.vue';
import VInput from '../../design-system/components/VInput.vue';
import VModal from '../../design-system/components/VModal.vue';
import VListView from '../../design-system/components/VListView.vue';
import VReminderCard from '../../design-system/components/VReminderCard.vue';
import { useRemindersStore } from './remindersStore.js';
const store = useRemindersStore();
const newReminder = ref('');
const snoozeModal = reactive({ visible: false, reminderId: null });
const snoozeCustom = ref(5);
const snoozeOptions = [
  { label: '5 minutes', duration: 300000 },
  { label: '15 minutes', duration: 900000 },
  { label: '30 minutes', duration: 1800000 },
  { label: '1 hour', duration: 3600000 },
  { label: 'Tomorrow', duration: 86400000 },
];
const sortedReminders = computed(() =>
  [...store.reminders].sort((a, b) => { if (a.done !== b.done) return a.done ? 1 : -1; return new Date(a.time) - new Date(b.time); })
);
function addReminder() {
  if (!newReminder.value.trim()) return;
  store.add({ title: newReminder.value.trim(), naturalLanguage: newReminder.value.trim() });
  newReminder.value = '';
}
function onSnooze(r) { snoozeModal.reminderId = r.id; snoozeModal.visible = true; }
function applySnooze(durationMs) {
  store.snooze(snoozeModal.reminderId, durationMs);
  snoozeModal.visible = false;
}
store.load();
</script>
<style scoped>
.module-page { display: flex; flex-direction: column; height: 100%; }
.module-body { flex: 1; padding: var(--space-4); overflow-y: auto; }
.reminder-add { display: flex; gap: var(--space-2); margin-bottom: var(--space-4); }
.reminder-add .v-input-wrapper { flex: 1; }
.remind-empty { display: flex; align-items: center; justify-content: center; height: 100px; color: var(--text-disabled); text-align: center; font-size: 14px; }
.snooze-options { display: flex; flex-direction: column; gap: var(--space-2); }
.remind-tips { display: flex; gap: var(--space-2); margin-top: var(--space-6); justify-content: center; }
</style>
