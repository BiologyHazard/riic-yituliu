<script setup lang="ts">
import type { Album, AlbumDetail } from '@/types/monsterSiren';

const props = defineProps<{
  album: Album;
  albumDetail: AlbumDetail | null;
  isLoadingAlbumDetail: boolean;
  songCount: number;
}>();

const emit = defineEmits<{
  play: [];
  previewCover: [];
  previewCoverDe: [];
}>();
</script>

<template>
  <div
    class="dark group/album-header relative mb-6 overflow-hidden rounded-2xl shadow-xl transition-all duration-700 hover:shadow-2xl"
  >
    <!-- 背景层：显示专辑封面，增强视觉沉浸感 -->
    <div class="absolute inset-0">
      <img
        :alt="props.album.name"
        class="h-full w-full scale-110 object-cover transition-transform duration-700 group-hover/album-header:scale-105"
        referrerpolicy="no-referrer"
        :src="props.albumDetail?.coverDeUrl || props.album.coverUrl"
      />
    </div>

    <!-- 模糊遮罩层：提供毛玻璃效果，提升文字可读性 -->
    <div
      class="absolute inset-0 transition-opacity duration-700 group-hover/album-header:opacity-80 md:mask-[linear-gradient(to_right,black_40%,transparent_90%)]"
    >
      <img
        :alt="props.album.name"
        class="h-full w-full scale-110 object-cover blur-md brightness-40 saturate-60 transition-transform duration-700 group-hover/album-header:scale-115"
        referrerpolicy="no-referrer"
        :src="props.albumDetail?.coverDeUrl || props.album.coverUrl"
      />
    </div>

    <!-- 渐变叠加：用于在不同屏幕尺寸下调整对比度 -->
    <div
      class="absolute inset-0 transition-opacity duration-700 group-hover/album-header:opacity-0 md:bg-linear-to-r md:from-black/50 md:via-transparent md:to-transparent"
    />

    <div class="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end">
      <!-- 专辑封面预览：点击可触发大图预览 -->
      <ImagePreviewContainer
        class="h-36 w-36 shrink-0 rounded-2xl shadow-xl ring-2 ring-white/20 hover:ring-white/40 sm:h-44 sm:w-44"
        @click="emit('previewCover')"
      >
        <img
          :alt="props.album.name"
          class="h-full w-full object-cover"
          referrerpolicy="no-referrer"
          :src="props.album.coverUrl"
        />
      </ImagePreviewContainer>

      <!-- 专辑信息详情区域 -->
      <div class="flex min-w-0 flex-1 flex-col gap-2 text-default">
        <!-- 标签展示：包含专辑类别、归属及加载状态 -->
        <div class="flex flex-wrap items-center gap-2">
          <UBadge class="rounded-full bg-inverted/20 px-2.5 py-0.5 text-default backdrop-blur-sm"
            >专辑</UBadge
          >
          <UBadge
            v-if="props.albumDetail?.belong"
            class="rounded-full bg-inverted/20 px-2.5 py-0.5 text-default backdrop-blur-sm"
          >
            <UIcon class="text-white/70" name="i-lucide-tag" />
            {{ props.albumDetail.belong }}
          </UBadge>
          <UBadge
            v-if="props.isLoadingAlbumDetail"
            class="rounded-full bg-inverted/20 px-2.5 py-0.5 text-default backdrop-blur-sm"
          >
            <UIcon class="animate-spin text-white/70" name="i-lucide-loader-circle" />
            加载详情中
          </UBadge>
        </div>

        <!-- 专辑标题 -->
        <h2 class="mbs-2 text-2xl font-bold text-highlighted sm:text-4xl">
          {{ props.album.name }}
        </h2>

        <!-- 艺术家列表 -->
        <p class="text-sm text-white/80">
          {{ props.album.artistes.join(' / ') }}
        </p>

        <!-- 曲目统计与 CID 信息 -->
        <p class="text-xs text-white/60">
          {{ props.songCount }} 首曲目
          <span class="mx-1.5 opacity-40">·</span>
          CID: {{ props.album.cid }}
        </p>

        <!-- 操作按钮：一键播放全部曲目 -->
        <div class="mt-1 flex flex-wrap gap-2">
          <UButton class="light" icon="i-lucide-play" size="sm" @click="emit('play')">
            播放全部
          </UButton>
        </div>
      </div>

      <!-- 大图预览按钮：在专辑信息区域提供入口 -->
      <UButton
        class="light absolute right-6 bottom-6 cursor-zoom-in opacity-75"
        color="neutral"
        icon="i-lucide-zoom-in"
        variant="soft"
        @click="emit('previewCoverDe')"
      />
    </div>

    <!-- 专辑简介：支持动态展开的过渡效果 -->
    <Transition name="album-detail-fade">
      <div
        v-if="props.albumDetail?.intro"
        class="relative bg-black/25 px-6 py-4 backdrop-blur-sm transition-all duration-700 group-hover/album-header:bg-black/50 group-hover/album-header:backdrop-blur-md"
      >
        <div
          class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white/60 uppercase"
        >
          <UIcon name="i-lucide-book-open" />
          <span>专辑简介</span>
        </div>
        <p class="text-sm leading-relaxed text-white/80">
          {{ props.albumDetail.intro }}
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.album-detail-fade-enter-active,
.album-detail-fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.album-detail-fade-enter-from,
.album-detail-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
