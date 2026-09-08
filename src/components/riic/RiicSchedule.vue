<script setup lang="ts">
import iconLabor from '@/assets/images/riic/icon_labor.webp';
import type { ScheduleType } from '@/types/riic';
import { getItemIconUrl } from '@/utils/dataSources';
import type { ColorInstance } from 'color';
import Color from 'color';
import { computed, nextTick, onMounted, useTemplateRef, watch } from 'vue';

const props = defineProps<ScheduleType>();

const contentElement = useTemplateRef('contentElement');

interface itemInfo {
  imageUrl: string | undefined;
  backgroundColor: ColorInstance;
  textColor: ColorInstance;
}

const itemInfoMap = computed<Record<string, itemInfo>>(() => ({
  EXP: {
    imageUrl: getItemIconUrl('2003'),
    backgroundColor: Color('#ffd800'),
    textColor: Color('black'),
  },
  贵金属: {
    imageUrl: getItemIconUrl('3003'),
    backgroundColor: Color('#dd653f'),
    textColor: Color('white'),
  },
  龙门币: {
    imageUrl: getItemIconUrl('4001'),
    backgroundColor: Color('#0075a9'),
    textColor: Color('white'),
  },
  合成玉: {
    imageUrl: getItemIconUrl('4003'),
    backgroundColor: Color('#ea1616'),
    textColor: Color('white'),
  },
  高级凭证: {
    imageUrl: getItemIconUrl('4004'),
    backgroundColor: Color('#ffd800'),
    textColor: Color('black'),
  },
}));

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
      src="https://i.postimg.cc/Mq3dL6tP/main-bg.jpg"
    />

    <!-- 排班表标题 -->
    <div class="schedule-title">
      <!-- 左侧块 -->
      <div class="left-block">
        <RhodesIsland class="left-icon" />
        <p class="title-text">
          {{ props.title }}
        </p>
        <img
          class="title-decoration"
          referrerpolicy="no-referrer"
          src="@/assets/images/riic/rhodes.svg"
        />
      </div>

      <!-- 中间说明 -->
      <div v-if="props.description" class="middle-block">
        <img
          class="middle-bg"
          referrerpolicy="no-referrer"
          src="https://i.postimg.cc/Hk5wcCq8/header-title-tex.png"
        />
        <span class="middle-text">{{ props.description }}</span>
      </div>

      <!-- 右侧统计 -->
      <div class="stats-block">
        <div v-for="(stat, index) in props.stats" :key="index" class="stats-item">
          <div
            class="item-count"
            :style="{
              backgroundColor: itemInfoMap[stat.itemName]?.backgroundColor.string(),
              color: itemInfoMap[stat.itemName]?.textColor.string(),
            }"
          >
            <!-- 带无人机加成的格式：例如 "3.6k + 12.5k" -->
            <template v-if="stat.itemCount.includes(' + ')">
              {{ stat.itemCount.split(' + ')[0] }}
              +
              <div
                class="base-ap-icon"
                :style="{
                  backgroundColor: itemInfoMap[stat.itemName]?.textColor.string(),
                  maskImage: `url(${iconLabor})`,
                  maskSize: 'contain',
                  maskMode: 'alpha',
                }"
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
            class="item-image"
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

.schedule-title {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  block-size: 120px;
  margin-block-start: 12px;
  margin-inline-start: 13px;
}

.left-block {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-inline: 16px;
  background-color: black;
  border-bottom: 12px solid #00b8f4;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.left-icon {
  width: auto;
  height: 48px;
  margin-right: 16px;
  color: #09f8c4;
}

.title-text {
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 44px;
  font-weight: 844;
  line-height: 1.1;
  color: white;
  letter-spacing: -2%;
  white-space: pre-wrap;
}

.title-decoration {
  align-self: flex-end;
  width: auto;
  height: 36px;
  margin-bottom: 16px;
  margin-left: 16px;
}

.middle-block {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 360px;
  padding-inline: 20px;
  overflow: hidden;
  background-color: #90f6ff;
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.middle-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: top right;
}

.middle-text {
  position: relative;
  z-index: 1;
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 22px;
  font-weight: 500;
  line-height: 1.3;
  color: black;
  text-align: center;
  white-space: pre-wrap;
}

.stats-block {
  display: grid;
  grid-template-rows: repeat(2, auto); /* 2 行 */
  grid-auto-columns: max-content; /* 列宽随内容 */
  grid-auto-flow: column; /* 列优先 */
  gap: 20px 24px;
  align-content: center; /* 整个表格居中 */
  margin-left: 40px;
}

.stats-item {
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.item-count {
  position: relative;
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: flex-end; /* 右对齐 */
  min-inline-size: 120px;
  block-size: 41px;
  padding-inline: 40px 20px;
  margin-inline-start: 30px;
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 28px;
  font-weight: 500;
}

.base-ap-icon {
  inline-size: auto;
  block-size: 30px;
  margin-inline: 4px;
  filter: drop-shadow(0 0 2px black);
}

.item-image {
  position: absolute;
  inline-size: 60px;
  block-size: 60px;
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
  gap: 80px;
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
  gap: 64px;
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
