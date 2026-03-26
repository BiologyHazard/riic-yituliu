<script setup lang="ts">
import type { Album, Song, SongViewMode } from '@/types/monsterSiren';

import MonsterSirenSongGrid from '@/components/monsterSiren/MonsterSirenSongGrid.vue';
import MonsterSirenSongList from '@/components/monsterSiren/MonsterSirenSongList.vue';

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

  <component
    :is="props.songViewMode === 'list' ? MonsterSirenSongList : MonsterSirenSongGrid"
    :album-map="props.albumMap"
    :is-current-song="props.isCurrentSong"
    :is-playing="props.isPlaying"
    :loading-detail-cids="props.loadingDetailCids"
    :songs="props.filteredSongs"
    @download-song="(song) => emit('downloadSong', song)"
    @play-song="(song, playlist, index) => emit('playSong', song, playlist, index)"
    @preview-cover="(url, name) => emit('previewCover', url, name)"
  />
</template>
