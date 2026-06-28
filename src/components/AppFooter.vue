<script setup lang="ts">
const beianMap: Record<string, string> = {
  'misakabio.top': '沪ICP备2026013897号-1',
  'biohazard.top': '沪ICP备2026013897号-3',
};
const hostname = window.location.hostname;
const beianString: string | null =
  Object.entries(beianMap).find(([domain, _beian]) => hostname.endsWith(domain))?.[1] ?? null;
</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-sm text-muted">Powered by</p>
      <UButton
        aria-label="Vue.js"
        color="neutral"
        icon="i-logos:vue"
        rel="noopener noreferrer"
        target="_blank"
        to="https://vuejs.org/"
        variant="ghost"
      />
      <UButton
        aria-label="Nuxt UI"
        class="text-green-500 dark:text-green-400"
        icon="i-simple-icons:nuxtdotjs"
        rel="noopener noreferrer"
        target="_blank"
        to="https://unocss.dev/"
        variant="ghost"
      />
      <UButton
        aria-label="Tailwind CSS"
        class="text-sky-500 dark:text-sky-400"
        icon="i-simple-icons:tailwindcss"
        rel="noopener noreferrer"
        target="_blank"
        to="https://tailwindcss.com/"
        variant="ghost"
      />
    </template>

    <p v-if="beianString !== null" class="text-xs text-dimmed">
      <a href="https://beian.miit.gov.cn/" rel="noopener noreferrer" target="_blank">{{
        beianString
      }}</a>
    </p>

    <template #right>
      <UButton
        aria-label="Bilibili"
        color="neutral"
        icon="i-simple-icons:bilibili"
        rel="noopener noreferrer"
        target="_blank"
        to="https://space.bilibili.com/37179776"
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
