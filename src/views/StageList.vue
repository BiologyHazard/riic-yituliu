<script setup lang="ts">
// import { activityTable, stageTable, zoneTable } from '@/utils/gameData';
</script>
<script lang="ts">
const stageTable = await fetch(
  'https://torappu.prts.wiki/gamedata/latest/excel/stage_table.json',
).then((res) => res.json());

const activityTable = await fetch(
  'https://torappu.prts.wiki/gamedata/latest/excel/activity_table.json',
).then((res) => res.json());

const zoneTable = await fetch(
  'https://torappu.prts.wiki/gamedata/latest/excel/zone_table.json',
).then((res) => res.json());
</script>

<template>
  <UContainer>
    <UPage>
      <UPageBody>
        <div class="stage-list-view">
          <h1>作战列表</h1>

          <UAccordion
            multiple
            :items="[
              { label: '按活动分类', slot: 'by-activity' },
              { label: '按区域分类', slot: 'by-zone' },
            ]"
          >
            <template #by-activity>
              <ul>
                <li
                  v-for="[activityId, activity] in Object.entries(activityTable.basicInfo)"
                  :key="activityId"
                  class="activity-item"
                >
                  {{ activity.name }}（{{ activityId }}）
                  <ul>
                    <li
                      v-for="[zoneId, zoneInfo] in Object.entries(activityTable.zoneToActivity)
                        .filter(([zoneId, activityIdInMap]) => activityIdInMap === activityId)
                        .map(([zoneId, activityId]) => [zoneId, zoneTable.zones[zoneId]])"
                      :key="zoneId"
                      class="zone-item"
                    >
                      {{ zoneInfo.zoneNameFirst }} {{ zoneInfo.zoneNameSecond }}（{{ zoneId }}）
                      <ul>
                        <li
                          v-for="[stageId, stageInfo] in Object.entries(stageTable.stages).filter(
                            ([stageId, stageInfo]) => stageInfo.zoneId === zoneId,
                          )"
                          :key="stageId"
                          class="stage-item"
                        >
                          {{ stageInfo.code }} {{ stageInfo.name
                          }}{{ stageInfo.difficulty === 'FOUR_STAR' ? '（突袭）' : '' }}（{{
                            stageId
                          }}）
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </template>

            <template #by-zone>
              <ul>
                <li
                  v-for="[zoneId, zoneInfo] in Object.entries(zoneTable.zones)"
                  :key="zoneId"
                  class="zone-item"
                >
                  {{ zoneInfo.zoneNameFirst }} {{ zoneInfo.zoneNameSecond }}（{{ zoneId }}）
                  <ul>
                    <li
                      v-for="[stageId, stageInfo] in Object.entries(stageTable.stages).filter(
                        ([stageId, stageInfo]) => stageInfo.zoneId === zoneId,
                      )"
                      :key="stageId"
                      class="stage-item"
                    >
                      {{ stageInfo.code }} {{ stageInfo.name
                      }}{{ stageInfo.difficulty === 'FOUR_STAR' ? '（突袭）' : '' }}（{{
                        stageId
                      }}）
                    </li>
                  </ul>
                </li>
              </ul>
            </template>
          </UAccordion>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<style scoped lang="scss">
h1 {
  text-align: center;
  margin-bottom: 1em;
}

.activity-item {
  font-size: 1.2rem;
  font-weight: 700;
  margin-block: 0.5em;
}

.zone-item {
  font-size: 1rem;
  font-weight: 500;
}

.stage-item {
  font-size: 0.8rem;
  font-weight: 400;
}
</style>
