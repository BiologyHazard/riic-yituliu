<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import { currentGameDataBaseUrl } from '@/utils/dataSources';
import { loadGameData } from '@/utils/gameData/gameData';
import { loadPenguinData } from '@/utils/penguinStats';
import { useHead } from '@unhead/vue';
import { onMounted, ref } from 'vue';

const isSidebarOpen = ref(true);

const { style, link } = useTheme();
useHead({ style, link });

// 在根组件挂载后通过非阻塞方式加载数据
onMounted(() => {
  loadGameData(currentGameDataBaseUrl.value);
  loadPenguinData();
});
</script>

<template>
  <Suspense>
    <UApp>
      <div class="flex">
        <AppSidebar v-model:open="isSidebarOpen" />
        <div class="isolate min-w-0 flex-1">
          <AppHeader v-model:open="isSidebarOpen" />
          <UMain id="main">
            <RouterView />
          </UMain>
          <AppFooter />
        </div>
      </div>
    </UApp>
  </Suspense>
</template>
