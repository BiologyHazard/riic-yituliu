<script setup lang="ts">
import type { ExportFormat } from '@/composables/useExportImage';
import { computed } from 'vue';

const exportFormat = defineModel<ExportFormat>('exportFormat', { required: true });
const exportQuality = defineModel<number>('exportQuality', { required: true });
const exportPixelRatio = defineModel<number>('exportPixelRatio', { required: true });

defineProps<{
  disabled?: boolean;
}>();

const isQualityEnabled = computed<boolean>(
  () => exportFormat.value === 'webp' || exportFormat.value === 'jpeg',
);
</script>

<template>
  <UPopover
    :content="{
      align: 'center',
      side: 'bottom',
      sideOffset: 8,
    }"
  >
    <UButton
      :disabled="disabled"
      icon="i-lucide-settings-2"
      title="调整导出格式、质量和大小"
      variant="subtle"
    />

    <template #content>
      <div class="flex flex-col gap-4 p-4" style="min-width: 240px">
        <UFormField label="导出格式">
          <UTabs
            v-model="exportFormat"
            color="neutral"
            :content="false"
            :items="[
              { label: 'WebP', value: 'webp' },
              { label: 'PNG', value: 'png' },
              { label: 'JPEG', value: 'jpeg' },
              { label: 'SVG', value: 'svg' },
            ]"
            :ui="{ list: 'ring ring-accented ring-inset' }"
            variant="pill"
          />
        </UFormField>

        <UFormField :hint="`${exportQuality}%`" label="图片质量">
          <USlider
            v-model="exportQuality"
            :disabled="!isQualityEnabled"
            :max="100"
            :min="1"
            :step="1"
            tooltip
          />
        </UFormField>

        <UFormField label="图片大小">
          <UTabs
            v-model="exportPixelRatio"
            color="neutral"
            :content="false"
            :items="[
              { label: '0.5x', value: 0.5 },
              { label: '1x', value: 1 },
              { label: '2x', value: 2 },
              { label: '3x', value: 3 },
              { label: '4x', value: 4 },
            ]"
            :ui="{ list: 'ring ring-accented ring-inset' }"
            variant="pill"
          />
        </UFormField>
      </div>
    </template>
  </UPopover>
</template>
