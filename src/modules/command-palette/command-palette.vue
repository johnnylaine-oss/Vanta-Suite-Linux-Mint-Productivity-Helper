<template>
  <div class="module-page">
    <VToolbar title="Command Palette">
      <template #right>
        <VButton variant="ghost" size="sm" @click="$emit('close')">Close</VButton>
      </template>
    </VToolbar>
    <div class="module-body">
      <p class="module-text">The Command Palette is always accessible via <kbd>Super+Space</kbd>.</p>
      <p class="module-text">Type any command, app name, or system action and press Enter.</p>
    </div>
  </div>
</template>
<script setup>
import VToolbar from '../../design-system/components/VToolbar.vue';
import VButton from '../../design-system/components/VButton.vue';
</script>
<style scoped>
.module-page { display: flex; flex-direction: column; height: 100%; }
.module-body { flex: 1; padding: var(--space-6); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-4); }
.module-text { color: var(--text-secondary); font-size: 14px; }
.module-text kbd { background: var(--bg-surface-2); border: 1px solid var(--bg-hairline); border-radius: var(--radius-sm); padding: 2px 8px; font-family: var(--font-mono); font-size: 13px; color: var(--gold-core); }
</style>
