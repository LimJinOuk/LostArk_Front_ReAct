import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Coins, CheckCircle2, Info, AlertCircle
} from 'lucide-react';
import { RAIDS } from '../constants';

const RaidPage = () => {
    // 선택된 레이드 상태: { id, 난이도, 더보기여부 }
    const [selectedRaids, setSelectedRaids] = useState<{id: string, diff: 'Normal' | 'Hard', extra: boolean}[]>([]);

    // 레이드 클릭 시 토글 및 난이도 변경 로직
    const toggleRaid = (id: string, diff: 'Normal' | 'Hard') => {
        setSelectedRaids(prev => {
            const exists = prev.find(r => r.id === id);
            if (exists) {
                // 이미 같은 난이도가 선택되어 있다면 해제, 다른 난이도라면 변경
                if (exists.diff === diff) return prev.filter(r => r.id !== id);
                return prev.map(r => r.id === id ? { ...r, diff } : r);
            }
            return [...prev, { id, diff, extra: false }];
        });
    };

    const toggleExtraReward = (id: string) => {
        setSelectedRaids(prev => prev.map(r => r.id === id ? { ...r, extra: !r.extra } : r));
    };

    // 총 예상 골드 계산 (선택된 난이도의 골드 - 더보기 비용)
    const calculateTotalGold = () => {
        return selectedRaids.reduce((total, selected) => {
            const raid = RAIDS.find(r => r.id === selected.id);
            if (!raid) return total;

            const difficulty = raid.difficulties.find(d => d.type === selected.diff);
            if (!difficulty) return total;

            let gold = difficulty.gold;
            if (selected.extra) gold -= difficulty.extraRewardCost;

            return total + gold;
        }, 0);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
        >
            {/* 대시보드 헤더 */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
                <div>
                    <h2 className="text-6xl font-black tracking-tighter italic dark:text-white uppercase leading-none">
                        Raid <br /> <span className="text-indigo-500">Calculator</span>
                    </h2>
                    <p className="text-slate-400 font-bold mt-4">난이도별 보상과 더보기 비용이 자동으로 계산됩니다.</p>
                </div>

                <div className="bg-midnight dark:bg-surface p-8 rounded-[2.5rem] border border-white/10 min-w-[320px] text-right shadow-2xl relative overflow-hidden">
                    <div className="absolute -left-4 -top-4 w-24 h-24 bg-yellow-400/10 rounded-full blur-2xl" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">이번 주 예상 순수익</p>
                    <div className="flex items-baseline justify-end gap-2">
            <span className="text-5xl font-black text-yellow-400 tracking-tighter">
              {calculateTotalGold().toLocaleString()}
            </span>
                        <span className="text-xl font-bold text-white/50">G</span>
                    </div>
                </div>
            </div>

            {/* 레이드 카드 리스트 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {RAIDS.map((raid) => {
                    const selection = selectedRaids.find(r => r.id === raid.id);

                    return (
                        <div
                            key={raid.id}
                            className={`relative p-8 rounded-[3rem] border-2 transition-all duration-300 ${
                                selection
                                    ? 'bg-indigo-500/5 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.1)]'
                                    : 'bg-white dark:bg-surface border-transparent hover:border-slate-200 dark:hover:border-white/10'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h4 className="text-2xl font-black dark:text-white mb-2">{raid.name}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Difficulty</p>
                                </div>
                                {selection && <CheckCircle2 className="text-indigo-500" size={28} />}
                            </div>

                            {/* 난이도 선택 버튼 [Normal / Hard] */}
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {raid.difficulties.map((diff) => (
                                    <button
                                        key={diff.type}
                                        onClick={() => toggleRaid(raid.id, diff.type)}
                                        className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                                            selection?.diff === diff.type
                                                ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg'
                                                : 'bg-slate-50 dark:bg-void border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span>{diff.type.toUpperCase()}</span>
                                            <span className="text-[9px] opacity-60 font-bold mt-0.5">{diff.gold.toLocaleString()} G</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* 선택 시 나타나는 상세 정보 (더보기 옵션) */}
                            <AnimatePresence>
                                {selection && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4 pt-6 border-t border-slate-100 dark:border-white/5"
                                    >
                                        <div className="flex justify-between items-center p-4 bg-white dark:bg-void rounded-2xl border border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-2">
                                                <Coins size={16} className="text-yellow-500" />
                                                <span className="text-xs font-black dark:text-slate-300">전체 보상 더보기</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-red-400">
                          -{raid.difficulties.find(d => d.type === selection.diff)?.extraRewardCost.toLocaleString()} G
                        </span>
                                                <input
                                                    type="checkbox"
                                                    checked={selection.extra}
                                                    onChange={() => toggleExtraReward(raid.id)}
                                                    className="w-5 h-5 accent-indigo-500 cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center px-2">
                                            <span className="text-[11px] font-black text-slate-400 uppercase">예상 획득 골드</span>
                                            <span className="text-lg font-black text-indigo-500">
                        {(() => {
                            const d = raid.difficulties.find(d => d.type === selection.diff);
                            return (selection.extra ? d!.gold - d!.extraRewardCost : d!.gold).toLocaleString();
                        })()} G
                      </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center gap-3 p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 mt-12">
                <Info className="text-indigo-500" size={18} />
                <p className="text-xs text-slate-500 font-medium">
                    각 난이도 버튼 하단에 표시된 금액은 기본 보상 골드입니다. 선택 시 더보기 비용이 계산에 반영됩니다.
                </p>
            </div>
        </motion.div>
    );
};

export default RaidPage;