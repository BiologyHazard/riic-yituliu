import type { ItemBundle } from './common';

export type PhaseEnum = 'PHASE_0' | 'PHASE_1' | 'PHASE_2';

/**
 * 基建技能解锁条件
 * @example
 * {
 *   "phase": "PHASE_1",
 *   "level": 1
 * }
 */
export interface BuffUnlockCondition {
  /** 精英化阶段 */
  phase: PhaseEnum | number;
  /** 等级 */
  level: number;
}

/**
 * 一条基建技能，一个状态
 */
export interface BuffDataItem {
  /** 基建技能 ID */
  buffId: string;
  /** 基建技能解锁条件 */
  cond: BuffUnlockCondition;
}

/**
 * 一条基建技能，多个状态
 */
export interface BuffChar {
  /** 状态列表 */
  buffData: BuffDataItem[];
}

/**
 * 基建干员数据接口
 */
export interface BuildingChar {
  /** 干员 ID */
  charId: string;
  /** 最大心情值 */
  maxManpower: number;
  /** 基建技能列表 */
  buffChar: BuffChar[];
}

/**
 * Buff 信息接口
 * @example
 * {
 *   buffId: "control_prod_spd[000]",
 *   buffName: "最高权限",
 *   buffIcon: "control",
 *   skillIcon: "bskill_ctrl_p_spd",
 *   sortId: 1603,
 *   buffColor: "#005752",
 *   textColor: "#ffffff",
 *   buffCategory: "FUNCTION",
 *   roomType: "CONTROL",
 *   description: "进驻控制中枢时，所有制造站生产力<@cc.vup>+2%</>（同种效果取最高）",
 *   efficiency: 0,
 *   targetGroupSortId: 0,
 *   targets: []
 * }
 */
export interface BuffInfo {
  /**
   * Buff ID
   * @example "control_prod_spd[000]"
   */
  buffId: string;
  /**
   * Buff 名称
   * @example "最高权限"
   */
  buffName: string;
  /**
   * Buff 图标标识
   * @example "control"
   */
  buffIcon: string;
  /**
   * 技能图标标识
   * @example "bskill_ctrl_p_spd"
   */
  skillIcon: string;
  /**
   * 排序 ID，用于界面显示顺序
   * @example 1603
   */
  sortId: number;
  /**
   * Buff 背景颜色（十六进制）
   * @example "#005752"
   */
  buffColor: string;
  /**
   * 文本颜色（十六进制）
   * @example "#ffffff"
   */
  textColor: string;
  /**
   * Buff 类别
   * @example "FUNCTION"
   */
  buffCategory: string;
  /**
   * 房间类型
   * @example "CONTROL" | "MANUFACTURE" | "TRADING" | "POWER" | "DORMITORY"
   */
  roomType: string;
  /**
   * Buff 效果描述文本，可能包含富文本标记
   * @example "进驻控制中枢时，所有制造站生产力<@cc.vup>+2%</>（同种效果取最高）"
   */
  description: string;
  /**
   * 效率值（数值类型的效率加成）
   * @example 0
   */
  efficiency: number;
  /**
   * 目标组排序 ID
   * @example 0
   */
  targetGroupSortId: number;
  /**
   * 目标列表（具体目标对象的数组）
   * @example []
   */
  targets: unknown[];
}

export interface ExtraOutcome {
  weight: number;
  itemId: string;
  itemCount: number;
}

export interface RequireRoom {
  roomId: string;
  roomLevel: number;
  roomCount: number;
}

export interface RequireStage {
  stageId: string;
  rank: number;
}

export interface WorkshopFormula {
  sortId: string;
  formulaId: string;
  rarity: number;
  itemId: string;
  count: number;
  goldCost: number;
  apCost: number;
  formulaType: string;
  buffType: string;
  extraOutcomeRate: number;
  extraOutcomeGroup: ExtraOutcome[];
  costs: ItemBundle[];
  requireRooms: RequireRoom[];
  requireStages: RequireStage[];
}

/**
 * `excel/building_data.json` 数据格式
 */
export interface BuildingData {
  chars: Record<string, BuildingChar>;
  buffs: Record<string, BuffInfo>;
  workshopFormulas: Record<string, WorkshopFormula>;
}
