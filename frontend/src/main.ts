import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { ToastPlugin } from './composables/useToast'

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
