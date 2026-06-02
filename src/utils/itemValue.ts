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
 * 确保 EXP 虚拟物品存在于价值列表中。
 * 根据「基础作战记录」(2001) 的理智价值自动推算 exp 的 AP 价值。
 * 在导入 JSON 后或初始化时调用。
 */
export function ensureExpEntry(): void {
  const battleRecord = itemValues.value.find((item) => item.id === '2001');
  if (!battleRecord || battleRecord.apValue <= 0) return;

  const expApValue = battleRecord.apValue / 200;
  const existingIndex = itemValues.value.findIndex((item) => item.id === 'exp');

  if (existingIndex >= 0 && itemValues.value[existingIndex]) {
    itemValues.value[existingIndex].apValue = expApValue;
  } else {
    itemValues.value.push({
      id: 'exp',
      name: 'EXP',
      apValue: expApValue,
      rarity: 0,
    });
  }
}

// 模块初始化时确保 EXP 条目存在
ensureExpEntry();

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
