import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Shield, Calculator, Gavel, Crown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: '홈', icon: Home, path: '/' },
        { label: '군단장 레이드', icon: Shield, path: '/raidPage' },
        { label: '전투 시뮬레이터', icon: Calculator, path: '/simulatorPage' },
        { label: '경매 계산기', icon: Gavel, path: '/auctionPage' },
        { label: '랭킹', icon: Crown, path: '/rankingPage' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 1. 뒷배경 - 블러 농도를 모바일에서 소폭 조절하여 성능 최적화 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm md:backdrop-blur-md"
                    />

                    {/* 2. 사이드바 메뉴창 */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        // 모바일: 75vw로 축소하여 우측 터치 영역 확보, 데스크톱: 300px 유지
                        className="fixed top-0 left-0 bottom-0 z-[201] w-[70vw] md:w-[300px] bg-white dark:bg-[#0c0c0d] shadow-[20px_0_60px_rgba(0,0,0,0.5)] border-r border-white/5 flex flex-col"
                    >
                        <div className="flex flex-col h-full">
                            {/* 헤더: 모바일에서 높이를 줄여 컴팩트하게 구성 */}
                            <div className="flex items-center justify-between p-5 md:p-6 border-b border-slate-100 dark:border-white/5">
                                <h2 className="text-xl md:text-2xl font-black text-midnight dark:text-white tracking-tighter">
                                    LOAPANG
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl active:scale-90 transition-all"
                                >
                                    <X size={20} className="text-slate-500 dark:text-zinc-400" />
                                </button>
                            </div>

                            {/* 메뉴 리스트: 간격(space-y-1) 및 패딩 최적화 */}
                            <nav className="flex-1 overflow-y-auto py-4 px-3 md:py-6 md:px-4 space-y-1 md:space-y-2 no-scrollbar">
                                {menuItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <button
                                            key={item.path}
                                            onClick={() => {
                                                navigate(item.path);
                                                onClose();
                                            }}
                                            className={`
                                                w-full flex items-center gap-3 md:gap-4 px-4 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-bold transition-all group
                                                ${isActive
                                                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                                : 'text-slate-500 dark:text-zinc-400 active:bg-slate-50 dark:active:bg-white/5'}
                                            `}
                                        >
                                            <div className={`
                                                p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors
                                                ${isActive ? 'bg-white dark:bg-indigo-500/20 shadow-sm' : 'bg-slate-50 dark:bg-zinc-900 group-hover:bg-white dark:group-hover:bg-zinc-800'}
                                            `}>
                                                <item.icon size={18} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                                            </div>
                                            <span className="text-[15px] md:text-[15px] tracking-tight">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* 하단 푸터: 모바일 하단바 여백 최적화 */}
                            <div className="p-5 md:p-6 pb-8 md:pb-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-zinc-950/30">
                                <div className="flex items-center justify-between text-[10px] md:text-[12px] text-zinc-500 font-bold uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                        <span>v 1.2.0</span>
                                    </div>
                                    <span className="opacity-50">Online</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default Sidebar;