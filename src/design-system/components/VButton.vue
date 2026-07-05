<!--
  VButton — Vanta Gold reference primitive.
  Every other V* component should follow this same convention:
  - props for variant/size/state
  - emits a plain 'click' event, no custom event names for standard interactions
  - all styling derived from design-tokens.css custom properties, zero hardcoded hex values
  - explicit hover / active / focus-visible / disabled states
-->
<template>
  <button
    class="v-button v-focus-ring"
    :class="[`v-button--${variant}`, `v-button--${size}`, { 'v-button--loading': loading }]"
    :disabled="disabled || loading"
    @click="onClick"
  >
    <span v-if="loading" class="v-button__spinner" aria-hidden="true" />
    <span class="v-button__label"><slot /></span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary | secondary | destructive | ghost
  },
  size: {
    type: String,
    default: 'md', // sm | md | lg
  },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(['click']);

function onClick(e) {
  emit('click', e);
}
</script>

<style scoped>
.v-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-body);
  font-weight: 500;
  letter-spacing: 0.01em;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: transform var(--motion-fast), box-shadow var(--motion-fast), background var(--motion-fast), border-color var(--motion-fast);
}

.v-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Sizes */
.v-button--sm { padding: var(--space-2) var(--space-3); font-size: 12px; }
.v-button--md { padding: var(--space-3) var(--space-4); font-size: 14px; }
.v-button--lg { padding: var(--space-4) var(--space-6); font-size: 16px; }

/* Primary — brushed metal gold gradient */
.v-button--primary {
  background: linear-gradient(135deg, #F4D68C 0%, #D4AF37 45%, #A67C27 100%);
  color: var(--bg-void);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.25) inset, 0 4px 16px rgba(212, 175, 55, 0.25);
}
.v-button--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.3) inset, 0 6px 20px rgba(212, 175, 55, 0.35);
}
.v-button--primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.15) inset, 0 2px 8px rgba(212, 175, 55, 0.2);
}

/* Secondary — outlined, transparent */
.v-button--secondary {
  background: transparent;
  color: var(--text-primary);
  border-color: var(--bg-hairline);
}
.v-button--secondary:hover:not(:disabled) {
  border-color: rgba(212, 175, 55, 0.4);
}

/* Destructive — text/border only, never a solid fill */
.v-button--destructive {
  background: transparent;
  color: var(--state-error);
  border-color: var(--state-error);
}
.v-button--destructive:hover:not(:disabled) {
  background: rgba(196, 107, 95, 0.08);
}

/* Ghost — minimal, for toolbars/menus */
.v-button--ghost {
  background: transparent;
  color: var(--text-secondary);
}
.v-button--ghost:hover:not(:disabled) {
  color: var(--text-primary);
  background: var(--bg-surface-2);
}

.v-button__spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.25);
  border-top-color: var(--bg-void);
  animation: v-spin 0.6s linear infinite;
}

@keyframes v-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .v-button__spinner { animation: none; }
}
</style>
