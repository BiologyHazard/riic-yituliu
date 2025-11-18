<script setup lang="ts">
import {
  getCharAvatar,
  getCharProfessionId,
  getCharRarity,
  getProfessionName,
} from '@/utils/character';
import { getPrtsWikiMediaUrl } from '@/utils/prtsWiki';
import { computed } from 'vue';

interface OperatorAvatarProps {
  charId: string; // 干员 ID
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
  eliteLevel: 0,
  isTired: false,
  showBackgroundImage: false,
  showRarity: false,
  showProfession: false,
  showEliteLevel: false,
});

/** 精英阶段角标 URL */
const eliteUrl = computed(
  () => `https://torappu.prts.wiki/assets/elite_icon/elite_${props.eliteLevel}_large.png`,
);

/** 职业名称 */
const professionName = computed(() => {
  const professionId = props.profession ?? getCharProfessionId(props.charId);
  return getProfessionName(professionId ?? '');
});

/** 职业角标 URL */
const professionUrl = computed(() => {
  const fileName = `图标_职业_${professionName.value}.png`;
  const url = getPrtsWikiMediaUrl(fileName);
  return url;
});

/** 稀有度 */
const rarity = computed(() => {
  return props.rarity ?? getCharRarity(props.charId) ?? 0;
});

/** 稀有度角标 URL */
const rarityUrl = computed(
  () => `https://torappu.prts.wiki/assets/rarity_icon/rarity_yellow_${rarity.value}.png`,
);

/** 头像 ID */
const avatarId = computed(() => {
  return getCharAvatar(props.charId, props.eliteLevel);
});

/** 头像 URL */
const avatarUrl = computed(
  () => `https://torappu.prts.wiki/assets/char_avatar/${avatarId.value}.png`,
  // 森空岛的 CDN 不允许跨域
  // `https://web.hycdn.cn/arknights/game/assets/char_skin/avatar/${encodeURIComponent(getCharSkinId(props.charId, props.eliteLevel))}.png`,
);
</script>

<template>
  <div class="operator-avatar">
    <img
      v-if="showBackgroundImage"
      class="background-image"
      src="@/assets/images/riic/基建解析UI_干员头像底图_180x180_2510101215_BioHazard.webp"
      alt="干员头像底图"
    />
    <img class="avatar" :src="avatarUrl" :alt="`头像_${props.charId}`" />
    <div v-if="isTired" class="tired"></div>
    <img
      v-if="showProfession"
      class="profession"
      :src="professionUrl"
      :alt="`图标_职业_${professionName}`"
    />
    <img
      v-if="showEliteLevel"
      class="elite"
      :src="eliteUrl"
      :alt="`精英_${props.eliteLevel}_大图`"
    />
    <img v-if="showRarity" class="rarity" :src="rarityUrl" :alt="`稀有度_黄_${rarity}`" />
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
  user-select: none;
  pointer-events: none;
}

.background-image {
  width: 100%;
  height: 100%;
  // z-index: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  // z-index: 1;
}

.tired {
  position: absolute;
  inset: 0;
  background-color: #ff000080;
  // z-index: 2;
}

.profession {
  width: 25%;
  height: 25%;
  top: 0%;
  left: 0%;
  // z-index: 3;
}

.elite {
  width: 35%;
  height: auto;
  bottom: 0%;
  left: 0%;
  // filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
  // z-index: 3;
}

.rarity {
  width: auto;
  height: 18%;
  bottom: 0%;
  right: 0%;
  // z-index: 3;
}
</style>
