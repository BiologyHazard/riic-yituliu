import CharacterTable from '@/static/json/character_table.json';
import SkinTable from '@/static/json/skin_table.json';


export interface Character {
    name: string;
    rarity: string;
    profession: string;
}


export interface CharSkin {
    avatarId: string;
}


export interface Skin {
    charSkins: Record<string, CharSkin>;
    buildinEvolveMap: Record<string, Record<string, string>>;
}


export const characterTable = CharacterTable as Record<string, Character>;
export const skinTable = SkinTable as Skin;


export function getCharacterIdbyName(name: string): string | undefined {
    for (const charId in characterTable) {
        if (characterTable[charId]?.name === name) {
            return charId;
        }
    }
}


export function getCharacterName(charId: string): string | undefined {
    return characterTable[charId]?.name;
}


export function getCharacterRarity(charId: string): number | undefined {
    const rarityStr = characterTable[charId]?.rarity;
    if (!isNaN(Number(rarityStr))) {
        return Number(rarityStr);
    }
    if (rarityStr) {
        const rarityNum = Number(rarityStr.slice(-1));
        if (!isNaN(rarityNum)) {
            return rarityNum;
        }
    }
}


export function getCharacterProfession(charId: string): string | undefined {
    return characterTable[charId]?.profession;
}


export function getCharAvatar(charId: string, eliteLevel: number): string {
    const evolveMap = skinTable.buildinEvolveMap[charId] ?? {};
    for (let level = eliteLevel; level >= 0; level--) {
        if (String(level) in evolveMap) {
            const avatarId = skinTable.charSkins[evolveMap[String(level)] ?? '']?.avatarId;
            if (avatarId !== undefined) {
                return avatarId;
            }
        }
    }
    // Fallback to default avatarId
    if (eliteLevel === 2) {
        return `${charId}_2`;
    } else {
        return charId;
    }
}
