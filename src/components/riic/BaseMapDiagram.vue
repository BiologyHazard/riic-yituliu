<script setup lang="ts">
import type { BuildingLayout, BuildingRoom, BuildingSlot } from '@/types/gameData';
import type { CSSProperties } from 'vue';
import { useElementSize } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  /** `building_data.json` 中的 `layouts.v0` */
  layout: BuildingLayout;
  /** `building_data.json` 中的 `rooms`，用于获取房间名 */
  rooms?: Record<string, BuildingRoom>;
}>();

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

const viewport = ref<HTMLElement | null>(null);
const { width: viewportWidth, height: viewportHeight } = useElementSize(viewport);
const zoom = ref<number>(0);
const showSlotInfo = ref<boolean>(false);
const cameraX = ref<number>(0);
const cameraY = ref<number>(0);
const dragging = ref<boolean>(false);
let pointerId: number | null = null;
let lastX = 0;
let lastY = 0;
const tangent = Math.tan(Math.PI / 12);

const camera = computed<{ distance: number; far: number; roomUnit: number }>(() => {
  const f = Math.fround;
  const canvasScale = f(0.01);
  const width = f(f(gridSize.value.cols * 50 + 100) * canvasScale);
  const height = f(f(gridSize.value.rows * 50 + 2 * f(f(0.8) * 50)) * canvasScale);
  const aspect = f(Math.max(viewportWidth.value, 1) / Math.max(viewportHeight.value, 1));
  const gameTangent = f(Math.tan(f(f(f(30 * f(Math.PI)) * 0.5) / 180)));
  const heightDistance = f(f(height * 0.5) / gameTangent);
  // `_ResetLayout`：模式 `0` 决定距离上限，模式 `2` 的结果乘 `0.75` 决定下限。
  const far = Math.max(f(f(f(width * 0.5) / f(aspect * gameTangent)) * f(0.72)), heightDistance);
  const near = f(heightDistance * 0.75);
  const distance = far + (near - far) * zoom.value;
  return { distance, far, roomUnit: viewportHeight.value / (2 * tangent * distance) };
});

function clampCamera() {
  const unit = camera.value.roomUnit;
  if (unit <= 0) return;
  const maxX = Math.max(0, (gridSize.value.cols * 0.5 + 1 - viewportWidth.value / unit) / 2);
  const maxY = Math.max(0, (gridSize.value.rows * 0.5 + 0.8 - viewportHeight.value / unit) / 2);
  cameraX.value = Math.max(-maxX, Math.min(maxX, cameraX.value));
  cameraY.value = Math.max(-maxY, Math.min(maxY, cameraY.value));
}

function resetCamera() {
  zoom.value = 0;
  cameraX.value = 0;
  cameraY.value = 0;
}

function onWheel(event: WheelEvent) {
  const delta =
    event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewportHeight.value : 1);
  zoom.value = Math.max(0, Math.min(1, zoom.value - delta * 0.001));
  clampCamera();
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 || pointerId !== null) return;
  pointerId = event.pointerId;
  lastX = event.clientX;
  lastY = event.clientY;
  dragging.value = true;
  viewport.value?.setPointerCapture(event.pointerId);
}

function onPointerMove(event: PointerEvent) {
  if (event.pointerId !== pointerId || camera.value.roomUnit <= 0) return;
  cameraX.value -= (event.clientX - lastX) / camera.value.roomUnit;
  cameraY.value += (event.clientY - lastY) / camera.value.roomUnit;
  lastX = event.clientX;
  lastY = event.clientY;
  clampCamera();
}

function onPointerEnd(event: PointerEvent) {
  if (event.pointerId !== pointerId) return;
  pointerId = null;
  dragging.value = false;
  if (viewport.value?.hasPointerCapture(event.pointerId))
    viewport.value.releasePointerCapture(event.pointerId);
}

watch([viewportWidth, viewportHeight, gridSize], clampCamera);
watch(() => props.layout, resetCamera);

// 背景、房间、前景分别投影，不能将三层一起做二维缩放。
const projectionStyle = computed<CSSProperties>(() => {
  const focal = viewportHeight.value / (2 * tangent);
  const backgroundUnit = (focal * 0.01) / (camera.value.distance + 1.2);
  const foregroundUnit = (focal * 0.008) / (camera.value.distance - 0.8);
  const worldWidth = gridSize.value.cols * 0.5 + 1;
  const worldHeight = gridSize.value.rows * 0.5 + 0.8;
  const aspect = Math.max(viewportWidth.value, 1) / Math.max(viewportHeight.value, 1);
  const backgroundWidth =
    (Math.max(worldWidth, worldHeight * aspect) * (camera.value.far + 1.2)) / camera.value.far;
  const backgroundHeight =
    (Math.max(worldHeight, worldWidth / aspect) * (camera.value.far + 1.2)) / camera.value.far;
  return {
    '--background-unit': `${backgroundUnit}px`,
    '--foreground-unit': `${foregroundUnit}px`,
    '--background-origin-x': `${viewportWidth.value / 2 + (-backgroundWidth / 2 - cameraX.value) * backgroundUnit * 100}px`,
    '--background-origin-y': `${viewportHeight.value / 2 + (backgroundHeight / 2 + cameraY.value) * backgroundUnit * 100}px`,
    '--foreground-origin-x': `${viewportWidth.value / 2 - (cameraX.value * foregroundUnit) / 0.008}px`,
    '--foreground-origin-y': `${viewportHeight.value / 2 + (cameraY.value * foregroundUnit) / 0.008}px`,
  };
});

const roomStyle = computed<CSSProperties>(() => {
  const unit = camera.value.roomUnit;
  return {
    width: `${gridSize.value.cols * 0.5 * unit}px`,
    height: `${gridSize.value.rows * 0.5 * unit}px`,
    left: `${viewportWidth.value / 2 - cameraX.value * unit}px`,
    top: `${viewportHeight.value / 2 + cameraY.value * unit}px`,
  };
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
  <div class="basemap" :class="{ 'show-slot-info': showSlotInfo }">
    <div class="basemap-controls">
      <span class="text-muted">滚轮缩放 · 拖动平移</span>
      <div class="basemap-control-actions">
        <USwitch v-model="showSlotInfo" label="槽位信息" />
        <UButton
          color="neutral"
          icon="i-lucide-maximize"
          label="重置视角"
          variant="soft"
          @click="resetCamera"
        />
      </div>
    </div>
    <div
      ref="viewport"
      class="basemap-canvas"
      :class="{ 'is-dragging': dragging }"
      :style="projectionStyle"
      @lostpointercapture="onPointerEnd"
      @pointercancel="onPointerEnd"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerEnd"
      @wheel.prevent="onWheel"
    >
      <div aria-hidden="true" class="basemap-background">
        <div class="basemap-background-layer basemap-background-fill"></div>
        <div class="basemap-background-layer basemap-background-rect"></div>
        <div class="basemap-background-layer basemap-background-grid"></div>
      </div>
      <div class="basemap-grid" :style="roomStyle">
        <div
          v-for="view in slots"
          :key="view.slot.id"
          class="basemap-slot"
          :class="{
            'is-narrow': view.isNarrow,
            'is-large': view.isLarge,
            'is-control': view.slot.category === 'SPECIAL',
          }"
          :style="view.style"
          :title="view.title"
        >
          <div class="basemap-tile">
            <span aria-hidden="true" class="basemap-unbuilt-icon"></span>
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

    <ul v-if="showSlotInfo" class="basemap-legend">
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
  /* 避免地图内容参与父级网格的固有宽度计算。 */
  inline-size: 0;
  min-inline-size: 100%;
}

.basemap-canvas {
  position: relative;
  display: flex;
  flex: none;
  align-items: stretch;
  inline-size: 100%;
  aspect-ratio: 16 / 9;
  container-type: inline-size;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
  user-select: none;
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
  background-position: var(--background-origin-x)
    calc(var(--background-origin-y) - var(--tile-height));
}

.basemap-background-fill {
  --tile-height: calc(64 * var(--background-unit));

  background-image: url('@/assets/images/riic/blueprint_bkg_fill.png');
  background-size: calc(64 * var(--background-unit)) calc(64 * var(--background-unit));
}

.basemap-background-rect {
  --tile-height: calc(251 * var(--background-unit));

  background-image: url('@/assets/images/riic/blueprint_bkg_rect.png');
  background-size: calc(221 * var(--background-unit)) calc(251 * var(--background-unit));
  /* `level9` 中 `ImgRect` 的 `m_Color`，保留序列化的 `float32` 原值。 */
  filter: brightness(0.20000000298023224);
}

.basemap-background-grid {
  --tile-height: calc(184 * var(--background-unit));

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
  background-position: var(--foreground-origin-x)
    calc(var(--foreground-origin-y) - 206 * var(--foreground-unit));
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

.basemap-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.basemap-canvas.is-dragging {
  cursor: grabbing;
}

.basemap-grid {
  position: absolute;
  container-type: inline-size;
  transform: translate(-50%, -50%);
}

.basemap-control-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 外框与切角内板分离，所有尺寸随房间平面的投影一起缩放。 */
.basemap-slot {
  position: absolute;
  padding: 0.12cqw;
}

.basemap-slot::before {
  position: absolute;
  inset: 0.08cqw;
  content: '';
  border: 0.065cqw solid rgb(100 100 100 / 44%);
  box-shadow: inset 0 0 0 0.12cqw rgb(255 255 255 / 70%);
}

.basemap-tile {
  position: absolute;
  inset: 0.34cqw;
  overflow: hidden;
  background: rgb(116 116 116 / 72%);
  box-shadow: inset 0 0 0.65cqw rgb(0 0 0 / 30%);
  clip-path: polygon(
    0.5cqw 0,
    calc(100% - 0.5cqw) 0,
    100% 0.5cqw,
    100% calc(100% - 0.5cqw),
    calc(100% - 0.5cqw) 100%,
    0.5cqw 100%,
    0 calc(100% - 0.5cqw),
    0 0.5cqw
  );
}

.basemap-unbuilt-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  inline-size: 1.8cqw;
  block-size: 0.823cqw;
  background: url('@/assets/images/riic/zero_level.png') center / contain no-repeat;
  transform: translate(-50%, -50%);
}

.basemap-tile-head {
  position: absolute;
  inset: 0.35cqw 0.4cqw auto;
  z-index: 1;
  display: flex;
  visibility: hidden;
  gap: 0.2cqw;
  align-items: center;
  justify-content: space-between;
}

.basemap-slot-id,
.basemap-slot-labor {
  display: flex;
  gap: 0.15cqw;
  align-items: center;
  padding: 0.12cqw 0.2cqw;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85cqw;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: #ffffff;
  background: rgb(25 25 25 / 78%);
}

.basemap-slot-id {
  border-inline-start: 0.15cqw solid var(--accent);
}

.basemap-slot-labor-icon {
  inline-size: 0.8cqw;
  block-size: 0.8cqw;
}

.basemap-slot-name {
  position: absolute;
  right: 0.2cqw;
  bottom: 0.25cqw;
  left: 0.2cqw;
  visibility: hidden;
  overflow: hidden;
  font-size: 0.9cqw;
  line-height: 1.25;
  color: #ffffff;
  text-align: center;
  white-space: nowrap;
  text-shadow: 0 1px 3px #000000;
}

.show-slot-info .basemap-tile-head,
.show-slot-info .basemap-slot-name {
  visibility: visible;
}

.basemap-slot.is-narrow .basemap-tile-head {
  inset-inline: 0;
  flex-direction: column;
  gap: 0.3cqw;
}

.basemap-slot.is-narrow .basemap-slot-labor-icon {
  display: none;
}

.basemap-slot.is-control .basemap-tile {
  background-color: #292929;
  background-image:
    repeating-linear-gradient(
      45deg,
      transparent 0 0.8cqw,
      rgb(167 119 39 / 12%) 0.8cqw 0.84cqw,
      transparent 0.84cqw 1.64cqw
    ),
    repeating-linear-gradient(
      -45deg,
      transparent 0 0.8cqw,
      rgb(167 119 39 / 12%) 0.8cqw 0.84cqw,
      transparent 0.84cqw 1.64cqw
    );
}

.basemap-slot.is-control .basemap-unbuilt-icon {
  display: none;
}

.basemap-slot.is-control .basemap-slot-name {
  top: 50%;
  bottom: auto;
  visibility: visible;
  font-size: 1.35cqw;
  font-weight: 600;
  transform: translateY(-50%);
}

@media (width <= 600px) {
  .basemap-controls {
    flex-wrap: wrap;
    gap: 8px;
    font-size: 0.75rem;
  }
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
