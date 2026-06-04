import type { UniEquipData } from '@/types/gameData';
import { gameData } from '@/utils/gameData';
import type { ItemInfo } from '@/utils/itemInfo';
import { fromItemBundleArray } from '@/utils/itemInfo';
import { computed } from 'vue';

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

// TODO: patchedCharacterTable 通过对象展开把 characterTable 全量拷贝一份再覆盖 patch（O(n) 且额外占用内存）。在数据表较大时会影响首屏与内存占用。建议改为按需读取（例如提供 getCharacter(charId)：优先 patch，否则原表），或用惰性合并结构而不是每次构造完整新对象。
export const patchedCharacterTable = computed(() => ({
  ...gameData.value?.characterTable,
  ...gameData.value?.charPatchTable.patchChars,
}));

/**
 * 根据干员名称获取干员 ID
 * @param name 干员名称（如："能天使"）
 * @returns 干员 ID（如："char_103_angel"），未找到则返回 undefined
 * @example
 * getCharIdbyName('能天使') // => 'char_103_angel'
 * getCharIdbyName('Unknown') // => undefined
 */
export function getCharIdByName(name: string): string | undefined {
  for (const charId in patchedCharacterTable.value) {
    if (patchedCharacterTable.value[charId]?.name === name) {
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
  return patchedCharacterTable.value[charId]?.name;
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
  const rarity: number | string | undefined = patchedCharacterTable.value[charId]?.rarity;
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
  return patchedCharacterTable.value[charId]?.profession;
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
  const evolveMap = gameData.value?.skinTable.buildinEvolveMap[charId] ?? {};
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
  // const evolveMap = gameData.value?.skinTable.buildinEvolveMap[charId] ?? {}
  // for (let level = eliteLevel; level >= 0; level--) {
  //   if (String(level) in evolveMap) {
  //     const avatarId = gameData.value?.skinTable.charSkins[evolveMap[String(level)] ?? '']?.avatarId
  //     if (avatarId !== undefined) {
  //       return avatarId
  //     }
  //   }
  // }
  const skinId = getCharSkinId(charId, eliteLevel);
  const avatarId = gameData.value?.skinTable.charSkins[skinId]?.avatarId;
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

export function getCharProfessionName(charId: string): string | undefined {
  const professionId = getCharProfessionId(charId);
  if (professionId === undefined) {
    return undefined;
  }
  return professionMap.get(professionId);
}

export function isPatchChar(charId: string): boolean {
  return !!gameData.value && charId in gameData.value.charPatchTable.patchChars;
}

export function isRogueSpChar(charId: string): boolean {
  const char = patchedCharacterTable.value[charId];
  return char?.spTargetType === 'ROGUE' || char?.spTargetType === 1;
}

/**
 * 判断是否为实装干员，有这么几种方法：
 * 1. 在 `building_data` 的 `chars` 对象的 key 中（判断是否有基建技能）
 * 2. `char.itemObtainApproach` 不为 `null`
 */
export function isCharInGame(charId: string): boolean {
  // 升变干员直接判断为实装干员
  if (isPatchChar(charId)) {
    return true;
  }
  const char = patchedCharacterTable.value[charId];
  if (char === undefined) {
    return false;
  }
  const criterion1 = charId in (gameData.value?.buildingData.chars ?? {});
  const criterion2 = char.itemObtainApproach !== null;
  if (criterion1 !== criterion2) {
    console.warn(
      `干员 ${charId} (${char.name}) 的实装状态不一致：根据基建技能判断为 ${criterion1}，根据获取途径判断为 ${criterion2}。`,
    );
  }
  return criterion1 || criterion2;
}

export function getCharMaxEliteLevel(charId: string): number {
  const char = patchedCharacterTable.value[charId];
  if (char === undefined) {
    return 0;
  }
  return char.phases.length - 1;
}

export function getCharMaxLevel(charId: string, eliteLevel: number): number {
  const char = patchedCharacterTable.value[charId];
  if (char === undefined) {
    return 0;
  }
  return char.phases[eliteLevel]?.maxLevel ?? 0;
}

export function getCharAllSkillMaxLevel(charId: string): number {
  const char = patchedCharacterTable.value[charId];
  if (char === undefined) {
    return 0;
  }
  return char.allSkillLvlup.length + 1;
}

export function getCharUniequipIds(charId: string): string[] {
  return gameData.value?.uniequipTable.charEquip[charId] ?? [];
}

export function getCharUniequips(charId: string): Map<string, UniEquipData> {
  const uniequipIds = getCharUniequipIds(charId);
  const uniequips = new Map<string, UniEquipData>();
  for (const uniequipId of uniequipIds) {
    const uniequip = gameData.value?.uniequipTable.equipDict[uniequipId];
    if (uniequip !== undefined) {
      uniequips.set(uniequipId, uniequip);
    }
  }
  return uniequips;
}

export function getCharUniequipByType(
  charId: string,
  uniequipTypeName: string,
): UniEquipData | undefined {
  const typeName =
    new Map([
      ['Δ', 'D'],
      ['α', 'A'],
      ['β', 'B'],
    ]).get(uniequipTypeName) ?? uniequipTypeName;
  const upperTypeName = typeName.toUpperCase();
  for (const uniequip of getCharUniequips(charId).values()) {
    if (upperTypeName === uniequip.typeName1 || upperTypeName === uniequip.typeName2) {
      return uniequip;
    }
  }
}

export function getCharUniequip(
  charId: string,
  uniequipIdOrType: string,
): UniEquipData | undefined {
  // 优先尝试直接通过 ID 获取，如果找不到再通过类型获取
  const uniequip = gameData.value?.uniequipTable.equipDict[uniequipIdOrType];
  if (uniequip !== undefined) {
    return uniequip;
  } else {
    return getCharUniequipByType(charId, uniequipIdOrType);
  }
}

export function isOriginalUniequip(uniequip: UniEquipData): boolean {
  return uniequip.typeName1 === 'ORIGINAL';
}

export function charEliteOnceItemCost(charId: string, originalEliteLevel: number): ItemInfo[] {
  // 升变干员和特勤干员不计算精英化消耗
  if (isPatchChar(charId) || isRogueSpChar(charId)) {
    return [];
  }
  const char = patchedCharacterTable.value[charId];
  if (char === undefined) {
    return [];
  }
  const goldCost =
    gameData.value?.gameDataConst.evolveGoldCost[getCharRarity(charId)!]?.[originalEliteLevel] ?? 0;
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
  calculateAccumulatedCost(gameData.value?.gameDataConst.characterExpMap ?? []),
);

export const accumulatedGoldCost = computed(() =>
  calculateAccumulatedCost(gameData.value?.gameDataConst.characterUpgradeCostMap ?? []),
);

export function charLevelUpOnceItemCost(
  charId: string,
  eliteLevel: number,
  originalLevel: number | null = null,
  targetLevel: number | null = null,
): ItemInfo[] {
  // 升变干员和特勤干员不计算等级升级消耗
  if (isPatchChar(charId) || isRogueSpChar(charId)) {
    return [];
  }
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
  const eliteCost = charEliteItemCost(charId, originalEliteLevel, targetEliteLevel);
  const levelUpCost = charLevelUpItemCost(
    charId,
    originalEliteLevel,
    originalLevel,
    targetEliteLevel,
    targetLevel,
  );
  return [...eliteCost, ...levelUpCost];
}

export function charAllSkillLevelUpOnceItemCost(
  charId: string,
  targetSkillLevel: number,
): ItemInfo[] {
  // 升变干员不计算通用技能升级消耗
  if (isPatchChar(charId)) {
    return [];
  }
  const char = patchedCharacterTable.value[charId];
  if (char === undefined || char.allSkillLvlup.length === 0) {
    return [];
  }
  if (targetSkillLevel < 2 || targetSkillLevel > getCharAllSkillMaxLevel(charId)) {
    return [];
  }

  return fromItemBundleArray(char.allSkillLvlup[targetSkillLevel - 2]?.lvlUpCost ?? []);
}

export function charAllSkillLevelUpItemCost(
  charId: string,
  originalSkillLevel: number | null = null,
  targetSkillLevel: number | null = null,
): ItemInfo[] {
  if (originalSkillLevel === null) {
    originalSkillLevel = 1;
  }
  if (targetSkillLevel === null) {
    targetSkillLevel = getCharAllSkillMaxLevel(charId);
  }

  const totalCost: ItemInfo[] = [];
  for (let skillLevel = originalSkillLevel; skillLevel < targetSkillLevel; skillLevel++) {
    totalCost.push(...charAllSkillLevelUpOnceItemCost(charId, skillLevel + 1));
  }
  return totalCost;
}

export function charSkillSpecializationOnceItemCost(
  charId: string,
  skillIndex: number, // 0-based index
  targetSpecializationLevel: number, // 1, 2, 3
): ItemInfo[] {
  const char = patchedCharacterTable.value[charId];
  if (char === undefined) {
    return [];
  }
  const skill = char.skills[skillIndex];
  if (skill === undefined) {
    return [];
  }

  return fromItemBundleArray(
    skill.levelUpCostCond[targetSpecializationLevel - 1]?.levelUpCost ?? [],
  );
}

export function charSkillSpecializationItemCost(
  charId: string,
  skillIndex: number, // 0-based index
  originalSpecializationLevel: number | null = null, // 0-3
  targetSpecializationLevel: number | null = null, // 0-3
): ItemInfo[] {
  const char = patchedCharacterTable.value[charId];
  if (char === undefined) {
    return [];
  }
  const skill = char.skills[skillIndex];
  if (skill === undefined) {
    return [];
  }

  if (originalSpecializationLevel === null) {
    originalSpecializationLevel = 0;
  }
  if (targetSpecializationLevel === null) {
    targetSpecializationLevel = skill.levelUpCostCond.length;
  }

  const totalCost: ItemInfo[] = [];
  for (
    let specializationLevel = originalSpecializationLevel;
    specializationLevel < targetSpecializationLevel;
    specializationLevel++
  ) {
    totalCost.push(
      ...charSkillSpecializationOnceItemCost(charId, skillIndex, specializationLevel + 1),
    );
  }
  return totalCost;
}

export function charUniequipLevelUpOnceItemCost(
  charId: string,
  uniequipIdOrType: string,
  originalLevel: number, // 0, 1, 2
): ItemInfo[] {
  const uniequip = getCharUniequip(charId, uniequipIdOrType);
  return fromItemBundleArray(uniequip?.itemCost?.[originalLevel + 1] ?? []);
}

export function charUniequipLevelUpItemCost(
  charId: string,
  uniequipIdOrType: string,
  originalLevel: number | null = null, // 0-3
  targetLevel: number | null = null, // 0-3
): ItemInfo[] {
  const uniequip = getCharUniequip(charId, uniequipIdOrType);
  if (uniequip === undefined) {
    return [];
  }
  if (originalLevel === null) {
    originalLevel = 0;
  }
  if (targetLevel === null) {
    targetLevel = Object.keys(uniequip.itemCost ?? {}).length;
  }

  const totalCost = [];
  for (let level = originalLevel; level < targetLevel; level++) {
    totalCost.push(...charUniequipLevelUpOnceItemCost(charId, uniequipIdOrType, level));
  }
  return totalCost;
}

export function charDevelopItemCost(
  charId: string,
  options: {
    originalEliteLevel?: number | null;
    originalLevel?: number | null;
    originalSkillLevel?: number | null;
    originalSpecializationLevels?: (number | null)[] | null;
    originalUniequipLevels?: Map<string, number | null> | null;
    targetEliteLevel?: number | null;
    targetLevel?: number | null;
    targetSkillLevel?: number | null;
    targetSpecializationLevels?: (number | null)[] | null;
    targetUniequipLevels?: Map<string, number | null> | null;
  } = {},
): ItemInfo[] {
  const char = patchedCharacterTable.value[charId];
  if (char === undefined) {
    return [];
  }

  const totalCost: ItemInfo[] = [];

  // 精英化和等级
  totalCost.push(
    ...charEliteAndLevelUpItemCost(
      charId,
      options.originalEliteLevel ?? null,
      options.originalLevel ?? null,
      options.targetEliteLevel ?? null,
      options.targetLevel ?? null,
    ),
  );

  // 通用技能
  totalCost.push(
    ...charAllSkillLevelUpItemCost(
      charId,
      options.originalSkillLevel ?? null,
      options.targetSkillLevel ?? null,
    ),
  );

  // 技能专精
  const skillCount = char.skills.length;
  for (let i = 0; i < skillCount; i++) {
    const originalSpecializationLevel = options.originalSpecializationLevels?.[i] ?? null;
    const targetSpecializationLevel = options.targetSpecializationLevels?.[i] ?? null;
    totalCost.push(
      ...charSkillSpecializationItemCost(
        charId,
        i,
        originalSpecializationLevel,
        targetSpecializationLevel,
      ),
    );
  }

  // 模组
  const uniequips = getCharUniequips(charId);
  const originalUniequipLevels = options.originalUniequipLevels ?? null;
  const targetUniequipLevels = options.targetUniequipLevels ?? null;

  for (const [uniequipId, uniequip] of uniequips.entries()) {
    if (isOriginalUniequip(uniequip)) {
      continue;
    }

    const inOriginal =
      originalUniequipLevels === null ||
      originalUniequipLevels?.has(uniequipId) ||
      (uniequip.typeName2 !== null && originalUniequipLevels?.has(uniequip.typeName2));
    const inTarget =
      targetUniequipLevels === null ||
      targetUniequipLevels?.has(uniequipId) ||
      (uniequip.typeName2 !== null && targetUniequipLevels?.has(uniequip.typeName2));

    if (inOriginal && inTarget) {
      const originalLevel =
        originalUniequipLevels === null
          ? null
          : originalUniequipLevels.has(uniequipId)
            ? originalUniequipLevels.get(uniequipId)!
            : originalUniequipLevels.get(uniequip.typeName2!)!;
      const targetLevel =
        targetUniequipLevels === null
          ? null
          : targetUniequipLevels.has(uniequipId)
            ? targetUniequipLevels.get(uniequipId)!
            : targetUniequipLevels.get(uniequip.typeName2!)!;

      totalCost.push(
        ...charUniequipLevelUpItemCost(charId, uniequipId, originalLevel, targetLevel),
      );
    } else if (inOriginal || inTarget) {
      console.warn(
        `干员 ${charId} 的模组 ${uniequipId} 在原始配置中${inOriginal ? '存在' : '不存在'}，在目标配置中${inTarget ? '存在' : '不存在'}，无法计算升级成本。`,
      );
    }
  }

  return totalCost;
}
