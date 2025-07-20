import { createRouter, createWebHistory } from 'vue-router'
import byStudio from '@/components/byStudio.vue'

const routes = [
  {
    path: '/studio',
    name: 'byStudio',
    component: byStudio,
    meta: {
      showNav: false
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;