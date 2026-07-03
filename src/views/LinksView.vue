<script setup lang="ts">
import { useLinksApi } from '@/composables/useLinksApi';
import { onMounted } from 'vue';

const { links, loading, error, fetchLinks } = useLinksApi();

// 组件挂载时获取数据
onMounted(() => {
  fetchLinks();
});
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="友情链接" />

      <UPageBody>
        <!-- 加载状态 -->
        <div v-if="loading" class="flex flex-col items-center justify-center gap-4 px-8 py-16">
          <UIcon class="size-12 animate-spin" name="i-lucide-loader-circle" />
          <p>加载中……</p>
        </div>

        <!-- 错误状态 -->
        <div
          v-else-if="error"
          class="flex flex-col items-center justify-center gap-4 px-8 py-16 text-center"
        >
          <UAlert
            color="error"
            icon="i-lucide-circle-x"
            :title="`加载失败：${error}`"
            variant="soft"
          />
          <UButton color="neutral" variant="outline" @click="fetchLinks"> 重试 </UButton>
        </div>

        <!-- 正常状态 -->
        <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
          <UCard
            v-for="link in links"
            :key="link.id"
            class="divide-accented rounded-xl ring-accented"
            variant="subtle"
          >
            <template #header>
              <div class="flex items-center gap-4">
                <img
                  v-if="link.icon_url"
                  :alt="`${link.localized_name.zh_CN}图标`"
                  class="size-12 shrink-0 rounded-lg object-cover"
                  referrerpolicy="no-referrer"
                  :src="link.icon_url"
                />
                <span class="flex-1 text-lg leading-snug font-bold break-all">
                  {{ link.localized_name.zh_CN }}
                </span>
              </div>
            </template>

            <div class="space-y-6">
              <!-- 标签 -->
              <div v-if="link.localized_tags.zh_CN.length" class="flex flex-wrap gap-3">
                <UBadge
                  v-for="(tag, index) in link.localized_tags.zh_CN"
                  :key="index"
                  class="rounded-full bg-accented/80"
                  color="neutral"
                  variant="soft"
                >
                  {{ tag }}
                </UBadge>
              </div>

              <!-- 描述 -->
              <div>
                {{ link.localized_description.zh_CN }}
              </div>

              <!-- 标语 -->
              <div v-if="link.localized_slogan.zh_CN" class="font-medium text-primary italic">
                {{ link.localized_slogan.zh_CN }}
              </div>
            </div>

            <template #footer>
              <div class="flex flex-wrap gap-3">
                <UButton
                  v-for="(linkItem, index) in link.links"
                  :key="index"
                  color="neutral"
                  :href="linkItem.url"
                  rel="noopener noreferrer"
                  size="sm"
                  target="_blank"
                  trailing-icon="i-lucide-external-link"
                  :variant="linkItem.primary ? 'solid' : 'outline'"
                  >{{ linkItem.localized_name.zh_CN }}</UButton
                >
              </div>
            </template>
          </UCard>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
