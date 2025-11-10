export interface CharDataType {
  charId: string;
  displayName: string;
  eliteLevel: number | null;
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
