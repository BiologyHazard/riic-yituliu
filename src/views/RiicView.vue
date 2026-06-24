<script setup lang="ts">
import RiicSchedule from '@/components/riic/RiicSchedule.vue';
import { downloadFile } from '@/utils/file';
import { parseSchedule } from '@/utils/riic/parseScheduleInput';
import type { NavigationMenuItem } from '@nuxt/ui';
import { useElementSize } from '@vueuse/core';
import { getFontEmbedCSS, toCanvas, toSvg } from 'html-to-image';
import { computed, ref, useTemplateRef } from 'vue';

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

const navigationMenuItems: NavigationMenuItem[] = (() => {
  let dirSeq = 0;
  const roots: NavigationMenuItem[] = [];

  // 遍历所有文件路径，构建树形结构
  for (const [path, content] of Object.entries(scheduleFiles)) {
    const segments = path.split('/');
    let level = roots;

    for (const [i, segment] of segments.entries()) {
      if (i === segments.length - 1) {
        // 文件
        const label = segment.replace(/\.txt$/, '');
        level.push({
          label: segment,
          icon: 'i-lucide-file-text',
          onSelect: () => {
            rawInput.value = content;
            toast.add({
              title: '已应用排班表预设',
              description: label,
              icon: 'i-lucide-check-circle',
              color: 'success',
            });
          },
        });
      } else {
        // 目录
        let dir = level.find((n) => n.label === segment && n.children);
        if (!dir) {
          // 如果目录尚未创建，则创建一个新的目录节点
          const dirValue = `dir-${dirSeq++}`;
          dir = {
            label: segment,
            value: dirValue,
            icon: 'i-lucide-folder',
            children: [],
          };
          level.push(dir);
        }
        level = dir.children!;
      }
    }
  }

  return roots;
})();

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

// 自动缩放模式下，通过 useElementSize 监听容器宽度变化
const { width: containerWidth } = useElementSize(outputPanelRef);
// 硬编码排班表的宽度为 2160px
const scheduleWidth = ref<number>(2160);

/** 实际生效的缩放值（自动缩放时返回计算后的值，手动指定时返回用户选择的值） */
const effectiveZoom = computed<number>(() => {
  if (zoomRef.value === 'auto') {
    if (scheduleWidth.value > 0 && containerWidth.value > 0) {
      return containerWidth.value / scheduleWidth.value;
    } else {
      return 1;
    }
  }
  return zoomRef.value;
});

// --- 导出图片 ---

const isExporting = ref<boolean>(false);

// 导出选项
const exportFormat = ref<'webp' | 'png' | 'jpeg' | 'svg'>('webp');
const exportQuality = ref<number>(75);
const exportPixelRatio = ref<number>(1);

const mimeTypeMap: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
};

const fileExtensionMap: Record<string, string> = {
  webp: 'webp',
  png: 'png',
  jpeg: 'jpg',
  svg: 'svg',
};

const isQualityEnabled = computed<boolean>(
  () => exportFormat.value === 'webp' || exportFormat.value === 'jpeg',
);

/**
 * 缓存字体嵌入 CSS，避免每次导出都重新下载和编码字体
 */
const cachedFontEmbedCSS = ref<string | null>(null);
const sharedOptions = computed(() => ({
  pixelRatio: exportPixelRatio.value,
  fontEmbedCSS: cachedFontEmbedCSS.value ?? undefined,
}));

async function exportAsImage(): Promise<void> {
  if (!riicScheduleRef.value || isExporting.value) {
    return;
  }

  isExporting.value = true;

  try {
    // 首次导出时预计算字体嵌入 CSS
    if (!cachedFontEmbedCSS.value) {
      cachedFontEmbedCSS.value = await getFontEmbedCSS(riicScheduleRef.value);
    }

    const timestamp = new Date().getTime();
    const ext = fileExtensionMap[exportFormat.value];

    if (exportFormat.value === 'svg') {
      const svgDataUrl = await toSvg(riicScheduleRef.value, sharedOptions.value);
      await downloadFile(svgDataUrl, `arknights-schedule-${timestamp}.${ext}`);
    } else {
      const canvas = await toCanvas(riicScheduleRef.value, sharedOptions.value);
      const quality = exportFormat.value !== 'png' ? exportQuality.value / 100 : undefined;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mimeTypeMap[exportFormat.value], quality),
      );
      if (!blob) {
        throw new Error('Failed to create image blob');
      }
      await downloadFile(blob, `arknights-schedule-${timestamp}.${ext}`);
    }
  } catch (error) {
    console.error('Failed to export image:', error);
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
                v-model="previewWidthMode"
                color="neutral"
                :content="false"
                :items="[
                  { label: '滚动', value: 'scroll' },
                  { label: '溢出', value: 'overflow' },
                ]"
                :ui="{ list: 'ring ring-inset ring-accented' }"
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
                :ui="{ list: 'ring ring-inset ring-accented' }"
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
                  color="neutral"
                  icon="i-lucide-download"
                  label="导出图片"
                  :loading="isExporting"
                  variant="subtle"
                  @click="exportAsImage"
                />

                <UPopover
                  :content="{
                    align: 'center',
                    side: 'bottom',
                    sideOffset: 8,
                  }"
                >
                  <UButton
                    class="rounded-lg"
                    color="neutral"
                    :disabled="isExporting"
                    icon="i-lucide-chevron-down"
                    variant="subtle"
                  />

                  <template #content>
                    <div class="flex flex-col gap-4 p-4" style="min-width: 220px">
                      <UFormField label="导出格式">
                        <UTabs
                          v-model="exportFormat"
                          color="neutral"
                          :content="false"
                          :items="[
                            { label: 'WebP', value: 'webp' },
                            { label: 'PNG', value: 'png' },
                            { label: 'JPEG', value: 'jpeg' },
                            { label: 'SVG', value: 'svg' },
                          ]"
                          :ui="{ list: 'ring ring-inset ring-accented' }"
                          variant="pill"
                        />
                      </UFormField>

                      <UFormField :hint="`${exportQuality}%`" label="图片质量">
                        <USlider
                          v-model="exportQuality"
                          :disabled="!isQualityEnabled"
                          :max="100"
                          :min="1"
                          :step="1"
                          tooltip
                        />
                      </UFormField>

                      <UFormField label="图片大小">
                        <UTabs
                          v-model="exportPixelRatio"
                          color="neutral"
                          :content="false"
                          :items="[
                            { label: '0.5x', value: 0.5 },
                            { label: '1x', value: 1 },
                            { label: '2x', value: 2 },
                            { label: '3x', value: 3 },
                            { label: '4x', value: 4 },
                          ]"
                          :ui="{ list: 'ring ring-inset ring-accented' }"
                          variant="pill"
                        />
                      </UFormField>
                    </div>
                  </template>
                </UPopover>
              </UFieldGroup>
            </div>

            <div
              ref="outputPanelRef"
              :class="{
                'overflow-x-auto': previewWidthMode === 'scroll',
                'overflow-x-visible': previewWidthMode === 'overflow',
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
