<script setup lang="ts">
import { getPrtsWikiMediaUrl } from '@/utils/prtsWiki';
</script>

<template>
  <UContainer>
    <UPage>
      <UPageBody class="space-y-6">
        <div class="flex flex-col">
          <UButton
            variant="link"
            target="_blank"
            rel="noopener noreferrer"
            trailing-icon="i-lucide-external-link"
            to="https://h089spg07ll.feishu.cn/wiki/space/7463413966732361756"
          >
            飞书知识库
          </UButton>
          <UButton
            variant="link"
            target="_blank"
            rel="noopener noreferrer"
            trailing-icon="i-lucide-external-link"
            to="https://space.bilibili.com/37179776"
          >
            bilibili@Bio-Hazard
          </UButton>
          <UButton
            variant="link"
            target="_blank"
            rel="noopener noreferrer"
            trailing-icon="i-lucide-external-link"
            to="https://www.skland.com/profile?id=1138552273321"
          >
            森空岛@BioHazard
          </UButton>
          <UButton
            variant="link"
            target="_blank"
            rel="noopener noreferrer"
            trailing-icon="i-lucide-external-link"
            to="https://bbs.nga.cn/thread.php?authorid=60824354"
          >
            NGA@Bio-Hazard
          </UButton>
        </div>

        <figure>
          <ULink
            target="_blank"
            rel="noopener noreferrer"
            href="https://prts.wiki/w/用户:BioHazard/基建地图"
          >
            <img
              class="theme-dark-darken"
              alt="2025-09-30-「众生行记」版本之后基建房间slot_id和清理提供的无人机 by bilibili@Bio-Hazard"
              :src="
                getPrtsWikiMediaUrl(
                  '2025-09-30-「众生行记」版本之后基建房间slot_id和清理提供的无人机_by_bilibili@Bio-Hazard.png',
                )
              "
            />
          </ULink>
          <figcaption>
            2025-09-30-「众生行记」版本之后基建房间 <code>slot_id</code> 和清理提供的无人机 by
            <ULink
              target="_blank"
              rel="noopener noreferrer"
              to="https://space.bilibili.com/37179776"
              class="text-primary hover:text-primary/75"
            >
              bilibili@Bio-Hazard
            </ULink>
          </figcaption>
        </figure>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped lang="scss"></style>
