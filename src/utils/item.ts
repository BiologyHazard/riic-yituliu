import { gameData } from '@/utils/gameData';

export function getItemName(itemId: string): string {
  return gameData.value?.itemTable.items[itemId]?.name ?? itemId;
}

export function getItemRarity(itemId: string): number | undefined {
  const item = gameData.value?.itemTable.items[itemId];
  if (item === undefined) {
    return undefined;
  }
  const rarity: number | string = item.rarity;
  if (typeof rarity === 'number') {
    return rarity;
  } else {
    const rarityNum = Number(rarity.slice(-1));
    return !isNaN(rarityNum) ? rarityNum - 1 : undefined;
  }
}

export function getItemIconUrl(itemId: string): string | undefined {
  const item = gameData.value?.itemTable.items[itemId];
  if (item === undefined) {
    return undefined;
  }
  return `https://torappu.prts.wiki/assets/item_icon/${item.iconId}.png`;
}

export function isEliteMaterial(itemId: string): boolean | undefined {
  const item = gameData.value?.itemTable.items[itemId];
  if (item === undefined) {
    return undefined;
  }
  return 100000 <= item.sortId && item.sortId < 200000;
}

export function getWorkshopByProductRate(itemId: string): number | undefined {
  const item = gameData.value?.itemTable.items[itemId];
  if (item === undefined) {
    return undefined;
  }
  const resultSet: Set<number> = new Set();
  const formulas = gameData.value?.buildingData.workshopFormulas ?? {};
  for (const workshopFormula of Object.values(formulas)) {
    for (const extraOutcome of workshopFormula.extraOutcomeGroup) {
      if (extraOutcome.itemId === itemId) {
        resultSet.add(extraOutcome.weight);
      }
    }
  }
  if (resultSet.size === 0) {
    return undefined;
  } else if (resultSet.size > 1) {
    throw new Error(
      `Multiple workshop formulas found with different extra outcome rates for the same itemId '${itemId}'`,
    );
  } else {
    return resultSet.values().next().value;
  }
}
