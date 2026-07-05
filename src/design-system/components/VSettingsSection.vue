<template>
  <div class="v-settings-section">
    <button class="v-settings-section__header v-focus-ring" @click="expanded = !expanded">
      <span class="v-settings-section__title">{{ title }}</span>
      <span class="v-settings-section__chevron" :class="{ 'v-settings-section__chevron--expanded': expanded }">&#x25BC;</span>
    </button>
    <div v-show="expanded" class="v-settings-section__body"><slot /></div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
defineProps({ title: { type: String, default: '' } });
const expanded = ref(true);
</script>
<style scoped>
.v-settings-section { border-bottom: 1px solid var(--bg-hairline); }
.v-settings-section__header { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: var(--space-4) var(--space-6); background: none; border: none; cursor: pointer; color: var(--text-primary); font-size: 16px; font-weight: 600; font-family: var(--font-body); text-align: left; border-radius: 0; }
.v-settings-section__header:hover { background: var(--bg-surface-2); }
.v-settings-section__chevron { font-size: 10px; transition: transform var(--motion-fast); }
.v-settings-section__chevron--expanded { transform: rotate(180deg); }
.v-settings-section__body { padding: 0 var(--space-6) var(--space-6); }
</style>
