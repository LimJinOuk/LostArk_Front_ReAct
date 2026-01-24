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

// --- 상단 통계 바 컴포넌트 (높이 축소) ---
const SkillStatsBar = ({ skills }: { skills: any[] }) => {
    const { counter, stagger, destruction } = getSkillStats(skills);

    const itemClass = "flex items-baseline gap-2 pr-4 border-r border-white/5 last:border-0 last:pr-0";
    const labelClass = "text-[11px] text-zinc-500 font-bold uppercase tracking-wider";
    const valueClass = "text-base font-black tracking-tighter text-zinc-200";

    return (
        <div className="flex items-center justify-center mb-4 px-4">
            <div className="flex items-center gap-4 px-5 py-2 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
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

// --- 개별 스킬 카드 컴포넌트 ---
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

    Object.entries(sTooltip).forEach(([key, el]: [string, any]) => {
        const val = el.value;
        if (!val) return;

        if (el.type === "CommonSkillTitle") {
            cooldown = cleanHtml(val.leftText);
        }

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
            if (title.includes("룬")) {
                runeEffect = cleanHtml(content);
            }
        }

        if (typeof val === 'string' && val.includes("피해를")) {
            if (!description) description = cleanHtml(val.split('<BR>')[0]);
        }
    });

    const selectedTripods = skill.Tripods?.filter((t: any) => t.IsSelected) || [];

    return (
        <div className="group relative px-3 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-2 w-full z-10 hover:z-[100] hover:bg-white/[0.04] border border-transparent hover:border-white/5">

            {/* 1. 스킬 기본 정보 (너비 압축 180px) */}
            <div className="flex items-center gap-2.5 w-[180px] shrink-0 min-w-0">
                <div className="relative shrink-0">
                    <img src={skill.Icon} className="w-10 h-10 rounded-lg border border-white/10 shadow-sm" alt="" />
                    <div className="absolute -bottom-1 -right-1 bg-black/80 px-1 py-0 rounded text-[9px] font-black border border-white/20 text-white backdrop-blur-sm">
                        {skill.Level}
                    </div>
                </div>
                <div className="min-w-0">
                    <h4 className="text-[13px] font-bold truncate tracking-tight text-zinc-100">{skill.Name}</h4>
                    {cooldown && (
                        <div className="flex items-center gap-1 mt-0.5 text-zinc-500">
                            <Clock size={10} />
                            <span className="text-[10px] font-medium tracking-tighter truncate">{cooldown.replace("재사용 대기시간 ","").trim()}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. 트라이포드 & 룬 통합 (중앙 정렬) */}
            <div className="flex-1 flex items-center justify-start gap-1 min-w-0 px-2 border-l border-white/5">
                {/* 트라이포드 3개 아이콘 */}
                <div className="flex gap-1 shrink-0">
                    {selectedTripods.map((tp: any, ti: number) => (
                        <div key={ti} className="w-7 h-7 rounded-md bg-purple-500/10 border border-purple-500/20 p-0.5 shadow-sm">
                            <img src={tp.Icon} className="w-full h-full object-contain" alt="" title={tp.Name} />
                        </div>
                    ))}
                </div>

                {/* 룬 아이콘 (트라이포드와 얇은 경계로 구분) */}
                <div className="ml-2 pl-2 border-l border-white/5 shrink-0">
                    {skill.Rune ? (
                        <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 p-0.5 shadow-sm">
                            <img src={skill.Rune.Icon} className="w-full h-full object-contain" alt="" />
                        </div>
                    ) : (
                        <div className="w-7 h-7 rounded-md border border-dashed border-white/5 opacity-20" />
                    )}
                </div>
            </div>

            {/* 3. 보석 정보 (우측 정렬, 너비 축소 140px) */}
            <div className="w-[140px] shrink-0 flex flex-wrap justify-end gap-1">
                {gemEffects.map((gem, gi) => (
                    <div key={gi} className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-black ${
                        gem.type === 'damage' ? 'text-orange-400 bg-orange-400/10 border border-orange-400/20' : 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20'
                    }`}>
                        {gem.type === 'damage' ? <Sword size={10} /> : <Timer size={10} />}
                        <span className="tracking-tighter">{gem.value}</span>
                    </div>
                ))}
            </div>

            {/* --- 호버 상세 툴팁 --- */}
            <div className="absolute left-[190px] top-0 w-72 p-4 bg-[#1c1c1e]/fb border border-white/20 rounded-xl shadow-2xl
                opacity-0 invisible transition-all duration-200 z-[110] pointer-events-none
                group-hover:opacity-100 group-hover:visible translate-x-2 group-hover:translate-x-0 backdrop-blur-xl">
                <div className="space-y-3 text-left">
                    <p className="text-[12px] text-zinc-400 leading-relaxed break-keep border-l-2 border-purple-500 pl-2 italic">
                        {description || "상세 정보 없음"}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                        {selectedTripods.map((tp, ti) => (
                            <span key={ti} className="text-[10px] text-purple-300 font-bold bg-purple-500/5 px-1.5 py-0.5 rounded border border-purple-500/10">
                                {tp.Name}
                            </span>
                        ))}
                    </div>
                    {skill.Rune && (
                        <div className="text-[11px] text-amber-500 font-bold bg-amber-500/5 p-2 rounded border border-amber-500/10">
                            룬: {skill.Rune.Name}
                        </div>
                    )}
                </div>
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
            <Loader2 className="animate-spin text-purple-500 w-8 h-8 mb-4" />
            <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Loading...</span>
        </div>
    );

    return (
        <section className="mt-4 pb-10">
            <div className="bg-[#0c0c0d] rounded-2xl border border-white/5 p-4 shadow-xl overflow-visible">
                {skills.length > 0 && <SkillStatsBar skills={skills} />}
                <div className="flex flex-col gap-1 overflow-visible">
                    {skills.length > 0 ? (
                        skills.map((skill, i) => <SkillCard key={i} skill={skill} />)
                    ) : (
                        <div className="py-20 flex flex-col items-center gap-4 text-zinc-700">
                            <ShieldAlert size={40} strokeWidth={1} />
                            <p className="font-bold text-xs">데이터가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};