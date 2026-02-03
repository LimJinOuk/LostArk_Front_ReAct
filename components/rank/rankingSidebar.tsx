import React from 'react';
import { Trophy, Filter, Search, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
    rankingType: 'combat-power' | 'item-level';
    setRankingType: (type: 'combat-power' | 'item-level') => void;
    selectedClass: string;
    setSelectedClass: (className: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    classList: string[];
}

const RankingSidebar: React.FC<SidebarProps> = ({
                                                    rankingType, setRankingType, selectedClass, setSelectedClass, searchTerm, setSearchTerm, classList
                                                }) => {
    return (
        <aside className="w-full lg:w-72 lg:sticky lg:top-10 h-fit z-10 shrink-0 p-4 lg:p-0 lg:mr-8">
            <div className="bg-[#111113]/90 border border-white/5 rounded-[1.5rem] p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">

                {/* 제목 섹션 */}
                <div className="flex items-center gap-2 mb-8 px-1">
                    <h2 className="text-sm font-black text-zinc-100 uppercase tracking-tight">필터 설정</h2>
                </div>

                <div className="space-y-6">
                    {/* 1. 랭킹 카테고리 */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-zinc-500 uppercase ml-1 tracking-widest">랭킹 기준</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-black/50 rounded-2xl border border-white/5 shadow-inner">
                            {(['combat-power', 'item-level'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setRankingType(type)}
                                    className={`relative py-3 text-[13px] font-black rounded-xl transition-all duration-300 ${
                                        rankingType === type
                                            ? "bg-zinc-800 text-white shadow-[0_0_15px_rgba(0,0,0,0.4)] ring-1 ring-white/10"
                                            : "text-zinc-600 hover:text-zinc-400 hover:bg-white/5"
                                    }`}
                                >
                                    {type === 'combat-power' ? "전투력" : "아이템 레벨"}
                                    {rankingType === type && (
                                        <motion.div layoutId="activeTab" className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. 클래스 필터 */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-zinc-500 uppercase ml-1 tracking-widest">클래스 선택</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                                <Filter size={14} />
                            </div>
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-10 text-[13px] font-bold text-zinc-200 outline-none appearance-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all cursor-pointer shadow-inner"
                            >
                                {classList.map(cls => (
                                    <option key={cls} value={cls} className="bg-[#121214] text-zinc-200">
                                        {cls === 'ALL' ? '모든 클래스' : cls}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>

                    {/* 3. 캐릭터 검색 */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-zinc-500 uppercase ml-1 tracking-widest">캐릭터 검색</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                                <Search size={14} />
                            </div>
                            <input
                                type="text"
                                placeholder="이름을 입력하세요..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[13px] font-bold text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
                            />
                        </div>
                    </div>
                </div>

                {/* 하단 팁 (간지용) */}
                <div className="mt-10 pt-6 border-t border-white/5">
                    <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">
                        실시간 데이터를 기반으로 랭킹이 업데이트됩니다. 상위 랭커의 프로필을 클릭하여 상세 정보를 확인하세요.
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default RankingSidebar;