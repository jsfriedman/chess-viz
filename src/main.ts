import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'
import { useThemeStore } from './theme/themeStore'
import './style.css'

const app = createApp(App).use(createPinia()).use(router)
useThemeStore()
app.mount('#app')
