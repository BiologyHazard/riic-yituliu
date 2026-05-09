/**
 * 数据源配置定义
 */

export interface DataSource {
  label: string;
  id: string;
  baseUrl: string;
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'github',
    label: 'GitHub',
    baseUrl:
      'https://raw.githubusercontent.com/ArknightsAssets/ArknightsGamedata/refs/heads/master/cn/gamedata/excel',
  },
  {
    id: 'torappu',
    label: 'Torappu',
    baseUrl: 'https://torappu.prts.wiki/gamedata/latest/excel',
  },
  {
    id: 'gh-proxy',
    label: 'gh-proxy',
    baseUrl:
      'https://ghproxy.net/https://raw.githubusercontent.com/ArknightsAssets/ArknightsGamedata/refs/heads/master/cn/gamedata/excel',
  },
];

export const DEFAULT_SOURCE_ID = 'github';
