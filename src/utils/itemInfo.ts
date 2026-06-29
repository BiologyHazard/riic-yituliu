import type { ItemBundle } from '@/types/gameData';
import { gameData } from '@/utils/gameData/gameData';
import { getItemName } from '@/utils/gameData/item';

export interface ItemInfo {
  itemId: string;
  count: number;
}

export function fromItemBundle({ id, count }: ItemBundle): ItemInfo {
  return {
    itemId: id,
    count: count,
  };
}

export function fromItemBundleArray(bundles: ItemBundle[]): ItemInfo[] {
  return bundles.map(fromItemBundle);
}

export function toCounter(itemInfoList: ItemInfo[]): Map<string, number> {
  const counter = new Map<string, number>();
  for (const { itemId, count } of itemInfoList) {
    counter.set(itemId, (counter.get(itemId) ?? 0) + count);
  }
  return counter;
}

export function sortBySortId(itemInfoList: ItemInfo[]): ItemInfo[] {
  return [...itemInfoList].sort((a, b) => {
    const itemA = gameData.value?.itemTable.items[a.itemId];
    const itemB = gameData.value?.itemTable.items[b.itemId];
    if (itemA === undefined || itemB === undefined) {
      return 0;
    }
    return itemA.sortId - itemB.sortId;
  });
}

export function combine(itemInfoList: ItemInfo[]): ItemInfo[] {
  const counter = toCounter(itemInfoList);
  const combinedList: ItemInfo[] = [];
  for (const [itemId, count] of counter.entries()) {
    combinedList.push({ itemId, count });
  }
  return combinedList;
}

export function display(itemInfo: ItemInfo | ItemInfo[]): string {
  if (Array.isArray(itemInfo)) {
    return itemInfo.map(display).join(' ');
  } else {
    return `${getItemName(itemInfo.itemId) ?? itemInfo.itemId}×${itemInfo.count}`;
  }
}
