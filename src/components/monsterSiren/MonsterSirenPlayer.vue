<script setup lang="ts">
import type { Album, PlayMode, Song } from '@/types/monsterSiren';

const props = defineProps<{
  playerSong: Song | null;
  playerAlbum: Album | null;
  playerPlaylist: Song[];
  playerIndex: number;
  isPlaying: boolean;
  isLoadingPlayerDetail: boolean;
  audioError: boolean;
  audioCurrentTime: number;
  audioDuration: number;
  audioVolume: number;
  isMuted: boolean;
  progressPercent: number;
  playMode: PlayMode;
  playModeIcons: Record<PlayMode, string>;
  playModeLabels: Record<PlayMode, string>;
  isPlaylistOpen: boolean;
  canDownloadCurrent: boolean;
  albumMap: Map<string, Album>;
  isCurrentSong: (cid: string) => boolean;
  formatTime: (seconds: number) => string;
  onSeekAudio: (event: Event) => void;
  onTogglePlayMode: () => void;
  onPlayPrev: () => void;
  onTogglePlay: () => void;
  onPlayNext: () => void;
  onToggleMute: () => void;
  onSetVolume: (val: number | undefined) => void;
  onDownloadSong: (song: Song) => void;
  onTogglePlaylist: () => void;
  onClosePlayer: () => void;
  onClearPlaylist: () => void;
  onRemoveFromPlaylist: (index: number) => void;
  onPlaySong: (song: Song, playlist: Song[], index: number) => void;
}>();
</script>

<template>
  <Transition name="player-slide">
    <div
      v-if="props.playerSong"
      class="fixed bottom-0 left-0 z-50 w-full border-t border-t-default bg-default/95 shadow-2xl backdrop-blur-md"
    >
      <div
        class="group/progress relative h-1 w-full bg-gray-200 transition-all hover:h-1.5 dark:bg-gray-700"
      >
        <div
          class="h-full bg-primary transition-all duration-100"
          :style="{ width: `${props.progressPercent}%` }"
        />
        <input
          class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          :max="props.audioDuration || 100"
          min="0"
          step="1"
          type="range"
          :value="props.audioCurrentTime"
          @input="props.onSeekAudio"
        />
      </div>

      <div class="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
        <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow sm:h-12 sm:w-12">
          <img
            v-if="props.playerAlbum"
            :alt="props.playerAlbum.name"
            class="h-full w-full object-cover"
            referrerpolicy="no-referrer"
            :src="props.playerAlbum.coverUrl"
          />
          <div v-else class="flex h-full w-full items-center justify-center bg-muted text-gray-400">
            <UIcon name="i-lucide-music" />
          </div>
          <div
            v-if="props.isPlaying"
            class="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-white/30"
          />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 sm:gap-2">
            <p class="truncate text-xs font-semibold text-highlighted sm:text-sm">
              {{ props.playerSong.name }}
            </p>
            <UBadge v-if="props.audioError" color="error" size="xs" variant="soft">
              加载失败
            </UBadge>
            <UBadge v-else-if="props.isLoadingPlayerDetail" size="xs" variant="soft">
              <UIcon class="animate-spin" name="i-lucide-loader-circle" />
              <span class="hidden sm:inline">加载中</span>
            </UBadge>
          </div>
          <p class="truncate text-[10px] text-muted sm:text-xs">
            {{ props.playerAlbum?.name ?? `专辑 ${props.playerSong.albumCid}` }}
            <span class="mx-0.5 opacity-50 sm:mx-1">·</span>
            {{ props.playerSong.artists.join(' / ') }}
          </p>
        </div>

        <div class="hidden shrink-0 text-xs text-muted tabular-nums md:block">
          {{ props.formatTime(props.audioCurrentTime) }} /
          {{ props.formatTime(props.audioDuration) }}
        </div>

        <div class="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <UButton
            class="hidden sm:flex"
            :icon="props.playModeIcons[props.playMode]"
            size="sm"
            :title="props.playModeLabels[props.playMode]"
            variant="ghost"
            @click="props.onTogglePlayMode"
          />
          <UButton
            class="hidden sm:flex"
            icon="i-lucide-skip-back"
            size="sm"
            variant="ghost"
            @click="props.onPlayPrev"
          />
          <UButton
            :class="{ 'animate-spin': props.isLoadingPlayerDetail }"
            :disabled="props.isLoadingPlayerDetail"
            :icon="
              props.isLoadingPlayerDetail
                ? 'i-lucide-loader-circle'
                : props.isPlaying
                  ? 'i-lucide-pause'
                  : 'i-lucide-play'
            "
            size="md"
            @click="props.onTogglePlay"
          />
          <UButton
            icon="i-lucide-skip-forward"
            size="sm"
            variant="ghost"
            @click="props.onPlayNext"
          />
        </div>

        <div class="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <div class="group/volume relative hidden items-center sm:flex">
            <UButton
              :icon="
                props.isMuted || props.audioVolume === 0
                  ? 'i-lucide-volume-x'
                  : props.audioVolume < 1 / 2
                    ? 'i-lucide-volume-1'
                    : 'i-lucide-volume-2'
              "
              size="sm"
              title="音量"
              variant="ghost"
              @click="props.onToggleMute"
            />
            <div
              class="pointer-events-none absolute bottom-full left-1/2 w-12 -translate-x-1/2 pb-2 opacity-0 transition-all group-hover/volume:pointer-events-auto group-hover/volume:opacity-100"
            >
              <div
                class="flex h-48 flex-col items-center gap-3 rounded-lg border border-accented bg-default py-4 shadow-md"
              >
                <div class="text-center text-xs font-medium text-muted tabular-nums">
                  {{ Math.round((props.isMuted ? 0 : props.audioVolume) * 100) }}%
                </div>
                <div class="flex-1">
                  <USlider
                    :max="1"
                    :min="0"
                    :model-value="props.isMuted ? 0 : props.audioVolume"
                    orientation="vertical"
                    size="xs"
                    :step="0.01"
                    @update:model-value="props.onSetVolume"
                  />
                </div>
              </div>
            </div>
          </div>

          <UButton
            class="hidden shrink-0 sm:flex"
            :disabled="!props.playerSong || !props.canDownloadCurrent"
            icon="i-lucide-download"
            size="sm"
            :title="props.playerSong ? `下载 ${props.playerSong.name}` : '下载'"
            variant="ghost"
            @click="props.playerSong && props.onDownloadSong(props.playerSong)"
          />

          <UButton
            :color="props.isPlaylistOpen ? 'primary' : 'neutral'"
            icon="i-lucide-list-music"
            size="sm"
            title="播放列表"
            variant="ghost"
            @click="props.onTogglePlaylist"
          />

          <UButton
            class="shrink-0"
            icon="i-lucide-x"
            size="sm"
            title="关闭播放器"
            variant="ghost"
            @click="props.onClosePlayer"
          />
        </div>
      </div>

      <Transition name="playlist-slide">
        <div
          v-if="props.isPlaylistOpen"
          class="absolute right-0 bottom-full h-[60vh] w-full border-t border-t-default bg-default shadow-2xl backdrop-blur-md sm:right-4 sm:mb-4 sm:w-80 sm:rounded-xl sm:border sm:border-default"
        >
          <div class="flex h-full flex-col">
            <div class="flex items-center justify-between border-b border-b-default p-4">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold">播放列表</span>
                <span class="text-xs text-muted">{{ props.playerPlaylist.length }} 首</span>
              </div>
              <UButton
                color="neutral"
                icon="i-lucide-trash-2"
                label="清空"
                size="xs"
                variant="ghost"
                @click="props.onClearPlaylist"
              />
            </div>
            <div class="flex-1 overflow-y-auto">
              <div
                v-for="(song, idx) in props.playerPlaylist"
                :key="song.cid + idx"
                class="group flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors hover:bg-muted"
                :class="{
                  'bg-primary/5 text-primary':
                    props.isCurrentSong(song.cid) && props.playerIndex === idx,
                }"
                @click="props.onPlaySong(song, props.playerPlaylist, idx)"
              >
                <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                  <img
                    :alt="song.name"
                    class="h-full w-full object-cover"
                    referrerpolicy="no-referrer"
                    :src="props.albumMap.get(song.albumCid)?.coverUrl"
                  />
                  <div
                    v-if="props.isCurrentSong(song.cid) && props.playerIndex === idx"
                    class="absolute inset-0 flex items-center justify-center bg-black/40"
                  >
                    <UIcon
                      class="text-white"
                      :name="props.isPlaying ? 'i-lucide-volume-2' : 'i-lucide-play'"
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
                  @click.stop="props.onRemoveFromPlaylist(idx)"
                />
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
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
