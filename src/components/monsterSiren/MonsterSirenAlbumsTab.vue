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

    <MonsterSirenAlbumHero
      :album="props.selectedAlbum"
      :album-detail="currentAlbumDetail"
      :is-loading-album-detail="props.isLoadingAlbumDetail"
      :song-count="props.albumSongCount.get(props.selectedAlbumCid) ?? 0"
      :songs="props.songs"
      @play="
        () => {
          if (props.selectedAlbumSongs.length > 0) {
            props.onPlaySong(props.selectedAlbumSongs[0]!, props.selectedAlbumSongs, 0);
          }
        }
      "
      @preview-cover="props.onPreviewCover(props.selectedAlbum.coverUrl, props.selectedAlbum.name)"
    />

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
      <div v-for="album in props.albums" :key="album.cid">
        <MonsterSirenAlbumCard
          :album="album"
          :song-count="props.albumSongCount.get(album.cid) ?? 0"
          @click="props.onOpenAlbumDetail(album.cid)"
          @play="
            props.onPlaySong(
              props.songs.find((s) => s.albumCid === album.cid)!,
              props.songs.filter((s) => s.albumCid === album.cid),
              0,
            )
          "
        />
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
