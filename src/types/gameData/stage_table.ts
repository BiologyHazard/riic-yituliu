export interface Stage {
  difficulty: string;
  zoneId: string;
  code: string;
  name: string;
}

/**
 * `excel/stage_table.json` 数据格式
 */
export interface StageTable {
  stages: Record<string, Stage>;
}
