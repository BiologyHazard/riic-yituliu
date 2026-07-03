<script setup lang="ts">
import logoUrl from '@/assets/images/白鸥.webp';
import type { NavigationMenuItem } from '@nuxt/ui';
import { useMediaQuery } from '@vueuse/core';
import { useRouter } from 'vue-router';

const open = defineModel<boolean>('open');

const isLarge = useMediaQuery('(width >= 1024px)');

const router = useRouter();
router.afterEach(() => {
  console.log('Route changed, closing sidebar on mobile if open');
  if (!isLarge.value) {
    console.log('Closing sidebar on mobile');
    open.value = false;
  }
});

const itemsCollapsed: NavigationMenuItem[] = [
  {
    label: '首页',
    icon: 'i-lucide-home',
    to: '/',
  },
  {
    label: '排班表生成器',
    icon: 'i-lucide-calendar-sync',
    to: '/riic',
  },
  {
    label: '基建技能',
    icon: 'i-lucide-wrench',
    to: '/base-skill',
  },
  {
    label: '基建地图',
    icon: 'i-lucide-map',
    to: '/riic-map',
  },
  {
    label: '干员拉满消耗',
    icon: 'i-lucide-arrow-up-to-line',
    to: '/char-item-cost',
  },
  {
    label: '养成成本排行',
    icon: 'i-lucide-list-ordered',
    to: '/char-cost-ranking',
  },
  {
    label: '材料信息',
    icon: 'i-lucide-boxes',
    to: '/material-info',
  },
  {
    label: '物品价值',
    icon: 'i-lucide-coins',
    to: '/item-value',
  },
  {
    label: '作战列表',
    icon: 'i-lucide-swords',
    to: '/stages',
  },
  {
    label: '明日方舟游戏内公告',
    icon: 'i-lucide-megaphone',
    to: '/arknights-game-bulletin',
  },
  {
    label: '塞壬唱片',
    icon: 'i-lucide-disc-3',
    to: '/monster-siren',
  },
  {
    label: '明日方舟一图流',
    icon: 'i-mdi-numeric-1-box-outline',
    to: 'https://ark.yituliu.cn/',
    target: '_blank',
  },
  {
    label: '终末地游戏内公告',
    icon: 'i-lucide-megaphone',
    to: '/endfield-game-bulletin',
  },
  {
    label: '终末地一图流',
    icon: 'i-mdi-numeric-1-box-outline',
    to: 'https://ef.yituliu.cn/',
    target: '_blank',
  },
  {
    label: '友情链接',
    icon: 'i-lucide-link',
    to: '/links',
  },
];

const itemsExpanded: NavigationMenuItem[] = [
  { label: '首页', icon: 'i-lucide-home', to: '/' },
  {
    label: '明日方舟',
    icon: 'i-lucide-shield-plus',
    defaultOpen: true,
    children: [
      {
        label: '罗德岛基建',
        icon: 'i-lucide-factory',
        defaultOpen: true,
        children: [
          {
            label: '排班表生成器',
            icon: 'i-lucide-calendar-sync',
            to: '/riic',
          },
          {
            label: '基建技能',
            icon: 'i-lucide-wrench',
            to: '/base-skill',
          },
          {
            label: '基建地图',
            icon: 'i-lucide-map',
            to: '/riic-map',
          },
        ],
      },
      {
        label: '干员养成',
        icon: 'i-lucide-trending-up',
        defaultOpen: true,
        children: [
          {
            label: '干员拉满消耗',
            icon: 'i-lucide-arrow-up-to-line',
            to: '/char-item-cost',
          },
          {
            label: '养成成本排行',
            icon: 'i-lucide-list-ordered',
            to: '/char-cost-ranking',
          },
        ],
      },
      {
        label: '罗德岛物价局',
        icon: 'i-lucide-shopping-bag',
        defaultOpen: true,
        children: [
          {
            label: '材料信息',
            icon: 'i-lucide-boxes',
            to: '/material-info',
          },
          {
            label: '物品价值',
            icon: 'i-lucide-coins',
            to: '/item-value',
          },
        ],
      },
      {
        label: '作战与情报',
        icon: 'i-lucide-newspaper',
        defaultOpen: true,
        children: [
          {
            label: '作战列表',
            icon: 'i-lucide-swords',
            to: '/stages',
          },
          {
            label: '明日方舟游戏内公告',
            icon: 'i-lucide-megaphone',
            to: '/arknights-game-bulletin',
          },
          {
            label: '塞壬唱片',
            icon: 'i-lucide-disc-3',
            to: '/monster-siren',
          },
          {
            label: '明日方舟一图流',
            icon: 'i-mdi-numeric-1-box-outline',
            to: 'https://ark.yituliu.cn/',
            target: '_blank',
          },
        ],
      },
    ],
  },
  {
    label: '明日方舟终末地',
    icon: 'i-lucide-satellite',
    defaultOpen: true,
    children: [
      {
        label: '终末地游戏内公告',
        icon: 'i-lucide-megaphone',
        to: '/endfield-game-bulletin',
      },
      {
        label: '终末地一图流',
        icon: 'i-mdi-numeric-1-box-outline',
        to: 'https://ef.yituliu.cn/',
        target: '_blank',
      },
    ],
  },
  {
    label: '友情链接',
    icon: 'i-lucide-link',
    to: '/links',
  },
];
</script>

<template>
  <USidebar
    v-model:open="open"
    collapsible="icon"
    mode="slideover"
    :ui="{ header: 'justify-between' }"
    variant="inset"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <UButton
          :avatar="{
            src: logoUrl,
            size: 'xs',
            alt: 'Logo',
            class: 'rounded-none bg-transparent',
          }"
          class="shrink-0 p-1.5"
          to="/"
          variant="ghost"
        />
        <div v-if="open" class="truncate font-bold">明日方舟基建一图流</div>
      </div>
      <UButton
        class="lg:hidden"
        color="neutral"
        icon="i-lucide-x"
        variant="ghost"
        @click="void (open = !open)"
      />
    </template>

    <template #default>
      <UNavigationMenu
        :collapsed="!open"
        :items="open ? itemsExpanded : itemsCollapsed"
        orientation="vertical"
        :ui="{ link: 'p-1.5' }"
        variant="pill"
      />
    </template>
  </USidebar>
</template>
