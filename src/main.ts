import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.ts'
import App from './App.vue'
import 'animate.css'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')
