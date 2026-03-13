<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';

// ─── 类型定义 ──────────────────────────────────────────────────────────────────

/** 专辑列表 API 单条记录 */
interface Album {
  cid: string;
  name: string;
  coverUrl: string;
  artistes: string[];
}

/** 专辑详情 API 返回数据 */
interface AlbumDetail {
  cid: string;
  name: string;
  intro: string;
  belong: string;
  coverUrl: string;
  coverDeUrl: string;
  artistes: string[];
}

/** 乐曲列表 API 单条记录 */
interface Song {
  cid: string;
  name: string;
  albumCid: string;
  artists: string[];
}

/** 乐曲详情 API 返回数据 */
interface SongDetail {
  cid: string;
  name: string;
  albumCid: string;
  sourceUrl: string | null;
  lyricUrl: string | null;
  mvUrl: string | null;
  mvCoverUrl: string | null;
  artists: string[];
}

// ─── 常量 ──────────────────────────────────────────────────────────────────────
const PROXY_GET_URL = import.meta.env.VITE_PROXY_GET_URL ?? '/api/proxy/get';
const UPSTREAM_ORIGIN = 'https://monster-siren.hypergryph.com';
const PAGE_SIZE = 30;

function proxyFetch(upstreamUrl: string, init?: RequestInit) {
  return fetch(`${PROXY_GET_URL}?url=${encodeURIComponent(upstreamUrl)}`, init);
}

// ─── 数据状态 ───────────────────────────────────────────────────────────────────
const isLoading = ref(true);
const loadError = ref<string | null>(null);
const albums = ref<Album[]>([]);
const songs = ref<Song[]>([]);
const songDetailCache = ref(new Map<string, SongDetail>());
const loadingDetailCids = ref(new Set<string>());
const albumDetailCache = ref(new Map<string, AlbumDetail>());
const isLoadingAlbumDetail = ref(false);
const currentAlbumDetail = ref<AlbumDetail | null>(null);

// ─── 界面状态 ─────────────────────────────────────────────────────────────────────
const viewTab = ref<'songs' | 'albums'>('songs');
const searchQuery = ref('');
const currentPage = ref(1);
const selectedAlbumCid = ref<string | null>(null);

// ─── 播放器状态 ───────────────────────────────────────────────────────────────────
const audioElement = ref<HTMLAudioElement | null>(null);
const playerSong = ref<Song | null>(null);
const playerDetail = ref<SongDetail | null>(null);
const playerPlaylist = ref<Song[]>([]);
const playerIndex = ref(-1);
const isPlaying = ref(false);
const isLoadingPlayerDetail = ref(false);
const audioCurrentTime = ref(0);
const audioDuration = ref(0);
const audioVolume = ref(1);
const isMuted = ref(false);
const prevVolume = ref(1);
const audioError = ref(false);

/** 播放模式 */
type PlayMode = 'sequence' | 'loop' | 'single' | 'random';
const playMode = ref<PlayMode>('loop');
const isPlaylistOpen = ref(false);

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

// ─── 组件渲染 ─────────────────────────────────────────────────────────────────────
type SongViewMode = 'grid' | 'list';
const songViewMode = ref<SongViewMode>('list'); // 乐曲主列表展示模式

// ─── 计算属性 ─────────────────────────────────────────────────────────────────────
const albumMap = computed(() => new Map(albums.value.map((a) => [a.cid, a])));

const albumSongCount = computed(() => {
  const map = new Map<string, number>();
  for (const song of songs.value) {
    map.set(song.albumCid, (map.get(song.albumCid) ?? 0) + 1);
  }
  return map;
});

const filteredSongs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return songs.value;
  return songs.value.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (albumMap.value.get(s.albumCid)?.name ?? '').toLowerCase().includes(q) ||
      s.artists.join(' ').toLowerCase().includes(q) ||
      s.cid.includes(q),
  );
});

const totalSongs = computed(() => filteredSongs.value.length);
const totalPages = computed(() => Math.ceil(totalSongs.value / PAGE_SIZE));

const paginatedSongs = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return filteredSongs.value.slice(start, start + PAGE_SIZE);
});

const selectedAlbum = computed(() =>
  selectedAlbumCid.value ? albumMap.value.get(selectedAlbumCid.value) : null,
);

const selectedAlbumSongs = computed(() => {
  if (!selectedAlbumCid.value) return [];
  return songs.value.filter((s) => s.albumCid === selectedAlbumCid.value);
});

const playerAlbum = computed(() =>
  playerSong.value ? albumMap.value.get(playerSong.value.albumCid) : null,
);

const progressPercent = computed(() =>
  audioDuration.value > 0 ? (audioCurrentTime.value / audioDuration.value) * 100 : 0,
);

// ─── 侦听器 ───────────────────────────────────────────────────────────────────────
watch(searchQuery, () => {
  currentPage.value = 1;
});

watch(viewTab, () => {
  if (viewTab.value === 'albums') {
    selectedAlbumCid.value = null;
    currentAlbumDetail.value = null;
  }
});

watch(selectedAlbumCid, async (cid) => {
  if (!cid) {
    currentAlbumDetail.value = null;
    return;
  }
  if (albumDetailCache.value.has(cid)) {
    currentAlbumDetail.value = albumDetailCache.value.get(cid)!;
    return;
  }
  isLoadingAlbumDetail.value = true;
  currentAlbumDetail.value = null;
  try {
    const data = await apiFetch<AlbumDetail>(`/api/album/${cid}/detail`);
    albumDetailCache.value.set(cid, data);
    currentAlbumDetail.value = data;
  } catch {
    // 获取失败时退回到基础专辑信息
  } finally {
    isLoadingAlbumDetail.value = false;
  }
});

// ─── API 辅助函数 ─────────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string): Promise<T> {
  const res = await proxyFetch(`${UPSTREAM_ORIGIN}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (json.code !== 0) throw new Error(`API 错误: ${json.msg || json.code}`);
  return json.data as T;
}

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
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e);
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

// ─── 播放器控制 ───────────────────────────────────────────────────────────────────
/** 切换播放模式 */
function togglePlayMode() {
  const modes: PlayMode[] = ['sequence', 'loop', 'single', 'random'];
  const currentIndex = modes.indexOf(playMode.value);
  playMode.value = modes[(currentIndex + 1) % modes.length]!;
}

/** 切换播放状态 */
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

/** 播放指定歌曲 */
async function playSong(song: Song, playlist: Song[], index: number) {
  // 同一首歌已加载时直接切换播放状态
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

/** 获取下一首索引 */
function getNextIndex(current: number, total: number, mode: PlayMode, isManual: boolean): number {
  if (total === 0) return -1;
  if (mode === 'random') {
    if (total === 1) return 0;
    let next;
    do {
      next = Math.floor(Math.random() * total);
    } while (next === current);
    return next;
  }
  if (mode === 'single' && !isManual) return current;
  if (mode === 'sequence' && current === total - 1) return -1;
  return (current + 1) % total;
}

/** 获取前一首索引 */
function getPrevIndex(current: number, total: number, mode: PlayMode): number {
  if (total === 0) return -1;
  if (mode === 'random') {
    if (total === 1) return 0;
    let prev;
    do {
      prev = Math.floor(Math.random() * total);
    } while (prev === current);
    return prev;
  }
  return (current - 1 + total) % total;
}

async function playPrev() {
  const total = playerPlaylist.value.length;
  if (total === 0) return;
  const prevIndex = getPrevIndex(playerIndex.value, total, playMode.value);
  if (prevIndex !== -1) {
    await playSong(playerPlaylist.value[prevIndex]!, playerPlaylist.value, prevIndex);
  }
}

async function playNext(isManual = true) {
  const total = playerPlaylist.value.length;
  if (total === 0) return;
  const nextIndex = getNextIndex(playerIndex.value, total, playMode.value, isManual);
  if (nextIndex !== -1) {
    await playSong(playerPlaylist.value[nextIndex]!, playerPlaylist.value, nextIndex);
  } else {
    isPlaying.value = false;
  }
}

/** 从播放列表中移除 */
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

/** 清空播放列表 */
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

// ─── 音频事件处理 ─────────────────────────────────────────────────────────────────
function onAudioTimeUpdate() {
  if (audioElement.value) audioCurrentTime.value = audioElement.value.currentTime;
}

function onAudioDurationChange() {
  if (audioElement.value) audioDuration.value = audioElement.value.duration;
}

function onAudioVolumeChange() {
  if (audioElement.value) {
    audioVolume.value = audioElement.value.volume;
    isMuted.value = audioElement.value.muted;
  }
}

function onAudioEnded() {
  if (playMode.value === 'single') {
    if (audioElement.value) {
      audioElement.value.currentTime = 0;
      audioElement.value.play();
    }
  } else {
    playNext(false);
  }
}

function onAudioError() {
  isPlaying.value = false;
  audioError.value = true;
}

function seekAudio(event: Event) {
  const input = event.target as HTMLInputElement;
  if (audioElement.value) {
    audioElement.value.currentTime = Number(input.value);
  }
}

function setVolume(val: number | undefined) {
  if (val === undefined) return;
  if (audioElement.value) {
    audioElement.value.volume = val;
    audioVolume.value = val;
    if (val > 0) {
      audioElement.value.muted = false;
      isMuted.value = false;
    }
  }
}

function toggleMute() {
  if (audioElement.value) {
    if (isMuted.value) {
      audioElement.value.muted = false;
      isMuted.value = false;
      if (audioVolume.value === 0) {
        const nextVol = prevVolume.value > 0 ? prevVolume.value : 1;
        audioElement.value.volume = nextVol;
        audioVolume.value = nextVol;
      }
    } else {
      prevVolume.value = audioVolume.value;
      audioElement.value.muted = true;
      isMuted.value = true;
    }
  }
}

// ─── 工具函数 ──────────────────────────────────────────────────────────────────────
function formatTime(seconds: number) {
  if (!isFinite(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function isCurrentSong(cid: string) {
  return playerSong.value?.cid === cid;
}

// ─── 图片预览 ────────────────────────────────────────────────────────────────────────
const imagePreview = useTemplateRef('imagePreview');

function previewCover(url: string, name: string) {
  imagePreview.value?.open({ url, name, downloadName: name });
}

// ─── 生命周期 ──────────────────────────────────────────────────────────────────────
onMounted(loadData);
</script>

<template>
  <!-- 图片预览组件 -->
  <AppImagePreview ref="imagePreview" />

  <!-- 隐藏的音频元素 -->
  <audio
    ref="audioElement"
    class="hidden"
    @durationchange="onAudioDurationChange"
    @ended="onAudioEnded"
    @error="onAudioError"
    @timeupdate="onAudioTimeUpdate"
    @volumechange="onAudioVolumeChange"
  />

  <!-- 底部固定播放器 -->
  <Transition name="player-slide">
    <div
      v-if="playerSong"
      class="fixed bottom-0 left-0 z-50 w-full border-t border-t-default bg-default/95 shadow-2xl backdrop-blur-md"
    >
      <!-- 进度条 -->
      <div
        class="group/progress relative h-1 w-full bg-gray-200 transition-all hover:h-1.5 dark:bg-gray-700"
      >
        <div
          class="h-full bg-primary transition-all duration-100"
          :style="{ width: `${progressPercent}%` }"
        />
        <input
          class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          :max="audioDuration || 100"
          min="0"
          step="1"
          type="range"
          :value="audioCurrentTime"
          @input="seekAudio"
        />
      </div>

      <div class="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
        <!-- 专辑封面 -->
        <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow sm:h-12 sm:w-12">
          <img
            v-if="playerAlbum"
            :alt="playerAlbum.name"
            class="h-full w-full object-cover"
            referrerpolicy="no-referrer"
            :src="playerAlbum.coverUrl"
          />
          <div v-else class="flex h-full w-full items-center justify-center bg-muted text-gray-400">
            <UIcon name="i-lucide-music" />
          </div>
          <!-- 播放中的高光边框 -->
          <div
            v-if="isPlaying"
            class="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-white/30"
          />
        </div>

        <!-- 曲目信息 -->
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <p class="truncate text-xs font-semibold text-highlighted sm:text-sm">
              {{ playerSong.name }}
            </p>
            <UBadge v-if="audioError" color="error" size="xs" variant="soft"> 加载失败 </UBadge>
            <UBadge v-else-if="isLoadingPlayerDetail" size="xs" variant="soft">
              <UIcon class="animate-spin" name="i-lucide-loader-circle" />
              <span class="hidden sm:inline">加载中</span>
            </UBadge>
          </div>
          <p class="truncate text-[10px] text-muted sm:text-xs">
            {{ playerAlbum?.name ?? `专辑 ${playerSong.albumCid}` }}
            <span class="mx-0.5 opacity-50 sm:mx-1">·</span>
            {{ playerSong.artists.join(' / ') }}
          </p>
        </div>

        <!-- 时间显示 -->
        <div class="hidden shrink-0 text-xs text-muted tabular-nums md:block">
          {{ formatTime(audioCurrentTime) }} / {{ formatTime(audioDuration) }}
        </div>

        <!-- 播放控制按钮 -->
        <div class="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <UButton
            class="hidden sm:flex"
            :icon="playModeIcons[playMode]"
            size="sm"
            :title="playModeLabels[playMode]"
            variant="ghost"
            @click="togglePlayMode"
          />
          <UButton
            class="hidden sm:flex"
            icon="i-lucide-skip-back"
            size="sm"
            variant="ghost"
            @click="playPrev"
          />
          <UButton
            :class="{ 'animate-spin': isLoadingPlayerDetail }"
            :disabled="isLoadingPlayerDetail"
            :icon="
              isLoadingPlayerDetail
                ? 'i-lucide-loader-circle'
                : isPlaying
                  ? 'i-lucide-pause'
                  : 'i-lucide-play'
            "
            size="md"
            @click="togglePlay"
          />
          <UButton icon="i-lucide-skip-forward" size="sm" variant="ghost" @click="playNext()" />
        </div>

        <!-- 下载与播放列表 -->
        <div class="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <!-- 音量控制 -->
          <div class="group/volume relative hidden items-center sm:flex">
            <UButton
              :icon="
                isMuted || audioVolume === 0
                  ? 'i-lucide-volume-x'
                  : audioVolume < 1 / 2
                    ? 'i-lucide-volume-1'
                    : 'i-lucide-volume-2'
              "
              size="sm"
              title="音量"
              variant="ghost"
              @click="toggleMute"
            />
            <!-- 增加一个隐形的、稍微大一点的热区容器以确保 hover 的稳定性 -->
            <div
              class="pointer-events-none absolute bottom-full left-1/2 w-12 -translate-x-1/2 pb-2 opacity-0 transition-all group-hover/volume:pointer-events-auto group-hover/volume:opacity-100"
            >
              <div
                class="flex h-48 flex-col items-center gap-3 rounded-lg border border-accented bg-default py-4 shadow-md"
              >
                <div class="text-center text-xs font-medium text-muted tabular-nums">
                  {{ Math.round((isMuted ? 0 : audioVolume) * 100) }}%
                </div>
                <div class="flex-1">
                  <USlider
                    :max="1"
                    :min="0"
                    :model-value="isMuted ? 0 : audioVolume"
                    orientation="vertical"
                    size="xs"
                    :step="0.01"
                    @update:model-value="setVolume"
                  />
                </div>
              </div>
            </div>
          </div>

          <UButton
            class="hidden shrink-0 sm:flex"
            :disabled="!playerDetail?.sourceUrl"
            icon="i-lucide-download"
            size="sm"
            :title="`下载 ${playerSong.name}`"
            variant="ghost"
            @click="downloadSong(playerSong)"
          />

          <UButton
            :color="isPlaylistOpen ? 'primary' : 'neutral'"
            icon="i-lucide-list-music"
            size="sm"
            title="播放列表"
            variant="ghost"
            @click="isPlaylistOpen = !isPlaylistOpen"
          />

          <!-- 关闭播放器 -->
          <UButton
            class="shrink-0"
            icon="i-lucide-x"
            size="sm"
            title="关闭播放器"
            variant="ghost"
            @click="
              playerSong = null;
              audioElement?.pause();
              isPlaying = false;
              isPlaylistOpen = false;
            "
          />
        </div>
      </div>

      <!-- 播放列表面板 -->
      <Transition name="playlist-slide">
        <div
          v-if="isPlaylistOpen"
          class="absolute right-0 bottom-full h-[60vh] w-full border-t border-t-default bg-default shadow-2xl backdrop-blur-md sm:right-4 sm:mb-4 sm:w-80 sm:rounded-xl sm:border sm:border-default"
        >
          <div class="flex h-full flex-col">
            <div class="flex items-center justify-between border-b border-b-default p-4">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold">播放列表</span>
                <span class="text-xs text-muted">{{ playerPlaylist.length }} 首</span>
              </div>
              <UButton
                color="neutral"
                icon="i-lucide-trash-2"
                label="清空"
                size="xs"
                variant="ghost"
                @click="clearPlaylist"
              />
            </div>
            <div class="flex-1 overflow-y-auto">
              <div
                v-for="(song, idx) in playerPlaylist"
                :key="song.cid + idx"
                class="group flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors hover:bg-muted"
                :class="{
                  'bg-primary/5 text-primary': isCurrentSong(song.cid) && playerIndex === idx,
                }"
                @click="playSong(song, playerPlaylist, idx)"
              >
                <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                  <img
                    :alt="song.name"
                    class="h-full w-full object-cover"
                    referrerpolicy="no-referrer"
                    :src="albumMap.get(song.albumCid)?.coverUrl"
                  />
                  <div
                    v-if="isCurrentSong(song.cid) && playerIndex === idx"
                    class="absolute inset-0 flex items-center justify-center bg-black/40"
                  >
                    <UIcon
                      class="text-white"
                      :name="isPlaying ? 'i-lucide-volume-2' : 'i-lucide-play'"
                    />
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium">{{ song.name }}</p>
                  <p class="truncate text-xs text-muted">{{ song.artists.join(' / ') }}</p>
                </div>
                <UButton
                  class="hidden group-hover:flex"
                  color="neutral"
                  icon="i-lucide-x"
                  size="xs"
                  variant="ghost"
                  @click.stop="removeFromPlaylist(idx)"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- 主内容区 -->
  <UContainer :class="{ 'pb-28': playerSong }">
    <UPage>
      <UPageHeader description="试听与下载塞壬唱片官网音乐" title="塞壬唱片">
        <template #headline>
          <UBadge v-if="!isLoading && !loadError" color="neutral" variant="subtle">
            {{ albums.length }} 张专辑 · {{ songs.length }} 首乐曲
          </UBadge>
        </template>
      </UPageHeader>

      <UPageBody>
        <!-- 错误状态 -->
        <UAlert
          v-if="loadError"
          class="mb-6"
          color="error"
          :description="loadError"
          icon="i-lucide-wifi-off"
          title="加载失败"
          variant="soft"
        >
          <template #footer>
            <div class="mt-2 flex gap-2">
              <UButton size="sm" @click="loadData">重试</UButton>
              <UButton
                color="neutral"
                size="sm"
                target="_blank"
                to="https://monster-siren.hypergryph.com"
                variant="ghost"
              >
                访问官网
              </UButton>
            </div>
          </template>
        </UAlert>

        <!-- 加载状态 -->
        <div v-else-if="isLoading" class="space-y-4 py-8">
          <div class="flex items-center gap-3 text-gray-500">
            <UIcon class="animate-spin text-xl" name="i-lucide-loader-circle" />
            <span>正在加载塞壬唱片数据…</span>
          </div>
          <div class="grid gap-3">
            <div v-for="i in 8" :key="i" class="h-16 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>

        <!-- 主界面 -->
        <div v-else class="space-y-4">
          <!-- 标签切换 -->
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-4">
              <UTabs
                v-model="viewTab"
                :content="false"
                :items="[
                  { label: '全部乐曲', value: 'songs', icon: 'i-lucide-music-2' },
                  { label: '按专辑浏览', value: 'albums', icon: 'i-lucide-disc-3' },
                ]"
              />
              <UButton
                v-if="viewTab === 'songs'"
                :icon="songViewMode === 'grid' ? 'i-lucide-grid' : 'i-lucide-list'"
                size="sm"
                :title="songViewMode === 'grid' ? '切换为列表视图' : '切换为网格视图'"
                variant="ghost"
                @click="songViewMode = songViewMode === 'grid' ? 'list' : 'grid'"
              />
            </div>

            <!-- 搜索框（仅全部乐曲视图显示）-->
            <div v-if="viewTab === 'songs'" class="w-full sm:w-72">
              <UInput
                v-model="searchQuery"
                class="w-full"
                icon="i-lucide-search"
                placeholder="搜索曲名、专辑、艺术家或 CID…"
              >
                <template v-if="searchQuery" #trailing>
                  <UButton icon="i-lucide-x" size="xs" variant="ghost" @click="searchQuery = ''" />
                </template>
              </UInput>
            </div>
          </div>

          <!-- ══════════════════════════════════════════════════════
               全部乐曲视图
               ══════════════════════════════════════════════════════ -->
          <template v-if="viewTab === 'songs'">
            <!-- 统计信息栏 -->
            <div class="flex items-center gap-2 text-sm text-muted">
              <span v-if="searchQuery">
                找到 <strong class="text-highlighted">{{ totalSongs }}</strong> 首
              </span>
              <span v-else>
                共 <strong class="text-highlighted">{{ totalSongs }}</strong> 首乐曲
              </span>
              <span v-if="totalPages > 1" class="opacity-60">
                · 第 {{ currentPage }} / {{ totalPages }} 页
              </span>
            </div>

            <!-- 乐曲列表 -->
            <div
              v-if="songViewMode === 'list'"
              class="divide-y divide-default overflow-hidden rounded-xl border"
            >
              <!-- 列表表头 -->
              <div
                class="hidden grid-cols-[2rem_2.5rem_1fr_1fr_3rem] items-center gap-4 bg-muted/50 px-4 py-2 text-xs font-medium text-gray-500 lg:grid"
              >
                <span class="text-center">#</span>
                <span />
                <span>曲名</span>
                <span>专辑</span>
                <span class="text-right">操作</span>
              </div>

              <!-- 乐曲行 -->
              <div
                v-for="(song, idx) in paginatedSongs"
                :key="song.cid"
                class="group flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted sm:px-4 lg:grid lg:grid-cols-[2rem_2.5rem_1fr_1fr_3rem]"
                :class="{ 'bg-primary/10': isCurrentSong(song.cid) }"
                @click="playSong(song, filteredSongs, (currentPage - 1) * PAGE_SIZE + idx)"
              >
                <!-- 序号 / 播放状态指示 -->
                <div class="w-5 shrink-0 text-center">
                  <template v-if="!isCurrentSong(song.cid)">
                    <span class="text-sm text-muted tabular-nums group-hover:hidden">
                      {{ (currentPage - 1) * PAGE_SIZE + idx + 1 }}
                    </span>
                    <UButton
                      class="hidden text-muted group-hover:inline-block"
                      color="neutral"
                      icon="i-lucide-play"
                      size="xs"
                      variant="ghost"
                    />
                  </template>
                  <template v-else>
                    <UButton
                      class="group-hover:hidden"
                      :icon="isPlaying ? 'i-lucide-volume-2' : 'i-lucide-play'"
                      size="xs"
                      variant="ghost"
                    />
                    <UButton
                      class="hidden group-hover:inline-block"
                      :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
                      size="xs"
                      variant="ghost"
                    />
                  </template>
                </div>

                <!-- 专辑封面 -->
                <div class="group/cover relative h-10 w-10 shrink-0">
                  <img
                    v-if="albumMap.get(song.albumCid)"
                    :alt="albumMap.get(song.albumCid)!.name"
                    class="h-full w-full cursor-zoom-in rounded-md object-cover shadow-sm"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    :src="albumMap.get(song.albumCid)!.coverUrl"
                    @click.stop="
                      previewCover(
                        albumMap.get(song.albumCid)!.coverUrl,
                        albumMap.get(song.albumCid)!.name,
                      )
                    "
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center rounded-md bg-muted text-gray-400"
                  >
                    <UIcon class="text-sm" name="i-lucide-disc" />
                  </div>
                </div>

                <!-- 曲名 / 艺术家 / CID -->
                <div class="min-w-0 flex-1">
                  <p
                    class="truncate text-sm font-medium"
                    :class="isCurrentSong(song.cid) ? 'text-primary' : 'text-highlighted'"
                  >
                    {{ song.name }}
                  </p>
                  <p class="truncate text-xs text-muted">
                    {{ song.artists.join(' / ') }}
                    <span class="mx-1 opacity-40">·</span>
                    CID: {{ song.cid }}
                  </p>
                </div>

                <!-- 专辑名 / 专辑 ID（桌面端）-->
                <div class="hidden min-w-0 lg:block">
                  <p class="truncate text-sm text-muted">
                    {{ albumMap.get(song.albumCid)?.name ?? song.albumCid }}
                  </p>
                  <p class="text-xs text-gray-400">{{ song.albumCid }}</p>
                </div>

                <!-- 下载按钮 -->
                <div class="flex shrink-0 items-center justify-end">
                  <UButton
                    :class="{ 'animate-spin': loadingDetailCids.has(song.cid) }"
                    :disabled="loadingDetailCids.has(song.cid)"
                    :icon="
                      loadingDetailCids.has(song.cid)
                        ? 'i-lucide-loader-circle'
                        : 'i-lucide-download'
                    "
                    size="xs"
                    title="下载"
                    variant="ghost"
                    @click.stop="downloadSong(song)"
                  />
                </div>
              </div>

              <!-- 搜索无结果 -->
              <div v-if="paginatedSongs.length === 0" class="py-12">
                <div class="flex items-center justify-center gap-2 text-muted">
                  <UIcon class="" name="i-lucide-search-x" />
                  没有找到匹配的乐曲
                </div>
              </div>
            </div>

            <!-- 网格视图 (移动友好) -->
            <div
              v-else
              class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            >
              <div
                v-for="(song, idx) in paginatedSongs"
                :key="song.cid + '-grid'"
                class="group flex cursor-pointer flex-col gap-2 rounded-xl border border-transparent p-3 transition-all hover:bg-muted hover:shadow-md"
                :class="{ 'bg-primary/5 ring-1 ring-primary/20': isCurrentSong(song.cid) }"
                @click="playSong(song, filteredSongs, (currentPage - 1) * PAGE_SIZE + idx)"
              >
                <!-- 封面图 -->
                <div
                  class="relative aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-sm"
                >
                  <img
                    v-if="albumMap.get(song.albumCid)"
                    :alt="song.name"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    :src="albumMap.get(song.albumCid)!.coverUrl"
                  />
                  <!-- 覆盖层 -->
                  <div
                    class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20"
                  >
                    <div
                      class="flex scale-90 items-center justify-center rounded-full bg-primary p-2 text-white opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100"
                    >
                      <UIcon
                        :name="
                          isCurrentSong(song.cid) && isPlaying ? 'i-lucide-pause' : 'i-lucide-play'
                        "
                        size="20"
                      />
                    </div>
                  </div>
                </div>
                <!-- 曲信息 -->
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-highlighted" :title="song.name">
                    {{ song.name }}
                  </p>
                  <p class="truncate text-xs text-muted" :title="song.artists.join(' / ')">
                    {{ song.artists.join(' / ') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div v-if="totalPages > 1" class="flex justify-center pt-2">
              <UPagination
                v-model:page="currentPage"
                :items-per-page="PAGE_SIZE"
                :total="totalSongs"
              />
            </div>
          </template>

          <!-- ══════════════════════════════════════════════════════
               按专辑浏览视图
               ══════════════════════════════════════════════════════ -->
          <template v-else>
            <!-- 专辑详情视图 -->
            <template v-if="selectedAlbumCid && selectedAlbum">
              <!-- 返回按钮 -->
              <div class="mb-4">
                <UButton
                  icon="i-lucide-arrow-left"
                  variant="ghost"
                  @click="selectedAlbumCid = null"
                >
                  返回专辑列表
                </UButton>
              </div>

              <!-- 专辑头图卡片 -->
              <div class="dark relative mb-6 overflow-hidden rounded-2xl shadow-xl">
                <!-- 底层：完整清晰原图 -->
                <div class="absolute inset-0">
                  <img
                    :alt="selectedAlbum.name"
                    class="h-full w-full scale-110 object-cover"
                    referrerpolicy="no-referrer"
                    :src="currentAlbumDetail?.coverDeUrl || selectedAlbum.coverUrl"
                  />
                </div>

                <!-- 中层：模糊暗化层——小屏全覆盖；大屏仅覆盖左侧，向右渐退 -->
                <div
                  class="absolute inset-0 md:mask-[linear-gradient(to_right,black_40%,transparent_90%)]"
                >
                  <img
                    :alt="selectedAlbum.name"
                    class="h-full w-full scale-110 object-cover blur-md brightness-40 saturate-60"
                    referrerpolicy="no-referrer"
                    :src="currentAlbumDetail?.coverDeUrl || selectedAlbum.coverUrl"
                  />
                </div>

                <!-- 顶层渐变：小屏从上到下渐暗；大屏从左到右渐隐 -->
                <div
                  class="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/50 md:bg-linear-to-r md:from-black/50 md:via-transparent md:to-transparent"
                />

                <!-- 头图正文内容 -->
                <div class="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end">
                  <!-- 方形封面 -->
                  <div class="group/album-cover relative h-36 w-36 shrink-0 sm:h-44 sm:w-44">
                    <img
                      :alt="selectedAlbum.name"
                      class="h-full w-full cursor-zoom-in rounded-2xl object-cover shadow-xl ring-2 ring-white/20"
                      referrerpolicy="no-referrer"
                      :src="selectedAlbum.coverUrl"
                      @click="previewCover(selectedAlbum.coverUrl, selectedAlbum.name)"
                    />
                    <div
                      class="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 opacity-0 transition-opacity group-hover/album-cover:opacity-100"
                    >
                      <UIcon class="text-2xl text-white" name="i-lucide-zoom-in" />
                    </div>
                  </div>

                  <!-- 文字信息 -->
                  <div class="flex min-w-0 flex-1 flex-col gap-2 text-default">
                    <!-- 标签行 -->
                    <div class="flex flex-wrap items-center gap-2">
                      <UBadge
                        class="rounded-full bg-inverted/20 px-2.5 py-0.5 text-default backdrop-blur-sm"
                        >专辑</UBadge
                      >
                      <UBadge
                        v-if="currentAlbumDetail?.belong"
                        class="rounded-full bg-inverted/20 px-2.5 py-0.5 text-default backdrop-blur-sm"
                      >
                        <UIcon class="text-white/70" name="i-lucide-tag" />
                        {{ currentAlbumDetail.belong }}
                      </UBadge>
                      <UBadge
                        v-if="isLoadingAlbumDetail"
                        class="rounded-full bg-inverted/20 px-2.5 py-0.5 text-default backdrop-blur-sm"
                      >
                        <UIcon class="animate-spin text-white/70" name="i-lucide-loader-circle" />
                        加载详情中
                      </UBadge>
                    </div>

                    <!-- 专辑标题 -->
                    <h2 class="mbs-2 text-2xl font-bold text-highlighted sm:text-4xl">
                      {{ selectedAlbum.name }}
                    </h2>

                    <!-- 艺术家 -->
                    <p class="text-sm text-white/80">
                      {{ (currentAlbumDetail?.artistes ?? selectedAlbum.artistes).join(' / ') }}
                    </p>

                    <!-- 统计信息 -->
                    <p class="text-xs text-white/60">
                      {{ albumSongCount.get(selectedAlbumCid) ?? 0 }} 首曲目
                      <span class="mx-1.5 opacity-40">·</span>
                      CID: {{ selectedAlbumCid }}
                    </p>

                    <!-- 操作按钮 -->
                    <div class="mt-1 flex flex-wrap gap-2">
                      <UButton
                        class="light"
                        icon="i-lucide-play"
                        size="sm"
                        @click="
                          selectedAlbumSongs.length > 0 &&
                          playSong(selectedAlbumSongs[0]!, selectedAlbumSongs, 0)
                        "
                      >
                        播放全部
                      </UButton>
                    </div>
                  </div>
                </div>

                <!-- 专辑简介嵌入头图底部 -->
                <Transition name="album-detail-fade">
                  <div
                    v-if="currentAlbumDetail?.intro"
                    class="relative border-t border-white/10 bg-black/25 px-6 py-4 backdrop-blur-sm"
                  >
                    <div
                      class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-white/60 uppercase"
                    >
                      <UIcon name="i-lucide-book-open" />
                      <span>专辑简介</span>
                    </div>
                    <p class="text-sm leading-relaxed text-white/80">
                      {{ currentAlbumDetail.intro }}
                    </p>
                  </div>
                </Transition>
              </div>

              <!-- 专辑曲目列表 -->
              <div class="divide-y divide-default overflow-hidden rounded-xl border">
                <!-- 列表表头 -->
                <div
                  class="hidden grid-cols-[2rem_2.5rem_1fr_1fr_3rem] items-center gap-4 bg-muted/50 px-4 py-2 text-xs font-medium text-gray-500 lg:grid"
                >
                  <span class="text-center">#</span>
                  <span />
                  <span>曲名</span>
                  <span>专辑</span>
                  <span class="text-right">操作</span>
                </div>

                <div
                  v-for="(song, idx) in selectedAlbumSongs"
                  :key="song.cid"
                  class="group flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted lg:grid lg:grid-cols-[2rem_2.5rem_1fr_1fr_3rem]"
                  :class="{ 'bg-primary/10': isCurrentSong(song.cid) }"
                  @click="playSong(song, selectedAlbumSongs, idx)"
                >
                  <!-- 序号 / 播放状态指示 -->
                  <div class="w-5 shrink-0 text-center">
                    <template v-if="!isCurrentSong(song.cid)">
                      <span class="text-sm text-muted tabular-nums group-hover:hidden">
                        {{ idx + 1 }}
                      </span>
                      <UButton
                        class="hidden text-muted group-hover:inline-block"
                        color="neutral"
                        icon="i-lucide-play"
                        size="xs"
                        variant="ghost"
                      />
                    </template>
                    <template v-else>
                      <UButton
                        class="group-hover:hidden"
                        :icon="isPlaying ? 'i-lucide-volume-2' : 'i-lucide-play'"
                        size="xs"
                        variant="ghost"
                      />
                      <UButton
                        class="hidden group-hover:inline-block"
                        :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
                        size="xs"
                        variant="ghost"
                      />
                    </template>
                  </div>

                  <!-- 专辑封面 -->
                  <div class="relative h-10 w-10 shrink-0">
                    <img
                      v-if="albumMap.get(song.albumCid)"
                      :alt="albumMap.get(song.albumCid)!.name"
                      class="h-full w-full cursor-zoom-in rounded-md object-cover shadow-sm"
                      loading="lazy"
                      referrerpolicy="no-referrer"
                      :src="albumMap.get(song.albumCid)!.coverUrl"
                      @click.stop="
                        previewCover(
                          albumMap.get(song.albumCid)!.coverUrl,
                          albumMap.get(song.albumCid)!.name,
                        )
                      "
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center rounded-md bg-muted text-gray-400"
                    >
                      <UIcon class="text-sm" name="i-lucide-disc" />
                    </div>
                  </div>

                  <!-- 曲目名 / 艺术家 / CID -->
                  <div class="min-w-0 flex-1">
                    <p
                      class="truncate text-sm font-medium"
                      :class="isCurrentSong(song.cid) ? 'text-primary' : 'text-highlighted'"
                    >
                      {{ song.name }}
                    </p>
                    <p class="truncate text-xs text-muted">
                      {{ song.artists.join(' / ') }}
                      <span class="mx-1 opacity-40">·</span>
                      CID: {{ song.cid }}
                    </p>
                  </div>

                  <!-- 专辑名 / 专辑 ID（桌面端）-->
                  <div class="hidden min-w-0 lg:block">
                    <p class="truncate text-sm text-muted">
                      {{ albumMap.get(song.albumCid)?.name ?? song.albumCid }}
                    </p>
                    <p class="text-xs text-gray-400">{{ song.albumCid }}</p>
                  </div>

                  <!-- 下载按钮 -->
                  <div class="flex shrink-0 items-center justify-end">
                    <UButton
                      :class="{ 'animate-spin': loadingDetailCids.has(song.cid) }"
                      :disabled="loadingDetailCids.has(song.cid)"
                      :icon="
                        loadingDetailCids.has(song.cid)
                          ? 'i-lucide-loader-circle'
                          : 'i-lucide-download'
                      "
                      size="xs"
                      title="下载"
                      variant="ghost"
                      @click.stop="downloadSong(song)"
                    />
                  </div>
                </div>

                <div v-if="selectedAlbumSongs.length === 0" class="py-8 text-center text-gray-400">
                  <p>该专辑暂无曲目</p>
                </div>
              </div>
            </template>

            <!-- 专辑网格 -->
            <template v-else>
              <div
                class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
              >
                <div
                  v-for="album in albums"
                  :key="album.cid"
                  class="group cursor-pointer rounded-2xl p-3 transition-all hover:bg-muted hover:shadow-md"
                  @click="selectedAlbumCid = album.cid"
                >
                  <div class="relative mb-3 overflow-hidden rounded-xl shadow-md">
                    <img
                      :alt="album.name"
                      class="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      referrerpolicy="no-referrer"
                      :src="album.coverUrl"
                    />
                    <!-- 悬停遮罩 -->
                    <div
                      class="absolute inset-0 flex items-end justify-end gap-3 bg-black/40 p-3 opacity-0 backdrop-blur-[2px] transition-all group-hover:opacity-100"
                    >
                      <UButton
                        class="light rounded-full shadow-sm"
                        color="neutral"
                        icon="i-lucide-play"
                        size="md"
                        variant="soft"
                        @click.stop="
                          playSong(
                            songs.find((s) => s.albumCid === album.cid)!,
                            songs.filter((s) => s.albumCid === album.cid),
                            0,
                          )
                        "
                      />
                      <UButton
                        class="light cursor-zoom-in rounded-full shadow-sm"
                        color="neutral"
                        icon="i-lucide-zoom-in"
                        size="md"
                        variant="soft"
                        @click.stop="previewCover(album.coverUrl, album.name)"
                      />
                    </div>
                  </div>
                  <p class="line-clamp-2 text-sm font-medium text-highlighted">{{ album.name }}</p>
                  <p class="mt-0.5 truncate text-xs text-muted">
                    {{ albumSongCount.get(album.cid) ?? 0 }} 首
                    <span class="mx-1 opacity-40">·</span>
                    {{ album.artistes.join(' / ') }}
                  </p>
                </div>
              </div>
            </template>
          </template>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
.album-detail-fade-enter-active,
.album-detail-fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}
.album-detail-fade-enter-from,
.album-detail-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.player-slide-enter-active,
.player-slide-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}
.player-slide-enter-from,
.player-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.playlist-slide-enter-active,
.playlist-slide-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s ease;
}
.playlist-slide-enter-from,
.playlist-slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

@media (min-width: 640px) {
  .playlist-slide-enter-from,
  .playlist-slide-leave-to {
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }
}
</style>
