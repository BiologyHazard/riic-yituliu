<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
const number = ref<number>(1);
const bgColor = ref<string>('#299DFF');
const textColor = ref<string>('#FFFFFF');

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

function drawAvatar(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = canvas.width;

  // 背景
  ctx.fillStyle = bgColor.value;
  ctx.fillRect(0, 0, size, size);

  // 数字
  ctx.fillStyle = textColor.value;
  ctx.font = `900 ${Math.round(size * 0.72)}px Outfit`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number.value), size / 2, size / 2);
}

function downloadImage(): void {
  const canvas = canvasRef.value;
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studio-avatar-${number.value}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

watch([number, bgColor, textColor], () => {
  nextTick(drawAvatar);
});

onMounted(() => {
  nextTick(drawAvatar);
});
</script>

<template>
  <div class="mx-auto max-w-screen-lg p-6">
    <h1 class="mb-6 text-2xl font-bold">工作室头像生成器</h1>

    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <!-- 左侧：预览区 -->
      <div class="flex shrink-0 flex-col items-center gap-4">
        <div class="overflow-hidden rounded-2xl shadow-lg ring-1 ring-default">
          <canvas
            ref="canvasRef"
            class="block h-auto w-[280px] sm:w-[360px] lg:w-[400px]"
            height="512"
            width="512"
          />
        </div>
        <UButton class="w-full" icon="i-lucide-download" size="lg" @click="downloadImage">
          保存图片
        </UButton>
      </div>

      <!-- 右侧：控制面板 -->
      <div class="flex min-w-0 flex-1 flex-col gap-6">
        <!-- 数字 -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-toned">数字</label>
          <UInputNumber v-model="number" class="w-full" :max="99" :min="1" size="lg" />
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
  </div>
</template>
