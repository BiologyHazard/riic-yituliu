import type { ArknightsGameData } from '@/types/gameData';
import { ref, shallowRef } from 'vue';

/**
 * 聚合游戏数据状态
 * 使用 shallowRef 以优化大型 JSON 对象的响应式性能
 */
export const gameData = shallowRef<ArknightsGameData | null>(null);

export const isGameDataLoading = ref(false);
export const gameDataError = ref<unknown | null>(null);

let abortController: AbortController | null = null;

export async function abortGameDataLoading() {
  if (abortController) {
    abortController.abort();
  }
}

export async function loadGameData(baseUrl: string) {
  abortGameDataLoading();
  abortController = new AbortController();
  const { signal } = abortController;

  isGameDataLoading.value = true;
  gameDataError.value = null;
  try {
    const [
      activityTableRes,
      buildingDataRes,
      charPatchTableRes,
      characterTableRes,
      gameDataConstRes,
      itemTableRes,
      skinTableRes,
      stageTableRes,
      uniequipTableRes,
      zoneTableRes,
    ] = await Promise.all([
      fetch(`${baseUrl}/activity_table.json`, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch activity_table: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${baseUrl}/building_data.json`, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch building_data: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${baseUrl}/char_patch_table.json`, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch char_patch_table: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${baseUrl}/character_table.json`, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch character_table: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${baseUrl}/gamedata_const.json`, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch gamedata_const: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${baseUrl}/item_table.json`, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch item_table: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${baseUrl}/skin_table.json`, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch skin_table: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${baseUrl}/stage_table.json`, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch stage_table: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${baseUrl}/uniequip_table.json`, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch uniequip_table: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${baseUrl}/zone_table.json`, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch zone_table: ${res.statusText}`);
        return res.json();
      }),
    ]);

    // 构造聚合后的数据对象
    const allData: ArknightsGameData = {
      activityTable: activityTableRes,
      buildingData: buildingDataRes,
      charPatchTable: charPatchTableRes,
      characterTable: characterTableRes,
      gameDataConst: gameDataConstRes,
      itemTable: itemTableRes,
      skinTable: skinTableRes,
      stageTable: stageTableRes,
      uniequipTable: uniequipTableRes,
      zoneTable: zoneTableRes,
    };

    // 加一个 exp 虚拟物品
    allData.itemTable.items['exp'] = {
      itemId: 'exp',
      name: 'EXP',
      rarity: 0,
      iconId: 'EXP_PLAYER',
      sortId: 0,
      itemType: 'EXP',
    };

    gameData.value = allData;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return;
    }
    console.error('Game data loading failed:', err);
    gameDataError.value = err;
  } finally {
    if (abortController?.signal === signal) {
      isGameDataLoading.value = false;
      abortController = null;
    }
  }
}
