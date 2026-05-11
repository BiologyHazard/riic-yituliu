<script setup lang="ts">
import OperatorAvatar from '@/components/riic/OperatorAvatar.vue';
import {
  charEliteAndLevelUpItemCost,
  charSkillSpecializationItemCost,
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

// 计算所有干员的各项成本
const allCosts = computed(() => {
  const result: CostInfo[] = [];
  for (const charId in patchedCharacterTable.value) {
    if (!isCharInGame(charId)) continue;
    const char = patchedCharacterTable.value[charId]!;

    // 精2成本 (从初始 0阶1级 升到 2阶1级)
    const elite2Cost = calculateMaterialValue(charEliteAndLevelUpItemCost(charId, 0, 1, 2, 1));

    // 技能专三成本 (分别针对 1, 2, 3 技能从 专精0 升到 专精3)
    const skill1Cost = calculateMaterialValue(charSkillSpecializationItemCost(charId, 0, 0, 3));
    const skill2Cost = calculateMaterialValue(charSkillSpecializationItemCost(charId, 1, 0, 3));
    const skill3Cost = calculateMaterialValue(charSkillSpecializationItemCost(charId, 2, 0, 3));

    result.push({
      charId,
      name: char.name,
      rarity: getCharRarity(charId) ?? 0,
      elite2Cost,
      skill1Cost,
      skill2Cost,
      skill3Cost,
    });
  }
  return result;
});

// 辅助函数：获取特定养成维度的排名
function getRank(list: CostInfo[], charId: string, rarity: number, field: keyof CostInfo): string {
  // 如果是精2消耗，则保留原来的逻辑：只在同星级的精2消耗中排名
  if (field === 'elite2Cost') {
    const sameRarity = list.filter(
      (item: CostInfo) => item.rarity === rarity && item.elite2Cost > 0,
    );
    const target = list.find((item: CostInfo) => item.charId === charId);
    if (!target || target.elite2Cost <= 0) return '-';

    const sorted = [...sameRarity].sort((a, b) => b.elite2Cost - a.elite2Cost);
    const rank = sorted.findIndex((item) => item.charId === charId) + 1;
    return rank > 0 ? `${rank}/${sameRarity.length}` : '-';
  }

  // 如果是技能专三，则逻辑改为：在同星级的所有技能专三消耗中进行大排行
  // 收集同星级所有干员的所有非零技能消耗
  const allSkillCostsInRarity: number[] = [];
  list
    .filter((item: CostInfo) => item.rarity === rarity)
    .forEach((item: CostInfo) => {
      if (item.skill1Cost > 0) allSkillCostsInRarity.push(item.skill1Cost);
      if (item.skill2Cost > 0) allSkillCostsInRarity.push(item.skill2Cost);
      if (item.skill3Cost > 0) allSkillCostsInRarity.push(item.skill3Cost);
    });

  if (!allSkillCostsInRarity.length) return '-';

  const target = list.find((item: CostInfo) => item.charId === charId);
  if (!target || (target[field] as number) <= 0) return '-';

  const currentValue = target[field] as number;
  // 降序排序
  const sortedCosts = [...allSkillCostsInRarity].sort((a, b) => b - a);
  // 查找当前分数的排名（处理并列情况：找到第一个出现该分数的位置）
  const rank = sortedCosts.indexOf(currentValue) + 1;

  return rank > 0 ? `${rank}/${allSkillCostsInRarity.length}` : '-';
}

const rankedCosts = computed<RankedCostInfo[]>(() => {
  const data = allCosts.value;

  return data.map((item: CostInfo) => ({
    ...item,
    elite2Rank: getRank(data, item.charId, item.rarity, 'elite2Cost'),
    skill1Rank: getRank(data, item.charId, item.rarity, 'skill1Cost'),
    skill2Rank: getRank(data, item.charId, item.rarity, 'skill2Cost'),
    skill3Rank: getRank(data, item.charId, item.rarity, 'skill3Cost'),
  }));
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
        option-attribute="label"
        :options="rarities"
        placeholder="筛选星级"
        value-attribute="value"
      />
    </div>

    <UCard :ui="{ body: 'p-0' }">
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
                    <OperatorAvatar :char-id="item.charId" size="sm" />
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
