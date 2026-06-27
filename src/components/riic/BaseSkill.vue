<script setup lang="ts">
import type { BuffUnlockCondition } from '@/types/gameData';
import { updateText } from '@/utils/autoFontSizing';
import { getCharName } from '@/utils/character';
import { getBaseSkillIconUrl } from '@/utils/dataSources';
import { gameData } from '@/utils/gameData';
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
  <div v-if="buildingCharDataRef !== undefined" class="riic-skill">
    <div>
      <OperatorAvatar
        :char-id="props.charId"
        :elite-level="0"
        :is-tired="false"
        show-background-image
        show-profession
        show-rarity
      />
      <div class="operator-name-container">
        <span ref="operatorNameElement" class="operator-name">{{ getCharName(props.charId) }}</span>
      </div>
    </div>
    <table class="riic-skill-table">
      <tbody>
        <template
          v-for="(buffCharItem, buffCharIndex) in buildingCharDataRef.buffChar"
          :key="buffCharIndex"
        >
          <tr v-for="(buffDataItem, buffDataIndex) in buffCharItem.buffData" :key="buffDataIndex">
            <td
              v-if="buffDataIndex === 0"
              class="td-buff-index"
              :rowspan="buffCharItem.buffData.length"
              :style="{
                color: gameData?.buildingData.buffs[buffDataItem.buffId]!.textColor,
                backgroundColor: gameData?.buildingData.buffs[buffDataItem.buffId]!.buffColor,
              }"
            >
              {{ buffCharIndex + 1 }}
            </td>
            <td class="td-buff-cond">{{ getCondText(buffDataItem.cond) }}</td>
            <td class="td-buff-name">
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
              <span class="buff-name-text">{{
                gameData?.buildingData.buffs[buffDataItem.buffId]!.buffName
              }}</span>
            </td>
            <!-- eslint-disable vue/no-v-html -->
            <td
              class="td-buff-description"
              v-html="
                parseRichTextDescription(
                  gameData?.buildingData.buffs[buffDataItem.buffId]!.description ?? '',
                )
              "
            ></td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.riic-skill {
  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  inline-size: 1920px;
  padding-block: 24px;
  padding-inline: 34px 24px;
  background-image: linear-gradient(185deg, #191919, #424242);
}

.operator-avatar {
  inline-size: 180px;
  block-size: 180px;
}

.operator-name-container {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 180px;
  block-size: 40px;
  margin-block-start: 6px;
  background-color: #181818;
}

.operator-name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Alibaba PuHuiTi 3.0', sans-serif;
  font-weight: 700;
  color: white;
  white-space: nowrap;
}

.riic-skill-table {
  inline-size: 100%;
  table-layout: fixed;
  border-spacing: 10px;
  border-collapse: separate;
}

.td-buff-index {
  inline-size: 48px;
  font-family: 'Outfit', sans-serif;
  font-size: 72px;
  font-weight: 900;
  line-height: 1;
  vertical-align: top;
  text-align: center;
}

.td-buff-cond,
.td-buff-name,
.td-buff-description {
  padding-block: 24px;
  padding-inline: 28px;
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 36px;
  font-weight: 500;
  line-height: 1.3;
  color: #222222;
  letter-spacing: -0.02em;
  background-color: #e3e3e3;
}

.td-buff-cond {
  inline-size: 132px;
  text-align: center;
}

.td-buff-name {
  position: relative;
  inline-size: 384px;
  text-align: left;
}

.td-buff-description {
  text-align: left;
}

.skill-icon {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 20px;
  inline-size: 60px;
  block-size: 60px;
  /* transform: translate(0, -50%); */
  margin-block-start: -30px;
}

.buff-name-text {
  margin-inline-start: 72px;
}
</style>
