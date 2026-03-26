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
  <template v-if="props.selectedAlbumCid && props.selectedAlbum">
    <div class="mb-4">
      <UButton icon="i-lucide-arrow-left" variant="ghost" @click="emit('backToAlbums')">
        返回专辑列表
      </UButton>
    </div>

    <MonsterSirenAlbumHero
      :album="props.selectedAlbum"
      :album-detail="currentAlbumDetail"
      :is-loading-album-detail="props.isLoadingAlbumDetail"
      :song-count="props.albumSongCount.get(props.selectedAlbumCid) ?? 0"
      @play="
        () => {
          if (props.selectedAlbumSongs.length > 0) {
            emit('playSong', props.selectedAlbumSongs[0]!, props.selectedAlbumSongs, 0);
          }
        }
      "
      @preview-cover="emit('previewCover', props.selectedAlbum.coverUrl, props.selectedAlbum.name)"
      @preview-cover-de="
        emit(
          'previewCover',
          props.currentAlbumDetail?.coverDeUrl || props.selectedAlbum.coverUrl,
          props.selectedAlbum.name,
        )
      "
    />

    <MonsterSirenSongList
      :album-map="props.albumMap"
      :is-current-song="props.isCurrentSong"
      :is-playing="props.isPlaying"
      :loading-detail-cids="props.loadingDetailCids"
      :songs="props.selectedAlbumSongs"
      @download-song="(song) => emit('downloadSong', song)"
      @play-song="(song, playlist, index) => emit('playSong', song, playlist, index)"
      @preview-cover="(url, name) => emit('previewCover', url, name)"
    />
  </template>

  <template v-else>
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      <div v-for="album in props.albums" :key="album.cid">
        <MonsterSirenAlbumCard
          :album="album"
          :song-count="props.albumSongCount.get(album.cid) ?? 0"
          @click="emit('openAlbumDetail', album.cid)"
          @play="
            emit(
              'playSong',
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
