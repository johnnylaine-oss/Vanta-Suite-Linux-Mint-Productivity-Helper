<template>
  <div class="v-glass-panel" :class="[`v-glass-panel--${variant}`]"><slot /></div>
</template>
<script setup>
defineProps({ variant: { type: String, default: 'default' } });
</script>
<style scoped>
.v-glass-panel {
  background: rgba(18, 18, 20, 0.72);
  backdrop-filter: blur(20px) saturate(140%);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: var(--radius-lg);
  box-shadow: var(--elevation-3);
}
</style>
