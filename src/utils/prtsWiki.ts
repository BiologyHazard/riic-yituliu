import { MD5 } from 'crypto-js';

/**
 * 根据文件名获取 PRTS Wiki 资源文件的完整 URL 地址
 */
export function getPrtsWikiMediaUrl(fileName: string): string {
  const hash = MD5(fileName).toString();
  return `https://media.prts.wiki/${hash.slice(0, 1)}/${hash.slice(0, 2)}/${encodeURIComponent(fileName)}`;
}

/**
 * 根据角色 ID、角色名称和精英化等级获取 PRTS Wiki 角色头像的完整 URL 地址
 *
 * 会特别考虑升变干员
 */
export function getPrtsWikiCharAvatarUrl(
  charId: string,
  charName: string,
  eliteLevel: number,
): string {
  let prtsWikiCharName = charName;
  if (charId === 'char_1001_amiya2') {
    prtsWikiCharName = '阿米娅(近卫)';
  } else if (charId === 'char_1037_amiya3') {
    prtsWikiCharName = '阿米娅(医疗)';
  }

  let prtsWikiEliteLevelSuffix: string = '';
  if (charId === 'char_002_amiya' && eliteLevel === 1) {
    prtsWikiEliteLevelSuffix = '_1+';
  } else if (eliteLevel === 2) {
    prtsWikiEliteLevelSuffix = '_2';
  }
  return getPrtsWikiMediaUrl(`头像_${prtsWikiCharName}${prtsWikiEliteLevelSuffix}.png`);
}

/**
 * 根据道具 ID 和道具名称获取 PRTS Wiki 道具图标的完整 URL 地址
 *
 * 会特别考虑 EXP
 */
export function getPrtsWikiItemIconUrl(itemId: string, itemName: string): string {
  let prtsWikiItemName = itemName;
  if (itemId === 'exp') {
    prtsWikiItemName = '声望';
  }
  const fileName = `道具_带框_${prtsWikiItemName}.png`;
  return getPrtsWikiMediaUrl(fileName);
}
