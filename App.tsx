import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { SidebarAds } from './components/layout/SidebarAds';
import { FloatingBanner } from './components/layout/FloatingBanner';
import { Sidebar } from './components/layout/SideMenuBar';
import HomePage from './pages/HomePage';
import RaidPage from './pages/RaidPage';
import AuctionPage from './pages/auctionPage';
import ProfilePage from './pages/ProfilePage';
import { SimulatorPage } from "@/pages/SimulatorPage";
import RankingPage from './pages/RankingPage';

// 모바일 성능을 고려한 애니메이션 최적화
const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        className="w-full h-full"
        initial={{ opacity: 0, y: 10 }} // 모바일에서는 y축 이동을 줄이는 것이 더 깔끔함
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
    >
        {children}
    </motion.div>
);

export default function App() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isExploding, setIsExploding] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        root.classList.add('dark');
        document.body.style.backgroundColor = '#09090b';
    }, []);

    return (
        <BrowserRouter>
            <div className={`min-h-screen font-sans text-[16px] dark text-white transition-colors duration-700 overflow-x-hidden
          ${isExploding ? 'bg-[#0a0507]' : 'bg-zinc-950'}`}>

                <Header
                    setIsMenuOpen={setIsMenuOpen}
                    isExploding={isExploding}
                    setIsExploding={setIsExploding}
                />

                <Sidebar
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                />

                {/* [핵심 수정]
              1. px-4 md:px-16 -> 모바일은 좌우 여백 최소화
              2. pt-20 md:pt-24 -> 헤더 높이에 맞춘 상단 여백
              3. gap-0 lg:gap-8 -> 모바일에서 광고가 없을 땐 갭 제거
          */}
                <div className="pt-[70px] md:pt-24 pb-10 px-0 md:px-8 lg:px-16 mx-auto flex flex-col lg:flex-row gap-0 lg:gap-8 transition-all duration-500 max-w-[2000px]">

                    {/* 왼쪽 사이드바 광고 (2xl 미만에서 숨김 및 공간 제거) */}
                    <aside className="hidden 2xl:block w-72 shrink-0">
                        <SidebarAds side="left" />
                    </aside>

                    {/* 메인 콘텐츠 영역 (모바일에서 full-width 보장) */}
                    <main className="flex-1 w-full min-h-screen">
                        <AnimatePresence mode="wait">
                            <Routes>
                                <Route path="/" element={
                                    <PageWrapper><HomePage /></PageWrapper>
                                } />
                                <Route path="/profilePage" element={
                                    <PageWrapper><ProfilePage /></PageWrapper>
                                } />
                                <Route path="/raidPage" element={
                                    <PageWrapper><RaidPage /></PageWrapper>
                                } />
                                <Route path="/simulatorPage" element={
                                    <PageWrapper><SimulatorPage /></PageWrapper>
                                } />
                                <Route path="/auctionPage" element={
                                    <PageWrapper><AuctionPage /></PageWrapper>
                                } />
                                <Route path="/rankingPage" element={
                                    <PageWrapper><RankingPage /></PageWrapper>
                                } />
                            </Routes>
                        </AnimatePresence>
                    </main>

                    {/* 오른쪽 사이드바 광고 */}
                    <aside className="hidden 2xl:block w-72 shrink-0">
                        <SidebarAds side="right" />
                    </aside>
                </div>

                <Footer />
                <FloatingBanner />
            </div>
        </BrowserRouter>
    );
}