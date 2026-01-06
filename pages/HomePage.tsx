import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomePageProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    handleSearch: (e: React.FormEvent) => void;
}

const HomePage: React.FC<HomePageProps> = ({ searchQuery, setSearchQuery, handleSearch }) => {
    const hashtags = ["#카멘_공략", "#에키드나_골드", "#아크패시브_시뮬", "#경매_계산기"];

    return (
        <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center pt-6 min-h-screen w-full max-w-5xl mx-auto px-4 transition-colors duration-300"
        >
            {/* 1. 로고 섹션 */}
            <div className="text-center mb-16">
                <h1 className="text-7xl font-black text-[#2D1B4E] dark:text-white tracking-tighter mb-6 transition-colors">
                    LOAPANG
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium tracking-tight transition-colors">
                    로스트아크 고효율 전적 검색 및 전투 시뮬레이터
                </p>
            </div>

            {/* 2. 검색창 섹션: 하얀 배경일 때 미드나잇 퍼플 포인트 적용 */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative mb-12 group">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="캐릭터명을 입력하세요"
                        className="
        w-full h-[86px] pl-10 pr-24 rounded-[32px]
        bg-white dark:bg-[#151515]
        border-2 border-[#2D1B4E]/20 dark:border-zinc-700/80
        focus:border-[#2D1B4E] dark:focus:border-zinc-500
        outline-none text-[22px] font-bold
        text-[#2D1B4E] dark:text-white

        /* 🚀 placeholder 색상을 slate-500으로 수정 */
        placeholder:text-slate-300 dark:placeholder:text-slate-300/70
        placeholder:font-bold

        transition-all shadow-xl dark:shadow-2xl
    "
                    />
                    <button
                        type="submit"
                        className="
                            absolute right-4 w-[60px] h-[60px]
                            bg-[#2D1B4E] dark:bg-white
                            text-white dark:text-black
                            rounded-[22px] hover:scale-105 active:scale-95
                            transition-all flex items-center justify-center shadow-md
                        "
                    >
                        <Search size={30} strokeWidth={3} />
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

export default HomePage;