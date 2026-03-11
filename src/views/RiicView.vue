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

const exampleInput: string = scheduleFiles['右满 252（2 赤金）一天两换 2026-01-09-10-47'] ?? '';

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

const textareaRef = useTemplateRef('textareaRef');
const outputPanelRef = useTemplateRef('outputPanelRef');
const overflowRef = ref<'auto' | 'visible'>('auto');
const zoomRef = ref<number>(1);
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="基建一图流排班表生成器" />

      <UPageBody>
        <UAccordion
          class="space-y-6"
          :default-value="['0', '1', '2']"
          :items="[
            { label: '排班表预设', slot: 'presets' },
            { label: '排班表编辑器', slot: 'editor' },
            { label: '排班表预览', slot: 'preview' },
            { label: '调试区', slot: 'debug' },
          ]"
          type="multiple"
          :ui="{
            label: 'text-2xl font-bold',
            content: 'overflow-visible',
          }"
        >
          <template #presets>
            <div v-for="[name, content] in Object.entries(scheduleFiles)" :key="name">
              <UButton
                class="justify-start"
                color="primary"
                variant="link"
                @click="rawInput = content"
                >{{ name }}</UButton
              >
            </div>
          </template>

          <template #editor>
            <div class="mbe-4 flex flex-wrap items-center gap-2">
              <UButton variant="subtle" @click="rawInput = ''">清空内容</UButton>
              <UButton variant="subtle" @click="textareaRef?.textareaRef?.requestFullscreen()"
                >全屏输入</UButton
              >
            </div>
            <UFormField label="在此粘贴排班文本：">
              <UTextarea
                ref="textareaRef"
                v-model="rawInput"
                class="w-full font-mono"
                :rows="30"
                variant="subtle"
              />
            </UFormField>
          </template>

          <template #preview>
            <div class="mbe-4 flex flex-wrap gap-2">
              <UTabs
                v-model="overflowRef"
                color="neutral"
                :content="false"
                :items="[
                  { label: '滚动', value: 'auto' },
                  { label: '溢出', value: 'visible' },
                ]"
                :ui="{ list: 'ring ring-inset ring-accented' }"
                variant="pill"
              />

              <UTabs
                v-model="zoomRef"
                color="neutral"
                :content="false"
                :items="[
                  { label: '0.5x', value: 0.5 },
                  { label: '1x', value: 1 },
                  { label: '2x', value: 2 },
                ]"
                :ui="{ list: 'ring ring-inset ring-accented' }"
                variant="pill"
              />

              <UButton
                class="rounded-lg"
                color="neutral"
                leading-icon="i-lucide-maximize"
                variant="subtle"
                @click="
                  () => {
                    if (outputPanelRef) outputPanelRef.requestFullscreen();
                  }
                "
                >全屏预览排班表</UButton
              >
            </div>

            <div ref="outputPanelRef" :style="{ overflow: overflowRef }">
              <RiicSchedule :style="{ zoom: zoomRef }" v-bind="data" />
            </div>
          </template>

          <template #debug>
            <UTextarea
              class="w-full font-mono"
              :model-value="JSON.stringify(data, null, 2)"
              readonly
              :rows="30"
              variant="subtle"
            />
          </template>
        </UAccordion>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped lang="scss"></style>
