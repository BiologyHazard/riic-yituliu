import type { SongViewMode } from '@/types/monsterSiren';
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router';
import { computed, ref } from 'vue';

export function useViewMode(route: RouteLocationNormalizedLoaded, router: Router) {
  const songViewMode = ref<SongViewMode>('list');

  const viewTab = computed(() => {
    if (route.path.includes('/album/')) return 'albums';
    return route.path.endsWith('/albums') ? 'albums' : 'songs';
  });

  const selectedAlbumCid = computed(() => (route.params.cid as string) || null);

  function switchTab(tab: 'songs' | 'albums') {
    router.push(tab === 'songs' ? '/monster-siren/musics' : '/monster-siren/albums');
  }

  function openAlbumDetail(cid: string) {
    router.push(`/monster-siren/album/${cid}`);
  }

  function backToAlbums() {
    router.push('/monster-siren/albums');
  }

  function toggleSongViewMode() {
    songViewMode.value = songViewMode.value === 'grid' ? 'list' : 'grid';
  }

  return {
    songViewMode,
    viewTab,
    selectedAlbumCid,
    switchTab,
    openAlbumDetail,
    backToAlbums,
    toggleSongViewMode,
  };
}
