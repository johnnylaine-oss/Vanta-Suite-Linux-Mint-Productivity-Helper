<template>
  <div class="v-search-box" :class="{ 'v-search-box--focused': focused, 'v-search-box--has-query': modelValue }">
    <span class="v-search-box__icon">&#x1F50D;</span>
    <input ref="inputRef" class="v-input v-focus-ring" :value="modelValue" :placeholder="placeholder" @input="onInput" @focus="focused = true" @blur="focused = false" @keydown="onKeydown" />
    <button v-if="modelValue" class="v-search-box__clear v-focus-ring" @click="clear" aria-label="Clear">&times;</button>
  </div>
</template>
<script setup>
import { ref } from 'vue';
defineProps({ modelValue: { type: String, default: '' }, placeholder: { type: String, default: 'Search...' } });
const emit = defineEmits(['update:modelValue', 'keydown']);
const focused = ref(false);
const inputRef = ref(null);
function onInput(e) { emit('update:modelValue', e.target.value); }
function clear() { emit('update:modelValue', ''); inputRef.value?.focus(); }
function onKeydown(e) { emit('keydown', e); }
defineExpose({ focus: () => inputRef.value?.focus() });
</script>
<style scoped>
.v-search-box { display: flex; align-items: center; gap: var(--space-2); background: var(--bg-surface-2); border: 1px solid var(--bg-hairline); border-radius: var(--radius-md); padding: 0 var(--space-3); transition: border-color var(--motion-fast), box-shadow var(--motion-fast); }
.v-search-box--focused { border-color: var(--gold-core); box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15); }
.v-search-box__icon { font-size: 16px; opacity: 0.5; }
.v-search-box .v-input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-family: var(--font-body); font-size: 14px; padding: var(--space-2) 0; outline: none; }
.v-search-box .v-input::placeholder { color: var(--text-disabled); }
.v-search-box__clear { background: none; border: none; color: var(--text-secondary); font-size: 18px; cursor: pointer; padding: 2px; border-radius: var(--radius-full); line-height: 1; }
.v-search-box__clear:hover { color: var(--text-primary); }
</style>
