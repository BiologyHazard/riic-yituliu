<script setup lang="ts">
import fontMetrics from '@/assets/images/riic/blueprint/font-metrics.json';
import trainingAnimation from '@/assets/images/riic/blueprint/training-animation.json';
import { getCharAvatarUrl } from '@/utils/dataSources';
import type { BlueprintBox, BlueprintColor, BlueprintNode } from '@/utils/riic/blueprintRenderer';
import {
  blueprintBox,
  blueprintData,
  layoutBlueprint,
  prepareBlueprint,
} from '@/utils/riic/blueprintRenderer';
import type { BlueprintRoomState } from '@/utils/riic/roomState';
import { useRafFn } from '@vueuse/core';
import { computed, onMounted, ref, useId, watch } from 'vue';

interface ImagePatch {
  kind: 'image';
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  crop: string;
  source: string;
  sourceWidth: number;
  sourceHeight: number;
  color: BlueprintColor;
  opacity: number;
}
interface TextLayer {
  kind: 'text';
  key: string;
  x: number;
  y: number;
  value: string;
  size: number;
  font: string;
  fill: string;
  anchor: 'start' | 'middle' | 'end';
  baseline: 'alphabetic' | 'hanging' | 'central' | 'text-after-edge';
  scaleX: number;
  scaleY: number;
}
interface RippleTween {
  _duration: number;
  _delay: number;
  _easeType: number;
}

/** 原生 `EaseManager.Evaluate` 的枚举 `0` 分支使用 `OutQuad`。 */
function rippleProgress(tween: RippleTween, elapsed: number): number {
  if (tween._easeType !== 0)
    throw new Error(`Unsupported blueprint tween ease: ${tween._easeType}`);
  if (elapsed <= tween._delay) return 0;
  const t = ((elapsed - tween._delay) % tween._duration) / tween._duration;
  return t * (2 - t);
}

function animateRipple(node: BlueprintNode, elapsed: number) {
  const size = node.scripts.UITweenSize as unknown as
    | (RippleTween & {
        _from: { _size: { x: number; y: number } };
        _to: { _size: { x: number; y: number } };
      })
    | undefined;
  const fade = node.scripts.UITweenFade as unknown as
    | (RippleTween & {
        _from: number;
        _to: number;
      })
    | undefined;
  if (size) {
    const progress = rippleProgress(size, elapsed);
    node.rect.SizeDelta = {
      x: size._from._size.x + (size._to._size.x - size._from._size.x) * progress,
      y: size._from._size.y + (size._to._size.y - size._from._size.y) * progress,
    };
  }
  if (fade && node.canvasGroup) {
    const progress = rippleProgress(fade, elapsed);
    node.canvasGroup.m_Alpha = fade._from + (fade._to - fade._from) * progress;
  }
}

const props = defineProps<{
  cols: number;
  rows: number;
  control?: boolean;
  roomName?: string;
  controlLevel?: number;
  state?: BlueprintRoomState;
  animationEnabled?: boolean;
  construction?: boolean;
}>();
const textures = import.meta.glob<string>('@/assets/images/riic/blueprint/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});
const instanceId = useId();
const fontsReady = ref<number>(0);
const animationTime = ref<number>(0);
let animationOrigin: number | undefined;
const { pause, resume } = useRafFn(
  ({ timestamp }) => {
    animationOrigin ??= timestamp;
    animationTime.value = (timestamp - animationOrigin) / 1000;
  },
  { immediate: false },
);
watch(
  () =>
    Boolean(
      props.animationEnabled &&
      props.state?.construction === 'built' &&
      (props.state.status === 'training' ||
        (props.state.product &&
          props.state.highlight &&
          ['MANUFACTURE', 'TRADING'].includes(props.state.roomId))),
    ),
  (enabled) => {
    animationOrigin = undefined;
    animationTime.value = 0;
    if (enabled) resume();
    else pause();
  },
  { immediate: true },
);
onMounted(async () => {
  await document.fonts.ready;
  fontsReady.value++;
});

function textureUrl(name: string): string {
  const url = textures[`/src/assets/images/riic/blueprint/${name}.png`];
  if (!url) throw new Error(`Missing blueprint sprite: ${name}`);
  return url;
}

/** `shining` 的流式曲线按原始三次多项式采样，保留两张专精图标的交替渐变。 */
function trainingOpacity(name: 'start_icon' | 'end_icon', time: number): number {
  const frame = [...trainingAnimation.frames].reverse().find((item) => item.time <= time)!;
  const key = String(trainingAnimation.bindings[name]) as '0' | '1';
  const coefficients = frame.curves[key];
  const t = time - frame.time;
  return Math.max(
    0,
    Math.min(
      1,
      ((coefficients[0]! * t + coefficients[1]!) * t + coefficients[2]!) * t + coefficients[3]!,
    ),
  );
}

/** 保留九宫格原始边距，只拉伸中心区域。 */
function imagePatches(
  node: BlueprintNode,
  box: BlueprintBox,
  path: string,
  opacity: number,
): ImagePatch[] {
  const image = node.image!;
  if (image.source) {
    return [
      {
        kind: 'image',
        key: path,
        x: box.x,
        y: box.y,
        width: box.width * box.scaleX,
        height: box.height * box.scaleY,
        crop: `0 0 ${box.width} ${box.height}`,
        source: image.source,
        sourceWidth: box.width,
        sourceHeight: box.height,
        color: image.color,
        opacity: opacity * image.color.a,
      },
    ];
  }
  if (!image.sprite) return [];
  const sprite = blueprintData.sprites[image.sprite]!;
  const ppu = (sprite.ppu / 100) * image.ppuMultiplier;
  const b = sprite.border;
  const sliced = image.type === 1 && b.x + b.y + b.z + b.w > 0;
  if (!sliced) {
    // `Image.GetDrawingDimensions` 先按逻辑矩形保留比例，再应用 Sprite 裁剪边距。
    let width = box.width;
    let height = box.height;
    if (image.preserveAspect && sprite.width > 0 && sprite.height > 0) {
      const scale = Math.min(width / sprite.width, height / sprite.height);
      width = sprite.width * scale;
      height = sprite.height * scale;
    }
    const texture = sprite.textureRect ?? {
      x: 0,
      y: 0,
      width: sprite.width,
      height: sprite.height,
    };
    return [
      {
        kind: 'image',
        key: path,
        x:
          box.x +
          ((box.width - width) * node.rect.Pivot.x + (texture.x / sprite.width) * width) *
            box.scaleX,
        y:
          box.y +
          ((box.height - height) * (1 - node.rect.Pivot.y) + (texture.y / sprite.height) * height) *
            box.scaleY,
        width: ((width * texture.width) / sprite.width) * box.scaleX,
        height: ((height * texture.height) / sprite.height) * box.scaleY,
        crop: `0 0 ${texture.width} ${texture.height}`,
        source: textureUrl(image.sprite),
        sourceWidth: texture.width,
        sourceHeight: texture.height,
        color: image.color,
        opacity: opacity * image.color.a,
      },
    ];
  }
  const borderX = Math.min(1, box.width / ((b.x + b.z) / ppu || 1));
  const borderY = Math.min(1, box.height / ((b.w + b.y) / ppu || 1));
  const sx = sliced ? [0, b.x, sprite.width - b.z, sprite.width] : [0, sprite.width];
  const sy = sliced ? [0, b.w, sprite.height - b.y, sprite.height] : [0, sprite.height];
  const dx = sliced
    ? [0, (b.x / ppu) * borderX, box.width - (b.z / ppu) * borderX, box.width]
    : [0, box.width];
  const dy = sliced
    ? [0, (b.w / ppu) * borderY, box.height - (b.y / ppu) * borderY, box.height]
    : [0, box.height];
  const patches: ImagePatch[] = [];
  for (let y = 0; y < sy.length - 1; y++) {
    for (let x = 0; x < sx.length - 1; x++) {
      if (sliced && x === 1 && y === 1 && !image.fillCenter) continue;
      const width = dx[x + 1]! - dx[x]!;
      const height = dy[y + 1]! - dy[y]!;
      if (width <= 0 || height <= 0) continue;
      patches.push({
        kind: 'image',
        key: `${path}-${x}-${y}`,
        x: box.x + dx[x]! * box.scaleX,
        y: box.y + dy[y]! * box.scaleY,
        width: width * box.scaleX,
        height: height * box.scaleY,
        crop: `${sx[x]} ${sy[y]} ${sx[x + 1]! - sx[x]!} ${sy[y + 1]! - sy[y]!}`,
        source: textureUrl(image.sprite),
        sourceWidth: sprite.width,
        sourceHeight: sprite.height,
        color: image.color,
        opacity: opacity * image.color.a,
      });
    }
  }
  return patches;
}

const prefabNames: Record<string, string> = {
  CONTROL: 'room_control',
  CORRIDOR: 'room_corridor',
  ELEVATOR: 'room_elevator',
  DORMITORY: 'room_dormitory',
  PRIVATE: 'room_private',
  MANUFACTURE: 'room_manufacture',
  TRADING: 'room_trading',
  POWER: 'room_power',
  MEETING: 'room_meeting',
  WORKSHOP: 'room_workshop',
  HIRE: 'room_hire',
  TRAINING: 'room_training',
  RECYCLE: 'room_recycle',
};

const layers = computed<(ImagePatch | TextLayer)[]>(() => {
  // 字体加载后重新计算 Unity 横向布局的固有宽度。
  void fontsReady.value;
  const parent: BlueprintBox = {
    x: 0,
    y: 0,
    width: props.cols * 50,
    height: props.rows * 50,
    scaleX: 1,
    scaleY: 1,
  };
  const result: (ImagePatch | TextLayer)[] = [];
  function visit(node: BlueprintNode, parentBox: BlueprintBox, path: string, inheritedOpacity = 1) {
    if (node.name === 'img_char' && props.state?.roomId === 'PRIVATE') {
      node.active = Boolean(props.state.ownerId);
      if (node.image && props.state.ownerId)
        node.image.source = getCharAvatarUrl(props.state.ownerId, props.state.ownerElite);
    }
    if (!node.active) return;
    if (node.name === 'icon_product_ripple' && props.animationEnabled) {
      animateRipple(node, animationTime.value);
    }
    if (
      props.state?.status === 'training' &&
      node.image &&
      (node.name === 'start_icon' || node.name === 'end_icon')
    ) {
      node.image.color.a = trainingOpacity(
        node.name,
        animationTime.value % trainingAnimation.duration,
      );
    }
    const box = blueprintBox(node, parentBox);
    const opacity =
      (node.canvasGroup?.m_IgnoreParentGroups ? 1 : inheritedOpacity) *
      (node.canvasGroup?.m_Alpha ?? 1);
    if (node.image) result.push(...imagePatches(node, box, path, opacity));
    if (node.text) {
      const c = node.text.color;
      const horizontal = node.text.alignment % 3;
      const vertical = Math.floor(node.text.alignment / 3);
      const metrics = fontMetrics[node.font as keyof typeof fontMetrics];
      // Unity 顶端对齐的首行基线使用字体 `ascent`，不使用 SVG 的悬挂基线。
      const topBaseline =
        vertical === 0 && metrics
          ? (metrics.ascent / metrics.fontSize) * node.text.size
          : undefined;
      result.push({
        kind: 'text',
        key: path,
        x: box.x + (box.width * box.scaleX * horizontal) / 2,
        y:
          box.y +
          (topBaseline !== undefined
            ? topBaseline * box.scaleY
            : (box.height * box.scaleY * vertical) / 2),
        value: node.text.value,
        size: node.text.size,
        font: node.font ?? '',
        fill: `rgba(${c.r * 255},${c.g * 255},${c.b * 255},${c.a * opacity})`,
        anchor: horizontal === 0 ? 'start' : horizontal === 1 ? 'middle' : 'end',
        baseline:
          topBaseline !== undefined
            ? 'alphabetic'
            : vertical === 0
              ? 'hanging'
              : vertical === 1
                ? 'central'
                : 'text-after-edge',
        scaleX: box.scaleX,
        scaleY: box.scaleY,
      });
    }
    node.children.forEach((child, index) => visit(child, box, `${path}-${index}`, opacity));
  }
  visit(blueprintData.prefabs.frame!, parent, 'frame');
  const state = props.state;
  const prefix = state
    ? state.construction === 'built'
      ? prefabNames[state.roomId]
      : state.construction
    : props.control
      ? 'room_control'
      : 'unclean';
  const name = `${prefix}_${props.cols}x${props.rows}`;
  const prefab = prepareBlueprint(
    name,
    state,
    props.roomName,
    props.controlLevel,
    props.construction,
  );
  if (prefab) {
    layoutBlueprint(prefab, parent);
    visit(prefab, parent, 'room');
  }
  return result;
});

function filterId(color: BlueprintColor): string {
  return `${instanceId}-tint-${color.r}-${color.g}-${color.b}`;
}

const tints = computed<BlueprintColor[]>(() => {
  const colors = new Map<string, BlueprintColor>();
  for (const layer of layers.value) {
    if (
      layer.kind === 'image' &&
      (layer.color.r !== 1 || layer.color.g !== 1 || layer.color.b !== 1)
    )
      colors.set(filterId(layer.color), layer.color);
  }
  return [...colors.values()];
});
</script>

<template>
  <svg aria-hidden="true" class="blueprint-room" :viewBox="`0 0 ${cols * 50} ${rows * 50}`">
    <defs>
      <filter
        v-for="color in tints"
        :id="filterId(color)"
        :key="filterId(color)"
        color-interpolation-filters="sRGB"
      >
        <feColorMatrix
          type="matrix"
          :values="`${color.r} 0 0 0 0 0 ${color.g} 0 0 0 0 0 ${color.b} 0 0 0 0 0 1 0`"
        />
      </filter>
    </defs>
    <template v-for="layer in layers" :key="layer.key">
      <svg
        v-if="layer.kind === 'image'"
        :height="layer.height"
        :opacity="layer.opacity"
        overflow="hidden"
        preserveAspectRatio="none"
        :viewBox="layer.crop"
        :width="layer.width"
        :x="layer.x"
        :y="layer.y"
      >
        <image
          :filter="
            layer.color.r !== 1 || layer.color.g !== 1 || layer.color.b !== 1
              ? `url(#${filterId(layer.color)})`
              : undefined
          "
          :height="layer.sourceHeight"
          :href="layer.source"
          :width="layer.sourceWidth"
        />
      </svg>
      <text
        v-else
        :dominant-baseline="layer.baseline"
        :fill="layer.fill"
        :font-family="layer.font"
        :font-size="layer.size"
        :text-anchor="layer.anchor"
        :transform="`translate(${layer.x} ${layer.y}) scale(${layer.scaleX} ${layer.scaleY})`"
      >
        {{ layer.value }}
      </text>
    </template>
  </svg>
</template>

<style scoped>
@font-face {
  font-family: 'JovannyLemonad-Bender';
  src: url('@/assets/images/riic/blueprint/JovannyLemonad-Bender.otf');
}

@font-face {
  font-family: 'JovannyLemonad-Bender-Light';
  src: url('@/assets/images/riic/blueprint/JovannyLemonad-Bender-Light.otf');
}

@font-face {
  font-family: 'NotoSansHans-Medium';
  src: url('@/assets/images/riic/blueprint/NotoSansHans-Medium.otf');
}

.blueprint-room {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  overflow: visible;
  pointer-events: none;
}
</style>
