<script setup lang="ts">
import { type CharDataType } from '@/types/riic';
import { updateText } from '@/utils/autoFontSizing';
import { useTemplateRef, watch } from 'vue';
import OperatorAvatar from './OperatorAvatar.vue';

const props = defineProps<CharDataType>();

const operatorNameContainerRef = useTemplateRef<HTMLElement>('operatorNameContainerRef');
const operatorNameRef = useTemplateRef<HTMLElement>('operatorNameRef');

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
        :char-id="props.charId"
        :elite-level="props.eliteLevel ?? 0"
        :is-tired="props.isTired"
        show-background-image
        :show-elite-level="props.eliteLevel !== null"
      />
    </div>
    <div id="operatorNameContainer" class="operator-name-container" ref="operatorNameContainerRef">
      <span id="operatorName" class="operator-name" ref="operatorNameRef">{{
        props.displayName
      }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
// 头像容器
.avatar-container {
  // position: relative;
  width: 180px;
  height: 180px;
}

// 干员名称样式
.operator-name-container {
  // position: absolute;
  // bottom: 0;
  width: 180px;
  height: 46px;
  background-color: #1f1f1f;
  text-align: center;
}

.operator-name {
  display: inline-block;
  max-width: 100%;
  color: white;
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-weight: 500;
  font-size: 36px;
  line-height: 46px;
  // letter-spacing: -0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
