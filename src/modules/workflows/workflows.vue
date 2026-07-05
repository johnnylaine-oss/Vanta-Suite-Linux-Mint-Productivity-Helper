<template>
  <div class="module-page">
    <VToolbar title="Workflows">
      <template #right>
        <VButton variant="primary" size="sm" @click="showEditor = true; editingWorkflow = null">Add Workflow</VButton>
      </template>
    </VToolbar>
    <div class="module-body">
      <VListView>
        <div v-for="w in store.workflows" :key="w.id" class="workflow-item">
          <VWorkflowCard
            :name="w.name"
            :description="w.description"
            :icon="w.icon"
            :step-count="(w.steps || []).length"
            :running="w.id === store.activeWorkflowId"
            :progress="w.id === store.activeWorkflowId ? store.progress : 0"
            :current-step="store.currentStep"
            @click="editWorkflow(w)"
          />
          <div class="workflow-item__actions">
            <VButton variant="primary" size="sm" @click.stop="store.run(w.id)">Run</VButton>
            <VIconButton variant="ghost" size="sm" label="Edit" @click.stop="editWorkflow(w)">✏️</VIconButton>
            <VIconButton variant="ghost" size="sm" label="Delete" @click.stop="deleteWorkflow(w)">🗑️</VIconButton>
          </div>
        </div>
      </VListView>
      <div v-if="store.workflows.length === 0" class="empty-state">
        <p>No workflows yet. Create one to automate multi-step tasks.</p>
      </div>
    </div>

    <!-- Workflow Editor Modal -->
    <VModal v-model:visible="showEditor" :title="editingWorkflow ? 'Edit Workflow' : 'New Workflow'" :size="'lg'">
      <div class="wf-editor">
        <VInput v-model="editForm.name" label="Name" placeholder="e.g., Coding" />
        <VInput v-model="editForm.description" label="Description" placeholder="What does this workflow do?" />
        <VInput v-model="editForm.icon" label="Icon (emoji)" placeholder="e.g., 💻" />

        <div class="wf-editor__steps">
          <h3 class="wf-editor__subtitle">Steps ({{ editForm.steps.length }})</h3>
          <div v-for="(step, i) in editForm.steps" :key="i" class="wf-step-card">
            <div class="wf-step-card__header">
              <span class="wf-step-card__num">#{{ i + 1 }}</span>
              <VDropdown v-model="step.type" :options="stepTypeOptions" placeholder="Action type" />
              <VIconButton variant="ghost" size="sm" label="Remove" @click="removeStep(i)">×</VIconButton>
            </div>
            <div class="wf-step-card__body">
              <VInput v-model="step.value" :label="getStepLabel(step.type)" :placeholder="getStepPlaceholder(step.type)" />
              <VCheckbox v-if="step.type === 'run-shell'" v-model="step.requiresConfirmation" label="Requires confirmation" />
            </div>
          </div>
          <VButton variant="secondary" size="sm" @click="addStep">+ Add Step</VButton>
        </div>

        <div v-if="editForm.error" class="wf-editor__error">{{ editForm.error }}</div>
      </div>
      <template #footer>
        <VButton variant="secondary" @click="showEditor = false">Cancel</VButton>
        <VButton variant="primary" @click="saveWorkflow">Save Workflow</VButton>
      </template>
    </VModal>

    <!-- Running workflow progress -->
    <VModal v-model:visible="store.showProgress" :title="'Running: ' + store.activeWorkflowName" :size="'sm'" :closeOnBackdrop="false">
      <VProgressBar :percent="store.progress" :label="`Step ${store.currentStep + 1} of ${store.totalSteps}`" />
      <p v-if="store.lastError" class="wf-error">{{ store.lastError }}</p>
    </VModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import VToolbar from '../../design-system/components/VToolbar.vue';
import VButton from '../../design-system/components/VButton.vue';
import VIconButton from '../../design-system/components/VIconButton.vue';
import VInput from '../../design-system/components/VInput.vue';
import VDropdown from '../../design-system/components/VDropdown.vue';
import VCheckbox from '../../design-system/components/VCheckbox.vue';
import VModal from '../../design-system/components/VModal.vue';
import VListView from '../../design-system/components/VListView.vue';
import VWorkflowCard from '../../design-system/components/VWorkflowCard.vue';
import VProgressBar from '../../design-system/components/VProgressBar.vue';
import { useWorkflowsStore } from './workflowsStore.js';
const store = useWorkflowsStore();

const showEditor = ref(false);
const editingWorkflow = ref(null);
const editForm = reactive({
  name: '',
  description: '',
  icon: '',
  steps: [],
  error: '',
});

const stepTypeOptions = [
  { label: 'Open App/Folder', value: 'open-path' },
  { label: 'Open URL', value: 'open-url' },
  { label: 'Run Shell Command', value: 'run-shell' },
  { label: 'Switch Workspace', value: 'switch-workspace' },
  { label: 'Focus Window', value: 'focus-window' },
  { label: 'Toggle Focus Mode', value: 'toggle-focus-mode' },
  { label: 'Create Timer', value: 'create-timer' },
];

function getStepLabel(type) {
  const map = {
    'open-path': 'Path / Executable',
    'open-url': 'URL',
    'run-shell': 'Shell Command',
    'switch-workspace': 'Workspace Number',
    'focus-window': 'Window Title',
    'toggle-focus-mode': '(no value needed)',
    'create-timer': 'Duration (e.g., 25m)',
  };
  return map[type] || 'Value';
}

function getStepPlaceholder(type) {
  const map = {
    'open-path': '/usr/bin/firefox',
    'open-url': 'https://example.com',
    'run-shell': 'echo "hello"',
    'switch-workspace': '2',
    'focus-window': 'VS Code',
    'toggle-focus-mode': '',
    'create-timer': '25m',
  };
  return map[type] || '';
}

function addStep() {
  editForm.steps.push({ type: 'open-path', value: '', requiresConfirmation: false });
}

function removeStep(index) {
  editForm.steps.splice(index, 1);
}

function editWorkflow(workflow) {
  editingWorkflow.value = workflow;
  editForm.name = workflow.name;
  editForm.description = workflow.description || '';
  editForm.icon = workflow.icon || '';
  editForm.steps = JSON.parse(JSON.stringify(workflow.steps || []));
  editForm.error = '';
  showEditor.value = true;
}

async function saveWorkflow() {
  editForm.error = '';

  if (!editForm.name.trim()) {
    editForm.error = 'Name is required';
    return;
  }

  const workflow = {
    id: editingWorkflow.value?.id || `workflow-${Date.now()}`,
    name: editForm.name.trim(),
    description: editForm.description.trim(),
    icon: editForm.icon.trim() || '⚡',
    steps: editForm.steps.filter(s => {
      if (['toggle-focus-mode'].includes(s.type)) return true;
      return s.value.trim().length > 0;
    }),
  };

  if (workflow.steps.length === 0) {
    editForm.error = 'At least one step is required';
    return;
  }

  let result;
  if (editingWorkflow.value) {
    result = await window.vanta?.workflows?.update(editingWorkflow.value.id, workflow);
  } else {
    result = await window.vanta?.workflows?.add(workflow);
  }

  if (result?.success) {
    showEditor.value = false;
    editingWorkflow.value = null;
    store.load();
  } else {
    editForm.error = result?.error || 'Failed to save workflow';
  }
}

async function deleteWorkflow(workflow) {
  await window.vanta?.workflows?.remove(workflow.id);
  store.load();
}

// Listen for workflow progress events
onMounted(() => {
  store.subscribeToEvents();
});
onUnmounted(() => {
  store.unsubscribeFromEvents();
});

store.load();
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; height: 100%; }
.module-body { flex: 1; padding: var(--space-4); overflow-y: auto; }
.workflow-item { display: flex; align-items: flex-start; gap: var(--space-3); }
.workflow-item > :first-child { flex: 1; }
.workflow-item__actions { display: flex; gap: var(--space-1); padding-top: var(--space-2); flex-shrink: 0; }
.empty-state { display: flex; align-items: center; justify-content: center; height: 200px; color: var(--text-disabled); }
.wf-editor { display: flex; flex-direction: column; gap: var(--space-4); }
.wf-editor__steps { display: flex; flex-direction: column; gap: var(--space-3); }
.wf-editor__subtitle { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0; }
.wf-step-card { background: var(--bg-surface-2); border: 1px solid var(--bg-hairline); border-radius: var(--radius-sm); padding: var(--space-3); display: flex; flex-direction: column; gap: var(--space-2); }
.wf-step-card__header { display: flex; align-items: center; gap: var(--space-2); }
.wf-step-card__num { font-family: var(--font-mono); font-size: 12px; color: var(--gold-core); font-weight: 600; }
.wf-step-card__body { display: flex; flex-direction: column; gap: var(--space-2); padding-left: var(--space-6); }
.wf-editor__error { color: var(--state-error); font-size: 13px; padding: var(--space-2); background: rgba(196, 107, 95, 0.1); border-radius: var(--radius-sm); }
.wf-error { color: var(--state-error); font-size: 14px; margin-top: var(--space-3); }
</style>
