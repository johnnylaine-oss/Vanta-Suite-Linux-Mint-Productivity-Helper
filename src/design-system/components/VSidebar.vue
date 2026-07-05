<template>
  <aside class="v-sidebar" :class="{ 'v-sidebar--collapsed': collapsed }">
    <div class="v-sidebar__items"><slot /></div>
  </aside>
</template>
<script setup>
defineProps({ collapsed: { type: Boolean, default: false } });
</script>
<style scoped>
.v-sidebar { width: 240px; background: var(--bg-surface); border-right: 1px solid var(--bg-hairline); display: flex; flex-direction: column; padding: var(--space-4) 0; transition: width var(--motion-normal); }
.v-sidebar--collapsed { width: 56px; }
.v-sidebar__items { display: flex; flex-direction: column; gap: var(--space-1); padding: 0 var(--space-2); }
</style>
