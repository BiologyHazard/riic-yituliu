<script setup lang="ts">
import backgroundSrc from '@/assets/images/riic/基建解析UI_干员头像底图_180x180_2510101215_BioHazard.webp';
import { useToastWithProgress } from '@/composables/useToastWithProgress';
import { getCharAvatarUrl } from '@/utils/dataSources';
import {
  getCharIdByName,
  getCharName,
  getCharProfessionName,
  getCharRarity,
} from '@/utils/gameData/character';
import { getPrtsWikiMediaUrl } from '@/utils/prtsWiki';
import { watchThrottled } from '@vueuse/core';
import { computed, ref } from 'vue';

const CANVAS_SIZE = 360;

// 名字标签几何常量（以 CANVAS_SIZE 为 1 单位）
const NAME_GAP = Math.round((6 / 180) * CANVAS_SIZE); // 头像底边到名字矩形的间距
const NAME_RECT_HEIGHT = Math.round((40 / 180) * CANVAS_SIZE); // 名字矩形高度
const MAX_FONT_SIZE = Math.round((28 / 180) * CANVAS_SIZE); // 最大字号
const MAX_TEXT_WIDTH = 0.95 * CANVAS_SIZE; // 名字文字最大宽度
const SLOT_HEIGHT = CANVAS_SIZE + NAME_GAP + NAME_RECT_HEIGHT; // 每个干员的总高度

// ─── 解析类型 ───────────────────────────────────────────────

interface OperatorSpec {
  /** 用户输入的原始名称（如 "谬因"） */
  rawName: string;
  /** 干员实际显示名称（从数据表解析） */
  charName: string | undefined;
  /** 精英化等级，undefined 表示不显示 */
  eliteLevel: number | undefined;
  /** 是否注意力涣散 */
  isTired: boolean;
  /** 是否显示精英化角标 */
  showEliteLevel: boolean;
  /** 匹配到的干员 ID */
  charId: string | undefined;
  /** 解析错误信息 */
  error: string | undefined;
}

// ─── 解析逻辑 ───────────────────────────────────────────────

function parseToken(token: string): OperatorSpec {
  let remaining = token.trim();
  if (!remaining) {
    return {
      rawName: '',
      charName: undefined,
      eliteLevel: undefined,
      isTired: false,
      showEliteLevel: false,
      charId: undefined,
      error: '空输入',
    };
  }

  // 1. 检查末尾的 !
  let isTired = false;
  if (remaining.endsWith('!')) {
    isTired = true;
    remaining = remaining.slice(0, -1);
  }

  // 2. 检查末尾的数字 (0/1/2)
  let eliteLevel: number | undefined;
  let showEliteLevel = false;
  const lastChar = remaining.charAt(remaining.length - 1);
  if (lastChar === '0' || lastChar === '1' || lastChar === '2') {
    eliteLevel = parseInt(lastChar);
    showEliteLevel = true;
    remaining = remaining.slice(0, -1);
  }

  const rawName = remaining.trim();
  if (!rawName) {
    return {
      rawName: '',
      charName: undefined,
      eliteLevel,
      isTired,
      showEliteLevel,
      charId: undefined,
      error: '干员名称为空',
    };
  }

  // 3. 查找干员
  const charId = getCharIdByName(rawName);
  if (charId === undefined) {
    return {
      rawName,
      charName: undefined,
      eliteLevel,
      isTired,
      showEliteLevel,
      charId: undefined,
      error: `未找到干员 "${rawName}"`,
    };
  }

  return {
    rawName,
    charName: getCharName(charId) ?? rawName,
    eliteLevel,
    isTired,
    showEliteLevel,
    charId,
    error: undefined,
  };
}

function parseInput(text: string): OperatorSpec[] {
  return text
    .split(/[\s]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map(parseToken);
}

// ─── 输入状态 ───────────────────────────────────────────────

const inputText = ref<string>('');
const combinedBlobUrl = ref<string | undefined>(undefined);
const isGenerating = ref<boolean>(false);
const isCopying = ref<boolean>(false);

const operatorSpecs = computed<OperatorSpec[]>(() => parseInput(inputText.value));

// ─── 显示开关 ───────────────────────────────────────────────

const spacing = ref<number>(0);
const showEdgePadding = ref<boolean>(false);
const showBackground = ref<boolean>(true);
const showProfession = ref<boolean>(true);
const showRarity = ref<boolean>(true);
const showEliteLevelGlobal = ref<boolean>(true);

// ─── 合成渲染状态用于 watch ─────────────────────────────────

const generationInput = computed(() => ({
  operatorSpecs: operatorSpecs.value,
  spacing: spacing.value,
  edgePadding: showEdgePadding.value,
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
  background: HTMLImageElement;
  avatar: HTMLImageElement;
  profession: HTMLImageElement | undefined;
  elite: HTMLImageElement | undefined;
  rarity: HTMLImageElement | undefined;
}

async function loadImagesForOperator(operatorSpec: OperatorSpec): Promise<LoadedSlotImages | null> {
  const { charId, eliteLevel: inputEliteLevel, showEliteLevel } = operatorSpec;
  if (!charId) return null;

  const effectiveElite = inputEliteLevel ?? 0;

  const avatarUrl = getCharAvatarUrl(charId, effectiveElite);
  if (!avatarUrl) return null;

  const professionName = getCharProfessionName(charId);
  const rarity = getCharRarity(charId);

  const professionUrl = professionName
    ? getPrtsWikiMediaUrl(`图标_职业_${professionName}.png`)
    : undefined;

  const eliteIconUrl = showEliteLevel
    ? `https://torappu.prts.wiki/assets/elite_icon/elite_${effectiveElite}_large.png`
    : undefined;

  const rarityUrl =
    rarity !== undefined
      ? `https://torappu.prts.wiki/assets/rarity_icon/rarity_yellow_${rarity}.png`
      : undefined;

  const [background, avatar] = await Promise.all([loadImage(backgroundSrc), loadImage(avatarUrl)]);

  const [profession, elite, rarityImg] = await Promise.all([
    professionUrl ? loadImage(professionUrl) : Promise.resolve(undefined),
    eliteIconUrl ? loadImage(eliteIconUrl) : Promise.resolve(undefined),
    rarityUrl ? loadImage(rarityUrl) : Promise.resolve(undefined),
  ]);

  return { background, avatar, profession, elite, rarity: rarityImg };
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
  const size = CANVAS_SIZE;

  // 1. 底图
  if (drawOptions.showBackground) {
    ctx.drawImage(images.background, x, 0, size, size);
  }

  // 2. 头像
  ctx.drawImage(images.avatar, x, 0, size, size);

  // 3. 注意力涣散蒙层（位于头像上方、角标下方）
  if (operatorSpec.isTired) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(x, 0, size, size);
  }

  // 4. 职业角标（左上 25%）
  if (drawOptions.showProfession && images.profession) {
    const profSize = Math.round(size * 0.25);
    ctx.drawImage(images.profession, x, 0, profSize, profSize);
  }

  // 5. 精英化角标（左下 35% 宽）
  if (drawOptions.showEliteLevel && operatorSpec.showEliteLevel && images.elite) {
    const eliteImg = images.elite;
    const eliteWidth = Math.round(size * 0.35);
    const eliteHeight = Math.round(eliteWidth * (eliteImg.naturalHeight / eliteImg.naturalWidth));
    ctx.drawImage(eliteImg, x, size - eliteHeight, eliteWidth, eliteHeight);
  }

  // 6. 稀有度角标（右下 18% 高）
  if (drawOptions.showRarity && images.rarity) {
    const rarityImg = images.rarity;
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
  const nameText = operatorSpec.charName ?? operatorSpec.rawName;
  if (nameText) {
    const nameY = CANVAS_SIZE + NAME_GAP;

    // 绘制白色背景矩形
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, nameY, size, NAME_RECT_HEIGHT);

    // 计算合适的字号
    const fontSize = fitFontSize(ctx, nameText, MAX_FONT_SIZE, MAX_TEXT_WIDTH);

    // 绘制文字（居中）
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${fontSize}px "HarmonyOS Sans SC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nameText, x + size / 2, nameY + NAME_RECT_HEIGHT / 2);
  }
}

async function generateAll(): Promise<void> {
  if (isGenerating.value) return;
  isGenerating.value = true;

  try {
    const validOperatorSpecs = operatorSpecs.value.filter((s) => s.charId !== undefined);
    if (validOperatorSpecs.length === 0) {
      // 无有效干员时清除预览
      if (combinedBlobUrl.value) {
        URL.revokeObjectURL(combinedBlobUrl.value);
        combinedBlobUrl.value = undefined;
      }
      return;
    }

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
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
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

    // 先生成新 blob URL，再原子替换，避免闪烁
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob) {
      const newUrl = URL.createObjectURL(blob);
      const oldUrl = combinedBlobUrl.value;
      combinedBlobUrl.value = newUrl;
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }
    }
  } catch (error) {
    console.error('Failed to generate avatars:', error);
  } finally {
    isGenerating.value = false;
  }
}

// ─── 复制到剪贴板 ───────────────────────────────────────────

async function copyToClipboard(): Promise<void> {
  if (isCopying.value || !combinedBlobUrl.value) return;

  const { initToast, updateProgress, completeToast, failToast } = useToastWithProgress();

  try {
    isCopying.value = true;
    initToast({ title: '复制到剪贴板', description: '正在获取图片…' });

    updateProgress(0.3, { description: '正在获取图片…' });
    const blob = await fetch(combinedBlobUrl.value).then((res) => res.blob());

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

// ─── 监听变化自动重绘 ─────────────────────────────────────

watchThrottled(
  generationInput,
  () => {
    generateAll();
  },
  { throttle: 300, deep: true },
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
              class="flex w-full items-center justify-center overflow-hidden rounded-2xl shadow-lg ring-1 ring-default"
              style="height: 280px"
            >
              <img
                v-if="combinedBlobUrl"
                :alt="'干员头像合并图'"
                class="block h-full w-auto max-w-full object-contain"
                :src="combinedBlobUrl"
              />
              <UIcon
                v-else-if="isGenerating"
                class="size-6 animate-spin text-toned"
                name="i-lucide-loader-circle"
              />
            </div>

            <UButton
              :disabled="!combinedBlobUrl || isCopying"
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

              <!-- 解析错误 -->
              <div
                v-for="(operatorSpec, i) in operatorSpecs.filter((s) => s.error)"
                :key="`err-${i}`"
                class="flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-3 py-1.5 text-sm text-error"
              >
                <UIcon class="size-3.5 shrink-0" name="i-lucide-triangle-alert" />
                <span>{{ operatorSpec.error }}</span>
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
                    v-for="(operatorSpec, i) in operatorSpecs.filter((s) => s.charId)"
                    :key="i"
                    color="neutral"
                    size="sm"
                    variant="soft"
                  >
                    {{ operatorSpec.rawName }}
                    <template v-if="operatorSpec.showEliteLevel">
                      · 精英{{ operatorSpec.eliteLevel }}</template
                    >
                    <template v-if="operatorSpec.isTired"> · 涣散</template>
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
