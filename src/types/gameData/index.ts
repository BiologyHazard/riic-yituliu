import type { ActivityTable } from './activity_table';
import type { BuildingData } from './building_data';
import type { CharPatchTable } from './char_patch_table';
import type { CharacterTable } from './character_table';
import type { GameDataConst } from './gamedata_const';
import type { ItemTable } from './item_table';
import type { SkinTable } from './skin_table';
import type { StageTable } from './stage_table';
import type { UniequipTable } from './uniequip_table';
import type { ZoneTable } from './zone_table';

export type * from './activity_table';
export type * from './building_data';
export type * from './char_patch_table';
export type * from './character_table';
export type * from './common';
export type * from './gamedata_const';
export type * from './item_table';
export type * from './skin_table';
export type * from './stage_table';
export type * from './uniequip_table';
export type * from './zone_table';

/**
 * 聚合游戏数据接口
 */
export interface ArknightsGameData {
  activityTable: ActivityTable;
  buildingData: BuildingData;
  charPatchTable: CharPatchTable;
  characterTable: CharacterTable;
  gameDataConst: GameDataConst;
  itemTable: ItemTable;
  skinTable: SkinTable;
  stageTable: StageTable;
  uniequipTable: UniequipTable;
  zoneTable: ZoneTable;
}
