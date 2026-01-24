import React, { useState, useEffect, useRef } from "react";
import { Search, Clock, X, Trash2 } from "lucide-react"; // 아이콘 추가
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // ✅ 검색 기록 관련 상태
    const [history, setHistory] = useState<string[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);

    // ✅ 1. 초기 로드 시 기록 불러오기 및 외부 클릭 감지
    useEffect(() => {
        const saved = localStorage.getItem('searchHistory');
        if (saved) setHistory(JSON.parse(saved));

        const handleClickOutside = (e: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
                setIsHistoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ✅ 2. 검색 실행 및 저장 함수
    const handleSearch = (e: React.FormEvent | string) => {
        if (typeof e !== 'string') e.preventDefault();

        const q = typeof e === 'string' ? e : searchQuery.trim();
        if (!q) return;

        // 최근 검색어 저장 로직
        const updated = [q, ...history.filter(item => item !== q)].slice(0, 5);
        setHistory(updated);
        localStorage.setItem('searchHistory', JSON.stringify(updated));

        navigate(`/profilePage?name=${encodeURIComponent(q)}`);
        setIsHistoryOpen(false);
    };

    // ✅ 3. 특정 기록 삭제
    const deleteHistory = (e: React.MouseEvent, term: string) => {
        e.stopPropagation();
        const updated = history.filter(item => item !== term);
        setHistory(updated);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
    };

    // ✅ 4. 전체 기록 삭제
    const clearAllHistory = () => {
        setHistory([]);
        localStorage.removeItem('searchHistory');
    };

    return (
        <motion.div
            key="home"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-col items-center min-h-screen pt-10 mx-auto max-w-4xl px-4"
        >
            {/* 로고 섹션 */}
            <div className="text-center mb-12">
                <h1 className="text-[80px] font-black tracking-tighter text-white mb-2 leading-none">
                    LOAPANG
                </h1>
                <p className="text-zinc-400 text-lg font-medium tracking-wide">
                    로스트아크 고효율 전적 검색 및 전투 시뮬레이터
                </p>
            </div>

            {/* 검색창 섹션 */}
            <div className="w-full max-w-2xl relative group mb-10" ref={historyRef}>
                <div className="pointer-events-none absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-900 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000" />

                <form onSubmit={handleSearch} className="relative z-20">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                        onFocus={() => setIsHistoryOpen(true)}
                        placeholder="캐릭터명을 입력하세요"
                        className="w-full h-20 px-10 rounded-[1.5rem] bg-zinc-900/90 border-2 border-white/10 focus:border-indigo-500 outline-none text-2xl font-bold shadow-2xl transition-all text-white placeholder:text-zinc-700"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-white text-black rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center"
                    >
                        <Search size={28} strokeWidth={3} />
                    </button>
                </form>

                {/* ✅ 검색 기록 드롭다운 (AnimatePresence 추가) */}
                <AnimatePresence>
                    {isHistoryOpen && history.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-[110%] left-0 right-0 z-10 bg-zinc-900 border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden py-4 px-2"
                        >
                            <div className="flex items-center justify-between px-6 pb-2 mb-2 border-b border-white/5">
                                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">최근 검색어</span>
                                <button
                                    onClick={clearAllHistory}
                                    className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-1 transition-colors"
                                >
                                    <Trash2 size={12} /> 전체 삭제
                                </button>
                            </div>

                            {history.map((term, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSearch(term)}
                                    className="group flex items-center justify-between px-6 py-4 hover:bg-white/5 rounded-2xl cursor-pointer transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <Clock size={18} className="text-zinc-600 group-hover:text-indigo-400" />
                                        <span className="text-lg font-medium text-zinc-300 group-hover:text-white transition-colors">
                                            {term}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => deleteHistory(e, term)}
                                        className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 통계 섹션 */}
            <div className="mt-24 grid grid-cols-3 gap-12 w-full max-w-2xl border-t border-white/5 pt-12 text-zinc-500">
                <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-1">2,482</p>
                    <p className="text-sm">오늘의 검색</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-1">154,203</p>
                    <p className="text-sm">누적 캐릭터</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-white mb-1">99.9%</p>
                    <p className="text-sm">정확도</p>
                </div>
            </div>
        </motion.div>
    );
};

export default HomePage;