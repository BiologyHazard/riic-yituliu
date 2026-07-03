<script setup lang="ts">
import BioHazard from '@/components/icons/BioHazard.vue';
import LarkIcon from '@/components/icons/LarkIcon.vue';
import NgaIcon from '@/components/icons/NgaIcon.vue';
import SklandIcon from '@/components/icons/SklandIcon.vue';

const beianMap: Record<string, string> = {
  'misakabio.top': '沪ICP备2026013897号-1',
  'biohazard.top': '沪ICP备2026013897号-3',
};
const hostname = window.location.hostname;
const beianString: string | null =
  Object.entries(beianMap).find(([domain, _beian]) => hostname.endsWith(domain))?.[1] ?? null;
</script>

<template>
  <USeparator :icon="BioHazard" />

  <UFooter>
    <template #left>
      <p class="text-sm text-muted">Powered by</p>
      <UButton
        aria-label="Vue.js"
        color="neutral"
        icon="i-simple-icons:vuedotjs"
        rel="noopener noreferrer"
        target="_blank"
        to="https://vuejs.org/"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt UI"
        color="neutral"
        icon="i-simple-icons:nuxtdotjs"
        rel="noopener noreferrer"
        target="_blank"
        to="https://ui.nuxt.com/"
        variant="ghost"
      />
      <UButton
        aria-label="Tailwind CSS"
        color="neutral"
        icon="i-simple-icons:tailwindcss"
        rel="noopener noreferrer"
        target="_blank"
        to="https://tailwindcss.com/"
        variant="ghost"
      />
    </template>

    <div class="flex flex-wrap items-center justify-center gap-1">
      <p class="text-xs text-dimmed">
        © {{ new Date().getFullYear() }} BioHazard. All rights reserved.
      </p>
      <p v-if="beianString !== null" class="text-xs text-dimmed">
        <a href="https://beian.miit.gov.cn/" rel="noopener noreferrer" target="_blank">
          {{ beianString }}
        </a>
      </p>
    </div>

    <template #right>
      <UButton
        aria-label="哔哩哔哩"
        color="neutral"
        icon="i-simple-icons:bilibili"
        rel="noopener noreferrer"
        target="_blank"
        to="https://space.bilibili.com/37179776"
        variant="ghost"
      />
      <UButton
        aria-label="森空岛"
        color="neutral"
        :icon="SklandIcon"
        rel="noopener noreferrer"
        target="_blank"
        to="https://www.skland.com/profile?id=1138552273321"
        variant="ghost"
      />
      <UButton
        aria-label="NGA"
        color="neutral"
        :icon="NgaIcon"
        rel="noopener noreferrer"
        target="_blank"
        to="https://bbs.nga.cn/thread.php?authorid=60824354"
        variant="ghost"
      />
      <UButton
        aria-label="QQ"
        color="neutral"
        icon="i-simple-icons:qq"
        rel="noopener noreferrer"
        target="_blank"
        to="https://qm.qq.com/q/5Lo35ydL0I"
        variant="ghost"
      />
      <UButton
        aria-label="飞书"
        color="neutral"
        :icon="LarkIcon"
        rel="noopener noreferrer"
        target="_blank"
        to="https://my.feishu.cn/wiki/V5VcwWMkeiz64mkuL9Vcot7unqd"
        variant="ghost"
      />
      <UButton
        aria-label="GitHub"
        color="neutral"
        icon="i-simple-icons:github"
        rel="noopener noreferrer"
        target="_blank"
        to="https://github.com/BiologyHazard/riic-yituliu"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
