<script setup lang="ts">
import RiicSchedule from '@/components/riic/RiicSchedule.vue';
import {
  type CharDataType,
  type ScheduleType,
  type StationQueueType,
  type StationType,
  type StatItem,
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

const exampleInput: string = scheduleFiles['右满 252（2 赤金）一天两换'] ?? '';

/**
 * 输入框内容
 */
const rawInput = ref<string>(exampleInput);

/**
 * 解析后的数据
 */
const data = ref<ScheduleType>({
  title: '',
  description: '',
  stats: [],
  queueDescriptions: [],
  lines: [],
});

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
function parseSchedule(s: string): ScheduleType {
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

watch(
  rawInput,
  () => {
    data.value = parseSchedule(rawInput.value || '');
  },
  { immediate: true },
);

const outputPanelRef = useTemplateRef<HTMLDivElement>('outputPanelRef');
const widthRef = ref<'100%' | '2160px'>('100%');
</script>

<template>
  <h1>基建一图流排班表生成器</h1>

  <h2>排班表预设</h2>
  <div class="schedule-files">
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
  </div>

  <h2>排班表编辑器</h2>
  <div class="input-panel">
    <label for="riic-input">在此粘贴排班文本：</label>
    <textarea id="riic-input" v-model="rawInput" rows="30" :placeholder="exampleInput"></textarea>
  </div>

  <h2>显示设置</h2>
  <div class="settings">
    <div class="input-group">
      <label>
        <input type="radio" value="100%" v-model="widthRef" />
        <span class="radio-label">滚动</span>
      </label>
      <label>
        <input type="radio" value="2160px" v-model="widthRef" />
        <span class="radio-label">溢出</span>
      </label>
    </div>
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

  <h2>排班表预览</h2>
  <div class="output-panel" ref="outputPanelRef">
    <RiicSchedule class="schedule" v-bind="data" />
  </div>
</template>

<style scoped lang="scss">
h1 {
  text-align: center;
}

.schedule-files {
  margin-block-end: 1em;

  div {
    margin-block: 0.8em;
  }
}

textarea {
  display: block;
  padding: 1em;
  margin-block: 1em;
  border: 1px solid var(--color-border);
  border-radius: 1em;
  background-color: var(--color-code-background);
  color: var(--color-code-text);
  width: 100%;
  font-family: var(--mono-font);
  font-size: 1rem;
}

.settings {
  margin-block: 1em;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
}

.input-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;
}

input[type='radio'] {
  margin-inline: 0.4em;
}

button {
  padding: 0.2em 0.5em;
  cursor: pointer;
  font-size: 1em;
}

.output-panel {
  overflow: auto;
  width: v-bind('widthRef');
  transition: width 0.3s;
}
</style>
