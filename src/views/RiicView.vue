<script setup lang="ts">
import Schedule from '@/components/riic/Schedule.vue'
import {
  type CharDataType,
  type ScheduleType,
  type StationQueueType,
  type StationType,
} from '@/types/riic'
import { getCharIdbyName } from '@/utils/character'
import { ref, watch } from 'vue'

const exampleInput: string = `12 小时 | 12 小时 | 12 小时
控制中枢
控制中枢
阿米娅0 八幡海铃2 焰尾2 薇薇安娜2 森蚺2 |
阿米娅0 令2 夕0 琴柳2 戴菲恩2 | 令心情 < 12，夕心情 ≥ 12
诗怀雅0 八幡海铃2 焰尾2 薇薇安娜2 森蚺2 |
---
会客室
会客室
伊内丝2 跃跃2 | 平均 108%
信仰搅拌机2 跃跃2 | 109%
伊内丝2 信仰搅拌机2 | 平均 101%
---
制造站（中级作战记录）
制造站
远牙2 野鬃2 灰毫2 | 126%
断罪者1 食铁兽2 槐琥2 | 110%
远牙2 野鬃2 灰毫2 | 126%
---
制造站（赤金）
制造站
苍苔2 砾1 | 82%
苍苔2 引星棘刺2 | 79%
引星棘刺2 砾1 | 81%
---
制造站（赤金）
制造站
清流1 温蒂2 | 115%
淬羽赫默2 多萝西2 | 65%
清流2 温蒂2 | 115%
---
制造站（源石碎片）
制造站
褐果1 炎熔1 槐琥2 | 120%
褐果1 地灵1 迷迭香2 | 162%
褐果1 炎熔1 地灵1 | 115%
===
贸易站（龙门商法）
贸易站
巫恋2 柏喙2 龙舌兰2 | 巫恋组，纸面 90%
巫恋2 柏喙2 龙舌兰2 | 巫恋组，纸面 90%
能天使2 蕾缪安2 但书2 | 但书组，纸面 80%
---
贸易站（龙门商法）
贸易站
但书2 | 但书组
但书2 | 但书组
赫德雷2 | 40%
---
贸易站（开采协力）
贸易站
伺夜2 吉星2 深巡2 | 125%
黑键2 推进之王0 摩根2 | 138%
伺夜2 吉星2 深巡2 | 125%
---
发电站
发电站
承曦格雷伊2 Lancet-20! | 18%
格雷伊0 澄闪2 | 40%
承曦格雷伊2 Lancet-20! | 18%
---
办公室
办公室
斥罪2 | 60%
絮雨2 | 40%
普罗旺斯2 | 55%
---
宿舍
宿舍
乌尔比安 |
车尔尼2 爱丽丝2 塑心2 |
乌尔比安 |
---
加工站 / 训练室
办公室
|
|
W |`

/**
 * 输入框内容
 */
const rawInput = ref<string>(exampleInput)

/**
 * 解析后的数据
 */
const data = ref<ScheduleType>({
  queueDescription: [],
  lines: [],
})

/**
 * @example
 * Input: '12 小时 | 12 小时 | 12 小时'
 * Output: ['12 小时', '12 小时', '12 小时']
 */
function parseQueueDescription(segment: string): string[] {
  const tokens: string[] = segment.split('|').map((s) => s.trim())
  return tokens
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
  s = s.trim()
  const isTired = s.endsWith('!')
  if (isTired) {
    s = s.slice(0, -1)
  }
  const eliteLevel = '012'.includes(s.slice(-1)) ? parseInt(s.slice(-1)) : null
  if (eliteLevel !== null) {
    s = s.slice(0, -1)
  }
  const displayName = s
  const charId = getCharIdbyName(displayName) ?? ''
  return { charId, displayName, eliteLevel, isTired }
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
  const [opsPart, ...descParts] = s.split('|')
  const operators: CharDataType[] = (opsPart || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(parseOperator)
  const description: string = descParts.join('|').trim()
  return { chars: operators, description }
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
  const lines: string[] = s.trim().split(/\r?\n/)
  const title: string = lines[0] ?? ''
  const stationType: string = lines[1] ?? ''
  const queueLines: string[] = lines.slice(2)
  const queues: StationQueueType[] = queueLines.map(parseQueue)
  return { title, stationType, queues }
}

/**
 * @example
 * Input:
 * 12 小时 | 12 小时 | 12 小时
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
function parseSchedule(s: string): ScheduleType {
  const [queueDescLine, ...content] = s.trim().split(/\r?\n/)
  const queueDescription: string[] = parseQueueDescription(queueDescLine || '')
  const stationBlocks: string[] = content
    .join('\n')
    .trim()
    .split(/^\s*={3,}\s*$/m)
  const lines: StationType[][] = stationBlocks.map((block) => {
    const stationStrings: string[] = block.trim().split(/^\s*-{3,}\s*$/m)
    const stations: StationType[] = stationStrings.map(parseStation)
    return stations
  })
  return { queueDescription, lines }
}

// 主解析器：将输入文本解析为 ScheduleType
// function parseRiic(text: string): ScheduleType {
//     // const lines = text.split(/\r\n|\n|\r/).map(l => l.trim()).filter(l => l.length > 0);
//     const [queueDescLine, content]: [string, string] = text.trim().split(/\r\n|\n|\r/, 2) as [string, string];
//     const queueDescription: string[] = parseQueueDescription(queueDescLine);

//     // 先按 "===" 分成多行（行内包含多个站点，以 "---" 分隔）
//     const rows: string[][] = [];
//     let currentRow: string[] = [];
//     for (const l of content) {
//         if (/^=\s*=\s*=\s*$/.test(l.replace(/\s+/g, ''))) {
//             if (currentRow.length) rows.push(currentRow), currentRow = [];
//         } else {
//             currentRow.push(l);
//         }
//     }
//     if (currentRow.length) rows.push(currentRow);

//     const parsedLines: StationType[][] = [];

//     for (const row of rows) {
//         // 按 "---" 切分站点块
//         const stationsRaw: string[][] = [];
//         let block: string[] = [];
//         for (const l of row) {
//             if (/^-\s*-\s*-\s*$/.test(l.replace(/\s+/g, ''))) {
//                 if (block.length) stationsRaw.push(block), block = [];
//             } else {
//                 block.push(l);
//             }
//         }
//         if (block.length) stationsRaw.push(block);

//         const stationList: StationType[] = [];
//         for (const sLines of stationsRaw) {
//             // 站点块至少包含 1-2 行标题，后续为队列
//             const nonEmpty = sLines.filter(Boolean);
//             if (nonEmpty.length === 0) continue;

//             const title = (nonEmpty[0] ?? '').toString(); // 使用第一行作为标题（含括号说明）

//             const queueLines = nonEmpty.slice(2); // 第二行一般为类别标签，可忽略
//             const queues: StationQueueType[] = [];

//             for (const q of queueLines) {
//                 if (!q || q === '|') continue;
//                 const [opsPart, ...descParts] = q.split('|');
//                 const description = descParts.join('|').trim();
//                 const operators = parseOperators((opsPart || '').trim());
//                 if (operators.length === 0 && !description) continue;
//                 queues.push({ operators, description });
//             }

//             // 也有可能第二行就是第一条队列（极端输入），做个兜底
//             if (queues.length === 0 && nonEmpty.length >= 2) {
//                 const q = nonEmpty[1];
//                 if (q && q !== '|' && !/^[-=]+$/.test(q)) {
//                     const [opsPart, ...descParts] = q.split('|');
//                     const description = descParts.join('|').trim();
//                     const operators = parseOperators((opsPart || '').trim());
//                     if (operators.length || description) {
//                         queues.push({ operators, description });
//                     }
//                 }
//             }

//             // 没有任何队列则跳过该站点
//             if (queues.length === 0) continue;

//             stationList.push({ title, queues });
//         }
//         if (stationList.length) parsedLines.push(stationList);
//     }

//     return { queueDescription, lines: parsedLines };
// }
watch(
  rawInput,
  () => {
    data.value = parseSchedule(rawInput.value || '')
  },
  { immediate: true },
)
</script>

<template>
  <!-- <OperatorCard operatorName="能天使" :eliteLevel="2" /> -->
  <div class="riic-page">
    <div class="input-panel">
      <div>
        <label for="riic-input">在此粘贴排班文本：</label>
      </div>
      <textarea id="riic-input" v-model="rawInput" rows="14" :placeholder="exampleInput"></textarea>
    </div>

    <div class="output-panel">
      <Schedule class="schedule" v-bind="data" />
    </div>
  </div>
</template>

<style scoped lang="scss">
// .riic-page {
//     display: flex;
//     flex-direction: column;
//     gap: 20px;
// }

// .input-panel {
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
// }

textarea {
  width: 100%;
  font-family: monospace;
  font-size: 1em;
  padding: 1em;
}

button {
  padding: 6px 12px;
  cursor: pointer;
}

.output-panel {
  width: 2160px;
  height: 1080px;
  background-image: url('/images/resources/背景.png');
  overflow: visible;
  background-color: black;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.schedule {
  zoom: 0.5;
}
</style>
