<script setup lang="ts">
import type { BuffUnlockCondition } from '@/types/gameData';
import { updateText } from '@/utils/autoFontSizing';
import { getBaseSkillIconUrl } from '@/utils/dataSources';
import { gameData } from '@/utils/gameData/gameData';
import { computed, useTemplateRef, watch } from 'vue';

const props = defineProps<{ charId: string }>();
const buildingCharDataRef = computed(() => gameData.value?.buildingData.chars[props.charId]);
const operatorNameElement = useTemplateRef('operatorNameElement');

function getCondText({ phase, level }: BuffUnlockCondition): string {
  const eliteLevel = typeof phase === 'number' ? phase : Number(phase.replace(/^PHASE_/, ''));
  if (eliteLevel === 0 && level === 1) {
    return '初始';
  } else if (eliteLevel === 0 && level === 30) {
    return '30级';
  } else {
    return `精${eliteLevel}`;
  }
}

/**
 * 解析富文本描述，将标签转换为带样式的 HTML
 * @param description 富文本描述字符串
 * @returns 解析后的 HTML 字符串
 */
function parseRichTextDescription(description: string): string {
  let result = description;

  // 解析所有标签
  result = result.replace(/<([^>]+)>/g, (match, content) => {
    // 结束标签
    if (content === '/') {
      return '</span>';
    }

    // 开始标签
    const isStyleTag = content.startsWith('@');
    const isTermTag = content.startsWith('$');

    if (isStyleTag) {
      const styleKey = content.substring(1);
      const styleTemplate = gameData.value?.gameDataConst.richTextStyles[styleKey];

      if (styleTemplate) {
        // 提取颜色值
        const colorMatch = styleTemplate.match(/<color=(#[0-9A-Fa-f]{6})>/);
        if (colorMatch) {
          return `<span style="color: ${colorMatch[1]}">`;
        }
        // 处理斜体
        if (styleTemplate.includes('<i>')) {
          return '<span style="font-style: italic">';
        }
      }
      return '<span>';
    } else if (isTermTag) {
      // 术语标签 - 添加下划线
      return '<span style="text-decoration: underline; text-underline-position: under">';
    }

    return '';
  });

  return result;
}

watch([props, operatorNameElement], () => {
  if (operatorNameElement.value) {
    updateText(operatorNameElement.value, 180 * 0.95, 16, 32);
  }
});
</script>

<template>
  <div class="showcase-container">
    <div class="background" data-ignore-export />
    <div class="black-rect" data-ignore-export />
    <div v-if="buildingCharDataRef !== undefined" class="riic-skill">
      <template
        v-for="(buffCharItem, buffCharIndex) in buildingCharDataRef.buffChar"
        :key="buffCharIndex"
      >
        <div
          v-for="(buffDataItem, buffDataIndex) in buffCharItem.buffData"
          :key="buffDataIndex"
          class="line"
        >
          <div class="skill-index-cond">
            <div
              class="skill-index"
              :style="{
                color: gameData?.buildingData.buffs[buffDataItem.buffId]!.textColor,
                backgroundColor: gameData?.buildingData.buffs[buffDataItem.buffId]!.buffColor,
              }"
            >
              {{ buffCharIndex + 1 }}
            </div>
            <div class="skill-cond">{{ getCondText(buffDataItem.cond) }}</div>
          </div>
          <div class="skill-icon-name-description">
            <div class="skill-icon-name">
              <img
                :alt="gameData?.buildingData.buffs[buffDataItem.buffId]!.buffName"
                class="skill-icon"
                referrerpolicy="no-referrer"
                :src="
                  getBaseSkillIconUrl(
                    gameData?.buildingData.buffs[buffDataItem.buffId]!.skillIcon ?? '',
                  )
                "
              />
              <span class="skill-name">{{
                gameData?.buildingData.buffs[buffDataItem.buffId]!.buffName
              }}</span>
            </div>
            <!-- eslint-disable vue/no-v-html -->
            <p
              class="skill-description"
              v-html="
                parseRichTextDescription(
                  gameData?.buildingData.buffs[buffDataItem.buffId]!.description ?? '',
                )
              "
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.showcase-container {
  position: relative;
  inline-size: 1920px;
  block-size: 1080px;
  overflow: hidden;
}

.background {
  position: absolute;
  inset: 0;
  background-color: lime;
}

.black-rect {
  position: absolute;
  top: 67px;
  left: 50px;
  inline-size: 919px;
  block-size: 79px;
  background-color: black;
}

.riic-skill {
  position: absolute;
  bottom: 151px;
  left: 64px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  inline-size: 960px;
  padding: 10px;
}

.line {
  display: grid;
  grid-template-columns: 154px 1fr;
  inline-size: 100%;
}

.skill-index-cond {
  display: flex;
  overflow: hidden;
  border-radius: 20px;
  corner-shape: superellipse(log(3, 2));
  box-shadow:
    0 10px 20px 0 rgb(0 0 0 / 12.5%),
    0 0 16px 0 rgb(0 0 0 / 12.5%);
}

.skill-index {
  inline-size: 54px;
  font-family: 'Outfit', sans-serif;
  font-size: 72px;
  font-weight: 900;
  line-height: 1;
  vertical-align: top;
  text-align: center;
}

.skill-cond,
.skill-icon-name-description {
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 32px;
  font-weight: 500;
  line-height: 1.3;
  color: #222222;
  letter-spacing: -0.02em;
  background-color: #ffffff;
}

.skill-cond {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.skill-icon-name-description {
  padding-block: 24px;
  padding-inline: 28px;
  margin-left: 10px;
  text-align: left;
  border-radius: 20px;
  corner-shape: superellipse(log(3, 2));
  box-shadow:
    0 10px 20px 0 rgb(0 0 0 / 12.5%),
    0 0 16px 0 rgb(0 0 0 / 12.5%);
}

.skill-icon-name {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 20px;
}

.skill-icon {
  inline-size: 64px;
  block-size: 64px;
  filter: drop-shadow(0 0 4px rgb(0 0 0 / 50%));
}

.skill-name {
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 36px;
  font-weight: bold;
  line-height: 1;
  color: black;
  letter-spacing: -0.02em;
}
</style>
