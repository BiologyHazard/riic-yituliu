<script setup lang="ts">
import type { BuildingLayout, BuildingRoom, BuildingSlot, BuildingStorey } from '@/types/gameData';
import { computed } from 'vue';

const props = defineProps<{
  /** `building_data.json` 中的 `layouts.v0` */
  layout: BuildingLayout;
  /** `building_data.json` 中的 `rooms`，用于获取房间名 */
  rooms?: Record<string, BuildingRoom>;
}>();

/** 缺少楼层间隔数据时的兜底层高（行） */
const DEFAULT_STOREY_HEIGHT = 2;

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

/** 楼层，按自上而下的顺序排列 */
const sortedStoreys = computed<BuildingStorey[]>(() =>
  Object.values(props.layout.storeys).sort((a, b) => b.yOffset - a.yOffset),
);

/**
 * 每层占用的网格行数
 * 楼层数据只给出起始行 `yOffset`，用相邻楼层的间隔推断层高
 */
const storeyHeight = computed<number>(() => {
  const offsets = sortedStoreys.value.map((storey) => storey.yOffset);
  const gaps = offsets
    .slice(1)
    .map((offset, index) => offsets[index]! - offset)
    .filter((gap) => gap > 0);
  return gaps.length > 0 ? Math.min(...gaps) : DEFAULT_STOREY_HEIGHT;
});

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

/** 固定使用 `3840 × 1080` 的默认最小缩放投影，不随网页视口改变纹理周期。 */
const projectionStyle = computed<Record<string, string>>(() => {
  const f = Math.fround;
  const canvasScale = 0.009999999776482582;
  const foregroundScale = 0.800000011920929;
  const paddingY = 0.800000011920929;
  const fitWidthRatio = 0.7200000286102295;
  // `Blueprint.ROOM_UNIT` 为 `(50, 50)`，房间两侧分别添加一次 `LAYOUT_PADDING`。
  const width = f(f(gridSize.value.cols * 50 + 2 * 50) * canvasScale);
  const height = f(f(gridSize.value.rows * 50 + 2 * f(paddingY * 50)) * canvasScale);
  const tangent = f(Math.tan(f(f(f(30 * 3.1415927410125732) * 0.5) / 180)));
  // `CalcCamZoom` 模式 `0` 取宽高约束的较大值；`_ResetLayout` 将其设为初始距离和距离上限。
  const distance = Math.max(
    f(f(f(width * 0.5) / f(f(3840 / 1080) * tangent)) * fitWidthRatio),
    f(f(height * 0.5) / tangent),
  );
  const backgroundUnit = (1080 * canvasScale) / (2 * tangent * (distance + f(120 * canvasScale)));
  const foregroundUnit =
    (1080 * canvasScale * foregroundScale) / (2 * tangent * (distance + f(-80 * canvasScale)));
  return {
    '--background-unit': `${backgroundUnit}px`,
    '--foreground-unit': `${foregroundUnit}px`,
  };
});

interface StoreyLabel {
  id: string;
  /** 楼层标签的垂直中心百分比位置 */
  center: string;
}

/**
 * 楼层标签位置
 * 网格的 `row` 自下向上递增，渲染时需要翻转纵轴
 * 只标注游戏内实际存在的楼层，其上方不存在的 2F 区域（`slot_37`、`slot_38` 所在）留空
 */
const storeyLabels = computed<StoreyLabel[]>(() => {
  const { rows } = gridSize.value;
  const height = storeyHeight.value;
  return sortedStoreys.value.map((storey) => {
    const top = rows - (storey.yOffset + height);
    return {
      id: storey.id,
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
      <div class="basemap-canvas" :style="projectionStyle">
        <div aria-hidden="true" class="basemap-background">
          <div class="basemap-background-layer basemap-background-fill"></div>
          <div class="basemap-background-layer basemap-background-rect"></div>
          <div class="basemap-background-layer basemap-background-grid"></div>
        </div>
        <div class="basemap-gutter">
          <span
            v-for="label in storeyLabels"
            :key="label.id"
            class="basemap-storey"
            :style="{ top: label.center }"
          >
            {{ label.id }}
          </span>
        </div>

        <div
          class="basemap-grid"
          :style="{
            aspectRatio: `${gridSize.cols} / ${gridSize.rows}`,
          }"
        >
          <div
            v-for="view in slots"
            :key="view.slot.id"
            class="basemap-slot"
            :class="{
              'is-narrow': view.isNarrow,
              'is-large': view.isLarge,
              'is-passage': ['CORRIDOR', 'ELEVATOR'].includes(view.slot.category),
            }"
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
        <div aria-hidden="true" class="basemap-foreground"></div>
        <div aria-hidden="true" class="basemap-edge-mask"></div>
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
  position: relative;
  display: flex;
  align-items: stretch;
  min-inline-size: 1080px;
  container-type: inline-size;
  isolation: isolate;
}

.basemap-background {
  --background-offset-x: 0px;
  --background-offset-y: 0px;

  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.basemap-background-layer {
  position: absolute;
  inset: 0;
  background-repeat: repeat;
  background-position: var(--background-offset-x) calc(100% + var(--background-offset-y));
}

.basemap-background-fill {
  background-image: url('@/assets/images/riic/blueprint_bkg_fill.png');
  background-size: calc(64 * var(--background-unit)) calc(64 * var(--background-unit));
}

.basemap-background-rect {
  background-image: url('@/assets/images/riic/blueprint_bkg_rect.png');
  background-size: calc(221 * var(--background-unit)) calc(251 * var(--background-unit));
  /* `level9` 中 `ImgRect` 的 `m_Color`，保留序列化的 `float32` 原值。 */
  filter: brightness(0.20000000298023224);
}

.basemap-background-grid {
  background-image: url('@/assets/images/riic/blueprint_bkg_grid.png');
  background-size: calc(279 * var(--background-unit)) calc(184 * var(--background-unit));
  filter: brightness(0.5647059082984924);
}

.basemap-foreground {
  /* `ImgX` 位于房间前方，使用独立深度与缩放投影，不能共用背景层的像素尺度。 */
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background-image: url('@/assets/images/riic/blueprint_ftg.png');
  background-repeat: repeat;
  background-position: left bottom;
  background-size: calc(199 * var(--foreground-unit)) calc(206 * var(--foreground-unit));
  filter: brightness(0.6980392336845398);
}

.basemap-edge-mask {
  /* `MaskCanvas` 的暗边覆盖整个视口，只拉伸一次，不能重复平铺。 */
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background-image: url('@/assets/images/riic/blueprint_dark_slide.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
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
}

.basemap-slot {
  --tile-bg: #303030;
  --tile-border: #626262;
  --tile-text: #f5f5f5;

  position: absolute;
}

.basemap-slot.is-passage {
  --tile-bg: #ffffff;
  --tile-border: #c9c9c9;
  --tile-text: #303030;
}

.basemap-tile {
  position: absolute;
  inset: 2px;
  display: flex;
  flex-direction: column;
  gap: 0.15cqw;
  padding: 0.3cqw 0.45cqw;
  overflow: hidden;
  background-color: var(--tile-bg);
  border: 1px solid var(--tile-border);
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
  color: var(--tile-text);
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
  color: var(--tile-text);
  white-space: nowrap;
}

.basemap-slot.is-large .basemap-slot-name {
  font-size: 1.8cqw;
  font-weight: 600;
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
