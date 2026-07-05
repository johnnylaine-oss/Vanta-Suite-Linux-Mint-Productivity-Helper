<template>
  <div class="v-input-wrapper">
    <label v-if="label" class="v-input__label">{{ label }}</label>
    <div class="v-input__field-wrapper" :class="{ 'v-input__field-wrapper--error': error }">
      <slot name="prefix" />
      <input
        ref="inputRef"
        class="v-input v-focus-ring"
        :class="[`v-input--${size}`]"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="onInput"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />
      <slot name="suffix" />
    </div>
    <p v-if="error" class="v-input__error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
  size: { type: String, default: 'md' },
});
const emit = defineEmits(['update:modelValue', 'focus', 'blur']);
const inputRef = ref(null);
function onInput(e) { emit('update:modelValue', e.target.value); }
defineExpose({ focus: () => inputRef.value?.focus(), blur: () => inputRef.value?.blur() });
</script>

<style scoped>
.v-input-wrapper { display: flex; flex-direction: column; gap: var(--space-1); }
.v-input__label { font-size: 13px; font-weight: 500; color: var(--text-secondary); letter-spacing: 0.06em; text-transform: uppercase; }
.v-input__field-wrapper { display: flex; align-items: center; background: var(--bg-surface-2); border: 1px solid var(--bg-hairline); border-radius: var(--radius-sm); transition: border-color var(--motion-fast); }
.v-input__field-wrapper:focus-within { border-color: var(--gold-core); box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15); }
.v-input__field-wrapper--error { border-color: var(--state-error); }
.v-input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-family: var(--font-body); font-size: 14px; outline: none; padding: var(--space-3) var(--space-3); }
.v-input::placeholder { color: var(--text-disabled); }
.v-input:disabled { opacity: 0.5; cursor: not-allowed; }
.v-input--sm { padding: var(--space-1) var(--space-2); font-size: 12px; }
.v-input--md { padding: var(--space-2) var(--space-3); font-size: 14px; }
.v-input--lg { padding: var(--space-3) var(--space-4); font-size: 16px; }
.v-input__error { font-size: 12px; color: var(--state-error); margin: 0; }
</style>
