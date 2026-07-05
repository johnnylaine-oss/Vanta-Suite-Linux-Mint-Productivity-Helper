<template>
  <div class="module-page">
    <VToolbar title="Settings" />
    <div class="module-body">
      <VSearchBox v-model="searchQuery" placeholder="Search settings..." />
      <div class="settings-sections">
        <VSettingsSection title="General">
          <VToggle v-model="store.settings.portableMode" label="Portable Mode" />
        </VSettingsSection>
        <VSettingsSection title="Appearance">
          <VToggle v-model="store.settings.darkMode" label="Dark Mode" @update:modelValue="store.toggleTheme" />
        </VSettingsSection>
        <VSettingsSection title="Startup">
          <VToggle v-model="store.settings.startupLaunchOnLogin" label="Launch on Login" />
          <VToggle v-model="store.settings.startupMinimized" label="Launch Minimized" />
        </VSettingsSection>
        <VSettingsSection title="AI Assistant">
          <VInput v-model="store.settings.ollamaHost" label="Ollama Host" placeholder="http://localhost:11434" />
        </VSettingsSection>
        <VSettingsSection title="Clipboard">
          <VInput v-model.number="store.settings.clipboardMaxItems" label="Max Items" type="number" />
        </VSettingsSection>
        <VSettingsSection title="Terminal">
          <VInput v-model="store.settings.terminalFontFamily" label="Font Family" />
          <VInput v-model.number="store.settings.terminalFontSize" label="Font Size" type="number" />
        </VSettingsSection>

        <!-- Custom Commands -->
        <VSettingsSection title="Custom Commands">
          <div class="commands-list">
            <div v-for="cmd in commands" :key="cmd.id" class="command-item">
              <div class="command-item__info">
                <span class="command-item__trigger">{{ cmd.trigger }}</span>
                <span class="command-item__category">{{ cmd.category }}</span>
                <span class="command-item__type">{{ cmd.action?.type }}</span>
              </div>
              <div class="command-item__actions">
                <VIconButton variant="ghost" size="sm" label="Edit" @click="editCommand(cmd)">✏️</VIconButton>
                <VIconButton variant="ghost" size="sm" label="Delete" @click="deleteCommand(cmd)">🗑️</VIconButton>
              </div>
            </div>
          </div>
          <VButton variant="primary" size="sm" @click="showCommandEditor = true; editingCommand = null" style="margin-top: 8px;">+ Add Command</VButton>
        </VSettingsSection>

        <VSettingsSection title="Data">
          <VButton variant="secondary" @click="store.exportAll()">Export All Settings</VButton>
          <VButton variant="secondary" @click="store.importAll()">Import Settings</VButton>
        </VSettingsSection>
      </div>
    </div>

    <!-- Command Editor Modal -->
    <VModal v-model:visible="showCommandEditor" :title="editingCommand ? 'Edit Command' : 'New Command'" :size="'md'">
      <div class="cmd-editor">
        <VInput v-model="cmdForm.trigger" label="Trigger" placeholder="e.g., invoice" />
        <VInput v-model="cmdForm.aliasesStr" label="Aliases (comma-separated)" placeholder="e.g., bills, invoices" />
        <label class="cmd-editor__label">Action type</label>
        <VDropdown v-model="cmdForm.actionType" :options="actionTypeOptions" placeholder="Select action type" />
        <VInput v-model="cmdForm.actionValue" :label="getActionLabel(cmdForm.actionType)" :placeholder="getActionPlaceholder(cmdForm.actionType)" />
        <VInput v-model="cmdForm.variablesStr" label="Variables (comma-separated, optional)" placeholder="e.g., value, duration" />
        <VInput v-model="cmdForm.icon" label="Icon (emoji)" placeholder="e.g., 📄" />
        <label class="cmd-editor__label">Category</label>
        <VDropdown v-model="cmdForm.category" :options="categoryOptions" placeholder="Select category" />
        <VCheckbox v-if="cmdForm.actionType === 'run-shell'" v-model="cmdForm.requiresConfirmation" label="Requires confirmation" />
        <VCheckbox v-model="cmdForm.promptForVariables" v-if="cmdForm.actionType === 'run-shell' || cmdForm.actionType === 'prompt-then-run'" label="Prompt for variables before running" />
        <div v-if="cmdForm.error" class="cmd-editor__error">{{ cmdForm.error }}</div>
      </div>
      <template #footer>
        <VButton variant="secondary" @click="showCommandEditor = false">Cancel</VButton>
        <VButton variant="primary" @click="saveCommand">Save Command</VButton>
      </template>
    </VModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import VToolbar from '../../design-system/components/VToolbar.vue';
import VButton from '../../design-system/components/VButton.vue';
import VIconButton from '../../design-system/components/VIconButton.vue';
import VInput from '../../design-system/components/VInput.vue';
import VDropdown from '../../design-system/components/VDropdown.vue';
import VCheckbox from '../../design-system/components/VCheckbox.vue';
import VSearchBox from '../../design-system/components/VSearchBox.vue';
import VToggle from '../../design-system/components/VToggle.vue';
import VModal from '../../design-system/components/VModal.vue';
import VSettingsSection from '../../design-system/components/VSettingsSection.vue';
import { useSettingsStore } from './settingsStore.js';
const store = useSettingsStore();
const searchQuery = ref('');

// Custom Commands
const commands = ref([]);
const showCommandEditor = ref(false);
const editingCommand = ref(null);
const cmdForm = reactive({
  trigger: '',
  aliasesStr: '',
  actionType: 'run-shell',
  actionValue: '',
  requiresConfirmation: false,
  variablesStr: '',
  promptForVariables: false,
  icon: '',
  category: 'Custom',
  error: '',
});

const actionTypeOptions = [
  { label: 'Run Shell Command', value: 'run-shell' },
  { label: 'Open App/Folder', value: 'open-path' },
  { label: 'Open URL', value: 'open-url' },
  { label: 'Prompt then Run', value: 'prompt-then-run' },
];

const categoryOptions = [
  { label: 'Custom', value: 'Custom' },
  { label: 'Apps', value: 'Apps' },
  { label: 'Files', value: 'Files' },
  { label: 'Folders', value: 'Folders' },
  { label: 'System', value: 'System' },
  { label: 'Utilities', value: 'Utilities' },
];

function getActionLabel(type) {
  const map = { 'run-shell': 'Shell Command', 'open-path': 'Path/Executable', 'open-url': 'URL', 'prompt-then-run': 'Shell Command Template' };
  return map[type] || 'Value';
}

function getActionPlaceholder(type) {
  const map = { 'run-shell': 'echo "hello"', 'open-path': '/usr/bin/firefox', 'open-url': 'https://example.com', 'prompt-then-run': 'echo "The value is {input}"' };
  return map[type] || '';
}

async function loadCommands() {
  try {
    if (window.vanta) {
      commands.value = await window.vanta.commands.getAll() || [];
    }
  } catch {}
}

function editCommand(cmd) {
  editingCommand.value = cmd;
  cmdForm.trigger = cmd.trigger;
  cmdForm.aliasesStr = (cmd.aliases || []).join(', ');
  cmdForm.actionType = cmd.action?.type || 'run-shell';
  cmdForm.actionValue = cmd.action?.value || '';
  cmdForm.requiresConfirmation = cmd.action?.requiresConfirmation || false;
  cmdForm.variablesStr = (cmd.action?.variables || []).join(', ');
  cmdForm.promptForVariables = cmd.action?.type === 'prompt-then-run' || (cmd.action?.promptFor?.length > 0);
  cmdForm.icon = cmd.icon || '';
  cmdForm.category = cmd.category || 'Custom';
  cmdForm.error = '';
  showCommandEditor.value = true;
}

async function saveCommand() {
  cmdForm.error = '';

  if (!cmdForm.trigger.trim()) {
    cmdForm.error = 'Trigger is required';
    return;
  }

  // Determine action type based on promptForVariables flag
  const effectiveType = cmdForm.promptForVariables && cmdForm.actionType === 'run-shell'
    ? 'prompt-then-run'
    : cmdForm.actionType;

  const aliases = cmdForm.aliasesStr.split(',').map(a => a.trim()).filter(Boolean);
  const variables = cmdForm.variablesStr.split(',').map(v => v.trim()).filter(Boolean);
  const promptFor = cmdForm.promptForVariables ? variables : [];

  const command = {
    id: editingCommand.value?.id || `cmd-${Date.now()}`,
    trigger: cmdForm.trigger.trim(),
    aliases,
    category: cmdForm.category,
    icon: cmdForm.icon.trim() || '⚡',
    action: {
      type: effectiveType,
      value: cmdForm.actionValue.trim(),
      requiresConfirmation: cmdForm.requiresConfirmation,
      variables,
      promptFor,
    },
  };

  let result;
  if (editingCommand.value) {
    result = await window.vanta?.commands?.update(editingCommand.value.id, command);
  } else {
    result = await window.vanta?.commands?.add(command);
  }

  if (result?.success) {
    showCommandEditor.value = false;
    editingCommand.value = null;
    loadCommands();
  } else {
    cmdForm.error = result?.error || 'Failed to save command';
  }
}

async function deleteCommand(cmd) {
  await window.vanta?.commands?.remove(cmd.id);
  loadCommands();
}

onMounted(() => {
  store.load();
  loadCommands();
});

// Persist startup toggles back to settings.startup.* — dot-path keys. The daemon
// applies the XDG autostart entry on `startup.launchOnLogin` changes.
watch(() => store.settings.startupLaunchOnLogin, (v) => {
  store.save('startup.launchOnLogin', v);
});
watch(() => store.settings.startupMinimized, (v) => {
  store.save('startup.launchMinimized', v);
});
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; height: 100%; }
.module-body { flex: 1; overflow-y: auto; padding: var(--space-4); }
.settings-sections { margin-top: var(--space-4); }
.commands-list { display: flex; flex-direction: column; gap: var(--space-2); }
.command-item { display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-3); background: var(--bg-surface-2); border: 1px solid var(--bg-hairline); border-radius: var(--radius-sm); }
.command-item__info { display: flex; gap: var(--space-3); align-items: center; }
.command-item__trigger { font-family: var(--font-mono); font-size: 14px; color: var(--gold-core); font-weight: 500; }
.command-item__category { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
.command-item__type { font-size: 12px; color: var(--text-disabled); }
.command-item__actions { display: flex; gap: var(--space-1); }
.cmd-editor { display: flex; flex-direction: column; gap: var(--space-3); }
.cmd-editor__error { color: var(--state-error); font-size: 13px; padding: var(--space-2); background: rgba(196, 107, 95, 0.1); border-radius: var(--radius-sm); }
.cmd-editor__label { font-size: 13px; font-weight: 500; color: var(--text-secondary); letter-spacing: 0.06em; text-transform: uppercase; }
</style>
