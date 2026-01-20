import React, { useEffect, useState } from 'react';
import { Loader2, Clock, Zap, Droplets } from 'lucide-react';

const cleanHtml = (html: string) => {
    if (!html) return "";
    return html
        .replace(/<br[^>]*>/gi, "\n")
        .replace(/<[^>]*>?/gm, "")
        .replace(/&nbsp;/g, " ")
        .trim();
};

export const SkillTab: React.FC<{ character: any }> = ({ character }) => {
    const [skills, setSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSkills = async () => {
            if (!character?.CharacterName) return;
            setLoading(true);
            try {
                const response = await fetch(`/combat-skills?name=${encodeURIComponent(character.CharacterName)}`);
                const json = await response.json();
                setSkills(json);
            } catch (error) {
                console.error("스킬 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, [character?.CharacterName]);

    if (loading) return (
        <div className="py-32 flex flex-col items-center justify-center bg-[#121213] rounded-3xl mt-10 border border-white/5">
            <Loader2 className="animate-spin text-purple-500 w-10 h-10 mb-4" />
            <span className="text-zinc-400 font-medium">전투 스킬 목록을 불러오는 중...</span>
        </div>
    );

    return (
        <section className="bg-[#121213] rounded-3xl border border-white/5 p-7 mt-10 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {skills.map((skill: any, i) => {
                    const sTooltip = JSON.parse(skill.Tooltip || "{}");

                    let cooldown = "";
                    let skillTypeTags: string[] = []; // 태그들을 배열로 관리
                    let description = "";
                    let consume = "";
                    let battleStats: string[] = [];
                    let gemEffects: string[] = [];

                    Object.entries(sTooltip).forEach(([key, el]: [string, any]) => {
                        const val = el.value;
                        if (!val) return;

                        if (el.type === "CommonSkillTitle") {
                            cooldown = cleanHtml(val.leftText);

                            // [로직 수정] '일반' 제외 및 특수 타입(체인 등)만 추출
                            const levelPart = cleanHtml(val.level).replace(/[\[\]]/g, "");
                            const namePart = cleanHtml(val.name).replace(/[\[\]]/g, "");

                            const rawTags = [levelPart, namePart];
                            rawTags.forEach(tag => {
                                // '일반'이라는 단어가 포함되지 않은 경우에만 태그 리스트에 추가
                                if (tag && tag !== "일반" && !skillTypeTags.includes(tag)) {
                                    skillTypeTags.push(tag);
                                }
                            });
                        }

                        if (typeof val === 'string' && val.includes("소모")) {
                            const cleanedConsume = cleanHtml(val).split('|')[0].trim();
                            if (cleanedConsume) consume = cleanedConsume;
                        }

                        if (typeof val === 'string' && val.includes("피해를")) {
                            const lines = val.split(/<BR>|\n/);
                            lines.forEach((line) => {
                                const cleanedLine = cleanHtml(line);
                                if (!cleanedLine) return;

                                if (
                                    cleanedLine.includes("무력화") ||
                                    cleanedLine.includes("부위 파괴") ||
                                    cleanedLine.includes("슈퍼아머") ||
                                    cleanedLine.includes("카운터") ||
                                    cleanedLine.includes("공격 타입")
                                ) {
                                    if (!battleStats.includes(cleanedLine)) battleStats.push(cleanedLine);
                                } else if (cleanedLine.includes("피해를") && !description) {
                                    description = cleanedLine;
                                }
                            });
                        }

                        if (el.type === "ItemPartBox" && val.Element_000?.includes("보석")) {
                            gemEffects = val.Element_001.split('<BR>').map((v: string) => cleanHtml(v));
                        }
                    });

                    const isAwakening = skill.SkillType === 100 || skill.SkillType === 101;

                    return (
                        <div key={i} className={`relative p-5 rounded-2xl border transition-all flex flex-col h-full
              ${isAwakening ? 'bg-red-500/[0.03] border-red-500/20 shadow-lg shadow-red-500/5' : 'bg-white/[0.02] border-white/5 hover:border-purple-500/30'}`}>

                            <div className="flex items-start gap-4 mb-4">
                                <div className="relative shrink-0">
                                    <div className={`w-14 h-14 rounded-xl overflow-hidden border ${isAwakening ? 'border-red-500/40' : 'border-white/10'}`}>
                                        <img src={skill.Icon} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-zinc-950 px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/10 text-zinc-300">
                                        Lv.{skill.Level}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 overflow-hidden">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`text-lg font-bold truncate ${isAwakening ? 'text-red-400' : 'text-zinc-100'}`}>{skill.Name}</h4>
                                    </div>

                                    {/* [수정] 체인, 콤보 등 특수 타입만 띄우는 별도 블럭 */}
                                    {skillTypeTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                            {skillTypeTags.map((tag, ti) => (
                                                <span key={ti} className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-tight ${isAwakening ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {tag}
                        </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                        {cooldown && (
                                            <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                        <Clock size={12} className="text-sky-500" /> {cooldown.replace("재사용 대기시간 ", "")}
                      </span>
                                        )}
                                        {consume && (
                                            <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
                        <Droplets size={12} className="text-blue-500" /> {consume}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 전투 속성 배지 */}
                            {battleStats.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {battleStats.map((stat, si) => (
                                        <span key={si} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-medium text-zinc-400">
                      {stat}
                    </span>
                                    ))}
                                </div>
                            )}

                            {description && (
                                <div className={`p-3.5 rounded-xl text-[12.5px] leading-relaxed mb-4 break-keep
                  ${isAwakening ? 'bg-red-500/5 text-zinc-300 border border-red-500/10' : 'bg-black/30 text-zinc-400 border border-white/5'}`}>
                                    {description}
                                </div>
                            )}

                            <div className="mt-auto space-y-3">
                                {skill.Rune && (
                                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-800/50 border border-white/5">
                                        <img src={skill.Rune.Icon} alt="" className="w-5 h-5" />
                                        <span className="text-[11px] font-bold text-zinc-300">
                      [{skill.Rune.Grade}] {skill.Rune.Name}
                    </span>
                                    </div>
                                )}

                                {skill.Tripods?.some((t: any) => t.IsSelected) && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {skill.Tripods.filter((t: any) => t.IsSelected).map((tp: any, ti: number) => (
                                            <div key={ti} className="flex flex-col items-center p-2 rounded-xl bg-purple-500/5 border border-purple-500/10">
                                                <img src={tp.Icon} alt="" className="w-6 h-6 mb-1 filter drop-shadow-sm opacity-90" />
                                                <span className="text-[10px] font-bold text-purple-300 text-center line-clamp-1">{tp.Name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {gemEffects.length > 0 && (
                                    <div className="pt-3 border-t border-white/5 space-y-1">
                                        {gemEffects.map((eff, ei) => (
                                            <div key={ei} className="flex items-center gap-2 text-[11px] text-amber-400/80 font-medium">
                                                <Zap size={10} fill="currentColor" />
                                                <span className="truncate">{eff}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};