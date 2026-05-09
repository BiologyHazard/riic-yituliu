import type {
  BuildingData,
  CharacterTable,
  GameDataConst,
  ItemTable,
  SkinTable,
} from '@/types/gameData';
import { reactive } from 'vue';

/** `excel/character_table.json` */
export const characterTable = reactive<CharacterTable>({} as CharacterTable);

/** `excel/skin_table.json` */
export const skinTable = reactive<SkinTable>({} as SkinTable);

/** `excel/building_data.json` */
export const buildingData = reactive<BuildingData>({} as BuildingData);

/** `excel/gamedata_const.json` */
export const gamedataConst = reactive<GameDataConst>({} as GameDataConst);

/** `excel/item_table.json` */
export const itemTable = reactive<ItemTable>({} as ItemTable);

/**
 * 异步加载或刷新游戏数据
 * @param baseUrl 数据源基础 URL
 */
export async function loadGameData(baseUrl: string) {
  const [charRes, skinRes, buildingRes, constRes, itemRes] = await Promise.all([
    fetch(`${baseUrl}/character_table.json`).then((res) => res.json()),
    fetch(`${baseUrl}/skin_table.json`).then((res) => res.json()),
    fetch(`${baseUrl}/building_data.json`).then((res) => res.json()),
    fetch(`${baseUrl}/gamedata_const.json`).then((res) => res.json()),
    fetch(`${baseUrl}/item_table.json`).then((res) => res.json()),
  ]);

  // 使用 Object.assign 保持响应式对象的引用不变，但更新其内容
  Object.assign(characterTable, charRes);
  Object.assign(skinTable, skinRes);
  Object.assign(buildingData, buildingRes);
  Object.assign(gamedataConst, constRes);
  Object.assign(itemTable, itemRes);
}
