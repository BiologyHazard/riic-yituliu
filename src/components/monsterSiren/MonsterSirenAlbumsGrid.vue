<script setup lang="ts">
import type { Album, Song } from '@/types/monsterSiren';

const props = defineProps<{
  albums: Album[];
  songs: Song[];
  albumSongCount: Map<string, number>;
}>();

const emit = defineEmits<{
  openAlbumDetail: [cid: string];
  playSong: [song: Song, playlist: Song[], index: number];
}>();
</script>

<template>
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
