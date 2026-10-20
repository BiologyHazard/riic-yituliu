<script setup lang="ts">
import BaseMapDiagram from '@/components/riic/BaseMapDiagram.vue';
import type { BuildingLayout, BuildingRoom } from '@/types/gameData';
import { gameData, isGameDataLoading } from '@/utils/gameData/gameData';
import { computed } from 'vue';

const layout = computed<BuildingLayout | undefined>(() => {
  const layouts = gameData.value?.buildingData.layouts;
  const layout = layouts ? Object.values(layouts)[0] : undefined;
  return layout?.slots && layout.storeys ? layout : undefined;
});

const rooms = computed<Record<string, BuildingRoom> | undefined>(
  () => gameData.value?.buildingData.rooms,
);
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="基建地图" />
      <UPageBody>
        <BaseMapDiagram v-if="layout" :layout="layout" :rooms="rooms" />
        <div
          v-else-if="!gameData || isGameDataLoading"
          class="flex items-center gap-2 text-sm text-muted"
        >
          <UIcon class="size-4 animate-spin" name="i-lucide-loader-circle" />
          正在加载游戏数据...
        </div>
        <p v-else class="text-sm text-muted">当前游戏数据源未提供基建布局数据。</p>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
