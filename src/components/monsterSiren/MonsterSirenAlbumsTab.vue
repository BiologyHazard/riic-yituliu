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
}>();

const emit = defineEmits<{
  backToAlbums: [];
  openAlbumDetail: [cid: string];
  playSong: [song: Song, playlist: Song[], index: number];
  downloadSong: [song: Song];
  previewCover: [url: string, name: string];
}>();
</script>

<template>
  <MonsterSirenAlbumDetail
    v-if="props.selectedAlbumCid && props.selectedAlbum"
    :album="props.selectedAlbum"
    :album-detail="props.currentAlbumDetail"
    :album-map="props.albumMap"
    :album-songs="props.selectedAlbumSongs"
    :is-current-song="props.isCurrentSong"
    :is-loading-album-detail="props.isLoadingAlbumDetail"
    :is-playing="props.isPlaying"
    :loading-detail-cids="props.loadingDetailCids"
    @back-to-albums="emit('backToAlbums')"
    @download-song="(song: Song) => emit('downloadSong', song)"
    @open-album-detail="(cid: string) => emit('openAlbumDetail', cid)"
    @play-song="
      (song: Song, playlist: Song[], index: number) => emit('playSong', song, playlist, index)
    "
    @preview-cover="(url: string, name: string) => emit('previewCover', url, name)"
  />

  <MonsterSirenAlbumsGrid
    v-else
    :album-song-count="props.albumSongCount"
    :albums="props.albums"
    :songs="props.songs"
    @open-album-detail="(cid: string) => emit('openAlbumDetail', cid)"
    @play-song="
      (song: Song, playlist: Song[], index: number) => emit('playSong', song, playlist, index)
    "
  />
</template>
