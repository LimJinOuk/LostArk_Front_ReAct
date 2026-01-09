import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, Home, Shield, Calculator, Gavel } from 'lucide-react';
import { PageType } from '../../types';

interface HeaderProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    setIsMenuOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, setIsMenuOpen }) => {
    const navigate = useNavigate();
    const location = useLocation(); // 현재 URL 정보를 가져옵니다.

    const navItems = [
        { id: 'home', label: '홈', icon: Home, path: '/' },
        { id: 'raid', label: '군단장', icon: Shield, path: '/raidPage' },
        { id: 'simulator', label: '시뮬레이터', icon: Calculator, path: '/simulatorPage' },
        { id: 'auction', label: '경매', icon: Gavel, path: '/auctionPage' },
    ];

    // 페이지 이동 핸들러
    const handlePageChange = (path: string) => {
        navigate(path);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-6 py-4 transition-colors duration-500">
            <div className="max-w-[1200px] mx-auto flex items-center justify-between">

                {/* 왼쪽 영역: 메뉴 버튼 + 로고 + 네비게이션 */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <h1
                            onClick={() => handlePageChange('/')}
                            className="text-2xl font-black text-midnight dark:text-white cursor-pointer select-none tracking-tight"
                        >
                            LOAPANG
                        </h1>
                    </div>

                    {/* 네비게이션 메뉴 */}
                    <div className="hidden lg:flex items-center gap-7 ml-4">
                        {navItems.map((item) => {
                            // 현재 URL이 item.path와 일치하는지 확인 (하이라이트 조건)
                            const isActive = location.pathname === item.path;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handlePageChange(item.path)}
                                    className={`flex items-center gap-2 text-[15px] font-bold transition-all ${
                                        isActive
                                            ? 'text-midnight dark:text-white'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
                                    }`}
                                >
                                    <item.icon
                                        size={18}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={isActive ? 'text-indigo-500 dark:text-indigo-400' : ''}
                                    />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 오른쪽 영역: 테마 토글 버튼 */}
                <button
                    onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all border border-transparent dark:border-white/5 shadow-sm"
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