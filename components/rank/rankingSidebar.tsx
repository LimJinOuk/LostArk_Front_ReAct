import React, { useState, useEffect, useRef } from 'react';
import { Filter, Search, ChevronDown, Zap, ChevronRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    rankingType: 'combat-power' | 'item-level';
    setRankingType: (type: 'combat-power' | 'item-level') => void;
    selectedArkPassive: string;
    setSelectedArkPassive: (value: string) => void;
    arkPassiveList: string[];
    selectedClass: string;
    setSelectedClass: (className: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    classList: string[];
}

const RankingSidebar: React.FC<SidebarProps> = ({
                                                    rankingType,
                                                    setRankingType,
                                                    selectedArkPassive,
                                                    setSelectedArkPassive,
                                                    arkPassiveList,
                                                    selectedClass,
                                                    setSelectedClass,
                                                    searchTerm,
                                                    setSearchTerm,
                                                    classList
                                                }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [expandedClass, setExpandedClass] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 스크롤 감지
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 드롭다운 닫힐 때 초기화
    useEffect(() => {
        if (!isDropdownOpen) setExpandedClass(null);
    }, [isDropdownOpen]);

    const handleClassClick = (cls: string) => {
        if (cls === "전체") {
            setSelectedClass("전체");
            setSelectedArkPassive("전체");
            setIsDropdownOpen(false);
            return;
        }
        setExpandedClass(prev => prev === cls ? null : cls);
        setSelectedClass(cls);
    };

    const handlePassiveSelect = (passive: string) => {
        setSelectedArkPassive(passive);
        setIsDropdownOpen(false);
    };

    return (
        <aside className="w-full lg:w-72 lg:sticky lg:top-24 h-fit z-40 shrink-0 lg:mr-8 transition-all duration-500">
            {/* 컨테이너: 모바일에서는 상단 고정 느낌, 데스크톱은 기존 유지 */}
            <div
                className={`
                    bg-[#111113]/90 border border-white/5 backdrop-blur-xl transition-all duration-300
                    lg:rounded-[1.5rem] lg:p-6 p-4
                    ${isScrolled ? 'shadow-[0_20px_40px_rgba(0,0,0,0.5)]' : 'shadow-2xl'}
                    ${!isScrolled && 'lg:translate-y-0'}
                `}
            >
                {/* 제목 섹션 (데스크톱 전용) */}
                <div className="hidden lg:flex items-center justify-between mb-8 px-1">
                    <h2 className="text-sm font-black text-zinc-100 uppercase tracking-tight">필터 설정</h2>
                    {isScrolled && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    )}
                </div>

                <div className="flex flex-col gap-4 lg:gap-6">
                    {/* 모바일: 가로 배치 레이아웃 (랭킹기준 + 검색) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">

                        {/* 1. 랭킹 기준 */}
                        <div className="space-y-2">
                            <label className="text-[10px] lg:text-[11px] font-black text-zinc-500 uppercase ml-1 tracking-widest flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-zinc-600 rounded-full" /> 랭킹 기준
                            </label>
                            <div className="grid grid-cols-2 gap-2 p-1 bg-black/50 rounded-xl lg:rounded-2xl border border-white/5 shadow-inner">
                                {(['combat-power', 'item-level'] as const).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setRankingType(type)}
                                        className={`relative py-2.5 lg:py-3 text-[12px] lg:text-[13px] font-black rounded-lg lg:rounded-xl transition-all duration-300 ${
                                            rankingType === type
                                                ? "bg-zinc-800 text-white shadow-lg ring-1 ring-white/10"
                                                : "text-zinc-600 hover:text-zinc-400"
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

                        {/* 2. 클래스 및 각인 드롭다운 */}
                        <div className="space-y-2 relative" ref={dropdownRef}>
                            <label className="text-[10px] lg:text-[11px] font-black text-zinc-500 uppercase ml-1 tracking-widest flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-zinc-600 rounded-full" /> 클래스 및 각인
                            </label>

                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full bg-black/40 border transition-all rounded-xl lg:rounded-2xl py-3.5 lg:py-4 pl-10 lg:pl-12 pr-10 text-[12px] lg:text-[13px] font-bold text-left outline-none ${
                                    isDropdownOpen ? "border-indigo-500/50 ring-4 ring-indigo-500/5" : "border-white/5"
                                } shadow-inner text-zinc-200`}
                            >
                                <div className="absolute left-4 top-[65%] -translate-y-1/2 text-zinc-500">
                                    <Filter size={14} />
                                </div>
                                <span className="block truncate">
                                    {selectedClass === '전체' ? '모든 클래스' : `${selectedClass} ${selectedArkPassive !== '전체' ? `(${selectedArkPassive})` : ''}`}
                                </span>
                                <div className="absolute right-4 top-[65%] -translate-y-1/2 text-zinc-600">
                                    <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[50] bg-black/60 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none" onClick={() => setIsDropdownOpen(false)} />
                                        <motion.div
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                            className="fixed lg:absolute inset-x-4 bottom-10 lg:inset-auto lg:left-0 lg:right-0 lg:top-full lg:mt-2 bg-[#16161a] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[60] overflow-hidden max-h-[70vh] lg:max-h-[400px] flex flex-col"
                                        >
                                            {/* 모바일용 헤더 */}
                                            <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5">
                                                <span className="text-sm font-bold text-zinc-400">클래스 선택</span>
                                                <button onClick={() => setIsDropdownOpen(false)} className="p-1.5 bg-white/5 rounded-lg text-zinc-500"><X size={18}/></button>
                                            </div>

                                            <div className="overflow-y-auto custom-scrollbar-thin py-2">
                                                {classList.map((cls) => (
                                                    <div key={cls} className="px-2">
                                                        <button
                                                            onClick={() => handleClassClick(cls)}
                                                            className={`w-full flex items-center justify-between px-4 py-3.5 lg:py-3 text-[13px] font-bold rounded-xl transition-all mb-0.5 ${
                                                                expandedClass === cls || (selectedClass === cls && !expandedClass)
                                                                    ? "bg-indigo-500/10 text-indigo-400"
                                                                    : "text-zinc-400 hover:bg-white/5"
                                                            }`}
                                                        >
                                                            {cls === '전체' ? '모든 클래스' : cls}
                                                            {cls !== '전체' && <ChevronRight size={12} className={`opacity-40 transition-transform ${expandedClass === cls ? "rotate-90" : ""}`} />}
                                                        </button>

                                                        <AnimatePresence>
                                                            {expandedClass === cls && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: "auto", opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    className="overflow-hidden bg-black/20 rounded-xl mb-1"
                                                                >
                                                                    <div className="py-1 px-2 space-y-1">
                                                                        {arkPassiveList.map((passive) => (
                                                                            <button
                                                                                key={passive}
                                                                                onClick={() => handlePassiveSelect(passive)}
                                                                                className={`w-full flex items-center gap-3 px-6 py-3 rounded-lg text-[12px] font-bold transition-all ${
                                                                                    selectedArkPassive === passive && selectedClass === cls
                                                                                        ? "text-indigo-400 bg-indigo-500/10"
                                                                                        : "text-zinc-500 hover:text-zinc-300"
                                                                                }`}
                                                                            >
                                                                                {selectedArkPassive === passive && selectedClass === cls ? (
                                                                                    <Check size={12} className="shrink-0 text-indigo-400" />
                                                                                ) : (
                                                                                    <Zap size={10} className="shrink-0 opacity-30" />
                                                                                )}
                                                                                {passive === "전체" ? `${cls} 전체` : passive}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* 3. 캐릭터 검색 */}
                        <div className="space-y-2">
                            <label className="text-[10px] lg:text-[11px] font-black text-zinc-500 uppercase ml-1 tracking-widest flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-zinc-600 rounded-full" /> 캐릭터 검색
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                                    <Search size={14} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="캐릭터명을 입력하세요"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl lg:rounded-2xl py-3.5 lg:py-4 pl-10 lg:pl-12 pr-4 text-[12px] lg:text-[13px] font-bold text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 정보 섹션 (데스크톱에서만 노출 혹은 모바일 최하단 배치) */}
                <div className="hidden lg:block mt-10 pt-6 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 font-medium leading-relaxed px-1">
                        최신 로스트아크 API를 기반으로 자동 갱신됩니다.
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default RankingSidebar;