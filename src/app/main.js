import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import '../design-system/tokens.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('[Vanta Suite] Vue error:', err, info);
};

app.mount('#app');
