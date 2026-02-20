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

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
        className="w-full h-full"
        initial={{ opacity: 0, y: 10 }}
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
            {/* overflow-x-hidden은 유지하되, 전체 스크롤을 위해 컨테이너 설정 주의 */}
            <div className={`min-h-screen font-sans text-[16px] dark text-white transition-colors duration-700
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

                <div className="pt-[70px] md:pt-24 pb-10 px-0 md:px-8 lg:px-16 mx-auto flex flex-col lg:flex-row gap-0 lg:gap-8 transition-all duration-500 max-w-[2000px]">

                    {/* [왼쪽 영역: 고정 사이드바]
                        lg:sticky와 top 설정을 통해 스크롤 시 고정됨
                    */}
                    <aside className="hidden 2xl:block w-72 shrink-0 lg:sticky lg:top-24 h-fit">
                        <SidebarAds side="left" />
                    </aside>

                    {/* [오른쪽 영역: 메인 콘텐츠]
                        별도의 고정 없이 브라우저 기본 스크롤을 따라감
                    */}
                    <main className="flex-1 w-full min-h-[calc(100vh-100px)]">
                        <AnimatePresence mode="wait">
                            <Routes>
                                <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                                <Route path="/profilePage" element={<PageWrapper><ProfilePage /></PageWrapper>} />
                                <Route path="/raidPage" element={<PageWrapper><RaidPage /></PageWrapper>} />
                                <Route path="/simulatorPage" element={<PageWrapper><SimulatorPage /></PageWrapper>} />
                                <Route path="/auctionPage" element={<PageWrapper><AuctionPage /></PageWrapper>} />
                                <Route path="/rankingPage" element={<PageWrapper><RankingPage /></PageWrapper>} />
                            </Routes>
                        </AnimatePresence>
                    </main>

                    {/* [오른쪽 사이드바 광고: 필요시 고정] */}
                    <aside className="hidden 2xl:block w-72 shrink-0 lg:sticky lg:top-24 h-fit">
                        <SidebarAds side="right" />
                    </aside>
                </div>

                <Footer />
                <FloatingBanner />
            </div>
        </BrowserRouter>
    );
}