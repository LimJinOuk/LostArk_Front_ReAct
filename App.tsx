  import React, { useState, useEffect } from 'react';
  import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
  import { AnimatePresence, motion } from 'framer-motion';
  import Header from './components/layout/Header';
  import Footer from './components/layout/Footer';
  import { SidebarAds } from './components/layout/SidebarAds';
  import { FloatingBanner } from './components/layout/FloatingBanner';
  import {Sidebar} from  './components/layout/SideMenuBar';
  import HomePage from './pages/HomePage';
  import RaidPage from './pages/RaidPage';
  import AuctionPage from './pages/auctionPage';
  import ProfilePage from './pages/ProfilePage'; // 새로 만든 프로필 페이지
  import { SimulatorPage } from "@/pages/SimulatorPage";
  import { MOCK_CHARACTER } from './constants';

  // 애니메이션 래퍼 (페이지 전환 효과용)
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
  );

  export default function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 다크 모드 고정 적용
    useEffect(() => {
      const root = document.documentElement;
      root.classList.add('dark');
      document.body.style.backgroundColor = '#09090b';
    }, []);

    return (
        <BrowserRouter>
          <div className="min-h-screen font-sans text-[16px] dark bg-zinc-950 text-white overflow-x-hidden">
            <Header
                setIsMenuOpen={setIsMenuOpen}
            />
            {/* 사이드바 컴포넌트 삽입 */}
            <Sidebar
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
            //width를 max-w-[2190px]에서 조절
            <div className="pt-20 md:pt-24 pb-10 px-4 md:px-16 mx-auto flex flex-col lg:flex-row gap-4 lg:gap-8 transition-all duration-500 max-w-[2000px]">
              {/* 왼쪽 사이드바 */}
              <div className="hidden 2xl:block w-72 shrink-0">
                <SidebarAds side="left" />
              </div>

              <main className="flex-1 w-full min-h-[60vh] relative z-10">
                <AnimatePresence mode="wait">
                  <Routes>
                    {/* 1. 홈 페이지 */}
                    <Route path="/" element={
                      <PageWrapper>
                        <HomePage />
                      </PageWrapper>
                    } />

                    {/* 2. 캐릭터 프로필 페이지 (URL 파라미터 사용 권장) */}
                    <Route path="/profilePage" element={
                      <PageWrapper>
                        <ProfilePage />
                      </PageWrapper>
                    } />

                    {/* 3. 레이드 페이지 */}
                    <Route path="/raidPage" element={
                      <PageWrapper>
                        <RaidPage />
                      </PageWrapper>
                    } />

                    <Route
                        path="/simulatorPage"
                        element={
                          <PageWrapper>
                            <SimulatorPage />
                          </PageWrapper>
                        }
                    />


                    {/* 5. 경매 계산기 */}
                    <Route path="/auctionPage" element={
                      <PageWrapper>
                        <AuctionPage />
                      </PageWrapper>
                    } />
                  </Routes>
                </AnimatePresence>
              </main>

              {/* 오른쪽 사이드바 */}
              <div className="hidden 2xl:block w-72 shrink-0">
                <SidebarAds side="right" />
              </div>
            </div>

            <Footer />
            <FloatingBanner />
          </div>
        </BrowserRouter>
    );
  }