export interface Item {
  itemId: string;
  name: string;
  name_i18n: I18n<string>;
  existence: Server<{ exist: boolean }>;
  itemType: string;
  sortId: number;
  rarity: number;
  groupID: string;
  spriteCoord: [number, number];
  alias: never;
  pron: never;
}

export type Items = Item[];

export interface ResultMatrixEntry {
  stageId: string;
  itemId: string;
  quantity: number;
  times: number;
  start: number;
  end: number;
}

export interface ResultMatrix {
  matrix: ResultMatrixEntry[];
}

export interface I18n<T> {
  en: T;
  ja: T;
  ko: T;
  zh: T;
}

export interface Server<T> {
  CN: T;
  JP: T;
  KR: T;
  US: T;
}

export interface Stage {
  stageId: string;
  zoneId: string;
  stageType: string;
  code: string;
  code_i18n: I18n<string>;
  apCost: number;
  existence: Server<boolean>;
  minClearTime: number;
  dropInfos?: never[];
}

export type Stages = Stage[];

export interface Zone {
  zoneId: string;
  zoneIndex: number;
  type: string;
  subType: string;
  zoneName: string;
  zoneName_i18n: I18n<string>;
  existence: Server<{ exist: boolean; openTime: number }>;
  background: string;
  stages: string[];
}

export type Zones = Zone[];
