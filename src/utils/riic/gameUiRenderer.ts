import fontMetrics from '@/assets/images/riic/blueprint/font-metrics.json';
import type {
  BlueprintBox,
  BlueprintColor,
  BlueprintNode,
  BlueprintSprite,
} from './blueprintRenderer';
import { blueprintBox, layoutBlueprint } from './blueprintRenderer';

export interface GameUiSprite extends BlueprintSprite {
  source: string;
}
export interface GameUiImage {
  kind: 'image';
  key: string;
  box: BlueprintBox;
  crop: string;
  sprite: GameUiSprite;
  color: BlueprintColor;
  opacity: number;
  transform: string;
  clip?: BlueprintBox;
}
export interface GameUiText {
  kind: 'text';
  key: string;
  x: number;
  y: number;
  size: number;
  font: string;
  fill: string;
  anchor: 'start' | 'middle' | 'end';
  baseline: 'alphabetic' | 'central' | 'text-after-edge';
  runs: { value: string; fill?: string }[];
  transform: string;
  clip?: BlueprintBox;
}
export interface GameUiHit {
  key: string;
  name: string;
  box: BlueprintBox;
  action: string;
  label: string;
}

export interface GameUiRect {
  kind: 'rect';
  key: string;
  box: BlueprintBox;
  fill: string;
  transform: string;
  clip?: BlueprintBox;
}

function colorCss(color: BlueprintColor, opacity = 1): string {
  return `rgba(${color.r * 255},${color.g * 255},${color.b * 255},${color.a * opacity})`;
}

/** 游戏的富文本颜色标记直接转换为 SVG 文本片段。 */
function textRuns(value: string): GameUiText['runs'] {
  const runs: GameUiText['runs'] = [];
  const pattern = /<color=(#[\da-f]+)>(.*?)<\/color>/gis;
  let start = 0;
  for (const match of value.matchAll(pattern)) {
    if (match.index > start) runs.push({ value: value.slice(start, match.index) });
    runs.push({ value: match[2]!, fill: match[1]! });
    start = match.index + match[0].length;
  }
  if (start < value.length) runs.push({ value: value.slice(start) });
  return runs;
}

/** 屏幕 UI 贴图保留完整逻辑矩形；九宫格只拉伸中心，边缘按原始 PPU 计算。 */
function imageLayers(
  node: BlueprintNode,
  box: BlueprintBox,
  sprite: GameUiSprite,
  key: string,
  opacity: number,
  transform: string,
): GameUiImage[] {
  const image = node.image!;
  const ppu = (sprite.ppu / 100) * image.ppuMultiplier;
  const slice = image.atlasSlice;
  const b = slice
    ? {
        x: slice.x * sprite.width,
        y: slice.y * sprite.height,
        z: (1 - slice.z) * sprite.width,
        w: (1 - slice.w) * sprite.height,
      }
    : sprite.border;
  const sliced = slice || (image.type === 1 && b.x + b.y + b.z + b.w > 0);
  if (!sliced) {
    let width = box.width;
    let height = box.height;
    if (image.preserveAspect) {
      const factor = Math.min(width / sprite.width, height / sprite.height);
      width = sprite.width * factor;
      height = sprite.height * factor;
    }
    return [
      {
        kind: 'image',
        key,
        sprite,
        color: image.color,
        opacity: opacity * image.color.a,
        transform,
        crop: `0 0 ${sprite.width} ${sprite.height}`,
        box: {
          ...box,
          x: box.x + (box.width - width) * node.rect.Pivot.x * box.scaleX,
          y: box.y + (box.height - height) * (1 - node.rect.Pivot.y) * box.scaleY,
          width,
          height,
        },
      },
    ];
  }
  const bx = Math.min(1, box.width / ((b.x + b.z) / ppu || 1));
  const by = Math.min(1, box.height / ((b.w + b.y) / ppu || 1));
  const sx = [0, b.x, sprite.width - b.z, sprite.width];
  const sy = [0, b.w, sprite.height - b.y, sprite.height];
  const dx = [0, (b.x / ppu) * bx, box.width - (b.z / ppu) * bx, box.width];
  const dy = [0, (b.w / ppu) * by, box.height - (b.y / ppu) * by, box.height];
  const result: GameUiImage[] = [];
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      if (x === 1 && y === 1 && !image.fillCenter) continue;
      const width = dx[x + 1]! - dx[x]!;
      const height = dy[y + 1]! - dy[y]!;
      if (width <= 0 || height <= 0) continue;
      // `UIAtlasImage` 允许中心 UV 重合，用同一列纹素填满拉伸区域。
      const sourceWidth = Math.max(0.001, sx[x + 1]! - sx[x]!);
      const sourceHeight = Math.max(0.001, sy[y + 1]! - sy[y]!);
      result.push({
        kind: 'image',
        key: `${key}-${x}-${y}`,
        sprite,
        color: image.color,
        opacity: opacity * image.color.a,
        transform,
        crop: `${sx[x]} ${sy[y]} ${sourceWidth} ${sourceHeight}`,
        box: {
          ...box,
          x: box.x + dx[x]! * box.scaleX,
          y: box.y + dy[y]! * box.scaleY,
          width,
          height,
        },
      });
    }
  }
  return result;
}

export function renderGameUi(
  roots: BlueprintNode[],
  sprites: Record<string, GameUiSprite>,
  width: number,
  height: number,
  actions: Record<string, { action: string; label: string }>,
): { layers: (GameUiImage | GameUiText | GameUiRect)[]; hits: GameUiHit[] } {
  const layers: (GameUiImage | GameUiText | GameUiRect)[] = [];
  const hits: GameUiHit[] = [];
  const parent = { x: 0, y: 0, width, height, scaleX: 1, scaleY: 1 };
  function visit(
    node: BlueprintNode,
    parentBox: BlueprintBox,
    key: string,
    inheritedOpacity: number,
    inheritedTransform: string,
    inheritedClip?: BlueprintBox,
  ) {
    if (!node.active) return;
    const box = blueprintBox(node, parentBox);
    const opacity =
      (node.canvasGroup?.m_IgnoreParentGroups ? 1 : inheritedOpacity) *
      (node.canvasGroup?.m_Alpha ?? 1);
    let clip = inheritedClip;
    if (node.scripts.RectMask2D) {
      const left = Math.max(box.x, inheritedClip?.x ?? box.x);
      const top = Math.max(box.y, inheritedClip?.y ?? box.y);
      const right = Math.min(
        box.x + box.width * box.scaleX,
        inheritedClip ? inheritedClip.x + inheritedClip.width * inheritedClip.scaleX : Infinity,
      );
      const bottom = Math.min(
        box.y + box.height * box.scaleY,
        inheritedClip ? inheritedClip.y + inheritedClip.height * inheritedClip.scaleY : Infinity,
      );
      clip = {
        x: left,
        y: top,
        width: Math.max(0, right - left),
        height: Math.max(0, bottom - top),
        scaleX: 1,
        scaleY: 1,
      };
    }
    const rotation = (
      node.rect as BlueprintNode['rect'] & { LocalRotation?: { z: number; w: number } }
    ).LocalRotation;
    const angle = rotation ? (-2 * Math.atan2(rotation.z, rotation.w) * 180) / Math.PI : 0;
    const transform =
      inheritedTransform +
      (angle
        ? ` rotate(${angle} ${box.x + box.width * box.scaleX * node.rect.Pivot.x} ${box.y + box.height * box.scaleY * (1 - node.rect.Pivot.y)})`
        : '');
    if (node.image?.sprite) {
      const sprite = sprites[node.image.sprite];
      if (!sprite) throw new Error(`Missing game UI sprite: ${node.image.sprite}`);
      layers.push(
        ...imageLayers(node, box, sprite, key, opacity, transform).map((layer) => ({
          ...layer,
          clip,
        })),
      );
    } else if (node.image) {
      layers.push({
        kind: 'rect',
        key,
        box,
        fill: colorCss(node.image.color, opacity),
        transform,
        clip,
      });
    }
    if (node.text) {
      const horizontal = node.text.alignment % 3;
      const vertical = Math.floor(node.text.alignment / 3);
      const font = node.font ?? 'NotoSansHans-Medium';
      const metrics = fontMetrics[font as keyof typeof fontMetrics];
      layers.push({
        kind: 'text',
        key,
        x: box.x + (box.width * box.scaleX * horizontal) / 2,
        y:
          box.y +
          (vertical === 0
            ? (metrics ? metrics.ascent / metrics.fontSize : 1) * node.text.size * box.scaleY
            : (box.height * box.scaleY * vertical) / 2),
        font,
        size: node.text.size * box.scaleY,
        fill: colorCss(node.text.color, opacity),
        anchor: horizontal === 0 ? 'start' : horizontal === 1 ? 'middle' : 'end',
        baseline: vertical === 0 ? 'alphabetic' : vertical === 1 ? 'central' : 'text-after-edge',
        runs: textRuns(node.text.value),
        transform,
        clip,
      });
    }
    const action = actions[node.name];
    if (action && opacity > 0) {
      const hitBox = clip
        ? {
            ...box,
            x: Math.max(box.x, clip.x),
            y: Math.max(box.y, clip.y),
            width: Math.max(
              0,
              Math.min(box.x + box.width * box.scaleX, clip.x + clip.width * clip.scaleX) -
                Math.max(box.x, clip.x),
            ),
            height: Math.max(
              0,
              Math.min(box.y + box.height * box.scaleY, clip.y + clip.height * clip.scaleY) -
                Math.max(box.y, clip.y),
            ),
            scaleX: 1,
            scaleY: 1,
          }
        : box;
      if (hitBox.width > 0 && hitBox.height > 0)
        hits.push({ key, name: node.name, box: hitBox, ...action });
    }
    node.children.forEach((child, index) =>
      visit(child, box, `${key}-${index}`, opacity, transform, clip),
    );
  }
  roots.forEach((node, index) => {
    layoutBlueprint(node, parent, sprites);
    visit(node, parent, String(index), 1, '');
  });
  return { layers, hits };
}
