<template>
  <div class="v-progress-bar">
    <div class="v-progress-bar__track">
      <div class="v-progress-bar__fill" :class="{ 'v-progress-bar__fill--indeterminate': indeterminate }" :style="!indeterminate ? { width: percent + '%' } : {}" />
    </div>
    <span v-if="label" class="v-progress-bar__label">{{ label }}</span>
  </div>
</template>
<script setup>
defineProps({ percent: { type: Number, default: 0 }, indeterminate: { type: Boolean, default: false }, label: { type: String, default: '' } });
</script>
<style scoped>
.v-progress-bar__track { width: 100%; height: 4px; background: var(--bg-surface-2); border-radius: var(--radius-full); overflow: hidden; }
.v-progress-bar__fill { height: 100%; background: linear-gradient(135deg, var(--gold-bright), var(--gold-core)); border-radius: var(--radius-full); transition: width var(--motion-normal); }
.v-progress-bar__fill--indeterminate { width: 40% !important; animation: progress-indeterminate 1.5s ease-in-out infinite; }
.v-progress-bar__label { font-size: 12px; color: var(--text-secondary); }
@keyframes progress-indeterminate { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }
</style>
