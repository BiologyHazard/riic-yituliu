import {
  avatarSources,
  gameDataSources,
  itemIconSources,
  defaultAvatarSourceId,
  defaultGameDataSourceId,
  defaultItemIconSourceId,
  defaultGithubMirrorId,
  defaultBaseSkillIconSourceId,
  githubMirrors,
  baseSkillIconSources,
} from '@/config/dataSources';
import { useLocalStorage } from '@vueuse/core';
import { computed } from 'vue';

// localStorage 的 key
const GAME_DATA_SOURCE_STORAGE_KEY = 'riic_game_data_source_id';
const AVATAR_SOURCE_STORAGE_KEY = 'riic_avatar_source_id';
const ITEM_ICON_SOURCE_STORAGE_KEY = 'riic_item_icon_source_id';
const BASE_SKILL_ICON_SOURCE_STORAGE_KEY = 'riic_base_skill_icon_source_id';
const GITHUB_MIRROR_STORAGE_KEY = 'riic_github_mirror_id';

// 当前选择的数据源，使用 localStorage 持久化
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

// 计算属性，获取当前选择的数据源对象
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

// 计算属性，获取当前游戏数据的实际 URL（如果是 GitHub 仓库且设置了镜像，则加上镜像前缀）
export const currentGameDataBaseUrl = computed(() => {
  if (currentGameDataSource.value.isGithub) {
    return `${currentMirror.value.prefix}${currentGameDataSource.value.baseUrl}`;
  } else {
    return currentGameDataSource.value.baseUrl;
  }
});

// 图片资源 URL 构建函数（内部读取 reactive refs，在 computed 中调用时自动追踪依赖）
export function getAvatarUrl(charId: string, eliteLevel: number): string {
  const url = currentAvatarSource.value.getUrl(charId, eliteLevel);
  return currentAvatarSource.value.isGithub ? `${currentMirror.value.prefix}${url}` : url;
}

export function getItemIconUrl(itemId: string): string {
  const url = currentItemIconSource.value.getUrl(itemId);
  return currentItemIconSource.value.isGithub ? `${currentMirror.value.prefix}${url}` : url;
}

export function getBaseSkillIconUrl(skillIcon: string): string {
  const url = currentBaseSkillIconSource.value.getUrl(skillIcon);
  return currentBaseSkillIconSource.value.isGithub ? `${currentMirror.value.prefix}${url}` : url;
}
