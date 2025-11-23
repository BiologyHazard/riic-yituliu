import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: '首页' },
    },
    {
      path: '/riic',
      name: 'riic',
      component: () => import('@/views/RiicView.vue'),
      meta: { title: '排班表生成器' },
    },
    {
      path: '/base-skill',
      name: 'base-skill',
      component: () => import('@/views/BaseSkillView.vue'),
      meta: { title: '基建技能' },
    },
    {
      path: '/links',
      name: 'links',
      component: () => import('@/views/LinksView.vue'),
      meta: { title: '友情链接' },
    },
  ],
});

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 明日方舟基建一图流`;
  } else {
    document.title = '明日方舟基建一图流';
  }
});

export default router;
