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

const endfieldGateBulletinWebviewUrl = 'https://ef-webview.hypergryph.com/page/gate_bulletin';
// ?platform=Windows&u8_token={}&channel=1&subChannel=1&lang=zh-cn
const endfieldGameBulletinWebviewUrl = 'https://ef-webview.hypergryph.com/page/game_bulletin';
// ?platform=Windows&u8_token={}&channel=1&subChannel=1&lang=zh-cn&server=1
const endfieldBulletinTypes = ['游戏内公告', '游戏外公告'];
const endfieldPlatforms = ['Windows', 'Android', 'iOS', 'PlayStation'];
const endfieldChannels = ['0', '1', '2'];
const endfieldSubChannels = ['0', '1', '2'];
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
const endfieldServers = ['0', '1', '2'];

const endfieldCurrentBulletinType = ref('游戏内公告');
const endfieldCurrentPlatform = ref('Windows');
const endfieldCurrentChannel = ref('1');
const endfieldCurrentSubChannel = ref('1');
const endfieldCurrentLang = ref('zh-cn');
const endfieldCurrentServer = ref('1');
const endfieldIframeUrl = computed(() => {
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
  endfieldIframeUrl,
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
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">明日方舟游戏内公告</h2>
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
            class="text-sm"
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
            class="h-180 w-full border-0"
            :src="url"
          />
        </div>

        <div class="space-y-4">
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
            <UFormField label="subChannel">
              <UTabs
                v-model="endfieldCurrentSubChannel"
                :content="false"
                :items="toTabItems(endfieldSubChannels)"
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
          <UFormField v-if="endfieldCurrentBulletinType === '游戏内公告'" label="server">
            <UTabs
              v-model="endfieldCurrentServer"
              :content="false"
              :items="toTabItems(endfieldServers)"
            />
          </UFormField>
          <UButton
            class="text-sm"
            rel="noopener noreferrer"
            target="_blank"
            :to="endfieldIframeUrl"
            trailing-icon="i-lucide-external-link"
            variant="link"
          >
            {{ endfieldIframeUrl }}
          </UButton>
          <iframe
            v-for="url in cachedEndfieldIframeUrls"
            v-show="url === endfieldIframeUrl"
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
