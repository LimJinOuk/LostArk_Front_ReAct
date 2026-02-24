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

// 고정 폭 레이아웃 정의
const DESKTOP_GRID = "lg:grid-cols-[40px_150px_110px_90px_65px_65px_80px_minmax(180px,1fr)]";
const MOBILE_GRID = "grid-cols-[40px_1fr_110px]";

const RankingList: React.FC<RankingListProps> = ({ rankings, loading, hasMore, rankingType, lastElementRef, navigate }) => {
    return (
        <main className="flex-1 w-full min-h-screen lg:px-0 bg-[#080809]">
            <div className="max-w-[1100px] mx-auto lg:py-8">
                {/* --- Table Header (데스크톱 전용) --- */}
                <div className={`hidden lg:grid ${DESKTOP_GRID} px-6 py-4 bg-[#111113] border border-white/5 rounded-t-xl text-[10px] font-bold text-zinc-500 uppercase tracking-tighter items-center shadow-2xl`}>
                    <div className="text-center">#</div>
                    <div className="pl-4">Character</div>
                    <div className="text-center">Level / Wep</div>
                    <div className="text-center text-rose-500/80">Power</div>
                    <div className="text-center">Stat</div>
                    <div className="text-center">Svr</div>
                    <div className="text-center">Guild</div>
                    <div className="pl-10 text-indigo-400/80 text-left">Ark Passive Spec</div>
                </div>

                {/* --- Table Body --- */}
                <div className="flex flex-col bg-[#0d0d0f] border-white/5 lg:border lg:rounded-b-xl overflow-hidden shadow-2xl">
                    <AnimatePresence mode='popLayout'>
                        {rankings.map((ranker) => (
                            <RankerRow key={`${ranker.name}-${ranker.rank}`} ranker={ranker} navigate={navigate} />
                        ))}
                    </AnimatePresence>
                </div>

                {/* --- Footer --- */}
                <div ref={lastElementRef} className="py-16 flex justify-center border-t border-white/[0.02] lg:border-none">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Synchronizing...</span>
                        </div>
                    ) : !hasMore && (
                        <div className="flex flex-col items-center opacity-30">
                            <Shield size={20} className="text-zinc-700" />
                            <span className="text-[9px] mt-3 font-bold text-zinc-600 uppercase">Archive Complete</span>
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
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/profilePage?name=${encodeURIComponent(ranker.name)}`)}
            className={`
                group grid ${MOBILE_GRID} ${DESKTOP_GRID} items-center 
                bg-[#0d0d0f] hover:bg-white/[0.03] active:bg-white/[0.05] 
                /* 모바일 패딩을 0으로 설정하여 좌우를 꽉 채웁니다 */
                px-1 lg:px-6 
                py-3 lg:py-3 
                transition-all cursor-pointer relative 
                border-b border-white/[0.03] lg:border-white/[0.02]
            `}
        >
            {/* 0. Rank */}
            <div className="flex justify-center items-center pl-1 lg:pl-0">
                <span className={`text-base lg:text-lg font-black italic tracking-tighter ${
                    ranker.rank <= 3 ? "text-amber-200/90" : "text-zinc-700 group-hover:text-zinc-500"
                }`}>
                    {ranker.rank}
                </span>
            </div>

            {/* 1. Name Card & Sub Info (Mobile Mixed) */}
            <div className="flex items-center min-w-0 pl-1 lg:pl-2">
                <div className="flex flex-col min-w-0 w-full lg:max-w-[155px]">
                    {/* 캐릭터 이름 카드 (배경 아이콘 포함) */}
                    <div className="relative w-full max-w-[180px] lg:w-full h-9 lg:h-10 flex items-center rounded border border-white/5 bg-zinc-900/50 overflow-hidden group-hover:border-indigo-500/30 transition-all duration-500">
                        {/* Background Icon (이제 모바일에서도 보입니다) */}
                        <div className="absolute inset-0 pointer-events-none">
                            {ranker.iconUrl ? (
                                <img
                                    src={ranker.iconUrl}
                                    className="
        w-full h-full object-cover
        /* 1. 이미지의 초점을 위쪽(얼굴) 15% 지점에 고정 */
        object-[center_15%]
        /* 2. 이미지를 1.6배 키워 박스 경계에 여백이 생기지 않도록 함 */
        scale-[1.2]
        /* 3. 요청하신 '살짝 오른쪽/위쪽' 느낌을 위해 미세 조정 */
        -translate-y-[-5%]
        translate-x-[5%]

        opacity-75 lg:opacity-80
        group-hover:opacity-60
        transition-all duration-700
    "
                                    alt=""
                                />
                            ) : (
                                <User className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/5" />
                            )}
                            {/* 그라데이션 마스크: 글자가 있는 왼쪽을 더 어둡게 처리 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/40 to-transparent" />
                        </div>

                        <div className="relative z-10 flex flex-col pl-3">
                            <span className="text-[13px] lg:text-[13px] font-bold text-white group-hover:text-white truncate tracking-tight">
                                {ranker.name}
                            </span>
                            <span className="text-[9px] lg:text-[10px] font-bold text-zinc-500 uppercase leading-none lg:mt-0.5">
                                {ranker.characterClass}
                            </span>
                        </div>
                    </div>

                    {/* Mobile Sub Info (Svr | Guild) */}
                    <div className="flex lg:hidden items-center gap-2 mt-1 px-1">
                        <span className="text-[10px] font-medium text-zinc-500">{ranker.server}</span>
                        <span className="w-[1px] h-2 bg-white/10" />
                        <span className="text-[10px] font-medium text-zinc-600 truncate max-w-[100px]">
                            {ranker.guildName || "No Guild"}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Gear & Power (Mobile Vertical Stack) */}
            <div className="flex flex-col items-end lg:items-center justify-center pr-2 lg:pr-0">
                <div className="flex items-center gap-1.5 lg:gap-1">
                    <span className="text-[15px] font-bold tabular-nums text-zinc-200">
                        {ranker.itemLevel.toFixed(2)}
                    </span>

                    {/* 무기 강화 수치에 따른 조건부 색상 적용 */}
                    <span
                        className={`text-[9px] font-black px-1 rounded-sm tabular-nums ${
                            ranker.weaponLevel > 10
                                ? "text-[#ffbb00] bg-[#ffbb00]/10" // 10 초과: 고대 등급 색상 (Golden)
                                : "text-[#2efbef] bg-[#2efbef]/10" // 10 이하: 기존 색상 (Cyan)
                        }`}
                    >
                        +{ranker.weaponLevel}
                    </span>
                </div>

                {/* Mobile Only Power Display */}
                <span className="lg:hidden text-[12px] font-bold text-rose-500/80 tabular-nums mt-0.5">
                    {ranker.combatPower.toLocaleString()}
                </span>
            </div>

            {/* 3. Combat Power (Desktop Only) */}
            <div className="hidden lg:block text-center text-[15px] font-bold text-rose-500/90 tabular-nums">
                {ranker.combatPower.toLocaleString()}
            </div>

            {/* 4. Stats (Desktop Only) */}
            <div className="hidden lg:block text-center text-[11.5px] font-medium text-zinc-400">
                {ranker.stats}
            </div>

            {/* 5. Server (Desktop Only) */}
            <div className="hidden lg:block text-center text-[11.5px] font-medium text-zinc-400">
                {ranker.server}
            </div>

            {/* 6. Guild Name (Desktop Only) */}
            <div className="hidden lg:block text-center text-[11.5px] font-medium text-zinc-400 truncate px-1">
                {ranker.guildName || "-"}
            </div>

            {/* 7. Ark Passive (Desktop Only) */}
            <div className="hidden lg:flex items-center justify-start pl-10 min-w-0">
                {ranker.arkPassive ? (
                    <div className="flex items-center gap-3 w-full min-w-0">
                        {ranker.arkpassiveIconUrl && (
                            <img
                                src={ranker.arkpassiveIconUrl}
                                className="w-6 h-6 rounded-full border border-white/10 shrink-0 bg-black/50"
                                alt=""
                            />
                        )}
                        <span className="text-[12px] font-extrabold text-zinc-300 tracking-tight uppercase truncate group-hover:text-indigo-300 transition-colors">
                {ranker.arkPassive}
            </span>
                    </div>
                ) : (
                    <span className="text-[10px] text-zinc-800 ml-2">—</span>
                )}
            </div>

            {/* Hover/Touch Accent Bar */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0 group-hover:h-2/3 group-active:h-2/3 w-[2px] bg-indigo-500 transition-all duration-300" />
        </motion.div>
    );
};

export default RankingList;