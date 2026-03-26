import type { Album, Song } from '@/types/monsterSiren';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';

export function useSongFilter(songs: Ref<Song[]>, albumMap: Ref<Map<string, Album>>) {
  const searchQuery = ref('');

  const filteredSongs = computed(() => {
    const query = searchQuery.value.trim().toLowerCase();
    if (!query) return songs.value;
    return songs.value.filter(
      (song) =>
        song.name.toLowerCase().includes(query) ||
        (albumMap.value.get(song.albumCid)?.name ?? '').toLowerCase().includes(query) ||
        song.artists.join(' ').toLowerCase().includes(query) ||
        song.cid.includes(query),
    );
  });

  return {
    searchQuery,
    filteredSongs,
  };
}
