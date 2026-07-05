<template>
  <div class="v-statusbar"><slot /></div>
</template>
<style scoped>
.v-statusbar { display: flex; align-items: center; justify-content: space-between; padding: var(--space-1) var(--space-4); background: var(--bg-surface); border-top: 1px solid var(--bg-hairline); font-size: 12px; color: var(--text-secondary); min-height: 28px; }
</style>
