import hud from '@/assets/images/riic/blueprint/hud.json';
import rules from '@/assets/images/riic/blueprint/room-rules.json';
import type { BuildingLayout } from '@/types/gameData';
import type { BlueprintBox, BlueprintColor, BlueprintNode } from './blueprintRenderer';
import { blueprintBox } from './blueprintRenderer';
import { findGameUi, prepareTopMenu, screenRoot, visitGameUi } from './gameUiTree';
import type { BlueprintRoomState } from './roomState';
import { getRoomCapacity, getRoomName } from './roomState';

const prefabs = hud.prefabs as unknown as Record<string, BlueprintNode>;
const operatorData = hud.operators as Record<string, { name: string; sprite: string }>;
const roomTypes: Record<string, number> = {
  CONTROL: 1,
  POWER: 2,
  MANUFACTURE: 4,
  DORMITORY: 16,
  MEETING: 32,
  HIRE: 64,
  TRADING: 512,
  WORKSHOP: 1024,
  TRAINING: 2048,
  RECYCLE: 8192,
};
interface RoomStyle {
  roomId: number;
  color: BlueprintColor;
  sprite: string;
}
export interface OverviewRoom {
  id: string;
  state: BlueprintRoomState;
  index: number;
}
export interface OverviewGroup {
  type: string;
  name: string;
  rooms: OverviewRoom[];
  queue: boolean;
}
export interface OverviewOptions {
  width: number;
  height: number;
  rest: boolean;
  menuOpen: boolean;
  scroll: number;
  groups: OverviewGroup[];
}

/** 分类、顺序和队列能力来自 `building_data`，不把楼层当作设施类别。 */
export function overviewGroups(
  rooms: Record<string, BlueprintRoomState>,
  layout: BuildingLayout,
  rest: boolean,
): OverviewGroup[] {
  const types = rest
    ? Object.values(rules.dormitoryPrequeDatas)
    : Object.values(rules.slotPrequeDatas).sort((a, b) => a.typeSortId - b.typeSortId);
  return types
    .map((type) => ({
      type: type.roomType,
      name: type.name,
      queue: 'isPreque' in type && type.isPreque === true,
      rooms: Object.entries(rooms)
        .filter(([, room]) => room.roomId === type.roomType && room.construction === 'built')
        .sort(
          ([a], [b]) =>
            layout.slots[b]!.offset.row - layout.slots[a]!.offset.row ||
            layout.slots[a]!.offset.col - layout.slots[b]!.offset.col,
        )
        .map(([id, state], index) => ({ id, state, index: index + 1 })),
    }))
    .filter((group) => group.rooms.length > 0);
}

function clonePrefab(name: string): BlueprintNode {
  return structuredClone(prefabs[name]!);
}
function setText(root: BlueprintNode, name: string, value: string) {
  findGameUi(root, name).text!.value = value;
}

function positionItem(node: BlueprintNode, y: number, height: number) {
  Object.assign(node.rect, {
    AnchorMin: { x: 0, y: 1 },
    AnchorMax: { x: 0, y: 1 },
    Pivot: { x: 0, y: 1 },
    AnchoredPosition: { x: 0, y: -y },
    SizeDelta: { x: node.rect.SizeDelta.x, y: height },
  });
}

function prepareRoom(room: OverviewRoom, group: OverviewGroup): BlueprintNode {
  const node = clonePrefab('overviewRoom');
  const styles = node.scripts.BuildingSMRoomItemView!._roomStyles as RoomStyle[];
  const style = styles.find((entry) => entry.roomId === roomTypes[group.type])!;
  setText(node, 'text_name', getRoomName(room.state));
  const indexed = rules.rooms[group.type as keyof typeof rules.rooms].maxCount > 1;
  findGameUi(node, 'text_index_holder').active = indexed;
  setText(node, 'text_index', indexed ? String(room.index) : '');
  // 编号容器保留 Prefab 的零宽度；数字使用子节点原始偏移，不额外占据布局宽度。
  findGameUi(node, 'img_bkg').image!.sprite = style.sprite;
  findGameUi(node, 'panel_inactive').active = false;
  findGameUi(node, 'panel_upgrading').active = false;
  findGameUi(node, 'panel_select_frame').active = false;
  findGameUi(node, 'stop_work_holder').active = room.state.tired;
  findGameUi(node, 'set_queue_btn').active = group.queue;
  findGameUi(node, 'btn_edit_queue').active = false;
  findGameUi(node, 'btn_use_queue').active = group.queue;
  findGameUi(node, 'active').active = false;
  findGameUi(node, 'panel_hotspot').name = `room-${room.id}`;
  const levels = findGameUi(node, 'pane_level_common');
  levels.children = Array.from({ length: room.state.level }, () => {
    const level = clonePrefab('overviewLevel');
    level.image!.color = style.color;
    return level;
  });
  // 卡片位置由原生网格决定；没有身份数据时保留空槽，不伪造干员。
  const chars = findGameUi(findGameUi(node, 'panel_chars'), 'root');
  chars.children = Array.from({ length: 5 }, (_, index) => {
    const card = clonePrefab('overviewChar');
    const operator = operatorData[room.state.operators[index] ?? ''];
    visitGameUi(card, (child) => {
      if (
        ['panel_active', 'panel_locked', 'panel_add', 'panel_dorm_lock', 'icon_in_preque'].includes(
          child.name,
        )
      )
        child.active = false;
      if (child.name === 'panel_add') child.active = index < getRoomCapacity(room.state);
      if (child.name === 'panel_empty') child.active = index >= getRoomCapacity(room.state);
      if (child.name === 'panel_hotspot') child.name = `staff-${room.id}-${index}`;
    });
    if (operator) {
      findGameUi(card, 'panel_active').active = true;
      findGameUi(card, 'panel_add').active = false;
      findGameUi(card, 'panel_empty').active = false;
      findGameUi(card, 'img_avatar').image!.sprite = operator.sprite;
      visitGameUi(card, (child) => {
        if (
          [
            'bg_lock',
            'img_hilight_mask',
            'img_dark_mask',
            'panel_dorm_lock_active',
            'icon_remove',
            'icon_work',
            'icon_rest',
            'icon_training',
            'panel_progress',
          ].includes(child.name)
        )
          child.active = false;
        if (['img_tired_mask', 'icon_tired'].includes(child.name)) child.active = room.state.tired;
      });
      const avatar = findGameUi(card, 'panel_char_avatar');
      const states = avatar.scripts.BuildingCharAvatar!._apStateConfigs as {
        state: number;
        sprite: string;
      }[];
      findGameUi(card, 'icon_ap_status').image!.sprite = states.find(
        (state) => state.state === (room.state.tired ? 3 : 1),
      )!.sprite;
    }
    return card;
  });
  return node;
}

function richNumber(value: number, color: BlueprintColor, disabled: BlueprintColor): string {
  const digits = String(value);
  function cssColor(c: BlueprintColor): string {
    return (
      '#' +
      [c.r, c.g, c.b, c.a]
        .map((v) =>
          Math.round(v * 255)
            .toString(16)
            .padStart(2, '0'),
        )
        .join('')
    );
  }
  return `<color=${cssColor(disabled)}>${'0'.repeat(Math.max(0, 3 - digits.length))}</color><color=${cssColor(color)}>${digits}</color>`;
}

export function buildStationOverview(options: OverviewOptions): {
  root: BlueprintNode;
  maxScroll: number;
  listBox: BlueprintBox;
  scrollbarBox: BlueprintBox;
} {
  const { width, height, rest, menuOpen, groups } = options;
  const page = clonePrefab('overview');
  screenRoot(page);
  const home = findGameUi(page, 'home_state');
  findGameUi(home, 'work_panel').active = !rest;
  findGameUi(home, 'dorm_panel').active = rest;
  const panel = findGameUi(home, rest ? 'dorm_panel' : 'work_panel');
  findGameUi(home, 'panel_topmenu_holder').children = [clonePrefab('topMenu')];
  visitGameUi(page, (node) => {
    if (
      [
        'panel_room_info',
        'panel_track_point',
        'select_confirm_state_holder',
        'lock_panel',
        'img_lock_bkg',
        'stoped_part',
      ].includes(node.name)
    )
      node.active = false;
    if (['bg_select_work', 'icon_select_work', 'icon_normal_rest'].includes(node.name)) {
      node.active = !rest;
      if (node.image) node.image.color.a = 1;
    }
    if (['bg_select_rest', 'icon_select_rest', 'icon_normal_work'].includes(node.name)) {
      node.active = rest;
      if (node.image) node.image.color.a = 1;
    }
  });
  const batch = findGameUi(panel, 'btn_batch');
  findGameUi(batch, 'active').active = true;
  findGameUi(batch, 'inactive').active = false;
  const rooms = groups.flatMap((group) => group.rooms);
  const staff = rooms.reduce((sum, room) => sum + room.state.staff, 0);
  const capacity = rooms.reduce((sum, room) => sum + getRoomCapacity(room.state), 0);
  const number = findGameUi(panel, 'text_station_num');
  const colors = number.scripts.BuildingSMStationNumView as unknown as {
    _disableColor: BlueprintColor;
    _hilightColor: BlueprintColor;
    _normalColor: BlueprintColor;
  };
  number.text!.value = `${richNumber(staff, colors._hilightColor, colors._disableColor)}/${richNumber(capacity, colors._normalColor, colors._disableColor)}`;
  setText(
    panel,
    'text_room_cnt',
    hud.strings[rest ? 'BUILDING_DORM_ROOM_CNT' : 'BUILDING_WORK_ROOM_CNT'].replace(
      '{0}',
      String(rooms.length),
    ),
  );
  if (rest) {
    // 本地状态没有未进驻的干员名册，批量休整候选人数为零。
    setText(panel, 'not_full_text', '0');
    setText(panel, 'tired_text', '0');
  }
  const list = findGameUi(panel, 'panel_storeys');
  const titleColors = list.scripts.BuildingSMRoomGroupListView!._roomColors as RoomStyle[];
  const container = findGameUi(list, 'panel_storey_container');
  delete container.scripts.ContentSizeFitter;
  container.children = [];
  let y = 0;
  for (const group of groups) {
    const title = clonePrefab('overviewTitle');
    setText(title, 'text', group.name);
    const color = titleColors.find((entry) => entry.roomId === roomTypes[group.type])?.color;
    if (color) findGameUi(title, 'icon').image!.color = color;
    const titleHeight = Number(title.scripts.BuildingSMRoomGroupTitleView!._preferHeight);
    positionItem(title, y, titleHeight);
    container.children.push(title);
    y += titleHeight;
    for (const room of group.rooms) {
      const item = prepareRoom(room, group);
      const itemHeight = Number(item.scripts.BuildingSMRoomItemView!._preferHeight);
      positionItem(item, y, itemHeight);
      container.children.push(item);
      y += itemHeight;
    }
  }
  const padding = container.scripts.UIRecycleVerticalLayoutGroup!._padding as { bottom: number };
  const contentHeight = y + padding.bottom;
  container.rect.SizeDelta.y = contentHeight;
  let listBox: BlueprintBox = { x: 0, y: 0, width, height, scaleX: 1, scaleY: 1 };
  let scrollbarBox = listBox;
  function measure(node: BlueprintNode, parent: BlueprintBox) {
    if (!node.active) return;
    const box = blueprintBox(node, parent);
    if (node === list) listBox = box;
    if (node.name === 'panel_scroll_bar') scrollbarBox = box;
    node.children.forEach((child) => measure(child, box));
  }
  measure(page, listBox);
  const maxScroll = Math.max(0, contentHeight - listBox.height);
  const scroll = Math.min(options.scroll, maxScroll);
  container.rect.AnchoredPosition.y = scroll;
  const bar = findGameUi(panel, 'img_slide_bar');
  const ratio = Math.min(1, listBox.height / Math.max(1, contentHeight));
  bar.rect.AnchorMin = { x: 0, y: 1 - ratio - (maxScroll ? scroll / maxScroll : 0) * (1 - ratio) };
  bar.rect.AnchorMax = { x: 1, y: bar.rect.AnchorMin.y + ratio };
  prepareTopMenu(page, width, height, menuOpen);
  return { root: page, maxScroll, listBox, scrollbarBox };
}
