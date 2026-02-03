import React from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Shield, User } from 'lucide-react';

interface RankingListProps {
    rankings: any[];
    loading: boolean;
    hasMore: boolean;
    rankingType: string;
    lastElementRef: (node: HTMLDivElement) => void;
    navigate: any;
}

const getGradeColor = (level: number) => {
    if (level >= 1700) return "text-amber-500";
    if (level >= 1660) return "text-indigo-400";
    if (level >= 1620) return "text-orange-500";
    return "text-zinc-400";
};

const RankingList: React.FC<RankingListProps> = ({ rankings, loading, hasMore, rankingType, lastElementRef, navigate }) => {
    return (
        <main className="flex-1 w-full min-h-screen px-4 lg:px-0">
            <div className="max-w-[1100px] mx-auto">
                {/* --- Table Header (열 간격 재설정) --- */}
                {/* 각 컬럼의 너비를 데이터 중요도와 길이에 따라 분배했습니다. */}
                <div className="hidden lg:grid grid-cols-[30px_140px_120px_80px_80px_80px_80px_1fr] px-8 py-5 bg-[#111113] border border-white/5 rounded-t-[0.5rem] text-[11px] font-black text-zinc-500 uppercase tracking-widest items-center shadow-2xl">
                    <div className="text-center">순위</div>
                    <div className="pl-6">캐릭터</div>
                    <div className="text-center">레벨 / 무기</div>
                    <div className="text-center">전투력</div>
                    <div className="text-center">주요 스탯</div>
                    <div className="text-center">서버</div>
                    <div className="text-center">길드</div>
                    <div className="text-center">아크 패시브</div>
                </div>

                {/* --- Table Body --- */}
                <div className="flex flex-col gap-[1px] bg-white/5 border border-white/5 lg:rounded-b-[0.5rem] overflow-hidden shadow-2xl bg-[#0d0d0f]">
                    <AnimatePresence mode='popLayout'>
                        {rankings.map((ranker) => (
                            <RankerRow key={`${ranker.name}-${ranker.rank}`} ranker={ranker} navigate={navigate} />
                        ))}
                    </AnimatePresence>
                </div>

                {/* --- Footer (Loading/End) --- */}
                <div ref={lastElementRef} className="py-16 flex justify-center">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Accessing Archive...</span>
                        </div>
                    ) : !hasMore && (
                        <div className="flex flex-col items-center opacity-30">
                            <Shield size={20} className="text-zinc-700" />
                            <span className="text-[10px] mt-3 font-black text-zinc-600 uppercase">End of Database</span>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

const RankerRow = ({ ranker, navigate }: any) => {
    return (
        <motion.div
            layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => navigate(`/profilePage?name=${encodeURIComponent(ranker.name)}`)}
            className="group grid grid-cols-[50px_1fr_100px] lg:grid-cols-[30px_140px_120px_80px_80px_80px_80px_1fr] items-center bg-[#0d0d0f] hover:bg-white/[0.04] px-4 lg:px-8 py-4 transition-all cursor-pointer relative border-b border-white/[0.02]"
        >
            {/* 0. Rank */}
            <div className="flex justify-center shrink-0">
                <span className={`text-xl font-black italic tracking-tighter ${
                    ranker.rank === 1
                        ? "text-[#F5EDE1] drop-shadow-[0_0_10px_rgba(245,237,225,0.6)]"
                        : ranker.rank === 2
                            ? "text-[#E3D2B4]"
                            : ranker.rank === 3
                                ? "text-[#B9A788]"
                                : "text-zinc-800 group-hover:text-zinc-600"
                }`}>
                    {ranker.rank}
                </span>
            </div>

            {/* 1. Name Card */}
            <div className="flex items-center min-w-0 pl-4">
                <div className="relative w-[180px] h-12 flex items-center rounded-lg border border-white/5 bg-zinc-900 overflow-hidden shadow-xl group-hover:border-indigo-500/50 transition-all duration-500">
                    <div className="absolute inset-0 w-full h-full pointer-events-none">
                        {ranker.iconUrl ? (
                            <img
                                src={ranker.iconUrl}
                                className="w-[400%] h-[400%] max-w-none object-cover -translate-x-1/4 -translate-y-4 opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700"
                                alt="ranker-icon"
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                <User size={20} className="text-zinc-700" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                    </div>

                    <div className="relative z-10 flex flex-col pl-4">
                        <span className="text-[14px] font-black text-white group-hover:text-indigo-300 transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight">
                            {ranker.name}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                            {ranker.characterClass}
                        </span>
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>

            {/* 2. Gear Spec */}
            <div className="flex items-center justify-center gap-2">
                <span className="text-[14px] font-bold tabular-nums text-zinc-100">
                    {ranker.itemLevel.toFixed(2)}
                </span>
                <span className="text-[11px] font-black text-[#2efbef] drop-shadow-[0_0_8px_rgba(46,251,239,0.3)] tabular-nums">
                    <span className="text-[8px] opacity-50 mr-0.5">+</span>{ranker.weaponLevel}
                </span>
            </div>

            {/* 3. Combat Power */}
            <div className="text-center text-[14px] font-bold text-rose-500/90 tabular-nums tracking-tight">
                {ranker.combatPower.toLocaleString()}
            </div>

            {/* 4. Stats: 주요 스탯 표시 */}
            <div className="text-center text-[11px] font-bold text-zinc-200">
                {ranker.stats}
            </div>

            {/* 5. Server */}
            <div className="text-center text-[11px] font-bold text-zinc-200 group-hover:text-zinc-200 transition-colors">
                {ranker.server}
            </div>

            {/* 6. Guild Name */}
            <div className="text-center text-[11px] font-bold text-zinc-200 truncate px-2">
                {ranker.guildName || <span className="opacity-20">-</span>}
            </div>

            {/* 7. Ark Passive */}
            <div className="flex items-center justify-start pl-2"> {/* items-left는 존재하지 않는 클래스이므로 start로 수정 */}
                {ranker.arkPassive ? (
                    <div className="flex items-center gap-2 px-2 py-1">
                        {ranker.arkpassiveIconUrl && (
                            <div className="relative w-7 h-7">
                                <img
                                    src={ranker.arkpassiveIconUrl}
                                    className="w-full h-full rounded-full"
                                    alt="ark"
                                />
                            </div>
                        )}
                        <span className="text-[11px] font-extrabold text-zinc-200 tracking-tight uppercase truncate max-w-[70px] pr-1">
                            {ranker.arkPassive}
                        </span>
                    </div>
                ) : (
                    <span className="text-xs font-medium text-zinc-400">—</span>
                )}
            </div>
            {/* Hover Accent Bar */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-[2px] bg-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
        </motion.div>
    );
};

export default RankingList;