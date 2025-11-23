<script setup lang="ts">
import OperatorAvatar from '@/components/riic/OperatorAvatar.vue';
import { updateText } from '@/utils/autoFontSizing';
import { getCharName } from '@/utils/character';
import { buildingData, gamedataConst, type BuffUnlockCondition } from '@/utils/gameData';
import { computed, useTemplateRef, watch } from 'vue';

const props = defineProps<{ charId: string }>();
const buildingCharDataRef = computed(() => buildingData.chars[props.charId]);
const operatorNameElement = useTemplateRef('operatorNameElement');

function getSkillIconUrl(skillIcon: string): string {
  return `https://torappu.prts.wiki/assets/build_skill_icon/${skillIcon}.png`;
}

function getCondText({ phase, level }: BuffUnlockCondition): string {
  if (phase === 'PHASE_0' && level === 1) {
    return '初始';
  } else if (phase === 'PHASE_0' && level === 30) {
    return '30级';
  } else {
    const eliteLevel = Number(phase.slice(-1));
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
      const styleTemplate = gamedataConst.richTextStyles[styleKey];

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
  <div class="riic-skill" v-if="buildingCharDataRef !== undefined">
    <div class="operator-card">
      <OperatorAvatar
        :char-id="props.charId"
        :elite-level="0"
        :is-tired="false"
        show-background-image
        show-rarity
        show-profession
      />
      <div class="operator-name-container">
        <span class="operator-name" ref="operatorNameElement">{{ getCharName(props.charId) }}</span>
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
              class="td-buff-index"
              v-if="buffDataIndex === 0"
              :rowspan="buffCharItem.buffData.length"
              :style="{
                color: buildingData.buffs[buffDataItem.buffId]!.textColor,
                backgroundColor: buildingData.buffs[buffDataItem.buffId]!.buffColor,
              }"
            >
              {{ buffCharIndex + 1 }}
            </td>
            <td class="td-buff-cond">{{ getCondText(buffDataItem.cond) }}</td>
            <td class="td-buff-name">
              <img
                class="skill-icon"
                :src="getSkillIconUrl(buildingData.buffs[buffDataItem.buffId]!.skillIcon)"
              />
              <span class="buff-name-text">{{
                buildingData.buffs[buffDataItem.buffId]!.buffName
              }}</span>
            </td>
            <td
              class="td-buff-description"
              v-html="
                parseRichTextDescription(buildingData.buffs[buffDataItem.buffId]!.description)
              "
            ></td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.riic-skill {
  width: 1920px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20px;
  background-image: linear-gradient(185deg, #191919, #424242);
  padding: 24px 24px 24px 34px;
}

.operator-avatar {
  width: 180px;
  height: 180px;
}

.operator-name-container {
  width: 180px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-block-start: 6px;
  background-color: #181818;
}

.operator-name {
  color: white;
  font-family: 'Alibaba PuHuiTi 3.0', var(--sans-font);
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.riic-skill-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 10px;
}

.td-buff-index {
  width: 48px;
  font-family: 'Outfit', var(--sans-font);
  font-weight: 900;
  font-size: 72px;
  text-align: center;
  vertical-align: top;
  line-height: 1;
}

.td-buff-cond,
.td-buff-name,
.td-buff-description {
  padding: 24px 28px;
  background-color: #e3e3e3;
  color: #222222;
  font-family: 'HarmonyOS Sans SC', var(--sans-font);
  font-weight: 500;
  font-size: 36px;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.td-buff-cond {
  width: 128px;
  text-align: center;
}

.td-buff-name {
  width: 384px;
  text-align: left;
  // background-color: #333;
  position: relative;
}

.td-buff-description {
  text-align: left;
}

.skill-icon {
  width: 60px;
  height: 60px;
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translate(0, -50%);
  // border-radius: 50%;
  // background-color: rgba(0, 0, 0, 1);
  // box-shadow: 0 0 0px 6px rgba(0, 0, 0, 1);
}

.buff-name-text {
  margin-inline-start: 72px;
}
</style>
