import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, Home, Shield, Calculator, Gavel, Search, X, Clock } from 'lucide-react';

interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    setIsMenuOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, setIsMenuOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");

    // ✅ 검색 기록 관련 상태
    const [history, setHistory] = useState<string[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);

    // ✅ 1. 컴포넌트 마운트 시 로컬스토리지에서 기록 불러오기
    useEffect(() => {
        const saved = localStorage.getItem('searchHistory');
        if (saved) {
            setHistory(JSON.parse(saved));
        }

        // 영역 밖 클릭 시 드롭다운 닫기
        const handleClickOutside = (e: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
                setIsHistoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ✅ 2. 검색 기록 저장 함수
    const saveSearch = (term: string) => {
        const trimmedTerm = term.trim();
        if (!trimmedTerm) return;

        const updatedHistory = [
            trimmedTerm,
            ...history.filter((item) => item !== trimmedTerm) // 중복 제거
        ].slice(0, 5); // 최근 5개만 저장

        setHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    };

    // ✅ 3. 개별 기록 삭제 함수
    const deleteHistory = (e: React.MouseEvent, term: string) => {
        e.stopPropagation(); // 부모 클릭 이벤트(검색 실행) 방지
        const updatedHistory = history.filter((item) => item !== term);
        setHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    };

    // ✅ 4. 검색 실행 함수
    const handleSearch = (e: React.FormEvent | string) => {
        if (typeof e !== 'string') {
            e.preventDefault();
        }

        const query = typeof e === 'string' ? e : searchQuery;

        if (query.trim()) {
            saveSearch(query);
            navigate(`/profilePage?name=${encodeURIComponent(query.trim())}`);
            setSearchQuery("");
            setIsHistoryOpen(false);

            // 포커스 해제
            if (typeof e !== 'string' && e.currentTarget instanceof HTMLFormElement) {
                (e.currentTarget.querySelector('input') as HTMLInputElement)?.blur();
            }
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-6 py-4 transition-colors duration-500">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between">

                {/* 왼쪽 영역: 메뉴 + 로고 + 네비게이션 */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMenuOpen(true)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <Menu size={24} />
                        </button>
                        <h1 onClick={() => navigate('/')} className="text-2xl font-black text-midnight dark:text-white cursor-pointer select-none tracking-tight">
                            LOAPANG
                        </h1>
                    </div>

                    <div className="hidden lg:flex items-center gap-7 ml-4">
                        {[
                            { id: 'home', label: '홈', icon: Home, path: '/' },
                            { id: 'raid', label: '군단장', icon: Shield, path: '/raidPage' },
                            { id: 'simulator', label: '시뮬레이터', icon: Calculator, path: '/simulatorPage' },
                            { id: 'auction', label: '경매', icon: Gavel, path: '/auctionPage' },
                        ].map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center gap-2 text-[15px] font-bold transition-all ${
                                        isActive ? 'text-midnight dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                                    }`}
                                >
                                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-500 dark:text-indigo-400' : ''} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 오른쪽 영역: 검색바 + 테마 토글 */}
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block" ref={historyRef}>
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsHistoryOpen(true)}
                                placeholder="캐릭터 검색"
                                className="w-48 lg:w-64 py-2 pl-10 pr-4 bg-slate-100 dark:bg-zinc-900 border border-transparent dark:border-white/5 focus:border-indigo-500/50 rounded-xl text-sm outline-none transition-all focus:w-72 text-slate-700 dark:text-zinc-200"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                        </form>

                        {/* ✅ 최근 검색 기록 드롭다운 UI */}
                        {isHistoryOpen && history.length > 0 && (
                            <div className="absolute top-full mt-2 w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 transition-all">
                                <div className="px-4 py-2 text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                                    최근 검색어
                                </div>
                                {history.map((term, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSearch(term)}
                                        className="group flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Clock size={14} className="text-slate-300 dark:text-zinc-600" />
                                            <span className="text-[14px] text-slate-600 dark:text-zinc-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                                {term}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => deleteHistory(e, term)}
                                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all border border-transparent dark:border-white/5 shadow-sm"
                    >
                        {theme === 'light' ? <Moon size={20} className="text-slate-600" /> : <Sun size={20} className="text-yellow-500 fill-yellow-500/20" />}
                    </button>
                </div>

            </div>
        </nav>
    );
};

export default Header;