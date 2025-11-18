export interface Character {
  name: string;
  rarity: number | string;
  profession: string;
}

export interface CharSkin {
  avatarId: string;
}

export interface Skin {
  charSkins: Record<string, CharSkin>;
  buildinEvolveMap: Record<string, Record<string, string>>;
}

export const characterTable: Record<string, Character> = await fetch(
  'https://torappu.prts.wiki/gamedata/latest/excel/character_table.json',
).then((res) => res.json());
export const skinTable: Skin = await fetch(
  'https://torappu.prts.wiki/gamedata/latest/excel/skin_table.json',
).then((res) => res.json());

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
  for (const charId in characterTable) {
    if (characterTable[charId]?.name === name) {
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
  return characterTable[charId]?.name;
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
  const rarity: number | string | undefined = characterTable[charId]?.rarity;
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
  return characterTable[charId]?.profession;
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
  const evolveMap = skinTable.buildinEvolveMap[charId] ?? {};
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
  // const evolveMap = skinTable.buildinEvolveMap[charId] ?? {}
  // for (let level = eliteLevel; level >= 0; level--) {
  //   if (String(level) in evolveMap) {
  //     const avatarId = skinTable.charSkins[evolveMap[String(level)] ?? '']?.avatarId
  //     if (avatarId !== undefined) {
  //       return avatarId
  //     }
  //   }
  // }
  const skinId = getCharSkinId(charId, eliteLevel);
  const avatarId = skinTable.charSkins[skinId]?.avatarId;
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
