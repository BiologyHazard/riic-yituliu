<script setup lang="ts">
import { useToastWithProgress } from '@/composables/useToastWithProgress';
import { downloadFile } from '@/utils/file';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

const CANVAS_BASE_SIZE = 512;

const canvasRef = ref<HTMLCanvasElement | null>(null);
const number = ref<number>(1);
const bgColor = ref<string>('#299DFF');
const textColor = ref<string>('#FFFFFF');
const isExporting = ref<boolean>(false);

// 导出设置
const exportFormat = ref<string>('png');
const exportQuality = ref<number>(75);
const exportPixelRatio = ref<number>(1);

const isQualityEnabled = computed<boolean>(
  () => exportFormat.value === 'webp' || exportFormat.value === 'jpeg',
);

const mimeTypeMap: Record<string, string> = {
  webp: 'image/webp',
  png: 'image/png',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
};

const fileExtensionMap: Record<string, string> = {
  webp: 'webp',
  png: 'png',
  jpeg: 'jpg',
  svg: 'svg',
};

const bgPresets = [
  '#299DFF',
  '#FF6B6C',
  '#4ECDC4',
  '#FFE66D',
  '#1A1A2E',
  '#E8E8E8',
  '#2D3436',
  '#A29BFE',
  '#00B894',
  '#E17055',
];

const textPresets = ['#FFFFFF', '#000000', '#FFD93D', '#F8F9FA', '#212529'];

async function ensureOutfitLoaded(): Promise<void> {
  // 等待 Outfit 字体（字重 900）就绪，避免 Canvas 首次绘制时字体未加载
  await document.fonts.load('900 1px Outfit');
}

async function drawAvatar(): Promise<void> {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  await ensureOutfitLoaded();

  const size = canvas.width;

  // 背景
  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, size, size);

  // 数字 — 字体更大，位置稍偏下
  ctx.fillStyle = textColor.value;
  ctx.font = `900 ${Math.round(size * 0.8)}px Outfit`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number.value), size / 2, Math.round(size * 0.54));
}

function drawToCanvas(canvas: HTMLCanvasElement, size: number): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = textColor.value;
  ctx.font = `900 ${Math.round(size * 0.8)}px Outfit`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number.value), size / 2, Math.round(size * 0.54));
}

function generateSvgDataUrl(): string {
  const size = CANVAS_BASE_SIZE;
  const y = Math.round(size * 0.54);
  const fontSize = Math.round(size * 0.8);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bgColor.value}"/>
  <text x="${size / 2}" y="${y}" font-family="Outfit" font-weight="900" font-size="${fontSize}" fill="${textColor.value}" text-anchor="middle" dominant-baseline="central">${number.value}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function exportImage(): Promise<void> {
  if (isExporting.value) return;
  isExporting.value = true;

  const { initToast, updateProgress, completeToast, failToast } = useToastWithProgress();
  initToast({ title: '导出头像图片', description: '正在准备…' });
  await nextTick();

  try {
    const timestamp = new Date().getTime();
    const ext = fileExtensionMap[exportFormat.value];

    if (exportFormat.value === 'svg') {
      updateProgress(0.5, { description: '正在生成 SVG…' });
      const dataUrl = generateSvgDataUrl();
      updateProgress(0.8, { description: '正在下载…' });
      await downloadFile(dataUrl, `studio-avatar-${number.value}-${timestamp}.${ext}`);
    } else {
      // 位图：按 pixelRatio 创建离屏 Canvas 绘制并导出
      updateProgress(0.3, { description: '正在生成图片…' });
      await ensureOutfitLoaded();
      const exportSize = Math.round(CANVAS_BASE_SIZE * exportPixelRatio.value);
      const offscreen = document.createElement('canvas');
      offscreen.width = exportSize;
      offscreen.height = exportSize;
      drawToCanvas(offscreen, exportSize);

      updateProgress(0.6, { description: '正在编码…' });
      const quality = exportFormat.value !== 'png' ? exportQuality.value / 100 : undefined;
      const blob = await new Promise<Blob | null>((resolve) =>
        offscreen.toBlob(resolve, mimeTypeMap[exportFormat.value], quality),
      );
      if (!blob) throw new Error('Failed to create image blob');

      updateProgress(0.8, { description: '正在下载…' });
      await downloadFile(blob, `studio-avatar-${number.value}-${timestamp}.${ext}`);
    }

    completeToast({ title: '导出完成', description: '头像图片已成功导出！' });
  } catch (error) {
    console.error('Failed to export image:', error);
    failToast({
      title: '导出失败',
      description: error instanceof Error ? error.message : '导出失败，请重试',
    });
  } finally {
    isExporting.value = false;
  }
}

watch([number, bgColor, textColor], () => {
  nextTick(drawAvatar);
});

onMounted(() => {
  nextTick(drawAvatar);
});
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="工作室头像生成器" />

      <UPageBody>
        <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
          <!-- 左侧：预览区 -->
          <div class="flex shrink-0 flex-col items-center gap-4">
            <div class="overflow-hidden rounded-2xl shadow-lg ring-1 ring-default">
              <canvas
                ref="canvasRef"
                class="block h-auto w-[280px] sm:w-[360px] lg:w-[400px]"
                :height="CANVAS_BASE_SIZE"
                :width="CANVAS_BASE_SIZE"
              />
            </div>

            <UFieldGroup class="w-full">
              <UButton
                class="flex-1 justify-center"
                :disabled="isExporting"
                icon="i-lucide-download"
                size="lg"
                variant="subtle"
                @click="exportImage"
              >
                保存图片
              </UButton>
              <UPopover
                :content="{
                  align: 'center',
                  side: 'bottom',
                  sideOffset: 8,
                }"
              >
                <UButton
                  :disabled="isExporting"
                  icon="i-lucide-settings-2"
                  size="lg"
                  title="调整导出格式、质量和大小"
                  variant="subtle"
                />

                <template #content>
                  <div class="flex flex-col gap-4 p-4" style="min-width: 240px">
                    <!-- 导出格式 -->
                    <UFormField label="导出格式">
                      <UTabs
                        v-model="exportFormat"
                        color="neutral"
                        :content="false"
                        :items="[
                          { label: 'PNG', value: 'png' },
                          { label: 'WebP', value: 'webp' },
                          { label: 'JPEG', value: 'jpeg' },
                          { label: 'SVG', value: 'svg' },
                        ]"
                        :ui="{ list: 'ring ring-accented ring-inset' }"
                        variant="pill"
                      />
                    </UFormField>

                    <!-- 图片质量 -->
                    <UFormField :hint="`${exportQuality}%`" label="图片质量">
                      <USlider
                        v-model="exportQuality"
                        :disabled="!isQualityEnabled"
                        :max="100"
                        :min="1"
                        :step="1"
                        tooltip
                      />
                    </UFormField>

                    <!-- 图片大小 -->
                    <UFormField label="图片大小">
                      <UTabs
                        v-model="exportPixelRatio"
                        color="neutral"
                        :content="false"
                        :items="[
                          { label: '0.5x', value: 0.5 },
                          { label: '1x', value: 1 },
                          { label: '2x', value: 2 },
                          { label: '3x', value: 3 },
                          { label: '4x', value: 4 },
                        ]"
                        :ui="{ list: 'ring ring-accented ring-inset' }"
                        variant="pill"
                      />
                    </UFormField>
                  </div>
                </template>
              </UPopover>
            </UFieldGroup>
          </div>

          <!-- 右侧：控制面板 -->
          <div class="flex min-w-0 flex-1 flex-col gap-6">
            <!-- 数字 -->
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-toned">数字</label>
              <UInputNumber v-model="number" class="w-full" :max="99" :min="0" size="lg" />
            </div>

            <!-- 背景颜色 -->
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-toned">背景颜色</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in bgPresets"
                  :key="color"
                  class="size-9 cursor-pointer rounded-full ring-1 ring-default transition-transform hover:scale-110"
                  :class="{ 'scale-110 ring-2! ring-primary': bgColor === color }"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  type="button"
                  @click="bgColor = color"
                />
                <!-- 自定义颜色 -->
                <label
                  class="size-9 cursor-pointer rounded-full ring-1 ring-default transition-transform hover:scale-110"
                  :class="{ 'scale-110 ring-2! ring-primary': !bgPresets.includes(bgColor) }"
                  title="自定义颜色"
                >
                  <span
                    class="flex size-full items-center justify-center rounded-full bg-muted text-toned"
                  >
                    <UIcon class="size-4" name="i-lucide-pipette" />
                  </span>
                  <input v-model="bgColor" class="sr-only" type="color" />
                </label>
              </div>
            </div>

            <!-- 数字颜色 -->
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-toned">数字颜色</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in textPresets"
                  :key="color"
                  class="size-9 cursor-pointer rounded-full ring-1 ring-default transition-transform hover:scale-110"
                  :class="{ 'scale-110 ring-2! ring-primary': textColor === color }"
                  :style="{ backgroundColor: color }"
                  :title="color"
                  type="button"
                  @click="textColor = color"
                />
                <label
                  class="size-9 cursor-pointer rounded-full ring-1 ring-default transition-transform hover:scale-110"
                  :class="{ 'scale-110 ring-2! ring-primary': !textPresets.includes(textColor) }"
                  title="自定义颜色"
                >
                  <span
                    class="flex size-full items-center justify-center rounded-full bg-muted text-toned"
                  >
                    <UIcon class="size-4" name="i-lucide-pipette" />
                  </span>
                  <input v-model="textColor" class="sr-only" type="color" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
