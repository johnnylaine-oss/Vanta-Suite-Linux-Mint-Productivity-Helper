<template>
  <button
    class="v-icon-button v-focus-ring"
    :class="[`v-icon-button--${variant}`, `v-icon-button--${size}`, { 'v-icon-button--active': active }]"
    :disabled="disabled"
    :aria-label="label"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'ghost' }, // ghost | primary | secondary
  size: { type: String, default: 'md' },       // sm | md | lg
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  label: { type: String, default: '' },
});
const emit = defineEmits(['click']);
function onClick(e) { emit('click', e); }
</script>

<style scoped>
.v-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background var(--motion-fast), color var(--motion-fast), transform var(--motion-fast);
  background: transparent;
  color: var(--text-secondary);
}
.v-icon-button--sm { width: 28px; height: 28px; font-size: 14px; }
.v-icon-button--md { width: 36px; height: 36px; font-size: 18px; }
.v-icon-button--lg { width: 44px; height: 44px; font-size: 22px; }
.v-icon-button:hover:not(:disabled) { color: var(--text-primary); background: var(--bg-surface-2); }
.v-icon-button--active { color: var(--gold-core); }
.v-icon-button--primary { color: var(--gold-core); }
.v-icon-button--primary:hover:not(:disabled) { background: rgba(212, 175, 55, 0.1); }
.v-icon-button:active:not(:disabled) { transform: scale(0.92); }
.v-icon-button:disabled { opacity: 0.35; cursor: not-allowed; }
</style>
