<template>
  <VCard :interactive="interactive" class="v-favorite-app-card">
    <div class="v-favorite-app-card__icon">{{ icon || '📦' }}</div>
    <span class="v-favorite-app-card__name">{{ name }}</span>
    <span v-if="pinned" class="v-favorite-app-card__pin">&#x1F4CC;</span>
  </VCard>
</template>
<script setup>
import VCard from './VCard.vue';
defineProps({
  name: { type: String, default: '' },
  icon: { type: String, default: '' },
  pinned: { type: Boolean, default: false },
  interactive: { type: Boolean, default: true },
});
</script>
<style scoped>
.v-favorite-app-card { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-4); text-align: center; }
.v-favorite-app-card__icon { font-size: 32px; }
.v-favorite-app-card__name { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.v-favorite-app-card__pin { font-size: 10px; position: absolute; top: var(--space-1); right: var(--space-1); }
</style>
