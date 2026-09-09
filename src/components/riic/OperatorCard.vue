<script setup lang="ts">
import type { CharDataType } from '@/types/riic';
import { updateText } from '@/utils/autoFontSizing';
import { getCharIdByName } from '@/utils/gameData/character';
import { computed, useTemplateRef, watch } from 'vue';

const props = defineProps<CharDataType>();

const operatorNameContainerRef = useTemplateRef<HTMLElement>('operatorNameContainerRef');
const operatorNameRef = useTemplateRef<HTMLElement>('operatorNameRef');

const charId = computed<string | undefined>(() => getCharIdByName(props.displayName));

watch([props, operatorNameRef], () => {
  if (operatorNameRef.value) {
    updateText(
      operatorNameRef.value,
      (operatorNameContainerRef.value?.clientWidth || 180) * 0.95,
      18,
      36,
    );
  }
});
</script>

<template>
  <div class="operator-card">
    <div class="avatar-container">
      <OperatorAvatar
        v-if="charId"
        :char-id="charId"
        :char-name="props.displayName"
        :elite-level="props.eliteLevel ?? 0"
        :is-tired="props.isTired"
        :show-elite-level="props.eliteLevel !== null"
      />
      <div v-else aria-label="未知干员头像" class="unknown-avatar" role="img">?</div>
    </div>
    <div id="operatorNameContainer" ref="operatorNameContainerRef" class="operator-name-container">
      <span id="operatorName" ref="operatorNameRef" class="operator-name">{{
        props.displayName
      }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 头像容器 */
.avatar-container {
  inline-size: 180px;
  block-size: 180px;
}

.unknown-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  block-size: 100%;
  font-family: 'Outfit', sans-serif;
  font-size: 112px;
  font-weight: 700;
  color: #666666;
  background-color: #f2f2f2;
  border: 8px solid #ffffff;
}

/* 干员名称样式 */
.operator-name-container {
  inline-size: 180px;
  block-size: 46px;
  text-align: center;
  background-color: #ffffff;
}

.operator-name {
  display: inline-block;
  max-inline-size: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 36px;
  font-weight: 500;
  line-height: 46px;
  color: black;
  white-space: nowrap;
}
</style>
