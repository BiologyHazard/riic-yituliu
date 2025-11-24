import type {
  BuildingData,
  CharacterTable,
  GameDataConst,
  ItemTable,
  SkinTable,
} from '@/types/gameData';

/** `excel/character_table.json` */
export const characterTable: CharacterTable = await fetch(
  'https://torappu.prts.wiki/gamedata/latest/excel/character_table.json',
).then((res) => res.json());

/** `excel/skin_table.json` */
export const skinTable: SkinTable = await fetch(
  'https://torappu.prts.wiki/gamedata/latest/excel/skin_table.json',
).then((res) => res.json());

/** `excel/building_data.json` */
export const buildingData: BuildingData = await fetch(
  'https://torappu.prts.wiki/gamedata/latest/excel/building_data.json',
).then((res) => res.json());

/** `excel/gamedata_const.json` */
export const gamedataConst: GameDataConst = await fetch(
  'https://torappu.prts.wiki/gamedata/latest/excel/gamedata_const.json',
).then((res) => res.json());

/** `excel/item_table.json` */
export const itemTable: ItemTable = await fetch(
  'https://torappu.prts.wiki/gamedata/latest/excel/item_table.json',
).then((res) => res.json());

// export const stageTable = await fetch(
//   'https://torappu.prts.wiki/gamedata/latest/excel/stage_table.json',
// ).then((res) => res.json());

// export const activityTable = await fetch(
//   'https://torappu.prts.wiki/gamedata/latest/excel/activity_table.json',
// ).then((res) => res.json());

// export const zoneTable = await fetch(
//   'https://torappu.prts.wiki/gamedata/latest/excel/zone_table.json',
// ).then((res) => res.json());
