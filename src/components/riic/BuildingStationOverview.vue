<script setup lang="ts">
import type { BuildingLayout } from '@/types/gameData';
import { gameUiSprites } from '@/utils/riic/gameUiData';
import type { BlueprintRoomState } from '@/utils/riic/roomState';
import { buildStationOverview, overviewGroups } from '@/utils/riic/stationOverview';
import type { OverviewGroup } from '@/utils/riic/stationOverview';
import { computed, ref, watch } from 'vue';
import GameUiCanvas from './GameUiCanvas.vue';

const props = defineProps<{
  width: number;
  height: number;
  rooms: Record<string, BlueprintRoomState>;
  layout: BuildingLayout;
}>();
const emit = defineEmits<{ close: []; edit: [id: string] }>();
const rest = ref<boolean>(false);
const scroll = ref<number>(0);
const menuOpen = ref<boolean>(false);
const groups = computed<OverviewGroup[]>(() =>
  overviewGroups(props.rooms, props.layout, rest.value),
);
const content = computed<ReturnType<typeof buildStationOverview>>(() =>
  buildStationOverview({
    width: props.width,
    height: props.height,
    rest: rest.value,
    menuOpen: menuOpen.value,
    scroll: scroll.value,
    groups: groups.value,
  }),
);
watch(rest, () => {
  scroll.value = 0;
});
watch(
  () => content.value.maxScroll,
  (maximum) => {
    scroll.value = Math.min(scroll.value, maximum);
  },
);
const actions = computed<Record<string, { action: string; label: string }>>(() => ({
  btn_topmenu_back: { action: 'back', label: '返回基建' },
  btn_topmenu_home: { action: 'menu', label: '菜单' },
  group_work: { action: 'work', label: '工作区' },
  group_rest: { action: 'rest', label: '非工作区' },
  panel_blank: { action: 'close-menu', label: '关闭菜单' },
  btn_building: { action: 'back', label: '基建' },
  ...Object.fromEntries(
    groups.value.flatMap((group) =>
      group.rooms.map((room) => [
        `room-${room.id}`,
        { action: `edit-${room.id}`, label: `${group.name}${room.index}` },
      ]),
    ),
  ),
}));

function onAction(action: string) {
  if (action === 'menu') menuOpen.value = !menuOpen.value;
  else if (action === 'close-menu') menuOpen.value = false;
  else if (action === 'back') {
    if (menuOpen.value) menuOpen.value = false;
    else emit('close');
  } else if (action === 'work' || action === 'rest') rest.value = action === 'rest';
  else if (action.startsWith('edit-')) emit('edit', action.slice(5));
}

function moveScroll(value: number) {
  scroll.value = Math.max(0, Math.min(content.value.maxScroll, value));
}

function onWheel(event: WheelEvent) {
  if (menuOpen.value) return;
  const element = event.currentTarget as HTMLElement;
  const scale = props.height / element.clientHeight;
  const delta =
    event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientHeight : 1);
  moveScroll(scroll.value + delta * scale);
}

function onScrollbar(event: PointerEvent) {
  const element = event.currentTarget as HTMLElement;
  element.setPointerCapture(event.pointerId);
  const rect = element.getBoundingClientRect();
  moveScroll(((event.clientY - rect.top) / rect.height) * content.value.maxScroll);
}
</script>

<template>
  <div class="station-overview" @pointerdown.stop @wheel.stop.prevent="onWheel">
    <GameUiCanvas
      :actions="actions"
      :height="height"
      :roots="[content.root]"
      :sprites="gameUiSprites"
      :width="width"
      @action="onAction"
    />
    <div
      v-if="!menuOpen"
      aria-label="进驻房间列表"
      :aria-valuemax="content.maxScroll"
      aria-valuemin="0"
      :aria-valuenow="scroll"
      class="overview-scrollbar"
      role="scrollbar"
      :style="{
        left: `${(content.scrollbarBox.x / width) * 100}%`,
        top: `${(content.scrollbarBox.y / height) * 100}%`,
        width: `${(content.scrollbarBox.width / width) * 100}%`,
        height: `${(content.scrollbarBox.height / height) * 100}%`,
      }"
      tabindex="0"
      @keydown.down.prevent="moveScroll(scroll + 40)"
      @keydown.end.prevent="moveScroll(content.maxScroll)"
      @keydown.home.prevent="moveScroll(0)"
      @keydown.page-down.prevent="moveScroll(scroll + content.listBox.height)"
      @keydown.page-up.prevent="moveScroll(scroll - content.listBox.height)"
      @keydown.up.prevent="moveScroll(scroll - 40)"
      @pointerdown="onScrollbar"
      @pointermove="$event.buttons & 1 && onScrollbar($event)"
    ></div>
  </div>
</template>

<style scoped>
.station-overview {
  position: absolute;
  inset: 0;
  z-index: 4;
  cursor: default;
}

.overview-scrollbar {
  position: absolute;
  touch-action: none;
  cursor: pointer;
}
</style>
