export interface BasicInfo {
  name: string;
}

/**
 * `excel/activity_table.json` 数据格式
 */
export interface ActivityTable {
  basicInfo: Record<string, BasicInfo>;
  zoneToActivity: Record<string, string>;
}
