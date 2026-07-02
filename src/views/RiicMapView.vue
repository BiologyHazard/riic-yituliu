<script setup lang="ts">
import { getPrtsWikiMediaUrl } from '@/utils/prtsWiki';
</script>

<template>
  <UContainer>
    <UPage>
      <UPageBody>
        <figure>
          <ULink
            href="https://prts.wiki/w/用户:BioHazard/基建地图"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt="2025-09-30-「众生行记」版本之后基建房间slot_id和清理提供的无人机 by bilibili@Bio-Hazard"
              class="theme-dark-darken"
              referrerpolicy="no-referrer"
              :src="
                getPrtsWikiMediaUrl(
                  '2025-09-30-「众生行记」版本之后基建房间slot_id和清理提供的无人机_by_bilibili@Bio-Hazard.png',
                )
              "
            />
          </ULink>
          <figcaption class="mbs-2 text-center text-sm text-toned">
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
