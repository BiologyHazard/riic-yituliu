import type { SongViewMode, Tab } from '@/types/monsterSiren';
import type { Router, RouteLocationNormalizedLoaded } from 'vue-router';
import { computed } from 'vue';

export function useViewMode(route: RouteLocationNormalizedLoaded, router: Router) {
  const BASE_PATH = '/monster-siren';

  const songViewMode = computed<SongViewMode>({
    get: () => ((route.query.view as SongViewMode) === 'grid' ? 'grid' : 'list'),
    set: (val) => {
      router.replace({ ...route, query: { ...route.query, view: val } });
    },
  });

  const viewTab = computed<Tab>({
    get: () => {
      if (route.path.startsWith(`${BASE_PATH}/album/`)) return 'albums';
      return route.path.startsWith(`${BASE_PATH}/albums`) ? 'albums' : 'musics';
    },
    set: (tab) => {
      router.push(`${BASE_PATH}/${tab}`);
    },
  });

  const selectedAlbumCid = computed<string | null>({
    get: () => (route.params.cid as string) || null,
    set: (cid) => {
      if (cid !== null) {
        router.push(`${BASE_PATH}/album/${cid}`);
      } else {
        router.push(`${BASE_PATH}/albums`);
      }
    },
  });

  return {
    songViewMode,
    viewTab,
    selectedAlbumCid,
  };
}
