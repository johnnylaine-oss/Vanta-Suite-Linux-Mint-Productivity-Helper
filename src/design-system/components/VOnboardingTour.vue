<template>
  <teleport to="body">
    <transition name="v-modal">
      <div v-if="visible" class="tour-overlay">
        <div
          class="tour-spotlight"
          :style="spotlightStyle"
        />
        <div class="tour-card v-glass" :style="cardStyle">
          <div class="tour-card__step">{{ currentStep + 1 }} / {{ steps.length }}</div>
          <h3 class="tour-card__title">{{ current.title }}</h3>
          <p class="tour-card__desc">{{ current.description }}</p>
          <div class="tour-card__actions">
            <button class="tour-card__skip v-focus-ring" @click="skip">Skip tour</button>
            <div class="tour-card__nav">
              <VButton
                v-if="currentStep > 0"
                variant="secondary"
                size="sm"
                @click="prev"
              >Back</VButton>
              <VButton
                v-if="currentStep < steps.length - 1"
                variant="primary"
                size="sm"
                @click="next"
              >Next</VButton>
              <VButton
                v-else
                variant="primary"
                size="sm"
                @click="finish"
              >Got it!</VButton>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import VButton from './VButton.vue';

const props = defineProps({
  visible: { type: Boolean, default: false },
});
const emit = defineEmits(['update:visible', 'close', 'finish']);

const currentStep = ref(0);
const targetRect = ref({ top: 100, left: 100, width: 200, height: 40 });

const steps = [
  {
    title: 'Welcome to Vanta Suite',
    description: 'A keyboard-first productivity suite for Linux Mint Cinnamon. Let me show you around in 5 quick steps.',
    target: null, // centered
  },
  {
    title: 'Command Palette',
    description: 'Press Super+Space to open the Command Palette — your gateway to everything. Search commands, launch apps, run scripts, and more.',
    target: null,
  },
  {
    title: 'Navigation Sidebar',
    description: 'Use the sidebar to switch between modules: Terminal, Clipboard, Reminders, and more. Each module is a specialized tool.',
    target: '.app-sidebar',
  },
  {
    title: 'Terminal & Quake Mode',
    description: 'Press Super+` to open a Quake-style dropdown terminal anywhere. Multiple tabs, Vanta Gold theme, and full PTY support.',
    target: null,
  },
  {
    title: 'Customize & Extend',
    description: 'Create custom commands in Settings, build multi-step Workflows, and install Plugins to add new capabilities.',
    target: null,
  },
];

const current = computed(() => steps[currentStep.value] || steps[0]);

function next() { if (currentStep.value < steps.length - 1) currentStep.value++; }
function prev() { if (currentStep.value > 0) currentStep.value--; }
function skip() { emit('update:visible', false); emit('close'); }
function finish() { emit('update:visible', false); emit('close'); emit('finish'); }

// Spotlight and card positioning
const spotlightStyle = computed(() => {
  if (!current.value.target) return { display: 'none' };
  const r = targetRect.value;
  return {
    top: `${r.top - 8}px`,
    left: `${r.left - 8}px`,
    width: `${r.width + 16}px`,
    height: `${r.height + 16}px`,
  };
});

const cardStyle = computed(() => {
  if (!current.value.target) {
    return {
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }
  const r = targetRect.value;
  const top = r.bottom + 16;
  const left = Math.max(16, r.left);
  return { top: `${top}px`, left: `${left}px` };
});

function tryFindTarget() {
  if (current.value.target && typeof document !== 'undefined') {
    const el = document.querySelector(current.value.target);
    if (el) targetRect.value = el.getBoundingClientRect();
  }
}

watch(currentStep, () => {
  tryFindTarget();
});

watch(() => props.visible, (v) => {
  if (v) { currentStep.value = 0; tryFindTarget(); }
});

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', tryFindTarget);
  }
});
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', tryFindTarget);
  }
});
</script>

<style scoped>
.tour-overlay {
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(2px);
}
.tour-spotlight {
  position: fixed;
  border-radius: var(--radius-md);
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.55), 0 0 20px rgba(212,175,55,0.15);
  pointer-events: none;
  z-index: 3001;
  transition: all 0.35s ease-out;
}
.tour-card {
  position: fixed; z-index: 3002;
  width: 340px; padding: var(--space-5);
  border-radius: var(--radius-md);
  box-shadow: var(--elevation-3);
  transition: all 0.35s ease-out;
}
.tour-card__step {
  font-size: 11px; font-weight: 600;
  color: var(--gold-core); text-transform: uppercase;
  letter-spacing: 1px; margin-bottom: var(--space-2);
}
.tour-card__title {
  font-family: var(--font-body); font-size: 18px; font-weight: 600;
  color: var(--text-primary); margin: 0 0 var(--space-2);
}
.tour-card__desc {
  font-size: 14px; color: var(--text-secondary);
  line-height: 1.6; margin: 0 0 var(--space-5);
}
.tour-card__actions {
  display: flex; align-items: center; justify-content: space-between;
}
.tour-card__skip {
  background: none; border: none; color: var(--text-disabled);
  font-size: 13px; cursor: pointer; padding: 0;
  border-radius: var(--radius-sm);
}
.tour-card__skip:hover { color: var(--text-secondary); }
.tour-card__nav { display: flex; gap: var(--space-2); }
.v-modal-enter-active { transition: opacity 0.2s ease-out; }
.v-modal-leave-active { transition: opacity 0.15s ease-in; }
.v-modal-enter-from, .v-modal-leave-to { opacity: 0; }
</style>
