<script setup>
import OperatorAvatar from '@/components/riic/OperatorAvatar.vue';
import OperatorCard from '@/components/riic/OperatorCard.vue';
import { getCharacterIdbyName } from '@/utils/character';
import { computed, ref } from 'vue';

const operatorName = ref('阿米娅')
const eliteLevelInput = ref(0)
const charId = ref('char_002_amiya')
const rarityInput = ref(5)
const eliteLevel = computed(() => {
    const level = parseInt(eliteLevelInput.value)
    return isNaN(level) ? null : level
})
const rarity = computed(() => {
    const level = parseInt(rarityInput.value)
    return isNaN(level) ? null : level
})
</script>

<template>
    <div>
        <div class="input-group">
            <label for="charId">干员 ID:</label>
            <input id="charId" v-model="charId" type="text" placeholder="请输入干员 ID" />
        </div>
        <div class="input-group">
            <label for="operatorName">名字:</label>
            <input id="operatorName" v-model="operatorName" type="text" placeholder="请输入名字" />
        </div>
        <div class="input-group">
            <label for="eliteLevel">精英化等级:</label>
            <input id="eliteLevel" v-model="eliteLevelInput" type="number" placeholder="请输入精英化等级" />
        </div>
        <div class="input-group">
            <label for="rarity">稀有度:</label>
            <input id="rarity" v-model="rarityInput" type="number" placeholder="请输入稀有度" />
        </div>
    </div>
    <div>
        <OperatorCard :operatorName="operatorName" :eliteLevel="eliteLevel" />
    </div>
    <div>
        <OperatorAvatar style="width: 240px; height: 240px;" :char-id="getCharacterIdbyName(operatorName)"
            :elite-level="eliteLevel" profession="术师" :rarity="rarity" show-background-image show-rarity show-profession
            show-elite-level />
    </div>
    <div>
        <OperatorAvatar style="width: 45px; height: 45px;" :char-id="getCharacterIdbyName(operatorName)"
            :elite-level="eliteLevel" profession="术师" :rarity="rarity" show-background-image show-rarity show-profession
            show-elite-level />
    </div>
</template>

<style scoped>
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
