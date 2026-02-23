import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, Search, ShieldAlert, Diamond } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SynergyBuffTab } from "./SynergyBuffTab";
import { ResultTab } from "./Result";
import { ArkPassiveBoard } from "./ArkPassiveBoard.tsx";
import engravingIconMap from "@/components/profile/tabs/engravingsIdTable.json";
import JewelryTooltip from "@/components/profile/Tooltip/JewelryTooltip.tsx";
import { CharacterInfo } from "@/types.ts";
import { SimTab } from "./SimulatorNav";
import ArkCoreTooltip from "@/components/profile/Tooltip/ArkCoreTooltip.tsx";
import {AccessoryItem} from "@/components/simulator/container/AccessoryItem.tsx";
import {EquipmentItem} from "@/components/simulator/container/EquipmentItem.tsx";
import ArkGridItem from "@/components/simulator/container/ArkGrid/ArkGridItem.tsx";

type CharacterInfoCompat = CharacterInfo & { CharacterName?: string };

// 🔹 Props 인터페이스: activeTab 추가
interface SimulatorProps {
    character?: CharacterInfoCompat | null;
    activeTab: SimTab;
    onEquipmentUpdate: (partName: string, data: any) => void;
    onAccessoryUpdate: (partName: string, data: any) => void; // ✅ 추가
    accessoryStates: Record<string, any>; // ✅ 추가
}

interface EquipmentItemProps {
    item: any;
    i: number;
    theme: any;
    tooltip: any;
    quality: number | string;
    reinforceLevel: string;
    advancedReinforce: string | number;
    itemName: string;
    REINFORCE_OPTIONS: Array<{ label: string; value: number; tier: number }>;
    setHoveredIndex: (idx: number | null) => void;
    setHoveredData: (data: any) => void;
    onUpdate: (partName: string, data: any) => void;
}

interface ArkEffect {
    Name: string;
    Level: number;
    Tooltip: string;
}

interface ArkSlot {
    Index: number;
    Icon: string;
    Name: string;
    Point: number;
    Grade: string;
    Tooltip: string | object;
    Gems?: any[];
}

interface ArkCoreData {
    Slots: ArkSlot[];
    Effects: ArkEffect[];
}

/* ---------------------- 상수 및 스타일 (기존 유지) ---------------------- */
const gradeStyles: any = {
    일반: {
        bg: "from-zinc-800 to-zinc-950",
        border: "border-white/10",
        text: "text-zinc-400",
        accent: "bg-zinc-500",
    },
    고급: {
        bg: "from-[#1a2e1a] to-[#0a0f0a]",
        border:
            "border-[#48c948]/30 shadow-[0_0_10px_rgba(72,201,72,0.05)]",
        text: "text-[#4edb4e]",
        accent: "bg-[#48c948]",
    },
    희귀: {
        bg: "from-[#1a2a3e] to-[#0a0d12]",
        border: "border-[#00b0fa]/30 shadow-[0_0_10px_rgba(0,176,250,0.1)]",
        text: "text-[#33c2ff]",
        accent: "bg-[#00b0fa]",
    },
    영웅: {
        bg: "from-[#2e1a3e] to-[#120a1a]",
        border: "border-[#ce43fb]/30 shadow-[0_0_10px_rgba(206,67,251,0.1)]",
        text: "text-[#d966ff]",
        accent: "bg-[#ce43fb]",
    },
    전설: {
        bg: "from-[#41321a] to-[#1a120a]",
        border: "border-[#f99200]/40 shadow-[0_0_10px_rgba(249,146,0,0.15)]",
        text: "text-[#ffaa33]",
        accent: "bg-[#f99200]",
    },
    유물: {
        bg: "from-[#351a0a] to-[#0a0a0a]",
        border: "border-[#fa5d00]/50 shadow-[0_0_10px_rgba(250,93,0,0.2)]",
        text: "text-[#ff7526]",
        accent: "bg-[#fa5d00]",
    },
    고대: {
        bg: "from-[#3d3325] to-[#0f0f10]",
        border: "border-[#e9d2a6]/40",
        text: "text-[#e9d2a6]",
        accent: "bg-[#e9d2a6]",
    },
    에스더: {
        bg: "from-[#0d2e2e] to-[#050505]",
        border:
            "border-[#2edbd3]/60 shadow-[0_0_12px_rgba(46,219,211,0.2)]",
        text: "text-[#45f3ec]",
        accent: "bg-[#2edbd3]",
    },
};

/* ---------------------- Interfaces & Utils (기존 유지) ---------------------- */
interface Equipment {
    Type: string;
    Name: string;
    Icon: string;
    Grade: string;
    Tooltip: string;
}

const cleanText = (text: any): string => {
    if (!text) return "";
    if (typeof text === "string") return text.replace(/<[^>]*>?/gm, "").trim();
    return "";
};

const getQualityColor = (q: number) => {
    if (q === 100) return "text-[#FF8000] border-[#FF8000]";
    if (q >= 90) return "text-[#CE43FB] border-[#CE43FB]";
    if (q >= 70) return "text-[#00B0FA] border-[#00B0FA]";
    if (q >= 30) return "text-[#00D100] border-[#00D100]";
    return "text-[#FF4040] border-[#FF4040]";
};

const FALLBACK_ABILITY_STONE_ICON =
    "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/game/ico_ability_stone_symbol.png";

function safeClone<T>(v: T): T {
    try {
        return JSON.parse(JSON.stringify(v));
    } catch {
        return v;
    }
}

/* =======================
   ✅ GEM TYPES / CONSTANTS (파일 전역 - 단 한번만 선언)
   ======================= */
type GemKind = "홍염" | "멸화" | "겁화" | "작열" | "광휘";
type GemPick = { kind: GemKind; level: number };

const GEM_KINDS: GemKind[] = ["홍염", "멸화", "겁화", "작열"];
const GEM_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

// ✅ 선택 시 아이콘 바뀌는 맵
const GEM_ICON_URL: Record<GemKind, Record<number, string>> = {
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
};

// ✅ 4티어 겁화/작열만 공격력 증가(합산용)
const T4_ATK_BONUS_BY_LEVEL: Record<number, number> = {
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

// ===== ArkPassive 전송용 유틸 =====
type ArkTab = "진화" | "깨달음" | "도약";
type ArkPassiveLevelsPayload = {
    characterName: string;
    nodes: Record<ArkTab, Record<string, number>>; // 탭별 (노드명 -> 레벨)
    points?: any; // 필요하면 같이 전송(선택)
};

const ARK_TABS: ArkTab[] = ["진화", "깨달음", "도약"];

function parseArkTabFromEffect(effect: any): ArkTab | null {
    const s = `${effect?.Name ?? ""} ${effect?.Description ?? ""}`;
    if (s.includes("진화")) return "진화";
    if (s.includes("깨달음")) return "깨달음";
    if (s.includes("도약")) return "도약";
    return null;
}

function parseLvFromDesc(desc: string): number {
    const n = Number(String(desc ?? "").match(/Lv\.(\d+)/)?.[1] ?? 0);
    return Number.isFinite(n) ? n : 0;
}

function parseNodeNameFromDesc(desc: string, tab: ArkTab): string {
    // 예: "깨달음 어떤노드 Lv.3" / "도약 XXX Lv.5"
    let s = String(desc ?? "");

    // Lv 제거
    s = s.replace(/Lv\.\d+/g, "").trim();

    // 탭 이름 제거
    s = s.replace(tab, "").trim();

    // 중복 공백 정리
    s = s.replace(/\s+/g, " ").trim();

    return s;
}

function buildArkPassivePayload(characterName: string, arkData: any): ArkPassiveLevelsPayload {
    const nodes: ArkPassiveLevelsPayload["nodes"] = {
        진화: {},
        깨달음: {},
        도약: {},
    };

    const effects = Array.isArray(arkData?.Effects) ? arkData.Effects : [];
    for (const eff of effects) {
        const tab = parseArkTabFromEffect(eff);
        if (!tab) continue;

        const lv = parseLvFromDesc(String(eff?.Description ?? ""));
        const nodeName = parseNodeNameFromDesc(String(eff?.Description ?? eff?.Name ?? ""), tab);

        if (!nodeName) continue;
        // 레벨 0은 보통 effects에서 제거되어 있을 텐데, 혹시 남아있어도 제외
        if (lv <= 0) continue;

        nodes[tab][nodeName] = lv;
    }

    return {
        characterName,
        nodes,
        points: arkData?.Points, // 필요없으면 제거해도 됨
    };
}

function inferGemKindFromEquippedGem(gem: any): GemKind | null {
    if (!gem) return null;

    // 1) 가장 우선: gem.Name 같은 필드가 있으면 거기서 찾기
    const directText = String(gem?.Name || "");

    // 2) Tooltip이 있으면 JSON을 문자열로 만들어서 통째로 검색 (필드명이 달라도 잡힘)
    let tooltipText = "";
    try {
        const t =
            typeof gem?.Tooltip === "string" ? JSON.parse(gem.Tooltip) : gem?.Tooltip;
        tooltipText = typeof t === "string" ? t : JSON.stringify(t);
    } catch {
        tooltipText = String(gem?.Tooltip || "");
    }

    const hay = (directText + " " + tooltipText).toLowerCase();

    // ✅ 키워드 기반 판별 (순서 중요: 광휘 먼저)
    if (hay.includes("광휘")) return "광휘";
    if (hay.includes("겁화")) return "겁화";
    if (hay.includes("작열")) return "작열";
    if (hay.includes("멸화")) return "멸화";
    if (hay.includes("홍염")) return "홍염";

    return null;
}

/* =======================
   ✅ GemSlot (드롭다운 + 아이콘 변경 + 툴팁 유지)
   ======================= */
type GemSlotProps = {
    gem: any;
    index: number;

    hoverIdx: number | null;
    hoverData: any;
    setHoverIdx: (v: number | null) => void;
    setHoverData: (v: any) => void;

    isCenter?: boolean;

    pick: GemPick | null;
    setPick: (index: number, pick: GemPick | null) => void;
};

const GemSlot = ({
                     gem,
                     index,
                     hoverIdx,
                     hoverData,
                     setHoverIdx,
                     setHoverData,
                     isCenter = false,
                     pick,
                     setPick,
                 }: GemSlotProps) => {
    const sizeClasses = isCenter ? "w-14 h-14" : "w-12 h-12";

    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        window.addEventListener("mousedown", onDown);
        return () => window.removeEventListener("mousedown", onDown);
    }, [open]);

    let skillIcon = gem?.Icon;
    let gradeColor = "#1f2937";

    // ✅ 기존 gem tooltip에서 아이콘/등급색 추출 유지
    try {
        if (gem?.Tooltip) {
            const tooltip =
                typeof gem.Tooltip === "string" ? JSON.parse(gem.Tooltip) : gem.Tooltip;
            skillIcon = tooltip.Element_001?.value?.slotData?.iconPath || gem.Icon;
            const gradeName = tooltip.Element_001?.value?.leftStr0 || gem.Grade || "";

            if (gradeName.includes("고대")) gradeColor = "#2a4d4f";
            else if (gradeName.includes("유물")) gradeColor = "#4d2b14";
            else if (gradeName.includes("전설")) gradeColor = "#45381a";
        }
    } catch {
        skillIcon = gem?.Icon;
    }

    // ✅ 핵심: pick이 있으면 그 아이콘으로 덮어쓰기
    if (pick) {
        const pickedIcon = GEM_ICON_URL[pick.kind]?.[pick.level];
        if (pickedIcon) skillIcon = pickedIcon;
    }

    const label = pick ? `Lv.${pick.level} ${pick.kind}` : gem ? `Lv.${gem.Level}` : "선택";

    const selectPick = (kind: GemKind, level: number) => {
        setPick(index, { kind, level });
        setOpen(false);
    };

    const clearPick = () => {
        setPick(index, null);
        setOpen(false);
    };

    return (
        <div
            ref={wrapRef}
            className="relative group flex flex-col items-center"
            onMouseEnter={() => {
                setHoverIdx(index);
                setHoverData(gem);
            }}
            onMouseLeave={() => {
                setHoverIdx(null);
                setHoverData(null);
            }}
        >
            <button
                type="button"
                className="flex flex-col items-center cursor-pointer select-none"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
            >
                {gem || pick ? (
                    <div
                        className={`${sizeClasses} rounded-full transition-all duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden border border-zinc-700/50 shadow-lg`}
                        style={{
                            background: `radial-gradient(circle at center, ${gradeColor} 0%, #07090c 100%)`,
                        }}
                    >
                        <img
                            src={skillIcon}
                            alt=""
                            className="w-full h-full object-cover scale-110 drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]"
                            draggable={false}
                        />
                    </div>
                ) : (
                    <div className={`${sizeClasses} rounded-full bg-white/5 opacity-10 border border-zinc-800`} />
                )}

                <span className="mt-1 text-zinc-500 text-[11px] font-bold group-hover:text-zinc-300 transition-colors whitespace-nowrap">
          {label}
        </span>
            </button>

            {/* ✅ 기존 툴팁 유지 */}
            {hoverIdx === index && hoverData && (
                <div
                    className="absolute left-[80%] top-0 z-[9999] pl-4 pt-2 pointer-events-auto"
                    style={{ width: "max-content" }}
                >
                    <div className="animate-in fade-in zoom-in-95 duration-150">
                        <JewelryTooltip gemData={hoverData} />
                    </div>
                </div>
            )}

            {/* ✅ 드롭다운 */}
            {open && (
                <div
                    className="absolute z-[99999] mt-2 left-1/2 -translate-x-1/2 w-[210px] rounded-2xl border border-white/10 bg-[#0b0f14]/95 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                        <div className="text-[12px] font-semibold text-zinc-200">보석 선택</div>
                        <button
                            type="button"
                            onClick={clearPick}
                            className="text-[11px] text-zinc-300/80 hover:text-zinc-200 underline underline-offset-2"
                        >
                            해제
                        </button>
                    </div>

                    <div className="max-h-[240px] overflow-auto">
                        {GEM_KINDS.map((kind) => (
                            <div key={kind} className="px-3 py-2 border-b border-white/5">
                                <div className="text-[12px] text-zinc-200/90 mb-2">{kind}</div>
                                <div className="grid grid-cols-5 gap-1.5 pb-1">
                                    {GEM_LEVELS.map((lv) => {
                                        const active = pick?.kind === kind && pick?.level === lv;
                                        return (
                                            <button
                                                key={`${kind}-${lv}`}
                                                type="button"
                                                onClick={() => selectPick(kind, lv)}
                                                className={[
                                                    "h-7 rounded-xl text-[11px] font-semibold",
                                                    "border border-white/10",
                                                    active ? "bg-white/15 text-white" : "bg-black/20 text-zinc-200/90 hover:bg-white/10",
                                                ].join(" ")}
                                            >
                                                {lv}
                                            </button>
                                        );
                                    })}
                                </div>

                                {(kind === "겁화" || kind === "작열") && (
                                    <div className="text-[10px] text-zinc-400 mt-1">(4티어: 공격력 증가 합산 대상)</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ---------------------- Empty State Search UI ---------------------- */
const NoCharacterView = ({
                             onSearch,
                             searching,
                             error,
                         }: {
    onSearch: (name: string) => void;
    searching: boolean;
    error: string | null;
}) => {
    const [name, setName] = useState("");

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6">
            <div className="w-full max-w-xl bg-[#121213] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <ShieldAlert className="text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">캐릭터 정보가 없습니다.</h2>
                        <p className="text-sm text-zinc-400 mt-1">시뮬레이터를 사용하려면 캐릭터를 먼저 검색해 주세요.</p>
                    </div>
                </div>

                <div className="mt-6 flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18}/>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="캐릭터 이름 입력"
                            className="w-full pl-10 pr-3 h-12 rounded-xl bg-zinc-950/40 border border-zinc-800 text-zinc-200 outline-none focus:border-indigo-500/40"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onSearch(name.trim());
                            }}
                        />
                    </div>

                    <button
                        onClick={() => onSearch(name.trim())}
                        disabled={searching || !name.trim()}
                        className="h-12 px-5 rounded-xl bg-indigo-600 text-white font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-500 transition"
                    >
                        {searching ? "검색중..." : "검색"}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>
                )}
            </div>
        </div>
    );
};

/* ---------------------- 메인 컴포넌트 ---------------------- */
export const Simulator: React.FC<SimulatorProps> = ({character: propCharacter, activeTab, onEquipmentUpdate,
    onAccessoryUpdate, // 👈 여기서 꺼내줘야 내부에서 쓸 수 있습니다.
    accessoryStates    // 👈 여기서 꺼내줘야 내부에서 쓸 수 있습니다.
    }) => {
    const location = useLocation();

    /** ✅ 우선순위: props > location.state.character > null */
    const initialCharacter = useMemo(() => {
        const stateChar = (location.state as any)?.character ?? null;
        return (propCharacter ?? stateChar) as CharacterInfoCompat | null;
    }, [location.state, propCharacter]);

    // ✅ 원본 캐릭터 (절대 직접 수정 X)
    const [character, setCharacter] = useState<CharacterInfoCompat | null>(
        initialCharacter
    );

    // ✅ 시뮬에서만 사용할 캐릭터 사본
    const [simCharacter, setSimCharacter] = useState<CharacterInfoCompat | null>(
        initialCharacter ? safeClone(initialCharacter) : null
    );

    // ✅ 아크패시브: 원본/시뮬 분리
    const [originalArkPassive, setOriginalArkPassive] = useState<any>(null);
    const [simArkPassive, setSimArkPassive] = useState<any>(null);

    const characterName = useMemo(() => {
        return character?.CharacterName ?? (character as any)?.name ?? "";
    }, [character]);

    // 상세 데이터들(원본)
    const [loading, setLoading] = useState(false);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [arkGrid, setArkGrid] = useState<ArkCoreData | null>(null);
    const [gems, setGems] = useState<any>(null);
    const [engravings, setEngravings] = useState<any>(null);

    const [arkCoreHoverIdx, setArkCoreHoverIdx] = useState<any>(null);
    const [arkCoreHoverData, setArkCoreHoverData] = useState<any>(null);

    // 툴팁 상태 관리
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoveredData, setHoveredData] = useState<any>(null);

    const [jewlryHoverIdx, setJewlryHoverIdx] = useState<any>(null);
    const [jewlryHoverData, setJewlryHoverData] = useState<any>(null);

    const getItemsByType = (types: string[]) =>
        equipments.filter((item) => types.includes(item.Type));

    // Simulator 컴포넌트 내부 상단에 추가
    const TABS = ["진화", "깨달음", "도약"] as const;
    type TabType = (typeof TABS)[number];

    const [activeArkTab, setActiveArkTab] = useState<TabType>("깨달음");
    const [[page, direction], setPage] = useState([0, 0]);
    const [hoverInfo, setHoverInfo] = useState<{
        effect: any;
        rect: DOMRect | null;
    } | null>(null);

    const [engrHoverIdx, setEngrHoverIdx] = useState<number | null>(null);
    const [engrHoverName, setEngrHoverName] = useState<string | null>(null);
    const [engrHoverDesc, setEngrHoverDesc] = useState<string>("");

    // ✅ 보석 선택 상태 (슬롯 0~10, 총 11개)
    const [gemPicks, setGemPicks] = useState<Record<number, GemPick | null>>(
        () => {
            const init: Record<number, GemPick | null> = {};
            for (let i = 0; i <= 10; i++) init[i] = null;
            return init;
        }
    );

    const setPickAt = (i: number, p: GemPick | null) =>
        setGemPicks((prev) => ({ ...prev, [i]: p }));

// ✅ 총 공격력% 합산 (pick 우선, 없으면 초기 장착 보석에서도 계산)
// - 대상: 겁화 / 작열 / 광휘
    const totalGemAtkBonus = useMemo(() => {
        let sum = 0;

        for (let idx = 0; idx <= 10; idx++) {
            const pick = gemPicks[idx];

            // 1) 사용자가 드롭다운으로 선택한 경우 → 그걸 우선
            if (pick) {
                if (pick.kind === "겁화" || pick.kind === "작열" || pick.kind === "광휘") {
                    sum += T4_ATK_BONUS_BY_LEVEL[pick.level] ?? 0;
                }
                continue;
            }

            // 2) pick이 없으면 → 현재 장착된 보석(gems?.Gems[idx])에서 추론해서 계산
            const equipped = gems?.Gems?.[idx];
            if (!equipped) continue;

            const kind = inferGemKindFromEquippedGem(equipped);
            const level = Number(equipped?.Level);

            if (!Number.isFinite(level) || level <= 0) continue;

            if (kind === "겁화" || kind === "작열" || kind === "광휘") {
                sum += T4_ATK_BONUS_BY_LEVEL[level] ?? 0;
            }
        }

        return sum;
    }, [gemPicks, gems]);


    const formatPct = (n: number) => `${n.toFixed(2)}%`;

    // Simulator 컴포넌트 내부 상단에 추가
    const [arkData, setArkData] = useState<any>(null);

    // 데이터가 로드되면 시뮬레이션 상태에 복사
    useEffect(() => {
        if (originalArkPassive) {
            setArkData(JSON.parse(JSON.stringify(originalArkPassive)));
        }
    }, [originalArkPassive]);

    const updateLevel = (nodeName: string, delta: number, maxLv: number) => {
        if (!arkData) return;

        setArkData((prev: any) => {
            const next = JSON.parse(JSON.stringify(prev));
            let effectIndex = next.Effects.findIndex(
                (e: any) =>
                    e.Name.includes(activeArkTab) &&
                    e.Description.replace(/\s+/g, "").includes(
                        nodeName.replace(/\s+/g, "")
                    )
            );

            if (effectIndex === -1 && delta > 0) {
                next.Effects.push({
                    Name: `[아크 패시브] ${activeArkTab} 티어`,
                    Description: `${nodeName} Lv.0`,
                });
                effectIndex = next.Effects.length - 1;
            }

            if (effectIndex !== -1) {
                const currentLvMatch =
                    next.Effects[effectIndex].Description.match(/Lv\.(\d+)/);
                let currentLv = currentLvMatch ? parseInt(currentLvMatch[1]) : 0;
                const nextLv = Math.min(Math.max(currentLv + delta, 0), maxLv);

                next.Effects[effectIndex].Description =
                    next.Effects[effectIndex].Description.replace(
                        /Lv\.\d+/,
                        `Lv.${nextLv}`
                    );
            }
            return next;
        });
    };

    const engravingDescToHtml = (desc: string) => {
        if (!desc) return "";

        let html = desc
            .replace(
                /<FONT\s+COLOR=['"](#?[0-9a-fA-F]{6})['"]>/g,
                `<span style="color:$1">`
            )
            .replace(/<\/FONT>/g, `</span>`);

        html = html.replace(/\n/g, "<br />");
        return html;
    };

    // ✅ [추가] 젬 효과(추가피해/보스피해/공격력) 레벨을 사용자 입력으로만 변경 가능하게
    type EditableGemEffectKey = "atk" | "add" | "boss";
    const GEM_EFFECT_RATE: Record<EditableGemEffectKey, number> = {
        atk: 0.04,
        add: 0.08,
        boss: 0.08,
    };

    const clampLv = (n: number) => {
        if (!Number.isFinite(n)) return 0;
        return Math.min(120, Math.max(0, Math.floor(n)));
    };

    const isAtkEffect = (name: string) => {
        const n = (name || "").replace(/\s+/g, "");
        // "공격력"만 타겟 (무기 공격력 같은 다른 문구는 제외하고 싶으면 아래 조건 유지)
        return n.includes("공격력") && !n.includes("무기공격력");
    };
    const isAddEffect = (name: string) => {
        const n = (name || "").replace(/\s+/g, "");
        return n.includes("추가피해") || n.includes("추가피해") || n.includes("추가피해량") || n.includes("추가피해");
    };
    const isBossEffect = (name: string) => {
        const n = (name || "").replace(/\s+/g, "");
        // "보스 등급 이상 몬스터에게 주는 피해" 계열
        return n.includes("보스") && (n.includes("피해") || n.includes("몬스터에게주는피해") || n.includes("등급이상"));
    };

    const getEditableKey = (effectName: string): EditableGemEffectKey | null => {
        if (isAtkEffect(effectName)) return "atk";
        if (isAddEffect(effectName)) return "add";
        if (isBossEffect(effectName)) return "boss";
        return null;
    };

    // ✅ 편집 가능한 3종 레벨 상태
    const [gemEffectLv, setGemEffectLv] = useState<Record<EditableGemEffectKey, number>>({
        atk: 0,
        add: 0,
        boss: 0,
    });

    // ✅ arkGrid 로딩/변경 시: 서버에서 내려오는 레벨을 초기값으로 세팅(있으면)
    useEffect(() => {
        const effects = arkGrid?.Effects ?? [];
        if (!effects.length) return;

        const next = { ...gemEffectLv };

        for (const e of effects) {
            const key = getEditableKey(e?.Name || "");
            if (!key) continue;

            const lv = clampLv(Number((e as any)?.Level ?? 0));
            next[key] = lv;
        }

        // 실제로 값이 달라졌을 때만 set
        if (next.atk !== gemEffectLv.atk || next.add !== gemEffectLv.add || next.boss !== gemEffectLv.boss) {
            setGemEffectLv(next);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arkGrid]);

    const gemEffectValuePct = (key: EditableGemEffectKey, lv: number) => {
        const pct = clampLv(lv) * (GEM_EFFECT_RATE[key] ?? 0);
        return `${pct.toFixed(2)}%`;
    };

    const parseEffectTooltipLine = (rawTooltip: string) => {
        const text = String(rawTooltip || "")
            .replace(/<[^>]*>?/gm, "")
            .replace(/\s*\+\s*$/, "");
        const splitPos = text.lastIndexOf(" +");
        if (splitPos === -1) return { desc: text, val: "" };
        const desc = text.substring(0, splitPos);
        const val = text.substring(splitPos + 1);
        return { desc, val };
    };

    const handleGemEffectLvChange = (key: EditableGemEffectKey, nextRaw: string) => {
        // 빈칸 허용: 입력 중일 땐 0으로 보이게
        const n = nextRaw === "" ? 0 : clampLv(Number(nextRaw));
        setGemEffectLv((prev) => ({ ...prev, [key]: n }));
    };

    const handleLvKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
    };


    // 2. 데이터 로딩
    useEffect(() => {
        if (!characterName) return;

        setLoading(true);
        Promise.all([
            fetch(`/equipment?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
            fetch(`/arkgrid?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
            fetch(`/gems?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
            fetch(`/engravings?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
            fetch(`/arkpassive?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
        ])
            .then(([eqData, arkData2, gemData, engData, passiveData]) => {
                setEquipments(Array.isArray(eqData) ? eqData : []);
                setArkGrid(arkData2 ?? null);
                setGems(gemData ?? null);
                setEngravings(engData ?? null);

                setOriginalArkPassive(passiveData ?? null);
                setSimArkPassive(passiveData ? safeClone(passiveData) : null);
            })
            .catch((err) => {
                console.error("데이터 로딩 실패:", err);
                setEquipments([]);
                setArkGrid(null);
                setGems(null);
                setEngravings(null);
                setOriginalArkPassive(null);
                setSimArkPassive(null);
            })
            .finally(() => setLoading(false));
    }, [characterName]);


    const normalizeEngravingName = (name: string) => {
        return (name || "")
            .replace(/\[[^\]]*]/g, "")
            .replace(/\([^)]*\)/g, "")
            .replace(/\s+/g, " ")
            .trim();
    };

    const getEngravingIconUrl = (name: string) => {
        const key = normalizeEngravingName(name);
        return (engravingIconMap as Record<string, string>)[key] || "";
    };


    // 4. 탭별 렌더링 함수 (CharacterCard 방식)
    const renderContent = () => {
        switch (activeTab) {
            case "info":
                return (
                    <div className="flex flex-col gap-6 p-4 text-zinc-300 min-h-screen max-w-[1200px] mx-auto">
                        <div className="flex-1 min-w-0 space-y-6">
                            {/* 왼쪽: 장비 섹션 */}
                            <section className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 items-stretch bg-[#121213] p-5 rounded-2xl border border-white/5">
                                {/* 왼쪽: 전투 장비 Section */}


                                <div className="w-full lg:w-[40%] flex flex-col shrink-0">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
                                        <div className="w-1.5 h-5 bg-blue-950 rounded-full" />
                                        <h1 className="text-base font-extrabold text-white tracking-tight uppercase">
                                            전투 장비
                                        </h1>
                                    </div>

                                    <div className="flex flex-col">
                                        {getItemsByType(["무기", "투구", "상의", "하의", "장갑", "어깨"])
                                            .sort((a, b) => a.Type === "무기" ? 1 : b.Type === "무기" ? -1 : 0)
                                            .map((item, i) => {
                                                try {
                                                    const tooltip = JSON.parse(item.Tooltip);
                                                    const quality = tooltip?.Element_001?.value?.qualityValue ?? 0;
                                                    const reinforceLevel = item.Name.match(/\+(\d+)/)?.[0] || "";

                                                    // 부위명 단순화
                                                    const TYPE_MAP: Record<string, string> = {
                                                        "무기": "무기", "투구": "머리장식", "상의": "상의", "하의": "하의", "장갑": "장갑", "어깨": "견갑"
                                                    };
                                                    const partName = TYPE_MAP[item.Type] || "장비";

                                                    // 테마 결정
                                                    const rawGrade = (item.Grade || "").trim();
                                                    const currentGrade = rawGrade.includes("에스더") ? "에스더" :
                                                        rawGrade.includes("고대") ? "고대" :
                                                            rawGrade.includes("유물") ? "유물" : "일반";
                                                    const theme = gradeStyles[currentGrade] || gradeStyles["일반"];

                                                    // 상급 재련 단계
                                                    const advMatch = cleanText(tooltip?.Element_005?.value || "").match(/\[상급\s*재련\]\s*(\d+)단계/);
                                                    const advancedReinforce = advMatch ? advMatch[1] : "0";

                                                    // 재련 옵션 생성
                                                    const REINFORCE_OPTIONS = [
                                                        ...Array.from({ length: 20 }, (_, i) => ({ label: `4티어 +${25 - i}`, value: 25 - i, tier: 4 })),
                                                        ...Array.from({ length: 17 }, (_, i) => ({ label: `일리아칸 +${25 - i}`, value: 25 - i, tier: 3 })),
                                                    ].filter(opt => opt.value >= 9);

                                                    return (
                                                        <EquipmentItem
                                                            key={item.Name}
                                                            item={item}
                                                            i={i}
                                                            theme={theme}
                                                            tooltip={tooltip}
                                                            quality={quality}
                                                            reinforceLevel={reinforceLevel}
                                                            advancedReinforce={advancedReinforce}
                                                            itemName={partName}
                                                            REINFORCE_OPTIONS={REINFORCE_OPTIONS}
                                                            setHoveredIndex={setHoveredIndex}
                                                            setHoveredData={setHoveredData}
                                                            onUpdate={onEquipmentUpdate} // 부모의 핸들러 전달
                                                        />
                                                    );
                                                } catch (e) { return null; }
                                            })}
                                    </div>
                                </div>


                                {/* [오른쪽: 악세사리 Section] */}
                                <div className="w-full lg:flex-1 flex flex-col min-w-0">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
                                        <div className="w-1.5 h-5 bg-blue-950 rounded-full" />
                                        <h1 className="text-base font-extrabold text-white tracking-tight uppercase">악세사리</h1>
                                    </div>
                                    <div className="flex flex-col">
                                        {getItemsByType(["목걸이", "귀걸이", "반지", "팔찌"])
                                            .filter((item) => {
                                                try {
                                                    const tooltip = JSON.parse(item.Tooltip);
                                                    // 팔찌거나 품질 정보가 있는 아이템만 표시
                                                    return item.Name?.includes('팔찌') || tooltip.Element_001?.value?.qualityValue !== undefined;
                                                } catch { return false; }
                                            })
                                            .map((item, i) => {
                                                const tooltip = JSON.parse(item.Tooltip);
                                                const partName = ["목걸이", "귀걸이", "반지", "팔찌"].find(p => (item.Name || "").includes(p)) || "장신구";
                                                const theme = gradeStyles[(item.Grade || "").trim()] || gradeStyles["일반"];

                                                return (
                                                    <AccessoryItem
                                                        key={`${item.Name}-${i}`}
                                                        item={item}
                                                        i={i}
                                                        accessoryStates={accessoryStates}
                                                        onAccessoryUpdate={onAccessoryUpdate}
                                                        theme={theme}
                                                        partName={partName}
                                                        isBracelet={item.Name?.includes('팔찌')}
                                                        cleanText={cleanText}
                                                        setHoveredIndex={setHoveredIndex}
                                                        setHoveredData={setHoveredData}
                                                        tooltip={tooltip}
                                                    />
                                                );
                                            })}
                                    </div>
                                </div>

                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

                                <section>
                                    <div>
                                        <ArkGridItem
                                            arkGrid={arkGrid}
                                            setArkGrid={setArkGrid}
                                            characterJob={propCharacter.CharacterClassName}
                                        />
                                    </div>
                                </section>


                                {/* [우측 박스] 젬 효과 섹션 */}
                                <section className="bg-[#121213] p-6 rounded-2xl border border-white/5 shadow-2xl flex flex-col h-full">
                                    {/* 타이틀 영역 */}
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
                                        <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                                        <h1 className="text-[15px] font-extrabold text-white tracking-tight uppercase">
                                            젬 효과
                                        </h1>
                                    </div>

                                    {/* ✅ 젬 효과 리스트 */}
                                    <div className="flex flex-col gap-4">
                                        {arkGrid?.Effects?.map((effect, i) => {
                                            const { desc, val } = parseEffectTooltipLine(effect.Tooltip);
                                            const editableKey = getEditableKey(effect.Name || "");
                                            const isEditable = Boolean(editableKey);
                                            const cleanText = effect.Tooltip
                                                .replace(/<[^>]*>?/gm, '')
                                                .replace(/\s*\+\s*$/, '');
                                            const shownLv = isEditable && editableKey ? gemEffectLv[editableKey] : effect.Level;
                                            const shownVal =
                                                isEditable && editableKey ? gemEffectValuePct(editableKey, gemEffectLv[editableKey]) : val;
                                            return (
                                                <div key={i} className="flex flex-col gap-1 px-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-zinc-100 font-bold text-[13px]">{effect.Name}</span>

                                                        {/* ✅ 여기: 추가피해/보스피해/공격력만 레벨 입력 가능 */}
                                                        {isEditable && editableKey ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">Lv.</span>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={120}
                                                                    value={gemEffectLv[editableKey]}
                                                                    onChange={(e) => handleGemEffectLvChange(editableKey, e.target.value)}
                                                                    onKeyDown={handleLvKeyDown}
                                                                    onWheel={(e) => {
                                                                        // 스크롤로 숫자 튀는거 방지(원하면 제거)
                                                                        (e.currentTarget as HTMLInputElement).blur();
                                                                    }}
                                                                    className="w-[68px] h-[22px] rounded-md bg-zinc-950/40 border border-zinc-700 text-zinc-200 text-[11px] font-black text-center outline-none focus:border-indigo-500/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                                <span className="text-[10px] text-zinc-500 font-bold">/ 120</span>
                                                            </div>
                                                        ) : (
                                                            <span className="bg-zinc-800/50 px-2 py-0.5 rounded text-zinc-400 text-[10px] font-black tracking-widest uppercase">
                                                                Lv.{shownLv}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* ✅ 바로 아래 값: 레벨 변경 즉시 반영 */}
                                                    <div className="text-[12px] text-zinc-400 font-medium leading-relaxed">
                                                        {desc}{" "}
                                                        <span className="text-[#ffd200] font-bold ml-1">{shownVal}</span>
                                                    </div>

                                                    {/* (선택) 편집 대상이면, 어떤 규칙인지 작은 힌트 */}
                                                    {isEditable && editableKey && (
                                                        <div className="text-[10px] text-zinc-500 mt-0.5">
                                                            1레벨당{" "}
                                                            {editableKey === "atk"
                                                                ? `공격력 +${GEM_EFFECT_RATE.atk.toFixed(2)}%`
                                                                : editableKey === "add"
                                                                    ? `추가 피해 +${GEM_EFFECT_RATE.add.toFixed(2)}%`
                                                                    : `보스 피해 +${GEM_EFFECT_RATE.boss.toFixed(2)}%`}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>

                            {/* ===================== 2.5) 아크 패시브 보드 ===================== */}
                            <section className="mt-10 space-y-4">
                                <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-white">
                                    <h2 className="text-xl font-bold">아크 패시브</h2>
                                </div>

                                <ArkPassiveBoard
                                    character={character}
                                    data={simArkPassive}
                                    onChangeData={setSimArkPassive}
                                    onReset={() => setSimArkPassive(originalArkPassive ? safeClone(originalArkPassive) : null)}
                                />
                            </section>

                            {/*보석*/}
                            <section className="mt-10 w-full flex flex-col items-center px-4 select-none">
                                <div className="w-full max-w-3xl flex items-center justify-between border-b border-zinc-800/50 pb-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                        <h1 className="text-base font-extrabold text-zinc-200 tracking-tight uppercase">보석</h1>
                                    </div>

                                    <div className="flex items-center gap-2.5 px-3 py-1.5 backdrop-blur-sm">
                                        <div className="ml-2 flex items-center gap-2 pl-2 border-l border-white/10">
                                            <div className="w-1 h-3 bg-rose-400 rounded-full" />
                                            <span className="text-[12px] text-[#efeff0] font-semibold leading-none">
                        기본 공격력 합: +{formatPct(totalGemAtkBonus)}
                      </span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="relative w-full max-w-2xl rounded-[40px] border border-white/5 flex items-center justify-center min-h-[280px] md:min-h-[280px] overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                                    style={{
                                        background: "radial-gradient(circle at center, #1a202c 0%, #0d1117 40%, #05070a 100%)",
                                    }}
                                >
                                    <div className="absolute inset-0 z-0 pointer-events-none rounded-[40px] overflow-hidden">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.15)_0%,_transparent_70%)] animate-pulse" />
                                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0%,_rgba(139,92,246,0.08)_15%,_transparent_30%,_rgba(56,189,248,0.08)_60%,_transparent_100%)]" />
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.4)_100%)]" />
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center gap-2 transform scale-[0.85] sm:scale-100 transition-all duration-500">
                                        <div className="flex items-center gap-12 md:gap-20 mb-1">
                                            <div className="flex gap-3">
                                                {[0, 1].map((idx) => (
                                                    <GemSlot
                                                        key={idx}
                                                        gem={gems?.Gems?.[idx]}
                                                        index={idx}
                                                        hoverIdx={jewlryHoverIdx}
                                                        hoverData={jewlryHoverData}
                                                        setHoverIdx={setJewlryHoverIdx}
                                                        setHoverData={setJewlryHoverData}
                                                        pick={gemPicks[idx]}
                                                        setPick={setPickAt}
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex gap-3">
                                                {[2, 3].map((idx) => (
                                                    <GemSlot
                                                        key={idx}
                                                        gem={gems?.Gems?.[idx]}
                                                        index={idx}
                                                        hoverIdx={jewlryHoverIdx}
                                                        hoverData={jewlryHoverData}
                                                        setHoverIdx={setJewlryHoverIdx}
                                                        setHoverData={setJewlryHoverData}
                                                        pick={gemPicks[idx]}
                                                        setPick={setPickAt}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-4 md:gap-6 -mt-1 relative">
                                            <GemSlot
                                                gem={gems?.Gems?.[4]}
                                                index={4}
                                                hoverIdx={jewlryHoverIdx}
                                                hoverData={jewlryHoverData}
                                                setHoverIdx={setJewlryHoverIdx}
                                                setHoverData={setJewlryHoverData}
                                                pick={gemPicks[4]}
                                                setPick={setPickAt}
                                            />

                                            <div className="relative">
                                                <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full scale-150 animate-pulse" />
                                                <GemSlot
                                                    gem={gems?.Gems?.[5]}
                                                    index={5}
                                                    hoverIdx={jewlryHoverIdx}
                                                    hoverData={jewlryHoverData}
                                                    setHoverIdx={setJewlryHoverIdx}
                                                    setHoverData={setJewlryHoverData}
                                                    pick={gemPicks[5]}
                                                    setPick={setPickAt}
                                                    isCenter={true}
                                                />
                                            </div>

                                            <GemSlot
                                                gem={gems?.Gems?.[6]}
                                                index={6}
                                                hoverIdx={jewlryHoverIdx}
                                                hoverData={jewlryHoverData}
                                                setHoverIdx={setJewlryHoverIdx}
                                                setHoverData={setJewlryHoverData}
                                                pick={gemPicks[6]}
                                                setPick={setPickAt}
                                            />
                                        </div>

                                        <div className="flex items-center gap-12 md:gap-20 -mt-1">
                                            <div className="flex gap-3">
                                                {[7, 8].map((idx) => (
                                                    <GemSlot
                                                        key={idx}
                                                        gem={gems?.Gems?.[idx]}
                                                        index={idx}
                                                        hoverIdx={jewlryHoverIdx}
                                                        hoverData={jewlryHoverData}
                                                        setHoverIdx={setJewlryHoverIdx}
                                                        setHoverData={setJewlryHoverData}
                                                        pick={gemPicks[idx]}
                                                        setPick={setPickAt}
                                                    />
                                                ))}
                                            </div>

                                            <div className="flex gap-3">
                                                {[9, 10].map((idx) => (
                                                    <GemSlot
                                                        key={idx}
                                                        gem={gems?.Gems?.[idx]}
                                                        index={idx}
                                                        hoverIdx={jewlryHoverIdx}
                                                        hoverData={jewlryHoverData}
                                                        setHoverIdx={setJewlryHoverIdx}
                                                        setHoverData={setJewlryHoverData}
                                                        pick={gemPicks[idx]}
                                                        setPick={setPickAt}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/*각인*/}
                            <div className="w-full max-w-[1200px] mx-auto bg-[#121213] sm:rounded-2xl border-y sm:border border-white/5 shadow-2xl p-0 sm:p-4">

                                {/* 2. 각인 섹션 컨테이너: 모바일에서 flex-col로 변경 */}
                                <div
                                    className="flex flex-col lg:flex-row gap-0 sm:gap-4 h-full w-full"
                                    onMouseLeave={() => {
                                        setEngrHoverIdx(null);
                                        setEngrHoverName(null);
                                        setEngrHoverDesc("");
                                    }}
                                >
                                    {/* [왼쪽 Section]: 활성 각인 리스트 */}
                                    <section className="w-full lg:basis-1/2 flex-1 bg-[#1c1c1e]/50 sm:rounded-xl border-b sm:border border-white/5 p-4 shadow-inner min-w-0">
                                        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
                                            <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                                            <h1 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight uppercase">
                                                활성 각인
                                            </h1>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            {(engravings?.ArkPassiveEffects ?? []).map((eng, i) => {
                                                const n = typeof eng.Level === "number" ? eng.Level : 0;
                                                const m = typeof eng.AbilityStoneLevel === "number" ? eng.AbilityStoneLevel : 0;
                                                const iconUrl = getEngravingIconUrl(eng.Name);
                                                const stoneIcon = eng.AbilityStoneIcon || FALLBACK_ABILITY_STONE_ICON;

                                                return (
                                                    <div
                                                        key={i}
                                                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer border
                            ${engrHoverIdx === i ? 'bg-white/10 border-white/10 shadow-md' : 'bg-transparent border-transparent hover:bg-white/[0.03]'}`}
                                                        /* 모바일 사용성을 위해 클릭 시에도 상태가 변경되도록 onClick 추가 가능 */
                                                        onMouseEnter={() => {
                                                            setEngrHoverIdx(i);
                                                            setEngrHoverName(eng.Name || null);
                                                            setEngrHoverDesc(eng.Description || "");
                                                        }}
                                                        onClick={() => {
                                                            setEngrHoverIdx(i);
                                                            setEngrHoverName(eng.Name || null);
                                                            setEngrHoverDesc(eng.Description || "");
                                                        }}
                                                    >
                                                        <div className="flex items-center min-w-0 gap-3">
                                                            <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full overflow-hidden bg-black/60 border border-zinc-700">
                                                                <img src={iconUrl} alt={eng.Name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex items-center gap-1 px-1 py-1 rounded-md shrink-0">
                                                                <Diamond
                                                                    size={12}
                                                                    className="text-[#f16022] fill-[#f16022]"
                                                                />
                                                                <div className="flex items-baseline gap-0.5">
                                                                    <span className="text-zinc-500 text-[9px] font-bold uppercase">X</span>
                                                                    <span className="text-white text-[14px] sm:text-[15px] font-black tabular-nums">{n}</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-[#efeff0] font-bold text-[13px] sm:text-[14px] truncate">{eng.Name}</span>
                                                        </div>

                                                        <div className="flex items-center gap-4 shrink-0">
                                                            {m > 0 && (
                                                                <div className="flex items-center gap-1">
                                                                    <img src={stoneIcon} alt="Stone" className="w-3.5 h-4.5 brightness-125" />
                                                                    <span className="text-zinc-400 text-[8px] font-bold uppercase">Lv.</span>
                                                                    <span className="text-[#00ccff] text-[13px] sm:text-[14px] font-black">{m}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>

                                    {/* [오른쪽 Section]: 상세 설명 (모바일에서는 리스트 아래에 표시) */}
                                    <section className={`w-full lg:basis-1/2 flex-1 bg-[#1c1c1e]/50 sm:rounded-xl border-b sm:border border-white/5 p-4 min-h-[120px] lg:min-h-[400px] flex flex-col min-w-0 ${!engrHoverName && 'hidden lg:flex'}`}>
                                        {engrHoverName ? (
                                            <div className="animate-in fade-in zoom-in-95 duration-200">
                                                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl shrink-0">
                                                        <img src={getEngravingIconUrl(engrHoverName)} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <div className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-0.5">각인 효과</div>
                                                        <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">{engrHoverName}</h2>
                                                    </div>
                                                </div>

                                                <div
                                                    className="text-[13px] sm:text-[14px] leading-snug text-zinc-300 bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner"
                                                    dangerouslySetInnerHTML={{ __html: engravingDescToHtml(engrHoverDesc) }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="my-auto flex flex-col items-center justify-center space-y-2 opacity-20">
                                                <div className="w-10 h-10 rounded-full border border-dashed border-white flex items-center justify-center text-lg font-bold text-white">?</div>
                                                <p className="text-xs font-medium text-white tracking-tight text-center">각인을 선택하여 상세 내용을 확인하세요</p>
                                            </div>
                                        )}
                                    </section>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "synergy":
                return <SynergyBuffTab character={character} />;

            case "result":
                return <ResultTab character={character} />;

            default:
                return null;
        }
    };

    // ===== ArkPassive 전송(디바운스) =====
    const arkSendTimerRef = useRef<number | null>(null);
    const arkSendAbortRef = useRef<AbortController | null>(null);

    const sendArkPassiveToBackend = (nextArk: any) => {
        if (!characterName) return;

        const payload = buildArkPassivePayload(characterName, nextArk);

        // (원하면) 디버그
        // console.log("ARK PASSIVE PAYLOAD", payload);

        // 이전 요청 취소
        if (arkSendAbortRef.current) arkSendAbortRef.current.abort();
        const ac = new AbortController();
        arkSendAbortRef.current = ac;

        fetch("/arkpassive/sim", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: ac.signal,
        }).catch((err) => {
            // Abort는 정상 플로우라 로그 안 찍어도 됨
            if (err?.name !== "AbortError") console.error("arkpassive 전송 실패:", err);
        });
    };

// simArkPassive가 변할 때마다 디바운스해서 전송
    useEffect(() => {
        if (!simArkPassive) return;

        if (arkSendTimerRef.current) window.clearTimeout(arkSendTimerRef.current);

        arkSendTimerRef.current = window.setTimeout(() => {
            sendArkPassiveToBackend(simArkPassive);
        }, 300); // 300ms 디바운스 (원하면 500/800 등으로)

        return () => {
            if (arkSendTimerRef.current) window.clearTimeout(arkSendTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [simArkPassive, characterName]);

    if (loading)
        return (
            <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500 w-8 h-8 mb-3" />
                <span className="text-zinc-500 text-sm font-bold">정보 동기화 중...</span>
            </div>
        );

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
