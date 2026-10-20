/**
 * 术语释义格式
 * @example
 * {
 *   "termId": "cc.bd_B",
 *   "termName": "无声共鸣",
 *   "description": "可影响<$cc.bd_B_1><@cc.rem>徘徊旋律</></>、<$cc.bd_B_2><@cc.rem>怅惘和声</></>、<$cc.bd_B_3><@cc.rem>无词颂歌</></>相关技能\n由以下干员的基建技能提供\n黑键、塑心、深律"
 * }
 */
export interface TermDescription {
  termId: string;
  termName: string;
  description: string;
}

/**
 * `excel/gamedata_const.json` 数据格式
 */
export interface GameDataConst {
  characterExpMap: number[][];
  characterUpgradeCostMap: number[][];
  evolveGoldCost: number[][];
  /**
   * 富文本标签与样式映射表
   * 将游戏中的富文本标签映射为对应的颜色样式
   */
  richTextStyles: Record<string, string>;
  termDescriptionDict: Record<string, TermDescription>;
}
