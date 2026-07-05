<template>
  <div v-if="hasError" class="v-error-boundary" role="alert">
    <div class="v-error-boundary__card v-glass">
      <span class="v-error-boundary__icon">⚠️</span>
      <h3 class="v-error-boundary__title">Something went wrong</h3>
      <p class="v-error-boundary__msg">{{ error?.message || 'An unexpected error occurred' }}</p>
      <pre v-if="showDetails && error?.stack" class="v-error-boundary__stack"><code>{{ error.stack }}</code></pre>
      <div class="v-error-boundary__actions">
        <VButton variant="secondary" size="sm" @click="toggleDetails">
          {{ showDetails ? 'Hide' : 'Show' }} Details
        </VButton>
        <VButton variant="primary" size="sm" @click="retry">Try Again</VButton>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';
import VButton from './VButton.vue';

const hasError = ref(false);
const error = ref(null);
const showDetails = ref(false);

function toggleDetails() { showDetails.value = !showDetails.value; }
function retry() { hasError.value = false; error.value = null; }

onErrorCaptured((err, instance, info) => {
  console.error('[VErrorBoundary]', err, info);
  error.value = err;
  hasError.value = true;
  return false; // Prevent propagation
});
</script>

<style scoped>
.v-error-boundary {
  display: flex; align-items: center; justify-content: center;
  padding: var(--space-8); height: 100%;
}
.v-error-boundary__card {
  max-width: 480px; padding: var(--space-8);
  border-radius: var(--radius-lg); text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: var(--space-4);
}
.v-error-boundary__icon { font-size: 40px; }
.v-error-boundary__title {
  font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;
}
.v-error-boundary__msg {
  font-size: 14px; color: var(--text-secondary); margin: 0;
}
.v-error-boundary__stack {
  width: 100%; max-height: 200px; overflow: auto;
  background: var(--bg-void); padding: var(--space-4);
  border-radius: var(--radius-sm); text-align: left;
  margin: 0;
}
.v-error-boundary__stack code {
  font-family: var(--font-mono); font-size: 11px;
  color: var(--state-error); line-height: 1.6;
  white-space: pre-wrap; word-break: break-all;
}
.v-error-boundary__actions { display: flex; gap: var(--space-3); margin-top: var(--space-2); }
</style>
