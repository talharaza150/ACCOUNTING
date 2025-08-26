import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { ToastPlugin } from './composables/useToast'
import { useAnalytics } from './composables/useAnalytics'

// Configure the app for proper asset loading
const app = createApp(App)

// Install plugins
app.use(createPinia())
app.use(router)
app.use(ToastPlugin)

// Global error handler
app.config.errorHandler = (error, instance, info) => {
  console.error('Global error:', error)
  console.error('Component instance:', instance)
  console.error('Error info:', info)
}

// Mount the app
app.mount('#app')

// Initialize analytics
const analytics = useAnalytics({
  enabled: import.meta.env.PROD, // Only enable in production
  debug: !import.meta.env.PROD,
  trackPageViews: true,
  trackUserInteractions: true,
  trackPerformance: true,
  trackErrors: true
});

// Track route changes
router.afterEach((to) => {
  analytics.trackPageView(to.path, to.meta?.title as string || to.name as string);
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}
