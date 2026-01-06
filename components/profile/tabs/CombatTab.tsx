import React from 'react';
import { Shield, Zap, Gem, Sparkles, User, Award, Layers } from 'lucide-react';

export const CombatTab = ({ character }: { character: any }) => {
    return (
        <div className="bg-white dark:bg-[#0c0c0e] text-zinc-800 dark:text-zinc-300 p-8 min-h-screen font-sans transition-colors duration-300">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800/50">

                {/* LEFT COLUMN: 장비 / 각인 / 보석 */}
                <div className="space-y-12 pb-12 lg:pb-0">

                    {/* 장비 (Equipment) */}
                    <section>
                        <SectionHeader title="장비" badge="종합 0% / 무효 0%" />
                        <div className="space-y-1 mt-4">
                            {[
                                { name: '고대 갱신필요 +19', q: 94, step: 30 },
                                { name: '고대 갱신필요 +19', q: 100, step: 20 },
                                { name: '고대 갱신필요 +20', q: 85, step: 20 },
                                { name: '고대 갱신필요 +19', q: 96, step: 0 },
                                { name: '고대 갱신필요 +19', q: 98, step: 0 },
                                { name: '고대 갱신필요 +19', q: 87, step: 0 },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-900/40">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
                                        <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-200">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-5 text-[11px] font-black italic">
                                        <span className="text-zinc-400 dark:text-zinc-500 underline decoration-zinc-200 dark:decoration-zinc-800">+{item.step}</span>
                                        <span className={`w-8 text-center ${item.q >= 90 ? 'text-orange-500' : 'text-zinc-400 dark:text-zinc-500'}`}>{item.q}</span>
                                        <span className="text-zinc-400 dark:text-zinc-600 font-normal italic">0단계 0</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 각인 (Engravings) */}
                    <section>
                        <SectionHeader title="각인" badge="아크 패시브 ON" />
                        <div className="mt-4 space-y-2 px-1">
                            <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mb-3 uppercase tracking-tighter">공통 각인 종합 <span className="text-blue-500 dark:text-blue-400">141.38%</span></p>
                            {[
                                { name: '기습의 대가', rate: '20.52%' },
                                { name: '원한 Lv.1', rate: '21.00%' },
                                { name: '예리한 둔기 Lv.4', rate: '20.97%' },
                                { name: '돌격대장', rate: '15.17%' },
                                { name: '아드레날린', rate: '18.94%' },
                            ].map((eng, i) => (
                                <div key={i} className="flex justify-between items-center text-[12px] py-1.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                                        <span className="font-bold text-zinc-700 dark:text-zinc-200">{eng.name}</span>
                                    </div>
                                    <div className="flex gap-8 text-[11px] font-black italic">
                                        <span className="text-zinc-400 dark:text-zinc-600">0단계</span>
                                        <span className="text-blue-500 dark:text-blue-400 w-14 text-right">{eng.rate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 보석 (Gems) */}
                    <section>
                        <SectionHeader title="보석" />
                        <div className="mt-4 space-y-3">
                            <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 text-right">기본 공격력 증가 <span className="text-zinc-800 dark:text-zinc-100 ml-1 font-black">7.9%</span></p>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { lv: 10, name: '블레이드 버스트', desc: '데미지 증가 40%', isDmg: true },
                                    { lv: 7, name: '미엘스톰', desc: '쿨타임 감소 16%', isDmg: false },
                                    { lv: 7, name: '블레이드 댄스', desc: '데미지 증가 32% 쿨타임 감소 16%', isDmg: true },
                                    { lv: 7, name: '블리츠 러시', desc: '데미지 증가 32% 쿨타임 감소 18%', isDmg: true },
                                ].map((gem, i) => (
                                    <div key={i} className="flex items-center gap-4 py-1">
                                        <div className="relative">
                                            <div className={`w-10 h-10 rounded border ${gem.isDmg ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/30' : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30'}`} />
                                            <span className="absolute bottom-0 right-0 bg-black/80 text-white text-[9px] px-1 rounded font-black italic leading-none pb-0.5">{gem.lv}</span>
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-bold text-zinc-700 dark:text-zinc-200">{gem.name}</p>
                                            <p className={`text-[11px] font-medium ${gem.isDmg ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>{gem.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: 악세사리 / 아바타 / 카르마 / 내실 */}
                <div className="lg:pl-16 pt-12 lg:pt-0 space-y-12">

                    {/* 악세사리 (Accessories) */}
                    <section>
                        <SectionHeader title="악세" badge="ARK PASSIVE ON" />
                        <div className="mt-6 flex gap-10">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">Quality</p>
                                {[83, 84, 79, 97, 95].map((q, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
                                        <span className={`text-[11px] font-black italic ${q >= 90 ? 'text-purple-500' : 'text-emerald-500'}`}>{q}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 space-y-4 pt-4 border-l border-zinc-100 dark:border-zinc-800/50 pl-10">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-zinc-500">특화 <span className="text-zinc-800 dark:text-zinc-200 font-black italic">105</span></p>
                                    <p className="text-[11px] font-bold text-zinc-500">치명 <span className="text-zinc-800 dark:text-zinc-200 font-black italic">109</span></p>
                                </div>
                                <div className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed font-medium space-y-1">
                                    <p>치명타 적중률 <b className="text-blue-500">4.2%</b> 증가</p>
                                    <p>적에게 주는 피해 <b className="text-blue-500">2.5%</b> 증가</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 아바타 (Avatar) */}
                    <section>
                        <SectionHeader title="아바타" />
                        <div className="mt-6 space-y-3">
                            {[
                                { part: '무기아바타 영웅', bonus: '1.0%' },
                                { part: '머리아바타 전설', bonus: '2.0%' },
                                { part: '상의아바타 전설', bonus: '2.0%' },
                                { part: '하의아바타 전설', bonus: '2.0%' },
                            ].map((av, i) => (
                                <div key={i} className="flex justify-between items-center text-[12px] py-1">
                                    <span className="font-bold text-zinc-600 dark:text-zinc-400">{av.part}</span>
                                    <span className="text-zinc-400 dark:text-zinc-600 font-medium">주스탯 증가 {av.bonus}</span>
                                </div>
                            ))}
                            <p className="text-xs font-black text-zinc-700 dark:text-zinc-300 mt-2">총 주스탯 증가 7%</p>
                        </div>
                    </section>

                    {/* 카르마 (Karma) */}
                    <section>
                        <SectionHeader title="카르마" />
                        <div className="mt-6 space-y-6">
                            <KarmaRow title="진화" level="6랭크 21레벨" desc="신화적 피해 6% 증가 / 내인력 6% 증가 / 최대 생명력 8400 증가" />
                            <KarmaRow title="재달음" level="6랭크 24레벨" desc="재달음포인트 6 증가 / 무기 공격력 2.4% 증가" />
                            <KarmaRow title="도약" level="6랭크 21레벨" desc="도약포인트 12 증가 / 초각성기 피해 10.5% 증가" />
                        </div>
                    </section>

                    {/* 카드 (Card) */}
                    <section>
                        <SectionHeader title="카드" />
                        <div className="mt-4 p-5 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-950/30 flex justify-between items-center">
                            <div>
                                <p className="text-[12px] font-black text-zinc-800 dark:text-zinc-200">세상을 구하는 빛</p>
                                <p className="text-[11px] text-blue-600 dark:text-blue-400/80 font-bold uppercase tracking-widest mt-0.5">6세트 (30각성 합계)</p>
                            </div>
                            <Layers className="w-5 h-5 text-blue-400/50" />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// --- 서브 컴포넌트 (로스트빌드 스타일 최적화) ---

const SectionHeader = ({ title, badge }: { title: string, badge?: string }) => (
    <div className="flex items-end justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3 px-1 transition-colors">
        <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{title}</h2>
        {badge && <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-white/5 px-2 py-0.5 rounded border border-zinc-100 dark:border-white/5 uppercase tracking-tighter transition-colors">{badge}</span>}
    </div>
);

const KarmaRow = ({ title, level, desc }: { title: string, level: string, desc: string }) => (
    <div className="flex gap-8 items-start">
        <div className="w-12 text-[11px] font-black text-zinc-400 dark:text-zinc-500 pt-1 uppercase tracking-tighter">{title}</div>
        <div className="flex-1 space-y-1">
            <p className="text-[12px] font-black text-zinc-700 dark:text-zinc-200 italic tracking-tighter">{level}</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 font-medium leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default CombatTab;