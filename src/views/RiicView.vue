<script setup lang="ts">
import Schedule from '@/components/riic/RiicSchedule.vue';
import {
  type CharDataType,
  type ScheduleType,
  type StationQueueType,
  type StationType,
} from '@/types/riic';
import { getCharIdbyName } from '@/utils/character';
import { ref, useTemplateRef, watch } from 'vue';

/**
 * 导入排班文本文件
 * key: 文件名（不含扩展名）
 * value: 文件内容字符串
 */
let scheduleFiles = import.meta.glob('@/assets/texts/schedule/*.txt', {
  eager: true,
  query: 'raw',
  import: 'default',
}) as Record<string, string>;
scheduleFiles = Object.fromEntries(
  Object.entries(scheduleFiles).map(([path, resolver]) => {
    let fileName = path.split('/').pop() || '';
    fileName = fileName.endsWith('.txt') ? fileName.slice(0, -4) : fileName;
    return [fileName, resolver];
  }),
);

const exampleInput: string = scheduleFiles['右满 342 搓玉 一天两换'] ?? '';

/**
 * 输入框内容
 */
const rawInput = ref<string>(exampleInput);

/**
 * 解析后的数据
 */
const data = ref<ScheduleType>({
  queueDescription: [],
  lines: [],
});

/**
 * @example
 * Input: '12 小时 | 12 小时 | 12 小时'
 * Output: ['12 小时', '12 小时', '12 小时']
 */
function parseQueueDescription(segment: string): string[] {
  const tokens: string[] = segment.split('|').map((s) => s.trim());
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
  const [queueDescLine, ...content] = s.trim().split(/\r?\n/);
  const queueDescription: string[] = parseQueueDescription(queueDescLine || '');
  const stationBlocks: string[] = content
    .join('\n')
    .trim()
    .split(/^\s*={3,}\s*$/m);
  const lines: StationType[][] = stationBlocks.map((block) => {
    const stationStrings: string[] = block.trim().split(/^\s*-{3,}\s*$/m);
    const stations: StationType[] = stationStrings.map(parseStation);
    return stations;
  });
  return { queueDescription, lines };
}

watch(
  rawInput,
  () => {
    data.value = parseSchedule(rawInput.value || '');
  },
  { immediate: true },
);

const outputPanelRef = useTemplateRef<HTMLDivElement>('outputPanelRef');
</script>

<template>
  <h1>基建一图流排班表生成器</h1>
  <nav>
    <div v-for="[name, content] in Object.entries(scheduleFiles)" :key="name">
      <a
        href=""
        @click.prevent="
          () => {
            rawInput = content;
          }
        "
        >{{ name }}</a
      >
    </div>
  </nav>
  <div class="riic-page">
    <div class="input-panel">
      <div>
        <label for="riic-input">在此粘贴排班文本：</label>
      </div>
      <textarea id="riic-input" v-model="rawInput" rows="30" :placeholder="exampleInput"></textarea>
    </div>

    <div class="output-panel" ref="outputPanelRef">
      <Schedule class="schedule" v-bind="data" />
    </div>
    <div>
      <button
        @click="
          () => {
            if (outputPanelRef) {
              outputPanelRef.requestFullscreen();
            }
          }
        "
      >
        全屏预览排班表
      </button>
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
