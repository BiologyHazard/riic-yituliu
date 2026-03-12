<script setup lang="ts">
import { useImagePreview } from '@/composables/useImagePreview';

const {
  preview,
  scale,
  imgStyle,
  open,
  close,
  zoomIn,
  zoomOut,
  resetZoom,
  onWheel,
  onMousedown,
  onMousemove,
  onMouseup,
  onKeydown,
  download,
} = useImagePreview();

defineExpose({ open });
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="preview"
        class="fixed inset-0 z-50 flex flex-col bg-black/92 outline-none"
        tabindex="0"
        @keydown="onKeydown"
        @mouseleave="onMouseup"
        @mousemove="onMousemove"
        @mouseup="onMouseup"
      >
        <!-- 顶部工具栏 -->
        <div class="flex shrink-0 items-center justify-between gap-4 bg-black/40 px-4 py-2">
          <p class="truncate text-sm text-white/70">{{ preview.name }}</p>
          <ULink
            v-if="preview.downloadName"
            class="text-sm text-white/70 hover:text-white"
            :download="preview.downloadName"
            :href="preview.url"
            >下载原图</ULink
          >
          <div class="flex shrink-0 items-center gap-1">
            <UTooltip text="缩小 (-)">
              <UButton
                class="text-white hover:bg-white/15"
                color="neutral"
                icon="i-lucide-zoom-out"
                variant="ghost"
                @click="zoomOut"
              />
            </UTooltip>
            <UButton
              class="min-w-16 text-sm text-white hover:bg-white/15"
              color="neutral"
              variant="ghost"
              @click="resetZoom"
            >
              {{ Math.round(scale * 100) }}%
            </UButton>
            <UTooltip text="放大 (+)">
              <UButton
                class="text-white hover:bg-white/15"
                color="neutral"
                icon="i-lucide-zoom-in"
                variant="ghost"
                @click="zoomIn"
              />
            </UTooltip>
            <div class="mx-1 h-5 w-px bg-white/20" />
            <UTooltip text="下载">
              <UButton
                class="text-white hover:bg-white/15"
                color="neutral"
                icon="i-lucide-download"
                variant="ghost"
                @click="download"
              />
            </UTooltip>
            <UTooltip text="关闭 (Esc)">
              <UButton
                class="text-white hover:bg-white/15"
                color="neutral"
                icon="i-lucide-x"
                variant="ghost"
                @click="close"
              />
            </UTooltip>
          </div>
        </div>

        <!-- 图片展示区 -->
        <div
          class="relative flex flex-1 items-center justify-center overflow-hidden select-none"
          @click.self="close"
          @wheel.prevent="onWheel"
        >
          <img
            :alt="preview.name"
            class="max-h-full max-w-full object-contain"
            draggable="false"
            referrerpolicy="no-referrer"
            :src="preview.url"
            :style="imgStyle"
            @mousedown="onMousedown"
          />
        </div>

        <!-- 底部提示 -->
        <div class="shrink-0 py-2 text-center text-xs text-white/30">
          滚轮缩放 · 拖拽移动 · 单击百分比重置 · 点击背景或 Esc 关闭
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
