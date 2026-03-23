import type { Album, PlayMode, Song, SongDetail } from '@/types/monsterSiren';
import type { ComputedRef, Ref } from 'vue';
import { computed, nextTick, ref } from 'vue';

export function useMusicPlayer(
  audioElement: Ref<HTMLAudioElement | null>,
  albumMap: ComputedRef<Map<string, Album>>,
  getSongDetail: (cid: string) => Promise<SongDetail | null>,
) {
  const playerSong = ref<Song | null>(null);
  const playerDetail = ref<SongDetail | null>(null);
  const playerPlaylist = ref<Song[]>([]);
  const playerIndex = ref(-1);
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
    if (!audioElement.value) return;
    if (isPlaying.value) {
      audioElement.value.pause();
      isPlaying.value = false;
    } else {
      audioElement.value
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
    if (playerSong.value?.cid === song.cid && playerDetail.value && audioElement.value?.src) {
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
    if (audioElement.value && detail?.sourceUrl) {
      audioElement.value.src = detail.sourceUrl;
      try {
        await audioElement.value.play();
        isPlaying.value = true;
      } catch {
        isPlaying.value = false;
      }
    } else if (!detail?.sourceUrl) {
      audioError.value = true;
    }
  }

  function getNextIndex(current: number, total: number, mode: PlayMode, isManual: boolean): number {
    if (total === 0) return -1;

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
      case 'sequence':
        return isManual ? (current + 1) % total : current;
      case 'loop':
        return (current + 1) % total;
    }
  }

  function getPrevIndex(current: number, total: number, mode: PlayMode): number {
    if (total === 0) return -1;

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
    const total = playerPlaylist.value.length;
    if (total === 0) return;
    const prevIndex = getPrevIndex(playerIndex.value, total, playMode.value);
    if (prevIndex !== -1) {
      await playSong(playerPlaylist.value[prevIndex]!, playerPlaylist.value, prevIndex);
    }
  }

  async function playNext(isManual: boolean = true) {
    const total = playerPlaylist.value.length;
    if (total === 0) return;
    const nextIndex = getNextIndex(playerIndex.value, total, playMode.value, isManual);
    if (nextIndex !== -1) {
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
        audioElement.value?.pause();
        isPlaying.value = false;
      } else {
        const nextIdx = index % playerPlaylist.value.length;
        playSong(playerPlaylist.value[nextIdx]!, playerPlaylist.value, nextIdx);
      }
    } else if (index < playerIndex.value) {
      playerIndex.value--;
    }
  }

  function clearPlaylist() {
    playerPlaylist.value = [];
    playerSong.value = null;
    playerIndex.value = -1;
    audioElement.value?.pause();
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
    audioElement.value?.pause();
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
