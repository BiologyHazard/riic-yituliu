import { MD5 } from 'crypto-js';

/**
 * 根据文件名获取 PRTS Wiki 资源文件的完整 URL 地址
 */
export function getPrtsWikiMediaUrl(fileName: string): string {
  const hash = MD5(fileName).toString();
  return `https://media.prts.wiki/${hash.slice(0, 1)}/${hash.slice(0, 2)}/${encodeURIComponent(fileName)}`;
}
