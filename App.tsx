import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { SidebarAds } from './components/layout/SidebarAds';
import { FloatingBanner } from './components/layout/FloatingBanner';
import { CharacterCard } from './components/profile/CharacterCard';
import { Simulator } from './components/simulator/Simulator';

// 페이지 컴포넌트
import HomePage from './pages/HomePage';
import RaidPage from './pages/RaidPage';
import AuctionPage from './pages/auctionPage'; // 파일명 대소문자 주의

// 타입 및 상수
import { MOCK_CHARACTER } from './constants';
import { PageType, CharacterInfo } from './types';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activePage, setActivePage] = useState<PageType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [characterData, setCharacterData] = useState<CharacterInfo>(MOCK_CHARACTER);

  // 테마 설정 로직
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.style.backgroundColor = '#09090b';
    } else {
      root.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
    }
  }, [theme]);

  // 검색 핸들러
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setActivePage('profile');
      setLoading(false);
    }, 800);
  };

  return (
      <div className={`min-h-screen transition-colors duration-500 font-sans text-[16px] ${theme === 'dark' ? 'dark text-white' : 'text-slate-900'}`}>

        <Header
            theme={theme}
            setTheme={setTheme}
            activePage={activePage}
            setActivePage={setActivePage}
            setIsMenuOpen={setIsMenuOpen}
        />

        <div className="pt-44 pb-64 px-12 mx-auto flex gap-20 transition-all duration-500 max-w-[1920px]">

          {/* 왼쪽 사이드바 */}
          <div className="hidden 2xl:block w-72 shrink-0">
            <SidebarAds side="left" />
          </div>

          <main className="flex-1 w-full min-h-[80vh] relative z-10">
            <AnimatePresence mode="wait">

              {/* 1. 홈 페이지 */}
              {activePage === 'home' && (
                  <HomePage
                      key="home"
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      handleSearch={handleSearch}
                  />
              )}

              {/* 2. 캐릭터 프로필 페이지 */}
              {activePage === 'profile' && (
                  <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-20"
                  >
                    <div className="transform scale-105 origin-top">
                      <CharacterCard character={characterData} />
                    </div>
                  </motion.div>
              )}

              {/* 3. 아크 패시브 시뮬레이터 페이지 */}
              {activePage === 'simulator' && (
                  <motion.div
                      key="simulator"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-16"
                  >
                    <div className="space-y-4">
                      <p className="text-indigo-500 font-black tracking-[0.3em] uppercase text-sm">Simulation Engine v2.0</p>
                      <h2 className="text-7xl font-black tracking-tighter leading-none text-white">시뮬레이터</h2>
                    </div>
                    <Simulator character={characterData} />
                  </motion.div>
              )}

              {/* 4. 군단장 레이드 진행도 페이지 */}
              {activePage === 'raid' && (
                  <motion.div
                      key="raid"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                  >
                    <RaidPage />
                  </motion.div>
              )}

              {/* 5. 경매 계산기 페이지 */}
              {activePage === 'auction' && (
                  <motion.div
                      key="auction"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                  >
                    <AuctionPage />
                  </motion.div>
              )}

            </AnimatePresence>
          </main>

          {/* 오른쪽 사이드바 */}
          <div className="hidden 2xl:block w-72 shrink-0">
            <SidebarAds side="right" />
          </div>
        </div>

        <Footer />
        <FloatingBanner />

        {/* 모바일 내비게이션 메뉴 */}
        <AnimatePresence>
          {isMenuOpen && (
              <div className="fixed inset-0 z-[100]">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />
                <motion.div initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }} className="absolute inset-y-0 left-0 w-[450px] bg-white dark:bg-[#0c0c0e] p-20 border-r border-white/5 shadow-2xl">
                  <h2 className="text-4xl font-black italic mb-20 tracking-tighter uppercase">LOAPANG</h2>
                  <div className="flex flex-col gap-10">
                    {['home', 'profile', 'raid', 'simulator', 'auction'].map(id => (
                        <button
                            key={id}
                            onClick={() => { setActivePage(id as any); setIsMenuOpen(false); }}
                            className={`text-left text-4xl font-black uppercase tracking-tighter transition-all hover:translate-x-4 
                      ${activePage === id ? 'text-indigo-500' : 'text-slate-300 dark:text-zinc-700 hover:dark:text-white'}`}
                        >
                          {id}
                        </button>
                    ))}
                  </div>
                </motion.div>
              </div>
          )}
        </AnimatePresence>
      </div>
  );
}