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
  <div>
    <label for="charNameInput">输入干员名称：</label>
    <textarea
      id="charNameInput"
      v-model="charNameInput"
      rows="4"
      cols="50"
      placeholder="输入干员名称"
    ></textarea>
  </div>
  <div>
    <div class="output-panel" v-for="charId in charIdList" :key="charId">
      <RiicSkill :char-id="charId" />
    </div>
  </div>
</template>

<style scoped lang="scss">
input {
  width: 200px;
  height: 30px;
  font-size: 1em;
  padding: 5px;
  margin-bottom: 20px;
}
</style>
