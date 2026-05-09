import { reactive } from 'vue';

import type { Items, ResultMatrix, Stages, Zones } from '@/types/penguinStats';

export const itemsUrl = 'https://penguin-stats.io/PenguinStats/api/v2/items';
export const resultMatrixUrl =
  'https://penguin-stats.io/PenguinStats/api/v2/result/matrix?show_closed_zones=true';
export const stagesUrl = 'https://penguin-stats.io/PenguinStats/api/v2/stages';
export const zonesUrl = 'https://penguin-stats.io/PenguinStats/api/v2/zones';

export const items = reactive<Items>([] as Items);
export const resultMatrix = reactive<ResultMatrix>({} as ResultMatrix);
export const stages = reactive<Stages>([] as Stages);
export const zones = reactive<Zones>([] as Zones);

/**
 * 异步加载 Penguin Stats 数据
 */
export async function loadPenguinData() {
  const [itemsRes, matrixRes, stagesRes, zonesRes] = await Promise.all([
    fetch(itemsUrl).then((res) => res.json()),
    fetch(resultMatrixUrl).then((res) => res.json()),
    fetch(stagesUrl).then((res) => res.json()),
    fetch(zonesUrl).then((res) => res.json()),
  ]);

  Object.assign(items, itemsRes);
  Object.assign(resultMatrix, matrixRes);
  Object.assign(stages, stagesRes);
  Object.assign(zones, zonesRes);
}
