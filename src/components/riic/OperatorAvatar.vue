<script setup lang="ts">
import {
  getCharProfession,
  getCharRarity,
  getCharAvatar,
  getProfessionName,
} from '@/utils/character'
import { computed } from 'vue'

interface Props {
  charId: string // 干员 ID
  eliteLevel?: number // 精英化等级，0/1/2，默认为 0 (可选)
  isTired?: boolean // 是否注意力涣散 (可选)
  rarity?: number // 稀有度 (可选)
  profession?: string // 职业 (可选)
  showBackgroundImage?: boolean // 是否显示背景图
  showRarity?: boolean // 是否显示稀有度角标
  showProfession?: boolean // 是否显示职业角标
  showEliteLevel?: boolean // 是否显示精英阶段角标
}

const props = withDefaults(defineProps<Props>(), {
  eliteLevel: 0,
  isTired: false,
  showBackgroundImage: false,
  showRarity: false,
  showProfession: false,
  showEliteLevel: false,
})

// 背景底图 URL
const backgroundUrl: string = '/images/resources/干员头像底图.png'

// 精英阶段角标 URL
const eliteUrl = computed(() => `/images/resources/精英_${props.eliteLevel}_大图.png`)

// 职业角标 URL
const professionUrl = computed(
  () =>
    `/images/resources/图标_职业_${getProfessionName(props.profession ?? getCharProfession(props.charId) ?? '')}.png`,
)

// 稀有度角标 URL
const rarityUrl = computed(
  () => `/images/resources/稀有度_黄_${props.rarity ?? getCharRarity(props.charId) ?? 0}.png`,
)

// 干员头像 URL
const avatarUrl = computed(
  () => `/images/avatar/${getCharAvatar(props.charId, props.eliteLevel)}.png`,
)
</script>

<template>
  <div class="operator-avatar">
    <img v-if="showBackgroundImage" class="bg" :src="backgroundUrl" alt="背景" />
    <img class="avatar" :src="avatarUrl" :alt="`干员 ${charId}`" />
    <div v-if="isTired" class="tired"></div>
    <img v-if="showProfession" class="profession" :src="professionUrl" alt="职业" />
    <img v-if="showEliteLevel" class="elite" :src="eliteUrl" alt="精英阶段" />
    <img v-if="showRarity" class="rarity" :src="rarityUrl" alt="稀有度" />
  </div>
</template>

<style scoped lang="scss">
.operator-avatar {
  width: 100%;
  height: 100%;
  position: relative;
}

.operator-avatar img {
  position: absolute;
  display: block;
  user-select: none;
  pointer-events: none;
}

.bg {
  // inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.tired {
  position: absolute;
  inset: 0;
  background-color: #ff000080;
  z-index: 2;
}

.profession {
  width: 20%;
  height: 20%;
  top: 0%;
  left: 0%;
  z-index: 3;
}

.elite {
  width: 35%;
  height: auto;
  bottom: 0%;
  left: 0%;
  // filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
  z-index: 3;
}

.rarity {
  width: auto;
  height: 18%;
  bottom: 2%;
  right: 0%;
  z-index: 3;
}
</style>
