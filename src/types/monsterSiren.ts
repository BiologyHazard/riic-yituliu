/**
 * Base interface for Monster Siren API responses
 */
export interface MonsterSirenApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface Album {
  cid: string;
  name: string;
  coverUrl: string;
  artistes: string[];
}

export interface AlbumData {
  cid: string;
  name: string;
  intro: string;
  belong: string;
  coverUrl: string;
  coverDeUrl: string;
  artistes: string[];
}

export interface AlbumDetailSong {
  cid: string;
  name: string;
  artistes: string[];
}

export interface AlbumDetail {
  cid: string;
  name: string;
  intro: string;
  belong: string;
  coverUrl: string;
  coverDeUrl: string;
  songs: AlbumDetailSong[];
}

export interface Song {
  cid: string;
  name: string;
  albumCid: string;
  artists: string[];
}

export interface SongDetail {
  cid: string;
  name: string;
  albumCid: string;
  sourceUrl: string | null;
  lyricUrl: string | null;
  mvUrl: string | null;
  mvCoverUrl: string | null;
  artists: string[];
}

/** GET https://monster-siren.hypergryph.com/api/albums */
export type ApiAlbumsResponse = MonsterSirenApiResponse<Album[]>;

/** GET https://monster-siren.hypergryph.com/api/album/{albumId}/data */
export type ApiAlbumDataResponse = MonsterSirenApiResponse<AlbumData>;

/** GET https://monster-siren.hypergryph.com/api/album/{albumId}/detail */
export type ApiAlbumDetailResponse = MonsterSirenApiResponse<AlbumDetail>;

/** GET https://monster-siren.hypergryph.com/api/songs */
export type ApiSongsResponse = MonsterSirenApiResponse<{ list: Song[]; autoplay: string }>;

/** GET https://monster-siren.hypergryph.com/api/song/{songId} */
export type ApiSongDetailResponse = MonsterSirenApiResponse<SongDetail>;

export type PlayMode = 'sequence' | 'loop' | 'single' | 'random';
export type SongViewMode = 'grid' | 'list';
export type Tab = 'songs' | 'albums';
