import type { Album, PlayMode, Song, SongDetail } from '@/types/monsterSiren';
import type { ComputedRef, Ref } from 'vue';
import { computed, nextTick, ref } from 'vue';

export function useMusicPlayer(
  audioRef: Ref<HTMLAudioElement | null>,
  albumMap: ComputedRef<Map<string, Album>>,
  getSongDetail: (cid: string) => Promise<SongDetail | null>,
) {
  const playerSong = ref<Song | null>(null);
  const playerDetail = ref<SongDetail | null>(null);
  const playerPlaylist = ref<Song[]>([]);
  const playerIndex = ref<number | null>(null);
  const isPlaying = ref(false);
  const isLoadingPlayerDetail = ref(false);
  const audioError = ref(false);
  const isPlaylistOpen = ref(false);

  const playMode = ref<PlayMode>('loop');

  const playModeIcons: Record<PlayMode, string> = {
    sequence: 'i-lucide-list-ordered',
    loop: 'i-lucide-repeat',
    single: 'i-lucide-repeat-1',
    random: 'i-lucide-shuffle',
  };

  const playModeLabels: Record<PlayMode, string> = {
    sequence: '顺序播放',
    loop: '列表循环',
    single: '单曲循环',
    random: '随机播放',
  };

  const playerAlbum = computed(() =>
    playerSong.value ? albumMap.value.get(playerSong.value.albumCid) : null,
  );

  function isCurrentSong(cid: string) {
    return playerSong.value?.cid === cid;
  }

  function togglePlayMode() {
    const modes: PlayMode[] = ['sequence', 'loop', 'single', 'random'];
    const currentIndex = modes.indexOf(playMode.value);
    playMode.value = modes[(currentIndex + 1) % modes.length]!;
  }

  function togglePlay() {
    if (!audioRef.value) return;
    if (isPlaying.value) {
      audioRef.value.pause();
      isPlaying.value = false;
    } else {
      audioRef.value
        .play()
        .then(() => {
          isPlaying.value = true;
        })
        .catch(() => {
          isPlaying.value = false;
        });
    }
  }

  async function playSong(song: Song, playlist: Song[], index: number) {
    if (playerSong.value?.cid === song.cid && playerDetail.value && audioRef.value?.src) {
      togglePlay();
      return;
    }

    playerSong.value = song;
    playerPlaylist.value = playlist;
    playerIndex.value = index;
    playerDetail.value = null;
    isPlaying.value = false;
    audioError.value = false;
    isLoadingPlayerDetail.value = true;

    const detail = await getSongDetail(song.cid);
    isLoadingPlayerDetail.value = false;
    playerDetail.value = detail;

    await nextTick();
    if (audioRef.value && detail?.sourceUrl) {
      audioRef.value.src = detail.sourceUrl;
      try {
        await audioRef.value.play();
        isPlaying.value = true;
      } catch {
        isPlaying.value = false;
      }
    } else if (!detail?.sourceUrl) {
      audioError.value = true;
    }
  }

  function getNextIndex(
    current: number | null,
    total: number,
    mode: PlayMode,
    isManual: boolean,
  ): number | null {
    if (total === 0) return null;
    if (current === null) return 0;

    switch (mode) {
      case 'random': {
        if (total === 1) return 0;
        let next;
        do {
          next = Math.floor(Math.random() * total);
        } while (next === current);
        return next;
      }
      case 'single':
        return isManual ? (current + 1) % total : current;
      case 'sequence':
        if (!isManual && current === total - 1) {
          return null;
        } else {
          return (current + 1) % total;
        }
      case 'loop':
        return (current + 1) % total;
    }
  }

  function getPrevIndex(current: number | null, total: number, mode: PlayMode): number | null {
    if (total === 0) return null;
    if (current === null) return 0;

    switch (mode) {
      case 'random': {
        if (total === 1) return 0;
        let prev;
        do {
          prev = Math.floor(Math.random() * total);
        } while (prev === current);
        return prev;
      }
      case 'sequence':
      case 'single':
      case 'loop':
      default:
        return (current - 1 + total) % total;
    }
  }

  async function playPrev() {
    const prevIndex = getPrevIndex(playerIndex.value, playerPlaylist.value.length, playMode.value);
    if (prevIndex !== null) {
      await playSong(playerPlaylist.value[prevIndex]!, playerPlaylist.value, prevIndex);
    } else {
      isPlaying.value = false;
    }
  }

  async function playNext(isManual: boolean = true) {
    const nextIndex = getNextIndex(
      playerIndex.value,
      playerPlaylist.value.length,
      playMode.value,
      isManual,
    );
    if (nextIndex !== null) {
      await playSong(playerPlaylist.value[nextIndex]!, playerPlaylist.value, nextIndex);
    } else {
      isPlaying.value = false;
    }
  }

  function removeFromPlaylist(index: number) {
    if (index < 0 || index >= playerPlaylist.value.length) return;
    const isCurrent = playerIndex.value === index;
    playerPlaylist.value.splice(index, 1);
    if (isCurrent) {
      if (playerPlaylist.value.length === 0) {
        playerSong.value = null;
        playerIndex.value = null;
        audioRef.value?.pause();
        isPlaying.value = false;
        isPlaylistOpen.value = false;
      } else {
        const nextIdx = index % playerPlaylist.value.length;
        playSong(playerPlaylist.value[nextIdx]!, playerPlaylist.value, nextIdx);
      }
    } else if (playerIndex.value !== null && index < playerIndex.value) {
      playerIndex.value--;
    }
  }

  function clearPlaylist() {
    playerPlaylist.value = [];
    playerSong.value = null;
    playerIndex.value = null;
    audioRef.value?.pause();
    isPlaying.value = false;
    isPlaylistOpen.value = false;
  }

  async function downloadSong(song: Song) {
    const detail = await getSongDetail(song.cid);
    if (!detail?.sourceUrl) {
      alert('无法获取下载链接');
      return;
    }
    const a = document.createElement('a');
    a.href = detail.sourceUrl;
    const ext = detail.sourceUrl.split('.').pop()?.split('?')[0] ?? 'wav';
    a.download = `${song.name}.${ext}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function closePlayer() {
    playerSong.value = null;
    audioRef.value?.pause();
    isPlaying.value = false;
    isPlaylistOpen.value = false;
  }

  function onAudioError() {
    isPlaying.value = false;
    audioError.value = true;
  }

  return {
    playerSong,
    playerDetail,
    playerPlaylist,
    playerIndex,
    isPlaying,
    isLoadingPlayerDetail,
    audioError,
    isPlaylistOpen,
    playMode,
    playModeIcons,
    playModeLabels,
    playerAlbum,
    isCurrentSong,
    togglePlayMode,
    togglePlay,
    playSong,
    playPrev,
    playNext,
    removeFromPlaylist,
    clearPlaylist,
    downloadSong,
    closePlayer,
    onAudioError,
  };
}
