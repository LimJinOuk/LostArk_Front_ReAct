
export interface GearInfo {
  slot: string;
  name: string;
  honingLevel: number;
  quality: number;
  isT4?: boolean;
  trans?: string;
  elixir?: string;
  stats?: string[];
}

export interface AccessoryInfo {
  slot: string;
  name: string;
  stats: string;
  quality: number;
  refinementEffect?: string;
}

export interface Engraving {
  name: string;
  level: number;
  isActive: boolean;
  isArkPassive?: boolean;
}

export interface SkillInfo {
  name: string;
  level: number;
  tripods: string[];
  activeTripodIndices: number[];
  rune?: string;
  damageContribution: number;
  type?: string;
}

export interface ArkPassivePoint {
  evolution: number;
  enlightenment: number;
  leap: number;
}

export interface ArkPassiveEffect {
  tier: string;
  name: string;
  level: number;
}

export interface ArkGridEffect {
  name: string;
  level: number;
  value: string;
}

export interface CollectionStat {
  name: string;
  percent: number;
}

export interface CharacterInfo {
  name: string;
  server: string;
  class: string;
  title: string;
  itemLevel: number;
  battleLevel: number;
  expeditionLevel: number;
  combatPower: number;
  guildName?: string;
  pvpGrade?: string;
  ranking?: {
    overall: number;
    overallPercent: number;
    class: number;
    classPercent: number;
  };
  arkPassiveEnabled: boolean;
  arkPassivePoints: ArkPassivePoint;
  gear: GearInfo[];
  accessories: AccessoryInfo[];
  gems: GemInfo[];
  skills: SkillInfo[];
  engravings: Engraving[];
  cards: string[];
  innerStats: {
    crit: number;
    specialization: number;
    swiftness: number;
    domination: number;
    endurance: number;
    expertise: number;
  };
  arkGridCores: { name: string; points: number }[];
  arkGridEffects: ArkGridEffect[];
  collections: CollectionStat[];
  social: {
    today: number;
    total: number;
  };
  specialSummary: {
    elixir: string;
    trans: string;
    evolution: string;
    enlightenment: string;
  };
}

export interface GemInfo {
  slot: number;
  type: 'Damage' | 'Cooldown' | 'AttackSpeed';
  level: number;
  originalLevel: number;
  skillName: string;
}

export interface RaidDifficulty {
  type: 'Normal' | 'Hard';
  gold: number;
  extraRewardCost: number;
  mandatoryDrops: string[];
}

export interface RaidInfo {
  id: string;
  name: string;
  difficulties: RaidDifficulty[];
}

export interface MariItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type PageType = 'home' | 'profile' | 'raid' | 'auction' | 'simulator';
