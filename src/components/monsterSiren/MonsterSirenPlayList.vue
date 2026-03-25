<script setup lang="ts">
import type { Album, Song } from '@/types/monsterSiren';

const props = defineProps<{
  playerSong: Song | null;
  playList: Song[];
  playerIndex: number | null;
  isPlaying: boolean;
  isPlaylistOpen: boolean;
  albumMap: Map<string, Album>;
}>();

const emit = defineEmits<{
  removeFromPlayList: [index: number];
  playSong: [song: Song, playlist: Song[], index: number];
  clearPlaylist: [];
}>();
</script>

<template>
  <Transition name="playlist-slide">
    <div
      v-if="props.isPlaylistOpen"
      class="absolute right-0 bottom-full h-[60vh] w-full border-t border-t-default bg-default shadow-2xl backdrop-blur-md sm:right-4 sm:mb-4 sm:w-80 sm:rounded-xl sm:border sm:border-default"
    >
      <div class="flex h-full flex-col">
        <div class="flex items-center justify-between border-b border-b-default p-4">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold">播放列表</span>
            <span class="text-xs text-muted">{{ props.playList.length }} 首</span>
          </div>
          <UButton
            color="neutral"
            icon="i-lucide-trash-2"
            label="清空"
            size="xs"
            variant="ghost"
            @click="emit('clearPlaylist')"
          />
        </div>
        <div class="flex-1 overflow-y-auto">
          <div
            v-for="(song, idx) in props.playList"
            :key="song.cid + idx"
            class="group flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors hover:bg-muted"
            :class="{
              'bg-primary/5 text-primary':
                props.playerSong?.cid === song.cid && props.playerIndex === idx,
            }"
            @click="emit('playSong', song, props.playList, idx)"
          >
            <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded">
              <img
                :alt="song.name"
                class="h-full w-full object-cover"
                referrerpolicy="no-referrer"
                :src="props.albumMap.get(song.albumCid)?.coverUrl"
              />
              <div
                v-if="props.playerSong?.cid === song.cid && props.playerIndex === idx"
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
              @click.stop="emit('removeFromPlayList', idx)"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
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
