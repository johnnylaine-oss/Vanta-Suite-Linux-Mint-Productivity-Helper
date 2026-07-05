<template>
  <div class="v-list-view" :class="{ 'v-list-view--keyboard': keyboardNav }">
    <div v-if="$slots.header" class="v-list-view__header"><slot name="header" /></div>
    <div class="v-list-view__items" ref="listRef"><slot /></div>
    <div v-if="$slots.footer" class="v-list-view__footer"><slot name="footer" /></div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
defineProps({ keyboardNav: { type: Boolean, default: true } });
const listRef = ref(null);
defineExpose({ el: listRef });
</script>
<style scoped>
.v-list-view { display: flex; flex-direction: column; }
.v-list-view__items { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-1); }
.v-list-view__header, .v-list-view__footer { padding: var(--space-3) 0; }
</style>
