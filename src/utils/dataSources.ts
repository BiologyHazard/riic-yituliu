import {
  getCharAvatarId,
  getCharName,
  getCharPortraitId,
  getCharSkinId,
  getProfessionName,
} from '@/utils/gameData/character';
import { getItemIconId, getItemName } from '@/utils/gameData/item';
import {
  getPrtsWikiCharAvatarUrl,
  getPrtsWikiItemIconUrl,
  getPrtsWikiMediaUrl,
} from '@/utils/prtsWiki';
import { useLocalStorage } from '@vueuse/core';
import { computed } from 'vue';

// ─── interfaces ───────────────────────────────────────────────

export interface DataSource {
  id: string;
  label: string;
  isGithub: boolean;
}

export interface GameDataSource extends DataSource {
  baseUrl: string;
}

export interface CharAvatarSource extends DataSource {
  getCharAvatarUrl: (charId: string, eliteLevel: number) => string | undefined;
}

export interface CharSkinSource extends DataSource {
  getCharSkinUrl: (charId: string, eliteLevel: number) => string | undefined;
}

export interface ItemIconSource extends DataSource {
  getItemIconUrl: (itemId: string) => string | undefined;
}

export interface BaseSkillIconSource extends DataSource {
  getBaseSkillIconUrl: (skillIcon: string) => string;
}

export interface GithubMirror {
  id: string;
  label: string;
  prefix: string;
}

// ─── source definitions ───────────────────────────────────────

export const gameDataSources: GameDataSource[] = [
  {
    id: 'torappu',
    label: 'Torappu',
    baseUrl: 'https://torappu.prts.wiki/gamedata/latest/excel',
    isGithub: false,
  },
  {
    id: 'Kengxxiao/ArknightsGameData',
    label: 'Kengxxiao/ArknightsGameData',
    baseUrl:
      'https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/refs/heads/master/zh_CN/gamedata/excel',
    isGithub: true,
  },
  {
    id: 'ArknightsAssets/ArknightsGamedata',
    label: 'ArknightsAssets/ArknightsGamedata',
    baseUrl:
      'https://raw.githubusercontent.com/ArknightsAssets/ArknightsGamedata/refs/heads/master/cn/gamedata/excel',
    isGithub: true,
  },
  {
    id: 'yuanyan3060/ArknightsGameResource',
    label: 'yuanyan3060/ArknightsGameResource',
    baseUrl:
      'https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/refs/heads/main/gamedata/excel',
    isGithub: true,
  },
  {
    id: 'fexli/ArknightsResource',
    label: 'fexli/ArknightsResource',
    baseUrl:
      'https://raw.githubusercontent.com/fexli/ArknightsResource/refs/heads/main/gamedata/excel',
    isGithub: true,
  },
  {
    id: 'closure-studio/ArknightsGamedataPure',
    label: 'closure-studio/ArknightsGamedataPure',
    baseUrl:
      'https://raw.githubusercontent.com/closure-studio/ArknightsGamedataPure/refs/heads/main/excel',
    isGithub: true,
  },
];

export const charAvatarSources: CharAvatarSource[] = [
  {
    id: 'torappu',
    label: 'Torappu',
    isGithub: false,
    getCharAvatarUrl(charId: string, eliteLevel: number): string {
      return `https://torappu.prts.wiki/assets/char_avatar/${getCharAvatarId(charId, eliteLevel)}.png`;
    },
  },
  {
    id: 'prts-wiki',
    label: 'PRTS Wiki',
    isGithub: false,
    getCharAvatarUrl(charId: string, eliteLevel: number): string | undefined {
      const charName = getCharName(charId);
      if (charName === undefined) {
        return undefined;
      }
      return getPrtsWikiCharAvatarUrl(charId, charName, eliteLevel);
    },
  },
  {
    id: 'yuanyan3060/ArknightsGameResource',
    label: 'yuanyan3060/ArknightsGameResource',
    isGithub: true,
    getCharAvatarUrl(charId: string, eliteLevel: number): string {
      return `https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/refs/heads/main/avatar/${getCharAvatarId(charId, eliteLevel)}.png`;
    },
  },
  {
    id: 'fexli/ArknightsResource',
    label: 'fexli/ArknightsResource',
    isGithub: true,
    getCharAvatarUrl(charId: string, eliteLevel: number): string {
      return `https://raw.githubusercontent.com/fexli/ArknightsResource/refs/heads/main/avatar/ASSISTANT/${getCharAvatarId(charId, eliteLevel)}.png`;
    },
  },
  {
    id: 'skland',
    label: 'Skland',
    isGithub: false,
    getCharAvatarUrl(charId: string, eliteLevel: number): string {
      return `https://web.hycdn.cn/arknights/game/assets/char_skin/avatar/${encodeURIComponent(getCharSkinId(charId, eliteLevel))}.png`;
    },
  },
  {
    id: 'skland-avatar',
    label: 'Skland（仅初始立绘）',
    isGithub: false,
    getCharAvatarUrl(charId: string, _eliteLevel: number): string {
      return `https://web.hycdn.cn/arknights/game/assets/char/avatar/${charId}.png`;
    },
  },
];

export const charSkinSources: CharSkinSource[] = [
  {
    id: 'torappu',
    label: 'Torappu',
    isGithub: false,
    getCharSkinUrl(charId: string, eliteLevel: number): string {
      return `https://torappu.prts.wiki/assets/char_arts/${encodeURIComponent(getCharPortraitId(charId, eliteLevel))}.png`;
    },
  },
  {
    id: 'fexli/ArknightsResource',
    label: 'fexli/ArknightsResource',
    isGithub: true,
    getCharSkinUrl(charId: string, eliteLevel: number): string {
      const skinId = getCharSkinId(charId, eliteLevel);
      return `https://raw.githubusercontent.com/fexli/ArknightsResource/refs/heads/main/charpack/${skinId.replace('#', '_')}.png`;
    },
  },
  {
    id: 'yuanyan3060/ArknightsGameResource',
    label: 'yuanyan3060/ArknightsGameResource',
    isGithub: true,
    getCharSkinUrl(charId: string, eliteLevel: number): string {
      const skinId = getCharSkinId(charId, eliteLevel);
      return `https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/refs/heads/main/skin/${encodeURIComponent(skinId)}b.png`;
    },
  },
];

export const itemIconSources: ItemIconSource[] = [
  {
    id: 'torappu',
    label: 'Torappu',
    isGithub: false,
    getItemIconUrl(itemId: string): string | undefined {
      const itemIconId = getItemIconId(itemId);
      if (itemIconId === undefined) {
        return undefined;
      }
      return `https://torappu.prts.wiki/assets/item_icon/${itemIconId}.png`;
    },
  },
  {
    id: 'prts-wiki',
    label: 'PRTS Wiki',
    isGithub: false,
    getItemIconUrl(itemId: string): string | undefined {
      const itemName = getItemName(itemId);
      if (itemName === undefined) {
        return undefined;
      }
      return getPrtsWikiItemIconUrl(itemId, itemName);
    },
  },
  {
    id: 'yuanyan3060/ArknightsGameResource',
    label: 'yuanyan3060/ArknightsGameResource',
    isGithub: true,
    getItemIconUrl(itemId: string): string | undefined {
      const itemIconId = getItemIconId(itemId);
      if (itemIconId === undefined) {
        return undefined;
      }
      return `https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/refs/heads/main/item/${itemIconId}.png`;
    },
  },
  {
    id: 'fexli/ArknightsResource',
    label: 'fexli/ArknightsResource',
    isGithub: true,
    getItemIconUrl(itemId: string): string | undefined {
      const itemIconId = getItemIconId(itemId);
      if (itemIconId === undefined) {
        return undefined;
      }
      return `https://raw.githubusercontent.com/fexli/ArknightsResource/refs/heads/main/items/${itemIconId}.png`;
    },
  },
  {
    id: 'skland',
    label: 'Skland（无框）',
    isGithub: false,
    getItemIconUrl(itemId: string): string {
      return `https://web.hycdn.cn/arknights/game/assets/item/${itemId}.png`;
    },
  },
];

export const baseSkillIconSources: BaseSkillIconSource[] = [
  {
    id: 'torappu',
    label: 'Torappu',
    isGithub: false,
    getBaseSkillIconUrl(skillIcon: string): string {
      return `https://torappu.prts.wiki/assets/build_skill_icon/${skillIcon}.png`;
    },
  },
  {
    id: 'yuanyan3060/ArknightsGameResource',
    label: 'yuanyan3060/ArknightsGameResource',
    isGithub: true,
    getBaseSkillIconUrl(skillIcon: string): string {
      return `https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/refs/heads/main/building_skill/${skillIcon}.png`;
    },
  },
];

export const githubMirrors: GithubMirror[] = [
  {
    id: 'none',
    label: '（不使用镜像）',
    prefix: '',
  },
  {
    id: 'gh-proxy.com',
    label: 'gh-proxy.com',
    prefix: 'https://gh-proxy.com/',
  },
  {
    id: 'ghproxy.net',
    label: 'ghproxy.net',
    prefix: 'https://ghproxy.net/',
  },
  {
    id: 'githubproxy.cc',
    label: 'githubproxy.cc',
    prefix: 'https://githubproxy.cc/',
  },
  {
    id: 'ghfast.top',
    label: 'ghfast.top',
    prefix: 'https://ghfast.top/',
  },
];

// ─── defaults ─────────────────────────────────────────────────

export const defaultGameDataSourceId = 'torappu';
export const defaultCharAvatarSourceId = 'torappu';
export const defaultCharSkinSourceId = 'torappu';
export const defaultItemIconSourceId = 'torappu';
export const defaultBaseSkillIconSourceId = 'torappu';
export const defaultGithubMirrorId = 'none';

// ─── state (persisted via localStorage) ───────────────────────

const GAME_DATA_SOURCE_STORAGE_KEY = 'riic_game_data_source_id';
const CHAR_AVATAR_SOURCE_STORAGE_KEY = 'riic_avatar_source_id';
const CHAR_SKIN_SOURCE_STORAGE_KEY = 'riic_art_source_id';
const ITEM_ICON_SOURCE_STORAGE_KEY = 'riic_item_icon_source_id';
const BASE_SKILL_ICON_SOURCE_STORAGE_KEY = 'riic_base_skill_icon_source_id';
const GITHUB_MIRROR_STORAGE_KEY = 'riic_github_mirror_id';

export const currentGameDataSourceId = useLocalStorage<string>(
  GAME_DATA_SOURCE_STORAGE_KEY,
  defaultGameDataSourceId,
);
export const currentCharAvatarSourceId = useLocalStorage<string>(
  CHAR_AVATAR_SOURCE_STORAGE_KEY,
  defaultCharAvatarSourceId,
);
export const currentCharSkinSourceId = useLocalStorage<string>(
  CHAR_SKIN_SOURCE_STORAGE_KEY,
  defaultCharSkinSourceId,
);
export const currentItemIconSourceId = useLocalStorage<string>(
  ITEM_ICON_SOURCE_STORAGE_KEY,
  defaultItemIconSourceId,
);
export const currentBaseSkillIconSourceId = useLocalStorage<string>(
  BASE_SKILL_ICON_SOURCE_STORAGE_KEY,
  defaultBaseSkillIconSourceId,
);
export const currentMirrorId = useLocalStorage<string>(
  GITHUB_MIRROR_STORAGE_KEY,
  defaultGithubMirrorId,
);

// ─── current source computeds ─────────────────────────────────

export const currentGameDataSource = computed<GameDataSource>(() => {
  return (
    gameDataSources.find((s) => s.id === currentGameDataSourceId.value) ??
    gameDataSources.find((s) => s.id === defaultGameDataSourceId) ??
    gameDataSources[0]!
  );
});
export const currentCharAvatarSource = computed<CharAvatarSource>(() => {
  return (
    charAvatarSources.find((s) => s.id === currentCharAvatarSourceId.value) ??
    charAvatarSources.find((s) => s.id === defaultCharAvatarSourceId) ??
    charAvatarSources[0]!
  );
});
export const currentItemIconSource = computed<ItemIconSource>(() => {
  return (
    itemIconSources.find((s) => s.id === currentItemIconSourceId.value) ??
    itemIconSources.find((s) => s.id === defaultItemIconSourceId) ??
    itemIconSources[0]!
  );
});
export const currentBaseSkillIconSource = computed<BaseSkillIconSource>(() => {
  return (
    baseSkillIconSources.find((s) => s.id === currentBaseSkillIconSourceId.value) ??
    baseSkillIconSources.find((s) => s.id === defaultBaseSkillIconSourceId) ??
    baseSkillIconSources[0]!
  );
});
export const currentCharSkinSource = computed<CharSkinSource>(() => {
  return (
    charSkinSources.find((s) => s.id === currentCharSkinSourceId.value) ??
    charSkinSources.find((s) => s.id === defaultCharSkinSourceId) ??
    charSkinSources[0]!
  );
});
export const currentGithubMirror = computed<GithubMirror>(() => {
  return (
    githubMirrors.find((m) => m.id === currentMirrorId.value) ??
    githubMirrors.find((m) => m.id === defaultGithubMirrorId) ??
    githubMirrors[0]!
  );
});

function applyGithubMirror(url: string, isGithub: boolean): string {
  return isGithub ? `${currentGithubMirror.value.prefix}${url}` : url;
}

// ─── game data URL (baseUrl pattern) ──────────────────────────

export const currentGameDataBaseUrl = computed<string>(() => {
  return applyGithubMirror(
    currentGameDataSource.value.baseUrl,
    currentGameDataSource.value.isGithub,
  );
});

// ─── image URL builders ───────────────────────────────────────

export function getCharAvatarUrl(charId: string, eliteLevel: number): string | undefined {
  const url = currentCharAvatarSource.value.getCharAvatarUrl(charId, eliteLevel);
  if (url === undefined) {
    return undefined;
  }
  return applyGithubMirror(url, currentCharAvatarSource.value.isGithub);
}

export function getCharSkinUrl(charId: string, eliteLevel: number): string | undefined {
  const url = currentCharSkinSource.value.getCharSkinUrl(charId, eliteLevel);
  if (url === undefined) {
    return undefined;
  }
  return applyGithubMirror(url, currentCharSkinSource.value.isGithub);
}

export function getItemIconUrl(itemId: string): string | undefined {
  const url = currentItemIconSource.value.getItemIconUrl(itemId);
  if (url === undefined) {
    return undefined;
  }
  return applyGithubMirror(url, currentItemIconSource.value.isGithub);
}

export function getBaseSkillIconUrl(skillIcon: string): string {
  const url = currentBaseSkillIconSource.value.getBaseSkillIconUrl(skillIcon);
  return applyGithubMirror(url, currentBaseSkillIconSource.value.isGithub);
}

export function getEliteIconUrl(eliteLevel: number): string {
  return `https://torappu.prts.wiki/assets/elite_icon/elite_${eliteLevel}_large.png`;
}

export function getRarityIconUrl(rarity: number): string {
  return `https://torappu.prts.wiki/assets/rarity_icon/rarity_yellow_${rarity}.png`;
}

export function getProfessionIconUrl(professionId: string): string {
  const professionName = getProfessionName(professionId);
  return getPrtsWikiMediaUrl(`图标_职业_${professionName}.png`);
}
