<template>
  <div class="v-toolbar">
    <div class="v-toolbar__left"><slot name="left" /></div>
    <div class="v-toolbar__center"><slot name="center"><span v-if="title" class="v-toolbar__title">{{ title }}</span></slot></div>
    <div class="v-toolbar__right"><slot name="right" /></div>
  </div>
</template>
<script setup>
defineProps({ title: { type: String, default: '' } });
</script>
<style scoped>
.v-toolbar { display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4); background: var(--bg-surface); border-bottom: 1px solid var(--bg-hairline); min-height: 48px; }
.v-toolbar__title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.v-toolbar__left, .v-toolbar__right { display: flex; align-items: center; gap: var(--space-2); flex-shrink: 0; }
</style>
