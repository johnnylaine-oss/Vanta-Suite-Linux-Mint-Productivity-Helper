<template>
  <div class="module-page">
    <VToolbar title="AI Assistant" />
    <div class="module-body">
      <div class="chat-container">
        <div v-if="!store.available" class="chat-unavailable">
          <p>AI Assistant is unavailable. Ollama is not running.</p>
          <p class="chat-hint">Start Ollama with <code>ollama serve</code> and restart Vanta Suite.</p>
        </div>
        <div v-else class="chat-messages" ref="messagesRef">
          <div v-for="(msg, i) in store.messages" :key="i" class="chat-message" :class="{ 'chat-message--user': msg.role === 'user', 'chat-message--assistant': msg.role === 'assistant' }">
            <div class="chat-message__content">{{ msg.content }}</div>
          </div>
        </div>
        <div class="chat-input-area">
          <VInput v-model="input" placeholder="Ask something..." @keydown.enter="send" />
          <VButton variant="primary" :disabled="!input.trim()" @click="send">Send</VButton>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, nextTick } from 'vue';
import VToolbar from '../../design-system/components/VToolbar.vue';
import VInput from '../../design-system/components/VInput.vue';
import VButton from '../../design-system/components/VButton.vue';
import { useAiStore } from './aiStore.js';
const store = useAiStore();
const input = ref('');
const messagesRef = ref(null);
async function send() {
  if (!input.value.trim()) return;
  const msg = input.value;
  input.value = '';
  await store.sendMessage(msg);
  nextTick(() => { messagesRef.value?.scrollTo(0, messagesRef.value.scrollHeight); });
}
store.checkAvailability();
</script>
<style scoped>
.module-page { display: flex; flex-direction: column; height: 100%; }
.module-body { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.chat-container { display: flex; flex-direction: column; height: 100%; padding: var(--space-4); }
.chat-unavailable { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-secondary); text-align: center; }
.chat-hint { font-size: 13px; color: var(--text-disabled); margin-top: var(--space-2); }
.chat-hint code { color: var(--gold-core); font-family: var(--font-mono); }
.chat-messages { flex: 1; overflow-y: auto; padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
.chat-message { max-width: 80%; padding: var(--space-3) var(--space-4); border-radius: var(--radius-md); }
.chat-message--user { align-self: flex-end; background: linear-gradient(135deg, var(--gold-bright), var(--gold-core)); color: var(--bg-void); }
.chat-message--assistant { align-self: flex-start; background: var(--bg-surface-2); color: var(--text-primary); }
.chat-message__content { font-size: 14px; white-space: pre-wrap; }
.chat-input-area { display: flex; gap: var(--space-2); padding: var(--space-3); border-top: 1px solid var(--bg-hairline); }
.chat-input-area .v-input-wrapper { flex: 1; }
</style>
