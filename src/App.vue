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
      <div class="flex h-dvh bg-neutral-50 dark:bg-neutral-950">
        <AppSidebar v-model:open="isSidebarOpen" />
        <div
          class="flex-1 overflow-hidden bg-default lg:my-4 lg:mr-4 lg:rounded-xl lg:shadow-sm lg:ring lg:ring-default"
        >
          <div id="scroll-container" class="h-full overflow-y-auto">
            <AppHeader v-model:open="isSidebarOpen" />
            <UMain
              id="main"
              class="min-h-[calc(100lvh-var(--ui-header-height))] lg:min-h-[calc(100lvh-var(--ui-header-height)-(--spacing(8)))]"
            >
              <RouterView />
            </UMain>
            <AppFooter />
          </div>
        </div>
      </div>
    </UApp>
  </Suspense>
</template>
