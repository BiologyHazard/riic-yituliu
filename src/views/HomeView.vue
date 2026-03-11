<script setup lang="ts">
import { getPrtsWikiMediaUrl } from '@/utils/prtsWiki';
</script>

<template>
  <UContainer>
    <UPage>
      <UPageBody class="space-y-6">
        <div class="flex flex-col">
          <UButton
            rel="noopener noreferrer"
            target="_blank"
            to="https://h089spg07ll.feishu.cn/wiki/space/7463413966732361756"
            trailing-icon="i-lucide-external-link"
            variant="link"
          >
            飞书知识库
          </UButton>
          <UButton
            rel="noopener noreferrer"
            target="_blank"
            to="https://space.bilibili.com/37179776"
            trailing-icon="i-lucide-external-link"
            variant="link"
          >
            bilibili@Bio-Hazard
          </UButton>
          <UButton
            rel="noopener noreferrer"
            target="_blank"
            to="https://www.skland.com/profile?id=1138552273321"
            trailing-icon="i-lucide-external-link"
            variant="link"
          >
            森空岛@BioHazard
          </UButton>
          <UButton
            rel="noopener noreferrer"
            target="_blank"
            to="https://bbs.nga.cn/thread.php?authorid=60824354"
            trailing-icon="i-lucide-external-link"
            variant="link"
          >
            NGA@Bio-Hazard
          </UButton>
        </div>

        <figure>
          <ULink
            href="https://prts.wiki/w/用户:BioHazard/基建地图"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt="2025-09-30-「众生行记」版本之后基建房间slot_id和清理提供的无人机 by bilibili@Bio-Hazard"
              class="theme-dark-darken"
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
              class="text-primary hover:text-primary/75"
              rel="noopener noreferrer"
              target="_blank"
              to="https://space.bilibili.com/37179776"
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
