<template>
  <teleport to="body">
    <transition name="v-modal">
      <div v-if="visible" class="v-modal-backdrop" @mousedown.self="onBackdropClick">
        <div class="v-modal v-glass" :class="[`v-modal--${size}`]">
          <div v-if="$slots.header || title" class="v-modal__header">
            <h2 v-if="title" class="v-modal__title">{{ title }}</h2>
            <slot name="header" />
            <button class="v-modal__close v-focus-ring" @click="close" aria-label="Close">&times;</button>
          </div>
          <div class="v-modal__body"><slot /></div>
          <div v-if="$slots.footer" class="v-modal__footer"><slot name="footer" /></div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { watch } from 'vue';
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' },
  closeOnBackdrop: { type: Boolean, default: true },
});
const emit = defineEmits(['update:visible', 'close']);
function close() { emit('update:visible', false); emit('close'); }
function onBackdropClick() { if (props.closeOnBackdrop) close(); }
watch(() => props.visible, (v) => { if (v) document.body.style.overflow = 'hidden'; else document.body.style.overflow = ''; });
</script>

<style scoped>
.v-modal-backdrop { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); }
.v-modal { border-radius: var(--radius-lg); box-shadow: var(--elevation-3); max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; }
.v-modal--sm { width: 400px; }
.v-modal--md { width: 560px; }
.v-modal--lg { width: 720px; }
.v-modal__header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--bg-hairline); }
.v-modal__title { font-family: var(--font-body); font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 0; }
.v-modal__close { background: none; border: none; color: var(--text-secondary); font-size: 24px; cursor: pointer; padding: 0; line-height: 1; border-radius: var(--radius-sm); }
.v-modal__close:hover { color: var(--text-primary); }
.v-modal__body { padding: var(--space-6); flex: 1; }
.v-modal__footer { padding: var(--space-4) var(--space-6); border-top: 1px solid var(--bg-hairline); display: flex; justify-content: flex-end; gap: var(--space-3); }
.v-modal-enter-active { transition: opacity 0.2s ease-out; }
.v-modal-leave-active { transition: opacity 0.15s ease-in; }
.v-modal-enter-from, .v-modal-leave-to { opacity: 0; }
.v-modal-enter-active .v-modal { animation: modal-in 0.25s ease-out; }
@keyframes modal-in { from { transform: scale(0.95) translateY(8px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
</style>
