<script setup lang="ts">
import data from '@/assets/images/riic/blueprint/hud.json';
import type { BuildingLayout } from '@/types/gameData';
import type { BlueprintBox, BlueprintColor, BlueprintNode } from '@/utils/riic/blueprintRenderer';
import { blueprintBox } from '@/utils/riic/blueprintRenderer';
import { gameUiSprites } from '@/utils/riic/gameUiData';
import type { BlueprintRoomState } from '@/utils/riic/roomState';
import { getRoomCapacity, getRoomName } from '@/utils/riic/roomState';
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
const scrollOffset = ref<number>(0);
const menuOpen = ref<boolean>(false);
const prefabs = data.prefabs as unknown as Record<string, BlueprintNode>;
const roomTypes: Record<string, number> = {
  CONTROL: 1,
  POWER: 2,
  MANUFACTURE: 4,
  DORMITORY: 16,
  WORKSHOP: 1024,
  HIRE: 64,
  MEETING: 32,
  TRADING: 512,
  TRAINING: 2048,
  PRIVATE: 4096,
  RECYCLE: 8192,
};
const listedRooms = computed<[string, BlueprintRoomState][]>(() =>
  Object.entries(props.rooms)
    .filter(
      ([, room]) =>
        Boolean(roomTypes[room.roomId]) &&
        (room.roomId === 'DORMITORY' || room.roomId === 'PRIVATE') === rest.value,
    )
    .sort(([left], [right]) => {
      const a = props.layout.slots[left]!;
      const b = props.layout.slots[right]!;
      return b.offset.row - a.offset.row || a.offset.col - b.offset.col;
    }),
);
watch(rest, () => {
  scrollOffset.value = 0;
});

function findNode(root: BlueprintNode, name: string): BlueprintNode | undefined {
  if (root.name === name) return root;
  for (const child of root.children) {
    const result = findNode(child, name);
    if (result) return result;
  }
}

function positionNode(node: BlueprintNode, y: number) {
  node.rect.AnchorMin = { x: 0, y: 1 };
  node.rect.AnchorMax = { x: 0, y: 1 };
  node.rect.Pivot = { x: 0, y: 1 };
  node.rect.AnchoredPosition = { x: 0, y: -y };
}

function prepareRoom(id: string, room: BlueprintRoomState): BlueprintNode {
  const node = structuredClone(prefabs.overviewRoom!);
  const styles = node.scripts.BuildingSMRoomItemView!._roomStyles as {
    roomId: number;
    color: BlueprintColor;
    sprite: string;
  }[];
  const style = styles.find((entry) => entry.roomId === roomTypes[room.roomId]);
  const name = findNode(node, 'text_name');
  if (name?.text) name.text.value = getRoomName(room);
  const index = findNode(node, 'text_index');
  if (index?.text) index.text.value = props.layout.slots[id]?.storeyId ?? '';
  const background = findNode(node, 'img_bkg');
  if (background?.image && style) background.image.sprite = style.sprite;
  function visit(child: BlueprintNode) {
    if (child.name === 'panel_inactive') child.active = room.construction !== 'built';
    if (child.name === 'panel_upgrading') child.active = false;
    if (child.name === 'panel_active') child.active = room.construction === 'built';
    if (
      child.name === 'panel_select_frame' ||
      child.name === 'btn_edit_queue' ||
      child.name === 'active' ||
      child.name === 'stop_work_holder'
    )
      child.active = false;
    if (child.name === 'panel_hotspot') child.name = `room-${id}`;
    child.children.forEach(visit);
  }
  visit(node);
  return node;
}

const content = computed<{ roots: BlueprintNode[]; maxScroll: number }>(() => {
  const page = structuredClone(prefabs.overview!);
  page.rect = {
    ...page.rect,
    AnchorMin: { x: 0, y: 0 },
    AnchorMax: { x: 1, y: 1 },
    Pivot: { x: 0.5, y: 0.5 },
    LocalScale: { x: 1, y: 1 },
  };
  const home = findNode(page, 'home_state')!;
  const work = findNode(home, 'work_panel')!;
  const dorm = findNode(home, 'dorm_panel')!;
  work.active = !rest.value;
  dorm.active = rest.value;
  const panel = rest.value ? dorm : work;
  const topHolder = findNode(home, 'panel_topmenu_holder')!;
  topHolder.children = [structuredClone(prefabs.topMenu!)];
  const group = findNode(panel, 'panel_storey_container')!;
  delete group.scripts.ContentSizeFitter;
  const groups = new Map<string, [string, BlueprintRoomState][]>();
  for (const entry of listedRooms.value) {
    const key = props.layout.slots[entry[0]]?.storeyId ?? '';
    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }
  let y = 0;
  group.children = [];
  for (const [storey, rooms] of groups) {
    const title = structuredClone(prefabs.overviewTitle!);
    const titleText = findNode(title, 'text');
    if (titleText?.text) titleText.text.value = storey;
    positionNode(title, y);
    group.children.push(title);
    y += title.rect.SizeDelta.y;
    for (const [id, room] of rooms) {
      const item = prepareRoom(id, room);
      positionNode(item, y);
      group.children.push(item);
      y += item.rect.SizeDelta.y;
    }
  }
  group.rect.SizeDelta.y = y;
  group.rect.AnchoredPosition.y = scrollOffset.value;
  const staff = listedRooms.value.reduce((sum, [, room]) => sum + room.staff, 0);
  const capacity = listedRooms.value.reduce((sum, [, room]) => sum + getRoomCapacity(room), 0);
  function prepare(node: BlueprintNode) {
    if (
      [
        'panel_room_info',
        'panel_track_point',
        'panel_backonly',
        'select_confirm_state_holder',
        'lock_panel',
        'img_lock_bkg',
        'stoped_part',
      ].includes(node.name)
    )
      node.active = false;
    if (node.name === 'panel_content') node.active = menuOpen.value;
    if (
      node.name === 'bg_select_work' ||
      node.name === 'icon_select_work' ||
      node.name === 'icon_normal_rest'
    )
      node.active = !rest.value;
    if (
      node.name === 'bg_select_rest' ||
      node.name === 'icon_select_rest' ||
      node.name === 'icon_normal_work'
    )
      node.active = rest.value;
    if (node.name === 'text_station_num' && node.text)
      node.text.value = `${staff.toString().padStart(3, '0')}/${capacity.toString().padStart(3, '0')}`;
    if (node.name === 'text_room_cnt' && node.text)
      node.text.value = String(listedRooms.value.length);
    node.children.forEach(prepare);
  }
  prepare(page);
  let viewportHeight = props.height;
  function measure(node: BlueprintNode, parent: BlueprintBox) {
    const box = blueprintBox(node, parent);
    if (node.name === 'panel_storeys') viewportHeight = box.height;
    if (node.active) node.children.forEach((child) => measure(child, box));
  }
  measure(page, { x: 0, y: 0, width: props.width, height: props.height, scaleX: 1, scaleY: 1 });
  return { roots: [page], maxScroll: Math.max(0, y - viewportHeight) };
});
const actions = computed<Record<string, { action: string; label: string }>>(() => ({
  btn_topmenu_back: { action: 'back', label: '返回基建' },
  btn_topmenu_home: { action: 'menu', label: '菜单' },
  group_work: { action: 'work', label: '工作设施' },
  group_rest: { action: 'rest', label: '休息设施' },
  panel_blank: { action: 'close-menu', label: '关闭菜单' },
  btn_building: { action: 'back', label: '基建' },
  ...Object.fromEntries(
    listedRooms.value.map(([id, room]) => [
      `room-${id}`,
      {
        action: `edit-${id}`,
        label: `${getRoomName(room)} ${props.layout.slots[id]?.storeyId ?? ''}`,
      },
    ]),
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
function onWheel(event: WheelEvent) {
  scrollOffset.value = Math.max(
    0,
    Math.min(content.value.maxScroll, scrollOffset.value + event.deltaY),
  );
}
</script>

<template>
  <div class="station-overview" @pointerdown.stop @wheel.stop.prevent="onWheel">
    <GameUiCanvas
      :actions="actions"
      :height="height"
      :roots="content.roots"
      :sprites="gameUiSprites"
      :width="width"
      @action="onAction"
    />
  </div>
</template>

<style scoped>
.station-overview {
  position: absolute;
  inset: 0;
  z-index: 4;
  cursor: default;
}
</style>
