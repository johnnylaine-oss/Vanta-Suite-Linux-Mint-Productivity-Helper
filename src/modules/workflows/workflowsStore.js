import { defineStore } from 'pinia';

export const useWorkflowsStore = defineStore('workflows', {
  state: () => ({
    workflows: [],
    activeWorkflowId: null,
    activeWorkflowName: '',
    loading: false,
    showProgress: false,
    currentStep: 0,
    totalSteps: 0,
    progress: 0,
    lastError: '',
    _unsubscribers: [],
  }),
  actions: {
    async load() {
      this.loading = true;
      try {
        if (window.vanta) {
          this.workflows = await window.vanta.workflows.getAll() || [];
        }
      } catch {} finally {
        this.loading = false;
      }
    },
    async run(id) {
      const wf = this.workflows.find(w => w.id === id);
      if (!wf) return;

      this.activeWorkflowId = id;
      this.activeWorkflowName = wf.name;
      this.showProgress = true;
      this.currentStep = 0;
      this.totalSteps = (wf.steps || []).length;
      this.progress = 0;
      this.lastError = '';

      try {
        if (window.vanta) {
          await window.vanta.workflows.run(id);
        }
      } finally {
        this.activeWorkflowId = null;
        this.showProgress = false;
      }
    },
    subscribeToEvents() {
      if (!window.vanta) return;

      const u1 = window.vanta.workflows.onStepStarted((data) => {
        if (data.workflowId === this.activeWorkflowId) {
          this.currentStep = data.stepIndex;
          this.totalSteps = data.totalSteps;
          this.progress = ((data.stepIndex) / data.totalSteps) * 100;
        }
      });

      const u2 = window.vanta.workflows.onStepCompleted((data) => {
        if (data.workflowId === this.activeWorkflowId) {
          this.progress = (data.completedSteps / data.totalSteps) * 100;
          this.currentStep = data.stepIndex;
        }
      });

      const u3 = window.vanta.workflows.onCompleted((data) => {
        if (data.workflowId === this.activeWorkflowId) {
          this.progress = 100;
          this.activeWorkflowId = null;
          this.showProgress = false;
        }
      });

      if (u1) this._unsubscribers.push(u1);
      if (u2) this._unsubscribers.push(u2);
      if (u3) this._unsubscribers.push(u3);
    },
    unsubscribeFromEvents() {
      this._unsubscribers.forEach(fn => typeof fn === 'function' && fn());
      this._unsubscribers = [];
    },
    async add(w) {
      if (window.vanta) await window.vanta.workflows.add(w);
      this.workflows.push(w);
    },
    async remove(id) {
      if (window.vanta) await window.vanta.workflows.remove(id);
      this.workflows = this.workflows.filter(w => w.id !== id);
    },
  },
});
