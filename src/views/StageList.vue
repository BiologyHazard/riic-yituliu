<script setup lang="ts">
import { activityTable, stageTable, zoneTable } from '@/utils/gameData';
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="作战列表" />
      <UPageBody>
        <div v-if="Object.keys(activityTable.basicInfo).length > 0" class="stage-list-view">
          <UAccordion
            :items="[
              { label: '按活动分类', slot: 'by-activity' },
              { label: '按区域分类', slot: 'by-zone' },
            ]"
            multiple
          >
            <template #by-activity>
              <div class="space-y-4 p-1">
                <UCard
                  v-for="[activityId, activity] in Object.entries(activityTable.basicInfo)"
                  :key="activityId"
                  variant="subtle"
                >
                  <template #header>
                    <div class="flex items-center gap-2">
                      <UIcon class="text-lg font-bold text-primary" name="i-lucide-calendar" />
                      <div>
                        <span class="text-lg font-bold text-primary">{{ activity.name }}</span>
                        <span class="ms-2 font-mono text-xs text-muted">{{ activityId }}</span>
                      </div>
                    </div>
                  </template>

                  <ul class="space-y-3 border-s-2 border-muted ps-4">
                    <li
                      v-for="[zoneId, zone] in Object.entries(zoneTable.zones).filter(
                        ([zoneId, _zone]) => activityTable.zoneToActivity[zoneId] === activityId,
                      )"
                      :key="zoneId"
                    >
                      <div class="mbe-2 flex items-center gap-2">
                        <UIcon name="i-lucide-map-pin" />
                        <div>
                          <span class="font-semibold"
                            >{{ zone.zoneNameFirst }} {{ zone.zoneNameSecond }}</span
                          >
                          <span class="ms-2 font-mono text-xs text-muted">{{ zoneId }}</span>
                        </div>
                      </div>

                      <div class="ms-6 flex flex-wrap gap-2">
                        <div
                          v-for="[stageId, stage] in Object.entries(stageTable.stages).filter(
                            ([_stageId, stage]) => stage.zoneId === zoneId,
                          )"
                          :key="stageId"
                          class="group relative flex items-center rounded border border-muted bg-default px-2 py-1 text-sm shadow-sm transition-all hover:border-primary hover:text-primary"
                        >
                          <span class="font-mono font-bold">{{ stage.code || '未知' }}</span>
                          <span class="mx-1 h-3/4 border-x border-muted"></span>
                          <span>{{ stage.name || '未知' }}</span>
                          <UBadge
                            v-if="stage.difficulty === 'FOUR_STAR'"
                            class="ms-1 px-1 py-0.5"
                            color="error"
                            label="突袭"
                            size="sm"
                            variant="subtle"
                          />
                        </div>
                      </div>
                    </li>
                  </ul>
                </UCard>
              </div>
            </template>

            <template #by-zone>
              <div class="space-y-4 p-1">
                <UCard
                  v-for="[zoneId, zone] in Object.entries(zoneTable.zones)"
                  :key="zoneId"
                  variant="subtle"
                >
                  <template #header>
                    <div class="flex items-center gap-2">
                      <UIcon class="text-lg font-bold text-primary" name="i-lucide-map" />
                      <div>
                        <span class="text-lg font-bold text-primary"
                          >{{ zone.zoneNameFirst }} {{ zone.zoneNameSecond }}</span
                        >
                        <span class="ms-2 font-mono text-xs text-muted">{{ zoneId }}</span>
                      </div>
                    </div>
                  </template>

                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="[stageId, stage] in Object.entries(stageTable.stages).filter(
                        ([_stageId, stage]) => stage.zoneId === zoneId,
                      )"
                      :key="stageId"
                      class="group relative flex items-center rounded border border-muted bg-default px-2 py-1 text-sm shadow-sm transition-all hover:border-primary hover:text-primary"
                    >
                      <span class="font-mono font-bold">{{ stage.code || '未知' }}</span>
                      <span class="mx-1 h-3/4 border-x border-muted"></span>
                      <span>{{ stage.name || '未知' }}</span>
                      <UBadge
                        v-if="stage.difficulty === 'FOUR_STAR'"
                        class="ms-1 px-1 py-0.5"
                        color="error"
                        label="突袭"
                        size="sm"
                        variant="subtle"
                      />
                    </div>
                  </div>
                </UCard>
              </div>
            </template>
          </UAccordion>
        </div>
        <div v-else class="flex h-64 items-center justify-center">
          <UIcon class="h-8 w-8 animate-spin text-primary" name="i-lucide-loader-2" />
          <span class="ms-2">正在加载作战数据...</span>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
