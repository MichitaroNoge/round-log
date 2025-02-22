import { createRouter, createWebHistory } from 'vue-router'
import UserLogin from '../views/UserLogin.vue'
import RoundList from '../views/RoundList.vue'
import RoundDetail from '../views/RoundDetail.vue'
// import HomeView from '../views/HomeView.vue'
// import AboutView from '../views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    { path: '/', name: 'UserLogin', component: UserLogin },
    // { path: '/home', component: HomeView },
    // { path: '/about', component: AboutView },
    {
      path: '/round-list',
      name: 'RoundList',
      component: RoundList,
      meta: { requiresAuth: true },
    },
    {
      path: '/round/:id/:roundDate/:courseName',
      name: 'RoundDetail',
      component: RoundDetail,
      props: true,
    },
  ],
})

export default router
