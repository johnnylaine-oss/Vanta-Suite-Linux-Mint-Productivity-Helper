<template>
  <div class="v-window" :class="{ 'v-window--focused': focused }">
    <div class="v-window__chrome">
      <div class="v-window__title">{{ title }}</div>
      <div class="v-window__controls">
        <VIconButton size="sm" @click="$emit('minimize')" label="Minimize">&#x2014;</VIconButton>
        <VIconButton size="sm" @click="$emit('maximize')" label="Maximize">&#x25A1;</VIconButton>
        <VIconButton size="sm" @click="$emit('close')" label="Close">&times;</VIconButton>
      </div>
    </div>
    <div class="v-window__body"><slot /></div>
  </div>
</template>
<script setup>
import VIconButton from './VIconButton.vue';
defineProps({ title: { type: String, default: '' }, focused: { type: Boolean, default: true } });
defineEmits(['minimize', 'maximize', 'close']);
</script>
<style scoped>
.v-window { background: var(--bg-void); border: 1px solid var(--bg-hairline); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--elevation-3); display: flex; flex-direction: column; min-height: 0; }
.v-window__chrome { display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--bg-surface); border-bottom: 1px solid var(--bg-hairline); -webkit-app-region: drag; }
.v-window__title { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.v-window__controls { display: flex; gap: var(--space-1); -webkit-app-region: no-drag; }
.v-window__body { flex: 1; overflow: auto; }
</style>
