<script setup lang="ts">
import type { Album, Song } from '@/types/monsterSiren';

import { computed } from 'vue';

const props = defineProps<{
  albumMap: Map<string, Album>;
  loadingDetailCids: Set<string>;
  isCurrentSong: (cid: string) => boolean;
  isPlaying: boolean;
  pageSize: number | null;
  songs: Song[];
}>();

const emit = defineEmits<{
  playSong: [song: Song, playlist: Song[], index: number];
  previewCover: [coverUrl: string, albumName: string];
  downloadSong: [song: Song];
}>();

const page = defineModel<number>('page', { default: 1 });

const pageSize = computed(() => props.pageSize ?? props.songs.length);
const totalPages = computed(() => Math.ceil(props.songs.length / pageSize.value));
const startIndex = computed(() => (page.value - 1) * pageSize.value);
const paginatedSongs = computed(() => {
  return props.songs.slice(startIndex.value, startIndex.value + pageSize.value);
});
</script>

<template>
  <div class="space-y-4">
    <div v-if="totalPages > 1" class="flex justify-center pt-2">
      <UPagination v-model:page="page" :items-per-page="pageSize" :total="props.songs.length" />
    </div>

    <div class="divide-y divide-default overflow-hidden rounded-xl border">
      <div
        class="hidden items-center gap-3 bg-muted px-4 py-2 text-xs font-medium text-muted lg:grid lg:grid-cols-[2rem_2.5rem_1fr_1fr_3rem]"
      >
        <span class="text-center">#</span>
        <span />
        <span>曲名</span>
        <span>专辑</span>
        <span class="text-right">操作</span>
      </div>

      <div
        v-for="(song, idx) in paginatedSongs"
        :key="song.cid"
        class="group flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted sm:px-4 sm:py-3 lg:grid lg:grid-cols-[2rem_2.5rem_1fr_1fr_3rem]"
        :class="{ 'bg-primary/10': props.isCurrentSong(song.cid) }"
        @click="emit('playSong', song, props.songs, startIndex + idx)"
      >
        <div class="w-5 shrink-0 text-center">
          <template v-if="!props.isCurrentSong(song.cid)">
            <span class="text-sm text-muted tabular-nums group-hover:hidden">
              {{ startIndex + idx + 1 }}
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
              :icon="props.isPlaying ? 'i-lucide-volume-2' : 'i-lucide-play'"
              size="xs"
              variant="ghost"
            />
            <UButton
              class="hidden group-hover:inline-block"
              :icon="props.isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
              size="xs"
              variant="ghost"
            />
          </template>
        </div>

        <ImagePreviewContainer
          v-if="props.albumMap.get(song.albumCid)?.coverUrl"
          class="h-10 w-10 shrink-0 cursor-zoom-in rounded-md shadow-sm"
          @click.stop="
            emit(
              'previewCover',
              props.albumMap.get(song.albumCid)!.coverUrl,
              props.albumMap.get(song.albumCid)!.name,
            )
          "
        >
          <img
            :alt="props.albumMap.get(song.albumCid)!.name"
            class="h-full w-full object-cover"
            loading="lazy"
            referrerpolicy="no-referrer"
            :src="props.albumMap.get(song.albumCid)!.coverUrl"
          />
        </ImagePreviewContainer>
        <div v-else class="flex h-full w-full items-center justify-center bg-muted text-muted">
          <UIcon class="text-lg" name="i-lucide-disc" />
        </div>

        <div class="min-w-0 flex-1">
          <p
            class="truncate text-sm font-medium"
            :class="props.isCurrentSong(song.cid) ? 'text-primary' : 'text-default'"
          >
            {{ song.name }}
          </p>
          <p class="truncate text-xs text-muted">
            <span class="text-muted">{{ song.artists.join(' / ') }}</span>
            <span class="mx-1 text-dimmed">·</span>
            <span class="text-dimmed">CID: {{ song.cid }}</span>
          </p>
        </div>

        <div class="hidden min-w-0 lg:flex lg:flex-col lg:items-start lg:justify-center">
          <ULink
            class="truncate text-sm text-muted"
            :to="`/monster-siren/album/${song.albumCid}`"
            @click.stop
          >
            {{ props.albumMap.get(song.albumCid)?.name ?? song.albumCid }}
          </ULink>
          <ULink
            class="text-xs text-dimmed"
            :to="`/monster-siren/album/${song.albumCid}`"
            @click.stop
          >
            CID: {{ song.albumCid }}
          </ULink>
        </div>

        <div class="flex shrink-0 items-center justify-end">
          <UTooltip text="在塞壬唱片官网中打开">
            <UButton
              icon="i-lucide-external-link"
              rel="noopener noreferrer"
              size="xs"
              target="_blank"
              :to="`https://monster-siren.com/music/${song.cid}`"
              variant="ghost"
              @click.stop
            />
          </UTooltip>
          <UTooltip text="下载">
            <UButton
              :class="{ 'animate-spin': props.loadingDetailCids.has(song.cid) }"
              :disabled="props.loadingDetailCids.has(song.cid)"
              :icon="
                props.loadingDetailCids.has(song.cid)
                  ? 'i-lucide-loader-circle'
                  : 'i-lucide-download'
              "
              size="xs"
              variant="ghost"
              @click.stop="emit('downloadSong', song)"
            />
          </UTooltip>
        </div>
      </div>

      <div v-if="props.songs.length === 0" class="py-12">
        <div class="flex items-center justify-center gap-2 text-muted">
          <UIcon class="" name="i-lucide-search-x" />
          没有找到匹配的乐曲
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1" class="flex justify-center pt-2">
      <UPagination v-model:page="page" :items-per-page="pageSize" :total="props.songs.length" />
    </div>
  </div>
</template>
