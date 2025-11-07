export interface CharDataType {
    operatorName: string;
    eliteLevel: number | null;
}

export interface StationQueueType {
    operators: CharDataType[];
    description: string;
}

export interface StationType {
    title: string;
    stationType: string;
    queues: StationQueueType[];
}


export interface ScheduleType {
    queueDescription: string[];
    lines: StationType[][];
}
