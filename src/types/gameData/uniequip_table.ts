import type { ItemBundle } from './common';

export interface UniEquipData {
  typeName1: string;
  typeName2: string | null;
  itemCost: Record<number, ItemBundle[]> | null;
}

/**
 * `excel/uniequip_table.json` 数据格式
 */
export interface UniequipTable {
  equipDict: Record<string, UniEquipData>;
  charEquip: Record<string, string[]>;
}
