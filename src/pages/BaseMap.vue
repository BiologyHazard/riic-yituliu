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
      <UPageHeader
        description="根据游戏数据实时绘制，展示各基建房间的 slot_id 与清理房间可提供的无人机数量。"
        title="基建地图"
      />
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

        <p class="text-center text-sm text-toned">
          房间的真实类型（制造站 / 贸易站 / 发电站等）由玩家自行建造，因此按槽位类别展示； 可在
          <ULink
            class="text-primary hover:text-primary/75"
            href="https://prts.wiki/w/用户:BioHazard/基建地图"
            rel="noopener noreferrer"
            target="_blank"
          >
            PRTS Wiki
          </ULink>
          查看实机标注图，数据来源为
          <ULink
            class="text-primary hover:text-primary/75"
            href="https://github.com/Kengxxiao/ArknightsGameData/blob/master/zh_CN/gamedata/excel/building_data.json"
            rel="noopener noreferrer"
            target="_blank"
          >
            <code>building_data.json</code>
          </ULink>
          。
        </p>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
