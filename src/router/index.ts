import ArknightsGameBulletinView from '@/views/ArknightsGameBulletinView.vue';
import BaseSkillView from '@/views/BaseSkillView.vue';
import CharCostRankingView from '@/views/CharCostRankingView.vue';
import CharItemCostView from '@/views/CharItemCostView.vue';
import EndfieldGameBulletinView from '@/views/EndfieldGameBulletinView.vue';
import HomeView from '@/views/HomeView.vue';
import ImageGradientView from '@/views/ImageGradientView.vue';
import ItemValueView from '@/views/ItemValueView.vue';
import LinksView from '@/views/LinksView.vue';
import MaterialInfoView from '@/views/MaterialInfoView.vue';
import MonsterSirenView from '@/views/MonsterSirenView.vue';
import OperatorAvatarGeneratorView from '@/views/OperatorAvatarGeneratorView.vue';
import OperatorBaseSkillShowcaseView from '@/views/OperatorBaseSkillShowcaseView.vue';
import RiicMapView from '@/views/RiicMapView.vue';
import RiicView from '@/views/RiicView.vue';
import SklandAssistantView from '@/views/SklandAssistantView.vue';
import StageList from '@/views/StageList.vue';
import StudioAvatarView from '@/views/StudioAvatarView.vue';
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
      path: '/riic-map',
      name: 'riic-map',
      component: RiicMapView,
      meta: { title: '基建地图' },
    },
    {
      path: '/char-item-cost',
      name: 'char-item-cost',
      component: CharItemCostView,
      meta: { title: '干员材料消耗' },
    },
    {
      path: '/char-cost-ranking',
      name: 'char-cost-ranking',
      component: CharCostRankingView,
      meta: { title: '养成成本排行' },
    },
    {
      path: '/material-info',
      name: 'material-info',
      component: MaterialInfoView,
      meta: { title: '材料信息' },
    },
    {
      path: '/item-value',
      name: 'item-value',
      component: ItemValueView,
      meta: { title: '物品价值' },
    },
    {
      path: '/stages',
      name: 'stage-list',
      component: StageList,
      meta: { title: '作战列表' },
    },
    {
      path: '/arknights-game-bulletin',
      name: 'arknights-game-bulletin',
      component: ArknightsGameBulletinView,
      meta: { title: '明日方舟游戏内公告' },
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
        {
          path: 'song/:cid',
          name: 'monster-siren-song-detail',
          component: MonsterSirenView,
          meta: { title: '塞壬唱片 - 乐曲详情' },
        },
      ],
    },
    {
      path: '/endfield-game-bulletin',
      name: 'endfield-game-bulletin',
      component: EndfieldGameBulletinView,
      meta: { title: '明日方舟：终末地游戏内公告' },
    },
    {
      path: '/sklassistant',
      name: 'sklassistant',
      component: SklandAssistantView,
      meta: { title: '森空岛签到' },
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
    {
      path: '/studio-avatar',
      name: 'studio-avatar',
      component: StudioAvatarView,
      meta: { title: '工作室头像生成器' },
    },
    {
      path: '/operator-avatar-generator',
      name: 'operator-avatar-generator',
      component: OperatorAvatarGeneratorView,
      meta: { title: '干员头像生成器' },
    },
    {
      path: '/image-gradient',
      name: 'image-gradient',
      component: ImageGradientView,
      meta: { title: '图片渐变工具' },
    },
    {
      path: '/operator-base-skill-showcase',
      name: 'operator-base-skill-showcase',
      component: OperatorBaseSkillShowcaseView,
      meta: { title: '干员基建技能展示' },
    },
  ],
});

export default router;
