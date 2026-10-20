import rulesData from '@/assets/images/riic/blueprint/room-rules.json';
import runtimeRules from '@/assets/images/riic/blueprint/runtime-rules.json';
import type { BuildingLayout, BuildingRoom, BuildingSlot } from '@/types/gameData';

export interface RoomRule extends BuildingRoom {
  canLevelDown: boolean;
  phases: {
    maxStationedNum: number;
    overrideName: string | null;
    overridePrefabId: string | null;
  }[];
}

export interface BlueprintRoomState {
  roomId: string;
  level: number;
  construction: 'built' | 'empty' | 'unclean' | 'complete';
  staff: number;
  tired: boolean;
  status: string;
  progress: number;
  triangles: number;
  highlight: boolean;
  product: boolean;
  canLevelUp: boolean;
  clue: boolean;
  message: boolean;
  trainingLevel: number;
  trainingTargetLevel: number;
  trust: boolean;
  directions: { left: boolean; right: boolean; up: boolean; down: boolean };
  name: string;
  ownerId: string;
  ownerElite: number;
}

export const roomRules: Record<string, RoomRule> = Object.fromEntries(
  Object.entries(rulesData.rooms).map(([id, room]) => [
    id,
    { ...room, description: room.description ?? '' },
  ]),
);
export const blueprintLayout: BuildingLayout = rulesData.layouts.v0;

/** 房间类别、尺寸和特殊通道类型共同决定槽位的候选设施。 */
export function getSlotRooms(slot: BuildingSlot): RoomRule[] {
  return Object.values(roomRules).filter((room) => {
    if (room.size.col !== slot.size.col || room.size.row !== slot.size.row) return false;
    if (slot.category === 'ELEVATOR' || slot.category === 'CORRIDOR')
      return room.id === slot.category;
    return room.category === slot.category;
  });
}

export function getRoomCapacity(state: BlueprintRoomState): number {
  // 活动室使用独立的单人进驻模型，不使用通用房间阶段的 `maxStationedNum`。
  if (state.roomId === 'PRIVATE') return 1;
  return roomRules[state.roomId]?.phases[state.level - 1]?.maxStationedNum ?? 0;
}

export function getRoomName(state: BlueprintRoomState): string {
  const room = roomRules[state.roomId];
  return state.name || room?.phases[state.level - 1]?.overrideName || room?.name || '';
}

export function createRoomState(roomId: string): BlueprintRoomState {
  const room = roomRules[roomId];
  return {
    roomId,
    level: room?.phases.length ?? 1,
    construction: 'built',
    staff: 0,
    tired: false,
    status: 'idle',
    progress: 0,
    triangles: 3,
    highlight: false,
    product: false,
    canLevelUp: false,
    clue: false,
    message: false,
    trainingLevel: 0,
    trainingTargetLevel: 1,
    trust: false,
    directions: { left: false, right: false, up: false, down: false },
    name: '',
    ownerId: '',
    ownerElite: 0,
  };
}

/** 方案只指定用户选定的设施与状态，几何、文字、颜色和容量仍来自游戏资源。 */
const defaultRooms: Record<string, Partial<BlueprintRoomState>> = {
  slot_24: { roomId: 'TRADING', level: 3, staff: 3, status: 'working' },
  slot_25: { roomId: 'TRADING', level: 2, staff: 2, status: 'working' },
  slot_26: { roomId: 'POWER', level: 3, staff: 1, status: 'working', progress: 1, highlight: true },
  slot_14: { roomId: 'MANUFACTURE', level: 3, staff: 3, status: 'working' },
  slot_15: { roomId: 'TRADING', level: 1, staff: 1, status: 'working' },
  slot_16: {
    roomId: 'POWER',
    level: 3,
    staff: 1,
    tired: true,
    status: 'working',
    progress: 1,
    highlight: true,
  },
  slot_5: { roomId: 'MANUFACTURE', level: 3, staff: 3, status: 'working' },
  slot_6: { roomId: 'MANUFACTURE', level: 2, staff: 2, status: 'working' },
  slot_7: { roomId: 'MANUFACTURE', level: 3, staff: 3, status: 'working' },
  slot_28: { roomId: 'DORMITORY', level: 1, staff: 4, status: 'idle' },
  slot_20: { roomId: 'DORMITORY', level: 1, staff: 4, status: 'resting' },
  slot_9: { roomId: 'DORMITORY', level: 1, staff: 3, status: 'resting' },
  slot_3: { roomId: 'DORMITORY', level: 1, staff: 3, status: 'resting' },
  slot_32: { roomId: 'WORKSHOP', staff: 1 },
  slot_23: { roomId: 'HIRE', staff: 1, status: 'finished', progress: 1 },
  slot_13: { roomId: 'TRAINING', staff: 2 },
  slot_53: { roomId: 'RECYCLE', staff: 2, status: 'boosting' },
  slot_36: { roomId: 'MEETING', staff: 2, status: 'clue' },
};

export function createDefaultRooms(layout: BuildingLayout): Record<string, BlueprintRoomState> {
  const result: Record<string, BlueprintRoomState> = {};
  for (const slot of Object.values(layout.slots)) {
    const preset = defaultRooms[slot.id];
    const roomId = preset?.roomId ?? getSlotRooms(slot)[0]?.id;
    if (!roomId) continue;
    const state = { ...createRoomState(roomId), ...preset };
    if (roomId === 'CONTROL') state.staff = getRoomCapacity(state);
    if (roomId === 'ELEVATOR') {
      for (const other of Object.values(layout.slots)) {
        if (other.id === slot.id) continue;
        const sameRow =
          other.offset.row <= slot.offset.row &&
          other.offset.row + other.size.row > slot.offset.row;
        if (sameRow && other.offset.col + other.size.col === slot.offset.col)
          state.directions.left = true;
        if (sameRow && other.offset.col === slot.offset.col + slot.size.col)
          state.directions.right = true;
        if (other.offset.col === slot.offset.col && other.category === 'ELEVATOR') {
          if (other.offset.row === slot.offset.row + slot.size.row) state.directions.up = true;
          if (other.offset.row + other.size.row === slot.offset.row) state.directions.down = true;
        }
      }
    }
    result[slot.id] = state;
  }
  return result;
}

export function normalizeRoomState(state: BlueprintRoomState): BlueprintRoomState {
  const result = structuredClone(state);
  const maxLevel = roomRules[state.roomId]?.phases.length ?? 1;
  result.level = Math.max(1, Math.min(maxLevel, Math.round(state.level || 1)));
  result.staff = Math.max(0, Math.min(getRoomCapacity(result), Math.round(state.staff || 0)));
  result.progress = Math.max(0, Math.min(1, state.progress || 0));
  result.triangles = Math.max(0, Math.min(3, Math.round(state.triangles || 0)));
  result.trainingLevel = Math.max(0, Math.min(3, Math.round(state.trainingLevel || 0)));
  result.trainingTargetLevel = Math.min(result.trainingLevel + 1, 3);
  if (result.staff === 0) result.tired = false;
  if (result.roomId === 'PRIVATE') result.staff = result.ownerId ? 1 : 0;
  if (result.level === maxLevel) result.canLevelUp = false;
  return result;
}

const statusKeys: Record<string, Record<string, keyof typeof runtimeRules.strings>> = {
  MANUFACTURE: {
    idle: 'BUILDING_BROOM_MANUF_IDLE',
    working: 'BUILDING_BROOM_MANUF_WORK',
    stopped: 'BUILDING_BROOM_MANUF_STOP',
  },
  TRADING: {
    idle: 'BUILDING_BROOM_TRADING_IDEL',
    working: 'BUILDING_BROOM_TRADING_WORK',
    full: 'BUILDING_BROOM_TRADING_FULL',
  },
  POWER: { working: 'BUILDING_BROOM_POWER_STATE' },
  DORMITORY: { idle: 'BUILDING_BROOM_DORM_IDLE_STATE', resting: 'BUILDING_BROOM_DORM_REST_STATE' },
  HIRE: {
    idle: 'BUILDING_BROOM_HIRE_IDLE_STATE',
    working: 'BUILDING_BROOM_HIRE_WORK_STATE',
    stopped: 'BUILDING_BROOM_HIRE_STOP_STATE',
    finished: 'BUILDING_BROOM_HIRE_FINISH_STATE',
  },
  TRAINING: {
    idle: 'BUILDING_BROOM_TRAINING_IDLE',
    training: 'BUILDING_BROOM_TRAINING_WORK',
    finished: 'BUILDING_BROOM_TRAINING_FINISH',
  },
  PRIVATE: {
    idle: 'BUILDING_BROOM_PRIVATE_IDLE_STATE',
    working: 'BUILDING_BROOM_PRIVATE_USE_STATE',
  },
  RECYCLE: {
    working: 'BUILDING_BLUEPRINT_RECYCLE_STATE_NORMAL',
    boosting: 'BUILDING_BLUEPRINT_RECYCLE_STATE_BOOST',
    stopped: 'BUILDING_BLUEPRINT_RECYCLE_STATE_STOP',
  },
};

export function getStatusOptions(roomId: string): { label: string; value: string }[] {
  return Object.entries(statusKeys[roomId] ?? {}).map(([value, key]) => ({
    value,
    label: runtimeRules.strings[key],
  }));
}

/** 状态文本直接使用本机游戏的本地化表。 */
export function roomStateText(state: BlueprintRoomState): string {
  const key = statusKeys[state.roomId]?.[state.status];
  return key ? runtimeRules.strings[key] : '';
}
