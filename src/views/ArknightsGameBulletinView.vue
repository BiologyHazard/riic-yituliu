<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const arknightsGameBulletinWebviewUrl = 'https://ak-webview.hypergryph.com/gameBulletin';
// ?target=Windows&u8_token={}&platform=Windows&channel=2&subChannel=2&lang=zh-cn&server=
const arknightsTargets = ['Android', 'IOS', 'Bilibili', 'Windows', 'BilibiliWindows'];
const arknightsPlatforms = ['Android', 'IOS', 'Bilibili', 'Windows', 'BilibiliWindows'];
const arknightsChannels = ['0', '1', '2'];
const arknightsSubChannels = ['0', '1', '2'];
const arknightsLangs = ['zh-cn', 'zh-tw', 'en-us', 'ja-jp', 'ko-kr'];
const arknightsServers = ['', '0', '1', '2'];

const arknightsCurrentTarget = ref('Android');
const arknightsCurrentPlatform = ref('Android');
const arknightsCurrentChannel = ref('0');
const arknightsCurrentSubChannel = ref('0');
const arknightsCurrentLang = ref('zh-cn');
const arknightsCurrentServer = ref('');
const arknightsIframeUrl = computed(() => {
  const url = new URL(arknightsGameBulletinWebviewUrl);
  url.searchParams.set('target', arknightsCurrentTarget.value);
  url.searchParams.set('platform', arknightsCurrentPlatform.value);
  url.searchParams.set('channel', arknightsCurrentChannel.value);
  url.searchParams.set('subChannel', arknightsCurrentSubChannel.value);
  url.searchParams.set('lang', arknightsCurrentLang.value);
  url.searchParams.set('server', arknightsCurrentServer.value);
  return url.toString();
});

function toTabItems(values: string[]) {
  return values.map((value) => ({ label: value, value }));
}

const cachedArknightsIframeUrls = ref(new Set<string>());

watch(
  arknightsIframeUrl,
  (url) => {
    cachedArknightsIframeUrls.value.add(url);
  },
  { immediate: true },
);
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="明日方舟游戏内公告" />
      <UPageBody>
        <div class="space-y-4">
          <UFormField label="target">
            <UTabs
              v-model="arknightsCurrentTarget"
              :content="false"
              :items="toTabItems(arknightsTargets)"
            />
          </UFormField>
          <UFormField label="platform">
            <UTabs
              v-model="arknightsCurrentPlatform"
              :content="false"
              :items="toTabItems(arknightsPlatforms)"
            />
          </UFormField>
          <UFormField label="channel">
            <UTabs
              v-model="arknightsCurrentChannel"
              :content="false"
              :items="toTabItems(arknightsChannels)"
            />
          </UFormField>
          <UFormField label="subChannel">
            <UTabs
              v-model="arknightsCurrentSubChannel"
              :content="false"
              :items="toTabItems(arknightsSubChannels)"
            />
          </UFormField>
          <UFormField label="lang">
            <UTabs
              v-model="arknightsCurrentLang"
              :content="false"
              :items="toTabItems(arknightsLangs)"
            />
          </UFormField>
          <UFormField label="server">
            <UTabs
              v-model="arknightsCurrentServer"
              :content="false"
              :items="toTabItems(arknightsServers)"
            />
          </UFormField>
          <UButton
            rel="noopener noreferrer"
            target="_blank"
            :to="arknightsIframeUrl"
            trailing-icon="i-lucide-external-link"
            variant="link"
          >
            {{ arknightsIframeUrl }}
          </UButton>
          <iframe
            v-for="url in cachedArknightsIframeUrls"
            v-show="url === arknightsIframeUrl"
            :key="url"
            allowfullscreen
            class="aspect-16/9 inline-full"
            :src="url"
          />
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
