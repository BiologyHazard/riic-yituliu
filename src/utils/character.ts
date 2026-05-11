import { buildingData, characterTable, gamedataConst, skinTable } from '@/utils/gameData';
import { fromItemBundleArray, type ItemInfo } from '@/utils/itemInfo';
import { computed, watch } from 'vue';

export const professionMap: Map<string, string> = new Map(
  Object.entries({
    PIONEER: '先锋',
    WARRIOR: '近卫',
    SNIPER: '狙击',
    CASTER: '术师',
    MEDIC: '医疗',
    TANK: '重装',
    SUPPORT: '辅助',
    SPECIAL: '特种',
  }),
);

/**
 * 根据干员名称获取干员 ID
 * @param name 干员名称（如："能天使"）
 * @returns 干员 ID（如："char_103_angel"），未找到则返回 undefined
 * @example
 * getCharIdbyName('能天使') // => 'char_103_angel'
 * getCharIdbyName('Unknown') // => undefined
 */
export function getCharIdByName(name: string): string | undefined {
  for (const charId in characterTable.value) {
    if (characterTable.value[charId]?.name === name) {
      return charId;
    }
  }
}

/**
 * 根据干员 ID 获取干员名称
 * @param charId 干员 ID（如："char_103_angel"）
 * @returns 干员名称（如："能天使"），未找到则返回 undefined
 * @example
 * getCharName('char_103_angel') // => '能天使'
 * getCharName('unknown') // => undefined
 */
export function getCharName(charId: string): string | undefined {
  return characterTable.value[charId]?.name;
}

/**
 * 根据干员 ID 获取干员稀有度
 * @param charId 干员 ID
 * @returns 稀有度等级（0-5，对应游戏中的 1-6 星），未找到则返回 undefined
 * @example
 * getCharRarity('char_103_angel') // => 5 (对应 6 星)
 * getCharRarity('unknown') // => undefined
 */
export function getCharRarity(charId: string): number | undefined {
  const rarity: number | string | undefined = characterTable.value[charId]?.rarity;
  if (rarity === undefined) {
    return undefined;
  } else if (typeof rarity === 'number') {
    return rarity;
  } else {
    const rarityNum = Number(rarity.slice(-1));
    return !isNaN(rarityNum) ? rarityNum - 1 : undefined;
  }
}

/**
 * 根据干员 ID 获取干员职业 ID
 * @param charId 干员 ID
 * @returns 职业 ID（如："SNIPER"），未找到则返回 undefined
 * @example
 * getCharProfessionId('char_103_angel') // => 'SNIPER'
 * getCharProfessionId('unknown') // => undefined
 */
export function getCharProfessionId(charId: string): string | undefined {
  return characterTable.value[charId]?.profession;
}

/**
 * 根据干员 ID 和精英化等级获取皮肤 ID
 * @param charId 干员 ID
 * @param eliteLevel 精英化等级（0/1/2）
 * @returns 皮肤 ID
 * @example
 * getCharSkinId('char_103_angel', 2) // => 'char_103_angel#2'
 */
export function getCharSkinId(charId: string, eliteLevel: number): string {
  const evolveMap = skinTable.value.buildinEvolveMap[charId] ?? {};
  for (let level = eliteLevel; level >= 0; level--) {
    const skinId = evolveMap[String(level)];
    if (skinId !== undefined) {
      return skinId;
    }
  }
  // Fallback to default skinId
  if (eliteLevel === 2) {
    return `${charId}#2`;
  } else {
    return `${charId}#1`;
  }
}

/**
 * 根据干员 ID 和精英化等级获取头像 ID
 * @param charId 干员 ID
 * @param eliteLevel 精英化等级（0/1/2）
 * @returns 头像 ID，用于构建头像 URL
 * @example
 * getCharAvatar('char_103_angel', 2) // => 'char_103_angel_2'
 */
export function getCharAvatar(charId: string, eliteLevel: number): string {
  // const evolveMap = skinTable.value.buildinEvolveMap[charId] ?? {}
  // for (let level = eliteLevel; level >= 0; level--) {
  //   if (String(level) in evolveMap) {
  //     const avatarId = skinTable.value.charSkins[evolveMap[String(level)] ?? '']?.avatarId
  //     if (avatarId !== undefined) {
  //       return avatarId
  //     }
  //   }
  // }
  const skinId = getCharSkinId(charId, eliteLevel);
  const avatarId = skinTable.value.charSkins[skinId]?.avatarId;
  if (avatarId !== undefined) {
    return avatarId;
  }
  // Fallback to default avatarId
  if (eliteLevel === 2) {
    return `${charId}_2`;
  } else {
    return charId;
  }
}

/**
 * 将职业 ID 转换为中文名称
 * @param professionIdOrName 职业 ID（如："SNIPER"）或职业名称
 * @returns 职业中文名称（如："狙击"），未找到则返回原值
 * @example
 * getProfessionName('SNIPER') // => '狙击'
 * getProfessionName('MEDIC') // => '医疗'
 */
export function getProfessionName(professionIdOrName: string): string {
  return professionMap.get(professionIdOrName) ?? professionIdOrName;
}

/**
 * 判断是否为实装干员，有这么几种方法：
 * 1. 在 `building_data` 的 `chars` 对象的 key 中（判断是否有基建技能）
 * 2. `char.itemObtainApproach` 不为 `null`
 */
export function isCharInGame(charId: string): boolean {
  const char = characterTable.value[charId];
  if (char === undefined) {
    return false;
  }
  const criterion1 = buildingData.value.chars.hasOwnProperty(charId);
  const criterion2 = char.itemObtainApproach !== null;
  if (criterion1 !== criterion2) {
    console.warn(
      `干员 ${charId} (${char.name}) 的实装状态不一致：根据基建技能判断为 ${criterion1}，根据获取途径判断为 ${criterion2}。`,
    );
  }
  return criterion1 || criterion2;
}

export function getCharMaxEliteLevel(charId: string): number {
  const char = characterTable.value[charId];
  if (char === undefined) {
    return 0;
  }
  return char.phases.length - 1;
}

export function getCharMaxLevel(charId: string, eliteLevel: number): number {
  const char = characterTable.value[charId];
  if (char === undefined) {
    return 0;
  }

  return char.phases[eliteLevel]?.maxLevel ?? 0;
}

export function charEliteOnceItemCost(charId: string, originalEliteLevel: number): ItemInfo[] {
  const char = characterTable.value[charId];
  if (char === undefined) {
    return [];
  }
  const goldCost =
    gamedataConst.value.evolveGoldCost[getCharRarity(charId)!]?.[originalEliteLevel] ?? 0;
  const evolveCost = fromItemBundleArray(char.phases[originalEliteLevel + 1]?.evolveCost ?? []);
  const totalCost = [{ itemId: '4001', count: goldCost }, ...evolveCost];
  return totalCost;
}

export function charEliteItemCost(
  charId: string,
  originalEliteLevel: number | null = null,
  targetEliteLevel: number | null = null,
): ItemInfo[] {
  if (originalEliteLevel === null) {
    originalEliteLevel = 0;
  }
  if (targetEliteLevel === null) {
    targetEliteLevel = getCharMaxEliteLevel(charId);
  }

  const totalCost = [];
  for (let eliteLevel = originalEliteLevel; eliteLevel < targetEliteLevel; eliteLevel++) {
    totalCost.push(...charEliteOnceItemCost(charId, eliteLevel));
  }
  return totalCost;
}

function calculateAccumulatedCost(costArray: number[][]): number[][] {
  return costArray.map((rarityData) => {
    let sum = 0;
    return [0, ...rarityData.filter((x) => x > 0).map((cost) => (sum += cost))]; // 前面加一个 0 代表升到 1 级的成本为 0
  });
}

export const accumulatedExpCost = computed(() =>
  calculateAccumulatedCost(gamedataConst.value.characterExpMap),
);

export const accumulatedGoldCost = computed(() =>
  calculateAccumulatedCost(gamedataConst.value.characterUpgradeCostMap),
);

watch([accumulatedExpCost, accumulatedGoldCost], ([newExpCost, newGoldCost]) => {
  console.log(newExpCost);
  console.log(newGoldCost);
});

export function charLevelUpOnceItemCost(
  charId: string,
  eliteLevel: number,
  originalLevel: number | null = null,
  targetLevel: number | null = null,
): ItemInfo[] {
  if (originalLevel === null) {
    originalLevel = 1;
  }
  if (targetLevel === null) {
    targetLevel = getCharMaxLevel(charId, eliteLevel);
  }

  if (originalLevel >= targetLevel) {
    return [];
  }

  const expCost =
    (accumulatedExpCost.value[eliteLevel]?.[targetLevel - 1] ?? 0) -
    (accumulatedExpCost.value[eliteLevel]?.[originalLevel - 1] ?? 0);
  const goldCost =
    (accumulatedGoldCost.value[eliteLevel]?.[targetLevel - 1] ?? 0) -
    (accumulatedGoldCost.value[eliteLevel]?.[originalLevel - 1] ?? 0);
  return [
    { itemId: 'exp', count: expCost },
    { itemId: '4001', count: goldCost },
  ];
}

export function charLevelUpItemCost(
  charId: string,
  originalEliteLevel: number | null = null,
  originalLevel: number | null = null,
  targetEliteLevel: number | null = null,
  targetLevel: number | null = null,
): ItemInfo[] {
  if (originalEliteLevel === null) {
    originalEliteLevel = 0;
  }
  if (targetEliteLevel === null) {
    targetEliteLevel = getCharMaxEliteLevel(charId);
  }

  const totalCost = [];
  for (let eliteLevel = originalEliteLevel; eliteLevel <= targetEliteLevel; eliteLevel++) {
    const levelUpOriginalLevel = eliteLevel === originalEliteLevel ? originalLevel : null;
    const levelUpTargetLevel = eliteLevel === targetEliteLevel ? targetLevel : null;
    totalCost.push(
      ...charLevelUpOnceItemCost(charId, eliteLevel, levelUpOriginalLevel, levelUpTargetLevel),
    );
  }
  return totalCost;
}

export function charEliteAndLevelUpItemCost(
  charId: string,
  originalEliteLevel: number | null = null,
  originalLevel: number | null = null,
  targetEliteLevel: number | null = null,
  targetLevel: number | null = null,
): ItemInfo[] {
  const eliteAndLevelUpCost = charEliteItemCost(charId, originalEliteLevel, targetEliteLevel);
  const levelUpCost = charLevelUpItemCost(
    charId,
    originalEliteLevel,
    originalLevel,
    targetEliteLevel,
    targetLevel,
  );
  return [...eliteAndLevelUpCost, ...levelUpCost];
}
