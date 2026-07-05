<template>
  <VCard :interactive="interactive" class="v-reminder-card" :class="{ 'v-reminder-card--overdue': overdue, 'v-reminder-card--done': done }">
    <div class="v-reminder-card__header">
      <span class="v-reminder-card__time">{{ formattedTime }}</span>
      <span v-if="recurring" class="v-reminder-card__recurring">&#x1F503;</span>
    </div>
    <p class="v-reminder-card__title">{{ title }}</p>
    <p v-if="description" class="v-reminder-card__desc">{{ description }}</p>
    <div v-if="!done" class="v-reminder-card__actions">
      <VButton variant="ghost" size="sm" @click.stop="$emit('snooze')">Snooze</VButton>
      <VButton variant="ghost" size="sm" @click.stop="$emit('done')">Done</VButton>
    </div>
  </VCard>
</template>
<script setup>
import { computed } from 'vue';
import VCard from './VCard.vue';
import VButton from './VButton.vue';

const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  time: { type: String, default: '' },
  overdue: { type: Boolean, default: false },
  done: { type: Boolean, default: false },
  recurring: { type: Boolean, default: false },
  interactive: { type: Boolean, default: true },
});
defineEmits(['snooze', 'done']);

const formattedTime = computed(() => {
  try { return new Date(props.time).toLocaleString(); } catch { return props.time; }
});
</script>
<style scoped>
.v-reminder-card { border-left: 3px solid transparent; }
.v-reminder-card--overdue { border-left-color: var(--state-error); }
.v-reminder-card--done { opacity: 0.5; }
.v-reminder-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); }
.v-reminder-card__time { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }
.v-reminder-card__recurring { font-size: 14px; }
.v-reminder-card__title { font-size: 16px; font-weight: 500; color: var(--text-primary); margin: 0 0 var(--space-1); }
.v-reminder-card__desc { font-size: 13px; color: var(--text-secondary); margin: 0; }
.v-reminder-card__actions { display: flex; gap: var(--space-2); margin-top: var(--space-3); }
</style>
