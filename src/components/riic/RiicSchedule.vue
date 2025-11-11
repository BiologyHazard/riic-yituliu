<script setup lang="ts">
import Station from '@/components/riic/RiicStation.vue';
import { type ScheduleType } from '@/types/riic';
import Color, { type ColorInstance } from 'color';

const props = defineProps<ScheduleType>();

interface itemInfo {
  imageUrl: string;
  backgroundColor: ColorInstance;
}

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
</script>

<template>
  <div class="schedule">
    <!-- 背景图片 -->
    <img
      class="background-image"
      src="@/assets/images/riic/基建解析UI_背景_2511111452_BioHazard.webp"
      alt="背景"
    />

    <!-- 排班表标题 -->
    <div class="schedule-title">
      <!-- 左侧块 -->
      <div class="left-block">
        <div class="bar"></div>
        <div class="left-content">{{ props.title }}</div>
        <img
          class="decoration"
          src="@/assets/images/riic/基建解析UI_标题后面跟着的那个东西_2510101219_BioHazard.webp"
          alt="标题装饰"
        />
      </div>

      <!-- 中间说明 -->
      <div class="middle-block" v-if="props.description">{{ props.description }}</div>

      <!-- 右侧统计 -->
      <div class="stats-block">
        <div class="stats-item" v-for="(stat, index) in props.stats" :key="index">
          <div
            class="item-count"
            :style="{
              backgroundColor: itemInfoMap[stat.itemName]?.backgroundColor.string(),
            }"
          >
            {{ stat.itemCount }}
          </div>
          <img
            class="item-image"
            :src="itemInfoMap[stat.itemName]?.imageUrl"
            :alt="stat.itemName"
          />
        </div>
      </div>
    </div>

    <!-- 排班表内容 -->
    <div class="schedule-content">
      <div class="schedule-line" v-for="(stationLine, lineIndex) in props.lines" :key="lineIndex">
        <div class="queue-descriptions">
          <div
            class="queue-description"
            v-for="(description, queueIndex) in props.queueDescriptions"
            :key="queueIndex"
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
      <div class="watermark">@逻辑元LogicalByte</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.schedule {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 2160px;
  height: 1080px;
  position: relative;
  overflow: hidden;
  user-select: none; // 禁止选中
  pointer-events: none; // 禁止交互
}

.background-image {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.schedule-title {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 40px;
  height: 120px;
  margin: 12px 0 0 13px;
  color: #ededed;
}

.left-block {
  display: flex;
  flex-direction: row;
}

.bar {
  width: 17px;
  background: var(--color-primary);
}

.left-content {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  // border-left: 17px solid var(--color-primary);
  padding: 0 80px 0 20px;
  background-color: #353535;
  font-family: 'Alibaba PuHuiTi 3.0', sans-serif;
  font-weight: 1000;
  font-size: 48px;
  line-height: 1.1;
  letter-spacing: -0.03em;
  white-space: pre-wrap;
}

.decoration {
  height: 54px;
  margin-left: -47px;
}

.middle-block {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  min-width: 360px;
  padding: 0 20px;
  background-color: #353535;
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-weight: 500;
  font-size: 22px;
  line-height: 1.3;
  text-align: center;
  white-space: pre-wrap;
}

.stats-block {
  display: grid;
  grid-auto-flow: column; // 列优先
  grid-template-rows: repeat(2, auto); // 2 行
  grid-auto-columns: max-content; // 列宽随内容
  align-content: center; // 整个表格居中
  gap: 22px 26px;
}

.stats-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
}

.item-count {
  display: flex;
  justify-content: flex-end; // 右对齐
  align-items: center; // 垂直居中
  min-width: 120px;
  height: 41px;
  background-color: #353535; // 由具体物品决定
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-weight: 500;
  font-size: 28px;
  padding: 0 12px 0 0;
  margin: 0 0 0 30px;
}

.item-image {
  position: absolute;
  width: 60px;
  height: 60px;
}

.schedule-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
  position: relative;
  // zoom: 0.48;
  transform: scale(0.48) translate(-50%, -50%);
  transform-origin: center;
  margin: auto;
}

.schedule-line {
  display: flex;
  flex-direction: row;
  gap: 32px;
}

.queue-descriptions {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  width: fit-content;
}

.queue-description {
  margin: 20px 0;
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 50px;
  line-height: 1.3em;
  font-weight: 600;
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
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(255, 255, 255, 0.5);
  font-family: 'Alibaba PuHuiTi 3.0', sans-serif;
  font-weight: 700;
  font-size: 120px;
  // letter-spacing: -0.03em;
}
</style>
