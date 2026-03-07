// import { ref } from 'vue';

import type { Items, ResultMatrix, Stages, Zones } from '@/types/penguinStats';

export const itemsUrl = 'https://penguin-stats.io/PenguinStats/api/v2/items';
export const resultMatrixUrl =
  'https://penguin-stats.io/PenguinStats/api/v2/result/matrix?show_closed_zones=true';
export const stagesUrl = 'https://penguin-stats.io/PenguinStats/api/v2/stages';
export const zonesUrl = 'https://penguin-stats.io/PenguinStats/api/v2/zones';

export const items: Items = await fetch(itemsUrl).then((response) => response.json());
export const resultMatrix: ResultMatrix = await fetch(resultMatrixUrl).then((response) =>
  response.json(),
);
export const stages: Stages = await fetch(stagesUrl).then((response) => response.json());
export const zones: Zones = await fetch(zonesUrl).then((response) => response.json());

// const ResultMatrixRef = ref<ResultMatrix | null>(null);

// export async function getPenguinStatsResultMatrix(): Promise<ResultMatrix> {
//   if (ResultMatrixRef.value !== null) {
//     return ResultMatrixRef.value;
//   }
//   ResultMatrixRef.value = await fetch(url).then((response) => response.json());
//   return ResultMatrixRef.value!;
// }
