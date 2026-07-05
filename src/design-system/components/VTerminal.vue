<template>
  <div class="v-terminal" ref="terminalRef"></div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const props = defineProps({
  options: { type: Object, default: () => ({}) },
});
const emit = defineEmits(['data', 'ready']);
const terminalRef = ref(null);
let terminal = null;
let fitAddon = null;

onMounted(() => {
  terminal = new Terminal({
    cursorBlink: true,
    cursorStyle: 'bar',
    fontFamily: props.options.fontFamily || "'JetBrains Mono', monospace",
    fontSize: props.options.fontSize || 14,
    theme: {
      background: '#0A0A0C',
      foreground: '#F5F1E8',
      cursor: '#D4AF37',
      selectionBackground: 'rgba(212, 175, 55, 0.25)',
      black: '#1A1A1D',
      red: '#C46B5F',
      green: '#7FA88A',
      yellow: '#D4AF37',
      blue: '#A8A69E',
      magenta: '#A67C27',
      cyan: '#F4D68C',
      white: '#F5F1E8',
      brightBlack: '#5C5A54',
      brightRed: '#C46B5F',
      brightGreen: '#7FA88A',
      brightYellow: '#D4AF37',
      brightBlue: '#A8A69E',
      brightMagenta: '#A67C27',
      brightCyan: '#F4D68C',
      brightWhite: '#F5F1E8',
    },
    allowProposedApi: true,
    ...props.options,
  });

  fitAddon = new FitAddon();
  terminal.loadAddon(fitAddon);

  // Note: WebGL addon (@xterm/addon-webgl) can be added when available.
  // xterm.js v5+ may bundle it differently or require separate install.

  terminal.open(terminalRef.value);
  fitAddon.fit();

  terminal.onData((data) => emit('data', data));

  const resizeObserver = new ResizeObserver(() => {
    try { fitAddon?.fit(); } catch {}
  });
  resizeObserver.observe(terminalRef.value);

  onUnmounted(() => {
    resizeObserver.disconnect();
    terminal?.dispose();
  });

  emit('ready', terminal);
});

defineExpose({
  write: (data) => terminal?.write(data),
  writeln: (data) => terminal?.writeln(data),
  clear: () => terminal?.clear(),
  fit: () => fitAddon?.fit(),
  focus: () => terminal?.focus(),
  getTerminal: () => terminal,
});
</script>
<style scoped>
.v-terminal { width: 100%; height: 100%; min-height: 200px; }
:deep(.xterm) { height: 100%; padding: var(--space-2); }
:deep(.xterm-viewport::-webkit-scrollbar) { width: 6px; }
:deep(.xterm-viewport::-webkit-scrollbar-track) { background: var(--bg-void); }
:deep(.xterm-viewport::-webkit-scrollbar-thumb) { background: var(--bg-hairline); border-radius: var(--radius-full); }
</style>
