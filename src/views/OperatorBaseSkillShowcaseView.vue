<script setup lang="ts">
import OperatorBaseSkillShowcase from '@/components/riic/OperatorBaseSkillShowcase.vue';
import { useToastWithProgress } from '@/composables/useToastWithProgress';
import { downloadFile } from '@/utils/file';
import { getCharIdByName } from '@/utils/gameData/character';
import { gameData } from '@/utils/gameData/gameData';
import { getFontEmbedCSS, toCanvas, toSvg } from 'html-to-image';
import type { Options } from 'html-to-image/lib/types';
import { computed, nextTick, ref, useTemplateRef } from 'vue';

// ─── 输入状态 ──────────────────────────────────────────────

const charNameInput = ref<string>('凛御银灰');
const isExportingAll = ref<boolean>(false);
const exportIndividualProgress = ref<number | null>(null);
const exportContainer = useTemplateRef<HTMLElement>('exportContainer');
const individualContainers = useTemplateRef<HTMLElement[]>('individualContainers');

const charNameList = computed(() =>
  charNameInput.value
    .split('\n')
    .map((name) => name.trim())
    .filter((name) => name !== ''),
);

const charIdList = computed(
  () =>
    charNameList.value
      .map((name) => getCharIdByName(name))
      .filter(
        (charId) =>
          charId !== undefined && gameData.value?.buildingData.chars[charId] !== undefined,
      ) as string[],
);

// ─── 导出设置 ──────────────────────────────────────────────

const exportFormat = ref<'webp' | 'png' | 'jpeg' | 'svg'>('webp');
const exportQuality = ref<number>(75);
const exportPixelRatio = ref<number>(1);

const mimeTypeMap: Record<'webp' | 'png' | 'jpeg' | 'svg', string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
};

const fileExtensionMap: Record<'webp' | 'png' | 'jpeg' | 'svg', string> = {
  webp: 'webp',
  png: 'png',
  jpeg: 'jpg',
  svg: 'svg',
};

const isQualityEnabled = computed<boolean>(
  () => exportFormat.value === 'webp' || exportFormat.value === 'jpeg',
);

const cachedFontEmbedCSS = ref<string | null>(null);
const sharedOptions = computed<Options>(() => ({
  cacheBust: true,
  pixelRatio: exportPixelRatio.value,
  fontEmbedCSS: cachedFontEmbedCSS.value ?? undefined,
  filter: (node) => {
    if (node instanceof HTMLElement && node.hasAttribute('data-ignore-export')) {
      return false;
    }
    return true;
  },
}));

async function ensureFontEmbedCSS(target: HTMLElement): Promise<void> {
  if (!cachedFontEmbedCSS.value) {
    cachedFontEmbedCSS.value = await getFontEmbedCSS(target);
  }
}

async function exportTargetAsImage(target: HTMLElement, filenameBase: string): Promise<void> {
  const timestamp = new Date().getTime();
  const ext = fileExtensionMap[exportFormat.value];

  if (exportFormat.value === 'svg') {
    const dataUrl = await toSvg(target, sharedOptions.value);
    await downloadFile(dataUrl, `${filenameBase}-${timestamp}.${ext}`);
    return;
  }

  const canvas = await toCanvas(target, sharedOptions.value);
  const quality = exportFormat.value !== 'png' ? exportQuality.value / 100 : undefined;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mimeTypeMap[exportFormat.value], quality),
  );

  if (!blob) {
    throw new Error('Failed to create image blob');
  }

  await downloadFile(blob, `${filenameBase}-${timestamp}.${ext}`);
}

async function exportAsImage(): Promise<void> {
  if (!exportContainer.value || isExportingAll.value || exportIndividualProgress.value !== null)
    return;

  const { initToast, updateProgress, completeToast, failToast } = useToastWithProgress();

  try {
    isExportingAll.value = true;
    initToast({ title: '导出基建技能展示图', description: '正在准备…' });
    await nextTick();

    updateProgress(1 / 10, { description: '正在准备字体…' });
    await ensureFontEmbedCSS(exportContainer.value);

    updateProgress(4 / 10, { description: '正在生成图片…' });
    await exportTargetAsImage(exportContainer.value, 'arknights-riic-showcase');

    updateProgress(8 / 10, { description: '正在下载…' });
    completeToast({ title: '导出完成', description: '基建技能展示图已成功导出。' });
  } catch (error) {
    console.error('Failed to export image:', error);
    failToast({
      title: '导出失败',
      description: error instanceof Error ? error.message : '导出失败，请重试',
    });
  } finally {
    isExportingAll.value = false;
  }
}

async function exportEachAsImage(): Promise<void> {
  if (
    !individualContainers.value ||
    isExportingAll.value ||
    exportIndividualProgress.value !== null
  )
    return;

  const { initToast, updateProgress, completeToast, failToast } = useToastWithProgress();

  try {
    const total = individualContainers.value.length;
    initToast({ title: '分别导出基建技能展示图', description: '正在准备…' });
    await nextTick();

    updateProgress(1 / 10, { description: '正在准备字体…' });
    if (individualContainers.value[0]) {
      await ensureFontEmbedCSS(individualContainers.value[0]);
    }

    for (let i = 0; i < total; i++) {
      exportIndividualProgress.value = i + 1;
      const container = individualContainers.value[i];
      const charId = charIdList.value[i];
      if (!container || !charId) continue;

      updateProgress((i + 1) / total, { description: `正在导出第 ${i + 1}/${total} 张…` });
      await exportTargetAsImage(container, `arknights-showcase-${charId}`);
    }

    completeToast({ title: '导出完成', description: '基建技能展示图已全部导出。' });
  } catch (error) {
    console.error('Failed to export individual images:', error);
    failToast({
      title: '导出失败',
      description: error instanceof Error ? error.message : '导出失败，请重试',
    });
  } finally {
    exportIndividualProgress.value = null;
  }
}
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="干员基建技能展示" />
      <UPageBody class="space-y-6">
        <UFormField label="输入干员名称（每行一个）">
          <UTextarea v-model="charNameInput" class="w-full" :rows="4" variant="subtle" />
        </UFormField>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            icon="i-lucide-download"
            label="合并导出"
            :loading="isExportingAll"
            variant="subtle"
            @click="exportAsImage"
          />

          <UButton
            icon="i-lucide-layers"
            :label="
              exportIndividualProgress !== null
                ? `导出中（${exportIndividualProgress}/${charIdList.length}）`
                : '分别导出'
            "
            :loading="exportIndividualProgress !== null"
            title="按当前导出设置分别导出每个干员"
            variant="subtle"
            @click="exportEachAsImage"
          />

          <UPopover
            :content="{
              align: 'center',
              side: 'bottom',
              sideOffset: 8,
            }"
          >
            <UButton
              :disabled="isExportingAll || exportIndividualProgress !== null"
              icon="i-lucide-settings-2"
              title="调整导出格式、质量和大小"
              variant="subtle"
            />

            <template #content>
              <div class="flex flex-col gap-4 p-4" style="min-width: 240px">
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
                    :ui="{ list: 'ring ring-accented ring-inset' }"
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
                    :ui="{ list: 'ring ring-accented ring-inset' }"
                    variant="pill"
                  />
                </UFormField>
              </div>
            </template>
          </UPopover>
        </div>

        <!-- 导出容器 -->
        <div ref="exportContainer" class="w-fit">
          <div v-for="charId in charIdList" :key="charId" ref="individualContainers" class="w-fit">
            <OperatorBaseSkillShowcase :char-id="charId" />
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
