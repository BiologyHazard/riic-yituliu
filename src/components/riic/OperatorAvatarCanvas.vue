<script setup lang="ts">
import backgroundImageUrl from '@/assets/images/riic/基建解析UI_干员头像底图_180x180_2510101215_BioHazard.webp';
import type { CharDataType } from '@/types/riic';
import {
  getCharAvatarUrl,
  getEliteIconUrl,
  getProfessionIconUrl,
  getRarityIconUrl,
} from '@/utils/dataSources';
import { getCharIdByName, getCharProfessionId, getCharRarity } from '@/utils/gameData/character';
import { useTemplateRef, watch } from 'vue';

const CANVAS_SIZE = 360;

// 名字标签几何常量（以 CANVAS_SIZE 为 1 单位）
const NAME_GAP = Math.round((6 / 180) * CANVAS_SIZE); // 头像底边到名字矩形的间距
const NAME_RECT_HEIGHT = Math.round((40 / 180) * CANVAS_SIZE); // 名字矩形高度
const MAX_FONT_SIZE = Math.round((28 / 180) * CANVAS_SIZE); // 最大字号
const MAX_TEXT_WIDTH = 0.95 * CANVAS_SIZE; // 名字文字最大宽度
const SLOT_HEIGHT = CANVAS_SIZE + NAME_GAP + NAME_RECT_HEIGHT; // 每个干员的总高度

// ─── Props ──────────────────────────────────────────────────

interface OperatorAvatarCanvasProps {
  /** 要绘制的干员列表 */
  chars?: CharDataType[];
  /** 相邻干员间距（1 单位 = 头像宽度） */
  spacing?: number;
  /** 是否在最左和最右添加间距的一半作为边距 */
  showEdgePadding?: boolean;
  /** 是否绘制背景底图 */
  showBackground?: boolean;
  /** 是否绘制职业角标 */
  showProfession?: boolean;
  /** 是否绘制稀有度角标 */
  showRarity?: boolean;
  /** 是否绘制精英化角标 */
  showEliteLevel?: boolean;
}

const props = withDefaults(defineProps<OperatorAvatarCanvasProps>(), {
  chars: () => [],
  spacing: 0,
  showEdgePadding: false,
  showBackground: false,
  showProfession: true,
  showRarity: true,
  showEliteLevel: true,
});

// ─── 图片加载 ───────────────────────────────────────────────

async function loadImage(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.referrerPolicy = 'no-referrer';
  img.src = url;
  await img.decode();
  return img;
}

async function maybeLoadImage(url: string | undefined): Promise<HTMLImageElement | undefined> {
  if (url === undefined) {
    return undefined;
  }
  return await loadImage(url);
}

interface LoadedSlotImages {
  backgroundImage: HTMLImageElement;
  avatarImage: HTMLImageElement | undefined;
  professionImage: HTMLImageElement | undefined;
  eliteImage: HTMLImageElement | undefined;
  rarityImage: HTMLImageElement | undefined;
}

async function loadImagesForOperator(char: CharDataType): Promise<LoadedSlotImages> {
  const { eliteLevel, displayName } = char;
  const charId = getCharIdByName(displayName);

  // 无论是否有 charId，都可以加载精英化角标
  const effectiveEliteLevel = eliteLevel ?? 0;
  const eliteIconUrl = eliteLevel !== null ? getEliteIconUrl(eliteLevel) : undefined;

  // 如果没有 charId，则无法加载头像、职业角标和稀有度角标，只能加载背景图和精英化角标
  if (charId === undefined) {
    const [backgroundImage, eliteImage] = await Promise.all([
      loadImage(backgroundImageUrl),
      maybeLoadImage(eliteIconUrl),
    ]);
    return {
      backgroundImage,
      avatarImage: undefined,
      professionImage: undefined,
      eliteImage,
      rarityImage: undefined,
    };
  }

  // 有 charId 的情况下，加载所有相关图片
  const professionId = getCharProfessionId(charId);
  const rarity = getCharRarity(charId);

  const avatarUrl = getCharAvatarUrl(charId, effectiveEliteLevel);
  const professionUrl = professionId !== undefined ? getProfessionIconUrl(professionId) : undefined;
  const rarityUrl = rarity !== undefined ? getRarityIconUrl(rarity) : undefined;

  const [backgroundImage, avatarImage, professionImage, eliteImage, rarityImage] =
    await Promise.all([
      loadImage(backgroundImageUrl),
      maybeLoadImage(avatarUrl),
      maybeLoadImage(professionUrl),
      maybeLoadImage(eliteIconUrl),
      maybeLoadImage(rarityUrl),
    ]);

  return {
    backgroundImage,
    avatarImage,
    professionImage,
    eliteImage,
    rarityImage,
  };
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxSize: number,
  maxWidth: number,
): number {
  ctx.font = `bold ${maxSize}px "HarmonyOS Sans SC", sans-serif`;
  const measuredWidth = ctx.measureText(text).width;
  if (measuredWidth <= maxWidth) {
    return maxSize;
  }
  // 文字宽度与字号成正比，直接缩放即可
  return maxSize * (maxWidth / measuredWidth);
}

interface DrawOptions {
  showBackground: boolean;
  showProfession: boolean;
  showRarity: boolean;
  showEliteLevel: boolean;
}

function drawSlotOnCanvas(
  ctx: CanvasRenderingContext2D,
  images: LoadedSlotImages,
  x: number,
  char: CharDataType,
  drawOptions: DrawOptions,
): void {
  const { backgroundImage, avatarImage, professionImage, eliteImage, rarityImage } = images;
  const { displayName, isTired } = char;
  const { showBackground, showProfession, showRarity, showEliteLevel } = drawOptions;

  const size = CANVAS_SIZE;

  // 1. 底图
  if (showBackground) {
    ctx.drawImage(backgroundImage, x, 0, size, size);
  }

  // 2. 头像
  if (avatarImage) {
    ctx.drawImage(avatarImage, x, 0, size, size);
  }

  // 3. 注意力涣散蒙层（位于头像上方、角标下方）
  if (isTired) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(x, 0, size, size);
  }

  // 4. 职业角标（左上 25%）
  if (showProfession && professionImage) {
    const profSize = Math.round(size * 0.25);
    ctx.drawImage(professionImage, x, 0, profSize, profSize);
  }

  // 5. 精英化角标（左下 35% 宽）
  if (showEliteLevel && eliteImage) {
    const eliteImg = eliteImage;
    const eliteWidth = Math.round(size * 0.35);
    const eliteHeight = Math.round(eliteWidth * (eliteImg.naturalHeight / eliteImg.naturalWidth));
    ctx.drawImage(eliteImg, x, size - eliteHeight, eliteWidth, eliteHeight);
  }

  // 6. 稀有度角标（右下 18% 高）
  if (showRarity && rarityImage) {
    const rarityImg = rarityImage;
    const rarityHeight = Math.round(size * 0.18);
    const rarityWidth = Math.round(
      rarityHeight * (rarityImg.naturalWidth / rarityImg.naturalHeight),
    );
    ctx.drawImage(
      rarityImg,
      x + size - rarityWidth,
      size - rarityHeight,
      rarityWidth,
      rarityHeight,
    );
  }

  // 7. 名字标签
  if (displayName) {
    const nameY = CANVAS_SIZE + NAME_GAP;

    // 绘制白色背景矩形
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, nameY, size, NAME_RECT_HEIGHT);

    // 计算合适的字号
    const fontSize = fitFontSize(ctx, displayName, MAX_FONT_SIZE, MAX_TEXT_WIDTH);

    // 绘制文字（居中）
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${fontSize}px "HarmonyOS Sans SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayName, x + size / 2, nameY + NAME_RECT_HEIGHT / 2);
  }
}

async function generateAll(): Promise<void> {
  try {
    const canvas = canvasRef.value;
    if (!canvas) return;

    // 并行加载所有干员的图片
    const allImages = await Promise.all(props.chars.map(loadImagesForOperator));

    // 间距（单位 → 像素）
    const gapPx = props.spacing * CANVAS_SIZE;
    const edgePad = props.showEdgePadding ? gapPx / 2 : 0;

    // 每个槽位宽度 = 头像 + 间距
    const slotStride = CANVAS_SIZE + gapPx;

    // 创建合并画布
    const totalWidth = Math.round(
      edgePad * 2 + CANVAS_SIZE * props.chars.length + gapPx * (props.chars.length - 1),
    );
    canvas.width = Math.max(totalWidth, 0);
    canvas.height = SLOT_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 绘制选项
    const drawOptions: DrawOptions = {
      showBackground: props.showBackground,
      showProfession: props.showProfession,
      showRarity: props.showRarity,
      showEliteLevel: props.showEliteLevel,
    };

    // 从左到右依次绘制每个干员
    for (let i = 0; i < props.chars.length; i++) {
      const images = allImages[i]!;
      const char = props.chars[i]!;
      const x = Math.round(edgePad + i * slotStride);
      drawSlotOnCanvas(ctx, images, x, char, drawOptions);
    }
  } catch (error) {
    console.error('Failed to generate avatars:', error);
  }
}

// 串行化生成任务：同一时刻只有一个生成在跑，保证绘制顺序与输入顺序一致
let renderChain: Promise<void> = Promise.resolve();

function queueRender(): void {
  renderChain = renderChain.then(() => generateAll()).catch(() => {});
}

const canvasRef = useTemplateRef('canvasRef');

watch(props, queueRender);

// ─── 对外方法 ───────────────────────────────────────────────

async function toBlob(): Promise<Blob> {
  // 等待所有已排队的渲染完成，确保导出的是最新画面而非渲染中的旧帧
  await renderChain;
  const canvas = canvasRef.value;
  if (!canvas) throw new Error('Canvas not found');
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Failed to convert canvas to blob');
  return blob;
}

defineExpose({ toBlob });
</script>

<template>
  <canvas
    ref="canvasRef"
    class="h-auto max-h-full min-h-0 w-auto max-w-full min-w-0"
    height="0"
    width="0"
  />
</template>
