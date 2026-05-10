import type {
  ActivityTable,
  BuildingData,
  CharacterTable,
  GameDataConst,
  ItemTable,
  SkinTable,
  StageTable,
  ZoneTable,
} from '@/types/gameData';
import { reactive, ref } from 'vue';

/** `excel/character_table.json` */
export const characterTable = reactive<CharacterTable>({});

/** `excel/skin_table.json` */
export const skinTable = reactive<SkinTable>({
  charSkins: {},
  buildinEvolveMap: {},
});

/** `excel/building_data.json` */
export const buildingData = reactive<BuildingData>({
  chars: {},
  buffs: {},
  workshopFormulas: {},
});

/** `excel/gamedata_const.json` */
export const gamedataConst = reactive<GameDataConst>({
  richTextStyles: {},
  termDescriptionDict: {},
});

/** `excel/item_table.json` */
export const itemTable = reactive<ItemTable>({
  items: {},
});

/** `excel/stage_table.json` */
export const stageTable = reactive<StageTable>({
  stages: {},
});

/** `excel/activity_table.json` */
export const activityTable = reactive<ActivityTable>({
  basicInfo: {},
  zoneToActivity: {},
});

/** `excel/zone_table.json` */
export const zoneTable = reactive<ZoneTable>({
  zones: {},
});

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
    const [charRes, skinRes, buildingRes, constRes, itemRes, stageRes, activityRes, zoneRes] =
      await Promise.all([
        fetch(`${baseUrl}/character_table.json`, { signal }).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch character_table: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${baseUrl}/skin_table.json`, { signal }).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch skin_table: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${baseUrl}/building_data.json`, { signal }).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch building_data: ${res.statusText}`);
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
        fetch(`${baseUrl}/stage_table.json`, { signal }).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch stage_table: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${baseUrl}/activity_table.json`, { signal }).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch activity_table: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${baseUrl}/zone_table.json`, { signal }).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch zone_table: ${res.statusText}`);
          return res.json();
        }),
      ]);

    Object.assign(characterTable, charRes);
    Object.assign(skinTable, skinRes);
    Object.assign(buildingData, buildingRes);
    Object.assign(gamedataConst, constRes);
    Object.assign(itemTable, itemRes);
    Object.assign(stageTable, stageRes);
    Object.assign(activityTable, activityRes);
    Object.assign(zoneTable, zoneRes);
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
