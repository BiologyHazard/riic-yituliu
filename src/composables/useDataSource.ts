import {
  dataSources,
  defaultDataSourceId,
  defaultGithubMirrorId,
  githubMirrors,
} from '@/config/dataSources';
import { useLocalStorage } from '@vueuse/core';
import { computed } from 'vue';

const DATA_SOURCE_STORAGE_KEY = 'riic_data_source_id';
const GITHUB_MIRROR_STORAGE_KEY = 'riic_github_mirror_id';

/**
 * 全局共享的数据源状态
 */
export const currentSourceId = useLocalStorage(DATA_SOURCE_STORAGE_KEY, defaultDataSourceId);
/**
 * 全局共享的 GitHub 镜像状态
 */
export const currentMirrorId = useLocalStorage(GITHUB_MIRROR_STORAGE_KEY, defaultGithubMirrorId);

export const currentMirror = computed(() => {
  return githubMirrors.find((m) => m.id === currentMirrorId.value) || githubMirrors[0]!;
});

export const currentSource = computed(() => {
  return dataSources.find((s) => s.id === currentSourceId.value) || dataSources[0]!;
});

/**
 * 根据当前选择的数据源和 GitHub 镜像计算最终的 baseUrl
 */
export const currentBaseUrl = computed(() => {
  // 如果是 GitHub 仓库且设置了镜像，则给 baseUrl 加上前缀
  if (currentSource.value.isGithub) {
    return `${currentMirror.value.prefix}${currentSource.value.baseUrl}`;
  } else {
    return currentSource.value.baseUrl;
  }
});
