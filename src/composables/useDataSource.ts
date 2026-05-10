import {
  avatarSources,
  gameDataSources,
  defaultAvatarSourceId,
  defaultGameDataSourceId,
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
export const currentBaseSkillIconSource = computed(() => {
  return (
    baseSkillIconSources.find((s) => s.id === currentBaseSkillIconSourceId.value) ||
    baseSkillIconSources[0]!
  );
});
export const currentMirror = computed(() => {
  return githubMirrors.find((m) => m.id === currentMirrorId.value) || githubMirrors[0]!;
});

// 计算属性，获取当前选择的数据源的实际 URL（如果是 GitHub 仓库且设置了镜像，则加上镜像前缀）
export const currentGameDataBaseUrl = computed(() => {
  if (currentGameDataSource.value.isGithub) {
    return `${currentMirror.value.prefix}${currentGameDataSource.value.baseUrl}`;
  } else {
    return currentGameDataSource.value.baseUrl;
  }
});
export const currentAvatarBaseUrl = computed(() => {
  if (currentAvatarSource.value.isGithub) {
    return `${currentMirror.value.prefix}${currentAvatarSource.value.baseUrl}`;
  } else {
    return currentAvatarSource.value.baseUrl;
  }
});
export const currentBaseSkillIconBaseUrl = computed(() => {
  if (currentBaseSkillIconSource.value.isGithub) {
    return `${currentMirror.value.prefix}${currentBaseSkillIconSource.value.baseUrl}`;
  } else {
    return currentBaseSkillIconSource.value.baseUrl;
  }
});
