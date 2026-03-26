<script setup lang="ts">
import type { Album, Song } from '@/types/monsterSiren';

import { useWindowVirtualizer } from '@tanstack/vue-virtual';
import { computed, useTemplateRef } from 'vue';

const props = defineProps<{
  albumMap: Map<string, Album>;
  loadingDetailCids: Set<string>;
  isCurrentSong: (cid: string) => boolean;
  isPlaying: boolean;
  songs: Song[];
}>();

const emit = defineEmits<{
  playSong: [song: Song, playlist: Song[], index: number];
  previewCover: [coverUrl: string, albumName: string];
  downloadSong: [song: Song];
}>();

const containerRef = useTemplateRef('containerRef');
/** 计算滚动边距 */
const scrollMargin = computed(() => (containerRef.value ? containerRef.value.offsetTop : 0));

// 使用 TanStack Virtual 进行窗口级虚拟化
const virtualizer = useWindowVirtualizer({
  get count(): number {
    return props.songs.length;
  },
  estimateSize: () => 72,
  overscan: 16,
  get scrollMargin(): number {
    return scrollMargin.value;
  },
});

/** 可见条目和 song 绑定 */
const virtualItems = computed(() => {
  return virtualizer.value.getVirtualItems().map((item) => ({
    ...item,
    song: props.songs[item.index],
  }));
});
</script>

<template>
  <div class="space-y-4">
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

      <div ref="containerRef">
        <div
          :style="{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }"
        >
          <template v-for="{ key, index, start, size, song } in virtualItems" :key="key">
            <div
              v-if="song"
              class="group flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted sm:px-4 sm:py-3 lg:grid lg:grid-cols-[2rem_2.5rem_1fr_1fr_3rem]"
              :class="{ 'bg-primary/10': props.isCurrentSong(song.cid) }"
              :style="{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${size}px`,
                transform: `translateY(${start - virtualizer.options.scrollMargin}px)`,
              }"
              @click="emit('playSong', song, props.songs, index)"
            >
              <div class="w-5 shrink-0 text-center">
                <template v-if="!props.isCurrentSong(song.cid)">
                  <span class="text-sm text-muted tabular-nums group-hover:hidden">
                    {{ index + 1 }}
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
              <div
                v-else
                class="flex h-full w-full items-center justify-center bg-muted text-muted"
              >
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
          </template>
        </div>
      </div>

      <div v-if="props.songs.length === 0" class="py-12">
        <div class="flex items-center justify-center gap-2 text-muted">
          <UIcon class="" name="i-lucide-search-x" />
          没有找到匹配的乐曲
        </div>
      </div>
    </div>
  </div>
</template>
