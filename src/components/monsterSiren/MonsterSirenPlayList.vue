<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import { useTemplateRef } from 'vue';
import type { Album, Song } from '@/types/monsterSiren';

const props = defineProps<{
  playerSong: Song | null;
  playlist: Song[];
  playerIndex: number | null;
  isPlaying: boolean;
  isPlaylistOpen: boolean;
  albumMap: Map<string, Album>;
}>();

const emit = defineEmits<{
  removeFromPlaylist: [index: number];
  playSong: [song: Song, playlist: Song[], index: number];
  clearPlaylist: [];
}>();

const parentRef = useTemplateRef<HTMLElement>('parentRef');

const rowVirtualizer = useVirtualizer({
  get count(): number {
    return props.playlist.length;
  },
  getScrollElement: () => parentRef.value,
  estimateSize: () => 63,
  overscan: 16,
});
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
            <span class="text-xs text-muted">{{ props.playlist.length }} 首</span>
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
        <div ref="parentRef" class="flex-1 overflow-y-auto">
          <div
            :style="{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }"
          >
            <div
              v-for="virtualRow in rowVirtualizer.getVirtualItems()"
              :key="String(virtualRow.key)"
              class="group flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors hover:bg-muted"
              :class="{
                'bg-primary/5 text-primary':
                  props.playerSong?.cid === props.playlist[virtualRow.index]?.cid &&
                  props.playerIndex === virtualRow.index,
              }"
              :style="{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }"
              @click="
                props.playlist[virtualRow.index] &&
                emit(
                  'playSong',
                  props.playlist[virtualRow.index]!,
                  props.playlist,
                  virtualRow.index,
                )
              "
            >
              <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded">
                <img
                  :alt="props.playlist[virtualRow.index]?.name"
                  class="h-full w-full object-cover"
                  referrerpolicy="no-referrer"
                  :src="
                    props.albumMap.get(props.playlist[virtualRow.index]?.albumCid || '')?.coverUrl
                  "
                />
                <div
                  v-if="
                    props.playerSong?.cid === props.playlist[virtualRow.index]?.cid &&
                    props.playerIndex === virtualRow.index
                  "
                  class="absolute inset-0 flex items-center justify-center bg-black/40"
                >
                  <UIcon
                    class="text-white"
                    :name="props.isPlaying ? 'i-lucide-volume-2' : 'i-lucide-play'"
                  />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">
                  {{ props.playlist[virtualRow.index]?.name || '' }}
                </p>
                <p class="truncate text-xs text-muted">
                  {{ props.playlist[virtualRow.index]?.artists.join(' / ') }}
                </p>
              </div>
              <UButton
                class="hidden group-hover:flex"
                color="neutral"
                icon="i-lucide-x"
                size="xs"
                variant="ghost"
                @click.stop="emit('removeFromPlaylist', virtualRow.index)"
              />
            </div>
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
