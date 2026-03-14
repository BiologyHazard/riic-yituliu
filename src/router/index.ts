import BaseSkillView from '@/views/BaseSkillView.vue';
import GameBulletinView from '@/views/GameBulletinView.vue';
import HomeView from '@/views/HomeView.vue';
import LinksView from '@/views/LinksView.vue';
import MaterialInfoView from '@/views/MaterialInfoView.vue';
import MonsterSirenView from '@/views/MonsterSirenView.vue';
import RiicView from '@/views/RiicView.vue';
import StageList from '@/views/StageList.vue';
import TierMakerView from '@/views/TierMakerView.vue';
import TierMakerView2 from '@/views/TierMakerView2.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: '首页' },
    },
    {
      path: '/riic',
      name: 'riic',
      component: RiicView,
      meta: { title: '排班表生成器' },
    },
    {
      path: '/base-skill',
      name: 'base-skill',
      component: BaseSkillView,
      meta: { title: '基建技能' },
    },
    {
      path: '/material-info',
      name: 'material-info',
      component: MaterialInfoView,
      meta: { title: '材料信息' },
    },
    {
      path: '/stages',
      name: 'stage-list',
      component: StageList,
      meta: { title: '作战列表' },
    },
    {
      path: '/game-bulletin',
      name: 'game-bulletin',
      component: GameBulletinView,
      meta: { title: '游戏内公告' },
    },
    {
      path: '/monster-siren',
      name: 'monster-siren',
      component: MonsterSirenView,
      meta: { title: '塞壬唱片' },
      redirect: '/monster-siren/musics',
      children: [
        {
          path: 'musics',
          name: 'monster-siren-musics',
          component: MonsterSirenView,
          meta: { title: '塞壬唱片 - 乐曲' },
        },
        {
          path: 'albums',
          name: 'monster-siren-albums',
          component: MonsterSirenView,
          meta: { title: '塞壬唱片 - 专辑' },
        },
        {
          path: 'album/:cid',
          name: 'monster-siren-album-detail',
          component: MonsterSirenView,
          meta: { title: '塞壬唱片 - 专辑详情' },
        },
      ],
    },
    {
      path: '/links',
      name: 'links',
      component: LinksView,
      meta: { title: '友情链接' },
    },
    {
      path: '/tier',
      name: 'tier-maker',
      component: TierMakerView,
      meta: { title: '干员分Tier' },
    },
    {
      path: '/tier2',
      name: 'tier-maker2',
      component: TierMakerView2,
      meta: { title: '干员分Tier2' },
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
