<script setup lang="ts">
import type { BuffUnlockCondition } from '@/types/gameData';
import { updateText } from '@/utils/autoFontSizing';
import { getBaseSkillIconUrl } from '@/utils/dataSources';
import { getCharName } from '@/utils/gameData/character';
import { gameData } from '@/utils/gameData/gameData';
import { parseRichTextSegments } from '@/utils/richText';
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
              <div class="skill-icon-and-name">
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
                <span>{{ gameData?.buildingData.buffs[buffDataItem.buffId]!.buffName }}</span>
              </div>
            </td>
            <td class="td-buff-description">
              <RichTextDescription
                :segments="
                  parseRichTextSegments(
                    gameData?.buildingData.buffs[buffDataItem.buffId]!.description ?? '',
                    gameData?.gameDataConst.richTextStyles ?? {},
                  )
                "
              />
            </td>
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
  inline-size: 1700px;
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
  background-color: white;
}

.operator-name {
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-weight: bold;
  color: #333333;
  white-space: nowrap;
}

.riic-skill-table {
  inline-size: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.td-buff-index,
.td-buff-cond,
.td-buff-name,
.td-buff-description {
  border: 10px solid #dddddd;
}

.td-buff-index {
  inline-size: 54px;
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
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 32px;
  font-weight: 500;
  line-height: 1.3;
  color: #222222;
  letter-spacing: -0.02em;
  background-color: #ffffff;
}

.td-buff-cond {
  inline-size: 128px;
  padding-block: 20px;
  padding-inline: 24px;
  text-align: center;
}

.td-buff-name {
  inline-size: 368px;
  padding-block: 20px;
  padding-inline: 20px;
  text-align: left;
}

.td-buff-description {
  padding-block: 20px;
  padding-inline: 24px;
  text-align: left;
}

.skill-icon-and-name {
  display: flex;
  gap: 20px;
  align-items: center;
  justify-content: flex-start;
}

.skill-icon {
  inline-size: 54px;
  block-size: 54px;
  filter: drop-shadow(0 0 4px rgb(0 0 0 / 50%));
}
</style>
