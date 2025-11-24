<script setup lang="ts">
import ExternalIcon from '@/components/icons/ExternalIcon.vue';
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
  <div class="links-view">
    <h1>友情链接</h1>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中……</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">❌ {{ error }}</p>
      <button @click="fetchLinks" class="retry-button">重试</button>
    </div>

    <!-- 正常状态 -->
    <div v-else class="links-grid">
      <div v-for="link in links" :key="link.id" class="friend-link-card">
        <!-- 图标和标题 -->
        <div class="card-header">
          <img
            v-if="link.icon_url"
            :src="link.icon_url"
            :alt="`${link.localized_name.zh_CN}图标`"
            class="link-icon"
          />
          <span class="link-name">{{ link.localized_name.zh_CN }}</span>
        </div>

        <!-- 标签 -->
        <div v-if="link.localized_tags.zh_CN.length" class="link-tags">
          <div v-for="(tag, index) in link.localized_tags.zh_CN" :key="index" class="tag">
            {{ tag }}
          </div>
        </div>

        <!-- 描述 -->
        <div class="link-description">{{ link.localized_description.zh_CN }}</div>

        <!-- 标语 -->
        <div v-if="link.localized_slogan.zh_CN" class="link-slogan">
          {{ link.localized_slogan.zh_CN }}
        </div>

        <!-- 链接按钮 -->
        <div class="link-buttons">
          <a
            v-for="(linkItem, index) in link.links"
            :key="index"
            :href="linkItem.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button class="link-button" :class="{ primary: linkItem.primary }">
              {{ linkItem.localized_name.zh_CN }}<ExternalIcon />
            </button>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
h1 {
  text-align: center;
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4em 2em;
}

.loading-spinner {
  width: 3em;
  height: 3em;
  border: 3px solid gray;
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 错误状态
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4em 2em;
  text-align: center;
}

.error-message {
  color: #ef4444;
}

// 正常状态
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2em;
}

.friend-link-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5em;
  background-color: var(--color-background-light);
  border: 1px solid var(--color-border);
  border-radius: 1em;
  padding: 1.5em;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1em;
}

.link-icon {
  width: 3.5em;
  height: 3.5em;
  border-radius: 0.5em;
  object-fit: cover;
  flex-shrink: 0;
}

.link-name {
  flex: 1;
  font-size: 1.5em;
  font-weight: bold;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.link-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75em 0.5em;
}

.tag {
  padding: 0.375em 1em;
  background-color: var(--color-background);
  border-radius: 999999px;
  font-size: 0.8em;
  color: var(--color-text-light);
}

.link-description {
  color: var(--color-text-light);
  flex: 1;
}

.link-slogan {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  font-weight: 500;
  font-style: italic;
}

.link-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75em;
}

.link-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  text-align: start;
  font-weight: 500;
}

.external-icon {
  width: 1em;
  height: 1em;
  opacity: 0.6;
}

.link-button:hover .external-icon {
  opacity: 0.9;
}
</style>
