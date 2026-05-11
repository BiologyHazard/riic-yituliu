<script setup lang="ts">
import { getItemIconUrl, getItemName } from '@/utils/item';

const props = defineProps<{
  itemId: string;
  count: number | null;
  iconSize?: number;
}>();
</script>

<template>
  <UTooltip :text="getItemName(props.itemId)">
    <div class="relative inline-block">
      <img
        :alt="getItemName(props.itemId)"
        class="object-contain"
        referrerpolicy="no-referrer"
        :src="getItemIconUrl(props.itemId)"
        :style="{
          width: `${props.iconSize ?? 64}px`,
          height: `${props.iconSize ?? 64}px`,
        }"
      />
      <div
        v-if="count !== null"
        class="text-md absolute inset-e-0 inset-be-0 rounded bg-default/75 px-0.5 leading-tight font-semibold text-default backdrop-blur-xs"
      >
        {{ count }}
      </div>
    </div>
  </UTooltip>
</template>
