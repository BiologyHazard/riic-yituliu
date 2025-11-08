<script setup lang="ts">
import Station from '@/components/riic/RiicStation.vue';
import { type ScheduleType } from '@/types/riic';

const props = defineProps<ScheduleType>();
</script>

<template>
  <div>
    <div class="schedule-container">
      <div class="schedule-line" v-for="(stationLine, lineIndex) in props.lines" :key="lineIndex">
        <div class="queue-descriptions">
          <div
            class="queue-description"
            v-for="(description, queueIndex) in props.queueDescription"
            :key="queueIndex"
          >
            {{ `队列 ${queueIndex + 1}` }}<br />{{ description }}
          </div>
        </div>
        <div class="stations">
          <Station
            v-for="(station, stationIndex) in stationLine"
            :key="stationIndex"
            v-bind="station"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.schedule-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.schedule-line {
  display: flex;
  flex-direction: row;
  // gap: 80px;
  margin-bottom: 20px;
}

.queue-descriptions {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  margin-right: 2em;
  width: fit-content;
}

.queue-description {
  margin: 20px 0;
  font-family: 'HarmonyOS Sans SC', sans-serif;
  font-size: 50px;
  line-height: 1.3em;
  font-weight: 700;
  color: white;
  text-align: center;
  text-wrap: nowrap;
}

.stations {
  display: flex;
  flex-direction: row;
  gap: 80px;
}
</style>
