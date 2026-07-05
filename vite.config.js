import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  root: 'src/app',
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@design-system': resolve(__dirname, 'src/design-system'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@core': resolve(__dirname, 'src/core'),
    },
  },
});
