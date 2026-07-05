<template>
  <VCard :interactive="interactive" class="v-workflow-card" :class="{ 'v-workflow-card--running': running, 'v-workflow-card--error': error }">
    <div class="v-workflow-card__header">
      <span class="v-workflow-card__icon">{{ icon || '&#x2699;' }}</span>
      <div class="v-workflow-card__info">
        <span class="v-workflow-card__name">{{ name }}</span>
        <span class="v-workflow-card__steps">{{ stepCount }} step{{ stepCount !== 1 ? 's' : '' }}</span>
      </div>
    </div>
    <p v-if="description" class="v-workflow-card__desc">{{ description }}</p>
    <div v-if="running" class="v-workflow-card__progress">
      <VProgressBar :percent="progress" :label="`${currentStep}/${stepCount}`" />
    </div>
  </VCard>
</template>
<script setup>
import VCard from './VCard.vue';
import VProgressBar from './VProgressBar.vue';
defineProps({
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  stepCount: { type: Number, default: 0 },
  currentStep: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  running: { type: Boolean, default: false },
  error: { type: Boolean, default: false },
  interactive: { type: Boolean, default: true },
});
</script>
<style scoped>
.v-workflow-card--running { border-left: 3px solid var(--gold-core); }
.v-workflow-card--error { border-left: 3px solid var(--state-error); }
.v-workflow-card__header { display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2); }
.v-workflow-card__icon { font-size: 22px; }
.v-workflow-card__info { flex: 1; }
.v-workflow-card__name { font-size: 14px; font-weight: 500; color: var(--text-primary); display: block; }
.v-workflow-card__steps { font-size: 12px; color: var(--text-secondary); }
.v-workflow-card__desc { font-size: 13px; color: var(--text-secondary); margin: 0; }
.v-workflow-card__progress { margin-top: var(--space-3); }
</style>
