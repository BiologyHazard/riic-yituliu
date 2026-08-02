<script setup lang="ts">
import {
  charDevelopItemCost,
  getCharName,
  isCharInGame,
  patchedCharacterTable,
} from '@/utils/gameData/character';
import type { ItemInfo } from '@/utils/itemInfo';
import { combine, sortBySortId } from '@/utils/itemInfo';
import { computed, ref, watch } from 'vue';

const page = ref(1);
const itemsPerPage = 8;

const allCharsIdsInGame = computed(() => {
  return Object.keys(patchedCharacterTable.value).filter(isCharInGame);
});

const totalItems = computed(() => allCharsIdsInGame.value.length);

const paginatedCharIds = computed(() => {
  const start = (page.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return allCharsIdsInGame.value.slice(start, end);
});

// 缓存计算结果
const costCache = ref(new Map<string, ItemInfo[]>());

function getOperatorCost(charId: string): ItemInfo[] | undefined {
  return costCache.value.get(charId);
}

// 异步预计算当前页的消耗
async function preloadCosts(charIds: string[]) {
  for (const charId of charIds) {
    if (!costCache.value.has(charId)) {
      // 使用 requestIdleCallback 或 setTimeout 拆分计算任务，避免阻塞 UI
      await new Promise((resolve) => {
        const calculate = () => {
          const cost = sortBySortId(combine(charDevelopItemCost(charId)));
          costCache.value.set(charId, cost);
          resolve(null);
        };

        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(calculate);
        } else {
          setTimeout(calculate, 0);
        }
      });
    }
  }
}

watch(patchedCharacterTable, () => {
  costCache.value.clear();
});
watch(paginatedCharIds, preloadCosts, { immediate: true });

const totalCost = computed(() => {
  const cost = [];
  for (const charId of allCharsIdsInGame.value) {
    const costList = charDevelopItemCost(charId);
    cost.push(...costList);
  }
  return sortBySortId(combine(cost));
});
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="干员拉满材料消耗" />
      <UPageBody>
        <div class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <ItemWithCount
              v-for="item in totalCost"
              :key="item.itemId"
              class="h-14 w-14"
              :count="item.count"
              :item-id="item.itemId"
            />
          </div>
          <div class="flex justify-center">
            <UPagination
              v-model:page="page"
              :items-per-page="itemsPerPage"
              show-edges
              :total="totalItems"
            />
          </div>
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <UCard v-for="charId in paginatedCharIds" :key="charId" class="flex flex-col">
              <template #header>
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10">
                    <OperatorAvatar :char-id="charId" />
                  </div>
                  <span class="text-lg font-medium">{{ getCharName(charId) }}</span>
                </div>
              </template>

              <div v-if="getOperatorCost(charId) !== undefined" class="flex flex-wrap gap-2">
                <ItemWithCount
                  v-for="item in getOperatorCost(charId)"
                  :key="`${charId}-${item.itemId}`"
                  class="h-14 w-14"
                  :count="item.count"
                  :item-id="item.itemId"
                />
              </div>
              <div v-else class="flex flex-wrap gap-2">
                <USkeleton v-for="i in 10" :key="i" class="h-14 w-14 rounded-full" />
              </div>
            </UCard>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
