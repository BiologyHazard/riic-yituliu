<script setup lang="ts">
import type { Album, AlbumDetail, Song } from '@/types/monsterSiren';

const props = defineProps<{
  albums: Album[];
  songs: Song[];
  selectedAlbumCid: string | null;
  selectedAlbum: Album | null;
  selectedAlbumSongs: Song[];
  currentAlbumDetail: AlbumDetail | null;
  isLoadingAlbumDetail: boolean;
  albumSongCount: Map<string, number>;
  albumMap: Map<string, Album>;
  isPlaying: boolean;
  loadingDetailCids: Set<string>;
  isCurrentSong: (cid: string) => boolean;
  onBackToAlbums: () => void;
  onOpenAlbumDetail: (cid: string) => void;
  onPlaySong: (song: Song, playlist: Song[], index: number) => void;
  onDownloadSong: (song: Song) => void;
  onPreviewCover: (url: string, name: string) => void;
}>();
</script>

<template>
  <template v-if="props.selectedAlbumCid && props.selectedAlbum">
    <div class="mb-4">
      <UButton icon="i-lucide-arrow-left" variant="ghost" @click="props.onBackToAlbums">
        返回专辑列表
      </UButton>
    </div>

    <div
      class="dark group/album-header relative mb-6 overflow-hidden rounded-2xl shadow-xl transition-all duration-700 hover:shadow-2xl"
    >
      <div class="absolute inset-0">
        <img
          :alt="props.selectedAlbum.name"
          class="h-full w-full scale-110 object-cover transition-transform duration-700 group-hover/album-header:scale-105"
          referrerpolicy="no-referrer"
          :src="props.currentAlbumDetail?.coverDeUrl || props.selectedAlbum.coverUrl"
        />
      </div>

      <div
        class="absolute inset-0 transition-opacity duration-700 group-hover/album-header:opacity-80 md:mask-[linear-gradient(to_right,black_40%,transparent_90%)]"
      >
        <img
          :alt="props.selectedAlbum.name"
          class="h-full w-full scale-110 object-cover blur-md brightness-40 saturate-60 transition-transform duration-700 group-hover/album-header:scale-115"
          referrerpolicy="no-referrer"
          :src="props.currentAlbumDetail?.coverDeUrl || props.selectedAlbum.coverUrl"
        />
      </div>

      <div
        class="absolute inset-0 transition-opacity duration-700 group-hover/album-header:opacity-0 md:bg-linear-to-r md:from-black/50 md:via-transparent md:to-transparent"
      />

      <div class="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end">
        <div class="group/album-cover relative h-36 w-36 shrink-0 sm:h-44 sm:w-44">
          <img
            :alt="props.selectedAlbum.name"
            class="h-full w-full cursor-zoom-in rounded-2xl object-cover shadow-xl ring-2 ring-white/20 transition-all duration-300 group-hover/album-cover:scale-105 group-hover/album-cover:ring-white/40"
            referrerpolicy="no-referrer"
            :src="props.selectedAlbum.coverUrl"
            @click="props.onPreviewCover(props.selectedAlbum.coverUrl, props.selectedAlbum.name)"
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
              v-if="props.currentAlbumDetail?.belong"
              class="rounded-full bg-inverted/20 px-2.5 py-0.5 text-default backdrop-blur-sm"
            >
              <UIcon class="text-white/70" name="i-lucide-tag" />
              {{ props.currentAlbumDetail.belong }}
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
            {{ props.selectedAlbum.name }}
          </h2>

          <p class="text-sm text-white/80">
            {{ (props.currentAlbumDetail?.artistes ?? props.selectedAlbum.artistes).join(' / ') }}
          </p>

          <p class="text-xs text-white/60">
            {{ props.albumSongCount.get(props.selectedAlbumCid) ?? 0 }} 首曲目
            <span class="mx-1.5 opacity-40">·</span>
            CID: {{ props.selectedAlbumCid }}
          </p>

          <div class="mt-1 flex flex-wrap gap-2">
            <UButton
              class="light"
              icon="i-lucide-play"
              size="sm"
              @click="
                props.selectedAlbumSongs.length > 0 &&
                props.onPlaySong(props.selectedAlbumSongs[0]!, props.selectedAlbumSongs, 0)
              "
            >
              播放全部
            </UButton>
          </div>
        </div>
      </div>

      <Transition name="album-detail-fade">
        <div
          v-if="props.currentAlbumDetail?.intro"
          class="relative bg-black/25 px-6 py-4 backdrop-blur-sm transition-all duration-700 group-hover/album-header:bg-black/50 group-hover/album-header:backdrop-blur-md"
        >
          <div
            class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white/60 uppercase"
          >
            <UIcon name="i-lucide-book-open" />
            <span>专辑简介</span>
          </div>
          <p class="text-sm leading-relaxed text-white/80">
            {{ props.currentAlbumDetail.intro }}
          </p>
        </div>
      </Transition>
    </div>

    <div class="divide-y divide-default overflow-hidden rounded-xl border">
      <div
        class="hidden grid-cols-[2rem_2.5rem_1fr_1fr_3rem] items-center gap-4 bg-muted/50 px-4 py-2 text-xs font-medium text-gray-500 lg:grid"
      >
        <span class="text-center">#</span>
        <span />
        <span>曲名</span>
        <span>专辑</span>
        <span class="text-right">操作</span>
      </div>

      <div
        v-for="(song, idx) in props.selectedAlbumSongs"
        :key="song.cid"
        class="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted lg:grid lg:grid-cols-[2rem_2.5rem_1fr_1fr_3rem]"
        :class="{ 'bg-primary/10': props.isCurrentSong(song.cid) }"
        @click="props.onPlaySong(song, props.selectedAlbumSongs, idx)"
      >
        <div class="w-5 shrink-0 text-center">
          <template v-if="!props.isCurrentSong(song.cid)">
            <span class="text-sm text-muted tabular-nums group-hover:hidden">
              {{ idx + 1 }}
            </span>
            <UButton
              class="hidden text-muted group-hover:inline-block"
              color="neutral"
              icon="i-lucide-play"
              size="xs"
              variant="ghost"
            />
          </template>
          <template v-else>
            <UButton
              class="group-hover:hidden"
              :icon="props.isPlaying ? 'i-lucide-volume-2' : 'i-lucide-play'"
              size="xs"
              variant="ghost"
            />
            <UButton
              class="hidden group-hover:inline-block"
              :icon="props.isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
              size="xs"
              variant="ghost"
            />
          </template>
        </div>

        <div class="relative h-10 w-10 shrink-0">
          <img
            v-if="props.albumMap.get(song.albumCid)"
            :alt="props.albumMap.get(song.albumCid)!.name"
            class="h-full w-full cursor-zoom-in rounded-md object-cover shadow-sm"
            loading="lazy"
            referrerpolicy="no-referrer"
            :src="props.albumMap.get(song.albumCid)!.coverUrl"
            @click.stop="
              props.onPreviewCover(
                props.albumMap.get(song.albumCid)!.coverUrl,
                props.albumMap.get(song.albumCid)!.name,
              )
            "
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center rounded-md bg-muted text-gray-400"
          >
            <UIcon class="text-sm" name="i-lucide-disc" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <p
            class="truncate text-sm font-medium"
            :class="props.isCurrentSong(song.cid) ? 'text-primary' : 'text-highlighted'"
          >
            {{ song.name }}
          </p>
          <p class="truncate text-xs text-muted">
            {{ song.artists.join(' / ') }}
            <span class="mx-1 opacity-40">·</span>
            CID: {{ song.cid }}
          </p>
        </div>

        <div class="hidden min-w-0 lg:block">
          <p class="truncate text-sm text-muted">
            {{ props.albumMap.get(song.albumCid)?.name ?? song.albumCid }}
          </p>
          <p class="text-xs text-gray-400">{{ song.albumCid }}</p>
        </div>

        <div class="flex shrink-0 items-center justify-end">
          <UButton
            :class="{ 'animate-spin': props.loadingDetailCids.has(song.cid) }"
            :disabled="props.loadingDetailCids.has(song.cid)"
            :icon="
              props.loadingDetailCids.has(song.cid) ? 'i-lucide-loader-circle' : 'i-lucide-download'
            "
            size="xs"
            title="下载"
            variant="ghost"
            @click.stop="props.onDownloadSong(song)"
          />
        </div>
      </div>

      <div v-if="props.selectedAlbumSongs.length === 0" class="py-8 text-center text-gray-400">
        <p>该专辑暂无曲目</p>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      <div
        v-for="album in props.albums"
        :key="album.cid"
        class="group cursor-pointer rounded-2xl p-3 transition-all hover:bg-muted hover:shadow-md"
        @click="props.onOpenAlbumDetail(album.cid)"
      >
        <div class="relative mb-3 overflow-hidden rounded-xl shadow-md">
          <img
            :alt="album.name"
            class="aspect-square w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
            referrerpolicy="no-referrer"
            :src="album.coverUrl"
          />
          <div
            class="absolute inset-0 flex items-end justify-end gap-3 bg-black/40 p-3 opacity-0 backdrop-blur-[2px] transition-all group-hover:opacity-100"
          >
            <UButton
              class="light rounded-full shadow-sm"
              color="neutral"
              icon="i-lucide-play"
              size="md"
              variant="soft"
              @click.stop="
                props.onPlaySong(
                  props.songs.find((s) => s.albumCid === album.cid)!,
                  props.songs.filter((s) => s.albumCid === album.cid),
                  0,
                )
              "
            />
            <UButton
              class="light cursor-zoom-in rounded-full shadow-sm"
              color="neutral"
              icon="i-lucide-zoom-in"
              size="md"
              variant="soft"
              @click.stop="props.onPreviewCover(album.coverUrl, album.name)"
            />
          </div>
        </div>
        <p class="line-clamp-2 text-sm font-medium text-highlighted">{{ album.name }}</p>
        <p class="mt-0.5 truncate text-xs text-muted">
          {{ props.albumSongCount.get(album.cid) ?? 0 }} 首
          <span class="mx-1 opacity-40">·</span>
          {{ album.artistes.join(' / ') }}
        </p>
      </div>
    </div>
  </template>
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
