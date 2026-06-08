<script setup lang="ts">
import RiicSchedule from '@/components/riic/RiicSchedule.vue';
import { downloadFile } from '@/utils/file';
import { parseSchedule } from '@/utils/riic/parseScheduleInput';
import { getFontEmbedCSS, toCanvas, toSvg } from 'html-to-image';
import { computed, nextTick, ref, useTemplateRef } from 'vue';

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
const data = computed(() => parseSchedule(rawInput.value));

const textareaRef = useTemplateRef('textareaRef');
const outputPanelRef = useTemplateRef('outputPanelRef');
const previewWidthMode = ref<'fixed' | 'fit'>('fixed');
const zoomRef = ref<number>(1);
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
  if (!outputPanelRef.value || isExporting.value) {
    return;
  }

  isExporting.value = true;

  let previousPreviewWidthMode: 'fixed' | 'fit';
  let previousZoom: number;

  try {
    previousPreviewWidthMode = previewWidthMode.value;
    previousZoom = zoomRef.value;
    previewWidthMode.value = 'fit';
    zoomRef.value = 1;
    await nextTick();

    // 首次导出时预计算字体嵌入 CSS
    if (!cachedFontEmbedCSS.value) {
      cachedFontEmbedCSS.value = await getFontEmbedCSS(outputPanelRef.value);
    }

    const timestamp = new Date().getTime();
    const ext = fileExtensionMap[exportFormat.value];

    if (exportFormat.value === 'svg') {
      const svgDataUrl = await toSvg(outputPanelRef.value, sharedOptions.value);
      await downloadFile(svgDataUrl, `arknights-schedule-${timestamp}.${ext}`);
    } else {
      const canvas = await toCanvas(outputPanelRef.value, sharedOptions.value);
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
    previewWidthMode.value = previousPreviewWidthMode!;
    zoomRef.value = previousZoom!;
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
                v-model="previewWidthMode"
                color="neutral"
                :content="false"
                :items="[
                  { label: '滚动', value: 'fixed' },
                  { label: '溢出', value: 'fit' },
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
                @click="outputPanelRef?.requestFullscreen()"
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
              class="overflow-auto"
              :class="{
                'w-fit': previewWidthMode === 'fit',
                'w-full': previewWidthMode === 'fixed',
              }"
            >
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
