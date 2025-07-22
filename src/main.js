import { createApp , ref, computed } from 'vue'
import "leaflet/dist/leaflet.css"
import '@fortawesome/fontawesome-free/css/all.min.css'
import router from './router/index.js'
import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css'

import App from './App.vue'

createApp(App).use(router).use(VueTippy, {
  defaultProps: {
    allowHTML: true
  }}).mount('#app')
