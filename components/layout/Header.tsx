import React from 'react';
import {
    Menu, Moon, Sun,
    Home, Shield, Calculator, Gavel
} from 'lucide-react';
import { PageType } from '../../types';

interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    activePage: PageType;
    setActivePage: (page: PageType) => void;
    setIsMenuOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, activePage, setActivePage, setIsMenuOpen }) => {
    const navItems = [
        { id: 'home', label: '홈', icon: Home },
        { id: 'raid', label: '군단장', icon: Shield },
        { id: 'simulator', label: '시뮬레이터', icon: Calculator },
        { id: 'auction', label: '경매', icon: Gavel },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-6 py-4">
            {/* 🚀 max-w-[1600px]에서 [1200px]로 줄여 내용을 중앙으로 모았습니다 */}
            <div className="max-w-[1200px] mx-auto flex items-center justify-between">

                {/* 왼쪽 영역: 메뉴 + 로고 + 네비게이션 */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                            <Menu size={24} strokeWidth={2} />
                        </button>

                        <h1
                            onClick={() => setActivePage('home')}
                            className="text-2xl font-black tracking-tight text-midnight dark:text-white cursor-pointer select-none"
                        >
                            LOAPANG
                        </h1>
                    </div>

                    {/* 네비게이션 아이템 */}
                    <div className="hidden lg:flex items-center gap-7 ml-4">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActivePage(item.id as PageType)}
                                className={`flex items-center gap-2 text-[15px] font-bold transition-all ${
                                    activePage === item.id
                                        ? 'text-midnight dark:text-white'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                                }`}
                            >
                                <item.icon
                                    size={18}
                                    strokeWidth={activePage === item.id ? 2.5 : 2}
                                    className={activePage === item.id ? '' : 'text-slate-400'}
                                />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 오른쪽 영역: 테마 토글 */}
                <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all border border-transparent dark:border-white/5"
                >
                    {theme === 'light' ? (
                        <Moon size={20} className="text-slate-600" />
                    ) : (
                        <Sun size={20} className="text-yellow-500 fill-yellow-500/20" />
                    )}
                </button>

            </div>
        </nav>
    );
};

export default Header;