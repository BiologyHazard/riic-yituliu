<script setup lang="ts">
import OperatorAvatar from '@/components/riic/OperatorAvatar.vue';
import type { CharacterTable } from '@/types/gameData';
import { characterTable } from '@/utils/gameData';
import Color from 'color';
import { nextTick, onMounted, reactive, ref, watch } from 'vue';

interface DragPayload {
  charId: string;
  from: number | 'POOL';
}

interface TierMakerState {
  tiers: string[][];
  pool: string[];
}

interface AnimatingItem {
  charId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
}

const STORAGE_KEY = 'tier-maker-state-v1';

const charIds = [
  'char_009_12fce',
  'char_503_rang',
  'char_208_melan',
  'char_211_adnach',
  'char_277_sqrrel',
  'char_289_gyuki',
  'char_110_deepcl',
  'char_127_estell',
  'char_237_gravel',
  'char_230_savage',
  'char_242_otter',
  'char_137_brownb',
  'char_284_spot',
  'char_253_greyy',
  'char_188_helage',
  'char_131_flameb',
  'char_248_mgllan',
  'char_017_huang',
  'char_226_hmau',
  'char_222_bpipe',
  'char_301_cutter',
  'char_373_lionhd',
  'char_293_thorns',
  'char_440_pinecn',
  'char_458_rfrost',
  'char_003_kalts',
  'char_421_crow',
  'char_484_robrta',
  'char_4019_ncdeer',
  'char_4040_rockr',
  'char_4014_lunacu',
  'char_488_buildr',
  'char_4119_wanqin',
  'char_4162_cathy',
  'char_1502_crosly',
  'char_4191_tippi',
  'char_1043_leizi2',
];

const 神CharIds = ['char_4019_ncdeer'];

const 夯CharIds = [] as string[];

const 顶级CharIds = [
  'char_188_helage',
  'char_131_flameb',
  'char_017_huang',
  'char_222_bpipe',
  'char_4014_lunacu',
  'char_1043_leizi2',
];

const 人上人CharIds = [
  'char_373_lionhd',
  'char_458_rfrost',
  'char_421_crow',
  'char_488_buildr',
  'char_1502_crosly',
];

const NPCCharIds = [
  'char_277_sqrrel',
  'char_289_gyuki',
  'char_230_savage',
  'char_137_brownb',
  'char_301_cutter',
  'char_440_pinecn',
  'char_003_kalts',
  'char_484_robrta',
];

const 拉完了CharIds = [
  'char_009_12fce',
  'char_503_rang',
  'char_208_melan',
  'char_211_adnach',
  'char_110_deepcl',
  'char_127_estell',
  'char_237_gravel',
  'char_242_otter',
  'char_284_spot',
  'char_253_greyy',
  'char_248_mgllan',
  'char_226_hmau',
  'char_293_thorns',
  'char_4040_rockr',
  'char_4119_wanqin',
  'char_4162_cathy',
  'char_4191_tippi',
];

const tierNames = ['神', '夯', '顶级', '人上人', 'NPC', '拉完了'];
const tierColors = ['#7030a0', '#b22600', '#ff8427', '#ffe085', '#c4bd97', '#a6a6a6'].map((c) =>
  Color(c),
);

function makeEmptyState(): TierMakerState {
  return {
    tiers: tierNames.map(() => []),
    pool: [...charIds],
  };
}

function makeState1(): TierMakerState {
  return {
    tiers: [[], [], [...顶级CharIds], [], [], []],
    pool: charIds.filter((id) => !顶级CharIds.includes(id)),
  };
}

function makeState2(): TierMakerState {
  return {
    tiers: [[], [], [...顶级CharIds], [...人上人CharIds], [], []],
    pool: charIds.filter((id) => !顶级CharIds.includes(id) && !人上人CharIds.includes(id)),
  };
}

function makeState3(): TierMakerState {
  return {
    tiers: [[], [], [...顶级CharIds], [...人上人CharIds], [...NPCCharIds], []],
    pool: charIds.filter(
      (id) => !顶级CharIds.includes(id) && !人上人CharIds.includes(id) && !NPCCharIds.includes(id),
    ),
  };
}

function makeState4(): TierMakerState {
  return {
    tiers: [[], [], [...顶级CharIds], [...人上人CharIds], [...NPCCharIds], [...拉完了CharIds]],
    pool: charIds.filter(
      (id) =>
        !顶级CharIds.includes(id) &&
        !人上人CharIds.includes(id) &&
        !NPCCharIds.includes(id) &&
        !拉完了CharIds.includes(id),
    ),
  };
}

function makeFinalState(): TierMakerState {
  return {
    tiers: [
      [...神CharIds],
      [...夯CharIds],
      [...顶级CharIds],
      [...人上人CharIds],
      [...NPCCharIds],
      [...拉完了CharIds],
    ],
    pool: [],
  };
}

const state = ref<TierMakerState>(makeEmptyState());

// 拖拽状态
const draggedChar = ref<string | null>(null);
const dropTarget = ref<number | 'POOL' | null>(null);

// 动画状态
const animatingItems = ref<AnimatingItem[]>([]);
const hiddenChars = ref<Set<string>>(new Set()); // 正在动画的头像需要在目标位置隐藏
const ANIMATION_DURATION = 500; // 动画持续时间（毫秒）

// 初始化：从本地读取；否则全部放入池子
onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved?.tierNames && saved?.tiers && saved?.pool) {
        state.value = saved;
      }
    }
  } catch {
    state.value = makeEmptyState();
  }
});

// 持久化
watch(
  state,
  () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value));
  },
  { deep: true },
);

function onDragStart(evt: DragEvent, payload: DragPayload) {
  if (!evt.dataTransfer) return;
  evt.dataTransfer.setData('text/plain', JSON.stringify(payload));
  evt.dataTransfer.effectAllowed = 'move';
  draggedChar.value = payload.charId;
}

function onDragEnd() {
  draggedChar.value = null;
  dropTarget.value = null;
}

function getPayload(evt: DragEvent): DragPayload | null {
  try {
    const text = evt.dataTransfer?.getData('text/plain');
    if (!text) return null;
    const data = JSON.parse(text);
    if (
      data?.charId &&
      (data.from === 'POOL' ||
        (typeof data.from === 'number' && data.from >= 0 && data.from < tierNames.length))
    ) {
      return data as DragPayload;
    }
  } catch {}
  return null;
}

function moveTo(target: number | 'POOL', charId: string, from: number | 'POOL') {
  if (from === target) return;
  // 从来源删除
  const srcArr = from === 'POOL' ? state.value.pool : state.value.tiers[from] || [];
  const idx = srcArr.indexOf(charId);
  if (idx >= 0) {
    srcArr.splice(idx, 1);
  }
  srcArr.sort((a, b) => charIds.indexOf(a) - charIds.indexOf(b));
  // 添加到目标末尾
  const dstArr = target === 'POOL' ? state.value.pool : state.value.tiers[target] || [];
  if (!dstArr.includes(charId)) {
    dstArr.push(charId);
  }
  dstArr.sort((a, b) => charIds.indexOf(a) - charIds.indexOf(b));
}

// 获取元素在页面上的中心位置
function getElementCenter(element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

// 执行动画
async function animateMove(charId: string, from: number | 'POOL', to: number | 'POOL') {
  console.log('🎬 animateMove called:', { charId, from, to });

  if (from === to) {
    console.log('❌ Same position, skipping animation');
    return; // 同一位置不需要动画
  }

  // 先获取源元素位置（必须在移动数据前获取）
  const selector = `[data-char-id="${charId}"][data-location="${from}"]`;
  console.log('🔍 Looking for source element with selector:', selector);
  const sourceEl = document.querySelector(selector) as HTMLElement;

  if (!sourceEl) {
    console.log('❌ Source element not found, skipping animation');
    // 如果找不到源元素，直接移动数据，不做动画
    moveTo(to, charId, from);
    return;
  }

  const start = getElementCenter(sourceEl);
  console.log('📍 Source position:', start);

  // 标记这个头像为隐藏状态（在目标位置不显示）
  hiddenChars.value.add(charId);

  // 立即移动数据
  moveTo(to, charId, from);

  // 等待 DOM 更新，然后找到头像在目标位置的实际元素
  await nextTick();

  const targetSelector = `[data-char-id="${charId}"][data-location="${to}"]`;
  console.log('🔍 Looking for target element with selector:', targetSelector);
  const targetEl = document.querySelector(targetSelector) as HTMLElement;

  if (!targetEl) {
    console.log('❌ Target element not found after moving');
    hiddenChars.value.delete(charId);
    return;
  }

  const end = getElementCenter(targetEl);
  console.log('🎯 Target position:', end);

  // 创建响应式动画项（使用 reactive 确保 Vue 能追踪 progress 变化）
  const animItem = reactive<AnimatingItem>({
    charId,
    startX: start.x,
    startY: start.y,
    endX: end.x,
    endY: end.y,
    progress: 0,
  });

  console.log('✅ Animation item created:', animItem);

  animatingItems.value.push(animItem);
  console.log('📊 Current animatingItems count:', animatingItems.value.length);

  // 启动动画
  const startTime = performance.now();
  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

    // 使用缓动函数（easeOutCubic）
    const eased = 1 - Math.pow(1 - progress, 3);
    animItem.progress = eased;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      console.log('🏁 Animation completed for:', charId);
      // 动画完成，移除动画项和隐藏标记
      const index = animatingItems.value.indexOf(animItem);
      if (index >= 0) {
        animatingItems.value.splice(index, 1);
      }
      hiddenChars.value.delete(charId);
    }
  };

  requestAnimationFrame(animate);
  console.log('🚀 Animation started');
}

function onDropToTier(evt: DragEvent, tierIndex: number) {
  evt.preventDefault();
  dropTarget.value = null;
  const payload = getPayload(evt);
  if (!payload) return;
  animateMove(payload.charId, payload.from, tierIndex);
}

function onDropToPool(evt: DragEvent) {
  evt.preventDefault();
  dropTarget.value = null;
  const payload = getPayload(evt);
  if (!payload) return;
  animateMove(payload.charId, payload.from, 'POOL');
}

function allowDrop(evt: DragEvent) {
  evt.preventDefault();
  evt.dataTransfer!.dropEffect = 'move';
}

function onDragEnterTier(tierIndex: number) {
  dropTarget.value = tierIndex;
}

function onDragEnterPool() {
  dropTarget.value = 'POOL';
}

function onDragLeave() {
  // 这里不立即清除dropTarget，因为可能在子元素间移动
}

function onDragOverTier(evt: DragEvent, tierIndex: number) {
  allowDrop(evt);
  dropTarget.value = tierIndex;
}

function onDragOverPool(evt: DragEvent) {
  allowDrop(evt);
  dropTarget.value = 'POOL';
}

/**
 * 把状态移动到 toState
 */
function moveAll(toState: TierMakerState) {
  // 收集所有需要移动的头像
  const charsToAnimate: Array<{ charId: string; from: number | 'POOL'; to: number | 'POOL' }> = [];

  // 从当前 tiers 中收集需要移动的头像
  state.value.tiers.forEach((tier, tierIndex) => {
    tier.forEach((charId) => {
      const targetTierIndex = toState.tiers.findIndex((t) => t.includes(charId));
      const targetLocation = targetTierIndex >= 0 ? targetTierIndex : 'POOL';

      if (tierIndex !== targetLocation) {
        charsToAnimate.push({
          charId,
          from: tierIndex,
          to: targetLocation,
        });
      }
    });
  });

  // 从当前 pool 中收集需要移动的头像
  state.value.pool.forEach((charId) => {
    const targetTierIndex = toState.tiers.findIndex((t) => t.includes(charId));

    if (targetTierIndex >= 0) {
      charsToAnimate.push({
        charId,
        from: 'POOL',
        to: targetTierIndex,
      });
    }
  });

  // 如果没有需要移动的头像，直接更新状态
  if (charsToAnimate.length === 0) {
    state.value = toState;
    return;
  }

  // 为每个头像触发动画（添加小延迟让动画更自然）
  charsToAnimate.forEach((item, index) => {
    setTimeout(() => {
      animateMove(item.charId, item.from, item.to);
    }, index * 50); // 每个动画间隔 50ms
  });
}

// 计算预览头像应该显示在哪个位置（用于在循环中显示）
function shouldShowPreviewBefore(tierIndex: number, currentCharId: string): boolean {
  if (dropTarget.value !== tierIndex || !draggedChar.value) return false;
  const tier = state.value.tiers[tierIndex] || [];
  if (tier.includes(draggedChar.value)) return false;

  // 计算如果加入这个头像，排序后的位置
  const draggedIndex = charIds.indexOf(draggedChar.value);
  const currentIndex = charIds.indexOf(currentCharId);

  // 只在第一个大于拖拽头像的位置显示预览
  if (currentIndex > draggedIndex) {
    // 检查是否是第一个大于拖拽头像的
    const indexInTier = tier.indexOf(currentCharId);
    if (indexInTier > 0) {
      const prevCharId = tier[indexInTier - 1];
      const prevIndex = charIds.indexOf(prevCharId);
      // 如果前一个也大于拖拽头像，则不显示
      if (prevIndex > draggedIndex) return false;
    }
    return true;
  }

  return false;
}

// 计算预览头像是否应该显示在末尾
function shouldShowPreviewAtEnd(tierIndex: number): boolean {
  if (dropTarget.value !== tierIndex || !draggedChar.value) return false;
  const tier = state.value.tiers[tierIndex] || [];
  if (tier.includes(draggedChar.value)) return false;

  // 如果列表为空，或者拖拽的头像应该排在最后
  if (tier.length === 0) return true;

  const draggedIndex = charIds.indexOf(draggedChar.value);
  const lastIndex = charIds.indexOf(tier[tier.length - 1]);

  return draggedIndex > lastIndex;
}
</script>

<template>
  <div class="tier-maker">
    <div class="board-section">
      <div
        v-for="(tierName, index) in tierNames"
        :key="index"
        class="tier-row"
        :class="{ 'drag-over': dropTarget === index }"
        :data-tier-index="index"
        @dragover="(e) => onDragOverTier(e, index)"
        @dragenter="onDragEnterTier(index)"
        @dragleave="onDragLeave"
        @drop="(e) => onDropToTier(e, index)"
      >
        <div
          class="tier-label"
          :style="{
            backgroundColor: tierColors[index]!.string(),
            color: tierColors[index]!.luminosity() > 0.6 ? '#000' : '#fff',
          }"
        >
          {{ tierName }}
        </div>
        <div class="tier-list">
          <template v-for="charId in state.tiers[index]" :key="charId">
            <!-- 预览头像（显示在当前头像之前） -->
            <div
              v-if="shouldShowPreviewBefore(index, charId)"
              :key="`preview-before-${charId}`"
              class="tile preview"
            >
              <OperatorAvatar :char-id="draggedChar!" />
            </div>
            <!-- 实际头像 -->
            <div
              class="tile"
              :class="{ hidden: hiddenChars.has(charId) }"
              :data-char-id="charId"
              :data-location="index"
              draggable="true"
              @dragstart="(e) => onDragStart(e, { charId, from: index })"
              @dragend="onDragEnd"
              :title="characterTable[charId]?.name"
            >
              <OperatorAvatar :char-id="charId" />
            </div>
          </template>
          <!-- 预览头像（显示在末尾） -->
          <div v-if="shouldShowPreviewAtEnd(index)" class="tile preview">
            <OperatorAvatar :char-id="draggedChar!" />
          </div>
        </div>
      </div>
    </div>

    <div class="pool-section">
      <div class="pool-header">
        <div class="pool-header-text">可用干员</div>
        <button type="button" @click="moveAll(makeEmptyState())">重置</button>
        <button type="button" @click="moveAll(makeState1())">80%</button>
        <button type="button" @click="moveAll(makeState2())">75%</button>
        <button type="button" @click="moveAll(makeState3())">70%</button>
        <button type="button" @click="moveAll(makeState4())">≤ 65%</button>
        <button v-show="false" type="button" @click="moveAll(makeFinalState())">最终状态</button>
      </div>

      <div
        class="pool"
        :class="{ 'drag-over': dropTarget === 'POOL' }"
        @dragover="onDragOverPool"
        @dragenter="onDragEnterPool"
        @dragleave="onDragLeave"
        @drop="onDropToPool"
      >
        <template v-for="(charId, idx) in state.pool" :key="charId">
          <!-- 预览头像（只在第一个大于拖拽头像的位置显示） -->
          <div
            v-if="
              dropTarget === 'POOL' &&
              draggedChar &&
              !state.pool.includes(draggedChar) &&
              charIds.indexOf(charId) > charIds.indexOf(draggedChar) &&
              (idx === 0 || charIds.indexOf(state.pool[idx - 1]) <= charIds.indexOf(draggedChar))
            "
            :key="`preview-before-${charId}`"
            class="tile preview"
          >
            <OperatorAvatar :char-id="draggedChar" />
          </div>
          <!-- 实际头像 -->
          <div
            class="tile"
            :class="{ hidden: hiddenChars.has(charId) }"
            :data-char-id="charId"
            :data-location="'POOL'"
            draggable="true"
            @dragstart="(e) => onDragStart(e, { charId, from: 'POOL' })"
            @dragend="onDragEnd"
            :title="(characterTable as unknown as CharacterTable)[charId]?.name"
          >
            <OperatorAvatar :char-id="charId" />
          </div>
        </template>
        <!-- 预览头像（显示在末尾） -->
        <div
          v-if="
            dropTarget === 'POOL' &&
            draggedChar &&
            !state.pool.includes(draggedChar) &&
            (state.pool.length === 0 ||
              charIds.indexOf(draggedChar) > charIds.indexOf(state.pool[state.pool.length - 1]))
          "
          class="tile preview"
        >
          <OperatorAvatar :char-id="draggedChar" />
        </div>
      </div>
    </div>

    <!-- 动画层 -->
    <div class="animation-layer">
      <div
        v-for="(item, idx) in animatingItems"
        :key="`anim-${item.charId}-${idx}`"
        class="animating-tile"
        :style="{
          left: item.startX + (item.endX - item.startX) * item.progress + 'px',
          top: item.startY + (item.endY - item.startY) * item.progress + 'px',
          opacity: 0.0 + item.progress * 1,
        }"
      >
        <OperatorAvatar :char-id="item.charId" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$avatar-size: clamp(36px, 12vw, 72px);

.tier-maker {
  width: 1420px;
  display: flex;
  flex-direction: row;
  gap: 16px;
  user-select: none;
  position: relative;
  align-items: flex-start;
}

.board-section {
  width: 826px;
  // flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.tier-row {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  overflow: hidden;
  transition: background-color 0.2s;

  &.drag-over {
    background: rgba(100, 150, 255, 0.15);
  }
}

.tier-label {
  width: 96px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  user-select: none;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.tier-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  min-height: calc($avatar-size + 16px);
}

.pool-section {
  width: 490px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pool-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.pool-header-text {
  margin-inline-end: auto;
}

.pool {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  min-height: calc($avatar-size + 16px);
  // height: calc(100vh - 200px);
  overflow-y: auto;
  transition:
    background-color 0.2s,
    border-color 0.2s;
  align-content: flex-start;

  &.drag-over {
    background: rgba(100, 150, 255, 0.15);
    border-color: rgba(100, 150, 255, 0.5);
  }
}

.tile {
  width: $avatar-size;
  height: $avatar-size;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: grab;
  // transition: opacity 0.15s;

  &:active {
    cursor: grabbing;
  }

  &.hidden {
    opacity: 0;
    pointer-events: none;
  }

  &.preview {
    opacity: 0.4;
    border: 2px dashed rgba(100, 150, 255, 0.8);
    cursor: default;
    animation: preview-pulse 1s ease-in-out infinite;
  }
}

@keyframes preview-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
}

.animation-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.animating-tile {
  position: absolute;
  width: $avatar-size;
  height: $avatar-size;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transform: translate(-50%, -50%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  will-change: transform, opacity;
}
</style>
