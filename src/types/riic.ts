export interface CharDataType {
  displayName: string;
  eliteLevel: number | null;
  isTired: boolean;
}

/** 干员头像生成器中的一个干员条目 */
export interface OperatorSpec {
  /** 干员 ID */
  charId: string;
  /** 干员名称 */
  charName: string;
  /** 精英化等级，`null` 表示不显示 */
  eliteLevel: number | null;
  /** 是否注意力涣散 */
  isTired: boolean;
}

export interface StationQueueType {
  chars: CharDataType[];
  description: string;
}

export interface StationType {
  title: string;
  stationType: string;
  queues: StationQueueType[];
}

export interface StatItem {
  itemName: string;
  itemCount: string;
}

export interface ScheduleType {
  title: string;
  description: string;
  stats: StatItem[];
  queueDescriptions: string[];
  lines: StationType[][];
}
