<script setup lang="ts">
import BaseMapDiagram from '@/components/riic/BaseMapDiagram.vue';
import { blueprintLayout, roomRules } from '@/utils/riic/roomState';
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="基建地图" />
      <UPageBody>
        <BaseMapDiagram :layout="blueprintLayout" :rooms="roomRules" />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
