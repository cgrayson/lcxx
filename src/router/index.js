import { createRouter, createWebHashHistory } from 'vue-router';
import AllowList from '../components/AllowList.vue';
import HelloWorld from '../components/HelloWorld';

const routes = [
  {
    path: '/',
    name: 'AllowList',
    component: AllowList
  },
  {
    path: '/hello',
    name: 'Hello, World',
    component: HelloWorld,
    props: { msg: 'Bob' }
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
