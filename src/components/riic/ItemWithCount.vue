<script setup lang="ts">
import { getItemIconUrl } from '@/utils/dataSources';
import { getItemName } from '@/utils/item';
import { computed } from 'vue';

const props = defineProps<{
  itemId: string;
  count: number | null;
}>();

const formatter = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  compactDisplay: 'short',
});

const itemName = computed(() => getItemName(props.itemId) ?? props.itemId);
const tooltipText = computed(() => {
  if (props.count !== null) {
    return `${itemName.value}×${props.count}`;
  } else {
    return itemName.value;
  }
});
</script>

<template>
  <UTooltip :text="tooltipText">
    <div class="relative inline-block">
      <img
        :alt="`道具_${itemName}`"
        class="h-full w-full object-contain"
        referrerpolicy="no-referrer"
        :src="getItemIconUrl(props.itemId)"
      />
      <div
        v-if="props.count !== null"
        class="text-md absolute inset-e-0 inset-be-0 rounded bg-default/75 px-0.5 leading-tight font-semibold text-default backdrop-blur-xs"
      >
        {{ formatter.format(props.count) }}
      </div>
    </div>
  </UTooltip>
</template>
