export interface CharSkin {
  avatarId: string;
  portraitId: string;
}

/**
 * `excel/skin_table.json` 数据格式
 */
export interface SkinTable {
  charSkins: Record<string, CharSkin>;
  buildinEvolveMap: Record<string, Record<string, string>>;
  buildinPatchMap: Record<string, Record<string, string>>;
}
