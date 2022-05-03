import { createRouter, createWebHashHistory } from 'vue-router';
import AllowList from '../components/AllowList.vue';
import Entities from '../views/EntityRecords.vue';

const routes = [
  {
    path: '/',
    name: 'AllowList',
    component: AllowList
  },
  {
    path: '/entities',
    name: 'Entities',
    component: Entities
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
