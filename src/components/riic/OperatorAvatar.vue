<script setup lang="ts">
import { getCharName, getCharProfessionName, getCharRarity } from '@/utils/character';
import { getCharAvatarUrl } from '@/utils/dataSources';
import { getPrtsWikiMediaUrl } from '@/utils/prtsWiki';
import { computed } from 'vue';

interface OperatorAvatarProps {
  charId?: string; // 干员 ID
  charName?: string; // 干员显示名称
  eliteLevel?: number; // 精英化等级，0/1/2，默认为 0（可选）
  isTired?: boolean; // 是否注意力涣散（可选）
  rarity?: number; // 稀有度（可选）
  profession?: string; // 职业（可选）
  showBackgroundImage?: boolean; // 是否显示背景图
  showRarity?: boolean; // 是否显示稀有度角标
  showProfession?: boolean; // 是否显示职业角标
  showEliteLevel?: boolean; // 是否显示精英阶段角标
}

const props = withDefaults(defineProps<OperatorAvatarProps>(), {
  charId: undefined,
  charName: undefined,
  eliteLevel: 0,
  isTired: false,
  rarity: undefined,
  profession: undefined,
  showBackgroundImage: false,
  showRarity: false,
  showProfession: false,
  showEliteLevel: false,
});

const imageAltName = computed<string>(() => {
  if (props.charName) {
    return props.charName;
  }
  if (props.charId) {
    const name = getCharName(props.charId);
    if (name) {
      return name;
    }
    return props.charId;
  }
  return '未知干员';
});

/** 精英阶段角标 URL */
const eliteUrl = computed<string>(
  () => `https://torappu.prts.wiki/assets/elite_icon/elite_${props.eliteLevel}_large.png`,
);

/** 职业名称 */
const professionName = computed<string | undefined>(() => {
  if (props.profession !== undefined) {
    return props.profession;
  }
  if (props.charId !== undefined) {
    return getCharProfessionName(props.charId);
  }
  return undefined;
});

/** 职业角标 URL */
const professionUrl = computed<string | undefined>(() => {
  if (professionName.value === undefined) {
    return undefined;
  }
  const fileName = `图标_职业_${professionName.value}.png`;
  const url = getPrtsWikiMediaUrl(fileName);
  return url;
});

/** 稀有度 */
const rarity = computed<number | undefined>(() => {
  if (props.rarity !== undefined) {
    return props.rarity;
  }
  if (props.charId !== undefined) {
    return getCharRarity(props.charId);
  }
  return undefined;
});

/** 稀有度角标 URL */
const rarityUrl = computed<string | undefined>(() => {
  if (rarity.value === undefined) {
    return undefined;
  }
  return `https://torappu.prts.wiki/assets/rarity_icon/rarity_yellow_${rarity.value}.png`;
});

/** 头像 URL */
const avatarUrl = computed<string | undefined>(() => {
  if (props.charId === undefined) {
    return undefined;
  }
  return getCharAvatarUrl(props.charId, props.eliteLevel);
});
</script>

<template>
  <div class="operator-avatar">
    <img
      v-if="showBackgroundImage"
      alt="干员头像底图"
      class="background-image"
      referrerpolicy="no-referrer"
      src="@/assets/images/riic/基建解析UI_干员头像底图_180x180_2510101215_BioHazard.webp"
    />
    <img
      v-if="avatarUrl"
      :alt="`头像_${imageAltName}`"
      class="avatar"
      referrerpolicy="no-referrer"
      :src="avatarUrl"
    />
    <div v-if="isTired" class="tired"></div>
    <img
      v-if="showProfession && professionUrl"
      :alt="`图标_职业_${professionName}`"
      class="profession"
      referrerpolicy="no-referrer"
      :src="professionUrl"
    />
    <img
      v-if="showEliteLevel"
      :alt="`精英_${props.eliteLevel}_大图`"
      class="elite"
      referrerpolicy="no-referrer"
      :src="eliteUrl"
    />
    <img
      v-if="showRarity && rarityUrl"
      :alt="`稀有度_黄_${rarity}`"
      class="rarity"
      referrerpolicy="no-referrer"
      :src="rarityUrl"
    />
  </div>
</template>

<style scoped>
.operator-avatar {
  position: relative;
  width: 100%;
  height: 100%;
}

.operator-avatar img {
  position: absolute;
}

.background-image {
  width: 100%;
  height: 100%;
}

.avatar {
  width: 100%;
  height: 100%;
}

.tired {
  position: absolute;
  inset: 0;
  background-color: #ff000080;
}

.profession {
  top: 0%;
  left: 0%;
  width: 25%;
  height: 25%;
}

.elite {
  bottom: 0%;
  left: 0%;
  width: 35%;
  height: auto;
}

.rarity {
  right: 0%;
  bottom: 0%;
  width: auto;
  height: 18%;
}
</style>
