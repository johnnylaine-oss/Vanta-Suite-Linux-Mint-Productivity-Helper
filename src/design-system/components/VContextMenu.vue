<template>
  <teleport to="body">
    <div v-if="visible" class="v-context-menu-backdrop" @mousedown="close" @contextmenu.prevent="close">
      <div class="v-context-menu" :style="{ left: x + 'px', top: y + 'px' }">
        <slot />
      </div>
    </div>
  </teleport>
</template>
<script setup>
defineProps({ visible: { type: Boolean, default: false }, x: { type: Number, default: 0 }, y: { type: Number, default: 0 } });
const emit = defineEmits(['close']);
function close() { emit('close'); }
</script>
<style scoped>
.v-context-menu-backdrop { position: fixed; inset: 0; z-index: 2500; }
.v-context-menu { position: absolute; background: var(--bg-surface); border: 1px solid var(--bg-hairline); border-radius: var(--radius-md); box-shadow: var(--elevation-3); padding: var(--space-1); min-width: 160px; }
</style>
