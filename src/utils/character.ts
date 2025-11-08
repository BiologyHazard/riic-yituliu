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

export function getCharIdbyName(name: string): string | undefined {
  for (const charId in characterTable) {
    if (characterTable[charId]?.name === name) {
      return charId;
    }
  }
}

export function getCharName(charId: string): string | undefined {
  return characterTable[charId]?.name;
}

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

export function getCharProfessionId(charId: string): string | undefined {
  return characterTable[charId]?.profession;
}

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

export function getProfessionName(professionIdOrName: string): string {
  return professionMap.get(professionIdOrName) ?? professionIdOrName;
}
