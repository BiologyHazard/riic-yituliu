<script setup lang="ts">
import { type CharDataType } from '@/types/riic';
import { computed, nextTick, useTemplateRef, watch } from 'vue';
import OperatorAvatar from './OperatorAvatar.vue';
import { getCharacterIdbyName } from '@/utils/character';


const props = defineProps<CharDataType>();

/**
 * 获取干员头像 URL
 */
function getAvatarUrl({ operatorName, eliteLevel }: CharDataType = props): string {
    return eliteLevel !== null
        ? `/images/avatars/avatar_${operatorName}_${eliteLevel}.png`
        : `/images/avatars/avatar_${operatorName}.png`;
}

const charId = computed(() => getCharacterIdbyName(props.operatorName) ?? '');
const eliteLevel = computed(() => props.eliteLevel ?? 0);

/**
 * 计算字体大小以适应容器宽度
 * @param element 需要调整字体大小的文本元素
 * @param minFontSize 最小字体大小
 * @param maxFontSize 最大字体大小
 */
function updateText(element: HTMLElement, containerWidth: number, minFontSize: number = 16, maxFontSize: number = 32) {
    if (!element.textContent) return;

    let fontSize: number = maxFontSize;
    element.style.fontSize = `${fontSize}px`;
    nextTick(() => {
        if (element.scrollWidth > containerWidth) {
            fontSize = Math.max(fontSize * containerWidth / element.scrollWidth, minFontSize);
            element.style.fontSize = `${fontSize}px`;
        }
    });
}

const operatorNameContainerRef = useTemplateRef<HTMLElement>('operatorNameContainerRef');
const operatorNameRef = useTemplateRef<HTMLElement>('operatorNameRef');

watch(
    [props, operatorNameRef],
    () => {
        if (operatorNameRef.value) {
            updateText(
                operatorNameRef.value,
                (operatorNameContainerRef.value?.clientWidth || 180) * 0.98,
                18,
                36,
            );
        }
    },
);
</script>

<template>
    <div class="operator-card">
        <div class="avatar-container">
            <!-- <img class="avatar" :src="getAvatarUrl()" :alt="operatorName"> -->
            <OperatorAvatar :char-id="charId" :elite-level="eliteLevel" show-background-image show-elite-level />
        </div>
        <div id="operatorNameContainer" class="operator-name-container" ref="operatorNameContainerRef">
            <span id="operatorName" class="operator-name" ref="operatorNameRef">{{ operatorName }}</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
// 导入所需字体
@use '@/assets/css/fonts/HarmonyOS_Sans_SC.scss';

// .operator-card {
//     display: inline-flex;
//     flex-direction: column;
//     align-items: center;
// }

// 头像容器
.avatar-container {
    // position: relative;
    width: 180px;
    height: 180px;
}

// 头像样式
// .avatar {
//     width: 100%;
//     height: 100%;
//     object-fit: cover;
//     object-position: top center;
// }

// 干员名称样式
.operator-name-container {
    background-color: #1f1f1f;
    text-align: center;
    width: 180px;
    height: 46px;
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
