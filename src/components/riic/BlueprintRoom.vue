<script setup lang="ts">
import prefabData from '@/assets/images/riic/blueprint/blueprint-prefabs.json';
import { computed } from 'vue';

interface Vector {
  x: number;
  y: number;
}
interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}
interface PrefabNode {
  name: string;
  active: boolean;
  rect: {
    AnchorMin: Vector;
    AnchorMax: Vector;
    AnchoredPosition: Vector;
    SizeDelta: Vector;
    Pivot: Vector;
    LocalScale: Vector;
  };
  image?: {
    sprite: string;
    type: number;
    color: Color;
    ppuMultiplier: number;
    fillCenter: boolean;
  };
  text?: { value: string; color: Color; size: number; alignment: number };
  font?: string;
  children: PrefabNode[];
}
interface Sprite {
  width: number;
  height: number;
  border: { x: number; y: number; z: number; w: number };
  ppu: number;
}
interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
}
interface ImagePatch {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  crop: string;
  source: string;
  sourceWidth: number;
  sourceHeight: number;
  opacity: number;
}
interface TextLayer {
  key: string;
  x: number;
  y: number;
  value: string;
  size: number;
  font: string;
  fill: string;
  scaleX: number;
  scaleY: number;
}

const props = defineProps<{
  cols: number;
  rows: number;
  control?: boolean;
  roomName?: string;
  controlLevel?: number;
}>();
const data = prefabData as { sprites: Record<string, Sprite>; prefabs: Record<string, PrefabNode> };
const textures = import.meta.glob<string>('@/assets/images/riic/blueprint/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

function textureUrl(name: string): string {
  const path = `/src/assets/images/riic/blueprint/${name}.png`;
  const url = textures[path];
  if (!url) throw new Error(`Missing blueprint sprite: ${name}`);
  return url;
}

/** 将 Unity 左下原点、锚点及轴心转换为 SVG 左上原点，保留父子缩放。 */
function nodeBox(node: PrefabNode, parent: Box): Box {
  const r = node.rect;
  const width = parent.width * (r.AnchorMax.x - r.AnchorMin.x) + r.SizeDelta.x;
  const height = parent.height * (r.AnchorMax.y - r.AnchorMin.y) + r.SizeDelta.y;
  const pivotX =
    parent.width * (r.AnchorMin.x + (r.AnchorMax.x - r.AnchorMin.x) * r.Pivot.x) +
    r.AnchoredPosition.x;
  const pivotY =
    parent.height * (r.AnchorMin.y + (r.AnchorMax.y - r.AnchorMin.y) * r.Pivot.y) +
    r.AnchoredPosition.y;
  return {
    x: parent.x + (pivotX - width * r.Pivot.x * r.LocalScale.x) * parent.scaleX,
    y:
      parent.y +
      (parent.height - pivotY - height * (1 - r.Pivot.y) * r.LocalScale.y) * parent.scaleY,
    width,
    height,
    scaleX: parent.scaleX * r.LocalScale.x,
    scaleY: parent.scaleY * r.LocalScale.y,
  };
}

/** `Image.GenerateSlicedSprite` 的边距保持原始像素尺寸，只有中心区域拉伸。 */
function imagePatches(node: PrefabNode, box: Box): ImagePatch[] {
  const image = node.image!;
  const sprite = data.sprites[image.sprite]!;
  const ppu = (sprite.ppu / 100) * image.ppuMultiplier;
  const b = sprite.border;
  const sliced = image.type === 1;
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
        key: `${node.name}-${x}-${y}`,
        x: box.x + dx[x]! * box.scaleX,
        y: box.y + dy[y]! * box.scaleY,
        width: width * box.scaleX,
        height: height * box.scaleY,
        crop: `${sx[x]} ${sy[y]} ${sx[x + 1]! - sx[x]!} ${sy[y + 1]! - sy[y]!}`,
        source: textureUrl(image.sprite),
        sourceWidth: sprite.width,
        sourceHeight: sprite.height,
        opacity: image.color.a,
      });
    }
  }
  return patches;
}

const layers = computed<{ images: ImagePatch[]; texts: TextLayer[] }>(() => {
  const parent: Box = {
    x: 0,
    y: 0,
    width: props.cols * 50,
    height: props.rows * 50,
    scaleX: 1,
    scaleY: 1,
  };
  const images: ImagePatch[] = [];
  const texts: TextLayer[] = [];
  function visit(node: PrefabNode, parentBox: Box) {
    if (!node.active) return;
    const box = nodeBox(node, parentBox);
    if (node.image) images.push(...imagePatches(node, box));
    if (node.text) {
      let value = node.text.value;
      if (node.name === 'label_name_zh') value = props.roomName ?? '控制中枢';
      if (node.name.startsWith('text_level') && props.controlLevel !== undefined)
        value = props.controlLevel.toFixed(1);
      const c = node.text.color;
      texts.push({
        key: node.name,
        x: box.x + (box.width * box.scaleX) / 2,
        y: box.y + (box.height * box.scaleY) / 2,
        value,
        size: node.text.size,
        font: node.font ?? '',
        fill: `rgba(${c.r * 255},${c.g * 255},${c.b * 255},${c.a})`,
        scaleX: box.scaleX,
        scaleY: box.scaleY,
      });
    }
    for (const child of node.children) visit(child, box);
  }
  visit(data.prefabs.frame!, parent);
  const name = props.control ? 'room_control_8x4' : `unclean_${props.cols}x${props.rows}`;
  const prefab = data.prefabs[name];
  if (prefab) visit(prefab, parent);
  return { images, texts };
});
</script>

<template>
  <svg aria-hidden="true" class="blueprint-room" :viewBox="`0 0 ${cols * 50} ${rows * 50}`">
    <svg
      v-for="patch in layers.images"
      :key="patch.key"
      :height="patch.height"
      :opacity="patch.opacity"
      overflow="hidden"
      preserveAspectRatio="none"
      :viewBox="patch.crop"
      :width="patch.width"
      :x="patch.x"
      :y="patch.y"
    >
      <image :height="patch.sourceHeight" :href="patch.source" :width="patch.sourceWidth" />
    </svg>
    <text
      v-for="text in layers.texts"
      :key="text.key"
      dominant-baseline="central"
      :fill="text.fill"
      :font-family="text.font"
      :font-size="text.size"
      text-anchor="middle"
      :transform="`translate(${text.x} ${text.y}) scale(${text.scaleX} ${text.scaleY})`"
    >
      {{ text.value }}
    </text>
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
