import { buildingData, itemTable } from '@/utils/gameData';

export function isEliteMaterial(itemId: string): boolean | undefined {
  const item = itemTable.items[itemId];
  if (item === undefined) {
    return undefined;
  }
  return 100000 <= item.sortId && item.sortId < 200000;
}

export function getWorkshopByProductRate(itemId: string): number | undefined {
  const item = itemTable.items[itemId];
  if (item === undefined) {
    return undefined;
  }
  const resultSet: Set<number> = new Set();
  for (const workshopFormula of Object.values(buildingData.workshopFormulas)) {
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
