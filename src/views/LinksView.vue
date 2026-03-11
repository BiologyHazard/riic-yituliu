<script setup lang="ts">
import { ref, onMounted } from 'vue';

/**
 * 本地化值接口
 */
interface LocalizedValue {
  zh_CN: string;
  en_US: string;
}

/**
 * 本地化数组接口
 */
interface LocalizedArray {
  zh_CN: string[];
  en_US: string[];
}

/**
 * 链接项接口
 */
interface LinkItem {
  primary: boolean;
  regionality: string;
  localized_name: LocalizedValue;
  url: string;
}

/**
 * 友情链接接口
 */
interface FriendLink {
  id: string;
  localized_name: LocalizedValue;
  localized_description: LocalizedValue;
  localized_slogan: LocalizedValue;
  localized_tags: LocalizedArray;
  icon_url: string;
  links: LinkItem[];
}

/**
 * API 响应接口
 */
interface ApiResponse {
  code: string;
  message: string;
  data: FriendLink[];
}

const apiUrl = 'https://server-cdn.ceobecanteen.top/api/v1/cdn/operate/toolLink/list';

const extraLinksList: FriendLink[] = [
  {
    id: 'extra-maa',
    localized_name: {
      zh_CN: 'MaaAssistantArknights',
      en_US: 'MaaAssistantArknights',
    },
    localized_description: {
      zh_CN: '《明日方舟》小助手，自动刷图、智能基建换班，全日常一键长草',
      en_US: '《明日方舟》小助手，自动刷图、智能基建换班，全日常一键长草',
    },
    localized_slogan: {
      zh_CN: 'MAA 的意思是 MAA Assistant Arknights',
      en_US: 'MAA 的意思是 MAA Assistant Arknights',
    },
    localized_tags: {
      zh_CN: ['图像识别', '自动刷图', '一键长草'],
      en_US: ['图像识别', '自动刷图', '一键长草'],
    },
    icon_url: 'https://maa.plus/docs/images/maa-logo_512x512.png',
    links: [
      {
        primary: true,
        regionality: 'GLOBAL',
        localized_name: {
          zh_CN: '官网',
          en_US: '官网',
        },
        url: 'https://maa.plus/',
      },
      {
        primary: false,
        regionality: 'GLOBAL',
        localized_name: {
          zh_CN: 'GitHub',
          en_US: 'GitHub',
        },
        url: 'https://github.com/MaaAssistantArknights/MaaAssistantArknights',
      },
    ],
  },
  {
    id: 'extra-mirrorchyan',
    localized_name: {
      zh_CN: 'Mirror酱',
      en_US: 'Mirror酱',
    },
    localized_description: {
      zh_CN:
        'Mirror酱是一个第三方应用分发平台，让开源应用的更新更简单。用户付费使用，收益与开发者共享。此外，Mirror酱本身也是开源的。',
      en_US:
        'Mirror酱是一个第三方应用分发平台，让开源应用的更新更简单。用户付费使用，收益与开发者共享。此外，Mirror酱本身也是开源的。',
    },
    localized_slogan: { zh_CN: '', en_US: '' },
    localized_tags: {
      zh_CN: ['开源分发平台', '高速下载'],
      en_US: ['开源分发平台', '高速下载'],
    },
    icon_url: 'https://mirrorchyan.com/favicon.ico',
    links: [
      {
        primary: true,
        regionality: 'GLOBAL',
        localized_name: {
          zh_CN: '官网',
          en_US: '官网',
        },
        url: 'https://mirrorchyan.com/zh/get-start',
      },
    ],
  },
  {
    id: 'extra-mower',
    localized_name: {
      zh_CN: 'Mower',
      en_US: 'Mower',
    },
    localized_description: {
      zh_CN: 'Mower 是为长期运行设计的、开源的明日方舟脚本。',
      en_US: 'Mower 是为长期运行设计的、开源的明日方舟脚本。',
    },
    localized_slogan: {
      zh_CN: '《明日方舟》长草助手',
      en_US: '《明日方舟》长草助手',
    },
    localized_tags: {
      zh_CN: ['动态换班', '跑单', '森空岛签到', '长草助手'],
      en_US: ['动态换班', '跑单', '森空岛签到', '长草助手'],
    },
    icon_url: 'https://avatars.githubusercontent.com/u/133866484',
    links: [
      {
        primary: true,
        regionality: 'GLOBAL',
        localized_name: {
          zh_CN: 'GitHub',
          en_US: 'GitHub',
        },
        url: 'https://github.com/ArkMowers/arknights-mower',
      },
    ],
  },
];

// 响应式状态
const links = ref<FriendLink[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

/**
 * 获取友情链接数据
 */
async function fetchLinks(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();

    if (data.code !== '00000') {
      throw new Error(`API 错误: ${data.message}`);
    }

    links.value = [...data.data, ...extraLinksList];
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取数据失败';
    console.error('获取友情链接失败:', err);
  } finally {
    loading.value = false;
  }
}

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
