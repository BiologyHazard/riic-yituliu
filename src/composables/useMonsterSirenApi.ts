import type { Album, AlbumDetail, Song, SongDetail } from '@/types/monsterSiren';
import { computed, ref } from 'vue';

const PROXY_GET_URL = import.meta.env.VITE_PROXY_GET_URL ?? '/api/proxy/get';
const UPSTREAM_ORIGIN = 'https://monster-siren.hypergryph.com';

function proxyFetch(upstreamUrl: string, init?: RequestInit) {
  return fetch(`${PROXY_GET_URL}?url=${encodeURIComponent(upstreamUrl)}`, init);
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await proxyFetch(`${UPSTREAM_ORIGIN}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`API 错误: ${json.msg || json.code}`);
  return json.data as T;
}

export function useMonsterSirenApi() {
  const isLoading = ref(true);
  const loadError = ref<string | null>(null);

  const albums = ref<Album[]>([]);
  const songs = ref<Song[]>([]);

  const songDetailCache = ref(new Map<string, SongDetail>());
  const loadingDetailCids = ref(new Set<string>());

  const albumDetailCache = ref(new Map<string, AlbumDetail>());
  const isLoadingAlbumDetail = ref(false);
  const currentAlbumDetail = ref<AlbumDetail | null>(null);

  const albumMap = computed(() => new Map(albums.value.map((album) => [album.cid, album])));

  const albumSongCount = computed(() => {
    const map = new Map<string, number>();
    for (const song of songs.value) {
      map.set(song.albumCid, (map.get(song.albumCid) ?? 0) + 1);
    }
    return map;
  });

  async function loadData() {
    isLoading.value = true;
    loadError.value = null;
    try {
      const [albumsData, songsData] = await Promise.all([
        apiFetch<Album[]>('/api/albums'),
        apiFetch<{ list: Song[] }>('/api/songs'),
      ]);
      albums.value = albumsData;
      songs.value = songsData.list;
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : String(error);
    } finally {
      isLoading.value = false;
    }
  }

  async function getSongDetail(cid: string): Promise<SongDetail | null> {
    if (songDetailCache.value.has(cid)) return songDetailCache.value.get(cid)!;
    loadingDetailCids.value.add(cid);
    try {
      const data = await apiFetch<SongDetail>(`/api/song/${cid}`);
      songDetailCache.value.set(cid, data);
      return data;
    } catch {
      return null;
    } finally {
      loadingDetailCids.value.delete(cid);
    }
  }

  async function getAlbumDetail(cid: string): Promise<AlbumDetail | null> {
    if (albumDetailCache.value.has(cid)) {
      return albumDetailCache.value.get(cid)!;
    }
    isLoadingAlbumDetail.value = true;
    try {
      const data = await apiFetch<AlbumDetail>(`/api/album/${cid}/detail`);
      albumDetailCache.value.set(cid, data);
      return data;
    } catch {
      return null;
    } finally {
      isLoadingAlbumDetail.value = false;
    }
  }

  return {
    isLoading,
    loadError,
    albums,
    songs,
    songDetailCache,
    loadingDetailCids,
    albumDetailCache,
    isLoadingAlbumDetail,
    currentAlbumDetail,
    albumMap,
    albumSongCount,
    loadData,
    getSongDetail,
    getAlbumDetail,
  };
}
