import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Copy, Check, Clock, ShieldAlert, Zap, Target, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JewelryTooltip from '@/components/profile/Tooltip/JewelryTooltip';

/* ================= 스타일 및 타입 정의 ================= */
const gradeStyles: any = {
    '일반': { bg: 'from-zinc-800 to-zinc-950', border: 'border-white/10', text: 'text-white' },
    '고급': { bg: 'from-[#1a2e1a] to-[#0a0f0a]', border: 'border-[#48c948]/30', text: 'text-[#48c948]' },
    '희귀': { bg: 'from-[#1a2a3e] to-[#0a0d12]', border: 'border-[#00b0fa]/30', text: 'text-[#00b0fa]' },
    '영웅': { bg: 'from-[#2e1a3e] to-[#120a1a]', border: 'border-[#ce43fb]/30', text: 'text-[#ce43fb]' },
    '전설': { bg: 'from-[#41321a] to-[#1a120a]', border: 'border-[#f99200]/40', text: 'text-[#f99200]' },
    '유물': { bg: 'from-[#351a0a] to-[#0a0a0a]', border: 'border-[#fa5d00]/50', text: 'text-[#fa5d00]' },
    '고대': { bg: 'from-[#3d3325] to-[#0f0f10]', border: 'border-[#e9d2a6]/40', text: 'text-[#e3c279]' },
    '에스더': { bg: 'from-[#0d2e2e] to-[#050505]', border: 'border-[#2edbd3]/60', text: 'text-[#2edbd3]' }
};

const TRANSFORMATION_KEYWORDS: Record<string, string> = {
    '블래스터': '[포격 모드]', '데모닉': '[악마 스킬]', '스카우터': '[싱크 스킬]', '환수사': '[둔갑 스킬]', '가디언나이트': '[화신 스킬]'
};

/* ================= 그리드 레이아웃 최적화 ================= */
// 1. Mobile: 스킬명과 젬 위주로 배치 (간결하게)
// 2. SM/MD: 트라이포드와 룬 영역 확장
// 3. LG (PC): 각 요소의 폭을 고정값(px)과 비율(fr)로 적절히 혼합하여 가독성 극대화
const SKILL_GRID = "grid-cols-[1.5fr_100px_40px_1fr] " +               // Mobile
    "sm:grid-cols-[2fr_120px_100px_120px] " +         // Tablet
    "lg:grid-cols-[minmax(200px,1.5fr)_240px_100px_minmax(120px,1fr)]"; // PC

const getModalPosition = (anchorRect: DOMRect) => {
    const top = anchorRect.top + anchorRect.height + window.scrollY;
    let left = anchorRect.left + window.scrollX + anchorRect.width / 2;
    const modalWidth = 256;
    const padding = 12;

    if (left - modalWidth / 2 < padding) left = modalWidth / 2 + padding;
    if (left + modalWidth / 2 > window.innerWidth - padding) left = window.innerWidth - modalWidth / 2 - padding;

    return { top, left };
};

const cleanHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<br[^>]*>/gi, "\n").replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
};

/* ================= 텍스트 하이라이트 함수 ================= */
const SkillHighlightText = ({ text }: { text: string }) => {
    if (!text) return null;
    const parts = text.split(/([\d,.]*\d)(?=(?:\s?의\s?|\s?)피해)|([\d,.]*\d\s?초)|([\d,.]*\d\s?m|[\d,.]*\d\s?회)|(이동|휘두름|돌진|도약|점프|발사)/g);
    return (
        <>{parts.map((part, i) => {
            if (!part) return null;
            const nextText = parts.slice(i + 1).join("");
            if (/^[\d,.]+$/.test(part) && (nextText.trim().startsWith("의 피해") || nextText.trim().startsWith("피해"))) return <span key={i} className="text-red-500 font-bold">{part}</span>;
            if (/[\d,.]+\s?(?:초|m|회)/.test(part)) return <span key={i} className="text-emerald-400 font-bold">{part}</span>;
            if (/(이동|휘두름|돌진|도약|점프|발사)/.test(part)) return <span key={i} className="text-purple-400 font-bold">{part}</span>;
            return <span key={i}>{part}</span>;
        })}</>
    );
};

const TripodHighlightText = ({ text }: { text: string }) => {
    if (!text) return null;
    const parts = text.split(/(\[상\]|\[중\]|\[하\])|([\d,.]*\d\s?%|[\d,.]*\d\s?(?:m|회|초)|[\d,.]*\d)/g);
    return (
        <>{parts.map((part, i) => {
            if (!part) return null;
            const nextText = parts.slice(i + 1).join("");
            if (/\[상\]|\[중\]|\[하\]/.test(part) && nextText.includes("증가")) return <span key={i} className="text-emerald-400 font-bold">{part}</span>;
            if (!/\d/.test(part) && !/\[상\]|\[중\]|\[하\]/.test(part)) return <span key={i}>{part}</span>;
            const prevText = parts.slice(0, i).join("");
            if ((part.includes("%") || part.includes("초")) && nextText.trim().startsWith("감소")) return <span key={i} className="text-red-500 font-bold">{part}</span>;
            if (part.includes("%") && nextText.trim().startsWith("증가")) return <span key={i} className="text-emerald-400 font-bold">{part}</span>;
            if (nextText.includes("피해") || (part.includes("%") && (nextText.includes("피해") || prevText.includes("피해")))) return <span key={i} className="text-red-500 font-bold">{part}</span>;
            if (/[m회초]/.test(part)) return <span key={i} className="text-emerald-400 font-bold">{part}</span>;
            return <span key={i}>{part}</span>;
        })}</>
    );
};

/* ================= 하위 컴포넌트 ================= */
const DetailModal = ({ skillName = "", skillType = "", ManaCost = "", cooldown = "", specs = [], description = "", anchorRect, isTripodOrRune = false }: any) => {
    if (!anchorRect) return null;
    const { top, left } = getModalPosition(anchorRect);
    const cooldownValue = typeof cooldown === 'string' ? cooldown.replace("재사용 대기시간", "").trim() : "";

    return createPortal(
        <div style={{ position: 'absolute', top: top, left: left, zIndex: 10000, pointerEvents: 'none' }}>
            <motion.div
                initial={{ opacity: 0, y: -5, x: "-50%", scale: 0.98 }}
                animate={{ opacity: 1, y: 12, x: "-50%", scale: 1 }}
                exit={{ opacity: 0, y: -5, x: "-50%", scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="w-64 bg-[#0c0c0e]/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl"
            >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0c0c0e]/50 border-l border-t border-white/10 rotate-45" />
                <div className="bg-white/5 p-3 border-b border-white/5 relative z-10">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                            <h5 className="text-[13px] sm:text-[14px] font-bold text-white leading-tight break-keep">{skillName}</h5>
                            {cooldownValue && (
                                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-400 font-medium">
                                    <Clock size={11} className="shrink-0" />
                                    <span>{cooldownValue}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                            {skillType && <span className="text-[9px] sm:text-[10px] font-medium text-zinc-500">[{skillType}]</span>}
                            {ManaCost && <span className="text-[9px] sm:text-[10px] font-bold text-sky-400 whitespace-nowrap">{ManaCost}</span>}
                        </div>
                    </div>
                </div>
                {specs.length > 0 && (
                    <div className="p-3 py-2 space-y-1 relative z-10">
                        {specs.map((spec: string, idx: number) => {
                            const [label, value] = spec.split(' : ');
                            return (
                                <div key={idx} className="flex justify-between text-[11px] sm:text-[12px]">
                                    <span className="text-zinc-400">{label}</span>
                                    <span className="text-cyan-100 font-semibold">{value || spec}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
                {description && (
                    <div className="p-3 pt-2 border-t border-white/5 bg-black/20 relative z-10">
                        <p className="text-[10px] sm:text-[11px] text-zinc-300 leading-normal break-keep">
                            {isTripodOrRune ? <TripodHighlightText text={description} /> : <SkillHighlightText text={description} />}
                        </p>
                    </div>
                )}
            </motion.div>
        </div>,
        document.body
    );
};

const IconWithModal = ({ children, modalData, active, onToggle, isTripodOrRune = false }: any) => {
    const [rect, setRect] = useState<DOMRect | null>(null);
    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        setRect(e.currentTarget.getBoundingClientRect());
        onToggle(!active);
    };
    return (
        <div className="relative flex items-center justify-center cursor-help"
             onMouseEnter={(e) => { setRect(e.currentTarget.getBoundingClientRect()); onToggle(true); }}
             onMouseLeave={() => onToggle(false)}
             onClick={handleInteraction}>
            <div className="transition-transform hover:scale-110 active:scale-95 flex items-center justify-center">{children}</div>
            <AnimatePresence>{active && modalData && <DetailModal {...modalData} anchorRect={rect} isTripodOrRune={isTripodOrRune} />}</AnimatePresence>
        </div>
    );
};
/* ================= 젬 아이템 컴포넌트 (스크롤 추적 방지) ================= */
const GemItem = ({ gem }: { gem: any }) => {
    const [isHover, setIsHover] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);

    const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
        setRect(e.currentTarget.getBoundingClientRect());
        setIsHover(!isHover);
    };

    return (
        <div
            className="relative flex flex-col items-center gap-0.5"
            onMouseEnter={(e) => {
                setRect(e.currentTarget.getBoundingClientRect());
                setIsHover(true);
            }}
            onMouseLeave={() => setIsHover(false)}
            onClick={handleInteraction}
        >
            <div className="relative group/gem cursor-help transition-transform hover:scale-110 active:scale-90">
                <img src={gem.Icon} className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]" alt="gem" />
                <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-black text-[8px] sm:text-[9px] px-1 rounded border border-white/10 font-black text-zinc-200">
                    {gem.Level}
                </div>
            </div>

            {isHover && gem.originalData && rect && createPortal(
                <div
                    style={{
                        // 1. absolute로 변경하여 문서 흐름에 고정
                        position: 'absolute',
                        // 2. 현재 뷰포트 위치(rect.bottom)에 스크롤 양(window.scrollY)을 더함
                        top: rect.bottom + window.scrollY + 8,
                        // 3. 가로 위치도 스크롤 양(window.scrollX)을 고려하여 계산
                        left: Math.max(16, Math.min(window.innerWidth - 296, rect.left + window.scrollX + (rect.width / 2) - 150)),
                        zIndex: 10000,
                        pointerEvents: 'none'
                    }}
                >
                    <div className="w-[280px] scale-[0.85] sm:scale-100 origin-top">
                        <JewelryTooltip gemData={gem.originalData} />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
/* ================= 스킬 로우 컴포넌트 ================= */
const SkillRow = ({ skill, matchedGems, isTrans }: { skill: any, matchedGems: any[], isTrans?: boolean }) => {
    const [hoverKey, setHoverKey] = useState<string | null>(null);

    const skillDetail = useMemo(() => {
        try {
            const sTooltip = JSON.parse(skill.Tooltip || "{}");
            let sType = "", sCooldown = "", sDesc = "", sMana = "";
            const specLines: string[] = [];
            const addedLines = new Set<string>();
            let tripods: any[] = [];

            Object.values(sTooltip).forEach((el: any) => {
                if (el?.type === "CommonSkillTitle") {
                    sType = cleanHtml(el.value.name);
                    sCooldown = cleanHtml(el.value.leftText);
                } else if (el?.type === "SingleTextBox" || el?.type === "MultiTextBox") {
                    const rawText = typeof el.value === 'string' ? el.value : (el.value?.content || "");
                    const text = cleanHtml(rawText);
                    if (text.includes("마나") && text.includes("소모")) {
                        const manaPart = text.split('|')[0].trim();
                        if (manaPart && !sMana) sMana = manaPart;
                    }
                    text.split('\n').forEach(line => {
                        const l = line.trim();
                        if (!l || l === "PvE" || l.includes("마나")) return;
                        const keywords = ["공격 타입 :", "무력화 :", "부위 파괴 :", "슈퍼아머 :"];
                        if (keywords.some(k => l.includes(k)) && !addedLines.has(l)) {
                            specLines.push(l);
                            addedLines.add(l);
                        } else if (l.includes("피해를") && l.length > 15 && !sDesc) {
                            sDesc = l;
                        }
                    });
                } else if (el?.type === "TripodSkillCustom") {
                    tripods = Object.values(el.value).map((tp: any) => ({
                        name: cleanHtml(tp.name),
                        desc: cleanHtml(tp.desc),
                        icon: tp.slotData?.iconPath
                    })).filter(tp => tp.name);
                }
            });
            return { skillName: skill.Name, skillType: sType, ManaCost: sMana, cooldown: sCooldown, specs: specLines, description: sDesc, tripods };
        } catch { return { skillName: skill.Name, skillType: "", ManaCost: "", cooldown: "", specs: [], description: "", tripods: [] }; }
    }, [skill]);

    const runeDetail = useMemo(() => {
        if (!skill.Rune) return null;
        try {
            const rTooltip = JSON.parse(skill.Rune.Tooltip || "{}");
            let rDesc = "";
            if (rTooltip.Element_003?.value?.Element_001) rDesc = cleanHtml(rTooltip.Element_003.value.Element_001);
            else if (rTooltip.Element_003?.value) rDesc = cleanHtml(rTooltip.Element_003.value);
            return { skillName: skill.Rune.Name, skillType: `${skill.Rune.Grade} 룬`, cooldown: "", specs: [], description: rDesc };
        } catch { return { skillName: skill.Rune.Name, skillType: "스킬 룬", cooldown: "", specs: [], description: "" }; }
    }, [skill.Rune]);

    const rStyle = gradeStyles[skill.Rune?.Grade] || gradeStyles['일반'];

    return (
        <motion.div layout className={`group relative grid ${SKILL_GRID} gap-1 sm:gap-4 px-3 sm:px-6 py-3 items-center border-b border-white/[0.03] transition-all hover:bg-white/[0.03] ${isTrans ? 'bg-purple-500/[0.02]' : ''}`}>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <IconWithModal active={hoverKey === 'skill'} onToggle={(v: boolean) => setHoverKey(v ? 'skill' : null)} modalData={skillDetail} isTripodOrRune={false}>
                    <img src={skill.Icon} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border shadow-lg ${isTrans ? 'border-purple-500/40' : 'border-zinc-800'}`} alt="" />
                </IconWithModal>
                <div className="flex flex-col min-w-0">
                    <h4 className={`text-[12px] sm:text-[14px] font-bold truncate ${isTrans ? 'text-purple-200' : 'text-zinc-100'}`}>{skill.Name}</h4>
                    <span className="text-[9px] font-bold text-amber-500/80 sm:hidden">{skill.Level}레벨</span>
                    <div className="hidden sm:block font-black text-[12px] sm:text-xs tracking-tighter text-amber-400">{skill.Level}레벨</div>
                </div>
            </div>


            <div className="flex justify-center gap-1 sm:gap-2">
                {skillDetail.tripods.map((tp, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <IconWithModal
                            active={hoverKey === `tp-${i}`}
                            onToggle={(v: boolean) => setHoverKey(v ? `tp-${i}` : null)}
                            modalData={{ skillName: tp.name, description: tp.desc, skillType: "트라이포드", cooldown: "", specs: [] }}
                            isTripodOrRune={true}
                        >
                            <img src={tp.icon} className="w-7 h-7 sm:w-9 sm:h-9 object-contain" alt="" />
                        </IconWithModal>
                        <span className="hidden sm:block text-[10px] sm:text-[11px] font-bold text-zinc-400 line-clamp-1 w-14 text-center">{tp.name}</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-center">
                {skill.Rune ? (
                    <div className="flex flex-col items-center gap-1">
                        <IconWithModal
                            active={hoverKey === 'rune'}
                            onToggle={(v) => setHoverKey(v ? 'rune' : null)}
                            modalData={runeDetail}
                            isTripodOrRune={true}
                        >
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg p-0.5 shadow-inner brightness-110 ${rStyle.bg}`}>
                                <img src={skill.Rune.Icon} className="w-full h-full object-contain" alt="" />
                            </div>
                        </IconWithModal>
                        <span className={`hidden sm:block text-[9px] sm:text-[11px] font-bold ${rStyle.text}`}>{skill.Rune.Name}</span>
                    </div>
                ) : <span className="text-zinc-800 text-xs">—</span>}
            </div>

            <div className="flex justify-end gap-1 sm:gap-1.5">
                {matchedGems.map((gem, i) => <GemItem key={i} gem={gem} />)}
            </div>
        </motion.div>
    );
};

/* ================= 메인 SkillTab 컴포넌트 ================= */
export const SkillTab = ({ character }: { character: any }) => {
    const [normalSkills, setNormalSkills] = useState<any[]>([]);
    const [gems, setGems] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (!character?.CharacterName) return;
        setLoading(true);
        Promise.all([
            fetch(`/combat-skills?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/gems?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json())
        ]).then(([skillJson, gemJson]) => {
            const className = character.CharacterClassName;
            const keyword = TRANSFORMATION_KEYWORDS[className];
            const filtered = skillJson.filter((s: any) => s.SkillType !== 100 && s.SkillType !== 1);
            const trans = filtered.filter((s: any) => keyword && s.Tooltip?.includes(keyword));
            const normal = filtered.filter((s: any) => s.Level > 1 && !trans.some((ts: any) => ts.Name === s.Name));
            setNormalSkills(normal.sort((a: any, b: any) => b.Level - a.Level));
            setGems(gemJson);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, [character]);

    const summary = useMemo(() => {
        let counter = 0, stagger = 0, destruction = 0;
        normalSkills.forEach(s => {
            const tooltip = s.Tooltip || "";
            if (tooltip.includes("카운터 : 가능") || tooltip.includes("카운터 : Yes")) counter++;
            if (tooltip.includes("무력화 :")) stagger++;
            if (tooltip.includes("부위 파괴 :")) destruction++;
        });
        return { counter, stagger, destruction };
    }, [normalSkills]);

    const handleCopyCode = async () => {
        try {
            const res = await fetch(`/skillcode?name=${encodeURIComponent(character.CharacterName)}`);
            const code = await res.text();
            await navigator.clipboard.writeText(code.trim());
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-4" />
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Loading...</span>
        </div>
    );

    return (
        <section className="mt-4 pb-20 px-0 sm:px-2">
            <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 mb-4 px-4 sm:px-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Badge icon={<Zap size={10} />} color="purple" label="카운터" count={summary.counter} />
                    <Badge icon={<ShieldAlert size={10} />} color="amber" label="무력화" count={summary.stagger} />
                    <Badge icon={<Target size={10} />} color="orange" label="파괴" count={summary.destruction} />
                </div>

                <button
                    onClick={handleCopyCode}
                    className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl border transition-all h-9 sm:h-10 shadow-lg ${copySuccess ? 'border-green-500/40 bg-green-500/10 text-green-400' : 'border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:text-white'}`}
                >
                    {copySuccess ? <Check size={14} /> : <Copy size={14} />}
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">{copySuccess ? '복사 완료!' : '스킬 코드'}</span>
                </button>
            </div>

            <div className="bg-[#0d0d0f] sm:rounded-2xl border-y sm:border border-white/5 shadow-2xl overflow-hidden relative">
                <div className="overflow-x-auto scrollbar-hide">
                    <div className="min-w-full sm:min-w-[600px] flex flex-col">
                        <div className={`grid ${SKILL_GRID} gap-1 sm:gap-4 px-4 sm:px-6 py-4 bg-[#111113] border-b border-white/5 text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase items-center`}>
                            <div>스킬</div><div className="text-center">트라이포드</div><div className="text-center">룬</div><div className="text-right">젬</div>
                        </div>
                        {normalSkills.map(s => {
                            const matched = gems?.Effects?.Skills?.filter((gs: any) => gs.Name === s.Name) || [];
                            const enhanced = matched.map((mg: any) => {
                                const original = gems.Gems.find((g: any) => g.Slot === mg.GemSlot);
                                return { ...mg, Icon: original?.Icon, Level: original?.Level, originalData: original };
                            });
                            return <SkillRow key={s.Name} skill={s} matchedGems={enhanced} />;
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

const Badge = ({ icon, color, label, count }: any) => (
    <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
        <span className={`text-${color}-400`}>{icon}</span>
        <span className={`text-[10px] sm:text-[11px] font-black text-${color}-200 whitespace-nowrap`}>{label} {count}</span>
    </div>
);