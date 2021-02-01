import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Messages from '../views/Messages.vue'


Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/messages/:id',
    name: 'Messages',
    component: Messages
  }
]

const router = new VueRouter({
  routes
})

export default router
