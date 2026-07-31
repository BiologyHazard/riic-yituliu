<script setup lang="ts">
import type { RichTextSegment } from '@/utils/richText';

defineProps<{
  segments: RichTextSegment[];
}>();
</script>

<template>
  <span
    v-for="(seg, index) in segments"
    :key="index"
    :style="{
      color: seg.color,
      fontStyle: seg.italic ? 'italic' : undefined,
      textDecoration: seg.underline ? 'underline' : undefined,
      textUnderlinePosition: seg.underline ? 'under' : undefined,
    }"
    >{{ seg.text }}</span
  >
</template>
