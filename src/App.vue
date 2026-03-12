<script setup lang="ts">
import { RouterView } from 'vue-router';
import { computed } from 'vue';
import logoUrl from '@/assets/images/白鸥.webp';

const items = computed(() => [
  { label: '首页', to: '/' },
  { label: '排班表生成器', to: '/riic' },
  { label: '基建技能', to: '/base-skill' },
  { label: '材料信息', to: '/material-info' },
  { label: '作战列表', to: '/stages' },
  { label: '游戏内公告', to: '/game-bulletin' },
  { label: '塞壬唱片', to: '/monster-siren' },
  { label: '友情链接', to: '/links' },
]);
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <UButton
          :avatar="{ src: logoUrl, size: 'xs', alt: 'Logo', class: 'rounded-none bg-transparent' }"
          class="p-1.5"
          to="/"
          variant="ghost"
        />
      </template>

      <UNavigationMenu :items="items" variant="link" />

      <template #body>
        <UNavigationMenu :items="items" orientation="vertical" />
      </template>

      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <RouterView />
    </UMain>
  </UApp>
</template>

<style scoped lang="scss"></style>
