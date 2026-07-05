<template>
  <div class="module-page">
    <VToolbar title="Plugins" />
    <div class="module-body">
      <!-- Marketplace section -->
      <section class="plugins-section">
        <h3 class="plugins-section__title">Marketplace</h3>
        <p class="plugins-section__desc">Extend Vanta Suite with plugins — new commands, workflows, AI tools, and settings.</p>

        <div v-if="store.loading" class="plugins-loading">Loading plugins...</div>

        <div v-else class="plugins-grid">
          <article
            v-for="plugin in store.plugins"
            :key="plugin.id"
            class="plugin-card v-glass"
            :class="{ 'plugin-card--installed': plugin.installed, 'plugin-card--disabled': plugin.status === 'disabled' }"
          >
            <div class="plugin-card__header">
              <span class="plugin-card__icon">{{ getIcon(plugin) }}</span>
              <div class="plugin-card__info">
                <h4 class="plugin-card__name">{{ plugin.name }}</h4>
                <span class="plugin-card__version">v{{ plugin.version }}</span>
              </div>
              <span class="plugin-card__badge" :class="`plugin-card__badge--${plugin.status}`">
                {{ statusLabel(plugin) }}
              </span>
            </div>
            <p class="plugin-card__desc">{{ plugin.description || 'No description' }}</p>
            <div class="plugin-card__caps" v-if="plugin.capabilities?.length">
              <span v-for="cap in plugin.capabilities" :key="cap" class="plugin-card__cap">{{ cap }}</span>
            </div>
            <div class="plugin-card__actions">
              <template v-if="plugin.installed">
                <VButton
                  v-if="plugin.status === 'enabled' || plugin.status === 'loaded'"
                  size="sm" variant="secondary" @click="store.disable(plugin.id)"
                >Disable</VButton>
                <VButton
                  v-else-if="plugin.status === 'disabled'"
                  size="sm" variant="primary" @click="store.enable(plugin.id)"
                >Enable</VButton>
                <VButton
                  size="sm" variant="ghost" class="plugin-card__uninstall"
                  @click="confirmUninstall(plugin)"
                >Uninstall</VButton>
              </template>
              <template v-else>
                <VButton size="sm" variant="primary" @click="store.install(plugin.id)">
                  Install
                </VButton>
              </template>
            </div>
          </article>

          <!-- Install from local -->
          <article class="plugin-card plugin-card--add v-glass">
            <div class="plugin-card__add-content">
              <span class="plugin-card__add-icon">+</span>
              <h4>Install from Disk</h4>
              <p>Select a plugin folder to install</p>
              <VButton size="sm" variant="secondary" @click="installFromDisk">Browse...</VButton>
              <input
                ref="fileInput"
                type="file"
                webkitdirectory
                hidden
                @change="onFolderSelected"
              />
            </div>
          </article>
        </div>
      </section>

      <!-- API docs section -->
      <section class="plugins-section">
        <h3 class="plugins-section__title">Plugin Development</h3>
        <p class="plugins-section__desc">
          Plugins are self-contained folders in <code>data/plugins/&lt;id&gt;/</code> with a <code>manifest.json</code> and <code>index.js</code>.
          Plugins run in sandboxed VM contexts and have access to the Vanta API.
        </p>
        <div class="plugins-docs-grid">
          <div class="plugin-doc-card v-glass">
            <h4>manifest.json</h4>
            <pre><code>{
  "name": "My Plugin",
  "version": "1.0.0",
  "description": "...",
  "author": "...",
  "main": "index.js",
  "capabilities": ["commands"]
}</code></pre>
          </div>
          <div class="plugin-doc-card v-glass">
            <h4>index.js (Sandbox)</h4>
            <pre><code>// Register a command
vanta.commands.register({
  id: 'my-command',
  trigger: 'hello',
  action: { type: 'run-shell', value: 'echo hello' }
});

// Listen for events
vanta.events.on('command:executed', (data) => {
  console.log('Command ran:', data);
});
</code></pre>
          </div>
        </div>
      </section>
    </div>

    <!-- Uninstall confirmation -->
    <VModal v-model:visible="uninstallModal.visible" title="Uninstall Plugin" size="sm">
      <p>Are you sure you want to uninstall <strong>{{ uninstallModal.plugin?.name }}</strong>?</p>
      <p style="color: var(--text-secondary); font-size: 13px;">This will remove the plugin directory and all its data.</p>
      <template #footer>
        <VButton variant="secondary" @click="uninstallModal.visible = false">Cancel</VButton>
        <VButton variant="primary" @click="doUninstall">Uninstall</VButton>
      </template>
    </VModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import VToolbar from '../../design-system/components/VToolbar.vue';
import VButton from '../../design-system/components/VButton.vue';
import VModal from '../../design-system/components/VModal.vue';
import { usePluginsStore } from './pluginsStore.js';

const store = usePluginsStore();
const fileInput = ref(null);
const uninstallModal = ref({ visible: false, plugin: null });

onMounted(() => store.load());

function statusLabel(p) {
  if (!p.installed) return 'Available';
  if (p.status === 'enabled' || p.status === 'loaded') return 'Active';
  if (p.status === 'disabled') return 'Disabled';
  return p.status;
}

function getIcon(p) {
  if (p.installed) return '📦';
  return '📥';
}

function confirmUninstall(plugin) {
  uninstallModal.value = { visible: true, plugin };
}

async function doUninstall() {
  await store.uninstall(uninstallModal.value.plugin.id);
  uninstallModal.value.visible = false;
}

function installFromDisk() {
  fileInput.value?.click();
}

async function onFolderSelected(e) {
  const files = e.target.files;
  if (!files?.length) return;
  const path = files[0].path;
  // Extract the plugin folder path
  const pluginPath = path.substring(0, path.lastIndexOf('/'));
  const pluginId = pluginPath.substring(pluginPath.lastIndexOf('/') + 1);
  await store.install(pluginId, pluginPath);
  e.target.value = '';
}
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; height: 100%; }
.module-body { flex: 1; padding: var(--space-6); overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-8); }
.plugins-section__title { font-family: var(--font-body); font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0 0 var(--space-2); }
.plugins-section__desc { font-size: 14px; color: var(--text-secondary); margin: 0 0 var(--space-6); }
.plugins-section__desc code { color: var(--gold-core); font-family: var(--font-mono); font-size: 13px; background: var(--bg-surface-2); padding: 2px 6px; border-radius: var(--radius-sm); }
.plugins-loading { text-align: center; padding: var(--space-8); color: var(--text-secondary); }

.plugins-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-4); }

.plugin-card { padding: var(--space-5); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: var(--space-3); transition: transform var(--motion-fast), box-shadow var(--motion-fast); }
.plugin-card:hover { transform: translateY(-2px); box-shadow: var(--elevation-2); }
.plugin-card--disabled { opacity: 0.6; }
.plugin-card__header { display: flex; align-items: center; gap: var(--space-3); }
.plugin-card__icon { font-size: 28px; }
.plugin-card__info { flex: 1; min-width: 0; }
.plugin-card__name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.plugin-card__version { font-size: 12px; color: var(--text-disabled); }
.plugin-card__badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-full); text-transform: uppercase; letter-spacing: 0.5px; }
.plugin-card__badge--enabled, .plugin-card__badge--loaded { background: rgba(127, 168, 138, 0.15); color: var(--state-success); }
.plugin-card__badge--disabled { background: rgba(196, 107, 95, 0.15); color: var(--state-error); }
.plugin-card__badge--available { background: rgba(212, 175, 55, 0.15); color: var(--gold-core); }
.plugin-card__desc { font-size: 13px; color: var(--text-secondary); margin: 0; line-height: 1.5; }
.plugin-card__caps { display: flex; flex-wrap: wrap; gap: var(--space-1); }
.plugin-card__cap { font-size: 11px; padding: 1px 8px; border-radius: var(--radius-full); border: 1px solid var(--bg-hairline); color: var(--text-secondary); }
.plugin-card__actions { display: flex; gap: var(--space-2); margin-top: auto; padding-top: var(--space-2); }
.plugin-card__uninstall { color: var(--state-error) !important; }

.plugin-card--add { border: 2px dashed var(--bg-hairline); display: flex; align-items: center; justify-content: center; min-height: 200px; }
.plugin-card__add-content { text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-2); }
.plugin-card__add-icon { font-size: 36px; color: var(--gold-core); opacity: 0.5; }
.plugin-card__add-content h4 { margin: 0; color: var(--text-primary); font-size: 16px; }
.plugin-card__add-content p { margin: 0; color: var(--text-secondary); font-size: 13px; }

.plugins-docs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-4); }
.plugin-doc-card { padding: var(--space-5); border-radius: var(--radius-md); }
.plugin-doc-card h4 { margin: 0 0 var(--space-3); font-size: 15px; color: var(--text-primary); }
.plugin-doc-card pre { margin: 0; overflow-x: auto; }
.plugin-doc-card code { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); line-height: 1.6; white-space: pre; }
</style>
