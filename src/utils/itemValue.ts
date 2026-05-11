import defaultItems from '@/assets/json/item.json';
import type { ItemInfo } from '@/utils/itemInfo';
import { useLocalStorage } from '@vueuse/core';
import { computed } from 'vue';

export interface ItemValue {
  id: string;
  name: string;
  apValue: number;
  rarity: number;
}

export const itemValues = useLocalStorage<ItemValue[]>('arknights-item-values', defaultItems);

/**
 * 物品 ID 到其 AP 价值的映射索引
 */
const itemValueMap = computed<Map<string, number>>(() => {
  const map = new Map<string, number>();
  for (const item of itemValues.value) {
    map.set(item.id, item.apValue);
  }
  return map;
});

/**
 * 获取指定物品的 AP 价值
 */
export function getItemApValue(itemId: string): number {
  return itemValueMap.value.get(itemId) ?? 0;
}

/**
 * 计算一组材料的总价值
 */
export function calculateMaterialValue(costs: ItemInfo[] | null | undefined): number {
  if (!costs) return 0;
  return costs.reduce((total, cost) => total + getItemApValue(cost.itemId) * cost.count, 0);
}
