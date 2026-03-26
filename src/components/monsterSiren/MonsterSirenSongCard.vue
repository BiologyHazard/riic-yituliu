<script setup lang="ts">
import type { Album, Song } from '@/types/monsterSiren';
import { computed } from 'vue';

const props = defineProps<{
  song: Song;
  album?: Album;
  isActive: boolean;
  isPlaying: boolean;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  play: [];
}>();

const icon = computed(() => {
  if (props.isLoading) {
    return 'i-lucide-loader-2 animate-spin';
  }
  if (props.isActive) {
    return props.isPlaying ? 'i-lucide-pause' : 'i-lucide-play';
  }
  return 'i-lucide-play';
});
</script>

<template>
  <div
    class="group h-full cursor-pointer rounded-2xl p-3 transition-all hover:bg-muted hover:shadow-md"
    :class="{ 'bg-primary/10 ring ring-primary/25 ring-inset': props.isActive }"
  >
    <div class="relative mb-3 overflow-hidden rounded-xl shadow-md">
      <img
        v-if="props.album?.coverUrl"
        :alt="song.name"
        class="aspect-square w-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
        referrerpolicy="no-referrer"
        :src="props.album.coverUrl"
      />
      <div
        class="absolute inset-0 flex items-end justify-end gap-3 bg-black/40 p-3 opacity-0 backdrop-blur-[2px] transition-all group-hover:opacity-100"
      >
        <UButton
          class="light rounded-full shadow-sm"
          color="neutral"
          :disabled="props.isLoading"
          :icon="icon"
          size="md"
          variant="soft"
          @click="emit('play')"
        />
      </div>
    </div>
    <p class="line-clamp-2 text-sm font-medium text-highlighted">{{ song.name }}</p>
    <p class="mt-0.5 truncate text-xs text-muted">
      {{ song.artists.join(' / ') }}
    </p>
  </div>
</template>
