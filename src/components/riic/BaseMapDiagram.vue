<script setup lang="ts">
import type { BuildingLayout, BuildingRoom, BuildingSlot } from '@/types/gameData';
import { computed } from 'vue';

const props = defineProps<{
  /** `building_data.json` 中的 `layouts.v0` */
  layout: BuildingLayout;
  /** `building_data.json` 中的 `rooms`，用于获取房间名 */
  rooms?: Record<string, BuildingRoom>;
}>();

/** 网格单元格的宽高比（1 格宽 ≈ 1.05 格高） */
const CELL_ASPECT_RATIO = 1.05;

interface SlotCategoryMeta {
  /** 槽位类别显示名，槽位无法确定具体房间时使用 */
  label: string;
  /** 强调色 */
  accent: string;
  /** 可建造的房间 id */
  roomIds: string[];
}

/**
 * 槽位类别元数据
 * 房间类别与槽位类别并非一一对应（如电梯间、走廊、控制中枢的房间类别都是 `SPECIAL`），
 * 因此用房间 id 描述各槽位可建造的房间
 */
const slotCategoryMeta: Record<string, SlotCategoryMeta> = {
  SPECIAL: { label: '控制中枢', accent: '#0f7a70', roomIds: ['CONTROL'] },
  OUTPUT: { label: '生产', accent: '#b8860b', roomIds: ['MANUFACTURE', 'TRADING', 'POWER'] },
  FUNCTION: {
    label: '功能',
    accent: '#b03a56',
    roomIds: ['WORKSHOP', 'HIRE', 'TRAINING', 'RECYCLE', 'MEETING'],
  },
  CUSTOM: { label: '宿舍', accent: '#0e8f9e', roomIds: ['DORMITORY'] },
  CUSTOM_P: { label: '活动室', accent: '#5b6fc4', roomIds: ['PRIVATE'] },
  ELEVATOR: { label: '电梯间', accent: '#4b5563', roomIds: ['ELEVATOR'] },
  CORRIDOR: { label: '走廊', accent: '#6b7280', roomIds: ['CORRIDOR'] },
};

const fallbackCategoryMeta: SlotCategoryMeta = {
  label: '未知',
  accent: '#6b7280',
  roomIds: [],
};

/** 获取槽位类别可建造的房间，未提供 `rooms` 时为空 */
function getRoomsOfCategory(category: string): BuildingRoom[] {
  const roomIds = (slotCategoryMeta[category] ?? fallbackCategoryMeta).roomIds;
  return roomIds.map((roomId) => props.rooms?.[roomId]).filter((room) => room !== undefined);
}

/** 网格总行数、列数 */
const gridSize = computed<{ rows: number; cols: number }>(() => {
  let rows = 0;
  let cols = 0;
  for (const slot of Object.values(props.layout.slots)) {
    rows = Math.max(rows, slot.offset.row + slot.size.row);
    cols = Math.max(cols, slot.offset.col + slot.size.col);
  }
  return { rows, cols };
});

interface StoreyBand {
  id: string;
  /** 楼层区间顶部的百分比位置 */
  top: string;
  /** 楼层区间高度百分比 */
  height: string;
  /** 楼层标签的垂直中心百分比位置 */
  center: string;
}

/**
 * 楼层区间
 * 网格的 `row` 自下向上递增，渲染时需要翻转纵轴
 */
const storeyBands = computed<StoreyBand[]>(() => {
  const { rows } = gridSize.value;
  const storeys = Object.values(props.layout.storeys).sort((a, b) => b.yOffset - a.yOffset);
  return storeys.map((storey, index) => {
    const topRow = index === 0 ? rows : storeys[index - 1]!.yOffset;
    const height = topRow - storey.yOffset;
    const top = rows - topRow;
    return {
      id: storey.id,
      top: `${(top / rows) * 100}%`,
      height: `${(height / rows) * 100}%`,
      center: `${((top + height / 2) / rows) * 100}%`,
    };
  });
});

interface SlotView {
  slot: BuildingSlot;
  /** 槽位编号，如 `slot_24` → `24` */
  number: string;
  /** 房间名，无法从数据确定具体房间时为空 */
  roomName: string;
  isNarrow: boolean;
  isLarge: boolean;
  title: string;
  style: Record<string, string>;
}

function getSlotView(slot: BuildingSlot, rows: number, cols: number): SlotView {
  const category = slotCategoryMeta[slot.category] ?? fallbackCategoryMeta;
  const isNarrow = slot.size.col <= 2;
  // 房间尺寸与槽位尺寸一一对应（如 8 格宽的会客室只能建在 8 格宽的槽位上）
  const candidates = getRoomsOfCategory(slot.category).filter(
    (room) => room.size.col === slot.size.col && room.size.row === slot.size.row,
  );
  const roomNames = candidates.map((room) => room.name);
  const roomName = isNarrow ? '' : roomNames.length === 1 ? roomNames[0]! : category.label;
  return {
    slot,
    number: slot.id.replace(/^slot_/, ''),
    roomName,
    isNarrow,
    isLarge: !isNarrow && slot.size.row >= 4,
    title: [
      slot.id,
      roomNames.length > 0 ? roomNames.join(' / ') : category.label,
      `清理可提供无人机 ${slot.provideLabor}`,
    ].join(' · '),
    style: {
      left: `${(slot.offset.col / cols) * 100}%`,
      top: `${((rows - slot.offset.row - slot.size.row) / rows) * 100}%`,
      width: `${(slot.size.col / cols) * 100}%`,
      height: `${(slot.size.row / rows) * 100}%`,
      '--accent': category.accent,
    },
  };
}

const slots = computed<SlotView[]>(() => {
  const { rows, cols } = gridSize.value;
  return Object.values(props.layout.slots)
    .map((slot) => getSlotView(slot, rows, cols))
    .sort((a, b) => Number(a.number) - Number(b.number));
});

/** 图例，按固定顺序排列，仅展示布局中存在的类别 */
const legend = computed(() => {
  const counts = new Map<string, number>();
  for (const slot of Object.values(props.layout.slots)) {
    counts.set(slot.category, (counts.get(slot.category) ?? 0) + 1);
  }
  return Object.entries(slotCategoryMeta)
    .filter(([category]) => counts.has(category))
    .map(([category, meta]) => {
      const roomNames = getRoomsOfCategory(category).map((room) => room.name);
      return {
        label: meta.label,
        accent: meta.accent,
        count: counts.get(category)!,
        hint: roomNames.length > 1 ? roomNames.join(' / ') : '',
      };
    });
});
</script>

<template>
  <div class="basemap">
    <div class="basemap-scroll">
      <div class="basemap-canvas">
        <div class="basemap-gutter">
          <span
            v-for="band in storeyBands"
            :key="band.id"
            class="basemap-storey"
            :style="{ top: band.center }"
          >
            {{ band.id }}
          </span>
        </div>

        <div
          class="basemap-grid"
          :style="{
            '--cols': gridSize.cols,
            '--rows': gridSize.rows,
            aspectRatio: `${gridSize.cols * CELL_ASPECT_RATIO} / ${gridSize.rows}`,
          }"
        >
          <div
            v-for="band in storeyBands"
            :key="band.id"
            class="basemap-storey-band"
            :style="{ top: band.top, height: band.height }"
          ></div>

          <div
            v-for="view in slots"
            :key="view.slot.id"
            class="basemap-slot"
            :class="{ 'is-narrow': view.isNarrow, 'is-large': view.isLarge }"
            :style="view.style"
            :title="view.title"
          >
            <div class="basemap-tile">
              <div class="basemap-tile-head">
                <span class="basemap-slot-id">{{ view.number }}</span>
                <span class="basemap-slot-labor">
                  <UIcon class="basemap-slot-labor-icon" name="i-lucide-zap" />
                  {{ view.slot.provideLabor }}
                </span>
              </div>
              <span v-if="view.roomName" class="basemap-slot-name">{{ view.roomName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ul class="basemap-legend">
      <li v-for="item in legend" :key="item.label" class="basemap-legend-item">
        <span class="basemap-legend-dot" :style="{ backgroundColor: item.accent }"></span>
        <span>{{ item.label }}</span>
        <span class="text-muted">×{{ item.count }}</span>
        <span v-if="item.hint" class="text-muted">（{{ item.hint }}）</span>
      </li>
      <li class="basemap-legend-item">
        <UIcon class="basemap-legend-icon" name="i-lucide-zap" />
        <span class="text-muted">清理该槽位可提供的无人机数量</span>
      </li>
      <li class="basemap-legend-item">
        <UIcon class="basemap-legend-icon" name="i-lucide-hash" />
        <span class="text-muted"
          >数字为 <code>slot_id</code> 编号，如 24 即 <code>slot_24</code></span
        >
      </li>
    </ul>
  </div>
</template>

<style scoped>
.basemap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* 避免宽图把父级 flex 布局撑开：宽度跟随父级，便于横向滚动 */
  inline-size: 0;
  min-inline-size: 100%;
}

.basemap-scroll {
  overflow-x: auto;
}

.basemap-canvas {
  display: flex;
  align-items: stretch;
  min-inline-size: 1080px;
  container-type: inline-size;
}

.basemap-gutter {
  position: relative;
  flex: none;
  inline-size: 2.6cqw;
}

.basemap-storey {
  position: absolute;
  inset-inline: 0;
  font-size: 1.05cqw;
  font-weight: 600;
  color: var(--ui-text-muted);
  text-align: center;
  letter-spacing: 0.04em;
  transform: translateY(-50%);
}

.basemap-grid {
  position: relative;
  flex: 1;
  outline: 1px solid var(--ui-border);
  outline-offset: -1px;
  background-color: var(--ui-bg);
  background-image:
    linear-gradient(to right, var(--ui-border) 1px, transparent 1px),
    linear-gradient(to bottom, var(--ui-border) 1px, transparent 1px);
  background-size:
    calc(100% / var(--cols)) 100%,
    100% calc(100% / var(--rows));
  border-radius: calc(var(--ui-radius) * 2);
}

.basemap-storey-band {
  position: absolute;
  inset-inline: 0;
  pointer-events: none;
}

.basemap-storey-band:not(:first-child) {
  border-block-start: 1px dashed var(--ui-border-accented);
}

.basemap-storey-band:nth-child(odd) {
  background-color: color-mix(in oklab, var(--ui-text) 3%, transparent);
}

.basemap-slot {
  position: absolute;
}

.basemap-tile {
  position: absolute;
  inset: 2px;
  display: flex;
  flex-direction: column;
  gap: 0.15cqw;
  padding: 0.3cqw 0.45cqw;
  overflow: hidden;
  background-color: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border-accented);
  border-inline-start: 0.28cqw solid var(--accent);
  border-radius: 0.35cqw;
  box-shadow: 0 1px 2px rgb(0 0 0 / 8%);
}

.basemap-tile-head {
  display: flex;
  flex: none;
  gap: 0.2cqw;
  align-items: center;
  justify-content: space-between;
  line-height: 1;
}

.basemap-slot-id {
  padding: 0.1cqw 0.35cqw;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.05cqw;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  color: #ffffff;
  background-color: var(--accent);
  border-radius: 0.25cqw;
}

.basemap-slot-labor {
  display: flex;
  gap: 0.1cqw;
  align-items: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1cqw;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.basemap-slot-labor-icon {
  inline-size: 1.2cqw;
  block-size: 1.2cqw;
  color: var(--accent);
}

.basemap-slot-name {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-block-size: 0;
  overflow: hidden;
  font-size: 1.1cqw;
  font-weight: 500;
  color: var(--ui-text-toned);
  white-space: nowrap;
}

.basemap-slot.is-large .basemap-slot-name {
  font-size: 1.8cqw;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.basemap-slot.is-narrow .basemap-tile {
  align-items: center;
  justify-content: center;
  padding-inline: 0.1cqw;
}

.basemap-slot.is-narrow .basemap-tile-head {
  flex-direction: column;
  gap: 0.6cqw;
  justify-content: center;
}

.basemap-slot.is-narrow .basemap-slot-labor-icon {
  display: none;
}

.basemap-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  align-items: center;
  font-size: 0.75rem;
}

.basemap-legend-item {
  display: flex;
  gap: 4px;
  align-items: center;
}

.basemap-legend-dot {
  inline-size: 0.625rem;
  block-size: 0.625rem;
  border-radius: 2px;
}

.basemap-legend-icon {
  inline-size: 0.875rem;
  block-size: 0.875rem;
  color: var(--ui-text-muted);
}
</style>
