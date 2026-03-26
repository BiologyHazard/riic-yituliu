<script setup lang="ts">
import type { Album, Song } from '@/types/monsterSiren';

import { useInfiniteScroll } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  songs: Song[];
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
/** 初始显示数量 */
const INITIAL_DISPLAY_COUNT = 64;
/** 每次加载新增显示数量 */
const LOAD_INCREMENT = 32;
/** 距离底部多少像素时触发加载更多 */
const DISTANCE_TO_LOAD = 512;

/** 当前显示的歌曲数量 */
const displayCount = ref(INITIAL_DISPLAY_COUNT);
/** 显示的歌曲 */
const displayingSongs = computed(() => props.songs.slice(0, displayCount.value));

function onLoadMore() {
  displayCount.value += LOAD_INCREMENT;
}

function canLoadMore() {
  return displayCount.value < props.songs.length;
}

// 监听窗口滚动
const {} = useInfiniteScroll(window, onLoadMore, { distance: DISTANCE_TO_LOAD, canLoadMore });

// 当内容变化时重置加载上限
watch(
  () => props.songs,
  () => {
    displayCount.value = INITIAL_DISPLAY_COUNT;
  },
);
</script>

<template>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
    <MonsterSirenSongCard
      v-for="(song, idx) in displayingSongs"
      :key="song.cid"
      :album="props.albumMap.get(song.albumCid)"
      :is-active="props.isCurrentSong(song.cid)"
      :is-loading="props.loadingDetailCids.has(song.cid)"
      :is-playing="props.isCurrentSong(song.cid) && props.isPlaying"
      :song
      @play="emit('playSong', song, props.songs, idx)"
    />
  </div>
</template>
