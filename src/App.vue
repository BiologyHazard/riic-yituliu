<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import { currentGameDataBaseUrl } from '@/utils/dataSources';
import { loadGameData } from '@/utils/gameData';
import { loadPenguinData } from '@/utils/penguinStats';
import { useHead } from '@unhead/vue';
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';

const { style, link } = useTheme();
useHead({ style, link });

// 在根组件挂载后通过非阻塞方式加载数据
onMounted(() => {
  loadGameData(currentGameDataBaseUrl.value);
  loadPenguinData();
});
</script>

<template>
  <UApp>
    <AppHeader />
    <UMain>
      <RouterView />
    </UMain>
    <AppFooter />
  </UApp>
</template>
