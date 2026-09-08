import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/views/Home.vue') },
  { path: '/sports', component: () => import('@/views/Sports.vue') },
  { path: '/live', component: () => import('@/views/Live.vue') },
  { path: '/casino', component: () => import('@/views/CategoryPage.vue'), props: { category: 'casino' } },
  { path: '/live-casino', component: () => import('@/views/CategoryPage.vue'), props: { category: 'live-casino' } },
  { path: '/virtual', component: () => import('@/views/CategoryPage.vue'), props: { category: 'virtual' } },
  { path: '/lotto', component: () => import('@/views/CategoryPage.vue'), props: { category: 'lotto' } },
  { path: '/event/:id', component: () => import('@/views/EventDetails.vue') },
  { path: '/compare', component: () => import('@/views/Compare.vue') },
  { path: '/review', component: () => import('@/views/Review.vue') },
  { path: '/confirm', component: () => import('@/views/Confirm.vue') },
  { path: '/completion', component: () => import('@/views/Completion.vue') },
  { path: '/session-quality', component: () => import('@/views/SessionQuality.vue') },
  { path: '/product-impact', component: () => import('@/views/ProductImpact.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

export default router
