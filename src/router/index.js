import { createRouter, createWebHistory } from 'vue-router'
import byStudio from '@/components/byStudio.vue'
import Rankingpage from '@/components/rankingpage.vue';
import LineChart from '@/components/line_chart.vue'
const routes = [
  {
    path: '/studio',
    name: 'byStudio',
    component: byStudio,
    meta: {
      showNav: false
    }
  },
  {
    path: '/rank',
    name: 'rankingpage',
    component: Rankingpage,
    meta: {
      showrank: false
    }
  },
  {
    path: '/line_chart',
    name: 'LineChart',
    component: LineChart,
    meta: {
      showlinechart: false
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
