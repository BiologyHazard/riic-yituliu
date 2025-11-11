/**
 * 排班表文本格式 v4
 */

import {
  type CharDataType,
  type ScheduleType,
  type StationQueueType,
  type StationType,
  type StatItem,
} from '@/types/riic';
import { getCharIdbyName } from '@/utils/character';

/**
 * @example
 * Input: 'EXP 51.1k | 贵金属 44.6k | 龙门币 53.3k | 高级凭证 0.801'
 * Output: [
 *     { itemName: 'EXP', itemCount: '51.1k' },
 *     { itemName: '贵金属', itemCount: '44.6k' },
 *     { itemName: '龙门币', itemCount: '53.3k' },
 *     { itemName: '高级凭证', itemCount: '0.801' },
 * ]
 */
function parseStats(s: string): StatItem[] {
  return s
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [itemName, ...itemCountParts] = part.split(' ') as [string, ...string[]];
      const itemCount = itemCountParts.join(' ').trim();
      return { itemName, itemCount };
    });
}

/**
 * @example
 * Input: '12 小时 | 12 小时 | 12 小时'
 * Output: ['12 小时', '12 小时', '12 小时']
 */
function parseQueueDescriptions(s: string): string[] {
  const tokens: string[] = s.split('|').map((s) => s.trim());
  return tokens;
}

/**
 * @example
 * Input: '能天使1'
 * Output: { charId: 'char_103_angel', displayName: '能天使', eliteLevel: 1, isTired: false }
 * @example
 * Input: 'Lancet-20!'
 * Output: { charId: 'char_285_medic2', displayName: 'Lancet-2', eliteLevel: 0, isTired: true }
 */
function parseOperator(s: string): CharDataType {
  s = s.trim();
  const isTired = s.endsWith('!');
  if (isTired) {
    s = s.slice(0, -1);
  }
  const eliteLevel = '012'.includes(s.slice(-1)) ? parseInt(s.slice(-1)) : null;
  if (eliteLevel !== null) {
    s = s.slice(0, -1);
  }
  const displayName = s;
  const charId = getCharIdbyName(displayName) ?? '';
  return { charId, displayName, eliteLevel, isTired };
}

/**
 * @example
 * Input: '能天使1 Lancet-20! | 说明文字'
 * Output: {
 *     operators: [
 *         { charId: 'char_103_angel', displayName: '能天使', eliteLevel: 1, isTired: false },
 *         { charId: 'char_285_medic2', displayName: 'Lancet-2', eliteLevel: 0, isTired: true },
 *     ],
 *     description: '说明文字',
 * }
 */
function parseQueue(s: string): StationQueueType {
  const [opsPart, ...descParts] = s.split('|');
  const operators: CharDataType[] = (opsPart || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parseOperator);
  const description: string = descParts.join('|').trim();
  return { chars: operators, description };
}

/**
 * @example
 * Input:
 * 制造站
 * #ffd800
 * 能天使1 能天使1 推进之王1 | 第一行描述文字
 * 陈2 斯卡蒂1 夜魔0 | 第二行描述文字
 * 白面鸮 灰喉2 深海色1 | 第三行描述文字
 */
function parseStation(s: string): StationType {
  const lines: string[] = s.trim().split(/\r?\n/);
  const title: string = lines[0] ?? '';
  const stationType: string = lines[1] ?? '';
  const queueLines: string[] = lines.slice(2);
  const queues: StationQueueType[] = queueLines.map(parseQueue);
  return { title, stationType, queues };
}

/**
 * @example
 * Input:
 * 153
 * 一天三换
 * -=-
 * 菲亚梅塔 007 阿罗玛、槐琥
 * -=-
 * EXP 81.2k | 贵金属 22.6k | 龙门币 28.9k | 高级凭证 0.756
 * 17 小时 | 3.5 小时 | 3.5 小时
 * 制造站
 * #ffd800
 * 能天使1 能天使1 推进之王1 | 第一行描述文字
 * 陈2 斯卡蒂1 夜魔0 | 第二行描述文字
 * 白面鸮 灰喉2 深海色1 | 第三行描述文字
 * ---
 * 发电站
 * #8fc31f
 * 凛冬2 古米2 | 第一行描述文字
 * ===
 * 贸易站
 * #00bfff
 * 赫德雷2 | 说明文字
 * ---
 * 办公室
 * #ff69b4
 * 斥罪2 | 说明文字
 */
export function parseSchedule(s: string): ScheduleType {
  const [titlePart, descriptionPart, ...rest] = s.trim().split(/^\s*-=-\s*$/m);
  const title = (titlePart ?? '').trim();
  const description = (descriptionPart ?? '').trim();
  const [statsLine, queueDescLine, ...content] = rest.join('\n-=-\n').trim().split(/\r?\n/);
  const stats: StatItem[] = parseStats(statsLine ?? '');
  const queueDescriptions: string[] = parseQueueDescriptions(queueDescLine ?? '');
  const stationBlocks: string[] = content
    .join('\n')
    .trim()
    .split(/^\s*={3,}\s*$/m);
  const lines: StationType[][] = stationBlocks.map((block) => {
    const stationStrings: string[] = block.trim().split(/^\s*-{3,}\s*$/m);
    const stations: StationType[] = stationStrings.map(parseStation);
    return stations;
  });
  return { title, description, stats, queueDescriptions, lines };
}
