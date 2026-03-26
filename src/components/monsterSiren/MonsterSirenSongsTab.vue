<script setup lang="ts">
import type { Album, Song, SongViewMode } from '@/types/monsterSiren';

import { useInfiniteScroll } from '@vueuse/core';
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

// 增量加载逻辑（无限滚动）
const displayLimit = ref(64);
const displayingSongs = computed(() => props.filteredSongs.slice(0, displayLimit.value));

function onLoadMore() {
  displayLimit.value += 32;
}

function canLoadMore() {
  return displayLimit.value < props.filteredSongs.length;
}

// 监听窗口滚动
const {} = useInfiniteScroll(window, onLoadMore, { distance: 512, canLoadMore });

// 当搜索内容或过滤结果变化时重置加载上限
watch(
  () => props.searchQuery,
  () => {
    displayLimit.value = 64;
  },
);
</script>

<template>
  <p class="text-sm text-muted">
    <span v-if="props.searchQuery">
      找到 <strong class="text-default">{{ props.filteredSongs.length }}</strong> 首乐曲
    </span>
    <span v-else>
      共 <strong class="text-default">{{ props.filteredSongs.length }}</strong> 首乐曲
    </span>
  </p>

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
    <MonsterSirenSongCard
      v-for="(song, idx) in displayingSongs"
      :key="song.cid"
      :album="props.albumMap.get(song.albumCid)"
      :is-active="props.isCurrentSong(song.cid)"
      :is-loading="props.loadingDetailCids.has(song.cid)"
      :is-playing="props.isCurrentSong(song.cid) && props.isPlaying"
      :song
      @play="emit('playSong', song, props.filteredSongs, idx)"
    />
  </div>
</template>
