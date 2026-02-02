import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Home, Shield, Calculator, Gavel, Search, X, Clock } from 'lucide-react';
import mokoko from "../../assets/모코코.png";

interface HeaderProps {
    setIsMenuOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsMenuOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);

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

    const saveSearch = (term: string) => {
        const trimmedTerm = term.trim();
        if (!trimmedTerm) return;
        const updatedHistory = [trimmedTerm, ...history.filter((item) => item !== trimmedTerm)].slice(0, 5);
        setHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    };

    const deleteHistory = (e: React.MouseEvent, term: string) => {
        e.stopPropagation();
        const updatedHistory = history.filter((item) => item !== term);
        setHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    };

    const handleSearch = (e: React.FormEvent | string) => {
        if (typeof e !== 'string') e.preventDefault();
        const query = typeof e === 'string' ? e : searchQuery;
        if (query.trim()) {
            saveSearch(query);
            navigate(`/profilePage?name=${encodeURIComponent(query.trim())}`);
            setSearchQuery("");
            setIsHistoryOpen(false);
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between">

                {/* 1. 왼쪽 영역: 메뉴 + 로고 + 네비게이션 */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMenuOpen(true)} className="p-1 text-zinc-400 hover:text-white transition-colors">
                            <Menu size={24} />
                        </button>
                        <h1 onClick={() => navigate('/')} className="text-2xl font-black text-white cursor-pointer select-none tracking-tight">
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
                                        isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-300'
                                    }`}
                                >
                                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-400' : ''} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. 오른쪽 영역: 검색바 + 모코코 아이콘 */}
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block" ref={historyRef}>
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsHistoryOpen(true)}
                                placeholder="캐릭터 검색"
                                className="w-48 lg:w-64 py-2 pl-10 pr-4 bg-zinc-900 border border-white/5 focus:border-indigo-500/50 rounded-xl text-sm outline-none transition-all focus:w-72 text-zinc-200"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        </form>

                        {/* 최근 검색어 드롭다운 */}
                        {isHistoryOpen && history.length > 0 && (
                            <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2">
                                <div className="px-4 py-2 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">최근 검색어</div>
                                {history.map((term, index) => (
                                    <div key={index} onClick={() => handleSearch(term)} className="group flex items-center justify-between px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Clock size={14} className="text-zinc-600" />
                                            <span className="text-[14px] text-zinc-300 group-hover:text-indigo-400 transition-colors">{term}</span>
                                        </div>
                                        <button onClick={(e) => deleteHistory(e, term)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-red-500 transition-all">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 모코코 이미지 영역 (오른쪽 영역 내부로 이동) */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-300 border border-white/5 flex items-center justify-center shadow-sm shrink-0">
                        <img
                            src={mokoko}
                            alt="Mokoko"
                            className="w-8 h-8 object-contain"
                        />
                    </div>
                </div>

            </div>
        </nav>
    );
};

export default Header;