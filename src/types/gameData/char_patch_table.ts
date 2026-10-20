import type { Character } from './character_table';

/**
 * `excel/char_patch_table.json` 数据格式
 */
export interface CharPatchTable {
  patchChars: Record<string, Character>;
}
