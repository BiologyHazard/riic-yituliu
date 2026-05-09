import '@/assets/css/main.scss';
import '@/assets/css/base.css';
import ui from '@nuxt/ui/vue-plugin';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { useDataSource } from './composables/useDataSource';
import { loadGameData } from './utils/gameData';
import { loadPenguinData } from './utils/penguinStats';

const app = createApp(App);

app.use(router);
app.use(ui);

// 在挂载前初始化数据源并加载数据
const { currentSource } = useDataSource();
Promise.all([loadGameData(currentSource.value.baseUrl), loadPenguinData()]).then(() => {
  app.mount('#app');
});
