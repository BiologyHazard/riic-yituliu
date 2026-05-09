<script setup lang="ts">
import { RouterView } from 'vue-router';
import { computed, onMounted } from 'vue';
import logoUrl from '@/assets/images/白鸥.webp';
import { useDataSource } from '@/composables/useDataSource';
import { loadGameData, isGameDataLoading, gameDataError } from '@/utils/gameData';
import { loadPenguinData, isPenguinDataLoading, penguinDataError } from '@/utils/penguinStats';

const { currentSource } = useDataSource();

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

// 在根组件挂载后通过非阻塞方式加载数据
onMounted(() => {
  loadGameData(currentSource.value.baseUrl);
  loadPenguinData();
});
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
        <div class="flex items-center gap-2">
          <div v-if="isGameDataLoading || isPenguinDataLoading" class="flex items-center">
            <UIcon class="h-4 w-4 animate-spin text-primary" name="i-lucide-loader-2" />
          </div>
          <UPopover v-if="gameDataError || penguinDataError">
            <UButton color="error" icon="i-lucide-triangle-alert" size="xs" variant="ghost" />
            <template #content>
              <div class="max-w-xs p-3 text-xs">
                <p v-if="gameDataError" class="mb-1 text-error">游戏数据加载失败</p>
                <p v-if="penguinDataError" class="text-error">企鹅物流加载失败</p>
                <UButton
                  block
                  class="mt-2"
                  size="xs"
                  @click="
                    () => {
                      loadGameData(currentSource.baseUrl);
                      loadPenguinData();
                    }
                  "
                >
                  重试
                </UButton>
              </div>
            </template>
          </UPopover>
          <UColorModeButton />
        </div>
      </template>
    </UHeader>

    <UMain>
      <RouterView />
    </UMain>
  </UApp>
</template>

<style scoped lang="scss"></style>
