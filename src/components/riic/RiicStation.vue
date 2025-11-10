<script setup lang="ts">
import { type StationType } from '@/types/riic';
import { bgColorMap, fontColorMap } from '@/utils/colorMap';
import type { ColorInstance } from 'color';
import Color from 'color';
import OperatorCard from './OperatorCard.vue';

/**
 * 获取左侧标题栏背景色
 */
function getLeftBackgroundColor(stationType: string): ColorInstance {
  return bgColorMap.get(stationType) ?? Color('#299DFF');
}

/**
 * 获取右侧内容区背景色，为左侧颜色的半透明版本
 */
function getRightBackgroundColor(stationType: string): ColorInstance {
  const leftBackgroundColor = getLeftBackgroundColor(stationType);
  return leftBackgroundColor.alpha(leftBackgroundColor.alpha() * 0.5);
}

/**
 * 获取左侧标题栏文本颜色
 */
function getLeftTextColor(stationType: string): ColorInstance {
  return fontColorMap.get(stationType) ?? Color('white');
}

/**
 * 获取右侧内容区文本颜色
 */
function getRightTextColor(): ColorInstance {
  return Color('white');
}

const props = defineProps<StationType>();
</script>

<template>
  <div class="trade-station-container">
    <!-- 左侧标签栏 -->
    <div class="station-label">{{ props.title }}</div>

    <!-- 右侧内容区 -->
    <div class="content-area">
      <div class="operator-queue" v-for="(row, index) in props.queues" :key="index">
        <div class="operator-row">
          <OperatorCard v-for="(char, index) in row.chars" :key="index" v-bind="char" />
        </div>
        <div class="description">{{ row.description }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// 容器样式
.trade-station-container {
  display: flex;
  flex-direction: row;
}

// 左侧标题样式
.station-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  background-color: v-bind('getLeftBackgroundColor(props.stationType).string()');
  color: v-bind('getLeftTextColor(props.stationType).string()');
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-weight: 700;
  font-size: 46px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  // letter-spacing: -1px;
  // padding: 10px 0;
}

// 右侧内容区样式
.content-area {
  background-color: v-bind('getRightBackgroundColor(props.stationType).string()');
  display: flex;
  flex-direction: column;
  padding: 16px;
}

// 队列样式
.operator-queue:not(:last-child) {
  margin-bottom: 16px;
}

// 干员行样式
.operator-row {
  display: flex;
  flex-direction: row;
  height: calc(180px + 46px);
}

// 描述文本样式
.description {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1.2em;
  color: v-bind('getRightTextColor().string()');
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-weight: 500;
  font-size: 42px;
  text-align: center;
  // margin-top: 8px;
}
</style>
