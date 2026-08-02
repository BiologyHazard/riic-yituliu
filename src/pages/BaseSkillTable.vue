<script setup lang="ts">
import { useExportImage } from '@/composables/useExportImage';
import { useToastWithProgress } from '@/composables/useToastWithProgress';
import { getCharIdByName } from '@/utils/gameData/character';
import { gameData } from '@/utils/gameData/gameData';
import { computed, nextTick, ref, useTemplateRef } from 'vue';

const charNameInput = ref<string>('Lancet-2\nCastle-3\nTHRM-EX\n正义骑士号');
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

const { exportFormat, exportQuality, exportPixelRatio, ensureFontEmbedCSS, exportTargetAsImage } =
  useExportImage();

async function exportAsImage(): Promise<void> {
  if (!exportContainer.value || isExportingAll.value || exportIndividualProgress.value !== null)
    return;

  const { initToast, updateProgress, completeToast, failToast } = useToastWithProgress();

  try {
    isExportingAll.value = true;
    initToast({ title: '导出基础技能图片', description: '正在准备…' });
    await nextTick();

    updateProgress(1 / 10, { description: '正在准备字体…' });
    await ensureFontEmbedCSS(exportContainer.value);

    updateProgress(4 / 10, { description: '正在生成图片…' });
    await exportTargetAsImage(exportContainer.value, 'arknights-riic-skills');

    updateProgress(8 / 10, { description: '正在下载…' });
    completeToast({ title: '导出完成', description: '基础技能图片已成功导出。' });
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
    initToast({ title: '分别导出基础技能图片', description: '正在准备…' });
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
      await exportTargetAsImage(container, `arknights-skill-${charId}`);
    }

    completeToast({ title: '导出完成', description: '基础技能图片已全部导出。' });
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
      <UPageHeader title="基建技能" />
      <UPageBody class="space-y-6">
        <UFormField label="输入干员名称">
          <UTextarea v-model="charNameInput" class="w-full" :rows="6" variant="subtle" />
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

          <ExportImageSettings
            v-model:export-format="exportFormat"
            v-model:export-pixel-ratio="exportPixelRatio"
            v-model:export-quality="exportQuality"
            :disabled="isExportingAll || exportIndividualProgress !== null"
          />
        </div>
        <div ref="exportContainer" class="w-fit">
          <div v-for="charId in charIdList" :key="charId" ref="individualContainers" class="w-fit">
            <RiicSkillTable :char-id="charId" />
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
