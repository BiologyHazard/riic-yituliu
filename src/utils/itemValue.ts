import { useLocalStorage } from '@vueuse/core';
import type { ItemInfo } from '@/utils/itemInfo';
import defaultItems from '@/assets/json/item.json';

export interface ItemValue {
  id: string;
  name: string;
  apValue: number;
  rarity: number;
}

export const itemValues = useLocalStorage<ItemValue[]>('arknights-item-values', defaultItems);

/**
 * 获取指定物品的 AP 价值
 */
export function getItemApValue(itemId: string): number {
  const item = itemValues.value.find((i) => i.id === itemId);
  return item?.apValue ?? 0;
}

/**
 * 计算一组材料的总价值
 */
export function calculateMaterialValue(costs: ItemInfo[] | null | undefined): number {
  if (!costs) return 0;
  return costs.reduce((total, cost) => total + getItemApValue(cost.itemId) * cost.count, 0);
}
