<script setup lang="ts">
import BaseMapDiagram from '@/components/riic/BaseMapDiagram.vue';
import { blueprintLayout, roomRules } from '@/utils/riic/roomState';
</script>

<template>
  <div class="p-4">
    <BaseMapDiagram :layout="blueprintLayout" :rooms="roomRules" />
  </div>
</template>
