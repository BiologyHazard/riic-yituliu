<script setup lang="ts">
import logoUrl from '@/assets/images/白鸥.webp';
import { currentGameDataBaseUrl } from '@/composables/useDataSource';
import { gameDataError, isGameDataLoading, loadGameData } from '@/utils/gameData';
import { isPenguinDataLoading, loadPenguinData, penguinDataError } from '@/utils/penguinStats';
import { computed, onMounted } from 'vue';
import { RouterView } from 'vue-router';

const items = computed(() => [
  { label: '首页', to: '/' },
  { label: '排班表生成器', to: '/riic' },
  { label: '基建技能', to: '/base-skill' },
  { label: '干员拉满消耗', to: '/char-item-cost' },
  { label: '养成成本排行', to: '/char-cost-ranking' },
  { label: '材料信息', to: '/material-info' },
  { label: '物品价值', to: '/item-value' },
  { label: '作战列表', to: '/stages' },
  { label: '游戏内公告', to: '/game-bulletin' },
  { label: '塞壬唱片', to: '/monster-siren' },
  { label: '友情链接', to: '/links' },
]);

// 在根组件挂载后通过非阻塞方式加载数据
onMounted(() => {
  loadGameData(currentGameDataBaseUrl.value);
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
