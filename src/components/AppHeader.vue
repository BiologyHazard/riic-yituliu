<script setup lang="ts">
import { currentGameDataBaseUrl } from '@/utils/dataSources';
import { gameDataError, isGameDataLoading, loadGameData } from '@/utils/gameData/gameData';
import { isPenguinDataLoading, loadPenguinData, penguinDataError } from '@/utils/penguinStats';
import { useRoute } from 'vue-router';

// const collapsed = defineModel<boolean>('collapsed');
const emit = defineEmits<{
  open: [];
}>();

const route = useRoute();
</script>

<template>
  <UHeader :toggle="false" :ui="{ container: 'max-w-none px-4!' }">
    <template #left>
      <!-- <UButton
        color="neutral"
        :icon="collapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
        variant="ghost"
        @click="collapsed = !collapsed"
      /> -->
      <UButton
        class="lg:hidden"
        color="neutral"
        icon="i-lucide-menu"
        variant="ghost"
        @click="emit('open')"
      />
      <UDashboardSidebarCollapse class="max-lg:hidden" />
      <div class="text-lg font-semibold">{{ route.meta.title || '明日方舟基建一图流' }}</div>
    </template>

    <template #right>
      <UPopover
        v-if="isGameDataLoading || isPenguinDataLoading || gameDataError || penguinDataError"
      >
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
      <div class="flex items-center justify-center gap-1">
        <ThemePicker />
        <UTooltip text="切换颜色模式">
          <UColorModeButton />
        </UTooltip>
      </div>
    </template>
  </UHeader>
</template>
