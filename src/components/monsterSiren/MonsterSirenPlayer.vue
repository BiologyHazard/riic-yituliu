<script setup lang="ts">
import type { PreviewTarget } from '@/composables/useImagePreview';
import type { Album, PlayMode, Song } from '@/types/monsterSiren';
import { watch } from 'vue';

const props = defineProps<{
  playerSong: Song | null;
  playerAlbum: Album | null;
  playerPlaylist: Song[];
  playerIndex: number | null;
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
  canDownloadCurrent: boolean;
  albumMap: Map<string, Album>;
  isCurrentSong: (cid: string) => boolean;
  formatTime: (seconds: number) => string;
}>();

const emit = defineEmits<{
  previewImage: [target: PreviewTarget];
  seekAudio: [event: InputEvent];
  togglePlayMode: [];
  playPrev: [];
  togglePlay: [];
  playNext: [];
  toggleMute: [];
  setVolume: [val: number | undefined];
  downloadSong: [song: Song];
  closePlayer: [];
  clearPlaylist: [];
  removeFromPlaylist: [index: number];
  playSong: [song: Song, playlist: Song[], index: number];
}>();

const isPlaylistOpen = defineModel<boolean>('isPlaylistOpen');
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
          @input="(event) => emit('seekAudio', event)"
        />
      </div>

      <div class="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3">
        <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow sm:h-12 sm:w-12">
          <ImagePreviewContainer
            v-if="props.playerAlbum?.coverUrl"
            @click="
              emit('previewImage', {
                url: props.playerAlbum.coverUrl,
                name: props.playerAlbum.name,
                downloadName: props.playerAlbum.name,
              })
            "
          >
            <img
              v-if="props.playerAlbum"
              :alt="props.playerAlbum.name"
              class="h-full w-full object-cover"
              referrerpolicy="no-referrer"
              :src="props.playerAlbum.coverUrl"
            />
          </ImagePreviewContainer>
          <div v-else class="flex h-full w-full items-center justify-center bg-muted text-gray-400">
            <UIcon name="i-lucide-music" />
          </div>
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
          <UTooltip :text="props.playModeLabels[props.playMode]">
            <UButton
              class="hidden sm:flex"
              :icon="props.playModeIcons[props.playMode]"
              size="sm"
              variant="ghost"
              @click="emit('togglePlayMode')"
            />
          </UTooltip>
          <UTooltip text="上一首">
            <UButton
              class="hidden sm:flex"
              icon="i-lucide-skip-back"
              size="sm"
              variant="ghost"
              @click="emit('playPrev')"
            />
          </UTooltip>
          <UTooltip :text="props.isPlaying ? '暂停' : '播放'">
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
              @click="emit('togglePlay')"
            />
          </UTooltip>
          <UTooltip text="下一首">
            <UButton
              icon="i-lucide-skip-forward"
              size="sm"
              variant="ghost"
              @click="emit('playNext')"
            />
          </UTooltip>
        </div>

        <div class="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <div class="group/volume relative hidden items-center sm:flex">
            <UTooltip text="音量">
              <UButton
                :icon="
                  props.isMuted || props.audioVolume === 0
                    ? 'i-lucide-volume-x'
                    : props.audioVolume < 1 / 2
                      ? 'i-lucide-volume-1'
                      : 'i-lucide-volume-2'
                "
                size="sm"
                variant="ghost"
                @click="emit('toggleMute')"
              />
            </UTooltip>
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
                    @update:model-value="(event) => emit('setVolume', event)"
                  />
                </div>
              </div>
            </div>
          </div>

          <UTooltip :text="props.playerSong ? `下载 ${props.playerSong.name}` : '下载'">
            <UButton
              :disabled="!props.playerSong || !props.canDownloadCurrent"
              icon="i-lucide-download"
              size="sm"
              variant="ghost"
              @click="emit('downloadSong', props.playerSong)"
            />
          </UTooltip>
          <UTooltip text="播放列表">
            <UButton
              :color="isPlaylistOpen ? 'primary' : 'neutral'"
              icon="i-lucide-list-music"
              size="sm"
              variant="ghost"
              @click="isPlaylistOpen = !isPlaylistOpen"
            />
          </UTooltip>
          <UTooltip text="关闭播放器">
            <UButton
              class="shrink-0"
              icon="i-lucide-x"
              size="sm"
              variant="ghost"
              @click="emit('closePlayer')"
            />
          </UTooltip>
        </div>
      </div>

      <MonsterSirenPlaylist
        :album-map="props.albumMap"
        :is-playing="props.isPlaying"
        :is-playlist-open="Boolean(isPlaylistOpen)"
        :player-index="props.playerIndex"
        :player-song="props.playerSong"
        :playlist="props.playerPlaylist"
        @clear-playlist="emit('clearPlaylist')"
        @play-song="(song, playlist, index) => emit('playSong', song, playlist, index)"
        @remove-from-playlist="(index) => emit('removeFromPlaylist', index)"
      />
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
</style>
