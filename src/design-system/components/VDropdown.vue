<template>
  <div class="v-dropdown" :class="{ 'v-dropdown--open': open }">
    <button class="v-dropdown__trigger v-focus-ring" @click="toggle" @keydown.esc="open = false">
      <span>{{ selectedLabel || placeholder }}</span>
      <span class="v-dropdown__chevron">&#x25BC;</span>
    </button>
    <transition name="dropdown">
      <div v-if="open" class="v-dropdown__menu">
        <div v-for="option in options" :key="option.value" class="v-dropdown__item v-focus-ring" :class="{ 'v-dropdown__item--selected': option.value === modelValue }" @click="select(option)" @keydown.enter="select(option)">{{ option.label }}</div>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select...' },
});
const emit = defineEmits(['update:modelValue']);
const open = ref(false);
const selectedLabel = computed(() => props.options.find(o => o.value === props.modelValue)?.label);
function toggle() { open.value = !open.value; }
function select(option) { emit('update:modelValue', option.value); open.value = false; }
</script>
<style scoped>
.v-dropdown { position: relative; }
.v-dropdown__trigger { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: var(--space-2) var(--space-3); background: var(--bg-surface-2); border: 1px solid var(--bg-hairline); border-radius: var(--radius-sm); color: var(--text-primary); font-size: 14px; cursor: pointer; font-family: var(--font-body); transition: border-color var(--motion-fast); }
.v-dropdown__trigger:hover { border-color: rgba(212,175,55,0.4); }
.v-dropdown__chevron { font-size: 10px; color: var(--text-secondary); transition: transform var(--motion-fast); }
.v-dropdown--open .v-dropdown__chevron { transform: rotate(180deg); }
.v-dropdown__menu { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 100; background: var(--bg-surface); border: 1px solid var(--bg-hairline); border-radius: var(--radius-md); box-shadow: var(--elevation-3); padding: var(--space-1); max-height: 240px; overflow-y: auto; }
.v-dropdown__item { padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); cursor: pointer; font-size: 14px; color: var(--text-primary); transition: background var(--motion-fast); }
.v-dropdown__item:hover { background: var(--bg-surface-2); }
.v-dropdown__item--selected { color: var(--gold-core); }
.dropdown-enter-active, .dropdown-leave-active { transition: opacity var(--motion-fast), transform var(--motion-fast); }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
