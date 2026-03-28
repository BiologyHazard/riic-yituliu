<script setup lang="ts">
import type { Album, AlbumDetail, Song } from '@/types/monsterSiren';

const props = defineProps<{
  album: Album;
  albumSongs: Song[];
  albumDetail: AlbumDetail | null;
  isLoadingAlbumDetail: boolean;
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
  <div class="mb-4">
    <UButton icon="i-lucide-arrow-left" variant="ghost" @click="emit('backToAlbums')">
      返回专辑列表
    </UButton>
  </div>

  <MonsterSirenAlbumHero
    :album="props.album"
    :album-detail="props.albumDetail"
    :is-loading-album-detail="props.isLoadingAlbumDetail"
    :song-count="props.albumSongs.length"
    @play="
      () => {
        if (props.albumSongs.length > 0) {
          emit('playSong', props.albumSongs[0]!, props.albumSongs, 0);
        }
      }
    "
    @preview-cover="emit('previewCover', props.album.coverUrl, props.album.name)"
    @preview-cover-de="
      emit('previewCover', props.albumDetail?.coverDeUrl || props.album.coverUrl, props.album.name)
    "
  />

  <MonsterSirenSongList
    :album-map="props.albumMap"
    :is-current-song="props.isCurrentSong"
    :is-playing="props.isPlaying"
    :loading-detail-cids="props.loadingDetailCids"
    :songs="props.albumSongs"
    @download-song="(song) => emit('downloadSong', song)"
    @play-song="(song, playlist, index) => emit('playSong', song, playlist, index)"
    @preview-cover="(url, name) => emit('previewCover', url, name)"
  />
</template>
