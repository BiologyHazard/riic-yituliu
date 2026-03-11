<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const arknightsGameBulletinWebviewUrl = 'https://ak-webview.hypergryph.com/gameBulletin';
// ?target=Android
const arknightsTargets = ['Android', 'IOS', 'Bilibili', 'Windows', 'BilibiliWindows'];

const arknightsCurrentTarget = ref('Android');
const arknightsIframeUrl = computed(() => {
  const url = new URL(arknightsGameBulletinWebviewUrl);
  url.searchParams.set('target', arknightsCurrentTarget.value);
  return url.toString();
});

const endfieldGateBulletinWebviewUrl = 'https://ef-webview.hypergryph.com/page/gate_bulletin';
// ?platform=Windows&u8_token={}&channel=1&subChannel=1&lang=zh-cn
const endfieldGameBulletinWebviewUrl = 'https://ef-webview.hypergryph.com/page/game_bulletin';
// ?platform=Windows&u8_token={}&channel=1&subChannel=1&lang=zh-cn&server=1
const endfieldBulletinTypes = ['游戏内公告', '游戏外公告'];
const endfieldPlatforms = ['Windows', 'Android', 'iOS', 'PlayStation'];
const endfieldChannels = ['0', '1', '2'];
const endfieldSubChannels = ['0', '1', '2'];
const endfieldTypes = ['0', '1', '2'];
const endfieldServers = ['0', '1', '2'];
const endfieldLangs = [
  'zh-cn',
  'zh-tw',
  'de-de',
  'en-us',
  'es-mx',
  'fr-fr',
  'id-id',
  'it-it',
  'ja-jp',
  'ko-kr',
  'pt-br',
  'ru-ru',
  'th-th',
  'vi-vn',
];

const endfieldCurrentBulletinType = ref('游戏内公告');
const endfieldCurrentPlatform = ref('Windows');
const endfieldCurrentChannel = ref('1');
const endfieldCurrentSubChannel = ref('1');
const endfieldCurrentType = ref('0');
const endfieldCurrentLang = ref('zh-cn');
const endfieldCurrentServer = ref('1');
const webviewIframeUrl = computed(() => {
  const baseUrl =
    endfieldCurrentBulletinType.value === '游戏外公告'
      ? endfieldGateBulletinWebviewUrl
      : endfieldGameBulletinWebviewUrl;
  const url = new URL(baseUrl);
  url.searchParams.set('platform', endfieldCurrentPlatform.value);
  url.searchParams.set('channel', endfieldCurrentChannel.value);
  url.searchParams.set('subChannel', endfieldCurrentSubChannel.value);
  url.searchParams.set('lang', endfieldCurrentLang.value);
  if (endfieldCurrentBulletinType.value === '游戏内公告') {
    url.searchParams.set('server', endfieldCurrentServer.value);
  }
  return url.toString();
});

function toTabItems(values: string[]) {
  return values.map((value) => ({ label: value, value }));
}

const cachedArknightsIframeUrls = ref(new Set<string>());
const cachedEndfieldIframeUrls = ref(new Set<string>());

watch(
  arknightsIframeUrl,
  (url) => {
    cachedArknightsIframeUrls.value.add(url);
  },
  { immediate: true },
);

watch(
  webviewIframeUrl,
  (url) => {
    cachedEndfieldIframeUrls.value.add(url);
  },
  { immediate: true },
);
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="游戏内公告" />
      <UPageBody>
        <div class="mt-8 space-y-4">
          <h2 class="text-2xl font-bold">明日方舟游戏内公告</h2>
          <UFormField class="mb-4" label="target">
            <UTabs
              v-model="arknightsCurrentTarget"
              :content="false"
              :items="toTabItems(arknightsTargets)"
            />
          </UFormField>
          <div class="mb-2">
            <UButton
              class="text-sm"
              rel="noopener noreferrer"
              target="_blank"
              :to="arknightsIframeUrl"
              trailing-icon="i-lucide-external-link"
              variant="link"
            >
              {{ arknightsIframeUrl }}
            </UButton>
          </div>
          <iframe
            v-for="url in cachedArknightsIframeUrls"
            v-show="url === arknightsIframeUrl"
            :key="url"
            allowfullscreen
            class="h-180 w-full border-0"
            :src="url"
          />
        </div>

        <div class="mt-8 space-y-4">
          <h2 class="text-2xl font-bold">明日方舟：终末地游戏内公告</h2>
          <UFormField label="公告类型">
            <UTabs
              v-model="endfieldCurrentBulletinType"
              :content="false"
              :items="toTabItems(endfieldBulletinTypes)"
            />
          </UFormField>
          <UFormField label="platform">
            <UTabs
              v-model="endfieldCurrentPlatform"
              :content="false"
              :items="toTabItems(endfieldPlatforms)"
            />
          </UFormField>
          <div class="grid gap-4 lg:grid-cols-2">
            <UFormField help="“资讯速报”标签有所区别" label="channel">
              <UTabs
                v-model="endfieldCurrentChannel"
                :content="false"
                :items="toTabItems(endfieldChannels)"
              />
            </UFormField>
            <UFormField label="type">
              <UTabs
                v-model="endfieldCurrentType"
                :content="false"
                :items="toTabItems(endfieldTypes)"
              />
            </UFormField>
          </div>
          <UFormField label="lang">
            <UTabs
              v-model="endfieldCurrentLang"
              :content="false"
              :items="toTabItems(endfieldLangs)"
            />
          </UFormField>
          <div class="mb-2">
            <UButton
              class="text-sm"
              rel="noopener noreferrer"
              target="_blank"
              :to="webviewIframeUrl"
              trailing-icon="i-lucide-external-link"
              variant="link"
            >
              {{ webviewIframeUrl }}
            </UButton>
          </div>
          <iframe
            v-for="url in cachedEndfieldIframeUrls"
            v-show="url === webviewIframeUrl"
            :key="url"
            allowfullscreen
            class="h-180 w-full border-0"
            :src="url"
          />
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
