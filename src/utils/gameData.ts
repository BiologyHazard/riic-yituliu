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
import { ref } from 'vue';

/** `excel/character_table.json` */
export const characterTable = ref<CharacterTable>({});

/** `excel/skin_table.json` */
export const skinTable = ref<SkinTable>({
  charSkins: {},
  buildinEvolveMap: {},
});

/** `excel/building_data.json` */
export const buildingData = ref<BuildingData>({
  chars: {},
  buffs: {},
  workshopFormulas: {},
});

/** `excel/gamedata_const.json` */
export const gamedataConst = ref<GameDataConst>({
  characterExpMap: [],
  characterUpgradeCostMap: [],
  evolveGoldCost: [],
  richTextStyles: {},
  termDescriptionDict: {},
});

/** `excel/item_table.json` */
export const itemTable = ref<ItemTable>({
  items: {},
});

/** `excel/stage_table.json` */
export const stageTable = ref<StageTable>({
  stages: {},
});

/** `excel/activity_table.json` */
export const activityTable = ref<ActivityTable>({
  basicInfo: {},
  zoneToActivity: {},
});

/** `excel/zone_table.json` */
export const zoneTable = ref<ZoneTable>({
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

    characterTable.value = charRes;
    skinTable.value = skinRes;
    buildingData.value = buildingRes;
    gamedataConst.value = constRes;
    itemTable.value = itemRes;
    stageTable.value = stageRes;
    activityTable.value = activityRes;
    zoneTable.value = zoneRes;

    // 加一个 exp 虚拟物品
    itemTable.value.items['exp'] = {
      itemId: 'exp',
      name: 'EXP',
      rarity: 0,
      iconId: 'EXP_PLAYER',
      sortId: 0,
      itemType: 'EXP',
    };
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
