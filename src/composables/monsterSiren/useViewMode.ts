import type { SongViewMode, Tab } from '@/types/monsterSiren';
import { computed, ref, watch } from 'vue';
import type { RouteLocationNormalizedLoaded, RouteLocationRaw, Router } from 'vue-router';

export function useViewMode(route: RouteLocationNormalizedLoaded, router: Router) {
  const _viewTab = ref<Tab>('musics');
  const _songViewMode = ref<SongViewMode>('list');
  const _selectedAlbumCid = ref<string | null>(null);
  const _selectedSongCid = ref<string | null>(null);

  function _getUrl(
    viewTab: Tab,
    songViewMode: SongViewMode,
    selectedAlbumCid: string | null,
    selectedSongCid: string | null,
  ): RouteLocationRaw {
    if (selectedSongCid) {
      return {
        name: 'monster-siren-song-detail',
        params: { cid: selectedSongCid },
      };
    } else if (selectedAlbumCid) {
      return {
        name: 'monster-siren-album-detail',
        params: { cid: selectedAlbumCid },
      };
    } else if (viewTab === 'musics') {
      return {
        name: 'monster-siren-musics',
        query: { view: songViewMode },
      };
    } else {
      return {
        name: 'monster-siren-albums',
      };
    }
  }

  function getUrl() {
    return _getUrl(
      _viewTab.value,
      _songViewMode.value,
      _selectedAlbumCid.value,
      _selectedSongCid.value,
    );
  }

  watch(
    route,
    () => {
      if (route.name === 'monster-siren-musics') {
        _viewTab.value = 'musics';
        _songViewMode.value = (route.query.view as SongViewMode) || 'list';
        _selectedAlbumCid.value = null;
        _selectedSongCid.value = null;
      } else if (route.name === 'monster-siren-albums') {
        _viewTab.value = 'albums';
        _selectedAlbumCid.value = null;
        _selectedSongCid.value = null;
      } else if (route.name === 'monster-siren-album-detail') {
        _viewTab.value = 'albums';
        _selectedAlbumCid.value = route.params.cid as string;
        _selectedSongCid.value = null;
      } else if (route.name === 'monster-siren-song-detail') {
        _selectedSongCid.value = route.params.cid as string;
      }
    },
    { immediate: true },
  );

  const viewTab = computed<Tab>({
    get: () => _viewTab.value,
    set: (newViewTab) => {
      _viewTab.value = newViewTab;
      router.push(getUrl());
    },
  });

  const songViewMode = computed<SongViewMode>({
    get: () => _songViewMode.value,
    set: (newSongViewMode) => {
      _songViewMode.value = newSongViewMode;
      router.replace(getUrl());
    },
  });

  const selectedAlbumCid = computed<string | null>({
    get: () => _selectedAlbumCid.value,
    set: (cid) => {
      _selectedAlbumCid.value = cid;
      router.push(getUrl());
    },
  });

  const selectedSongCid = computed<string | null>({
    get: () => _selectedSongCid.value,
    set: (cid) => {
      _selectedSongCid.value = cid;
      router.push(getUrl());
    },
  });

  return {
    songViewMode,
    viewTab,
    selectedAlbumCid,
    selectedSongCid,
  };
}
