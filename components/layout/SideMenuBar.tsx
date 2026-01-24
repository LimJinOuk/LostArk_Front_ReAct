import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Shield, Calculator, Gavel, Settings, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const menuItems = [
        { label: '홈', icon: Home, path: '/' },
        { label: '군단장 레이드', icon: Shield, path: '/raidPage' },
        { label: '전투 시뮬레이터', icon: Calculator, path: '/simulatorPage' },
        { label: '경매 계산기', icon: Gavel, path: '/auctionPage' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 1. 뒷배경 (Overlay) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* 2. 사이드바 메뉴창 */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 bottom-0 z-[101] w-[300px] bg-white dark:bg-[#0c0c0d] shadow-2xl border-r border-white/5"
                    >
                        <div className="flex flex-col h-full">
                            {/* 헤더 부분 */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
                                <h2 className="text-xl font-black text-midnight dark:text-white tracking-tighter">
                                    LOAPANG <span className="text-indigo-500"></span>
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            {/* 메뉴 리스트 */}
                            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            navigate(item.path);
                                            onClose();
                                        }}
                                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-600 dark:text-zinc-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group"
                                    >
                                        <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                                        <span className="text-[15px]">{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* 하단 푸터 (버전 정보 등) */}
                            <div className="p-6 border-t border-slate-100 dark:border-white/5">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between text-[12px] text-zinc-500 font-bold uppercase tracking-widest">
                                        <span>v 1.0.0</span>
                                        <span className="text-emerald-500">온라인</span>
                                    </div>
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