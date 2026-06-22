<script setup lang="ts">
import OperatorAvatar from '@/components/riic/OperatorAvatar.vue';
import {
  charEliteAndLevelUpItemCost,
  charSkillSpecializationItemCost,
  getCharName,
  getCharRarity,
  isCharInGame,
  patchedCharacterTable,
} from '@/utils/character';
import { calculateMaterialValue } from '@/utils/itemValue';
import { computed, ref } from 'vue';

interface CostInfo {
  charId: string;
  name: string;
  rarity: number;
  elite2Cost: number;
  skill1Cost: number;
  skill2Cost: number;
  skill3Cost: number;
}

interface RankedCostInfo extends CostInfo {
  elite2Rank: string;
  skill1Rank: string;
  skill2Rank: string;
  skill3Rank: string;
}

const searchQuery = ref('');
const selectedRarity = ref<number | null>(null);

const allCharsIdsInGame = computed(() => {
  return Object.keys(patchedCharacterTable.value).filter(isCharInGame);
});

// 计算所有干员的各项成本
const allCosts = computed(() =>
  allCharsIdsInGame.value.map((charId) => {
    const elite2Cost = calculateMaterialValue(charEliteAndLevelUpItemCost(charId, 0, 1, 2, 1));
    const skill1Cost = calculateMaterialValue(charSkillSpecializationItemCost(charId, 0));
    const skill2Cost = calculateMaterialValue(charSkillSpecializationItemCost(charId, 1));
    const skill3Cost = calculateMaterialValue(charSkillSpecializationItemCost(charId, 2));

    return {
      charId,
      name: getCharName(charId) ?? charId,
      rarity: getCharRarity(charId) ?? 0,
      elite2Cost,
      skill1Cost,
      skill2Cost,
      skill3Cost,
    };
  }),
);

const rankedCosts = computed<RankedCostInfo[]>(() => {
  // 按星级分组预计算排名映射
  // Map<rarity, Map<costValue, rank>>
  const elite2RankMap = new Map<number, Map<number, string>>();
  const skillRankMap = new Map<number, Map<number, string>>();

  // 1. 按星级分组收集数据
  const costsByRarity: Map<number, CostInfo[]> = new Map();
  allCosts.value.forEach((item) => {
    if (!costsByRarity.has(item.rarity)) {
      costsByRarity.set(item.rarity, []);
    }
    costsByRarity.get(item.rarity)!.push(item);
  });

  // 2. 为每个星级预计算排名
  costsByRarity.forEach((list, rarity) => {
    // 精2排名预计算
    const validElite2Costs = list
      .map((item) => item.elite2Cost)
      .filter((cost) => cost > 0)
      .sort((a, b) => b - a);

    const eliteMap = new Map<number, string>();
    validElite2Costs.forEach((cost, index) => {
      if (!eliteMap.has(cost)) {
        // 处理并列：第一个出现的位置 + 1
        eliteMap.set(cost, `${index + 1}/${validElite2Costs.length}`);
      }
    });
    elite2RankMap.set(rarity, eliteMap);

    // 技能排名预计算 (大排行：同星级所有干员的所有非零技能消耗)
    const allSkillCosts: number[] = [];
    list.forEach((item) => {
      if (item.skill1Cost > 0) allSkillCosts.push(item.skill1Cost);
      if (item.skill2Cost > 0) allSkillCosts.push(item.skill2Cost);
      if (item.skill3Cost > 0) allSkillCosts.push(item.skill3Cost);
    });
    allSkillCosts.sort((a, b) => b - a);

    const skillMap = new Map<number, string>();
    allSkillCosts.forEach((cost, index) => {
      if (!skillMap.has(cost)) {
        skillMap.set(cost, `${index + 1}/${allSkillCosts.length}`);
      }
    });
    skillRankMap.set(rarity, skillMap);
  });

  // 3. 填充排名数据
  return allCosts.value.map((item: CostInfo) => {
    const eliteMap = elite2RankMap.get(item.rarity);
    const skillMap = skillRankMap.get(item.rarity);

    return {
      ...item,
      elite2Rank: (item.elite2Cost > 0 && eliteMap?.get(item.elite2Cost)) || '-',
      skill1Rank: (item.skill1Cost > 0 && skillMap?.get(item.skill1Cost)) || '-',
      skill2Rank: (item.skill2Cost > 0 && skillMap?.get(item.skill2Cost)) || '-',
      skill3Rank: (item.skill3Cost > 0 && skillMap?.get(item.skill3Cost)) || '-',
    };
  });
});

const filteredRankedCosts = computed<RankedCostInfo[]>(() => {
  return rankedCosts.value
    .filter((item) => {
      const matchSearch =
        !searchQuery.value || item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
      const matchRarity = selectedRarity.value === null || item.rarity === selectedRarity.value;
      return matchSearch && matchRarity;
    })
    .sort((a, b) => b.rarity - a.rarity || b.elite2Cost - a.elite2Cost);
});

const rarities = [
  { label: '全部星级', value: null },
  { label: '6星', value: 5 },
  { label: '5星', value: 4 },
  { label: '4星', value: 3 },
  { label: '3星', value: 2 },
  { label: '2星', value: 1 },
  { label: '1星', value: 0 },
];
</script>

<template>
  <div class="char-cost-ranking-view mx-auto max-w-7xl p-4">
    <h1 class="mbe-6 text-2xl font-bold">干员养成成本排行</h1>

    <div class="mbe-6 flex flex-wrap gap-4">
      <div class="min-w-64 flex-1">
        <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="搜索干员名称..." />
      </div>
      <USelectMenu
        v-model="selectedRarity"
        class="w-40"
        :items="rarities"
        label-key="label"
        placeholder="筛选星级"
        value-key="value"
      />
    </div>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <div class="overflow-x-auto">
        <table class="w-full text-start text-sm whitespace-nowrap">
          <thead>
            <tr class="border-be border-muted bg-muted">
              <th class="px-4 py-3">干员</th>
              <th class="px-4 py-3 text-center">精2消耗 (排名)</th>
              <th class="px-4 py-3 text-center">一技能专三 (排名)</th>
              <th class="px-4 py-3 text-center">二技能专三 (排名)</th>
              <th class="px-4 py-3 text-center">三技能专三 (排名)</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredRankedCosts"
              :key="item.charId"
              class="border-be border-muted hover:bg-muted"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="h-12 w-12">
                    <OperatorAvatar :char-id="item.charId" />
                  </div>
                  <div>
                    <div class="font-bold">{{ item.name }}</div>
                    <div class="text-xs text-muted">{{ item.rarity + 1 }}★</div>
                  </div>
                </div>
              </td>

              <!-- 精2 -->
              <td class="px-4 py-3 text-center">
                <div v-if="item.elite2Cost > 0">
                  <div class="text-primary">{{ item.elite2Cost.toFixed(1) }}</div>
                  <div class="text-xs text-muted">{{ item.elite2Rank }}</div>
                </div>
                <div v-else class="text-muted opacity-50">-</div>
              </td>

              <!-- 技能 1 -->
              <td class="px-4 py-3 text-center">
                <div v-if="item.skill1Cost > 0">
                  <div class="text-primary">{{ item.skill1Cost.toFixed(1) }}</div>
                  <div class="text-xs text-muted">{{ item.skill1Rank }}</div>
                </div>
                <div v-else class="text-muted opacity-50">-</div>
              </td>

              <!-- 技能 2 -->
              <td class="px-4 py-3 text-center">
                <div v-if="item.skill2Cost > 0">
                  <div class="text-primary">{{ item.skill2Cost.toFixed(1) }}</div>
                  <div class="text-xs text-muted">{{ item.skill2Rank }}</div>
                </div>
                <div v-else class="text-muted opacity-50">-</div>
              </td>

              <!-- 技能 3 -->
              <td class="px-4 py-3 text-center">
                <div v-if="item.skill3Cost > 0">
                  <div class="text-primary">{{ item.skill3Cost.toFixed(1) }}</div>
                  <div class="text-xs text-muted">{{ item.skill3Rank }}</div>
                </div>
                <div v-else class="text-muted opacity-50">-</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
