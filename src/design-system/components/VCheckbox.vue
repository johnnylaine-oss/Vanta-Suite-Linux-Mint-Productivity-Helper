<template>
  <label class="v-checkbox" :class="{ 'v-checkbox--disabled': disabled }">
    <input type="checkbox" class="v-checkbox__input" :checked="modelValue" :disabled="disabled" @change="onChange" />
    <span class="v-checkbox__mark v-focus-ring"><span v-if="modelValue" class="v-checkbox__check">&#x2713;</span></span>
    <span v-if="$slots.default || label" class="v-checkbox__label"><slot>{{ label }}</slot></span>
  </label>
</template>
<script setup>
defineProps({ modelValue: { type: Boolean, default: false }, disabled: { type: Boolean, default: false }, label: { type: String, default: '' } });
const emit = defineEmits(['update:modelValue']);
function onChange(e) { emit('update:modelValue', e.target.checked); }
</script>
<style scoped>
.v-checkbox { display: inline-flex; align-items: center; gap: var(--space-2); cursor: pointer; }
.v-checkbox--disabled { opacity: 0.5; cursor: not-allowed; }
.v-checkbox__input { position: absolute; opacity: 0; width: 0; height: 0; }
.v-checkbox__mark { width: 18px; height: 18px; border: 2px solid var(--bg-hairline); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; transition: border-color var(--motion-fast), background var(--motion-fast); flex-shrink: 0; }
.v-checkbox__input:checked + .v-checkbox__mark { background: linear-gradient(135deg, var(--gold-bright), var(--gold-core)); border-color: var(--gold-core); }
.v-checkbox__input:focus-visible + .v-checkbox__mark { border-color: var(--gold-core); box-shadow: 0 0 0 3px rgba(212,175,55,0.15); }
.v-checkbox__check { color: var(--bg-void); font-size: 13px; font-weight: 700; line-height: 1; }
.v-checkbox__label { font-size: 14px; color: var(--text-primary); }
</style>
