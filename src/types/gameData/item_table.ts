/** 物品格式 */
export interface Item {
  itemId: string;
  name: string;
  rarity: string | number;
  iconId: string;
  sortId: number;
  itemType: string;
}

/**
 * `excel/item_table.json` 数据格式
 */
export interface ItemTable {
  items: Record<string, Item>;
}
