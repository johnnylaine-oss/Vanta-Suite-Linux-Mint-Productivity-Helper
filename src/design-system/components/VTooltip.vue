<template>
  <div class="v-tooltip-wrapper" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide">
    <slot />
    <transition name="tooltip"><div v-if="visible" class="v-tooltip" :class="[`v-tooltip--${position}`]">{{ text }}</div></transition>
  </div>
</template>
<script setup>
import { ref } from 'vue';
defineProps({ text: { type: String, default: '' }, position: { type: String, default: 'top' } });
const visible = ref(false);
function show() { visible.value = true; }
function hide() { visible.value = false; }
</script>
<style scoped>
.v-tooltip-wrapper { position: relative; display: inline-flex; }
.v-tooltip { position: absolute; z-index: 3000; background: var(--bg-surface-2); color: var(--text-primary); font-size: 12px; padding: var(--space-1) var(--space-2); border-radius: var(--radius-sm); border: 1px solid var(--bg-hairline); white-space: nowrap; pointer-events: none; }
.v-tooltip--top { bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
.v-tooltip--bottom { top: calc(100% + 6px); left: 50%; transform: translateX(-50%); }
.tooltip-enter-active, .tooltip-leave-active { transition: opacity var(--motion-fast), transform var(--motion-fast); }
.tooltip-enter-from, .tooltip-leave-to { opacity: 0; transform: translateX(-50%) translateY(4px); }
</style>
