<script setup lang="ts">
import type { Album } from '@/types/monsterSiren';

const props = defineProps<{
  album: Album;
  songCount: number;
}>();

const emit = defineEmits<{
  play: [];
}>();
</script>

<template>
  <div
    class="group h-full cursor-pointer rounded-2xl p-3 transition-all hover:bg-muted hover:shadow-md"
  >
    <div class="relative mb-3 overflow-hidden rounded-xl shadow-md">
      <img
        :alt="props.album.name"
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
          icon="i-lucide-play"
          size="md"
          variant="soft"
          @click.stop="emit('play')"
        />
      </div>
    </div>
    <p class="line-clamp-2 text-sm font-medium text-highlighted">{{ props.album.name }}</p>
    <p class="mt-0.5 truncate text-xs text-muted">
      {{ props.songCount }} 首
      <span class="mx-1 opacity-40">·</span>
      {{ props.album.artistes.join(' / ') }}
    </p>
  </div>
</template>
