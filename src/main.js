import { createApp , ref, computed } from 'vue'
import "leaflet/dist/leaflet.css"
import '@fortawesome/fontawesome-free/css/all.min.css'
import router from './router/index.js'

import App from './App.vue'

createApp(App).use(router).mount('#app')
