<script setup lang="ts">
import logoUrl from '@/assets/images/白鸥.webp';
import { currentGameDataBaseUrl } from '@/utils/dataSources';
import { gameDataError, isGameDataLoading, loadGameData } from '@/utils/gameData/gameData';
import { isPenguinDataLoading, loadPenguinData, penguinDataError } from '@/utils/penguinStats';
import type { NavigationMenuItem } from '@nuxt/ui';

const items: NavigationMenuItem[] = [
  { label: '首页', icon: 'i-lucide-home', to: '/' },
  // {
  //   label: '明日方舟',
  //   icon: 'i-lucide-shield-plus',
  //   defaultOpen: true,
  //   children: [
  {
    label: '罗德岛基建',
    icon: 'i-lucide-factory',
    defaultOpen: true,
    children: [
      { label: '排班表生成器', icon: 'i-lucide-calendar-sync', to: '/riic' },
      { label: '基建技能', icon: 'i-lucide-wrench', to: '/base-skill' },
      { label: '基建地图', icon: 'i-lucide-map', to: '/riic-map' },
    ],
  },
  {
    label: '干员养成',
    icon: 'i-lucide-trending-up',
    defaultOpen: true,
    children: [
      { label: '干员拉满消耗', icon: 'i-lucide-arrow-up-to-line', to: '/char-item-cost' },
      { label: '养成成本排行', icon: 'i-lucide-list-ordered', to: '/char-cost-ranking' },
    ],
  },
  {
    label: '罗德岛物价局',
    icon: 'i-lucide-shopping-bag',
    defaultOpen: true,
    children: [
      { label: '材料信息', icon: 'i-lucide-boxes', to: '/material-info' },
      { label: '物品价值', icon: 'i-lucide-coins', to: '/item-value' },
    ],
  },
  {
    label: '作战与情报',
    icon: 'i-lucide-newspaper',
    defaultOpen: true,
    children: [
      { label: '作战列表', icon: 'i-lucide-swords', to: '/stages' },
      {
        label: '明日方舟游戏内公告',
        icon: 'i-lucide-megaphone',
        to: '/arknights-game-bulletin',
      },
      { label: '塞壬唱片', icon: 'i-lucide-disc-3', to: '/monster-siren' },
      {
        label: '明日方舟一图流',
        icon: 'i-mdi-numeric-1-box-outline',
        to: 'https://ark.yituliu.cn/',
        target: '_blank',
      },
    ],
  },
  //   ],
  // },
  {
    label: '明日方舟终末地',
    icon: 'i-lucide-satellite',
    defaultOpen: true,
    children: [
      { label: '终末地游戏内公告', icon: 'i-lucide-megaphone', to: '/endfield-game-bulletin' },
      {
        label: '终末地一图流',
        icon: 'i-mdi-numeric-1-box-outline',
        to: 'https://ef.yituliu.cn/',
        target: '_blank',
      },
    ],
  },
  { label: '友情链接', icon: 'i-lucide-link', to: '/links' },
];
</script>

<template>
  <UHeader>
    <template #left>
      <UButton
        :avatar="{ src: logoUrl, size: 'xs', alt: 'Logo', class: 'rounded-none bg-transparent' }"
        class="p-1.5"
        to="/"
        variant="ghost"
      />
    </template>

    <UNavigationMenu content-orientation="vertical" :items="items" variant="link" />

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" />
    </template>

    <template #right>
      <div class="flex items-center gap-1">
        <UPopover
          v-if="isGameDataLoading || isPenguinDataLoading || gameDataError || penguinDataError"
        >
          <div>
            <UButton
              v-if="gameDataError || penguinDataError"
              color="error"
              icon="i-lucide-triangle-alert"
              size="md"
              variant="ghost"
            />
            <UButton
              v-else-if="isGameDataLoading || isPenguinDataLoading"
              color="primary"
              icon="i-lucide-loader-circle"
              size="md"
              :ui="{ leadingIcon: 'animate-spin' }"
              variant="ghost"
            />
          </div>
          <template #content>
            <div class="max-w-xs p-3">
              <div class="space-y-1 text-sm">
                <p v-if="isGameDataLoading">正在加载游戏数据...</p>
                <p v-if="gameDataError" class="text-error">游戏数据加载失败</p>
                <p v-if="isPenguinDataLoading">正在加载企鹅物流数据...</p>
                <p v-if="penguinDataError" class="text-error">企鹅物流加载失败</p>
              </div>
              <UButton
                block
                class="mbs-2"
                size="md"
                @click="
                  () => {
                    loadGameData(currentGameDataBaseUrl);
                    loadPenguinData();
                  }
                "
              >
                重试
              </UButton>
            </div>
          </template>
        </UPopover>
        <ThemePicker />
        <UTooltip text="切换颜色模式">
          <UColorModeButton />
        </UTooltip>
      </div>
    </template>
  </UHeader>
</template>
