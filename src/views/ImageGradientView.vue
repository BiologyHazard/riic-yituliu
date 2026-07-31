<script setup lang="ts">
import { getCharArtUrl } from '@/utils/dataSources';
import { getCharIdByName, getCharMaxEliteLevel } from '@/utils/gameData/character';
import { computed, nextTick, ref, watch } from 'vue';

const PLACEHOLDER_SIZE = 512;

// ─── DOM refs ───────────────────────────────────────────────

const canvasRef = ref<HTMLCanvasElement | null>(null);

// ─── 图片来源 ───────────────────────────────────────────────

type SourceType = 'operator' | 'upload';
const sourceType = ref<SourceType>('operator');

// 干员
const operatorName = ref<string>('');
const eliteLevel = ref<number>(0);
const maxEliteLevel = ref<number>(2);
const operatorError = ref<string | undefined>(undefined);

// 上传
const uploadFileName = ref<string | undefined>(undefined);

// 当前加载的图片
const currentImage = ref<HTMLImageElement | null>(null);
const isImageLoading = ref<boolean>(false);
const imageError = ref<string | undefined>(undefined);

// ─── 渐变参数 ───────────────────────────────────────────────

const gradientStart = ref<number>(0); // x：完全透明位置 (%)
const gradientEnd = ref<number>(40); // y：完全不透明位置 (%)
const gradientAngle = ref<number>(90); // 渐变角度 (deg)

// ─── 复制状态 ───────────────────────────────────────────────

const isCopying = ref<boolean>(false);
const copySuccess = ref<boolean>(false);

// ─── 计算属性 ───────────────────────────────────────────────

const hasImage = computed<boolean>(() => currentImage.value !== null);

const startExceedsEnd = computed<boolean>(() => gradientStart.value > gradientEnd.value);

// ─── 干员查找 ───────────────────────────────────────────────

function resolveOperator(): void {
  operatorError.value = undefined;

  const name = operatorName.value.trim();
  if (!name) {
    return;
  }

  const charId = getCharIdByName(name);
  if (!charId) {
    operatorError.value = `未找到干员 "${name}"`;
    return;
  }

  const maxElite = getCharMaxEliteLevel(charId);
  if (maxElite !== undefined) {
    maxEliteLevel.value = maxElite;
    if (eliteLevel.value > maxElite) {
      eliteLevel.value = maxElite;
    }
  }

  const url = getCharArtUrl(charId, eliteLevel.value);
  if (!url) {
    operatorError.value = '无法获取立绘地址';
    return;
  }

  loadImageFromUrl(url);
}

function loadImageFromUrl(url: string): void {
  isImageLoading.value = true;
  imageError.value = undefined;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    currentImage.value = img;
    isImageLoading.value = false;
    drawCanvas();
  };
  img.onerror = () => {
    imageError.value = '加载图片失败，请检查网络或尝试其他来源';
    currentImage.value = null;
    isImageLoading.value = false;
  };
  img.src = url;
}

// ─── 文件上传 ───────────────────────────────────────────────

function handleFileSelect(files: FileList | File[]): void {
  const file = files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    imageError.value = '请选择图片文件';
    return;
  }

  uploadFileName.value = file.name;
  imageError.value = undefined;
  isImageLoading.value = true;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      currentImage.value = img;
      isImageLoading.value = false;
      drawCanvas();
    };
    img.onerror = () => {
      imageError.value = '图片解析失败';
      currentImage.value = null;
      isImageLoading.value = false;
    };
    img.src = e.target?.result as string;
  };
  reader.onerror = () => {
    imageError.value = '文件读取失败';
    isImageLoading.value = false;
  };
  reader.readAsDataURL(file);
}

// ─── 画布绘制 ───────────────────────────────────────────────

function drawCanvas(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 使用原图尺寸；无图片时使用占位尺寸
  const img = currentImage.value;
  const w = img ? img.naturalWidth : PLACEHOLDER_SIZE;
  const h = img ? img.naturalHeight : PLACEHOLDER_SIZE;
  canvas.width = w;
  canvas.height = h;

  ctx.clearRect(0, 0, w, h);

  if (!img) return;

  // 以原图尺寸绘制
  ctx.drawImage(img, 0, 0);

  // 应用渐变遮罩
  const rad = (gradientAngle.value - 90) * (Math.PI / 180);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const halfW = w / 2;
  const halfH = h / 2;
  const length = Math.abs(cos) * halfW + Math.abs(sin) * halfH;

  const x0 = halfW - cos * length;
  const y0 = halfH - sin * length;
  const x1 = halfW + cos * length;
  const y1 = halfH + sin * length;

  ctx.globalCompositeOperation = 'destination-in';
  const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
  gradient.addColorStop(gradientStart.value / 100, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(gradientEnd.value / 100, 'rgba(0, 0, 0, 1)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

// ─── 复制到剪贴板 ───────────────────────────────────────────

async function copyToClipboard(): Promise<void> {
  const canvas = canvasRef.value;
  if (!canvas || !currentImage.value) return;

  isCopying.value = true;
  copySuccess.value = false;

  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) {
      throw new Error('无法生成图片数据');
    }

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);

    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'SecurityError') {
      imageError.value = '图片存在跨域限制，无法复制。请尝试上传本地图片。';
    } else if (error instanceof Error) {
      imageError.value = `复制失败：${error.message}`;
    } else {
      imageError.value = '复制失败，请重试';
    }
  } finally {
    isCopying.value = false;
  }
}

// ─── 监听器 ─────────────────────────────────────────────────

watch([operatorName, eliteLevel], () => {
  if (sourceType.value === 'operator') {
    resolveOperator();
  }
});

watch(sourceType, (newType) => {
  currentImage.value = null;
  imageError.value = undefined;
  uploadFileName.value = undefined;

  if (newType === 'operator') {
    operatorName.value = '';
    operatorError.value = undefined;
  }

  drawCanvas();
});

watch([gradientStart, gradientEnd, gradientAngle], () => {
  if (currentImage.value) {
    nextTick(drawCanvas);
  }
});
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader description="为干员立绘或上传的图片添加渐变透明遮罩" title="图片渐变工具" />

      <UPageBody>
        <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
          <!-- 左侧：预览区 -->
          <div class="flex shrink-0 flex-col items-center gap-4">
            <div
              class="relative overflow-hidden rounded-2xl shadow-lg ring-1 ring-default"
              :class="{ 'opacity-50': isImageLoading }"
            >
              <canvas ref="canvasRef" class="block h-auto max-h-[70vh] w-70 sm:w-90 lg:w-100" />
              <!-- 加载中遮罩 -->
              <div
                v-if="isImageLoading"
                class="absolute inset-0 flex items-center justify-center bg-muted/50"
              >
                <UIcon class="size-8 animate-spin text-toned" name="i-lucide-loader-circle" />
              </div>
              <!-- 无图片占位 -->
              <div
                v-if="!currentImage && !isImageLoading"
                class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted"
              >
                <UIcon class="size-12 text-toned/40" name="i-lucide-image" />
                <span class="text-sm text-toned/60">选择干员或上传图片以预览</span>
              </div>
            </div>

            <!-- 错误提示 -->
            <UAlert
              v-if="imageError"
              class="w-full"
              color="error"
              :description="imageError"
              icon="i-lucide-triangle-alert"
              variant="subtle"
              @update:model-value="imageError = undefined"
            />

            <!-- 复制按钮 -->
            <UButton
              class="w-full justify-center"
              :color="copySuccess ? 'success' : 'primary'"
              :disabled="!hasImage || isCopying"
              :icon="copySuccess ? 'i-lucide-check' : 'i-lucide-copy'"
              :loading="isCopying"
              size="lg"
              @click="copyToClipboard"
            >
              {{ copySuccess ? '已复制' : '复制到剪贴板' }}
            </UButton>
          </div>

          <!-- 右侧：控制面板 -->
          <div class="flex min-w-0 flex-1 flex-col gap-6">
            <!-- 图片来源 -->
            <div class="flex flex-col gap-4">
              <label class="text-sm font-medium text-toned">图片来源</label>
              <UTabs
                v-model="sourceType"
                color="neutral"
                :content="false"
                :items="[
                  { label: '干员', value: 'operator' as const },
                  { label: '上传', value: 'upload' as const },
                ]"
                :ui="{ list: 'ring ring-accented ring-inset' }"
                variant="pill"
              />

              <!-- 干员选择 -->
              <template v-if="sourceType === 'operator'">
                <UFormField label="干员名称">
                  <UInput
                    v-model="operatorName"
                    class="w-full"
                    icon="i-lucide-search"
                    placeholder="输入干员名称，如「能天使」"
                    @keyup.enter="resolveOperator"
                  />
                </UFormField>
                <UAlert
                  v-if="operatorError"
                  color="error"
                  :description="operatorError"
                  icon="i-lucide-triangle-alert"
                  variant="subtle"
                />
                <UFormField label="精英化等级（立绘）">
                  <UTabs
                    v-model="eliteLevel"
                    color="neutral"
                    :content="false"
                    :items="[
                      { label: '初始', value: 0 },
                      { label: '精二', value: 2 },
                    ]"
                    :ui="{ list: 'ring ring-accented ring-inset' }"
                    variant="pill"
                  />
                </UFormField>
              </template>

              <!-- 文件上传 -->
              <template v-if="sourceType === 'upload'">
                <UFormField label="选择图片文件">
                  <div class="flex flex-col gap-3">
                    <label
                      class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-default p-8 text-toned transition-colors hover:border-primary hover:text-primary"
                    >
                      <UIcon class="size-10" name="i-lucide-upload" />
                      <span class="text-sm font-medium">点击选择图片</span>
                      <span class="text-xs text-toned/60">支持 PNG / JPEG / WebP 等格式</span>
                      <input
                        accept="image/*"
                        class="hidden"
                        type="file"
                        @change="handleFileSelect(($event.target as HTMLInputElement).files!)"
                      />
                    </label>
                    <div v-if="uploadFileName" class="flex items-center gap-2 text-sm text-toned">
                      <UIcon class="size-4 text-success" name="i-lucide-check-circle" />
                      {{ uploadFileName }}
                    </div>
                  </div>
                </UFormField>
              </template>
            </div>

            <!-- 渐变参数 -->
            <div class="flex flex-col gap-4">
              <label class="text-sm font-medium text-toned">渐变遮罩参数</label>

              <!-- 渐变起点 x -->
              <UFormField :hint="`${gradientStart}% — 此位置完全透明`" label="渐变起点 (x)">
                <USlider
                  v-model="gradientStart"
                  color="neutral"
                  :max="100"
                  :min="0"
                  :step="1"
                  tooltip
                />
              </UFormField>

              <!-- 渐变终点 y -->
              <UFormField :hint="`${gradientEnd}% — 此位置完全不透明`" label="渐变终点 (y)">
                <USlider
                  v-model="gradientEnd"
                  color="neutral"
                  :max="100"
                  :min="0"
                  :step="1"
                  tooltip
                />
              </UFormField>

              <UAlert
                v-if="startExceedsEnd"
                color="warning"
                description="起点大于终点，渐变将反向"
                icon="i-lucide-info"
                variant="subtle"
              />

              <!-- 渐变角度 -->
              <UFormField hint="渐变方向角度（0° = 从下到上）" label="渐变角度 (deg)">
                <UInputNumber
                  v-model="gradientAngle"
                  class="w-full"
                  :max="360"
                  :min="0"
                  size="lg"
                  :step="1"
                />
              </UFormField>
            </div>

            <!-- 说明卡片 -->
            <UCard variant="subtle">
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon class="size-4 text-toned" name="i-lucide-info" />
                  <span class="text-sm font-medium">使用说明</span>
                </div>
              </template>
              <ul class="m-0 list-inside list-disc space-y-1 ps-0 text-sm text-toned">
                <li>选择干员（初始或精二立绘）或上传本地图片</li>
                <li>调整起点 <strong>x</strong>：渐变从此位置开始（完全透明）</li>
                <li>调整终点 <strong>y</strong>：渐变到此位置结束（完全不透明）</li>
                <li>调整角度 <strong>deg</strong>：控制渐变方向</li>
                <li>点击「复制到剪贴板」即可粘贴使用</li>
              </ul>
            </UCard>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
