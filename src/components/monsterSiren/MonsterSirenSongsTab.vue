<script setup lang="ts">
import type { Album, Song, SongViewMode } from '@/types/monsterSiren';

import { computed, ref, watch } from 'vue';

const props = defineProps<{
  searchQuery: string;
  filteredSongs: Song[];
  songViewMode: SongViewMode;
  albumMap: Map<string, Album>;
  isPlaying: boolean;
  loadingDetailCids: Set<string>;
  isCurrentSong: (cid: string) => boolean;
}>();

const emit = defineEmits<{
  playSong: [song: Song, playlist: Song[], index: number];
  downloadSong: [song: Song];
  previewCover: [url: string, name: string];
}>();

const page = ref<number>(1);
const pageSize = 32;
const totalPages = computed(() => Math.ceil(props.filteredSongs.length / pageSize));

// 当搜索内容变化时重置页码
watch(
  () => props.searchQuery,
  () => {
    page.value = 1;
  },
);
</script>

<template>
  <p class="text-sm text-muted">
    <span v-if="props.searchQuery">
      找到 <strong class="text-default">{{ props.filteredSongs.length }}</strong> 首
    </span>
    <span v-else>
      共 <strong class="text-default">{{ props.filteredSongs.length }}</strong> 首乐曲
    </span>
    <span v-if="totalPages > 1" class="text-dimmed"> · 第 {{ page }} / {{ totalPages }} 页 </span>
  </p>

  <MonsterSirenSongList
    v-if="props.songViewMode === 'list'"
    v-model:page="page"
    :album-map="props.albumMap"
    :is-current-song="props.isCurrentSong"
    :is-playing="props.isPlaying"
    :loading-detail-cids="props.loadingDetailCids"
    :page-size="pageSize"
    :songs="props.filteredSongs"
    @download-song="(song) => emit('downloadSong', song)"
    @play-song="(song, playlist, index) => emit('playSong', song, playlist, index)"
    @preview-cover="(url, name) => emit('previewCover', url, name)"
  />

  <div
    v-else
    class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
  >
    <MonsterSirenSongCard
      v-for="(song, idx) in props.filteredSongs"
      :key="song.cid"
      :album="props.albumMap.get(song.albumCid)"
      :is-active="props.isCurrentSong(song.cid)"
      :is-loading="props.loadingDetailCids.has(song.cid)"
      :is-playing="props.isPlaying"
      :song
      @play="emit('playSong', song, props.filteredSongs, idx)"
    />
  </div>
</template>
