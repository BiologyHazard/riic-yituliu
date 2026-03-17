export interface Album {
  cid: string;
  name: string;
  coverUrl: string;
  artistes: string[];
}

export interface AlbumDetail {
  cid: string;
  name: string;
  intro: string;
  belong: string;
  coverUrl: string;
  coverDeUrl: string;
  artistes: string[];
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

export type PlayMode = 'sequence' | 'loop' | 'single' | 'random';

export type SongViewMode = 'grid' | 'list';
