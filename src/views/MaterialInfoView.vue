<script setup lang="ts">
import { itemTable } from '@/utils/gameData';
import { getWorkshopByProductRate, isEliteMaterial } from '@/utils/item';
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

function getRawItemIconUrl(itemId: string): string | undefined {
  const item = itemTable.items[itemId];
  if (item === undefined) {
    return undefined;
  }
  return `https://torappu.prts.wiki/assets/item_icon/${item.iconId}.png`;
}

// 稀疏矩阵改为按作战存储
const resultMatrixByStage: Map<string, Map<string, { times: number; quantity: number }>> = new Map(
  stages.map((stage) => [stage.stageId, new Map()]),
);
for (const { stageId, itemId, times, quantity } of resultMatrix.matrix) {
  if (!resultMatrixByStage.has(stageId)) {
    throw new Error(`Stage ID ${stageId} not found in stages`);
  }
  const stageMap = resultMatrixByStage.get(stageId)!;
  if (stageMap.has(itemId)) {
    throw new Error(`Item ID ${itemId} already exists in stage ${stageId}`);
  }
  stageMap.set(itemId, { times, quantity });
}

// 把 Array 转换为 Map，方便按 ID 查询
const itemIdToItem = new Map(items.map((item) => [item.itemId, item]));
const stageIdToStage = new Map(stages.map((stage) => [stage.stageId, stage]));
const zoneIdToZone = new Map(zones.map((zone) => [zone.zoneId, zone]));

/**
 * 通过掉落判断作战类型
 *
 * 目前并没有什么非常明确的规则来判断一个活动是不是 SideStory 以及一个作战是不是典型的 SideStory 作战。
 * 我使用的规则是：
 * 如果一个作战除了家具外仅掉落全部 6 种白材料，或者掉落 2 种绿材料，或者掉落 1 种蓝材料，则认为是 SideStory 作战
 */
function judgeStageType(stageId: string): 'SS_T1' | 'SS_T2' | 'SS_T3' | 'OTHERS' {
  const stageInfo = stageIdToStage.get(stageId);
  if (stageInfo === undefined) {
    throw new Error(`Stage ID ${stageId} not found in stages`);
  }
  const zoneInfo = zoneIdToZone.get(stageInfo.zoneId);
  if (zoneInfo === undefined) {
    throw new Error(`Zone ID ${stageInfo.zoneId} not found in zones`);
  }
  const dropInfo = resultMatrixByStage.get(stageId);
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
    (itemId) => itemIdToItem.get(itemId)?.itemType === 'MATERIAL',
  );
  // console.log(stageId, stageInfo.code, zoneIdToZone.get(stageInfo.zoneId)!.zoneName, dropItemIds);
  if (
    dropItemIdListFiltered.length === 1 &&
    dropItemIdListFiltered.every((itemId) => itemTable.items[itemId]?.rarity === 'TIER_3')
  ) {
    return 'SS_T3';
  } else if (
    dropItemIdListFiltered.length === 2 &&
    dropItemIdListFiltered.every((itemId) => itemTable.items[itemId]?.rarity === 'TIER_2')
  ) {
    return 'SS_T2';
  } else if (
    dropItemIdListFiltered.length === 6 &&
    dropItemIdListFiltered.every((itemId) => itemTable.items[itemId]?.rarity === 'TIER_1')
  ) {
    return 'SS_T1';
  } else {
    return 'OTHERS';
  }
}

// 计算每一个作战的类型
const stageTypeMap = new Map(
  Array.from(stageIdToStage.keys()).map((stageId) => [stageId, judgeStageType(stageId)]),
);
const _ssT2StageIds = Array.from(stageTypeMap.entries())
  .filter(([, type]) => type === 'SS_T2')
  .map(([stageId]) => stageId);
const _ssT3StageIds = Array.from(stageTypeMap.entries())
  .filter(([, type]) => type === 'SS_T3')
  .map(([stageId]) => stageId);

// const t1EliteMaterialItems = Object.fromEntries(
//   Object.entries(itemTable.items).filter(([itemId, item]) => {
//     return isEliteMaterial(itemId) && item.rarity === 'TIER_1';
//   }),
// );

const t1EliteMaterialIds = Object.entries(itemTable.items)
  .filter(([itemId, item]) => isEliteMaterial(itemId) && item.rarity === 'TIER_1')
  .map(([itemId]) => itemId);

const t1EliteMaterialTotalDropCountMap = new Map(t1EliteMaterialIds.map((itemId) => [itemId, 0]));
const t1EliteMaterialTotalApCostMap = new Map(t1EliteMaterialIds.map((itemId) => [itemId, 0]));
for (const [stageId, stage] of stageIdToStage.entries()) {
  const dropInfo = resultMatrixByStage.get(stageId)!;
  switch (judgeStageType(stageId)) {
    case 'SS_T1':
      for (const [itemId, { times, quantity }] of dropInfo.entries()) {
        if (t1EliteMaterialTotalDropCountMap.has(itemId)) {
          t1EliteMaterialTotalDropCountMap.set(
            itemId,
            t1EliteMaterialTotalDropCountMap.get(itemId)! + quantity,
          );
          t1EliteMaterialTotalApCostMap.set(
            itemId,
            t1EliteMaterialTotalApCostMap.get(itemId)! + times * stage.apCost,
          );
        }
      }
      break;
    case 'SS_T2':
      const dropInfoFiltered = new Map(
        Array.from(dropInfo.entries()).filter(
          ([itemId]) => itemIdToItem.get(itemId)?.itemType === 'MATERIAL',
        ),
      );
      const _dropItemIds = Array.from(dropInfoFiltered.keys());

      break;
    case 'SS_T3':
      break;
  }
}

const t1EliteMaterialDisplayInfo = Object.fromEntries(
  t1EliteMaterialIds.map((itemId) => {
    return [
      itemId,
      {
        iconUrl: getRawItemIconUrl(itemId),
        itemId: itemId,
        itemName: itemTable.items[itemId]!.name,
        workshopByproductWeight: getWorkshopByProductRate(itemId),
        epgsShopPrice: t1EliteMaterialEpgsShopPrice[itemId],
        sideStoryDropRatePerSanity:
          t1EliteMaterialTotalDropCountMap.get(itemId)! /
          t1EliteMaterialTotalApCostMap.get(itemId)!,
        expectedSanityPerItem:
          t1EliteMaterialTotalApCostMap.get(itemId)! /
          t1EliteMaterialTotalDropCountMap.get(itemId)!,
      },
    ];
  }),
);

// const t1EliteMaterialDisplayInfo = {
//   '30011': {
//     iconUrl: `https://torappu.prts.wiki/assets/item_icon/${itemTable.items['30011']!.iconId}.png`,
//     itemId: '30011',
//     itemName: itemTable.items['30011']!.name,
//     workshopByproductWeight: 15,
//     epgsShopPrice: 15,
//     sideStoryDropRatePerSanity: 0.0693,
//     expectedSanityPerItem: 14.4359,
//   },
//   '30021': {
//     iconUrl: `https://torappu.prts.wiki/assets/item_icon/${itemTable.items['30021']!.iconId}.png`,
//     itemId: '30021',
//     itemName: itemTable.items['30021']!.name,
//     workshopByproductWeight: 15,
//     epgsShopPrice: 15,
//     sideStoryDropRatePerSanity: 0.0693,
//     expectedSanityPerItem: 14.435912312313123,
//   },
// };

const t2EliteMaterialDisplayInfo = {
  '30012': {
    iconUrl: `https://torappu.prts.wiki/assets/item_icon/${itemTable.items['30012']!.iconId}.png`,
    itemId: '30012',
    itemName: itemTable.items['30012']!.name,
    workshopByproductWeight: 15,
    epgsShopPrice: 15,
    sideStoryMainDropRatePerSanity: 0.0693,
    expectedSanityPerMainDropItem: 14.4359,
    sideStorySubDropRatePerSanity: 0.03465,
    expectedSanityPerSubDropItem: 28.8718,
  },
  '30022': {
    iconUrl: `https://torappu.prts.wiki/assets/item_icon/${itemTable.items['30022']!.iconId}.png`,
    itemId: '30022',
    itemName: itemTable.items['30022']!.name,
    workshopByproductWeight: 15,
    epgsShopPrice: 15,
    sideStoryMainDropRatePerSanity: 0.0693,
    expectedSanityPerMainDropItem: 14.4359,
    sideStorySubDropRatePerSanity: 0.03465,
    expectedSanityPerSubDropItem: 28.8718,
  },
};

const t3EliteMaterialDisplayInfo = {
  '30013': {
    iconUrl: `https://torappu.prts.wiki/assets/item_icon/${itemTable.items['30013']!.iconId}.png`,
    itemId: '30013',
    itemName: itemTable.items['30013']!.name,
    workshopByproductWeightBefore20231008: 10,
    workshopByproductWeightAfter20231008: 15,
    qualificationCertificatePrice: 40,
    qualificationCertificateStock: 10,
    epgsShopPrice: 10,
    sideStoryDropRatePerSanity: 0.0346,
    expectedSanityPerItem: 28.9017,
  },
  '30023': {
    iconUrl: `https://torappu.prts.wiki/assets/item_icon/${itemTable.items['30023']!.iconId}.png`,
    itemId: '30023',
    itemName: itemTable.items['30023']!.name,
    workshopByproductWeightBefore20231008: 10,
    workshopByproductWeightAfter20231008: 15,
    qualificationCertificatePrice: 40,
    qualificationCertificateStock: 10,
    epgsShopPrice: 10,
    sideStoryDropRatePerSanity: 0.0346,
    expectedSanityPerItem: 28.9017,
  },
  '30033': {
    iconUrl: `https://torappu.prts.wiki/assets/item_icon/${itemTable.items['30033']!.iconId}.png`,
    itemId: '30033',
    itemName: itemTable.items['30033']!.name,
    workshopByproductWeightBefore20231008: 10,
    workshopByproductWeightAfter20231008: 15,
    qualificationCertificatePrice: 40,
    qualificationCertificateStock: 10,
    epgsShopPrice: 10,
    sideStoryDropRatePerSanity: 0.0346,
    expectedSanityPerItem: 28.9017,
  },
  '30043': {
    iconUrl: `https://torappu.prts.wiki/assets/item_icon/${itemTable.items['30043']!.iconId}.png`,
    itemId: '30043',
    itemName: itemTable.items['30043']!.name,
    workshopByproductWeightBefore20231008: 10,
    workshopByproductWeightAfter20231008: 15,
    qualificationCertificatePrice: 40,
    qualificationCertificateStock: 10,
    epgsShopPrice: 10,
    sideStoryDropRatePerSanity: 0.0346,
    expectedSanityPerItem: 28.9017,
  },
  '30053': {
    iconUrl: `https://torappu.prts.wiki/assets/item_icon/${itemTable.items['30053']!.iconId}.png`,
    itemId: '30053',
    itemName: itemTable.items['30053']!.name,
    workshopByproductWeightBefore20231008: 10,
    workshopByproductWeightAfter20231008: 15,
    qualificationCertificatePrice: 40,
    qualificationCertificateStock: 10,
    epgsShopPrice: 10,
    sideStoryDropRatePerSanity: 0.0346,
    expectedSanityPerItem: 28.9017,
  },
};
</script>

<template>
  <h1>精英材料信息</h1>
  <details open>
    <summary><h2>显示设置</h2></summary>
    <div class="decimal-control">
      <label for="decimal-places">小数位数：</label>
      <input id="decimal-places" v-model="decimalPlacesInputValue" type="number" min="0" step="1" />
    </div>
  </details>

  <details>
    <ul>
      <li v-for="zone in zones" :key="zone.zoneId">
        {{ zone.zoneName }}（{{ zone.zoneId }}）
        <ul>
          <li
            v-for="stage in zone.stages
              .map((stageId) => stageIdToStage.get(stageId)!)
              .slice()
              .sort((a, b) => a.stageId.localeCompare(b.stageId))"
            :key="stage.stageId"
          >
            <span
              :class="{
                'color-t1': judgeStageType(stage.stageId) === 'SS_T1',
                'color-t2': judgeStageType(stage.stageId) === 'SS_T2',
                'color-t3': judgeStageType(stage.stageId) === 'SS_T3',
              }"
              >{{ stage.code }}（{{ stage.stageId }}）</span
            >
          </li>
        </ul>
      </li>
    </ul>
  </details>

  <details open>
    <summary>
      <h2><span class="color-t1">白材料</span>信息</h2>
    </summary>
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
            <td class="table-td-icon"><img :src="iconUrl" :alt="itemName" /></td>
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
  </details>

  <details open>
    <summary>
      <h2><span class="color-t2">绿材料</span>信息</h2>
    </summary>
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
            <td class="table-td-icon"><img :src="iconUrl" :alt="itemName" /></td>
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
  </details>

  <details open>
    <summary>
      <h2><span class="color-t3">蓝材料</span>信息</h2>
    </summary>
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
                target="_blank"
                rel="noopener noreferrer"
                :title="`在 PRTS Wiki 上查看 ${itemName}`"
                ><img :src="iconUrl" :alt="itemName"
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
  </details>
</template>

<style scoped lang="scss">
#decimal-places {
  width: 5em;
}

.table-caption {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 2em;

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
}

.table-container {
  overflow: auto;
  width: fit-content;
  max-width: 100%;
  margin: 1em auto;
  border: 0.1em solid var(--color-border);
  border-radius: 1em;
}

.table {
  table-layout: auto;
  border-collapse: collapse;
  font-size: 1em;
  background: var(--color-background);
  color: var(--color-text);

  tr td {
    min-width: 5em;
    width: 10em;
    height: 3em;
    padding: 0.5em 0.5em;
    text-align: center;
    line-height: 1.3;
  }

  .table-td-icon {
    padding: 0;
  }

  thead {
    background: var(--color-background-light);
    border-bottom: 0.1em solid var(--color-border);
    font-weight: 700;
  }

  tbody {
    tr {
      transition: background-color 0.15s;

      &:hover {
        background: var(--color-background-light);
      }
    }
  }

  img {
    width: 2.5em;
    height: 2.5em;
    object-fit: contain;
    display: block;
    margin: auto;
  }
}

a {
  all: unset;
  cursor: pointer;
}
</style>
