import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Configure the app for proper asset loading
const app = createApp(App)

app.use(createPinia())
app.use(router)

// Mount the app
app.mount('#app')
