<template>
  <VCard :interactive="interactive" class="v-workspace-card">
    <div class="v-workspace-card__icon">{{ icon }}</div>
    <div class="v-workspace-card__info">
      <span class="v-workspace-card__name">{{ name }}</span>
      <span v-if="description" class="v-workspace-card__desc">{{ description }}</span>
    </div>
    <slot name="actions" />
  </VCard>
</template>
<script setup>
import VCard from './VCard.vue';
defineProps({
  name: { type: String, default: '' },
  icon: { type: String, default: '' },
  description: { type: String, default: '' },
  interactive: { type: Boolean, default: true },
});
</script>
<style scoped>
.v-workspace-card { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); min-width: 0; }
.v-workspace-card__icon { font-size: 24px; flex-shrink: 0; width: 40px; text-align: center; }
.v-workspace-card__info { flex: 1; min-width: 0; }
.v-workspace-card__name { font-size: 14px; font-weight: 500; color: var(--text-primary); display: block; }
.v-workspace-card__desc { font-size: 12px; color: var(--text-secondary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
