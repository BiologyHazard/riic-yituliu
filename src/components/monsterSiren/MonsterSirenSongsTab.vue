<script setup lang="ts">
import type { Album, Song, SongViewMode } from '@/types/monsterSiren';

const props = defineProps<{
  searchQuery: string;
  totalSongs: number;
  totalPages: number;
  currentPage: number;
  paginatedSongs: Song[];
  filteredSongs: Song[];
  pageSize: number;
  songViewMode: SongViewMode;
  albumMap: Map<string, Album>;
  isPlaying: boolean;
  loadingDetailCids: Set<string>;
  isCurrentSong: (cid: string) => boolean;
  onPlaySong: (song: Song, playlist: Song[], index: number) => void;
  onDownloadSong: (song: Song) => void;
  onPreviewCover: (url: string, name: string) => void;
}>();

const emit = defineEmits<{
  'update:currentPage': [page: number];
}>();
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 text-sm text-muted">
      <span v-if="props.searchQuery">
        找到 <strong class="text-highlighted">{{ props.totalSongs }}</strong> 首
      </span>
      <span v-else>
        共 <strong class="text-highlighted">{{ props.totalSongs }}</strong> 首乐曲
      </span>
      <span v-if="props.totalPages > 1" class="opacity-60">
        · 第 {{ props.currentPage }} / {{ props.totalPages }} 页
      </span>
    </div>

    <div
      v-if="props.songViewMode === 'list'"
      class="divide-y divide-default overflow-hidden rounded-xl border"
    >
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
        v-for="(song, idx) in props.paginatedSongs"
        :key="song.cid"
        class="group flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted sm:px-4 lg:grid lg:grid-cols-[2rem_2.5rem_1fr_1fr_3rem]"
        :class="{ 'bg-primary/10': props.isCurrentSong(song.cid) }"
        @click="
          props.onPlaySong(
            song,
            props.filteredSongs,
            (props.currentPage - 1) * props.pageSize + idx,
          )
        "
      >
        <div class="w-5 shrink-0 text-center">
          <template v-if="!props.isCurrentSong(song.cid)">
            <span class="text-sm text-muted tabular-nums group-hover:hidden">
              {{ (props.currentPage - 1) * props.pageSize + idx + 1 }}
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
          class="h-10 w-10 shrink-0 cursor-zoom-in rounded-md shadow-sm"
          @click.stop="
            props.onPreviewCover(
              props.albumMap.get(song.albumCid)!.coverUrl,
              props.albumMap.get(song.albumCid)!.name,
            )
          "
        >
          <img
            v-if="props.albumMap.get(song.albumCid)"
            :alt="props.albumMap.get(song.albumCid)!.name"
            class="h-full w-full object-cover"
            loading="lazy"
            referrerpolicy="no-referrer"
            :src="props.albumMap.get(song.albumCid)!.coverUrl"
          />
          <div v-else class="flex h-full w-full items-center justify-center bg-muted text-muted">
            <UIcon class="text-lg" name="i-lucide-disc" />
          </div>
        </ImagePreviewContainer>

        <div class="min-w-0 flex-1">
          <p
            class="truncate text-sm font-medium"
            :class="props.isCurrentSong(song.cid) ? 'text-primary' : 'text-highlighted'"
          >
            {{ song.name }}
          </p>
          <p class="truncate text-xs text-muted">
            {{ song.artists.join(' / ') }}
            <span class="mx-1 opacity-40">·</span>
            CID: {{ song.cid }}
          </p>
        </div>

        <div class="hidden min-w-0 lg:block">
          <p class="truncate text-sm text-muted">
            {{ props.albumMap.get(song.albumCid)?.name ?? song.albumCid }}
          </p>
          <p class="text-xs text-gray-400">{{ song.albumCid }}</p>
        </div>

        <div class="flex shrink-0 items-center justify-end">
          <UButton
            :class="{ 'animate-spin': props.loadingDetailCids.has(song.cid) }"
            :disabled="props.loadingDetailCids.has(song.cid)"
            :icon="
              props.loadingDetailCids.has(song.cid) ? 'i-lucide-loader-circle' : 'i-lucide-download'
            "
            size="xs"
            title="下载"
            variant="ghost"
            @click.stop="props.onDownloadSong(song)"
          />
        </div>
      </div>

      <div v-if="props.paginatedSongs.length === 0" class="py-12">
        <div class="flex items-center justify-center gap-2 text-muted">
          <UIcon class="" name="i-lucide-search-x" />
          没有找到匹配的乐曲
        </div>
      </div>
    </div>

    <div
      v-else
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      <div
        v-for="(song, idx) in props.paginatedSongs"
        :key="song.cid + '-grid'"
        class="group flex cursor-pointer flex-col gap-2 rounded-xl border border-transparent p-3 transition-all hover:bg-muted hover:shadow-md"
        :class="{ 'bg-primary/5 ring-1 ring-primary/20': props.isCurrentSong(song.cid) }"
        @click="
          props.onPlaySong(
            song,
            props.filteredSongs,
            (props.currentPage - 1) * props.pageSize + idx,
          )
        "
      >
        <div class="relative aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-sm">
          <img
            v-if="props.albumMap.get(song.albumCid)"
            :alt="song.name"
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            referrerpolicy="no-referrer"
            :src="props.albumMap.get(song.albumCid)!.coverUrl"
          />
          <div
            class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20"
          >
            <div
              class="flex scale-90 items-center justify-center rounded-full bg-primary p-2 text-white opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100"
            >
              <UIcon
                :name="
                  props.isCurrentSong(song.cid) && props.isPlaying
                    ? 'i-lucide-pause'
                    : 'i-lucide-play'
                "
                size="20"
              />
            </div>
          </div>
        </div>
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

    <div v-if="props.totalPages > 1" class="flex justify-center pt-2">
      <UPagination
        :items-per-page="props.pageSize"
        :page="props.currentPage"
        :total="props.totalSongs"
        @update:page="(page) => emit('update:currentPage', page)"
      />
    </div>
  </div>
</template>
