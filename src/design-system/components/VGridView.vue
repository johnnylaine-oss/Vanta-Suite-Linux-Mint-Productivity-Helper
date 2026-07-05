<template>
  <div class="v-grid-view" :style="{ gridTemplateColumns: `repeat(auto-fill, minmax(${minColWidth}px, 1fr))` }"><slot /></div>
</template>
<script setup>
defineProps({ minColWidth: { type: Number, default: 180 } });
</script>
<style scoped>
.v-grid-view { display: grid; gap: var(--space-3); }
</style>
