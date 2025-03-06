import { createRouter, createWebHashHistory } from 'vue-router'
import UserLogin from '../views/UserLogin.vue'
import RoundList from '../views/RoundList.vue'
import RoundDetail from '../views/RoundDetail.vue'

const router = createRouter({
  history: createWebHashHistory(), //GitHub PagesはcreateWebHistory()と相性が悪いのでのでcreateWebHashHistoryを使用する

  routes: [
    { path: '/', name: 'UserLogin', component: UserLogin },
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
    },
    {
      path: '/:catchAll(.*)*',
      name: 'notFound',
      redirect: '/',
    },
  ],
})

export default router
