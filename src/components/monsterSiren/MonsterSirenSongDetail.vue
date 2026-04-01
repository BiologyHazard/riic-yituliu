<script setup lang="ts">
import type { Album, Song, SongDetail } from '@/types/monsterSiren';
import { computed, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{
  song: Song;
  detail: SongDetail | null;
  album: Album | null;
  currentTime: number;
  isPlaying: boolean;
}>();

const emit = defineEmits<{
  back: [];
  seek: [time: number];
}>();

// ─── 歌词处理 ───────────────────────────────────────────────────────────────────
interface LyricLine {
  time: number;
  text: string;
}

const lyrics = ref<LyricLine[]>([]);
const isLoadingLyrics = ref(false);

async function fetchLyrics(url: string) {
  isLoadingLyrics.value = true;
  try {
    const res = await fetch(`/api/proxy/get?url=${encodeURIComponent(url)}`);
    const text = await res.text();
    parseLyrics(text);
  } catch (e) {
    console.error('Failed to fetch lyrics:', e);
    lyrics.value = [];
  } finally {
    isLoadingLyrics.value = false;
  }
}

function parseLyrics(lrc: string) {
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const timeReg = /\[(\d+):(\d+)(?:\.(\d+))?\]/g;

  for (const line of lines) {
    const text = line.replace(timeReg, '').trim();
    if (!text) continue;

    let match;
    timeReg.lastIndex = 0;
    while ((match = timeReg.exec(line)) !== null) {
      const min = parseInt(match[1]!);
      const sec = parseInt(match[2]!);
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3)) : 0;
      const time = min * 60 + sec + ms / 1000;
      result.push({ time, text });
    }
  }

  lyrics.value = result.sort((a, b) => a.time - b.time);
}

watch(
  () => props.detail?.lyricUrl,
  (url) => {
    if (url) {
      fetchLyrics(url);
    } else {
      lyrics.value = [];
    }
  },
  { immediate: true },
);

// ─── 滚动逻辑 ───────────────────────────────────────────────────────────────────
const activeIndex = computed(() => {
  if (lyrics.value.length === 0) return -1;
  const index = lyrics.value.findIndex((l) => l.time > props.currentTime);
  return index === -1 ? lyrics.value.length - 1 : Math.max(0, index - 1);
});

const lyricContainer = ref<HTMLElement | null>(null);
const lyricList = ref<HTMLElement | null>(null);
const isUserScrolling = ref(false);
let scrollTimeout: number | null = null;

function handleUserScroll() {
  isUserScrolling.value = true;
  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = window.setTimeout(() => {
    isUserScrolling.value = false;
  }, 3000);
}

watch(activeIndex, (val) => {
  if (val === -1 || isUserScrolling.value || !lyricContainer.value) return;

  const activeEl = lyricList.value?.children[val] as HTMLElement;
  if (activeEl) {
    const containerHeight = lyricContainer.value.clientHeight;
    const targetScroll = activeEl.offsetTop - containerHeight / 2 + activeEl.clientHeight / 2;

    lyricContainer.value.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });
  }
});

onUnmounted(() => {
  if (scrollTimeout) clearTimeout(scrollTimeout);
});
</script>

<template>
  <div class="flex h-full flex-1 flex-row items-center overflow-hidden">
    <!-- Left Side: Cover & Info -->
    <div class="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div
        class="relative mb-8 aspect-square w-full max-w-80 overflow-hidden rounded-2xl shadow-xl"
      >
        <img
          v-if="album"
          :alt="album.name"
          class="h-full w-full object-cover"
          referrerpolicy="no-referrer"
          :src="album.coverUrl"
        />
        <div v-else class="flex h-full w-full items-center justify-center bg-white/5">
          <UIcon class="h-20 w-20 opacity-20" name="i-lucide-music" />
        </div>
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-center gap-2">
          <UButton icon="i-lucide-arrow-left" size="sm" variant="ghost" @click="emit('back')" />
          <h1 class="text-4xl font-bold text-highlighted">{{ song.name }}</h1>
        </div>
        <p class="text-xl text-toned">{{ song.artists.join(' / ') }}</p>
        <p v-if="album" class="text-sm text-muted">{{ album.name }}</p>
      </div>
    </div>

    <!-- Right Side: Lyrics -->
    <div class="flex h-full flex-1 flex-col overflow-hidden p-12">
      <div
        ref="lyricContainer"
        class="no-scrollbar flex-1 overflow-y-auto"
        @scroll="handleUserScroll"
      >
        <div v-if="isLoadingLyrics" class="flex h-full items-center justify-center">
          <UIcon class="h-8 w-8 animate-spin opacity-40" name="i-lucide-loader-2" />
        </div>
        <div
          v-else-if="lyrics.length > 0"
          ref="lyricList"
          class="relative space-y-6 pt-[40vh] pb-[40vh]"
        >
          <div
            v-for="(line, index) in lyrics"
            :key="index"
            class="origin-left cursor-pointer transition-all"
            :class="[
              activeIndex === index
                ? 'scale-105 text-xl font-bold text-primary'
                : 'text-lg text-muted hover:text-highlighted',
            ]"
            @click="emit('seek', line.time)"
          >
            {{ line.text }}
          </div>
        </div>
        <div v-else class="flex h-full items-center justify-center text-muted italic">暂无歌词</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
