
import React, { useState, useEffect } from 'react';
import { 
  Search, Sun, Moon, Calculator, Shield, 
  Home as HomeIcon, 
  ChevronRight, Gavel, Coins, CheckCircle2, Info,
  Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarAds } from './components/SidebarAds';
import { FloatingBanner } from './components/FloatingBanner';
import { CharacterCard } from './components/CharacterCard';
import { Simulator } from './components/Simulator';
import { RAIDS, MARI_ITEMS, MOCK_CHARACTER } from './constants';
import { PageType, CharacterInfo } from './types';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activePage, setActivePage] = useState<PageType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [characterData, setCharacterData] = useState<CharacterInfo>(MOCK_CHARACTER);
  const [loading, setLoading] = useState(false);
  
  // Utility States
  const [selectedRaids, setSelectedRaids] = useState<{id: string, diff: 'Normal' | 'Hard', extra: boolean}[]>([]);
  const [auctionPrice, setAuctionPrice] = useState<number>(0);
  const [calcMode, setCalcMode] = useState<'4' | '8' | '16'>('8');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.replace('bg-gray-50', 'bg-void');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.replace('bg-void', 'bg-gray-50');
    }
  }, [theme]);

  /* 
    [API 연동 가이드: 캐릭터 검색]
    1. 로스트아크 공식 API 또는 자체 백엔드 엔드포인트를 호출합니다.
    2. 예시: `GET /api/character/${searchQuery}`
    3. 캐릭터 프로필, 장비, 각인, 스킬, 보석 정보를 한 번에 파싱하여 setCharacterData 업데이트.
  */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLoading(true);
      try {
        // TODO: const response = await fetch(`/api/search?name=${searchQuery}`);
        // const data = await response.json();
        // setCharacterData(data);
        setActivePage('profile');
      } catch (err) {
        console.error("캐릭터를 찾을 수 없습니다.");
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleRaid = (id: string, diff: 'Normal' | 'Hard') => {
    setSelectedRaids(prev => {
      const exists = prev.find(r => r.id === id);
      if (exists) {
        if (exists.diff === diff) return prev.filter(r => r.id !== id);
        return prev.map(r => r.id === id ? { ...r, diff } : r);
      }
      return [...prev, { id, diff, extra: false }];
    });
  };

  const toggleExtraReward = (id: string) => {
    setSelectedRaids(prev => prev.map(r => r.id === id ? { ...r, extra: !r.extra } : r));
  };

  const calculateTotalGold = () => {
    return selectedRaids.reduce((total, selected) => {
      const raid = RAIDS.find(r => r.id === selected.id);
      if (!raid) return total;
      const difficulty = raid.difficulties.find(d => d.type === selected.diff) || raid.difficulties[0];
      let gold = difficulty.gold;
      if (selected.extra) gold -= difficulty.extraRewardCost;
      return total + gold;
    }, 0);
  };

  const calculateAuction = () => {
    const tax = 0.95;
    const players = parseInt(calcMode);
    const fairPrice = auctionPrice * tax * (players - 1) / players;
    const breakEven = auctionPrice * tax;
    return {
      bid: Math.floor(fairPrice),
      breakEven: Math.floor(breakEven),
      dividend: Math.floor(fairPrice / (players - 1))
    };
  };

  const auctionResults = calculateAuction();

  const navItems = [
    { id: 'home', label: '홈', icon: HomeIcon },
    { id: 'raid', label: '군단장', icon: Shield },
    { id: 'simulator', label: '시뮬레이터', icon: Calculator },
    { id: 'auction', label: '경매', icon: Gavel },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark text-white' : 'text-slate-900'}`}>
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-void/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-slate-400 dark:text-white/40 hover:text-midnight dark:hover:text-white transition-colors"
              >
                <Menu size={22} strokeWidth={2.5} />
              </button>
              <h1 
                onClick={() => setActivePage('home')}
                className="text-2xl font-black tracking-tighter text-midnight dark:text-white cursor-pointer select-none ml-2"
              >
                LOAPANG
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-8 ml-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id as PageType)}
                  className={`flex items-center gap-2 text-sm font-black transition-all ${
                    activePage === item.id ? 'text-midnight dark:text-white scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-surface hover:bg-slate-200 dark:hover:bg-midnight-dark transition-all shadow-sm"
          >
            {theme === 'light' ? <Moon size={20} className="text-slate-600" /> : <Sun size={20} className="text-yellow-400" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-surface shadow-2xl z-[70] border-r border-slate-200 dark:border-white/10"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-12">
                  <h2 className="text-xl font-black text-midnight dark:text-white tracking-tighter">LOAPANG MENU</h2>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex flex-col gap-4">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActivePage(item.id as PageType);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-lg font-bold transition-all ${
                        activePage === item.id 
                          ? 'bg-midnight text-white dark:bg-white dark:text-void shadow-lg' 
                          : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-void dark:text-white/40'
                      }`}
                    >
                      <item.icon size={22} />
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="absolute bottom-10 left-8 right-8 p-6 bg-slate-50 dark:bg-void rounded-3xl border border-slate-100 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-300 dark:text-white/20 uppercase tracking-[0.2em] mb-2 text-center">LOST ARK UTILITY</p>
                  <p className="text-xs text-slate-400 dark:text-white/40 text-center leading-relaxed">로스트아크 고효율 유틸리티 <br/> LOAPANG v1.0.5</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`pt-24 pb-48 px-8 mx-auto flex gap-16 transition-all duration-500 ${activePage === 'home' ? 'max-w-7xl' : 'max-w-6xl'}`}>
        <SidebarAds side="left" />

        <main className="flex-1 w-full min-h-[70vh] relative z-10">
          <AnimatePresence mode="wait">
            {activePage === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="flex flex-col items-center justify-center py-20 mx-auto max-w-4xl"
              >
                <div className="text-center mb-16">
                  <h1 className="text-7xl font-black text-midnight dark:text-white mb-4 tracking-tight">LOAPANG</h1>
                  <p className="text-xl text-slate-400 font-medium">로스트아크 고효율 전적 검색 및 전투 시뮬레이터</p>
                </div>
                
                <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="캐릭터명을 입력하세요"
                    className="w-full h-20 px-10 rounded-3xl bg-white dark:bg-surface border-2 border-slate-200 dark:border-white/10 focus:border-midnight dark:focus:border-white/30 outline-none text-xl font-bold shadow-2xl transition-all dark:text-white placeholder:text-slate-300"
                  />
                  <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-midnight text-white dark:bg-white dark:text-void rounded-2xl hover:bg-midnight-light dark:hover:bg-slate-200 transition-all shadow-lg flex items-center justify-center">
                    <Search size={28} />
                  </button>
                </form>

                <div className="mt-12 flex flex-wrap justify-center gap-3 text-sm font-black">
                  {['#카멘_공략', '#에키드나_골드', '#아크패시브_시뮬', '#경매_계산기'].map(tag => (
                    <span key={tag} className="bg-white dark:bg-surface text-slate-400 px-5 py-2 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-midnight dark:hover:border-white/20 transition-colors cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {activePage === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-black dark:text-white tracking-tight">캐릭터 프로필</h2>
                  <button onClick={() => setActivePage('simulator')} className="px-6 py-3 bg-midnight dark:bg-white text-white dark:text-void rounded-2xl font-black text-base flex items-center gap-2 hover:shadow-xl transition-all">
                    <Calculator size={20} /> 전투 시뮬레이션
                  </button>
                </div>
                <CharacterCard character={characterData} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-surface p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3 dark:text-white">
                      <Shield size={24} className="text-midnight dark:text-white" /> 스킬 & 룬 세팅
                    </h3>
                    <div className="space-y-4">
                      {characterData.skills.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-void rounded-2xl border border-slate-100 dark:border-white/5">
                          <div>
                            <p className="text-base font-bold dark:text-slate-200">{s.name}</p>
                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-wider">{s.tripods.join(' • ')}</p>
                          </div>
                          <span className="text-[10px] font-black px-3 py-1 bg-midnight dark:bg-white dark:text-void text-white rounded-full">{s.rune}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-surface p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3 dark:text-white">
                      <Info size={24} className="text-midnight dark:text-white" /> 보석 세부 정보
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {characterData.gems.slice(0, 10).map((g, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-void rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base text-white ${g.type === 'Damage' ? 'bg-red-500' : 'bg-blue-500'}`}>
                            {g.level}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{g.type === 'Damage' ? '멸화' : '홍염'}</p>
                            <p className="text-sm font-bold dark:text-white truncate max-w-[100px]">{g.skillName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activePage === 'simulator' && (
              <motion.div key="simulator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex items-center gap-5 mb-2">
                  <button onClick={() => setActivePage('profile')} className="p-3 rounded-2xl bg-slate-100 dark:bg-surface hover:bg-slate-200 dark:hover:bg-midnight-dark transition-all dark:text-white">
                    <ChevronRight className="rotate-180" size={24} />
                  </button>
                  <h2 className="text-3xl font-black dark:text-white">데미지 시뮬레이터</h2>
                </div>
                <Simulator character={characterData} />
              </motion.div>
            )}

            {activePage === 'raid' && (
              <motion.div key="raid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                <section>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
                    <div>
                      <h3 className="text-4xl font-black flex items-center gap-4 dark:text-white tracking-tight">
                        <Coins size={42} className="text-midnight dark:text-white" /> 주간 골드 체크리스트
                      </h3>
                      <p className="text-lg text-slate-400 font-semibold mt-2">박스를 클릭하여 이번 주 공략할 레이드를 선택하세요.</p>
                    </div>
                    
                    <div className="relative group overflow-hidden p-8 bg-gradient-to-br from-midnight to-midnight-light dark:from-surface dark:to-void text-white rounded-[2.5rem] shadow-2xl min-w-[300px] border border-white/10 flex flex-col items-end justify-center transition-all hover:scale-[1.02]">
                      <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
                      <p className="text-[11px] font-black opacity-60 uppercase tracking-[0.4em] mb-2">총 예상 수익</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-black tracking-tighter text-yellow-400">{calculateTotalGold().toLocaleString()}</p>
                        <span className="text-2xl font-bold opacity-80">G</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {RAIDS.map(raid => {
                      const selection = selectedRaids.find(r => r.id === raid.id);
                      return (
                        <div 
                          key={raid.id} 
                          onClick={() => toggleRaid(raid.id, 'Normal')}
                          className={`group relative p-10 rounded-[3rem] border-2 transition-all cursor-pointer select-none ${selection ? 'bg-midnight/5 border-midnight dark:bg-surface dark:border-white/20' : 'bg-white dark:bg-surface border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'}`}
                        >
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <p className="text-2xl font-black dark:text-white tracking-tight">{raid.name}</p>
                              <div className="flex gap-3 mt-5">
                                {raid.difficulties.map(d => (
                                  <button 
                                    key={d.type}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleRaid(raid.id, d.type);
                                    }}
                                    className={`px-6 py-2 rounded-full text-xs font-black transition-all ${selection?.diff === d.type ? 'bg-midnight text-white dark:bg-white dark:text-void scale-105 shadow-lg' : 'bg-slate-100 dark:bg-void text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                                  >
                                    {d.type}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {selection && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <CheckCircle2 className="text-midnight dark:text-white" size={32} />
                              </motion.div>
                            )}
                          </div>
                          {selection && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} 
                              animate={{ height: 'auto', opacity: 1 }} 
                              className="space-y-4 pt-6 border-t border-midnight/10 dark:border-white/10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <label className="flex items-center justify-between cursor-pointer p-4 bg-white dark:bg-void rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                                <span className="text-sm font-black dark:text-slate-300">보상 더보기 (Gold 소모)</span>
                                <input 
                                  type="checkbox" 
                                  checked={selection.extra}
                                  onChange={() => toggleExtraReward(raid.id)}
                                  className="w-5 h-5 accent-midnight dark:accent-white"
                                />
                              </label>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </motion.div>
            )}

            {activePage === 'auction' && (
              <motion.div key="auction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                <section>
                  <div className="mb-8">
                    <h3 className="text-3xl font-black flex items-center gap-3 dark:text-white">
                      <Gavel size={32} className="text-midnight dark:text-white" /> 경매 입찰 계산기
                    </h3>
                    <p className="text-sm text-slate-400 font-medium mt-1">경매 낙찰 시의 이득과 분배금을 계산합니다.</p>
                  </div>
                  <div className="bg-white dark:bg-surface p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-8">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">인원 선택</label>
                          <div className="flex gap-2">
                            {['4', '8', '16'].map(m => (
                              <button 
                                key={m}
                                onClick={() => setCalcMode(m as any)}
                                className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border-2 ${calcMode === m ? 'bg-midnight text-white border-midnight dark:bg-white dark:text-void dark:border-white' : 'bg-slate-50 dark:bg-void text-slate-400 border-transparent dark:border-white/5'}`}
                              >
                                {`${m}인`}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">거래소 최저가</label>
                          <input 
                            type="number"
                            value={auctionPrice || ''}
                            onChange={(e) => setAuctionPrice(parseInt(e.target.value) || 0)}
                            className="w-full h-16 px-8 rounded-2xl bg-slate-50 dark:bg-void border-2 border-transparent focus:border-midnight dark:focus:border-white outline-none font-black text-2xl dark:text-white transition-all"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="bg-midnight dark:bg-void p-8 rounded-3xl flex flex-col justify-between space-y-6 text-white shadow-2xl border dark:border-white/10">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black opacity-60 uppercase tracking-widest">입찰 적정가 (선점)</span>
                          <span className="text-3xl font-black text-green-400">{auctionResults.bid.toLocaleString()} G</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/10 pt-6">
                          <span className="text-xs font-black opacity-60 uppercase tracking-widest">분배금 (파티원)</span>
                          <span className="text-2xl font-bold text-yellow-400">+{auctionResults.dividend.toLocaleString()} G</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <SidebarAds side="right" />
      </div>

      <FloatingBanner />

      <footer className="mt-32 border-t border-slate-200 dark:border-white/10 pt-24 pb-20 bg-white dark:bg-surface relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 items-start">
            <div className="space-y-6">
              <h2 className="text-4xl font-black tracking-tighter text-midnight dark:text-white">LOAPANG</h2>
              <p className="text-slate-400 dark:text-slate-500 font-medium leading-relaxed text-sm max-w-xs">
                로스트아크 고효율 전적 검색 및 전투 시뮬레이터. 모험가들의 더 나은 성장을 위해 최적의 데이터를 제공합니다.
              </p>
              <p className="text-slate-300 dark:text-slate-600 font-bold text-[10px] tracking-widest uppercase">
                © 2024 LOAPANG TEAM. ALL RIGHTS RESERVED.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-midnight dark:text-white uppercase tracking-widest">Utility</h4>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setActivePage('profile')} className="text-sm font-bold text-slate-400 hover:text-midnight dark:hover:text-white transition-colors text-left">프로필 검색</button>
                  <button onClick={() => setActivePage('simulator')} className="text-sm font-bold text-slate-400 hover:text-midnight dark:hover:text-white transition-colors text-left">데미지 시뮬레이터</button>
                  <button onClick={() => setActivePage('raid')} className="text-sm font-bold text-slate-400 hover:text-midnight dark:hover:text-white transition-colors text-left">골드 계산기</button>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-midnight dark:text-white uppercase tracking-widest">Legal</h4>
                <div className="flex flex-col gap-2">
                  <a href="#" className="text-sm font-bold text-slate-400 hover:text-midnight dark:hover:text-white transition-colors">이용약관</a>
                  <a href="#" className="text-sm font-bold text-slate-400 hover:text-midnight dark:hover:text-white transition-colors">개인정보처리방침</a>
                </div>
              </div>
            </div>

            <div className="space-y-8 lg:text-right flex flex-col lg:items-end">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-midnight dark:text-white uppercase tracking-widest">Community</h4>
                <div className="flex lg:justify-end gap-4">
                  <a 
                    href="#" 
                    className="group flex items-center gap-3 bg-slate-50 dark:bg-void px-6 py-4 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-[#5865F2] transition-all shadow-sm"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-black text-slate-300 dark:text-white/20 uppercase tracking-widest">Join our</span>
                      <span className="text-sm font-black text-slate-500 dark:text-slate-400 group-hover:text-[#5865F2] transition-colors">DISCORD</span>
                    </div>
                    <svg className="w-6 h-6 text-[#5865F2] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.035 14.035 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01 10.107 10.107 0 0 0 .372.292.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993.023.03.063.04.09.027a19.856 19.856 0 0 0 6.002-3.03.077.077 0 0 0 .032-.056c.498-5.234-.847-9.715-3.418-13.66a.066.066 0 0 0-.032-.027zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <p className="text-slate-400 dark:text-slate-600 font-medium text-[11px] leading-relaxed max-w-xs italic">
                LOAPANG is a fan-made project and is not affiliated with Smilegate RPG. All game assets are property of their respective owners.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
