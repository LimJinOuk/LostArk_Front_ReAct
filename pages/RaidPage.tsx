import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, CheckCircle2, Loader2 } from 'lucide-react';

interface DifficultyDto {
    type: 'Normal' | 'Hard';
    gold: number;
    extraRewardCost: number;
    mandatoryDrops: string[];
}

interface RaidDto {
    title: string;
    difficulty: DifficultyDto[];
}

const RaidPage = () => {
    const [raids, setRaids] = useState<RaidDto[]>([]);
    const [loading, setLoading] = useState(true);

    // 선택 상태 관리: title을 고유 키로 활용
    const [selectedRaids, setSelectedRaids] = useState<{title: string, diff: 'Normal' | 'Hard', extra: boolean}[]>([]);

    useEffect(() => {
        // API 엔드포인트 호출
        fetch('http://localhost:8080/raid')
            .then(res => res.json())
            .then(data => {
                setRaids(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("데이터 로딩 실패:", err);
                setLoading(false);
            });
    }, []);

    const toggleRaid = (title: string, diff: 'Normal' | 'Hard') => {
        setSelectedRaids(prev => {
            const exists = prev.find(r => r.title === title);
            if (exists) {
                if (exists.diff === diff) return prev.filter(r => r.title !== title);
                return prev.map(r => r.title === title ? { ...r, diff } : r);
            }
            return [...prev, { title, diff, extra: false }];
        });
    };

    const toggleExtraReward = (title: string) => {
        setSelectedRaids(prev => prev.map(r => r.title === title ? { ...r, extra: !r.extra } : r));
    };

    // 🚀 계산 로직: 각 레이드의 선택된 난이도(difficulty) 데이터만 사용
    const calculateTotalGold = () => {
        return selectedRaids.reduce((total, selected) => {
            const raid = raids.find(r => r.title === selected.title);
            if (!raid) return total;

            const diffInfo = raid.difficulty.find(d => d.type === selected.diff);
            if (!diffInfo) return total;

            let gold = diffInfo.gold;
            if (selected.extra) gold -= diffInfo.extraRewardCost;
            return total + gold;
        }, 0);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
                <p className="text-slate-500 font-bold">레이드 정보를 동기화 중입니다...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* 상단 대시보드 */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-16">
                <div>
                    <h2 className="text-6xl font-black tracking-tighter italic dark:text-white uppercase leading-none">
                        Raid <br /> <span className="text-indigo-500">Calculator</span>
                    </h2>
                    <p className="text-slate-400 font-bold mt-4 italic">Pure logic based on backend difficulty data.</p>
                </div>

                <div className="bg-white dark:bg-surface p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10 min-w-[320px] text-right shadow-2xl relative overflow-hidden">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">총 예상 수익</p>
                    <div className="flex items-baseline justify-end gap-2">
                        <span className="text-5xl font-black text-yellow-500 tracking-tighter">
                            {calculateTotalGold().toLocaleString()}
                        </span>
                        <span className="text-xl font-bold text-slate-400">G</span>
                    </div>
                </div>
            </div>

            {/* 레이드 카드 섹션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {raids.map((raid) => {
                    const selection = selectedRaids.find(r => r.title === raid.title);
                    return (
                        <div key={raid.title} className={`p-8 rounded-[3rem] border-2 transition-all duration-300 ${
                            selection ? 'bg-indigo-500/5 border-indigo-500 shadow-xl' : 'bg-white dark:bg-surface border-transparent shadow-sm hover:border-slate-200 dark:hover:border-white/10'
                        }`}>
                            <div className="flex justify-between items-start mb-8">
                                <h4 className="text-2xl font-black dark:text-white">{raid.title}</h4>
                                {selection && <CheckCircle2 className="text-indigo-500" size={28} />}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {raid.difficulty.map((diff) => (
                                    <button
                                        key={diff.type}
                                        onClick={() => toggleRaid(raid.title, diff.type)}
                                        className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                                            selection?.diff === diff.type
                                                ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg'
                                                : 'bg-slate-50 dark:bg-void border-transparent text-slate-400'
                                        }`}
                                    >
                                        <span className="block">{diff.type.toUpperCase()}</span>
                                        <span className="text-[10px] opacity-70">{diff.gold.toLocaleString()} G</span>
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence>
                                {selection && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-6 border-t dark:border-white/5">
                                        <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-void rounded-2xl">
                                            <div className="flex items-center gap-2">
                                                <Coins size={16} className="text-yellow-500" />
                                                <span className="text-xs font-bold dark:text-slate-300">보상 더보기 비용 차감</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[11px] font-bold text-red-400">
                                                    -{raid.difficulty.find(d => d.type === selection.diff)?.extraRewardCost.toLocaleString()} G
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={selection.extra}
                                                    onChange={() => toggleExtraReward(raid.title)}
                                                    className="w-5 h-5 accent-indigo-500 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default RaidPage;