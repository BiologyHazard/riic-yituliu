import type { Album, Song } from '@/types/monsterSiren';
import type { ComputedRef, Ref } from 'vue';
import { computed, ref, watch } from 'vue';

const PAGE_SIZE = 30;

export function useSongFilterPagination(
  songs: Ref<Song[]>,
  albumMap: ComputedRef<Map<string, Album>>,
) {
  const searchQuery = ref('');
  const currentPage = ref(1);

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

  const totalSongs = computed(() => filteredSongs.value.length);
  const totalPages = computed(() => Math.ceil(totalSongs.value / PAGE_SIZE));

  const paginatedSongs = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE;
    return filteredSongs.value.slice(start, start + PAGE_SIZE);
  });

  watch(searchQuery, () => {
    currentPage.value = 1;
  });

  return {
    PAGE_SIZE,
    searchQuery,
    currentPage,
    filteredSongs,
    totalSongs,
    totalPages,
    paginatedSongs,
  };
}
