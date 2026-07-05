<template>
  <div class="app-shell" :data-theme="theme">
    <VWindow
      :title="'Vanta Suite'"
      :focused="true"
      @minimize="onMinimize"
      @maximize="onMaximize"
      @close="onClose"
    >
      <div class="app-layout">
        <aside class="app-sidebar">
          <nav class="app-nav">
            <VIconButton
              v-for="item in navItems"
              :key="item.id"
              :active="activeModule === item.id"
              :label="item.label"
              size="lg"
              @click="navigateTo(item.id)"
            >
              {{ item.icon }}
            </VIconButton>
          </nav>
        </aside>
        <main class="app-main">
          <VErrorBoundary>
            <transition name="page-fade" mode="out-in">
              <component :is="activeComponent" v-if="activeComponent" :key="activeModule" />
              <div v-else key="welcome" class="app-welcome">                <h1 class="app-welcome__title">Vanta Suite</h1>
                <p class="app-welcome__subtitle">Press <kbd>Ctrl+Space</kbd> to open the Command Palette</p>
                <div class="app-welcome__actions">
                  <VButton variant="primary" @click="navigateTo('settings')">Open Settings</VButton>
                  <VButton variant="secondary" @click="navigateTo('favorites')">Favorites</VButton>
                  <VButton variant="secondary" @click="tourVisible = true">Take the Tour</VButton>
                </div>
              </div>
            </transition>
          </VErrorBoundary>
        </main>
      </div>

      <VStatusBar>
        <span>{{ theme === 'dark' ? '🌙' : '☀️' }} {{ activeModule || 'Home' }}</span>
        <span class="app-statusbar__right">
          <span class="app-statusbar__version">Vanta Suite v1.0.0</span>
          <VIconButton
            size="sm"
            variant="ghost"
            label="Minimize to tray"
            class="app-statusbar__minimize"
            @click="onMinimizeToTray"
          >
            &#x2014;
          </VIconButton>
        </span>
      </VStatusBar>
    </VWindow>

    <!-- Command Palette overlay -->
    <VCommandPalette
      v-model:visible="paletteVisible"
      :commands="allCommands"
      @execute="onCommandExecute"
    />

    <!-- Keyboard Shortcuts overlay -->
    <VShortcutsOverlay v-model:visible="shortcutsVisible" />

    <!-- Onboarding tour -->
    <VOnboardingTour v-model:visible="tourVisible" @finish="onTourFinish" />

    <!-- Variable prompt modal -->
    <VModal v-model:visible="variablePrompt.visible" :title="'Enter Value'" :size="'sm'" @close="cancelVariablePrompt">
      <div class="var-prompt">
        <p class="var-prompt__label">Enter value for <strong>{{ variablePrompt.varName }}</strong>:</p>
        <VInput v-model="variablePrompt.input" :placeholder="'e.g., 50'" @keydown.enter="submitVariablePrompt" />
        <div class="var-prompt__actions">
          <VButton variant="secondary" @click="cancelVariablePrompt">Cancel</VButton>
          <VButton variant="primary" @click="submitVariablePrompt">Execute</VButton>
        </div>
      </div>
    </VModal>

    <!-- Command confirmation modal -->
    <VModal v-model:visible="confirmModal.visible" :title="'Confirm Action'" :size="'sm'" @close="confirmModal.reject">
      <p>{{ confirmModal.message }}</p>
      <p class="confirm-modal__detail"><code>{{ confirmModal.detail }}</code></p>
      <template #footer>
        <VButton variant="secondary" @click="confirmModal.reject">Cancel</VButton>
        <VButton variant="primary" @click="confirmModal.resolve">Execute</VButton>
      </template>
    </VModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, shallowRef, reactive } from 'vue';
import VWindow from '../design-system/components/VWindow.vue';
import VIconButton from '../design-system/components/VIconButton.vue';
import VButton from '../design-system/components/VButton.vue';
import VInput from '../design-system/components/VInput.vue';
import VModal from '../design-system/components/VModal.vue';
import VStatusBar from '../design-system/components/VStatusBar.vue';
import VCommandPalette from '../design-system/components/VCommandPalette.vue';
import VShortcutsOverlay from '../design-system/components/VShortcutsOverlay.vue';
import VOnboardingTour from '../design-system/components/VOnboardingTour.vue';
import VErrorBoundary from '../design-system/components/VErrorBoundary.vue';

// State
const activeModule = ref('');
const paletteVisible = ref(false);
const shortcutsVisible = ref(false);
const tourVisible = ref(false);
const theme = ref('dark');

// Lazy-loaded module components
const moduleComponents = shallowRef({});

// All commands for the palette
const allCommands = ref([]);

// --- Variable Prompting State ---
const variablePrompt = reactive({
  visible: false,
  varName: '',
  input: '',
  pendingCommand: null,
  resolve: null,
});

// --- Confirmation Modal State ---
const confirmModal = reactive({
  visible: false,
  message: '',
  detail: '',
  resolve: null,
  reject: null,
});

// Navigation items
const navItems = [
  { id: 'favorites', label: 'Favorites', icon: '⭐' },
  { id: 'terminal', label: 'Terminal', icon: '>' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: '✨' },
  { id: 'clipboard', label: 'Clipboard', icon: '📋' },
  { id: 'reminders', label: 'Reminders', icon: '⏰' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'workflows', label: 'Workflows', icon: '⚡' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const activeComponent = computed(() => moduleComponents.value[activeModule.value] || null);

async function loadCommands() {
  try {
    if (window.vanta) {
      const cmds = await window.vanta.commands.getAll();
      if (cmds && cmds.length > 0) {
        allCommands.value = cmds;
      }
    }
  } catch {}
  // Use default commands if API not available or empty
  if (allCommands.value.length === 0) {
    allCommands.value = getDefaultCommands();
  }
}

function getDefaultCommands() {
  return [
    { id: 'settings', trigger: 'settings', aliases: ['config', 'preferences'], category: 'Vanta Suite', icon: '⚙️', action: { type: 'open-module', value: 'settings' } },
    { id: 'clipboard', trigger: 'clipboard', aliases: ['clip'], category: 'Vanta Suite', icon: '📋', action: { type: 'open-module', value: 'clipboard' } },
    { id: 'terminal', trigger: 'terminal', aliases: ['term', 'shell'], category: 'Vanta Suite', icon: '>', action: { type: 'open-module', value: 'terminal' } },
    { id: 'ai', trigger: 'ai', aliases: ['assistant', 'chat'], category: 'Vanta Suite', icon: '✨', action: { type: 'open-module', value: 'ai-assistant' } },
    { id: 'focus-mode', trigger: 'focus mode', aliases: ['dnd', 'silent'], category: 'Vanta Suite', icon: '🔕', action: { type: 'toggle-focus-mode' } },
    { id: 'shutdown', trigger: 'shutdown', aliases: ['power off'], category: 'System', icon: '⏻', action: { type: 'run-shell', value: 'shutdown now', requiresConfirmation: true } },
    { id: 'restart', trigger: 'restart', aliases: ['reboot'], category: 'System', icon: '🔄', action: { type: 'run-shell', value: 'reboot', requiresConfirmation: true } },
    { id: 'sleep', trigger: 'sleep', aliases: ['suspend'], category: 'System', icon: '🌙', action: { type: 'run-shell', value: 'systemctl suspend' } },
    { id: 'lock', trigger: 'lock', aliases: ['lock screen'], category: 'System', icon: '🔒', action: { type: 'run-shell', value: 'cinnamon-screensaver-command --lock' } },
    { id: 'calculator', trigger: 'calculator', aliases: ['calc'], category: 'Utilities', icon: '🔢', action: { type: 'open-path', value: '/usr/bin/gnome-calculator' } },
    { id: 'timer', trigger: 'timer', aliases: ['countdown'], category: 'Utilities', icon: '⏱️', action: { type: 'create-timer', variables: ['duration'] } },
    { id: 'volume', trigger: 'volume', aliases: ['vol'], category: 'System', icon: '🔊', action: { type: 'run-shell', value: 'pactl set-sink-volume @DEFAULT_SINK@ {value}%', variables: ['value'] } },
    { id: 'wifi', trigger: 'wifi', aliases: ['network'], category: 'System', icon: '📶', action: { type: 'run-shell', value: 'nmcli radio wifi' } },
    { id: 'bluetooth', trigger: 'bluetooth', aliases: ['bt'], category: 'System', icon: '📡', action: { type: 'run-shell', value: 'bluetoothctl power' } },
    { id: 'brightness', trigger: 'brightness', aliases: ['bright'], category: 'System', icon: '☀️', action: { type: 'run-shell', value: 'brightnessctl set {value}%', variables: ['value'] } },
    { id: 'downloads', trigger: 'downloads', aliases: ['dl'], category: 'Folders', icon: '📥', action: { type: 'open-path', value: '$HOME/Downloads' } },
    { id: 'notes', trigger: 'notes', aliases: ['notepad'], category: 'Folders', icon: '📝', action: { type: 'open-path', value: '$HOME/Documents/Notes' } },
    { id: 'chrome', trigger: 'chrome', aliases: ['google', 'browser', 'web'], category: 'Apps', icon: '🌐', action: { type: 'open-path', value: '/usr/bin/google-chrome-stable' } },
    { id: 'firefox', trigger: 'firefox', aliases: ['ff'], category: 'Apps', icon: '🦊', action: { type: 'open-path', value: '/usr/bin/firefox' } },
  ];
}

function navigateTo(module) {
  activeModule.value = module;
  if (!moduleComponents.value[module]) {
    importModule(module);
  }
}

async function importModule(module) {
  try {
    const mod = await import(`../modules/${module}/${module}.vue`);
    moduleComponents.value = { ...moduleComponents.value, [module]: mod.default };
  } catch (e) {
    console.warn(`Module not yet implemented: ${module}`);
    moduleComponents.value = { ...moduleComponents.value, [module]: null };
  }
}

// --- Command Execution with Variable Prompting ---
const variableQueue = [];
let isProcessingQueue = false;

async function onCommandExecute(command) {
  // Handle module navigation directly (no IPC needed)
  if (command.action?.type === 'open-module') {
    navigateTo(command.action.value);
    paletteVisible.value = false;
    return;
  }

  paletteVisible.value = false;

  // Check if command requires variable input
  const neededVars = command.action?.variables || [];
  if (neededVars.length > 0) {
    for (const varName of neededVars) {
      const value = await promptForVariable(varName);
      if (value === null) return; // User cancelled
      command._variables = command._variables || {};
      command._variables[varName] = value;
    }
  }

  // Execute via IPC
  await executeCommandViaIPC(command);
}

async function executeCommandViaIPC(command) {
  try {
    if (!window.vanta) {
      console.warn('Vanta API not available');
      return;
    }

    const result = await window.vanta.commands.execute(command.id, {
      variables: command._variables || {},
    });

    // Handle variable prompting from the server-side
    if (result?.expectingVariables) {
      const vars = {};
      for (const varName of result.expectingVariables) {
        const value = await promptForVariable(varName);
        if (value === null) return;
        vars[varName] = value;
      }
      // Retry with variables
      const retryResult = await window.vanta.commands.execute(command.id, { variables: vars });
      handleExecutionResult(retryResult);
    } else {
      handleExecutionResult(result);
    }
  } catch (err) {
    console.error('Command execution failed:', err);
  }
}

function handleExecutionResult(result) {
  if (result?.cancelled) return;
  if (result?.error) {
    showConfirmation('Command failed', result.error);
  }
}

// --- Variable Prompt ---

function promptForVariable(varName) {
  return new Promise((resolve) => {
    variablePrompt.visible = true;
    variablePrompt.varName = varName;
    variablePrompt.input = '';
    variablePrompt.resolve = resolve;
  });
}

function submitVariablePrompt() {
  const value = variablePrompt.input.trim();
  variablePrompt.visible = false;
  if (variablePrompt.resolve) {
    variablePrompt.resolve(value || null);
    variablePrompt.resolve = null;
  }
}

function cancelVariablePrompt() {
  variablePrompt.visible = false;
  if (variablePrompt.resolve) {
    variablePrompt.resolve(null);
    variablePrompt.resolve = null;
  }
}

// --- Confirmation Modal ---

function showConfirmation(message, detail = '') {
  return new Promise((resolve, reject) => {
    confirmModal.visible = true;
    confirmModal.message = message;
    confirmModal.detail = detail;
    confirmModal.resolve = () => { confirmModal.visible = false; resolve(true); };
    confirmModal.reject = () => { confirmModal.visible = false; resolve(false); };
  });
}

// --- Window controls ---
// In this daemon model, minimize/close both hide() the window — the app
// stays alive and reappears from the tray icon on the right of the Linux
// Mint bottom panel (same paradigm as WhatsApp, Slack, etc.).
function onMinimize() { window.vanta?.window?.hide(); }
function onMinimizeToTray() { window.vanta?.window?.hide(); }
function onMaximize() { window.vanta?.window?.maximize(); }
function onClose() { window.vanta?.window?.hide(); }

// --- Onboarding ---
function onTourFinish() {
  window.vanta?.settings?.set('onboardingComplete', true);
}

// --- Hotkey handler ---
function handleHotkey(action) {
  if (action === 'command-palette') {
    paletteVisible.value = !paletteVisible.value;
  } else if (action === 'keyboard-shortcuts') {
    shortcutsVisible.value = !shortcutsVisible.value;
  } else if (action === 'start-tour') {
    tourVisible.value = true;
  } else if (action.startsWith('open-group-')) {
    navigateTo('favorites');
  } else if (action === 'toggle-quake-terminal') {
    navigateTo('terminal');
  } else if (action === 'settings') {
    navigateTo('settings');
  } else if (action === 'clipboard') {
    navigateTo('clipboard');
  } else if (action === 'notifications') {
    navigateTo('notifications');
  } else if (action === 'ai-assistant') {
    navigateTo('ai-assistant');
  } else if (action === 'focus-mode') {
    // Toggle focus mode via IPC
    window.vanta?.commands?.execute('focus-mode');
  }
}

onMounted(async () => {
  loadCommands();

  window.vanta?.on?.('hotkey:pressed', handleHotkey);

  window.vanta?.on?.('module:open', (module) => {
    navigateTo(module);
  });

  // Listen for IPC events (COMMAND_EXECUTE_REQUESTED, MODULE_OPEN_REQUESTED)
  window.vanta?.on?.('command:execute-requested', (commandId, context) => {
    // Find command and execute
  });
  window.vanta?.on?.('module:open-requested', (module) => {
    navigateTo(module);
  });

  const onKeydown = (e) => {
    // App-focused shortcut forwarding: send modifier combos to main process
    if (e.ctrlKey || e.altKey || e.metaKey) {
      const parts = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');
      if (e.metaKey) parts.push('Meta');
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
        parts.push(key);
        const accel = parts.join('+');
        window.vanta?.window?.sendHotkey?.(accel);
      }
    }

    if (e.key === 'Escape' && paletteVisible.value) {
      paletteVisible.value = false;
    }
    if (e.key === 'Escape' && shortcutsVisible.value) {
      shortcutsVisible.value = false;
    }

    // Keyboard shortcuts overlay: Ctrl+K S
    if (e.ctrlKey && e.key === 'k') {
      openingShortcut = true;
      setTimeout(() => { openingShortcut = false; }, 1000);
    } else if (openingShortcut && e.key === 's') {
      e.preventDefault();
      shortcutsVisible.value = !shortcutsVisible.value;
      openingShortcut = false;
    }
  };
  let openingShortcut = false;
  window.addEventListener('keydown', onKeydown);

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown);
  });
});
</script>

<style scoped>
.app-shell {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-layout { display: flex; flex: 1; min-height: 0; }
.app-sidebar { width: 56px; background: var(--bg-surface); border-right: 1px solid var(--bg-hairline); display: flex; flex-direction: column; align-items: center; padding: var(--space-3) 0; flex-shrink: 0; }
.app-nav { display: flex; flex-direction: column; gap: var(--space-1); align-items: center; }
.app-main { flex: 1; min-width: 0; overflow: auto; }
.app-welcome { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; padding: var(--space-8); }
.app-welcome__title { font-family: var(--font-display); font-size: 56px; font-weight: 600; background: linear-gradient(135deg, #F4D68C 0%, #D4AF37 45%, #A67C27 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0 0 var(--space-4); }
.app-welcome__subtitle { font-size: 16px; color: var(--text-secondary); margin: 0 0 var(--space-8); }
.app-welcome__subtitle kbd { background: var(--bg-surface-2); border: 1px solid var(--bg-hairline); border-radius: var(--radius-sm); padding: 2px 8px; font-family: var(--font-mono); font-size: 13px; color: var(--gold-core); }
.app-welcome__actions { display: flex; gap: var(--space-3); flex-wrap: wrap; justify-content: center; }
.var-prompt { display: flex; flex-direction: column; gap: var(--space-4); }
.var-prompt__label { color: var(--text-primary); font-size: 14px; margin: 0; }
.var-prompt__label strong { color: var(--gold-core); }
.var-prompt__actions { display: flex; gap: var(--space-2); justify-content: flex-end; margin-top: var(--space-3); }
.confirm-modal__detail { margin-top: var(--space-3); }
.confirm-modal__detail code { font-family: var(--font-mono); font-size: 13px; color: var(--gold-core); background: var(--bg-surface-2); padding: var(--space-2) var(--space-3); border-radius: var(--radius-sm); display: block; word-break: break-all; }
.app-statusbar__right { display: inline-flex; align-items: center; gap: var(--space-1); }
.app-statusbar__version { color: var(--text-tertiary); }

/* Page transitions */
.page-fade-enter-active { transition: opacity 0.15s ease-out, transform 0.15s ease-out; }
.page-fade-leave-active { transition: opacity 0.1s ease-in, transform 0.1s ease-in; }
.page-fade-enter-from { opacity: 0; transform: translateY(6px); }
.page-fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
