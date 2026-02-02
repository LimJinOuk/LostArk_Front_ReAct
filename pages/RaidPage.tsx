import React, { useState } from 'react';
import { Coins, ScrollText } from 'lucide-react';
import GoldCalculator from '@/components/raid/GoldCalculator';
import CheatSheet from '@/components/raid/CheatSheet';

const RaidPage = () => {
    const [activeTab, setActiveTab] = useState<'gold' | 'cheat'>('cheat');

    return (
        <div className="max-w-6xl mx-auto py-4 px-6 space-y-8">
            {/* 탭 네비게이션 */}
            <nav className="flex justify-center">
                <div className="bg-slate-100 dark:bg-zinc-900 p-1.5 rounded-[2rem] border border-slate-200 dark:border-zinc-800 flex gap-1">
                    <button
                        onClick={() => setActiveTab('cheat')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all ${
                            activeTab === 'cheat'
                                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                        }`}
                    >
                        <ScrollText size={18} /> 컨닝페이퍼
                    </button>
                    <button
                        onClick={() => setActiveTab('gold')}
                        className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all ${
                            activeTab === 'gold'
                                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                        }`}
                    >
                        <Coins size={18} /> 골드 계산기
                    </button>
                </div>
            </nav>

            {/* 컨텐츠 렌더링 */}
            <div className="transition-all duration-300">
                {activeTab === 'gold' ? <GoldCalculator /> : <CheatSheet />}
            </div>
        </div>
    );
};

export default RaidPage;