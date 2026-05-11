<script setup lang="ts">
import ItemWithCount from '@/components/riic/ItemWithCount.vue';
import OperatorAvatar from '@/components/riic/OperatorAvatar.vue';
import { charEliteAndLevelUpItemCost, isCharInGame } from '@/utils/character';
import { characterTable } from '@/utils/gameData';
import { combine, sortBySortId } from '@/utils/itemInfo';
</script>

<template>
  <UContainer>
    <UPage>
      <UPageBody>
        <div class="space-y-4">
          <h1 class="text-2xl font-bold">干员精英化材料消耗</h1>
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <UCard
              v-for="[charId, char] in Object.entries(characterTable)
                .filter(([charId, _char]) => isCharInGame(charId))
                .slice(0, 30)"
              :key="charId"
              class="flex flex-col"
            >
              <template #header>
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10">
                    <OperatorAvatar :char-id="charId" />
                  </div>
                  <span class="text-lg font-medium">{{ char.name }}</span>
                </div>
              </template>

              <div class="flex flex-wrap gap-2">
                <ItemWithCount
                  v-for="(item, index) in sortBySortId(
                    combine(charEliteAndLevelUpItemCost(charId)),
                  )"
                  :key="`${charId}-${item.itemId}-${index}`"
                  :count="item.count"
                  :item-id="item.itemId"
                />
              </div>
            </UCard>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
