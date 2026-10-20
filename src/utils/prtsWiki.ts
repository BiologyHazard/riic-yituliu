import { MD5 } from 'crypto-js';

/**
 * 根据文件名获取 PRTS Wiki 资源文件的完整 URL 地址
 */
export function getPrtsWikiMediaUrl(fileName: string): string {
  const hash = MD5(fileName).toString();
  return `https://media.prts.wiki/${hash.slice(0, 1)}/${hash.slice(0, 2)}/${encodeURIComponent(fileName)}`;
}

/**
 * 获取 PRTS Wiki 使用的干员名称，处理阿米娅升变形态名称。
 */
function getPrtsWikiCharName(charId: string, charName: string): string {
  if (charId === 'char_1001_amiya2') {
    return '阿米娅(近卫)';
  } else if (charId === 'char_1037_amiya3') {
    return '阿米娅(医疗)';
  }
  return charName;
}

/**
 * 根据干员 ID、干员名称和精英化等级获取 PRTS Wiki 干员头像的完整 URL 地址
 *
 * 会特别考虑升变干员
 */
export function getPrtsWikiCharAvatarUrl(
  charId: string,
  charName: string,
  eliteLevel: number,
): string {
  const prtsWikiCharName = getPrtsWikiCharName(charId, charName);
  let prtsWikiEliteLevelSuffix = eliteLevel === 2 ? '_2' : '';
  if (charId === 'char_002_amiya' && eliteLevel === 1) {
    prtsWikiEliteLevelSuffix = '_1+';
  }
  return getPrtsWikiMediaUrl(`头像_${prtsWikiCharName}${prtsWikiEliteLevelSuffix}.png`);
}

/**
 * 根据干员 ID、干员名称和精英化等级获取 PRTS Wiki 干员立绘的完整 URL 地址
 *
 * 会特别考虑升变干员
 */
export function getPrtsWikiCharSkinUrl(
  charId: string,
  charName: string,
  eliteLevel: number,
): string {
  const prtsWikiCharName = getPrtsWikiCharName(charId, charName);
  let prtsWikiEliteLevelSuffix = eliteLevel === 2 ? '_2' : '_1';
  if (charId === 'char_002_amiya' && eliteLevel === 1) {
    prtsWikiEliteLevelSuffix = '_1+';
  } else if (charId === 'char_1001_amiya2' || charId === 'char_1037_amiya3') {
    prtsWikiEliteLevelSuffix = '_2';
  }
  return getPrtsWikiMediaUrl(`立绘_${prtsWikiCharName}${prtsWikiEliteLevelSuffix}.png`);
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
