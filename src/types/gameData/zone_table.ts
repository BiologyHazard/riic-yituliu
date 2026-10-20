export interface Zone {
  zoneID: string;
  zoneNameFirst: string;
  zoneNameSecond: string;
}

/**
 * `excel/zone_table.json` 数据格式
 */
export interface ZoneTable {
  zones: Record<string, Zone>;
}
