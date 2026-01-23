import React, { useEffect, useState } from 'react';
import { Loader2, Clock, Zap, Sword, Timer, ShieldAlert } from 'lucide-react';

// --- 스킬 특성 요약 데이터 추출 함수 ---
const getSkillStats = (skills: any[]) => {
    const stats = { counter: 0, stagger: 0, destruction: 0 };
    skills.forEach(skill => {
        const tooltipStr = skill.Tooltip || "";
        if (tooltipStr.includes("카운터 : 가능") || tooltipStr.includes("카운터 가능")) stats.counter++;
        if (tooltipStr.includes("무력화 :")) stats.stagger++;
        if (tooltipStr.includes("부위 파괴 : 레벨")) stats.destruction++;
    });
    return stats;
};

// --- 상단 통계 바 컴포넌트 (아이콘 없이 심플한 디자인) ---
const SkillStatsBar = ({ skills }: { skills: any[] }) => {
    const { counter, stagger, destruction } = getSkillStats(skills);

    const itemClass = "flex items-baseline gap-2 pr-6 border-r border-white/5 last:border-0 last:pr-0";
    const labelClass = "text-[18px] text-zinc-400 font-bold uppercase tracking-wider";
    const valueClass = "text-lg font-black tracking-tighter";

    return (
        <div className="flex items-center justify-center gap-6 mb-8 px-4 py-2">
            <div className="flex items-center gap-8 px-8 py-3 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                <div className={itemClass}>
                    <span className={labelClass}>카운터</span>
                    <span className={valueClass}>{counter}</span>
                </div>
                <div className={itemClass}>
                    <span className={labelClass}>무력화</span>
                    <span className={valueClass}>{stagger}</span>
                </div>
                <div className={itemClass}>
                    <span className={labelClass}>부위 파괴</span>
                    <span className={valueClass}>{destruction}</span>
                </div>
            </div>
        </div>
    );
};

// 내부에서만 사용하는 헬퍼 컴포넌트
const SkillCard = ({ skill }: { skill: any }) => {
    const cleanHtml = (html: string) => {
        if (!html) return "";
        return html
            .replace(/<br[^>]*>/gi, "\n")
            .replace(/<[^>]*>?/gm, "")
            .replace(/&nbsp;/g, " ")
            .trim();
    };

    const sTooltip = JSON.parse(skill.Tooltip || "{}");
    let cooldown = "";
    let description = "";
    let gemEffects: { type: 'damage' | 'cooldown'; value: string; fullText: string }[] = [];
    let runeEffect = "";

    // 1. 스킬 툴팁 데이터 순회 (재사용 대기시간, 설명, 보석, 룬 통합 추출)
    Object.entries(sTooltip).forEach(([key, el]: [string, any]) => {
        const val = el.value;
        if (!val) return;

        // [A] 재사용 대기시간 추출
        if (el.type === "CommonSkillTitle") {
            cooldown = cleanHtml(val.leftText);
        }

        // [B] 보석 및 룬 상세 효과 추출 (ItemPartBox)
        if (el.type === "ItemPartBox") {
            const title = val.Element_000 || "";
            const content = val.Element_001 || "";

            if (title.includes("보석")) {
                const rawEffects = content.split('<BR>');
                rawEffects.forEach((effStr: string) => {
                    const text = cleanHtml(effStr);
                    if (!text) return;
                    const match = text.match(/(\d+(?:\.\d+)?%)/);
                    const percentValue = match ? match[1] : "";
                    if (text.includes("피해") || text.includes("증가")) {
                        gemEffects.push({ type: 'damage', value: percentValue, fullText: text });
                    } else if (text.includes("대기시간") || text.includes("감소")) {
                        gemEffects.push({ type: 'cooldown', value: percentValue, fullText: text });
                    }
                });
            }

            // 룬 효과 추출 (룬이 장착된 경우)
            if (title.includes("룬")) {
                runeEffect = cleanHtml(content);
            }
        }

        // [C] 스킬 설명 추출
        if (typeof val === 'string' && val.includes("피해를")) {
            if (!description) description = cleanHtml(val.split('<BR>')[0]);
        }
    });

    const selectedTripods = skill.Tripods?.filter((t: any) => t.IsSelected) || [];

    return (
        <div className="group relative px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] transition-all duration-200 flex items-center gap-3 w-full z-10 hover:z-[100] hover:border-purple-500/40 hover:bg-white/[0.06]">

            {/* 1. 스킬 기본 정보 */}
            <div className="flex items-center gap-4 w-[240px] shrink-0 min-w-0">
                <div className="relative shrink-0">
                    <img src={skill.Icon} className="w-14 h-14 rounded-xl border-2 border-white/20 shadow-lg" alt="" />
                    <div className="absolute -bottom-1 -right-1 bg-zinc-950 px-2 py-0.5 rounded text-[11px] font-black border border-white/30 text-white shadow-md">
                        {skill.Level}
                    </div>
                </div>
                <div className="min-w-0">
                    <h4 className="text-[17px] font-bold truncate tracking-tight text-zinc-100">{skill.Name}</h4>
                    {cooldown && (
                        <div className="flex items-center gap-1 mt-1 text-zinc-400">
                            <Clock size={12} />
                            <span className="text-[12px] font-medium tracking-tighter">{cooldown.replace("재사용 대기시간 ","")}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. 트라이포드 정보 */}
            <div className="flex-1 flex gap-2 min-w-0 justify-center">
                {selectedTripods.map((tp: any, ti: number) => (
                    <div key={ti} className="flex flex-col items-center gap-1 w-[85px] shrink-0">
                        <div className="p-0.5 rounded-lg bg-purple-500/10 border border-purple-500/30">
                            <img src={tp.Icon} className="w-8 h-8 shrink-0" alt="" />
                        </div>
                        <span className="text-[11px] font-bold text-purple-200/80 truncate w-full text-center leading-tight">{tp.Name}</span>
                    </div>
                ))}
            </div>

            {/* 3. 룬 정보 (중앙) */}
            <div className="w-[110px] shrink-0 flex justify-center border-x border-white/5">
                {skill.Rune ? (
                    <div className="flex flex-col items-center gap-1 w-full">
                        <div className="p-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                            <img src={skill.Rune.Icon} className="w-8 h-8 shrink-0" alt="" />
                        </div>
                        <span className="text-[11px] font-bold text-amber-500 truncate w-full text-center leading-tight">{skill.Rune.Name}</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1 opacity-10">
                        <div className="w-9 h-9 rounded-lg border-2 border-dashed border-zinc-500" />
                    </div>
                )}
            </div>

            {/* 4. 보석 정보 (우측) */}
            <div className="w-[200px] shrink-0 flex flex-wrap justify-end gap-1.5">
                {gemEffects.map((gem, gi) => (
                    <div key={gi} className={`flex items-center gap-1 px-2 py-1 rounded bg-zinc-800/80 border text-[11px] font-black shadow-sm ${
                        gem.type === 'damage' ? 'text-orange-400 border-orange-500/30' : 'text-cyan-400 border-cyan-500/30'
                    }`}>
                        {gem.type === 'damage' ? <Sword size={11} fill="currentColor" /> : <Timer size={11} />}
                        <span className="tracking-tighter">{gem.value}</span>
                    </div>
                ))}
            </div>

            {/* --- 호버 상세 툴팁 --- */}
            <div className="absolute left-[260px] top-0 w-80 p-5 bg-[#1c1c1e] border border-white/20 rounded-2xl shadow-[0px_20px_60px_rgba(0,0,0,0.9)]
                opacity-0 invisible transition-all duration-300 z-[110] pointer-events-none
                group-hover:opacity-100 group-hover:visible translate-x-4 group-hover:translate-x-0 backdrop-blur-md">

                <div className="space-y-4 text-left">
                    <p className="text-[13px] text-zinc-300 leading-relaxed break-keep border-l-2 border-purple-500 pl-3 italic">
                        {description || "전투 스킬 상세 정보"}
                    </p>

                    {selectedTripods.length > 0 && (
                        <div className="space-y-3 pt-3 border-t border-white/10">
                            {selectedTripods.map((tp: any, ti: number) => (
                                <div key={ti}>
                                    <span className="text-purple-400 font-bold text-[12px] flex items-center gap-1">
                                        <div className="w-1 h-1 rounded-full bg-purple-500" /> {tp.Name}
                                    </span>
                                    <span className="text-zinc-500 text-[11px] leading-snug mt-0.5 block">{cleanHtml(tp.Tooltip)}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {skill.Rune && (
                        <div className="pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 shadow-sm">
                                    <img src={skill.Rune.Icon} className="w-6 h-6" alt="" />
                                </div>
                                <span className="text-amber-500 font-bold text-[13px]">{skill.Rune.Name}</span>
                            </div>
                            <div className="text-zinc-400 text-[11px] leading-snug pl-2 bg-white/5 p-2 rounded border border-white/5">
                                {runeEffect || `${skill.Rune.Name} 룬이 장착되었습니다.`}
                            </div>
                        </div>
                    )}

                    {gemEffects.length > 0 && (
                        <div className="pt-3 border-t border-white/10 space-y-2">
                            {gemEffects.map((gem, gi) => (
                                <div key={gi} className={`text-[11px] flex items-start gap-2 p-2 rounded bg-white/5 ${
                                    gem.type === 'damage' ? 'text-orange-200/70' : 'text-cyan-200/70'
                                }`}>
                                    {gem.type === 'damage' ? <Sword size={12} className="shrink-0 mt-0.5" /> : <Timer size={12} className="shrink-0 mt-0.5" />}
                                    <span className="leading-tight">{gem.fullText}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {/* 화살표 장식 */}
                <div className="absolute right-full top-6 border-[8px] border-transparent border-r-[#1c1c1e]" />
            </div>
        </div>
    );
};

export const SkillTab = ({ character }: { character: any }) => {
    const [skills, setSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSkills = async () => {
            if (!character?.CharacterName) return;
            setLoading(true);
            try {
                const response = await fetch(`/combat-skills?name=${encodeURIComponent(character.CharacterName)}`);
                const json = await response.json();
                const filtered = json
                    .filter((s: any) => s.SkillType !== 100 && s.SkillType !== 101 && s.Level > 1)
                    .sort((a: any, b: any) => b.Level - a.Level);
                setSkills(filtered);
            } catch (error) {
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, [character?.CharacterName]);

    if (loading) return (
        <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-purple-500 w-10 h-10 mb-4" />
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading Combat Data...</span>
        </div>
    );

    return (
        <section className="mt-6 pb-20">
            <div className="bg-[#121213] rounded-[32px] border border-white/10 p-6 shadow-2xl overflow-visible">
                {/* --- 요약 바 추가 영역 --- */}
                {skills.length > 0 && <SkillStatsBar skills={skills} />}

                <div className="flex flex-col gap-3 overflow-visible">
                    {skills.length > 0 ? (
                        skills.map((skill, i) => <SkillCard key={i} skill={skill} />)
                    ) : (
                        <div className="py-24 flex flex-col items-center gap-4 text-zinc-700">
                            <ShieldAlert size={48} strokeWidth={1} />
                            <p className="font-bold text-sm tracking-tighter">데이터가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};