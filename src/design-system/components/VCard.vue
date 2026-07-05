<!--
  VCard — Vanta Gold reference primitive for elevated content containers.
  Used as the base for VWorkspaceCard, VFavoriteAppCard, VReminderCard, VWorkflowCard, etc.
  Those should wrap this component rather than re-implementing the surface styling.
-->
<template>
  <div
    class="v-card v-focus-ring"
    :class="{ 'v-card--interactive': interactive, 'v-card--elevated': elevated }"
    :tabindex="interactive ? 0 : undefined"
    :role="interactive ? 'button' : undefined"
    @click="onClick"
    @keydown.enter="onClick"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({
  interactive: { type: Boolean, default: false },
  elevated: { type: Boolean, default: false },
});

const emit = defineEmits(['click']);

function onClick(e) {
  emit('click', e);
}
</script>

<style scoped>
.v-card {
  background: linear-gradient(180deg, #151517 0%, #121214 100%);
  border: 1px solid var(--bg-hairline);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  box-shadow: var(--elevation-1);
  transition: border-color var(--motion-fast), box-shadow var(--motion-fast), transform var(--motion-fast);
}

.v-card--elevated {
  box-shadow: var(--elevation-2);
}

.v-card--interactive {
  cursor: pointer;
}

.v-card--interactive:hover {
  border-color: rgba(212, 175, 55, 0.18);
  box-shadow: var(--elevation-2);
}

.v-card--interactive:active {
  transform: scale(0.997);
}
</style>
