import App from '@/App.vue';
import '@/assets/css/main.css';
import router from '@/router';
import ui from '@nuxt/ui/vue-plugin';
import { createHead } from '@unhead/vue/client';
import { createApp } from 'vue';

// 动态导入字体 CSS，构建时生成单独的 CSS 文件
import('@/assets/css/fonts.css');

export const app = createApp(App);

const head = createHead();

app.use(head);
app.use(router);
app.use(ui);

app.mount('#app');
