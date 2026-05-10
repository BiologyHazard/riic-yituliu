import { reactive, ref } from 'vue';

import type { Items, ResultMatrix, Stages, Zones } from '@/types/penguinStats';

export const itemsUrl = 'https://penguin-stats.io/PenguinStats/api/v2/items';
export const resultMatrixUrl =
  'https://penguin-stats.io/PenguinStats/api/v2/result/matrix?show_closed_zones=true';
export const stagesUrl = 'https://penguin-stats.io/PenguinStats/api/v2/stages';
export const zonesUrl = 'https://penguin-stats.io/PenguinStats/api/v2/zones';

export const items = reactive<Items>([]);
export const resultMatrix = reactive<ResultMatrix>({ matrix: [] });
export const stages = reactive<Stages>([]);
export const zones = reactive<Zones>([]);

export const isPenguinDataLoading = ref(false);
export const penguinDataError = ref<unknown | null>(null);

let abortController: AbortController | null = null;

export async function abortPenguinDataLoading() {
  if (abortController) {
    abortController.abort();
  }
}

/**
 * 异步加载 Penguin Stats 数据
 */
export async function loadPenguinData() {
  abortPenguinDataLoading();
  abortController = new AbortController();
  const { signal } = abortController;

  isPenguinDataLoading.value = true;
  penguinDataError.value = null;
  try {
    const [itemsRes, matrixRes, stagesRes, zonesRes] = await Promise.all([
      fetch(itemsUrl, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Penguin Items fail: ${res.statusText}`);
        return res.json();
      }),
      fetch(resultMatrixUrl, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Penguin Matrix fail: ${res.statusText}`);
        return res.json();
      }),
      fetch(stagesUrl, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Penguin Stages fail: ${res.statusText}`);
        return res.json();
      }),
      fetch(zonesUrl, { signal }).then((res) => {
        if (!res.ok) throw new Error(`Penguin Zones fail: ${res.statusText}`);
        return res.json();
      }),
    ]);

    Object.assign(items, itemsRes);
    Object.assign(resultMatrix, matrixRes);
    Object.assign(stages, stagesRes);
    Object.assign(zones, zonesRes);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return;
    }
    console.error('Penguin data loading failed:', err);
    penguinDataError.value = err;
  } finally {
    if (abortController?.signal === signal) {
      isPenguinDataLoading.value = false;
      abortController = null;
    }
  }
}
