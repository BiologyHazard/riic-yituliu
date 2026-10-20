import type { ItemBundle } from './common';

export interface Phase {
  maxLevel: number;
  evolveCost: ItemBundle[];
}

export interface SpecializeLevelData {
  levelUpCost: ItemBundle[] | null;
}

export interface MainSkill {
  skillId: string | null;
  levelUpCostCond: SpecializeLevelData[];
}

export interface AllSkillLvlup {
  lvlUpCost: ItemBundle[] | null;
}

export interface Character {
  name: string;
  spTargetType: string | number;
  itemObtainApproach: string | null;
  rarity: number | string;
  profession: string;
  phases: Phase[];
  skills: MainSkill[];
  allSkillLvlup: AllSkillLvlup[];
}

/**
 * `excel/character_table.json` 数据格式
 */
export type CharacterTable = Record<string, Character>;
