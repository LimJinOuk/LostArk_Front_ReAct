// ArkPassiveTooltipData.ts

export type ArkCategory = "EVOLUTION" | "ENLIGHTENMENT" | "LEAP";

export type ValueByLevel = Record<number, number | string>;

export type TooltipLine = {
    base: string; // 템플릿 문장 (예: "치명 +{x}")
    values?: Record<string, ValueByLevel>; // 예: { x: {1:13,2:26,3:40} }
};

export type ArkTooltipEntry = {
    key: string;
    name: string;
    category: ArkCategory;
    className?: string; // EVOLUTION은 없음(빈 문자열로 들어가도 됨)
    max: number;
    tier?: number;
    lines: TooltipLine[];
};

// ✅ 실제 DB (예시)
// key는 makeTooltipKey() 규칙과 반드시 동일해야 함
export const TOOLTIP_DB: Record<string, ArkTooltipEntry> = {
    "EVOLUTION||치명": {
        key: "EVOLUTION||치명",
        name: "치명",
        category: "EVOLUTION",
        max: 30,
        tier: 1,
        lines: [
            {
                base: "치명이 {x}증가합니다.",
                values: { x: { 1: 10, 2: 20, 30: 1500 } }, // 예시 값
            },
        ],
    },
    "EVOLUTION||특화": {
        key: "EVOLUTION||특화",
        name: "특화",
        category: "EVOLUTION",
        max: 30,
        tier: 1,
        lines: [
            {
                base: "치명 +{x}",
                values: { x: { 1: 10, 2: 20, 30: 300 } }, // 예시 값
            },
        ],
    },
    "ENLIGHTENMENT|워로드|고독한 기사": {
        key: "ENLIGHTENMENT|워로드|고독한 기사",
        name: "고독한 기사",
        category: "ENLIGHTENMENT",
        className: "워로드",
        max: 3,
        tier: 1,
        lines: [
            { base: "공격력 +{x}%", values: { x: { 1: 3, 2: 6, 3: 9 } } },
            { base: "추가 효과: {y}", values: { y: { 1: "A", 2: "B", 3: "C" } } },
        ],
    },
    "LEAP|워로드|초월적인 힘": {
        key: "LEAP|워로드|초월적인 힘",
        name: "초월적인 힘",
        category: "LEAP",
        className: "워로드",
        max: 5,
        tier: 1,
        lines: [
            { base: "힘 +{x}", values: { x: { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25 } } },
        ],
    },


};

