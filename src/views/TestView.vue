<script setup lang="ts">
import OperatorAvatar from '@/components/riic/OperatorAvatar.vue';
import OperatorCard from '@/components/riic/OperatorCard.vue';
import { getCharIdbyName } from '@/utils/character';
import { ref } from 'vue';

const charId = ref('char_002_amiya');
const displayName = ref('');
const eliteLevel = ref('');
const rarity = ref('');
const profession = ref('');

// 新增复选框控制变量
const showBackgroundImage = ref(true);
const showRarity = ref(true);
const showProfession = ref(true);
const showEliteLevel = ref(true);
const isTired = ref(false);
</script>

<template>
  <div>
    <div class="input-group">
      <label for="charId">干员 ID:</label>
      <input id="charId" v-model="charId" type="text" />
    </div>
    <div class="input-group">
      <label for="operatorName">干员名称:</label>
      <input id="operatorName" v-model="displayName" type="text" />
    </div>
    <div class="input-group">
      <label for="eliteLevel">精英化等级:</label>
      <input id="eliteLevel" v-model="eliteLevel" type="text" />
    </div>
    <div class="input-group">
      <label for="rarity">稀有度:</label>
      <input id="rarity" v-model="rarity" type="text" />
    </div>
    <div class="input-group">
      <label for="profession">职业:</label>
      <input id="profession" v-model="profession" type="text" />
    </div>
    <div class="input-group">
      <label> <input type="checkbox" v-model="showBackgroundImage" /> 显示背景图 </label>
    </div>
    <div class="input-group">
      <label> <input type="checkbox" v-model="showRarity" /> 显示稀有度 </label>
    </div>
    <div class="input-group">
      <label> <input type="checkbox" v-model="showProfession" /> 显示职业 </label>
    </div>
    <div class="input-group">
      <label> <input type="checkbox" v-model="showEliteLevel" /> 显示精英化等级 </label>
    </div>
    <div class="input-group">
      <label> <input type="checkbox" v-model="isTired" /> 注意力涣散 </label>
    </div>
  </div>
  <div>
    <OperatorCard
      :is-tired="isTired"
      :char-id="charId || (getCharIdbyName(displayName) ?? '')"
      :displayName="displayName"
      :eliteLevel="eliteLevel ? Number(eliteLevel) : null"
    />
  </div>
  <div>
    <OperatorAvatar
      style="width: 240px; height: 240px; border-radius: 120px"
      :char-id="charId || (getCharIdbyName(displayName) ?? '')"
      :elite-level="eliteLevel ? Number(eliteLevel) : undefined"
      :is-tired="isTired"
      :profession="profession || undefined"
      :rarity="rarity ? Number(rarity) : undefined"
      :show-background-image="showBackgroundImage"
      :show-rarity="showRarity"
      :show-profession="showProfession"
      :show-elite-level="showEliteLevel"
    />
  </div>
  {{ { charId, displayName, eliteLevel, rarity, isTired } }}
</template>

<style scoped lang="scss">
.input-group {
  margin-block: 1em;
}

label {
  display: inline-block;
  text-align: right;
  width: 120px;
  margin-right: 10px;
}

input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
