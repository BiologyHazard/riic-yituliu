export interface CharDataType {
  charId: string
  displayName: string
  eliteLevel: number | null
  isTired: boolean
}

export interface StationQueueType {
  chars: CharDataType[]
  description: string
}

export interface StationType {
  title: string
  stationType: string
  queues: StationQueueType[]
}

export interface ScheduleType {
  queueDescription: string[]
  lines: StationType[][]
}
