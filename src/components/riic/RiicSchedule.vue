<script setup lang="ts">
import RiicYituliuDecoration from '@/components/icons/RiicYituliuDecoration.vue';
import Station from '@/components/riic/RiicStation.vue';
import type { ScheduleType } from '@/types/riic';
import type { ColorInstance } from 'color';
import Color from 'color';
import { nextTick, onMounted, useTemplateRef, watch } from 'vue';

const props = defineProps<ScheduleType>();

const contentElement = useTemplateRef('contentElement');

interface itemInfo {
  imageUrl: string;
  backgroundColor: ColorInstance;
}

// const baseApIconUrl = 'https://torappu.prts.wiki/assets/item_icon/raw/AP_BASE.png';

const itemInfoMap: Record<string, itemInfo> = {
  EXP: {
    imageUrl: 'https://torappu.prts.wiki/assets/item_icon/sprite_exp_card_t3.png',
    backgroundColor: Color('#ffd80080'),
  },
  贵金属: {
    imageUrl: 'https://torappu.prts.wiki/assets/item_icon/MTL_GOLD3.png',
    backgroundColor: Color('#dd653f80'),
  },
  龙门币: {
    imageUrl: 'https://torappu.prts.wiki/assets/item_icon/GOLD.png',
    backgroundColor: Color('#0075a980'),
  },
  合成玉: {
    imageUrl: 'https://torappu.prts.wiki/assets/item_icon/DIAMOND_SHD.png',
    backgroundColor: Color('#ea161680'),
  },
  高级凭证: {
    imageUrl: 'https://torappu.prts.wiki/assets/item_icon/HGG_SHD.png',
    backgroundColor: Color('#ffd80080'),
  },
};

async function adjustContentZoom() {
  if (contentElement.value) {
    contentElement.value.style.zoom = '1';
    await nextTick();
    const scaleX = (2160 * 0.95) / contentElement.value.clientWidth;
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
      src="@/assets/images/riic/基建解析UI_背景_2511111452_BioHazard.webp"
    />

    <!-- 排班表标题 -->
    <div class="schedule-title">
      <!-- 左侧块 -->
      <div class="left-block">
        <div class="bar"></div>
        <div class="left-content">{{ props.title }}</div>
        <RiicYituliuDecoration class="decoration" />
      </div>

      <!-- 中间说明 -->
      <div v-if="props.description" class="middle-block">{{ props.description }}</div>

      <!-- 右侧统计 -->
      <div class="stats-block">
        <div v-for="(stat, index) in props.stats" :key="index" class="stats-item">
          <div
            class="item-count"
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
                class="base-ap-icon"
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
            <Station
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
  inline-size: 2160px;
  block-size: 1080px;
  overflow: hidden;
  pointer-events: none; /* 禁止选中 */
  user-select: none; /* 禁止选中 */
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
  gap: 40px;
  align-items: stretch;
  block-size: 120px;
  margin-block-start: 12px;
  margin-inline-start: 13px;
  color: #ededed;
}

.left-block {
  display: flex;
  flex-direction: row;
}

.bar {
  inline-size: 17px;
  background: var(--color-primary);
}

.left-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-inline: 20px 80px;
  font-family: 'Alibaba PuHuiTi 3.0', sans-serif;
  font-size: 48px;
  font-weight: 1000;
  line-height: 1.1;
  letter-spacing: -0.03em;
  white-space: pre-wrap;
  background-color: #353535;
}

.decoration {
  inline-size: auto;
  block-size: 54px;
  margin-inline-start: -47px;
}

.middle-block {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-inline-size: 360px;
  padding-inline: 20px;
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 22px;
  font-weight: 500;
  line-height: 1.3;
  text-align: center;
  white-space: pre-wrap;
  background-color: #353535;
}

.stats-block {
  display: grid;
  grid-template-rows: repeat(2, auto); /* 2 行 */
  grid-auto-columns: max-content; /* 列宽随内容 */
  grid-auto-flow: column; /* 列优先 */
  gap: 22px 26px;
  align-content: center; /* 整个表格居中 */
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
  background-color: #353535; /* 由具体物品决定 */
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
  color: white;
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
