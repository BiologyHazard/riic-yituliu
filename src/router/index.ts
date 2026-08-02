import ArknightsGameBulletin from '@/pages/ArknightsGameBulletin.vue';
import AvatarGenerator from '@/pages/AvatarGenerator.vue';
import BaseMap from '@/pages/BaseMap.vue';
import BaseSchedule from '@/pages/BaseSchedule.vue';
import BaseSkillShowcase from '@/pages/BaseSkillShowcase.vue';
import BaseSkillTable from '@/pages/BaseSkillTable.vue';
import CharCostRanking from '@/pages/CharCostRanking.vue';
import CharItemCost from '@/pages/CharItemCost.vue';
import EndfieldGameBulletin from '@/pages/EndfieldGameBulletin.vue';
import FriendLinks from '@/pages/FriendLinks.vue';
import ImageGradient from '@/pages/ImageGradient.vue';
import IndexPage from '@/pages/IndexPage.vue';
import ItemValue from '@/pages/ItemValue.vue';
import MaterialInfo from '@/pages/MaterialInfo.vue';
import MonsterSiren from '@/pages/MonsterSiren.vue';
import SklandAssistant from '@/pages/SklandAssistant.vue';
import StageList from '@/pages/StageList.vue';
import StudioAvatar from '@/pages/StudioAvatar.vue';
import TierMaker from '@/pages/TierMaker.vue';
import TierMaker2 from '@/pages/TierMaker2.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: IndexPage,
      meta: { title: '首页' },
    },
    {
      path: '/riic',
      name: 'riic',
      component: BaseSchedule,
      meta: { title: '排班表生成器' },
    },
    {
      path: '/base-skill',
      name: 'base-skill',
      component: BaseSkillTable,
      meta: { title: '基建技能' },
    },
    {
      path: '/riic-map',
      name: 'riic-map',
      component: BaseMap,
      meta: { title: '基建地图' },
    },
    {
      path: '/char-item-cost',
      name: 'char-item-cost',
      component: CharItemCost,
      meta: { title: '干员材料消耗' },
    },
    {
      path: '/char-cost-ranking',
      name: 'char-cost-ranking',
      component: CharCostRanking,
      meta: { title: '养成成本排行' },
    },
    {
      path: '/material-info',
      name: 'material-info',
      component: MaterialInfo,
      meta: { title: '材料信息' },
    },
    {
      path: '/item-value',
      name: 'item-value',
      component: ItemValue,
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
      component: ArknightsGameBulletin,
      meta: { title: '明日方舟游戏内公告' },
    },
    {
      path: '/monster-siren',
      name: 'monster-siren',
      component: MonsterSiren,
      meta: { title: '塞壬唱片' },
      redirect: '/monster-siren/musics',
      children: [
        {
          path: 'musics',
          name: 'monster-siren-musics',
          component: MonsterSiren,
          meta: { title: '塞壬唱片 - 乐曲' },
        },
        {
          path: 'albums',
          name: 'monster-siren-albums',
          component: MonsterSiren,
          meta: { title: '塞壬唱片 - 专辑' },
        },
        {
          path: 'album/:cid',
          name: 'monster-siren-album-detail',
          component: MonsterSiren,
          meta: { title: '塞壬唱片 - 专辑详情' },
        },
        {
          path: 'song/:cid',
          name: 'monster-siren-song-detail',
          component: MonsterSiren,
          meta: { title: '塞壬唱片 - 乐曲详情' },
        },
      ],
    },
    {
      path: '/endfield-game-bulletin',
      name: 'endfield-game-bulletin',
      component: EndfieldGameBulletin,
      meta: { title: '明日方舟：终末地游戏内公告' },
    },
    {
      path: '/sklassistant',
      name: 'sklassistant',
      component: SklandAssistant,
      meta: { title: '森空岛签到' },
    },
    {
      path: '/links',
      name: 'links',
      component: FriendLinks,
      meta: { title: '友情链接' },
    },
    {
      path: '/tier',
      name: 'tier-maker',
      component: TierMaker,
      meta: { title: '干员分Tier' },
    },
    {
      path: '/tier2',
      name: 'tier-maker2',
      component: TierMaker2,
      meta: { title: '干员分Tier2' },
    },
    {
      path: '/studio-avatar',
      name: 'studio-avatar',
      component: StudioAvatar,
      meta: { title: '工作室头像生成器' },
    },
    {
      path: '/operator-avatar-generator',
      name: 'operator-avatar-generator',
      component: AvatarGenerator,
      meta: { title: '干员头像生成器' },
    },
    {
      path: '/image-gradient',
      name: 'image-gradient',
      component: ImageGradient,
      meta: { title: '图片渐变工具' },
    },
    {
      path: '/operator-base-skill-showcase',
      name: 'operator-base-skill-showcase',
      component: BaseSkillShowcase,
      meta: { title: '干员基建技能展示' },
    },
  ],
});

export default router;
