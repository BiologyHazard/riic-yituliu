<script setup lang="ts">
import RiicSkill from '@/components/riic/BaseSkill.vue';
import { getCharIdByName } from '@/utils/character';
import { buildingData } from '@/utils/gameData';
import { computed, ref } from 'vue';

const charNameInput = ref<string>('Lancet-2\nCastle-3\nTHRM-EX\n正义骑士号');
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
        (charId) => charId !== undefined && buildingData.chars[charId] !== undefined,
      ) as string[],
);
</script>

<template>
  <UContainer>
    <UPage>
      <UPageBody class="space-y-6">
        <UFormField label="输入干员名称">
          <UTextarea v-model="charNameInput" :rows="6" class="w-full" variant="subtle" />
        </UFormField>
        <div>
          <RiicSkill v-for="charId in charIdList" :key="charId" :char-id="charId" />
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped lang="scss"></style>
