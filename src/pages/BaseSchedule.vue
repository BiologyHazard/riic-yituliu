<script setup lang="ts">
import { useExportImage } from '@/composables/useExportImage';
import { useToastWithProgress } from '@/composables/useToastWithProgress';
import { parseSchedule } from '@/utils/riic/parseScheduleInput';
import type { NavigationMenuItem } from '@nuxt/ui';
import { refThrottled, useElementSize } from '@vueuse/core';
import { computed, nextTick, onMounted, ref, useTemplateRef } from 'vue';

// --- 排班表预设 ---

// 导入预设排班表（按文件夹分组）
let scheduleFiles = import.meta.glob('@/assets/texts/schedule/**/*.txt', {
  eager: true,
  query: 'raw',
  import: 'default',
}) as Record<string, string>;
// 键转为相对于 schedule/ 的路径
scheduleFiles = Object.fromEntries(
  Object.entries(scheduleFiles).map(([path, content]) => {
    const relativePath = path.replace(/^.*\/schedule\//, '');
    return [relativePath, content];
  }),
);

const toast = useToast();

function onSelectPreset(path: string, content: string): void {
  const description = path.replace(/^.*\//, '').replace(/\.txt$/, '');
  rawInput.value = content;
  toast.add({
    title: '已应用排班表预设',
    description,
    icon: 'i-lucide-check-circle',
    color: 'success',
  });
}

const navigationMenuItems = computed<NavigationMenuItem[]>(() => {
  const roots: NavigationMenuItem[] = [];
  const nodeMap = new Map<string, NavigationMenuItem>();

  for (const [path, content] of Object.entries(scheduleFiles)) {
    const segments = path.split('/');
    let parentArray = roots;
    let parentKey: string | null = null;

    for (const [i, segment] of segments.entries()) {
      const currentKey: string = parentKey !== null ? `${parentKey}/${segment}` : segment;

      if (i === segments.length - 1) {
        // 文件
        parentArray.push({
          label: segment,
          value: path,
          icon: 'i-lucide-file-text',
          onSelect: () => onSelectPreset(path, content),
        });
      } else {
        // 目录
        let dir = nodeMap.get(currentKey);
        if (dir === undefined) {
          // 如果目录不存在，则创建一个新的目录节点
          dir = {
            label: segment,
            value: currentKey,
            icon: 'i-lucide-folder', // 想要在使用 UNavigationMenu 的情况下，根据文件夹展开情况切换图标疑似是做不到的，根本没办法知道展开了哪些文件夹
            children: [],
          };
          parentArray.push(dir);
          nodeMap.set(currentKey, dir);
        }
        parentArray = dir.children!;
        parentKey = currentKey;
      }
    }
  }

  return roots;
});

// --- 排班表编辑器 ---

const exampleKey =
  Object.keys(scheduleFiles).find((k) =>
    k.includes('右满 252（2 赤金）一天两换 2026-01-09-10-47'),
  ) ?? '';
const exampleInput: string = scheduleFiles[exampleKey] ?? '';

const textareaRef = useTemplateRef('textareaRef');

/**
 * 输入框内容
 */
const rawInput = ref<string>(exampleInput);

/**
 * 解析后的数据
 */
const data = computed(() => parseSchedule(rawInput.value));

// --- 排班表预览 ---

/** 外层容器，用于绑定 useElementSize 监听宽度变化 */
const outputPanelRef = useTemplateRef('outputPanelRef');
/** 排班表组件外面包的 div，用于导出图片 */
const riicScheduleRef = useTemplateRef('riicScheduleRef');

/** 预览宽度模式 */
const previewWidthMode = ref<'scroll' | 'overflow'>('scroll');
/** 缩放模式：自动适应父容器宽度，或指定倍率 */
const zoomRef = ref<number | 'auto'>('auto');

// 自动缩放且滚动模式下，通过 useElementSize 监听容器宽度变化
const { width: containerWidth } = useElementSize(outputPanelRef);
// 自动缩放且溢出模式下，监听窗口可见区域宽度
const { width: viewportWidth } = useElementSize(() => document.getElementById('main'));
// 对宽度值做节流，避免频繁缩放导致卡顿
const containerWidthThrottled = refThrottled(containerWidth, 250);
const viewportWidthThrottled = refThrottled(viewportWidth, 250);
// 只在组件挂载时获取一次排班表宽度，避免抖动
const scheduleWidth = ref<number>(1920);
onMounted(() => {
  if (riicScheduleRef.value) {
    scheduleWidth.value = riicScheduleRef.value.clientWidth;
  }
});

/** 实际生效的缩放值（自动缩放时返回计算后的值，手动指定时返回用户选择的值） */
const effectiveZoom = computed<number>(() => {
  if (zoomRef.value === 'auto') {
    // 自动缩放模式下，计算缩放值
    // 滚动模式 → 缩放到父容器宽度；溢出模式 → 缩放到可见区域宽度
    const targetWidth =
      previewWidthMode.value === 'overflow'
        ? viewportWidthThrottled.value
        : containerWidthThrottled.value;
    if (scheduleWidth.value > 0 && targetWidth > 0) {
      return targetWidth / scheduleWidth.value;
    } else {
      return 1;
    }
  } else {
    // 手动指定缩放模式，直接返回用户选择的值
    return zoomRef.value;
  }
});

// --- 导出图片 ---

const isExporting = ref<boolean>(false);

const { exportFormat, exportQuality, exportPixelRatio, ensureFontEmbedCSS, exportTargetAsImage } =
  useExportImage();

async function exportAsImage(): Promise<void> {
  if (!riicScheduleRef.value || isExporting.value) {
    return;
  }

  isExporting.value = true;

  const { initToast, updateProgress, completeToast, failToast } = useToastWithProgress();
  initToast({ title: '导出排班表图片', description: '正在准备…' });
  await nextTick();

  try {
    updateProgress(1 / 10, { description: '正在嵌入字体…' });
    await ensureFontEmbedCSS(riicScheduleRef.value);

    updateProgress(4 / 10, { description: '正在生成图片…' });
    await exportTargetAsImage(riicScheduleRef.value, 'arknights-schedule');

    updateProgress(8 / 10, { description: '正在下载…' });
    completeToast({ title: '导出完成', description: '排班表图片已成功导出！' });
  } catch (error) {
    console.error('Failed to export image:', error);
    failToast({
      title: '导出失败',
      description: error instanceof Error ? error.message : '导出失败，请重试',
    });
  } finally {
    isExporting.value = false;
  }
}
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
            <UNavigationMenu
              :items="navigationMenuItems"
              orientation="vertical"
              type="single"
              :ui="{ link: 'text-toned', linkLeadingIcon: 'text-toned' }"
              variant="pill"
            />
          </template>

          <template #editor>
            <div class="mbe-4 flex flex-wrap items-center gap-2">
              <UButton variant="subtle" @click="void (rawInput = '')">清空内容</UButton>
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
                v-model="previewWidthMode"
                color="neutral"
                :content="false"
                :items="[
                  { label: '滚动', value: 'scroll' },
                  { label: '溢出', value: 'overflow' },
                ]"
                :ui="{ list: 'ring ring-accented ring-inset' }"
                variant="pill"
              />

              <UTabs
                v-model="zoomRef"
                color="neutral"
                :content="false"
                :items="[
                  { label: '自动', value: 'auto' },
                  { label: '0.5x', value: 0.5 },
                  { label: '1x', value: 1 },
                  { label: '2x', value: 2 },
                ]"
                :ui="{ list: 'ring ring-accented ring-inset' }"
                variant="pill"
              />

              <UButton
                class="rounded-lg"
                color="neutral"
                leading-icon="i-lucide-maximize"
                variant="subtle"
                @click="riicScheduleRef?.requestFullscreen()"
                >全屏预览排班表</UButton
              >

              <UFieldGroup>
                <UButton
                  class="rounded-lg"
                  icon="i-lucide-download"
                  label="导出图片"
                  :loading="isExporting"
                  variant="subtle"
                  @click="exportAsImage"
                />

                <ExportImageSettings
                  v-model:export-format="exportFormat"
                  v-model:export-pixel-ratio="exportPixelRatio"
                  v-model:export-quality="exportQuality"
                  :disabled="isExporting"
                />
              </UFieldGroup>
            </div>

            <div
              ref="outputPanelRef"
              :class="{
                'overflow-x-auto': previewWidthMode === 'scroll',
                'overflow-x-visible': previewWidthMode === 'overflow',
                'relative left-1/2 w-fit -translate-x-1/2':
                  previewWidthMode === 'overflow' && zoomRef === 'auto',
              }"
            >
              <div :style="{ zoom: effectiveZoom }">
                <div ref="riicScheduleRef" class="w-fit">
                  <RiicSchedule v-bind="data" />
                </div>
              </div>
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
