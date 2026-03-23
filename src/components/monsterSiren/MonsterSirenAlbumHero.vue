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
}>();
</script>

<template>
  <div
    class="dark group/album-header relative mb-6 overflow-hidden rounded-2xl shadow-xl transition-all duration-700 hover:shadow-2xl"
  >
    <div class="absolute inset-0">
      <img
        :alt="props.album.name"
        class="h-full w-full scale-110 object-cover transition-transform duration-700 group-hover/album-header:scale-105"
        referrerpolicy="no-referrer"
        :src="props.albumDetail?.coverDeUrl || props.album.coverUrl"
      />
    </div>

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

    <div
      class="absolute inset-0 transition-opacity duration-700 group-hover/album-header:opacity-0 md:bg-linear-to-r md:from-black/50 md:via-transparent md:to-transparent"
    />

    <div class="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end">
      <div class="group/album-cover relative h-36 w-36 shrink-0 sm:h-44 sm:w-44">
        <img
          :alt="props.album.name"
          class="h-full w-full cursor-zoom-in rounded-2xl object-cover shadow-xl ring-2 ring-white/20 transition-all duration-300 group-hover/album-cover:scale-105 group-hover/album-cover:ring-white/40"
          referrerpolicy="no-referrer"
          :src="props.album.coverUrl"
          @click="emit('previewCover')"
        />
        <div
          class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 opacity-0 transition-opacity group-hover/album-cover:opacity-100"
        >
          <UIcon class="text-2xl text-white" name="i-lucide-zoom-in" />
        </div>
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-2 text-default">
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

        <h2 class="mbs-2 text-2xl font-bold text-highlighted sm:text-4xl">
          {{ props.album.name }}
        </h2>

        <p class="text-sm text-white/80">
          {{ (props.albumDetail?.artistes ?? props.album.artistes).join(' / ') }}
        </p>

        <p class="text-xs text-white/60">
          {{ props.songCount }} 首曲目
          <span class="mx-1.5 opacity-40">·</span>
          CID: {{ props.album.cid }}
        </p>

        <div class="mt-1 flex flex-wrap gap-2">
          <UButton class="light" icon="i-lucide-play" size="sm" @click="emit('play')">
            播放全部
          </UButton>
        </div>
      </div>
    </div>

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
