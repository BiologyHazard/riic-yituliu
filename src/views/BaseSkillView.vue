<script setup lang="ts">
import RiicSkill from '@/components/riic/BaseSkill.vue';
import { getCharIdByName } from '@/utils/character';
import { gameData } from '@/utils/gameData';
import { toPng } from 'html-to-image';
import { computed, ref, useTemplateRef } from 'vue';

const charNameInput = ref<string>('Lancet-2\nCastle-3\nTHRM-EX\n正义骑士号');
const isExporting = ref<boolean>(false);
const exportContainer = useTemplateRef<HTMLElement>('exportContainer');

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
  if (!exportContainer.value || isExporting.value) return;

  try {
    isExporting.value = true;
    const dataUrl = await toPng(exportContainer.value, {
      cacheBust: true,
      backgroundColor: 'rgb(var(--color-neutral-50))',
    });

    const link = document.createElement('a');
    link.download = `arknights-riic-skills-${new Date().getTime()}.png`;
    link.href = dataUrl;
    link.click();
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
      <UPageHeader title="基建技能" />
      <UPageBody class="space-y-6">
        <UFormField label="输入干员名称">
          <UTextarea v-model="charNameInput" class="w-full" :rows="6" variant="subtle" />
        </UFormField>
        <UButton
          icon="i-lucide-download"
          label="导出图片"
          :loading="isExporting"
          variant="subtle"
          @click="exportAsImage"
        />
        <div ref="exportContainer" class="w-fit">
          <RiicSkill v-for="charId in charIdList" :key="charId" :char-id="charId" />
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped lang="scss"></style>
