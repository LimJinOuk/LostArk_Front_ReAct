import React from 'react';
// ... 기존 툴팁 및 아이콘 import 생략 ...

/* ✅ 부모로부터 모든 데이터를 한 번에 전달받는 Props 정의 */
interface CombatTabProps {
    character: any;
    equipments: any[];
    arkGrid: any;
    engravings: any;
    gems: any;
    avatars: any[];
    cards: any;
    arkPassive: any;
    skillData: any[]; // 스킬 데이터 추가
}

export const CombatTab = ({
                              character,
                              equipments = [],
                              arkGrid,
                              engravings,
                              gems,
                              avatars = [],
                              cards,
                              arkPassive,
                              skillData = []
                          }: CombatTabProps) => {

    /* 내부의 useEffect와 fetch 로직을 모두 삭제했습니다.
       이제 이 컴포넌트는 오직 '보여주는' 역할만 수행합니다.
    */

    return (
        <div className="flex flex-col gap-10 p-6 bg-[#0f0f0f] text-zinc-300 min-h-screen max-w-[1800px] mx-auto">
            {/* 상단 섹션: 기존 장비 & 악세사리 렌더링 로직 */}
            <div className="flex flex-col lg:flex-row gap-10">
                {/* ... (장비/악세사리 렌더링 부분은 기존 코드 유지) ... */}
            </div>

            {/* 하단 섹션: 스킬 정보 호출 */}
            <SkillTab skills={skillData} />
        </div>
    );
};

/* ================= 스킬 탭 컴포넌트 (정의부) ================= */
export const SkillTab = ({ skills }: { skills: any[] }) => {
    if (!skills || skills.length === 0) {
        return (
            <div className="bg-[#121213] rounded-3xl border border-white/5 p-20 text-center text-zinc-500 font-bold">
                등록된 스킬 정보가 없습니다.
            </div>
        );
    }

    const cleanHtml = (html: string) => {
        if (!html) return "";
        return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
    };

    return (
        <section className="bg-[#121213] rounded-3xl border border-white/5 p-7 space-y-7 shadow-2xl mt-10">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                <h2 className="text-xl font-extrabold text-white tracking-tight uppercase">전투 스킬 정보</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
                {skills.map((skill, i) => {
                    let gemEffect = null;
                    let attackType = null;

                    try {
                        if (skill.Tooltip) {
                            const tooltipData = JSON.parse(skill.Tooltip);
                            gemEffect = tooltipData.Element_008?.value?.Element_001 || tooltipData.Element_009?.value?.Element_001;
                            const desc = tooltipData.Element_005?.value || "";
                            const match = desc.match(/공격 타입 : ([^<]+)/);
                            if (match) attackType = match[1];
                        }
                    } catch (e) {}

                    return (
                        <div key={i} className="bg-white/[0.02] p-5 rounded-2xl border border-white/5 space-y-5 group hover:border-purple-500/30 transition-all shadow-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-zinc-900 rounded-xl border border-white/10 flex items-center justify-center relative shrink-0 overflow-hidden shadow-inner">
                                        <img src={skill.Icon} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute -bottom-1 -right-1 bg-zinc-950 px-2 py-0.5 rounded text-[10px] font-black border border-white/10 text-sky-400">
                                            Lv.{skill.Level}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-[17px] font-bold text-zinc-100 group-hover:text-white transition-colors">
                                                {skill.Name}
                                            </h4>
                                            {attackType && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-bold border border-white/5">
                                                    {attackType}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1.5">
                                            {skill.Rune ? (
                                                <div className="flex items-center gap-1.5 bg-orange-500/5 px-2 py-0.5 rounded-md border border-orange-500/10 w-fit">
                                                    <img src={skill.Rune.Icon} alt="" className="w-3.5 h-3.5" />
                                                    <span className="text-[11px] font-bold text-orange-400">{skill.Rune.Name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-tighter">No Rune</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black px-2 py-1 bg-zinc-900 rounded border border-white/5 text-zinc-500 uppercase tracking-widest">
                                    {skill.Type || "일반"}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {skill.Tripods?.filter((tp: any) => tp.IsSelected).map((tp: any, ti: number) => (
                                    <div key={ti} className="py-2 px-1 rounded-lg border border-purple-500/30 bg-purple-500/5 text-center shadow-[inset_0_0_8px_rgba(168,85,247,0.05)]">
                                        <p className="text-[11px] font-bold text-purple-300 truncate">
                                            {cleanHtml(tp.Name)}
                                        </p>
                                    </div>
                                ))}
                                {Array.from({ length: Math.max(0, 3 - (skill.Tripods?.filter((tp: any) => tp.IsSelected).length || 0)) }).map((_, idx) => (
                                    <div key={`empty-${idx}`} className="py-2 rounded-lg border border-white/5 bg-zinc-900/20 opacity-30" />
                                ))}
                            </div>

                            {gemEffect && (
                                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-start gap-3">
                                    <div className="mt-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 shrink-0">GEM</div>
                                    <p className="text-[11px] text-zinc-400 font-medium leading-snug">
                                        {cleanHtml(gemEffect)}
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};