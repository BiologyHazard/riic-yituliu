<script setup lang="ts">
import type { CSSProperties } from 'vue';

const props = defineProps<{
  label: string;
  icon?: string;
  chipStyle?: CSSProperties;
  selected?: boolean;
}>();
</script>

<template>
  <UButton
    class="rounded-sm capitalize ring-default"
    :class="[props.selected ? 'bg-elevated' : 'hover:bg-elevated/50']"
    color="neutral"
    :icon="props.icon"
    :label="props.label"
    size="sm"
    variant="outline"
  >
    <template v-if="props.chipStyle" #leading>
      <span
        class="inline-block size-2 rounded-full bg-(--color-light) dark:bg-(--color-dark)"
        :style="props.chipStyle"
      />
    </template>
  </UButton>
</template>
