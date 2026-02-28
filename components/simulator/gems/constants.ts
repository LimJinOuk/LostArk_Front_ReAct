// Gem-related types and constants used by the simulator.

export type GemKind = "홍염" | "멸화" | "겁화" | "작열" | "광휘";
export type GemPick = { kind: GemKind; level: number };

export const GEM_KINDS: GemKind[] = ["홍염", "멸화", "겁화", "작열"];
export const GEM_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// Selected icon URLs by gem kind & level.
export const GEM_ICON_URL: Record<GemKind, Record<number, string>> = {
  홍염: {
    1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_56.png",
    2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_57.png",
    3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_58.png",
    4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_59.png",
    5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_60.png",
    6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_61.png",
    7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_62.png",
    8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_63.png",
    9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_64.png",
    10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_65.png",
  },
  멸화: {
    1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_46.png",
    2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_47.png",
    3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_48.png",
    4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_49.png",
    5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_50.png",
    6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_51.png",
    7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_52.png",
    8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_53.png",
    9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_54.png",
    10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_55.png",
  },
  겁화: {
    1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_96.png",
    2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_97.png",
    3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_98.png",
    4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_99.png",
    5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_100.png",
    6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_101.png",
    7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_102.png",
    8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_103.png",
    9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_104.png",
    10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_105.png",
  },
  작열: {
    1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_106.png",
    2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_107.png",
    3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_108.png",
    4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_109.png",
    5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_110.png",
    6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_111.png",
    7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_112.png",
    8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_113.png",
    9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_114.png",
    10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_115.png",
  },
  // 광휘 is for compatibility (some tooltips may contain it).
  광휘: {},
};

// T4: only 겁화/작열/광휘 contribute to attack bonus sum.
export const T4_ATK_BONUS_BY_LEVEL: Record<number, number> = {
  1: 0.0,
  2: 0.05,
  3: 0.1,
  4: 0.2,
  5: 0.3,
  6: 0.45,
  7: 0.6,
  8: 0.8,
  9: 1.0,
  10: 1.2,
};

// Gem effects tables (percent).
export const GEM_DAMAGE_TABLE: Record<string, Record<number, number>> = {
  // Skill damage %
  멸화: { 1: 3, 2: 6, 3: 9, 4: 12, 5: 15, 6: 18, 7: 21, 8: 24, 9: 30, 10: 40 },
  겁화: { 1: 8, 2: 12, 3: 16, 4: 20, 5: 24, 6: 28, 7: 32, 8: 36, 9: 40, 10: 44 },
  광휘: { 1: 8, 2: 12, 3: 16, 4: 20, 5: 24, 6: 28, 7: 32, 8: 36, 9: 40, 10: 44 },
  // Cooldown reduction %
  홍염: { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10, 6: 12, 7: 14, 8: 16, 9: 18, 10: 20 },
  작열: { 1: 6, 2: 8, 3: 10, 4: 12, 5: 14, 6: 16, 7: 18, 8: 20, 9: 22, 10: 24 },
};

