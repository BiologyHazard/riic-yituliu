<script setup lang="ts">
import BaseMapDiagram from '@/components/riic/BaseMapDiagram.vue';
import { blueprintLayout, roomRules } from '@/utils/riic/roomState';
</script>

<template>
  <BaseMapDiagram immersive :layout="blueprintLayout" :rooms="roomRules" />
</template>
