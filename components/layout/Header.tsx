import React, {useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, Home, Shield, Calculator, Gavel, Search } from 'lucide-react';
import { PageType } from '../../types';

interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    setIsMenuOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, setIsMenuOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");

    const navItems = [
        { id: 'home', label: '홈', icon: Home, path: '/' },
        { id: 'raid', label: '군단장', icon: Shield, path: '/raidPage' },
        { id: 'simulator', label: '시뮬레이터', icon: Calculator, path: '/simulatorPage' },
        { id: 'auction', label: '경매', icon: Gavel, path: '/auctionPage' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const q = searchQuery.trim();
            if (!q) return;

            // ✅ 검색 페이지로 캐릭터 이름을 파라미터로 넘기며 이동
            // 예: /search?name=치킨버거사주세요
            navigate(`/profilePage?name=${encodeURIComponent(q)}`);

            setSearchQuery("");

            if (e.currentTarget instanceof HTMLFormElement) {
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
                        {navItems.map((item) => {
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
                    {/* 검색바 추가 */}
                    <form onSubmit={handleSearch} className="relative hidden md:block">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="캐릭터 검색"
                            className="w-48 lg:w-64 py-2 pl-10 pr-4 bg-slate-100 dark:bg-zinc-900 border border-transparent dark:border-white/5 focus:border-indigo-500/50 rounded-xl text-sm outline-none transition-all focus:w-72 text-slate-700 dark:text-zinc-200"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={16} />
                    </form>

                    {/* 테마 토글 */}
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