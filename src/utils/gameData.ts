import type {
  BuildingData,
  CharacterTable,
  GameDataConst,
  ItemTable,
  SkinTable,
} from '@/types/gameData';
import { reactive, ref } from 'vue';

export const isGameDataLoading = ref(false);
export const gameDataError = ref<Error | null>(null);

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
export const stageTable = reactive({});

/** `excel/activity_table.json` */
export const activityTable = reactive({});

/** `excel/zone_table.json` */
export const zoneTable = reactive({});

/**
 * 异步加载或刷新游戏数据
 * @param baseUrl 数据源基础 URL
 */
export async function loadGameData(baseUrl: string) {
  isGameDataLoading.value = true;
  gameDataError.value = null;
  try {
    const [charRes, skinRes, buildingRes, constRes, itemRes, stageRes, activityRes, zoneRes] =
      await Promise.all([
        fetch(`${baseUrl}/character_table.json`).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch character_table: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${baseUrl}/skin_table.json`).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch skin_table: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${baseUrl}/building_data.json`).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch building_data: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${baseUrl}/gamedata_const.json`).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch gamedata_const: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${baseUrl}/item_table.json`).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch item_table: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${baseUrl}/stage_table.json`).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch stage_table: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${baseUrl}/activity_table.json`).then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch activity_table: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${baseUrl}/zone_table.json`).then((res) => {
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
    console.error('Game data loading failed:', err);
    gameDataError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isGameDataLoading.value = false;
  }
}
