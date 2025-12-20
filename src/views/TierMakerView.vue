<script setup lang="ts">
import OperatorAvatar from '@/components/riic/OperatorAvatar.vue';
import type { CharacterTable } from '@/types/gameData';
import { characterTable } from '@/utils/gameData';
import { onMounted, ref, watch } from 'vue';
import Color from 'color';

interface DragPayload {
  charId: string;
  from: number | 'POOL';
}

interface TierMakerState {
  tierNames: string[];
  tiers: string[][];
  pool: string[];
}

const STORAGE_KEY = 'tier-maker-state-v1';

const charIds = [
  'char_4052_surfer',
  'char_4172_xingzh',
  'char_1040_blaze2',
  'char_2026_yu',
  'char_4173_nowell',
  'char_4010_etlchi',
  'char_4177_brigid',
  'char_4171_wulfen',
  'char_450_necras',
  'char_445_wscoot',
  'char_4178_alanna',
  'char_4179_monstr',
  'char_4188_confes',
  'char_4187_graceb',
  'char_4193_lemuen',
  'char_1041_angel2',
  'char_4194_rmixer',
  'char_4198_christ',
  'char_4191_tippi',
  'char_1042_phatm2',
  'char_4196_reckpr',
  'char_1043_leizi2',
  'char_4195_radian',
  'char_4199_makiri',
  'char_4203_kichi',
  'char_4202_haruka',
  'char_1044_hsgma2',
  'char_4185_amoris',
  'char_4184_dolris',
  'char_4186_tmoris',
  'char_4183_mortis',
  'char_4182_oblvns',
  'char_4208_wintim',
  'char_4207_branch',
  'char_4204_mantra',
  'char_4051_akkord',
  'char_394_hadiya',
  'char_4211_snhunt',
  'char_1045_svash2',
  'char_1046_sbell2',
  'char_1047_halo2',
  'char_4213_skybx',
  'char_4212_nasti',
  'char_4214_cairn',
];

const tierNames = ['神', '夯', '顶级', '人上人', 'NPC', '拉完了'];
const tierColors = ['#7030a0', '#b22600', '#ff8427', '#ffe085', '#c4bd97', '#a6a6a6'].map((c) =>
  Color(c),
);

function makeEmptyState(): TierMakerState {
  return {
    tierNames: [...tierNames],
    tiers: tierNames.map(() => []),
    pool: [...charIds],
  };
}

const state = ref<TierMakerState>(makeEmptyState());

// 初始化：从本地读取；否则全部放入池子
onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved?.tierNames && saved?.tiers && saved?.pool) {
        state.value = saved;
      }
    }
  } catch {
    state.value = makeEmptyState();
  }
});

// 持久化
watch(
  state,
  () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
  },
  { deep: true },
);

function onDragStart(evt: DragEvent, payload: DragPayload) {
  if (!evt.dataTransfer) return;
  evt.dataTransfer.setData('text/plain', JSON.stringify(payload));
  evt.dataTransfer.effectAllowed = 'move';
}

function getPayload(evt: DragEvent): DragPayload | null {
  try {
    const text = evt.dataTransfer?.getData('text/plain');
    if (!text) return null;
    const data = JSON.parse(text);
    if (
      data?.charId &&
      (data.from === 'POOL' ||
        (typeof data.from === 'number' &&
          data.from >= 0 &&
          data.from < state.value.tierNames.length))
    ) {
      return data as DragPayload;
    }
  } catch {}
  return null;
}

function moveTo(target: number | 'POOL', charId: string, from: number | 'POOL') {
  if (from === target) return;
  // 从来源删除
  const srcArr = from === 'POOL' ? state.value.pool : state.value.tiers[from] || [];
  const idx = srcArr.indexOf(charId);
  if (idx >= 0) {
    srcArr.splice(idx, 1);
  }
  srcArr.sort((a, b) => charIds.indexOf(a) - charIds.indexOf(b));
  // 添加到目标末尾
  const dstArr = target === 'POOL' ? state.value.pool : state.value.tiers[target] || [];
  if (!dstArr.includes(charId)) {
    dstArr.push(charId);
  }
  dstArr.sort((a, b) => charIds.indexOf(a) - charIds.indexOf(b));
}

function onDropToTier(evt: DragEvent, tierIndex: number) {
  evt.preventDefault();
  const payload = getPayload(evt);
  if (!payload) return;
  moveTo(tierIndex, payload.charId, payload.from);
}

function onDropToPool(evt: DragEvent) {
  evt.preventDefault();
  const payload = getPayload(evt);
  if (!payload) return;
  moveTo('POOL', payload.charId, payload.from);
}

function allowDrop(evt: DragEvent) {
  evt.preventDefault();
  evt.dataTransfer!.dropEffect = 'move';
}

function resetAll() {
  state.value = makeEmptyState();
}
</script>

<template>
  <div class="tier-maker">
    <div class="board">
      <div
        v-for="(tierName, index) in state.tierNames"
        :key="index"
        class="tier-row"
        @dragover="allowDrop"
        @drop="(e) => onDropToTier(e, index)"
      >
        <div
          class="tier-label"
          :style="{
            backgroundColor: tierColors[index]!.string(),
            color: tierColors[index]!.luminosity() > 0.6 ? '#000' : '#fff',
          }"
        >
          {{ tierName }}
        </div>
        <div class="tier-list">
          <div
            v-for="charId in state.tiers[index]"
            :key="charId"
            class="tile"
            draggable="true"
            @dragstart="(e) => onDragStart(e, { charId, from: index })"
            :title="characterTable[charId]?.name"
          >
            <OperatorAvatar :char-id="charId" />
          </div>
        </div>
      </div>
    </div>

    <div class="pool-header">
      <div>可用干员</div>
      <button class="btn" @click="resetAll">重置</button>
    </div>

    <div class="pool" @dragover="allowDrop" @drop="onDropToPool">
      <div
        v-for="charId in state.pool"
        :key="charId"
        class="tile"
        draggable="true"
        @dragstart="(e) => onDragStart(e, { charId, from: 'POOL' })"
        :title="(characterTable as unknown as CharacterTable)[charId]?.name"
      >
        <OperatorAvatar :char-id="charId" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$avatar-size: clamp(36px, 12vw, 72px);

.tier-maker {
  display: flex;
  flex-direction: column;
  gap: 16px;
  user-select: none;
}

.board {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tier-row {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.tier-label {
  width: 96px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  user-select: none;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.tier-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  min-height: calc($avatar-size + 16px);
}

.pool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pool {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  min-height: calc($avatar-size + 16px);
}

.tile {
  width: $avatar-size;
  height: $avatar-size;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
