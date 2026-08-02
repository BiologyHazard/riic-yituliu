<script setup lang="ts">
import backgroundImageUrl from '@/assets/images/riic/基建解析UI_干员头像底图_180x180_2510101215_BioHazard.webp';
import { useToastWithProgress } from '@/composables/useToastWithProgress';
import {
  getCharAvatarUrl,
  getEliteIconUrl,
  getProfessionIconUrl,
  getRarityIconUrl,
} from '@/utils/dataSources';
import { getCharIdByName, getCharProfessionId, getCharRarity } from '@/utils/gameData/character';
import { computed, ref, useTemplateRef, watch } from 'vue';

const CANVAS_SIZE = 360;

// 名字标签几何常量（以 CANVAS_SIZE 为 1 单位）
const NAME_GAP = Math.round((6 / 180) * CANVAS_SIZE); // 头像底边到名字矩形的间距
const NAME_RECT_HEIGHT = Math.round((40 / 180) * CANVAS_SIZE); // 名字矩形高度
const MAX_FONT_SIZE = Math.round((28 / 180) * CANVAS_SIZE); // 最大字号
const MAX_TEXT_WIDTH = 0.95 * CANVAS_SIZE; // 名字文字最大宽度
const SLOT_HEIGHT = CANVAS_SIZE + NAME_GAP + NAME_RECT_HEIGHT; // 每个干员的总高度

// ─── 解析类型 ───────────────────────────────────────────────

interface OperatorSpec {
  /** 干员 ID */
  charId: string;
  /** 干员名称 */
  charName: string;
  /** 精英化等级，`null` 表示不显示 */
  eliteLevel: number | null;
  /** 是否注意力涣散 */
  isTired: boolean;
}

// ─── 解析逻辑 ───────────────────────────────────────────────

function parseToken(token: string): OperatorSpec | null {
  let remaining = token.trim();

  // 1. 检查末尾的 !
  let isTired = false;
  if (remaining.endsWith('!')) {
    isTired = true;
    remaining = remaining.slice(0, -1);
  }

  // 2. 检查末尾的数字 (0/1/2)
  let eliteLevel: number | null = null;
  const lastChar = remaining.charAt(remaining.length - 1);
  if (['0', '1', '2'].includes(lastChar)) {
    eliteLevel = parseInt(lastChar);
    remaining = remaining.slice(0, -1);
  }

  const charName = remaining.trim();

  // 3. 查找干员
  const charId = getCharIdByName(charName);
  if (!charId) return null;

  return {
    charId,
    charName,
    eliteLevel,
    isTired,
  };
}

function parseInput(text: string): OperatorSpec[] {
  return text
    .split(/[\s]+/)
    .map(parseToken)
    .filter((x) => x !== null);
}

const inputText = ref<string>('');
const isCopying = ref<boolean>(false);

const operatorSpecs = computed<OperatorSpec[]>(() => parseInput(inputText.value));

// ─── 显示开关 ───────────────────────────────────────────────

const spacing = ref<number>(0);
const showEdgePadding = ref<boolean>(false);
const showBackground = ref<boolean>(false);
const showProfession = ref<boolean>(true);
const showRarity = ref<boolean>(true);
const showEliteLevelGlobal = ref<boolean>(true);

// ─── 合成渲染状态用于 watch ─────────────────────────────────

const generationInput = computed(() => ({
  operatorSpecs: operatorSpecs.value,
  spacing: spacing.value,
  showEdgePadding: showEdgePadding.value,
  showBackground: showBackground.value,
  showProfession: showProfession.value,
  showRarity: showRarity.value,
  showEliteLevelGlobal: showEliteLevelGlobal.value,
}));

// ─── 图片加载 ───────────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

interface LoadedSlotImages {
  backgroundImage: HTMLImageElement;
  avatarImage: HTMLImageElement | undefined;
  professionImage: HTMLImageElement | undefined;
  eliteImage: HTMLImageElement | undefined;
  rarityImage: HTMLImageElement | undefined;
}

async function loadImagesForOperator(operatorSpec: OperatorSpec): Promise<LoadedSlotImages | null> {
  const { charId, eliteLevel } = operatorSpec;
  if (!charId) return null;

  const effectiveElite = eliteLevel ?? 0;

  const avatarUrl = getCharAvatarUrl(charId, effectiveElite);

  const professionId = getCharProfessionId(charId);
  const rarity = getCharRarity(charId);

  const professionUrl = professionId !== undefined ? getProfessionIconUrl(professionId) : undefined;

  const eliteIconUrl = eliteLevel !== null ? getEliteIconUrl(eliteLevel) : undefined;

  const rarityUrl = rarity !== undefined ? getRarityIconUrl(rarity) : undefined;

  const [backgroundImage, avatarImage, professionImage, eliteImage, rarityImage] =
    await Promise.all([
      loadImage(backgroundImageUrl),
      avatarUrl ? loadImage(avatarUrl) : Promise.resolve(undefined),
      professionUrl ? loadImage(professionUrl) : Promise.resolve(undefined),
      eliteIconUrl ? loadImage(eliteIconUrl) : Promise.resolve(undefined),
      rarityUrl ? loadImage(rarityUrl) : Promise.resolve(undefined),
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
  operatorSpec: OperatorSpec,
  drawOptions: DrawOptions,
): void {
  const { backgroundImage, avatarImage, professionImage, eliteImage, rarityImage } = images;
  const { charName, isTired } = operatorSpec;
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
  if (charName) {
    const nameY = CANVAS_SIZE + NAME_GAP;

    // 绘制白色背景矩形
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, nameY, size, NAME_RECT_HEIGHT);

    // 计算合适的字号
    const fontSize = fitFontSize(ctx, charName, MAX_FONT_SIZE, MAX_TEXT_WIDTH);

    // 绘制文字（居中）
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${fontSize}px "HarmonyOS Sans SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(charName, x + size / 2, nameY + NAME_RECT_HEIGHT / 2);
  }
}

async function generateAll(): Promise<void> {
  try {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const validOperatorSpecs = operatorSpecs.value.filter((s) => s.charId !== undefined);

    // 并行加载所有干员的图片
    const allImages = await Promise.all(validOperatorSpecs.map(loadImagesForOperator));

    // 间距（单位 → 像素）
    const gapPx = spacing.value * CANVAS_SIZE;
    const edgePad = showEdgePadding.value ? gapPx / 2 : 0;

    // 每个槽位宽度 = 头像 + 间距
    const slotStride = CANVAS_SIZE + gapPx;

    // 创建合并画布
    const totalWidth = Math.round(
      edgePad * 2 +
        CANVAS_SIZE * validOperatorSpecs.length +
        gapPx * (validOperatorSpecs.length - 1),
    );
    canvas.width = Math.max(totalWidth, 0);
    canvas.height = SLOT_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 绘制选项
    const drawOptions: DrawOptions = {
      showBackground: showBackground.value,
      showProfession: showProfession.value,
      showRarity: showRarity.value,
      showEliteLevel: showEliteLevelGlobal.value,
    };

    // 从左到右依次绘制每个干员
    for (let i = 0; i < validOperatorSpecs.length; i++) {
      const images = allImages[i];
      const operatorSpec = validOperatorSpecs[i]!;
      if (images) {
        const x = Math.round(edgePad + i * slotStride);
        drawSlotOnCanvas(ctx, images, x, operatorSpec, drawOptions);
      }
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

// ─── 复制到剪贴板 ───────────────────────────────────────────

async function copyToClipboard(): Promise<void> {
  const { initToast, updateProgress, completeToast, failToast } = useToastWithProgress();

  try {
    isCopying.value = true;
    initToast({ title: '复制到剪贴板', description: '正在获取图片…' });

    updateProgress(0.3, { description: '正在获取图片…' });
    const canvas = canvasRef.value;
    if (!canvas) throw new Error('Canvas not found');
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Failed to convert canvas to blob');

    updateProgress(0.7, { description: '正在写入剪贴板…' });
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);

    completeToast({ title: '复制成功', description: '干员头像已复制到剪贴板！' });
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    failToast({
      title: '复制失败',
      description: error instanceof Error ? error.message : '复制失败，请重试',
    });
  } finally {
    isCopying.value = false;
  }
}

const canvasRef = useTemplateRef('canvasRef');

// ─── 监听变化自动重绘 ─────────────────────────────────────

watch(
  generationInput,
  () => {
    queueRender();
  },
  { deep: true },
);
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="干员头像生成器" />

      <UPageBody>
        <div class="flex flex-col gap-8">
          <!-- 预览区 -->
          <div class="flex flex-col items-center gap-4">
            <div
              class="flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl shadow-lg ring-1 ring-default"
            >
              <canvas
                ref="canvasRef"
                class="h-auto max-h-full min-h-0 w-auto max-w-full min-w-0"
                height="0"
                width="0"
              />
            </div>

            <UButton
              :disabled="isCopying"
              icon="i-lucide-clipboard-copy"
              size="lg"
              variant="subtle"
              @click="copyToClipboard"
            >
              复制到剪贴板
            </UButton>
          </div>

          <!-- 控制面板 -->
          <div class="grid gap-8 lg:grid-cols-2">
            <!-- 左栏：输入区 -->
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-toned" for="operator-input">干员输入</label>
                <p class="text-xs text-toned">
                  以空格分隔。名称后加 0/1/2 表示精英等级，加 ! 表示注意力涣散。
                </p>
                <UTextarea
                  v-model="inputText"
                  placeholder="谬因2 Lancet-20! 缇缇1 乌尔比安"
                  :rows="3"
                  size="lg"
                />
              </div>

              <!-- 已识别干员 -->
              <div
                v-if="operatorSpecs.filter((s) => s.charId).length > 0"
                class="flex flex-col gap-1.5"
              >
                <span class="text-xs font-medium text-toned"
                  >已识别 {{ operatorSpecs.filter((s) => s.charId).length }} 名干员</span
                >
                <div class="flex flex-wrap gap-1">
                  <UBadge
                    v-for="({ charName, isTired, eliteLevel }, i) in operatorSpecs"
                    :key="i"
                    color="neutral"
                    size="sm"
                    variant="soft"
                  >
                    {{ charName }}
                    <template v-if="eliteLevel !== null"> · 精英{{ eliteLevel }}</template>
                    <template v-if="isTired"> · 涣散</template>
                  </UBadge>
                </div>
              </div>
            </div>

            <!-- 右栏：设置区 -->
            <div class="flex flex-col gap-5">
              <!-- 间距 -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-toned">干员间距</label>
                <p class="text-xs text-toned">
                  相邻干员之间的间距（1 单位 = 头像宽度 {{ CANVAS_SIZE }}px）
                </p>
                <UInputNumber v-model="spacing" :min="0" size="sm" :step="0.05" />
              </div>

              <!-- 边距开关 -->
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-toned">两侧边距</span>
                  <span class="text-xs text-toned">在最左和最右添加间距的一半作为边距</span>
                </div>
                <USwitch v-model="showEdgePadding" size="sm" />
              </div>

              <!-- 分隔线 -->
              <USeparator />

              <!-- 显示开关 -->
              <div class="flex flex-col gap-3">
                <span class="text-sm font-medium text-toned">显示选项</span>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-toned">背景底图</span>
                  <USwitch v-model="showBackground" size="sm" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-toned">职业角标</span>
                  <USwitch v-model="showProfession" size="sm" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-toned">精英化等级</span>
                  <USwitch v-model="showEliteLevelGlobal" size="sm" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm text-toned">星级</span>
                  <USwitch v-model="showRarity" size="sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
