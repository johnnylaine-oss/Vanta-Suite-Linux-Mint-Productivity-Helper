<template>
  <div class="v-shortcut-recorder" :class="{ 'v-shortcut-recorder--recording': recording, 'v-shortcut-recorder--conflict': conflict }" @click="startRecording" @keydown="onKeydown" :tabindex="0">
    <span v-if="!recording && !value" class="v-shortcut-recorder__placeholder">{{ placeholder }}</span>
    <span v-else-if="!recording" class="v-shortcut-recorder__value">{{ displayValue }}</span>
    <span v-else class="v-shortcut-recorder__recording">Press keys...</span>
    <span v-if="conflict" class="v-shortcut-recorder__conflict">Already bound: {{ conflict }}</span>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
const props = defineProps({
  value: { type: String, default: '' },
  placeholder: { type: String, default: 'Click to record...' },
  conflict: { type: String, default: '' },
});
const emit = defineEmits(['update:value']);
const recording = ref(false);
const displayValue = computed(() => props.value.replace(/Control/g, 'Ctrl').replace(/Command/g, 'Cmd'));
function startRecording() { recording.value = true; }
function onKeydown(e) {
  e.preventDefault();
  if (!recording.value) return;
  const parts = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.shiftKey) parts.push('Shift');
  if (e.altKey) parts.push('Alt');
  if (e.metaKey) parts.push('Meta');
  if (!['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
  if (parts.length > 1) {
    emit('update:value', parts.join('+'));
    recording.value = false;
  }
}
</script>
<style scoped>
.v-shortcut-recorder { display: inline-flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); background: var(--bg-surface-2); border: 1px solid var(--bg-hairline); border-radius: var(--radius-sm); cursor: pointer; font-family: var(--font-mono); font-size: 13px; color: var(--text-primary); outline: none; transition: border-color var(--motion-fast); }
.v-shortcut-recorder--recording { border-color: var(--gold-core); box-shadow: 0 0 0 3px rgba(212,175,55,0.15); }
.v-shortcut-recorder--conflict { border-color: var(--state-error); }
.v-shortcut-recorder__placeholder, .v-shortcut-recorder__recording { color: var(--text-disabled); }
.v-shortcut-recorder__value { color: var(--gold-core); }
.v-shortcut-recorder__conflict { font-size: 12px; color: var(--state-error); }
</style>
