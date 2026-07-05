<template>
  <label class="v-toggle" :class="{ 'v-toggle--disabled': disabled }">
    <input type="checkbox" class="v-toggle__input" :checked="modelValue" :disabled="disabled" @change="onChange" />
    <span class="v-toggle__track v-focus-ring">
      <span class="v-toggle__thumb" />
    </span>
    <span v-if="$slots.default || label" class="v-toggle__label"><slot>{{ label }}</slot></span>
  </label>
</template>
<script setup>
defineProps({ modelValue: { type: Boolean, default: false }, disabled: { type: Boolean, default: false }, label: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue']);
function onChange(e) { emit('update:modelValue', e.target.checked); }
</script>
<style scoped>
.v-toggle { display: inline-flex; align-items: center; gap: var(--space-2); cursor: pointer; }
.v-toggle--disabled { opacity: 0.5; cursor: not-allowed; }
.v-toggle__input { position: absolute; opacity: 0; width: 0; height: 0; }
.v-toggle__track { width: 40px; height: 22px; background: var(--bg-surface-2); border: 1px solid var(--bg-hairline); border-radius: var(--radius-full); position: relative; transition: background var(--motion-fast), border-color var(--motion-fast); flex-shrink: 0; }
.v-toggle__input:checked + .v-toggle__track { background: linear-gradient(135deg, var(--gold-bright), var(--gold-core)); border-color: var(--gold-core); }
.v-toggle__thumb { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: var(--text-primary); border-radius: 50%; transition: transform var(--motion-fast); }
.v-toggle__input:checked + .v-toggle__track .v-toggle__thumb { transform: translateX(18px); }
.v-toggle__label { font-size: 14px; color: var(--text-primary); }
</style>
