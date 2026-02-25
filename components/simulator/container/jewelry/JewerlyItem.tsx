import React, { useState, useEffect, useRef, useMemo } from 'react';
import JewelryItemTooltip from "@/components/simulator/container/jewelry/JewelryItemTooltip.tsx";
import Annihilation from "@/constants/JewelyData/Annihilation.json"; // 멸화
import Searing from "@/constants/JewelyData/Searing.json";           // 작열
import Engulfing from "@/constants/JewelyData/Engulfing.json";       // 겁화
import Prominence from "@/constants/JewelyData/Prominence.json";      // 홍염

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
interface JewelryItemProps {
    gems: any; // Simulator의 gems 상태 전달
    onJewelsUpdate: (data: { totalGemAtkBonus: number; gemSkillDamageMap: Record<string, number> }) => void;
    // 툴팁 연동용 (Simulator 상태 공유)
    hoverIdx: any;
    hoverData: any;
    setHoverIdx: (v: any) => void;
    setHoverData: (v: any) => void;
}

/* =======================
   ✅ TYPES & CONSTANTS (디자인 유지)
   ======================= */
type GemKind = "홍염" | "멸화" | "겁화" | "작열" | "광휘";
type GemPick = { kind: GemKind; level: number };

const GEM_KINDS: GemKind[] = ["홍염", "멸화", "겁화", "작열"];
const GEM_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const GEM_ICON_URL: Record<GemKind, Record<number, string>> = {
    홍염: { 1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_56.png", 2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_57.png", 3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_58.png", 4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_59.png", 5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_60.png", 6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_61.png", 7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_62.png", 8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_63.png", 9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_64.png", 10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_65.png" },
    멸화: { 1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_46.png", 2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_47.png", 3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_48.png", 4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_49.png", 5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_50.png", 6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_51.png", 7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_52.png", 8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_53.png", 9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_54.png", 10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_9_55.png" },
    겁화: { 1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_96.png", 2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_97.png", 3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_98.png", 4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_99.png", 5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_100.png", 6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_101.png", 7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_102.png", 8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_103.png", 9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_104.png", 10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_105.png" },
    작열: { 1: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_106.png", 2: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_107.png", 3: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_108.png", 4: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_109.png", 5: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_110.png", 6: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_111.png", 7: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_112.png", 8: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_113.png", 9: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_114.png", 10: "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_12_115.png" },
};

const T4_ATK_BONUS_BY_LEVEL: Record<number, number> = {
    1: 0.0, 2: 0.05, 3: 0.1, 4: 0.2, 5: 0.3, 6: 0.45, 7: 0.6, 8: 0.8, 9: 1.0, 10: 1.2,
};

const GEM_DAMAGE_TABLE: Record<string, Record<number, number>> = {
    "멸화": { 1: 3, 2: 6, 3: 9, 4: 12, 5: 15, 6: 18, 7: 21, 8: 24, 9: 30, 10: 40 },
    "겁화": { 1: 8, 2: 12, 3: 16, 4: 20, 5: 24, 6: 28, 7: 32, 8: 36, 9: 40, 10: 44 },
    "홍염": { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10, 6: 12, 7: 14, 8: 16, 9: 18, 10: 20 },
    "작열": { 1: 6, 2: 8, 3: 10, 4: 12, 5: 14, 6: 16, 7: 18, 8: 20, 9: 22, 10: 24 }
};

const GEM_DATA_MAP: Record<string, any[]> = {
    "멸화": Annihilation,
    "작열": Searing,
    "겁화": Engulfing,
    "홍염": Prominence
};

/* =======================
   ✅ UTILS (헬퍼 함수)
   ======================= */
function inferGemKind(gem: any): GemKind | null {
    if (!gem) return null;
    const directText = String(gem?.Name || "");
    let tooltipText = "";
    try {
        const t = typeof gem?.Tooltip === "string" ? JSON.parse(gem.Tooltip) : gem?.Tooltip;
        tooltipText = typeof t === "string" ? t : JSON.stringify(t);
    } catch { tooltipText = String(gem?.Tooltip || ""); }
    const hay = (directText + " " + tooltipText).toLowerCase();
    if (hay.includes("광휘")) return "광휘";
    if (hay.includes("겁화")) return "겁화";
    if (hay.includes("작열")) return "작열";
    if (hay.includes("멸화")) return "멸화";
    if (hay.includes("홍염")) return "홍염";
    return null;
}

const extractGemEffect = (tooltipStr: string) => {
    try {
        const tooltipData = JSON.parse(tooltipStr);
        const elements = Object.values(tooltipData) as any[];
        const effectSection = elements.find(el => el?.type === "ItemPartBox" && (el?.value?.Element_000?.includes("효과")));
        if (!effectSection) return { name: "", type: "" };
        const rawEffect = effectSection?.value?.Element_001 || "";
        const cleanText = rawEffect.replace(/<[^>]*>?/gm, '').replace(/<BR>/gi, ' ').trim();
        const skillMatch = cleanText.match(/\]\s*(.*?)\s*(피해|재사용)/);
        const name = skillMatch ? skillMatch[1].trim() : "";
        const type = cleanText.includes("피해") ? "damage" : "cdr";
        return { name, type };
    } catch { return { name: "", type: "" }; }
};

/* =======================
   ✅ SUB-COMPONENT: GemSlot
   ======================= */
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

    const currentDisplayData = useMemo(() => {
        if (pick) {
            // JSON 데이터에서 해당 레벨의 정보를 찾음
            const baseData = GEM_DATA_MAP[pick.kind];
            const levelInfo = baseData?.find((d: any) => d.level === pick.level);

            return {
                isPick: true,
                kind: pick.kind,
                level: pick.level,
                effect: levelInfo?.effect_1 || "",
                // 기존 gem의 스킬명 정보를 유지하기 위해 원본 gem 전달
                originGem: gem
            };
        }
        return gem ? { isPick: false, originGem: gem } : null;
    }, [pick, gem])

    return (
        <div
            ref={wrapRef}
            className="relative group flex flex-col items-center"
            onMouseEnter={() => {
                setHoverIdx(index);
                setHoverData(currentDisplayData);
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
                <div className="absolute left-[80%] top-0 z-[9999] pl-4 pt-2 pointer-events-none"> {/* ✅ pointer-events-none 적용 */}
                    <div className="animate-in fade-in zoom-in-95 duration-150">
                        <JewelryItemTooltip data={hoverData} />
                    </div>
                </div>
            )}

            {/* ✅ 드롭다운 */}
            {open && (
                <div
                    className="absolute z-[99999] mt-2 left-1/2 -translate-x-1/2 w-[210px] rounded-2xl border border-white/10 bg-[#0b0f14]/95 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.65)] overflow-hidden pointer-events-auto"
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

                    <div className="max-h-[240px] overflow-auto
    [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-white/10
    [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-white/20
    transition-colors"
                    >
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

/* =======================
   ✅ MAIN: JewelryItem
   ======================= */
const JewelryItem = ({ gems, onJewelsUpdate, hoverIdx, hoverData, setHoverIdx,setHoverData }: JewelryItemProps) => {
    const [gemPicks, setGemPicks] = useState<Record<number, GemPick | null>>(() => {
        const init: Record<number, GemPick | null> = {};
        for (let i = 0; i <= 10; i++) init[i] = null;
        return init;
    });

    const setPickAt = (i: number, p: GemPick | null) => setGemPicks(prev => ({ ...prev, [i]: p }));

    const handleReset = () => {
        const resetData: Record<number, GemPick | null> = {};
        for (let i = 0; i <= 10; i++) resetData[i] = null;
        setGemPicks(resetData);
    };

    // 계산 로직 (GemPicks 우선 적용)
    const { totalGemAtkBonus, gemSkillDamageMap } = useMemo(() => {
        let sum = 0;
        const skillMap: Record<string, number> = {};

        for (let idx = 0; idx <= 10; idx++) {
            const pick = gemPicks[idx];
            const equipped = gems?.Gems?.[idx];

            const currentKind = pick ? pick.kind : (equipped ? inferGemKind(equipped) : null);
            const currentLevel = pick ? pick.level : (equipped ? Number(equipped.Level) : 0);

            if (!currentKind || !currentLevel) continue;

            // 1. 공격력 보너스 (T4)
            if (["겁화", "작열", "광휘"].includes(currentKind)) {
                sum += T4_ATK_BONUS_BY_LEVEL[currentLevel] ?? 0;
            }

            // 2. 스킬 데미지 증가 (추출된 스킬명이 있을 경우)
            const { name: skillName, type: effectType } = extractGemEffect(equipped?.Tooltip || "");
            const isDamageGem = currentKind === "멸화" || currentKind === "겁화" || (currentKind === "광휘" && effectType === "damage");

            if (skillName && isDamageGem) {
                const group = (currentKind === "멸화") ? "멸화" : "겁화";
                const dmgValue = GEM_DAMAGE_TABLE[group]?.[currentLevel] || 0;
                skillMap[skillName] = Math.max(skillMap[skillName] || 0, dmgValue);
            }
        }
        return { totalGemAtkBonus: sum, gemSkillDamageMap: skillMap };
    }, [gemPicks, gems]);

    // 값 변경 시 부모 Simulator로 보고
    useEffect(() => {
        // totalGemAtkBonus: double (예: 1.25)
        // gemSkillDamageMap: Map<String, Integer> (예: {"앱소버": 40})
        onJewelsUpdate({
            totalGemAtkBonus: Number(totalGemAtkBonus.toFixed(2)), // 소수점 정리
            gemSkillDamageMap
        });
    }, [totalGemAtkBonus, gemSkillDamageMap, onJewelsUpdate]);

    const renderSlot = (idx: number, isCenter = false) => (
        <GemSlot
            key={idx}
            index={idx}
            gem={gems?.Gems?.[idx]}
            pick={gemPicks[idx]}
            setPick={setPickAt}
            hoverIdx={hoverIdx}
            hoverData={hoverData}
            setHoverIdx={setHoverIdx}
            setHoverData={setHoverData}
            isCenter={isCenter}
        />
    );

    return (
        <section className="mt-10 w-full flex flex-col items-center px-4 select-none">
            {/* 헤더 부분 */}
            <div className="w-full max-w-3xl flex items-center justify-between border-b border-zinc-800/50 pb-2 mb-4">
                {/* 왼쪽: 타이틀 그룹 */}
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                    <h1 className="text-base font-extrabold text-zinc-200 tracking-tight uppercase">보석</h1>
                </div>

                {/* 오른쪽: 버튼 + 정보 그룹 */}
                <div className="flex items-center gap-4">
                    {/* 초기화 버튼 (공격력 합 왼쪽 옆) */}
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-[11px] font-medium group"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12" height="12"
                            viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round"
                            className="group-hover:rotate-[-180deg] transition-transform duration-500"
                        >
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                            <path d="M3 3v5h5"/>
                        </svg>
                        초기화
                    </button>

                    {/* 공격력 정보 */}
                    <div className="flex items-center gap-2.5 px-3 py-1.5 backdrop-blur-sm border-l border-white/10">
                        <div className="w-1.5 h-5 bg-purple-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                        <span className="text-[12px] text-[#efeff0] font-semibold">
                기본 공격력 합: +{totalGemAtkBonus.toFixed(2)}%
            </span>
                    </div>
                </div>
            </div>


            {/* 메인 보석 판넬 */}
            <div className="relative w-full max-w-2xl rounded-[40px] border border-white/5 flex items-center justify-center min-h-[280px] overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                 style={{ background: "radial-gradient(circle at center, #1a202c 0%, #0d1117 40%, #05070a 100%)" }}>


                <div className="absolute inset-0 pointer-events-none rounded-[40px] overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.15)_0%,_transparent_70%)] animate-pulse" />
                </div>


                <div className="relative z-10 flex flex-col items-center gap-2 transform scale-[0.85] sm:scale-100 transition-all duration-500">
                    <div className="flex items-center gap-12 md:gap-20 mb-1">
                        <div className="flex gap-3">{[0, 1].map(i => renderSlot(i))}</div>
                        <div className="flex gap-3">{[2, 3].map(i => renderSlot(i))}</div>
                    </div>

                    <div className="flex items-center justify-center gap-4 md:gap-6 -mt-1 relative">
                        {renderSlot(4)}
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full scale-150 animate-pulse" />
                            {renderSlot(5, true)}
                        </div>
                        {renderSlot(6)}
                    </div>

                    <div className="flex items-center gap-12 md:gap-20 -mt-1">
                        <div className="flex gap-3">{[7, 8].map(i => renderSlot(i))}</div>
                        <div className="flex gap-3">{[9, 10].map(i => renderSlot(i))}</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default JewelryItem;