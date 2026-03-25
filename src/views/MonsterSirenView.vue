<script setup lang="ts">
import type { Tab } from '@/types/monsterSiren';

import MonsterSirenAlbumsTab from '@/components/monsterSiren/MonsterSirenAlbumsTab.vue';
import MonsterSirenPlayer from '@/components/monsterSiren/MonsterSirenPlayer.vue';
import MonsterSirenSongsTab from '@/components/monsterSiren/MonsterSirenSongsTab.vue';
import { useAudioControl } from '@/composables/monsterSiren/useAudioControl';
import { useMonsterSirenApi } from '@/composables/monsterSiren/useMonsterSirenApi';
import { useMusicPlayer } from '@/composables/monsterSiren/useMusicPlayer';
import { useSongFilterPagination } from '@/composables/monsterSiren/useSongFilterPagination';
import { useViewMode } from '@/composables/monsterSiren/useViewMode';
import { computed, onMounted, useTemplateRef, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// ─── 界面状态 ─────────────────────────────────────────────────────────────────────
const route = useRoute();
const router = useRouter();

const audioElement = useTemplateRef('audioElement');
const {
  isLoading,
  loadError,
  albums,
  songs,
  loadingDetailCids,
  isLoadingAlbumDetail,
  currentAlbumDetail,
  albumMap,
  albumSongCount,
  loadData,
  getSongDetail,
  getAlbumDetail,
} = useMonsterSirenApi();

const {
  songViewMode,
  viewTab,
  selectedAlbumCid,
  switchTab,
  openAlbumDetail,
  backToAlbums,
  toggleSongViewMode,
} = useViewMode(route, router);

const {
  PAGE_SIZE,
  searchQuery,
  currentPage,
  filteredSongs,
  totalSongs,
  totalPages,
  paginatedSongs,
} = useSongFilterPagination(songs, albumMap);

const {
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
} = useMusicPlayer(audioElement, albumMap, getSongDetail);

const {
  audioCurrentTime,
  audioDuration,
  audioVolume,
  isMuted,
  progressPercent,
  onAudioTimeUpdate,
  onAudioDurationChange,
  onAudioVolumeChange,
  onAudioEnded,
  seekAudio,
  setVolume,
  toggleMute,
  formatTime,
} = useAudioControl(audioElement, () => {
  if (playMode.value === 'single') {
    if (audioElement.value) {
      audioElement.value.currentTime = 0;
      audioElement.value.play();
    }
  } else {
    playNext(false);
  }
});

const selectedAlbum = computed(() =>
  selectedAlbumCid.value ? albumMap.value.get(selectedAlbumCid.value) : null,
);

const selectedAlbumSongs = computed(() => {
  if (!selectedAlbumCid.value) return [];
  return songs.value.filter((s) => s.albumCid === selectedAlbumCid.value);
});

// ─── 侦听器 ───────────────────────────────────────────────────────────────────────
watch(
  selectedAlbumCid,
  async (cid) => {
    if (!cid) {
      currentAlbumDetail.value = null;
      return;
    }
    currentAlbumDetail.value = null;
    const data = await getAlbumDetail(cid);
    if (data) currentAlbumDetail.value = data;
  },
  { immediate: true },
);

// ─── 图片预览 ────────────────────────────────────────────────────────────────────────
const imagePreview = useTemplateRef('imagePreview');

function previewCover(url: string, name: string) {
  imagePreview.value?.open({ url, name, downloadName: name });
}

// ─── 生命周期 ──────────────────────────────────────────────────────────────────────
onMounted(loadData);
</script>

<template>
  <AppImagePreview ref="imagePreview" />

  <audio
    ref="audioElement"
    class="hidden"
    @durationchange="onAudioDurationChange"
    @ended="onAudioEnded"
    @error="onAudioError"
    @timeupdate="onAudioTimeUpdate"
    @volumechange="onAudioVolumeChange"
  />

  <MonsterSirenPlayer
    v-bind="{
      playerSong,
      playerAlbum: playerAlbum ?? null,
      playerPlaylist,
      playerIndex,
      isPlaying,
      isLoadingPlayerDetail,
      audioError,
      audioCurrentTime,
      audioDuration,
      audioVolume,
      isMuted,
      progressPercent,
      playMode,
      playModeIcons,
      playModeLabels,
      isPlaylistOpen,
      canDownloadCurrent: !!playerDetail?.sourceUrl,
      albumMap,
      isCurrentSong,
      formatTime,
      onSeekAudio: seekAudio,
      onTogglePlayMode: togglePlayMode,
      onPlayPrev: playPrev,
      onTogglePlay: togglePlay,
      onPlayNext: () => playNext(),
      onToggleMute: toggleMute,
      onSetVolume: setVolume,
      onDownloadSong: downloadSong,
      onTogglePlaylist: () => (isPlaylistOpen = !isPlaylistOpen),
      onClosePlayer: closePlayer,
      onClearPlaylist: clearPlaylist,
      onRemoveFromPlaylist: removeFromPlaylist,
      onPlaySong: playSong,
    }"
  />

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

        <div v-else-if="isLoading" class="space-y-4 py-8">
          <div class="flex items-center gap-3 text-gray-500">
            <UIcon class="animate-spin text-xl" name="i-lucide-loader-circle" />
            <span>正在加载塞壬唱片数据…</span>
          </div>
          <div class="grid gap-3">
            <div v-for="i in 8" :key="i" class="h-16 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-4">
              <UTabs
                :content="false"
                :items="[
                  { label: '全部乐曲', value: 'songs', icon: 'i-lucide-music-2' },
                  { label: '按专辑浏览', value: 'albums', icon: 'i-lucide-disc-3' },
                ]"
                :model-value="viewTab"
                @update:model-value="(val) => switchTab(val as Tab)"
              />
              <UButton
                v-if="viewTab === 'songs'"
                :icon="songViewMode === 'grid' ? 'i-lucide-grid' : 'i-lucide-list'"
                size="sm"
                :title="songViewMode === 'grid' ? '切换为列表视图' : '切换为网格视图'"
                variant="ghost"
                @click="toggleSongViewMode"
              />
            </div>

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

          <template v-if="viewTab === 'songs'">
            <MonsterSirenSongsTab
              v-bind="{
                searchQuery,
                totalSongs,
                totalPages,
                currentPage,
                paginatedSongs,
                filteredSongs,
                pageSize: PAGE_SIZE,
                songViewMode,
                albumMap,
                isPlaying,
                loadingDetailCids,
                isCurrentSong,
                onPlaySong: playSong,
                onDownloadSong: downloadSong,
                onPreviewCover: previewCover,
              }"
              @update:current-page="(page) => (currentPage = page)"
            />
          </template>

          <template v-else>
            <MonsterSirenAlbumsTab
              v-bind="{
                albums,
                songs,
                selectedAlbumCid,
                selectedAlbum: selectedAlbum ?? null,
                selectedAlbumSongs,
                currentAlbumDetail,
                isLoadingAlbumDetail,
                albumSongCount,
                albumMap,
                isPlaying,
                loadingDetailCids,
                isCurrentSong,
                onBackToAlbums: backToAlbums,
                onOpenAlbumDetail: openAlbumDetail,
                onPlaySong: playSong,
                onDownloadSong: downloadSong,
                onPreviewCover: previewCover,
              }"
            />
          </template>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
