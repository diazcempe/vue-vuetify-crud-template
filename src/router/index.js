import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Cities from '@/components/city/Cities'
import Regions from '@/components/region/Regions'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', name: 'HelloWorld', component: HelloWorld },
    { path: '/cities', name: 'City', component: Cities },
    { path: '/regions', name: 'Region', component: Regions }
  ]
})
