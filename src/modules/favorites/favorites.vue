<template>
  <div class="module-page">
    <VToolbar title="Favorites">
      <template #right>
        <VButton variant="primary" size="sm">Add Group</VButton>
      </template>
    </VToolbar>
    <div class="module-body">
      <VGridView :minColWidth="160">
        <VFavoriteAppCard v-for="app in store.apps" :key="app.id" :name="app.name" :icon="app.icon" :pinned="app.pinned" @click="launch(app)" />
      </VGridView>
    </div>
  </div>
</template>
<script setup>
import VToolbar from '../../design-system/components/VToolbar.vue';
import VButton from '../../design-system/components/VButton.vue';
import VGridView from '../../design-system/components/VGridView.vue';
import VFavoriteAppCard from '../../design-system/components/VFavoriteAppCard.vue';
import { useFavoritesStore } from './favoritesStore.js';
const store = useFavoritesStore();
function launch(app) { window.vanta?.favorites?.launchApp(app); }
</script>
<style scoped>
.module-page { display: flex; flex-direction: column; height: 100%; }
.module-body { flex: 1; padding: var(--space-6); overflow-y: auto; }
</style>
