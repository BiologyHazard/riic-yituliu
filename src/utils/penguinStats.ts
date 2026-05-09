import { reactive, ref } from 'vue';

import type { Items, ResultMatrix, Stages, Zones } from '@/types/penguinStats';

export const isPenguinDataLoading = ref(false);
export const penguinDataError = ref<Error | null>(null);

export const itemsUrl = 'https://penguin-stats.io/PenguinStats/api/v2/items';
export const resultMatrixUrl =
  'https://penguin-stats.io/PenguinStats/api/v2/result/matrix?show_closed_zones=true';
export const stagesUrl = 'https://penguin-stats.io/PenguinStats/api/v2/stages';
export const zonesUrl = 'https://penguin-stats.io/PenguinStats/api/v2/zones';

export const items = reactive<Items>([]);
export const resultMatrix = reactive<ResultMatrix>({ matrix: [] });
export const stages = reactive<Stages>([]);
export const zones = reactive<Zones>([]);

/**
 * 异步加载 Penguin Stats 数据
 */
export async function loadPenguinData() {
  isPenguinDataLoading.value = true;
  penguinDataError.value = null;
  try {
    const [itemsRes, matrixRes, stagesRes, zonesRes] = await Promise.all([
      fetch(itemsUrl).then((res) => {
        if (!res.ok) throw new Error(`Penguin Items fail: ${res.statusText}`);
        return res.json();
      }),
      fetch(resultMatrixUrl).then((res) => {
        if (!res.ok) throw new Error(`Penguin Matrix fail: ${res.statusText}`);
        return res.json();
      }),
      fetch(stagesUrl).then((res) => {
        if (!res.ok) throw new Error(`Penguin Stages fail: ${res.statusText}`);
        return res.json();
      }),
      fetch(zonesUrl).then((res) => {
        if (!res.ok) throw new Error(`Penguin Zones fail: ${res.statusText}`);
        return res.json();
      }),
    ]);

    Object.assign(items, itemsRes);
    Object.assign(resultMatrix, matrixRes);
    Object.assign(stages, stagesRes);
    Object.assign(zones, zonesRes);
  } catch (err) {
    console.error('Penguin data loading failed:', err);
    penguinDataError.value = err instanceof Error ? err : new Error(String(err));
  } finally {
    isPenguinDataLoading.value = false;
  }
}
