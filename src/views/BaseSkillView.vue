<script setup lang="ts">
import { getCharIdByName } from '@/utils/character';
import { downloadFile } from '@/utils/file';
import { gameData } from '@/utils/gameData';
import { toPng } from 'html-to-image';
import { computed, ref, useTemplateRef } from 'vue';

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

async function exportAsImage(): Promise<void> {
  if (!exportContainer.value || isExportingAll.value || exportIndividualProgress.value !== null)
    return;

  try {
    isExportingAll.value = true;
    const dataUrl = await toPng(exportContainer.value, {
      cacheBust: true,
    });

    await downloadFile(dataUrl, `arknights-riic-skills-${new Date().getTime()}.png`);
  } catch (error) {
    console.error('Failed to export image:', error);
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

  try {
    const total = individualContainers.value.length;
    const timestamp = new Date().getTime();

    for (let i = 0; i < total; i++) {
      exportIndividualProgress.value = i + 1;
      const container = individualContainers.value[i];
      const charId = charIdList.value[i];
      if (!container || !charId) continue;

      const dataUrl = await toPng(container, {
        cacheBust: true,
      });

      await downloadFile(dataUrl, `arknights-skill-${charId}-${timestamp}.png`);
    }
  } catch (error) {
    console.error('Failed to export individual images:', error);
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
        <div class="flex flex-wrap gap-2">
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
            variant="subtle"
            @click="exportEachAsImage"
          />
        </div>
        <div ref="exportContainer" class="w-fit">
          <div v-for="charId in charIdList" :key="charId" ref="individualContainers" class="w-fit">
            <BaseSkill :char-id="charId" />
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
