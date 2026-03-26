<script setup lang="ts">
import type { Album, Song, SongViewMode } from '@/types/monsterSiren';

const props = defineProps<{
  searchQuery: string;
  totalSongs: number;
  totalPages: number;
  currentPage: number;
  paginatedSongs: Song[];
  filteredSongs: Song[];
  pageSize: number;
  songViewMode: SongViewMode;
  albumMap: Map<string, Album>;
  isPlaying: boolean;
  loadingDetailCids: Set<string>;
  isCurrentSong: (cid: string) => boolean;
}>();

const emit = defineEmits<{
  'update:currentPage': [page: number];
  playSong: [song: Song, playlist: Song[], index: number];
  downloadSong: [song: Song];
  previewCover: [url: string, name: string];
}>();
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 text-sm text-muted">
      <span v-if="props.searchQuery">
        找到 <strong class="text-highlighted">{{ props.totalSongs }}</strong> 首
      </span>
      <span v-else>
        共 <strong class="text-highlighted">{{ props.totalSongs }}</strong> 首乐曲
      </span>
      <span v-if="props.totalPages > 1" class="opacity-60">
        · 第 {{ props.currentPage }} / {{ props.totalPages }} 页
      </span>
    </div>

    <MonsterSirenSongList
      v-if="props.songViewMode === 'list'"
      :album-map="props.albumMap"
      :is-current-song="props.isCurrentSong"
      :is-playing="props.isPlaying"
      :loading-detail-cids="props.loadingDetailCids"
      :songs="props.filteredSongs"
      @download-song="(song) => emit('downloadSong', song)"
      @play-song="(song, playlist, index) => emit('playSong', song, playlist, index)"
      @preview-cover="(url, name) => emit('previewCover', url, name)"
    />

    <div
      v-else
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      <div
        v-for="(song, idx) in props.paginatedSongs"
        :key="song.cid + '-grid'"
        class="group flex cursor-pointer flex-col gap-2 rounded-xl border border-transparent p-3 transition-all hover:bg-muted hover:shadow-md"
        :class="{ 'bg-primary/5 ring-1 ring-primary/20': props.isCurrentSong(song.cid) }"
        @click="
          emit(
            'playSong',
            song,
            props.filteredSongs,
            (props.currentPage - 1) * props.pageSize + idx,
          )
        "
      >
        <div class="relative aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-sm">
          <img
            v-if="props.albumMap.get(song.albumCid)"
            :alt="song.name"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            referrerpolicy="no-referrer"
            :src="props.albumMap.get(song.albumCid)!.coverUrl"
          />
          <div
            class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20"
          >
            <div
              class="flex scale-90 items-center justify-center rounded-full bg-primary p-2 text-white opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100"
            >
              <UIcon
                :name="
                  props.isCurrentSong(song.cid) && props.isPlaying
                    ? 'i-lucide-pause'
                    : 'i-lucide-play'
                "
                size="20"
              />
            </div>
          </div>
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-highlighted" :title="song.name">
            {{ song.name }}
          </p>
          <p class="truncate text-xs text-muted" :title="song.artists.join(' / ')">
            {{ song.artists.join(' / ') }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="props.totalPages > 1" class="flex justify-center pt-2">
      <UPagination
        :items-per-page="props.pageSize"
        :page="props.currentPage"
        :total="props.totalSongs"
        @update:page="(page) => emit('update:currentPage', page)"
      />
    </div>
  </div>
</template>
