import { getCharAvatar, getCharSkinId } from '@/utils/character';
import { gameData } from '@/utils/gameData';
import { useLocalStorage } from '@vueuse/core';
import { computed } from 'vue';

// ─── interfaces ───────────────────────────────────────────────

export interface DataSource {
  label: string;
  id: string;
  baseUrl: string;
  isGithub: boolean;
}

export interface AvatarSource {
  label: string;
  id: string;
  isGithub: boolean;
  getUrl: (charId: string, eliteLevel: number) => string;
}

export interface ItemIconSource {
  label: string;
  id: string;
  isGithub: boolean;
  getUrl: (itemId: string) => string;
}

export interface BaseSkillIconSource {
  label: string;
  id: string;
  isGithub: boolean;
  getUrl: (skillIcon: string) => string;
}

export interface GithubMirror {
  label: string;
  id: string;
  prefix: string;
}

// ─── source definitions ───────────────────────────────────────

export const gameDataSources: DataSource[] = [
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

export const avatarSources: AvatarSource[] = [
  {
    id: 'torappu',
    label: 'Torappu',
    isGithub: false,
    getUrl(charId: string, eliteLevel: number): string {
      return `https://torappu.prts.wiki/assets/char_avatar/${getCharAvatar(charId, eliteLevel)}.png`;
    },
  },
  {
    id: 'yuanyan3060/ArknightsGameResource',
    label: 'yuanyan3060/ArknightsGameResource',
    isGithub: true,
    getUrl(charId: string, eliteLevel: number): string {
      return `https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/refs/heads/main/avatar/${getCharAvatar(charId, eliteLevel)}.png`;
    },
  },
  {
    id: 'skland',
    label: 'Skland',
    isGithub: false,
    getUrl(charId: string, eliteLevel: number): string {
      return `https://web.hycdn.cn/arknights/game/assets/char_skin/avatar/${encodeURIComponent(getCharSkinId(charId, eliteLevel))}.png`;
    },
  },
  {
    id: 'skland-avatar',
    label: 'Skland（仅初始立绘）',
    isGithub: false,
    getUrl(charId: string, _eliteLevel: number): string {
      return `https://web.hycdn.cn/arknights/game/assets/char/avatar/${charId}.png`;
    },
  },
];

export const itemIconSources: ItemIconSource[] = [
  {
    id: 'torappu',
    label: 'Torappu',
    isGithub: false,
    getUrl(itemId: string): string {
      return `https://torappu.prts.wiki/assets/item_icon/${gameData.value?.itemTable.items[itemId]?.iconId ?? itemId}.png`;
    },
  },
  {
    id: 'yuanyan3060/ArknightsGameResource',
    label: 'yuanyan3060/ArknightsGameResource',
    isGithub: true,
    getUrl(itemId: string): string {
      return `https://raw.githubusercontent.com/yuanyan3060/ArknightsGameResource/refs/heads/main/item/${gameData.value?.itemTable.items[itemId]?.iconId ?? itemId}.png`;
    },
  },
  {
    id: 'skland',
    label: 'Skland（无框）',
    isGithub: false,
    getUrl(itemId: string): string {
      return `https://web.hycdn.cn/arknights/game/assets/item/${itemId}.png`;
    },
  },
];

export const baseSkillIconSources: BaseSkillIconSource[] = [
  {
    id: 'torappu',
    label: 'Torappu',
    isGithub: false,
    getUrl(skillIcon: string): string {
      return `https://torappu.prts.wiki/assets/build_skill_icon/${skillIcon}.png`;
    },
  },
  {
    id: 'yuanyan3060/ArknightsGameResource',
    label: 'yuanyan3060/ArknightsGameResource',
    isGithub: true,
    getUrl(skillIcon: string): string {
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
export const defaultAvatarSourceId = 'torappu';
export const defaultItemIconSourceId = 'torappu';
export const defaultBaseSkillIconSourceId = 'torappu';
export const defaultGithubMirrorId = 'none';

// ─── state (persisted via localStorage) ───────────────────────

const GAME_DATA_SOURCE_STORAGE_KEY = 'riic_game_data_source_id';
const AVATAR_SOURCE_STORAGE_KEY = 'riic_avatar_source_id';
const ITEM_ICON_SOURCE_STORAGE_KEY = 'riic_item_icon_source_id';
const BASE_SKILL_ICON_SOURCE_STORAGE_KEY = 'riic_base_skill_icon_source_id';
const GITHUB_MIRROR_STORAGE_KEY = 'riic_github_mirror_id';

export const currentGameDataSourceId = useLocalStorage(
  GAME_DATA_SOURCE_STORAGE_KEY,
  defaultGameDataSourceId,
);
export const currentAvatarSourceId = useLocalStorage(
  AVATAR_SOURCE_STORAGE_KEY,
  defaultAvatarSourceId,
);
export const currentItemIconSourceId = useLocalStorage(
  ITEM_ICON_SOURCE_STORAGE_KEY,
  defaultItemIconSourceId,
);
export const currentBaseSkillIconSourceId = useLocalStorage(
  BASE_SKILL_ICON_SOURCE_STORAGE_KEY,
  defaultBaseSkillIconSourceId,
);
export const currentMirrorId = useLocalStorage(GITHUB_MIRROR_STORAGE_KEY, defaultGithubMirrorId);

// ─── current source computeds ─────────────────────────────────

export const currentGameDataSource = computed(() => {
  return gameDataSources.find((s) => s.id === currentGameDataSourceId.value) || gameDataSources[0]!;
});
export const currentAvatarSource = computed(() => {
  return avatarSources.find((s) => s.id === currentAvatarSourceId.value) || avatarSources[0]!;
});
export const currentItemIconSource = computed(() => {
  return itemIconSources.find((s) => s.id === currentItemIconSourceId.value) || itemIconSources[0]!;
});
export const currentBaseSkillIconSource = computed(() => {
  return (
    baseSkillIconSources.find((s) => s.id === currentBaseSkillIconSourceId.value) ||
    baseSkillIconSources[0]!
  );
});
export const currentMirror = computed(() => {
  return githubMirrors.find((m) => m.id === currentMirrorId.value) || githubMirrors[0]!;
});

function applyGithubMirror(url: string, isGithub: boolean): string {
  return isGithub ? `${currentMirror.value.prefix}${url}` : url;
}

// ─── game data URL (baseUrl pattern) ──────────────────────────

export const currentGameDataBaseUrl = computed(() => {
  return applyGithubMirror(
    currentGameDataSource.value.baseUrl,
    currentGameDataSource.value.isGithub,
  );
});

// ─── image URL builders ───────────────────────────────────────

export function getAvatarUrl(charId: string, eliteLevel: number): string {
  const url = currentAvatarSource.value.getUrl(charId, eliteLevel);
  return applyGithubMirror(url, currentAvatarSource.value.isGithub);
}

export function getItemIconUrl(itemId: string): string {
  const url = currentItemIconSource.value.getUrl(itemId);
  return applyGithubMirror(url, currentItemIconSource.value.isGithub);
}

export function getBaseSkillIconUrl(skillIcon: string): string {
  const url = currentBaseSkillIconSource.value.getUrl(skillIcon);
  return applyGithubMirror(url, currentBaseSkillIconSource.value.isGithub);
}
