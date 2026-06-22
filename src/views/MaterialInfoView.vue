<script setup lang="ts">
import { getItemIconUrl } from '@/utils/dataSources';
import { gameData } from '@/utils/gameData';
import {
  getItemName,
  getItemRarity,
  getWorkshopByProductRate,
  isEliteMaterial,
} from '@/utils/item';
import { items, resultMatrix, stages, zones } from '@/utils/penguinStats';
import { computed, ref } from 'vue';

const t1EliteMaterialEpgsShopPrice: Record<string, number> = {
  '30011': 15,
  '30021': 25,
  '30031': 25,
  '30041': 30,
  '30051': 30,
  '30061': 40,
};

const decimalPlacesInputValue = ref<string>('4');
const decimalPlaces = computed<number | null>(() => {
  const value = parseInt(decimalPlacesInputValue.value, 10);
  return isNaN(value) ? null : value;
});
const currentDateTime = new Date();

function formatDateTimeWithOffset(date: Date): string {
  const pad = (n: number, width = 2) => n.toString().padStart(width, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const offsetHours = pad(Math.floor(absOffset / 60));
  const offsetMins = pad(absOffset % 60);

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}${sign}${offsetHours}${offsetMins}`;
}

function formatNumber(num: number, decimalPlaces: number | null): string {
  if (decimalPlaces === null || isNaN(decimalPlaces)) {
    return num.toString();
  } else {
    return num.toFixed(decimalPlaces);
  }
}

// 稀疏矩阵改为按作战存储
const resultMatrixByStage = computed<Map<string, Map<string, { times: number; quantity: number }>>>(
  () => {
    const map = new Map(stages.value.map((stage) => [stage.stageId, new Map()]));
    for (const { stageId, itemId, times, quantity } of resultMatrix.value.matrix) {
      if (!map.has(stageId)) {
        throw new Error(`Stage ID ${stageId} not found in stages`);
      }
      const stageMap = map.get(stageId)!;
      if (stageMap.has(itemId)) {
        throw new Error(`Item ID ${itemId} already exists in stage ${stageId}`);
      }
      stageMap.set(itemId, { times, quantity });
    }
    return map;
  },
);

// 把 Array 转换为 Map，方便按 ID 查询
const itemIdToItem = computed(() => new Map(items.value.map((item) => [item.itemId, item])));
const stageIdToStage = computed(() => new Map(stages.value.map((stage) => [stage.stageId, stage])));
const zoneIdToZone = computed(() => new Map(zones.value.map((zone) => [zone.zoneId, zone])));

/**
 * 通过掉落判断作战类型
 *
 * 目前并没有什么非常明确的规则来判断一个活动是不是 SideStory 以及一个作战是不是典型的 SideStory 作战。
 * 我使用的规则是：
 * 如果一个作战除了家具外仅掉落全部 6 种白材料，或者掉落 2 种绿材料，或者掉落 1 种蓝材料，则认为是 SideStory 作战
 */
function judgeStageType(stageId: string): 'SS_T1' | 'SS_T2' | 'SS_T3' | 'OTHERS' {
  const stageInfo = stageIdToStage.value.get(stageId);
  if (stageInfo === undefined) {
    throw new Error(`Stage ID ${stageId} not found in stages`);
  }
  const zoneInfo = zoneIdToZone.value.get(stageInfo.zoneId);
  if (zoneInfo === undefined) {
    throw new Error(`Zone ID ${stageInfo.zoneId} not found in zones`);
  }
  const dropInfo = resultMatrixByStage.value.get(stageId);
  if (dropInfo === undefined) {
    throw new Error(`Drop info for stage ID ${stageId} not found in resultMatrixByStage`);
  }

  if (stageInfo.stageType !== 'ACTIVITY') {
    return 'OTHERS';
  }
  if (zoneInfo.type !== 'ACTIVITY') {
    return 'OTHERS';
  }

  // 把家具排除掉
  const dropItemIdListFiltered = Array.from(dropInfo.keys()).filter(
    (itemId) => itemIdToItem.value.get(itemId)?.itemType === 'MATERIAL',
  );
  // console.log(stageId, stageInfo.code, zoneIdToZone.get(stageInfo.zoneId)!.zoneName, dropItemIds);
  if (
    dropItemIdListFiltered.length === 1 &&
    dropItemIdListFiltered.every((itemId) => getItemRarity(itemId) === 2)
  ) {
    return 'SS_T3';
  } else if (
    dropItemIdListFiltered.length === 2 &&
    dropItemIdListFiltered.every((itemId) => getItemRarity(itemId) === 1)
  ) {
    return 'SS_T2';
  } else if (
    dropItemIdListFiltered.length === 6 &&
    dropItemIdListFiltered.every((itemId) => getItemRarity(itemId) === 0)
  ) {
    return 'SS_T1';
  } else {
    return 'OTHERS';
  }
}

// 计算每一个作战的类型
const stageTypeMap = computed(
  () =>
    new Map(
      Array.from(stageIdToStage.value.keys()).map((stageId) => [stageId, judgeStageType(stageId)]),
    ),
);
const _ssT2StageIds = computed(() =>
  Array.from(stageTypeMap.value.entries())
    .filter(([, type]) => type === 'SS_T2')
    .map(([stageId]) => stageId),
);
const _ssT3StageIds = computed(() =>
  Array.from(stageTypeMap.value.entries())
    .filter(([, type]) => type === 'SS_T3')
    .map(([stageId]) => stageId),
);

// const t1EliteMaterialItems = Object.fromEntries(
//   Object.entries(gameData.value?.itemTable.items ?? {}).filter(([itemId, item]) => {
//     return isEliteMaterial(itemId) && getItemRarity(itemId) === 0;
//   }),
// );

const t1EliteMaterialIds = computed(() =>
  Object.keys(gameData.value?.itemTable.items ?? {}).filter(
    (itemId) => isEliteMaterial(itemId) && getItemRarity(itemId) === 0,
  ),
);

const t1EliteMaterialTotalDropCountMap = computed(() => {
  const map = new Map(t1EliteMaterialIds.value.map((itemId) => [itemId, 0]));
  const apMap = new Map(t1EliteMaterialIds.value.map((itemId) => [itemId, 0]));

  for (const [stageId, stage] of stageIdToStage.value.entries()) {
    const dropInfo = resultMatrixByStage.value.get(stageId)!;
    switch (judgeStageType(stageId)) {
      case 'SS_T1':
        for (const [itemId, { quantity }] of dropInfo.entries()) {
          if (map.has(itemId)) {
            map.set(itemId, map.get(itemId)! + quantity);
            apMap.set(itemId, apMap.get(itemId)! + dropInfo.get(itemId)!.times * stage.apCost);
          }
        }
        break;
      case 'SS_T2': {
        const dropInfoFiltered = new Map(
          Array.from(dropInfo.entries()).filter(
            ([itemId]) => itemIdToItem.value.get(itemId)?.itemType === 'MATERIAL',
          ),
        );
        const _dropItemIds = Array.from(dropInfoFiltered.keys());

        break;
      }
      case 'SS_T3':
        break;
    }
  }
  return { dropCountMap: map, apCostMap: apMap };
});

const t1EliteMaterialDisplayInfo = computed(() =>
  Object.fromEntries(
    t1EliteMaterialIds.value.map((itemId) => {
      const { dropCountMap, apCostMap } = t1EliteMaterialTotalDropCountMap.value;
      return [
        itemId,
        {
          iconUrl: getItemIconUrl(itemId),
          itemId: itemId,
          itemName: getItemName(itemId),
          workshopByproductWeight: getWorkshopByProductRate(itemId),
          epgsShopPrice: t1EliteMaterialEpgsShopPrice[itemId],
          sideStoryDropRatePerSanity: dropCountMap.get(itemId)! / apCostMap.get(itemId)!,
          expectedSanityPerItem: apCostMap.get(itemId)! / dropCountMap.get(itemId)!,
        },
      ];
    }),
  ),
);

// const t1EliteMaterialDisplayInfo = {
//   '30011': {
//     iconUrl: getItemIconUrl('30011'),
//     itemId: '30011',
//     itemName: getItemName('30011'),
//     workshopByproductWeight: 15,
//     epgsShopPrice: 15,
//     sideStoryDropRatePerSanity: 0.0693,
//     expectedSanityPerItem: 14.4359,
//   },
//   '30021': {
//     iconUrl: getItemIconUrl('30021'),
//     itemId: '30021',
//     itemName: getItemName('30021'),
//     workshopByproductWeight: 15,
//     epgsShopPrice: 15,
//     sideStoryDropRatePerSanity: 0.0693,
//     expectedSanityPerItem: 14.435912312313123,
//   },
// };

const t2EliteMaterialDisplayInfo = computed(() => ({
  '30012': {
    iconUrl: getItemIconUrl('30012'),
    itemId: '30012',
    itemName: getItemName('30012'),
    workshopByproductWeight: 15,
    epgsShopPrice: 15,
    sideStoryMainDropRatePerSanity: 0.0693,
    expectedSanityPerMainDropItem: 14.4359,
    sideStorySubDropRatePerSanity: 0.03465,
    expectedSanityPerSubDropItem: 28.8718,
  },
  '30022': {
    iconUrl: getItemIconUrl('30022'),
    itemId: '30022',
    itemName: getItemName('30022'),
    workshopByproductWeight: 15,
    epgsShopPrice: 15,
    sideStoryMainDropRatePerSanity: 0.0693,
    expectedSanityPerMainDropItem: 14.4359,
    sideStorySubDropRatePerSanity: 0.03465,
    expectedSanityPerSubDropItem: 28.8718,
  },
}));

const t3EliteMaterialDisplayInfo = computed(() => ({
  '30013': {
    iconUrl: getItemIconUrl('30013'),
    itemId: '30013',
    itemName: getItemName('30013'),
    workshopByproductWeightBefore20231008: 10,
    workshopByproductWeightAfter20231008: 15,
    qualificationCertificatePrice: 40,
    qualificationCertificateStock: 10,
    epgsShopPrice: 10,
    sideStoryDropRatePerSanity: 0.0346,
    expectedSanityPerItem: 28.9017,
  },
  '30023': {
    iconUrl: getItemIconUrl('30023'),
    itemId: '30023',
    itemName: getItemName('30023'),
    workshopByproductWeightBefore20231008: 10,
    workshopByproductWeightAfter20231008: 15,
    qualificationCertificatePrice: 40,
    qualificationCertificateStock: 10,
    epgsShopPrice: 10,
    sideStoryDropRatePerSanity: 0.0346,
    expectedSanityPerItem: 28.9017,
  },
  '30033': {
    iconUrl: getItemIconUrl('30033'),
    itemId: '30033',
    itemName: getItemName('30033'),
    workshopByproductWeightBefore20231008: 10,
    workshopByproductWeightAfter20231008: 15,
    qualificationCertificatePrice: 40,
    qualificationCertificateStock: 10,
    epgsShopPrice: 10,
    sideStoryDropRatePerSanity: 0.0346,
    expectedSanityPerItem: 28.9017,
  },
  '30043': {
    iconUrl: getItemIconUrl('30043'),
    itemId: '30043',
    itemName: getItemName('30043'),
    workshopByproductWeightBefore20231008: 10,
    workshopByproductWeightAfter20231008: 15,
    qualificationCertificatePrice: 40,
    qualificationCertificateStock: 10,
    epgsShopPrice: 10,
    sideStoryDropRatePerSanity: 0.0346,
    expectedSanityPerItem: 28.9017,
  },
  '30053': {
    iconUrl: getItemIconUrl('30053'),
    itemId: '30053',
    itemName: getItemName('30053'),
    workshopByproductWeightBefore20231008: 10,
    workshopByproductWeightAfter20231008: 15,
    qualificationCertificatePrice: 40,
    qualificationCertificateStock: 10,
    epgsShopPrice: 10,
    sideStoryDropRatePerSanity: 0.0346,
    expectedSanityPerItem: 28.9017,
  },
}));
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="材料信息" />
      <UPageBody>
        <UAccordion
          :default-value="['显示设置', '白材料信息', '绿材料信息', '蓝材料信息']"
          :items="[
            { label: '显示设置', slot: 'settings' },
            { label: '白材料信息', slot: 't1' },
            { label: '绿材料信息', slot: 't2' },
            { label: '蓝材料信息', slot: 't3' },
          ]"
          multiple
        >
          <template #settings>
            <div class="decimal-control">
              <label for="decimal-places">小数位数：</label>
              <UInput
                id="decimal-places"
                v-model="decimalPlacesInputValue"
                class="decimal-input"
                min="0"
                step="1"
                type="number"
              />
            </div>
          </template>

          <template #t1>
            <div class="table-caption">
              <div class="table-caption-left">
                <div class="table-caption-title"><span class="color-t1">白材料</span>信息</div>
                <div class="table-caption-subtitle">
                  更新于 {{ formatDateTimeWithOffset(currentDateTime) }}，请注意时效性
                </div>
              </div>
              <div class="table-caption-right">
                bilibili：Bio-Hazard<br />森空岛：BioHazard<br />NGA：Bio-Hazard
              </div>
            </div>
            <div class="table-container">
              <table id="t1-elite-material-display-table" class="table">
                <thead>
                  <tr>
                    <td>图标</td>
                    <td>物品 ID</td>
                    <td>物品名称</td>
                    <td>加工站副产品权重</td>
                    <td>寻访参数模型交易所价格（8 个）</td>
                    <td>SideStory 单位理智掉落数</td>
                    <td>SideStory 单件期望理智</td>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="{
                      iconUrl,
                      itemId,
                      itemName,
                      workshopByproductWeight,
                      epgsShopPrice,
                      sideStoryDropRatePerSanity,
                      expectedSanityPerItem,
                    } in Object.values(t1EliteMaterialDisplayInfo)"
                    :key="itemId"
                  >
                    <td class="table-td-icon">
                      <img :alt="itemName" referrerpolicy="no-referrer" :src="iconUrl" />
                    </td>
                    <td>{{ itemId }}</td>
                    <td>{{ itemName }}</td>
                    <td>{{ workshopByproductWeight }}</td>
                    <td>{{ epgsShopPrice }}</td>
                    <td>{{ formatNumber(sideStoryDropRatePerSanity, decimalPlaces) }}</td>
                    <td>{{ formatNumber(expectedSanityPerItem, decimalPlaces) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <template #t2>
            <div class="table-caption">
              <div class="table-caption-left">
                <div class="table-caption-title"><span class="color-t2">绿材料</span>信息</div>
                <div class="table-caption-subtitle">
                  更新于 {{ formatDateTimeWithOffset(currentDateTime) }}，请注意时效性
                </div>
              </div>
              <div class="table-caption-right">
                bilibili：Bio-Hazard<br />森空岛：BioHazard<br />NGA：Bio-Hazard
              </div>
            </div>
            <div class="table-container">
              <table id="t2-elite-material-display-table" class="table">
                <thead>
                  <tr>
                    <td>图标</td>
                    <td>物品 ID</td>
                    <td>物品名称</td>
                    <td>加工站副产品权重</td>
                    <td>寻访参数模型交易所价格（4 个）</td>
                    <td>SideStory 单位理智主掉落数</td>
                    <td>SideStory 主掉落单件期望理智</td>
                    <td>SideStory 单位理智副掉落数</td>
                    <td>SideStory 副掉落单件期望理智</td>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="{
                      iconUrl,
                      itemId,
                      itemName,
                      workshopByproductWeight,
                      epgsShopPrice,
                      sideStoryMainDropRatePerSanity,
                      expectedSanityPerMainDropItem,
                      sideStorySubDropRatePerSanity,
                      expectedSanityPerSubDropItem,
                    } in Object.values(t2EliteMaterialDisplayInfo)"
                    :key="itemId"
                  >
                    <td class="table-td-icon">
                      <img :alt="itemName" referrerpolicy="no-referrer" :src="iconUrl" />
                    </td>
                    <td>{{ itemId }}</td>
                    <td>{{ itemName }}</td>
                    <td>{{ workshopByproductWeight }}</td>
                    <td>{{ epgsShopPrice }}</td>
                    <td>{{ formatNumber(sideStoryMainDropRatePerSanity, decimalPlaces) }}</td>
                    <td>{{ formatNumber(expectedSanityPerMainDropItem, decimalPlaces) }}</td>
                    <td>{{ formatNumber(sideStorySubDropRatePerSanity, decimalPlaces) }}</td>
                    <td>{{ formatNumber(expectedSanityPerSubDropItem, decimalPlaces) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <template #t3>
            <div class="table-caption">
              <div class="table-caption-left">
                <div class="table-caption-title"><span class="color-t3">蓝材料</span>信息</div>
                <div class="table-caption-subtitle">
                  更新于 {{ formatDateTimeWithOffset(currentDateTime) }}，请注意时效性
                </div>
              </div>
              <div class="table-caption-right">
                bilibili：Bio-Hazard<br />森空岛：BioHazard<br />NGA：Bio-Hazard
              </div>
            </div>
            <div class="table-container">
              <table id="t3-elite-material-display-table" class="table">
                <thead>
                  <tr>
                    <td>图标</td>
                    <td>物品 ID</td>
                    <td>物品名称</td>
                    <td>加工站副产品权重（2023-10-08 以前）</td>
                    <td>加工站副产品权重（2023-10-08 以后）</td>
                    <td>资质凭证区价格</td>
                    <td>资质凭证区库存数量</td>
                    <td>寻访参数模型交易所价格（2 个）</td>
                    <td>SideStory 单位理智掉落数</td>
                    <td>SideStory 单件期望理智</td>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="{
                      iconUrl,
                      itemId,
                      itemName,
                      workshopByproductWeightBefore20231008,
                      workshopByproductWeightAfter20231008,
                      qualificationCertificatePrice,
                      qualificationCertificateStock,
                      epgsShopPrice,
                      sideStoryDropRatePerSanity,
                      expectedSanityPerItem,
                    } in Object.values(t3EliteMaterialDisplayInfo)"
                    :key="itemId"
                  >
                    <td class="table-td-icon">
                      <a
                        :href="`https://prts.wiki/w/${itemName}`"
                        rel="noopener noreferrer"
                        target="_blank"
                        :title="`在 PRTS Wiki 上查看 ${itemName}`"
                        ><img :alt="itemName" referrerpolicy="no-referrer" :src="iconUrl"
                      /></a>
                    </td>
                    <td>{{ itemId }}</td>
                    <td>{{ itemName }}</td>
                    <td>{{ workshopByproductWeightBefore20231008 }}</td>
                    <td>{{ workshopByproductWeightAfter20231008 }}</td>
                    <td>{{ qualificationCertificatePrice }}</td>
                    <td>{{ qualificationCertificateStock }}</td>
                    <td>{{ epgsShopPrice }}</td>
                    <td>{{ formatNumber(sideStoryDropRatePerSanity, decimalPlaces) }}</td>
                    <td>{{ formatNumber(expectedSanityPerItem, decimalPlaces) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </UAccordion>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped>
h1 {
  margin-bottom: 1em;
  text-align: center;
}

.decimal-control {
  display: flex;
  gap: 0.5em;
  align-items: center;
  padding: 0.5em 0;
}

.decimal-input {
  width: 6em;
}

.table-caption {
  display: flex;
  flex-direction: row;
  gap: 2em;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5em;
}

.table-caption-left {
  text-align: center;
}

.table-caption-title {
  font-size: 1.5em;
  font-weight: bold;
}

.table-caption-right {
  text-align: right;
}

.table-container {
  width: fit-content;
  max-width: 100%;
  margin: 1em auto;
  overflow: auto;
  border: 0.1em solid var(--color-border);
  border-radius: 1em;
}

.table {
  font-size: 1em;
  color: var(--color-text);
  table-layout: auto;
  border-collapse: collapse;
  background: var(--color-background);
}

.table tr td {
  width: 10em;
  min-width: 5em;
  height: 3em;
  padding: 0.5em;
  line-height: 1.3;
  text-align: center;
}

.table .table-td-icon {
  padding: 0;
}

.table thead {
  font-weight: 700;
  background: var(--color-background-light);
  border-bottom: 0.1em solid var(--color-border);
}

.table tbody tr {
  transition: background-color 0.15s;
}

.table tbody tr:hover {
  background: var(--color-background-light);
}

.table img {
  display: block;
  width: 2.5em;
  height: 2.5em;
  margin: auto;
  object-fit: contain;
}

a {
  all: unset;
  cursor: pointer;
}
</style>
