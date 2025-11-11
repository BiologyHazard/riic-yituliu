<script setup lang="ts">
import RiicSchedule from '@/components/riic/RiicSchedule.vue';
import { type ScheduleType } from '@/types/riic';
import { parseSchedule } from '@/utils/riic/parseScheduleInput';
import { ref, useTemplateRef, watch } from 'vue';

// 导入预设排班表
/**
 * 预设排班表文件对象
 * key: 文件名（不含扩展名）
 * value: 文件内容字符串
 */
let scheduleFiles = import.meta.glob('@/assets/texts/schedule/*.txt', {
  eager: true,
  query: 'raw',
  import: 'default',
}) as Record<string, string>;
scheduleFiles = Object.fromEntries(
  Object.entries(scheduleFiles).map(([path, resolver]) => {
    let fileName = path.split('/').pop() || '';
    fileName = fileName.endsWith('.txt') ? fileName.slice(0, -4) : fileName;
    return [fileName, resolver];
  }),
);

const exampleInput: string = scheduleFiles['右满 252（2 赤金）一天两换'] ?? '';

/**
 * 输入框内容
 */
const rawInput = ref<string>(exampleInput);

/**
 * 解析后的数据
 */
const data = ref<ScheduleType>({
  title: '',
  description: '',
  stats: [],
  queueDescriptions: [],
  lines: [],
});

// 输入框内容变化时，重新解析数据
watch(
  rawInput,
  () => {
    data.value = parseSchedule(rawInput.value || '');
  },
  { immediate: true },
);

const textareaRef = useTemplateRef<HTMLTextAreaElement>('textareaRef');
const outputPanelRef = useTemplateRef<HTMLDivElement>('outputPanelRef');
const overflowRef = ref<'auto' | 'visible'>('auto');
const zoomRef = ref<number>(1);
</script>

<template>
  <h1>基建一图流排班表生成器</h1>

  <details open>
    <summary><h2>排班表预设</h2></summary>
    <div class="schedule-files">
      <div v-for="[name, content] in Object.entries(scheduleFiles)" :key="name">
        <a
          href=""
          @click.prevent="
            () => {
              rawInput = content;
            }
          "
          >{{ name }}</a
        >
      </div>
    </div>
  </details>

  <details open>
    <summary><h2>排班表编辑器</h2></summary>
    <div class="settings">
      <button @click="rawInput = ''">清空内容</button>
      <button @click="textareaRef?.requestFullscreen()">全屏输入</button>
    </div>
    <label for="riic-input"><p>在此粘贴排班文本：</p></label>
    <textarea id="riic-input" ref="textareaRef" v-model="rawInput" rows="30"></textarea>
  </details>

  <details open>
    <summary><h2>排班表预览</h2></summary>
    <div class="settings">
      <div class="radio-group">
        <label>
          <input type="radio" value="auto" v-model="overflowRef" />
          <span class="radio-label">滚动</span>
        </label>
        <label>
          <input type="radio" value="visible" v-model="overflowRef" />
          <span class="radio-label">溢出</span>
        </label>
      </div>
      <button
        @click="
          () => {
            if (outputPanelRef) {
              outputPanelRef.requestFullscreen();
            }
          }
        "
      >
        全屏预览排班表
      </button>
      <div class="radio-group">
        <label>
          <input type="radio" :value="0.5" v-model="zoomRef" />
          <span class="radio-label">0.5x</span>
        </label>
        <label>
          <input type="radio" :value="1" v-model="zoomRef" />
          <span class="radio-label">1x</span>
        </label>
        <label>
          <input type="radio" :value="2" v-model="zoomRef" />
          <span class="radio-label">2x</span>
        </label>
      </div>
    </div>
    <div class="output-panel" ref="outputPanelRef">
      <RiicSchedule class="schedule" v-bind="data" />
    </div>
  </details>

  <details>
    <summary><h2>调试区</h2></summary>
    <textarea readonly rows="30" :value="JSON.stringify(data, null, 2)"></textarea>
  </details>
</template>

<style scoped lang="scss">
h1 {
  text-align: center;
}

.schedule-files div {
  margin-block: 0.8em;
}

button {
  padding: 0.3em 0.5em;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  cursor: pointer;
  color: var(--color-text);
  font-size: 1em;
}

button:hover {
  border-color: var(--color-text);
  background-color: #aaa3;
}

textarea {
  display: block;
  padding: 1em;
  margin-block: 1em;
  border: 1px solid var(--color-border);
  border-radius: 1em;
  background-color: var(--color-code-background);
  color: var(--color-code-text);
  width: 100%;
  font-family: var(--mono-font);
  font-size: 1rem;
  text-wrap: nowrap;
}

.settings {
  margin-block: 1em;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  gap: 1em;
}

.radio-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;
}

input[type='radio'] {
  margin-inline: 0.4em;
}

.output-panel {
  overflow: v-bind('overflowRef');
}

.schedule {
  zoom: v-bind('zoomRef');
}
</style>
