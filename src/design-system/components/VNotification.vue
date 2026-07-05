<template>
  <div class="v-notification" :class="[`v-notification--${variant}`]">
    <div class="v-notification__content"><slot /></div>
    <button v-if="dismissible" class="v-notification__dismiss v-focus-ring" @click="$emit('dismiss')" aria-label="Dismiss">&times;</button>
  </div>
</template>
<script setup>
defineProps({
  variant: { type: String, default: 'info' },
  dismissible: { type: Boolean, default: true },
});
defineEmits(['dismiss']);
</script>
<style scoped>
.v-notification { display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--bg-hairline); background: var(--bg-surface); box-shadow: var(--elevation-2); }
.v-notification--info { border-left: 3px solid var(--gold-core); }
.v-notification--success { border-left: 3px solid var(--state-success); }
.v-notification--warning { border-left: 3px solid var(--state-warning); }
.v-notification--error { border-left: 3px solid var(--state-error); }
.v-notification__content { flex: 1; font-size: 14px; color: var(--text-primary); }
.v-notification__dismiss { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; padding: 0; line-height: 1; border-radius: var(--radius-sm); }
.v-notification__dismiss:hover { color: var(--text-primary); }
</style>
