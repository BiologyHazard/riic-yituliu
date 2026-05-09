import { useLocalStorage } from '@vueuse/core';
import { DATA_SOURCES, DEFAULT_SOURCE_ID } from '@/config/dataSources';
import { loadGameData } from '@/utils/gameData';
import { computed } from 'vue';

const STORAGE_KEY = 'riic_data_source_id';

/**
 * 全局共享的数据源状态
 */
const currentSourceId = useLocalStorage(STORAGE_KEY, DEFAULT_SOURCE_ID);

export function useDataSource() {
  /**
   * 获取当前激活的数据源对象
   */
  const currentSource = computed(
    () => DATA_SOURCES.find((s) => s.id === currentSourceId.value) || DATA_SOURCES[0]!,
  );

  /**
   * 变更数据源
   * @param id 数据源 ID
   */
  const setSource = async (id: string) => {
    if (DATA_SOURCES.some((s) => s.id === id)) {
      currentSourceId.value = id;
      // 切换时不 reload，而是直接调用加载函数刷新响应式数据
      await loadGameData(currentSource.value.baseUrl);
    }
  };

  return {
    currentSourceId,
    currentSource,
    dataSources: DATA_SOURCES,
    setSource,
  };
}
