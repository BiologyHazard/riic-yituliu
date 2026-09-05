<script setup lang="ts">
import type { ScheduleType } from '@/types/riic';
import { getItemIconUrl } from '@/utils/dataSources';
import type { ColorInstance } from 'color';
import Color from 'color';
import { nextTick, onMounted, useTemplateRef, watch } from 'vue';

const props = defineProps<ScheduleType>();

const contentElement = useTemplateRef('contentElement');

interface itemInfo {
  imageUrl: string | undefined;
  backgroundColor: ColorInstance;
}

const itemInfoMap: Record<string, itemInfo> = {
  EXP: {
    imageUrl: getItemIconUrl('2003'),
    backgroundColor: Color('#ffd80080'),
  },
  贵金属: {
    imageUrl: getItemIconUrl('3003'),
    backgroundColor: Color('#dd653f80'),
  },
  龙门币: {
    imageUrl: getItemIconUrl('4001'),
    backgroundColor: Color('#0075a980'),
  },
  合成玉: {
    imageUrl: getItemIconUrl('4003'),
    backgroundColor: Color('#ea161680'),
  },
  高级凭证: {
    imageUrl: getItemIconUrl('4004'),
    backgroundColor: Color('#ffd80080'),
  },
};

async function adjustContentZoom() {
  if (contentElement.value) {
    contentElement.value.style.zoom = '1';
    await nextTick();
    const scaleX = (1920 * 0.95) / contentElement.value.clientWidth;
    const scaleY = (920 * 0.95) / contentElement.value.clientHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    contentElement.value!.style.zoom = scale.toString();
  }
}

onMounted(() => {
  adjustContentZoom();
});
watch(props, () => {
  adjustContentZoom();
});
</script>

<template>
  <div class="schedule">
    <!-- 背景图片 -->
    <img
      alt="背景"
      class="background-image"
      referrerpolicy="no-referrer"
      src="https://cos.biohazard.top/arknights/riic-yituliu/main-bg.d7c8c2.jpg"
    />

    <!-- 排班表标题 -->
    <div class="mt-3 ml-3.25 flex h-30 flex-row items-stretch gap-10">
      <!-- 左侧块 -->
      <!-- <div class="flex flex-row">
        <div class="w-4.25 bg-primary"></div>
        <div
          class="flex flex-row items-center bg-[#353535] pr-16 pl-5 font-['Alibaba_PuHuiTi_3.0',sans-serif] text-[48px] leading-[1.1] font-[1000] tracking-[-0.03em] whitespace-pre-wrap"
        >
          {{ props.title }}
        </div>
        <RhodesIsland class="-ml-11.75 h-13.5 w-auto" />
      </div> -->
      <div
        class="relative mt-4 flex items-end rounded-l-md border-b-12 border-[#00B8F4] bg-black pr-16 pl-16"
      >
        <p
          class="mb-1 font-['Alibaba_PuHuiTi_3.0',sans-serif] text-[44px] leading-[1.1] font-[1000] tracking-[-0.03em] whitespace-pre-wrap text-stroke-8 text-stroke-[#212121] text-stroke-outer"
        >
          {{ props.title }}
        </p>
        <RhodesIsland
          class="absolute top-1/2 left-2 h-13.5 w-auto -translate-y-1/2 text-[#09F8C4]"
        />
      </div>

      <!-- 中间说明 -->
      <div
        v-if="props.description"
        class="flex min-w-90 flex-row items-center justify-center bg-[#353535] px-5 text-center font-['HarmonyOS_Sans_SC',sans-serif] text-[22px] leading-[1.3] font-medium whitespace-pre-wrap"
      >
        {{ props.description }}
      </div>

      <!-- 右侧统计 -->
      <div class="grid auto-cols-max grid-flow-col grid-rows-2 content-center gap-x-6.5 gap-y-5.5">
        <div
          v-for="(stat, index) in props.stats"
          :key="index"
          class="relative flex flex-row items-center"
        >
          <div
            class="relative ml-7.5 flex h-10.25 min-w-30 items-center justify-end bg-[#353535] ps-10 pe-5 font-['HarmonyOS_Sans_SC',sans-serif] text-[28px] font-medium"
            :style="{
              backgroundColor: itemInfoMap[stat.itemName]?.backgroundColor.string(),
            }"
          >
            <!-- 带无人机加成的格式：例如 "3.6k + 12.5k" -->
            <template v-if="stat.itemCount.includes(' + ')">
              {{ stat.itemCount.split(' + ')[0] }}
              +
              <img
                alt="无人机"
                class="mx-1 h-[30px] w-auto drop-shadow-[0_0_2px_black]"
                referrerpolicy="no-referrer"
                src="@/assets/images/riic/icon_labor.webp"
              />
              {{ stat.itemCount.split(' + ')[1] }}
            </template>
            <!-- 普通格式：例如 "5.239" -->
            <template v-else>
              {{ stat.itemCount }}
            </template>
          </div>
          <img
            :alt="stat.itemName"
            class="absolute size-15"
            referrerpolicy="no-referrer"
            :src="itemInfoMap[stat.itemName]?.imageUrl"
          />
        </div>
      </div>
    </div>

    <!-- 排班表内容 -->
    <div class="schedule-content-container">
      <div ref="contentElement" class="schedule-content">
        <div v-for="(stationLine, lineIndex) in props.lines" :key="lineIndex" class="schedule-line">
          <div class="queue-descriptions">
            <div
              v-for="(description, queueIndex) in props.queueDescriptions"
              :key="queueIndex"
              class="queue-description"
            >
              {{ `队列 ${queueIndex + 1}` }}<br />{{ description }}
            </div>
          </div>
          <div class="stations">
            <RiicStation
              v-for="(station, stationIndex) in stationLine"
              :key="stationIndex"
              v-bind="station"
            />
          </div>
        </div>
        <div v-if="false" class="watermark">@逻辑元LogicalByte</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule {
  position: relative;
  display: flex;
  flex-direction: column;
  inline-size: 1920px;
  block-size: 1080px;
  overflow: hidden;
  /* pointer-events: none; */ /* 禁止交互 */
  /* user-select: none; */ /* 禁止选中 */
  background-color: black;
  isolation: isolate; /* 创建新的堆叠上下文，确保子元素的 z-index 不受外部影响 */
}

.background-image {
  position: absolute;
  z-index: -1;
  inline-size: 100%;
  block-size: 100%;
}

.schedule-content-container {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.schedule-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.schedule-line {
  display: flex;
  flex-direction: row;
  gap: 32px;
}

.queue-descriptions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  inline-size: fit-content;
}

.queue-description {
  margin-block: 20px;
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 50px;
  font-weight: 600;
  line-height: 1.3em;
  color: black;
  text-align: center;
  text-wrap: nowrap;
}

.stations {
  display: flex;
  flex-direction: row;
  gap: 80px;
}

.watermark {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  font-family: 'Alibaba PuHuiTi 3.0', sans-serif;
  font-size: 120px;
  font-weight: 700;
  color: rgb(255 255 255 / 50%);
  transform: translate(-50%, -50%);
}
</style>
