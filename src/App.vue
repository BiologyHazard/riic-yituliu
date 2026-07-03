<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import { currentGameDataBaseUrl } from '@/utils/dataSources';
import { loadGameData } from '@/utils/gameData/gameData';
import { loadPenguinData } from '@/utils/penguinStats';
import { zh_cn } from '@nuxt/ui/locale';
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
    <UApp :locale="zh_cn">
      <!--
        第 1 层：全局布局容器
        flex 水平排列侧边栏和主内容区，h-dvh 占满整个视口高度。
      -->
      <div class="flex h-dvh bg-neutral-50 dark:bg-neutral-950">
        <AppSidebar v-model:open="isSidebarOpen" />
        <!--
          第 2 层：主内容区外框（只负责圆角视觉效果）
          侧边栏的 z-index 为 10，主内容区的 z-index 设置为 20，确保主内容区的 z-index 大于侧边栏。
          lg:rounded-xl 提供大屏下的圆角视觉效果。
        -->
        <div
          class="isolate z-20 flex-1 bg-default lg:my-4 lg:mr-4 lg:rounded-xl lg:shadow-sm lg:ring lg:ring-default"
        >
          <!--
            第 3 层：裁剪层（负责圆角溢出裁剪）
            overflow-clip 将内容裁剪到 border-radius 以内。
            本层的 corner-shape 设置为 round，保持标准圆角。因为如果在容器上既设置了 overflow-clip 又设置了非 round 的 corner-shape，浏览器需要处理复杂的圆角遮罩，Chrome 会触发 GPU 崩溃。
            将 border-radius 设置为 calc(var(--ui-radius-initial) * 3)，使得圆角大小视觉上与第 2 层的圆角大小一致。
          -->
          <div
            class="h-full overflow-clip corner-round! lg:rounded-[calc(var(--ui-radius-initial)*3)]"
          >
            <!--
              第 4 层：滚动容器（负责内容滚动）
              overflow-y-auto 在内容超出时显示滚动条，滚动条溢出圆角的部分会被第 3 层裁剪掉。
            -->
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
      </div>
    </UApp>
  </Suspense>
</template>
