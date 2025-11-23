<script setup lang="ts">
import RiicSkill from '@/components/riic/BaseSkill.vue';
import { getCharIdByName } from '@/utils/character';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { buildingData, characterTable } from '@/utils/gameData';
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
// const charName = ref<string>('Lancet-2');
// const charId = computed(() => getCharIdByName(charName.value));
</script>

<template>
  <!-- <div>
    <label for="charNameInput">选择干员：</label>
    <input
      id="charNameInput"
      type="text"
      list="charNameList"
      v-model="charName"
      placeholder="输入或选择干员"
    />
    <datalist id="charNameList">
      <option
        v-for="[charId, charData] in Object.entries(characterTable).filter(
          ([charId, charData]) => buildingData.chars[charId] !== undefined,
        )"
        :key="charId"
        :value="charData.name"
      ></option>
    </datalist>
  </div>
  <div class="output-panel" v-if="charId !== undefined && buildingData.chars[charId] !== undefined">
    <RiicSkill :char-id="charId" />
  </div> -->
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
  <div class="output-panel" v-for="charId in charIdList" :key="charId">
    <RiicSkill :char-id="charId" />
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
