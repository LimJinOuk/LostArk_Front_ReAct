import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t border-slate-200 dark:border-white/5 py-8 md:py-12 bg-white dark:bg-[#0c0c0d] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">

                {/* 1. PC 전용 레이아웃 (중간 화면 이상에서만 표시) */}
                <div className="hidden md:flex flex-row items-start justify-between gap-4">
                    {/* Left: Brand */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-[900] tracking-tighter text-midnight dark:text-white">LOAPANG</h2>
                        <p className="text-[11px] font-medium text-slate-400 dark:text-zinc-600 tracking-tight">
                            © 2026 LOAPANG. All game data belongs to Smilegate RPG.
                        </p>
                    </div>

                    {/* Middle: Navigation */}
                    <div className="flex gap-12">
                        <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black text-slate-300 dark:text-zinc-700 uppercase tracking-widest">Legal</span>
                            <div className="flex flex-col gap-1.5 text-[12px] font-bold text-slate-500 dark:text-zinc-500">
                                <span className="hover:text-indigo-500 cursor-pointer transition-colors">이용약관</span>
                                <span className="hover:text-indigo-500 cursor-pointer transition-colors">개인정보처리방침</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            <span className="text-[10px] font-black text-slate-300 dark:text-zinc-700 uppercase tracking-widest">Service</span>
                            <div className="flex flex-col gap-1.5 text-[12px] font-bold text-slate-500 dark:text-zinc-500">
                                <span className="hover:text-indigo-500 cursor-pointer transition-colors">패치노트</span>
                                <span className="hover:text-indigo-500 cursor-pointer transition-colors">가이드</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Discord */}
                    <div className="flex flex-col items-end gap-3">
                        <a href="#" className="inline-flex items-center gap-2.5 bg-[#5865F2] hover:bg-[#4752C4] px-5 py-2.5 rounded-xl text-white text-[11px] font-black tracking-tight transition-all shadow-md shadow-[#5865F2]/10">
                            <svg width="16" height="16" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6,0.48,80.1a105.73,105.73,0,0,0,32.22,16.26,77.7,77.7,0,0,0,7.21-11.73,66.58,66.58,0,0,1-11.44-5.46c1,0.73,1.94,1.48,2.83,2.26a74.92,74.92,0,0,0,64.59,0c0.89-0.78,1.82-1.53,2.82-2.26a66.29,66.29,0,0,1-11.41,5.43,77.05,77.05,0,0,0,7.17,11.71,105.47,105.47,0,0,0,32.27-16.25C129.58,52.47,126,28.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
                            Discord
                        </a>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 text-right leading-tight">
                            질문이나 피드백은 <br /> 디스코드 서버를 이용해 주세요.
                        </p>
                    </div>
                </div>

                {/* 2. 모바일 전용 레이아웃 (작은 화면에서만 표시, 세로 길이 최소화) */}
                <div className="flex md:hidden flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h2 className="text-lg font-[900] tracking-tighter text-midnight dark:text-white">LOAPANG</h2>
                            <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-600">© 2026 LOAPANG.</p>
                        </div>
                        <a href="#" className="inline-flex items-center gap-2.5 bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2.5 rounded-xl text-white text-[12px] font-black tracking-tight transition-all shadow-md shadow-[#5865F2]/10">
                            <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor">
                                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6,0.48,80.1a105.73,105.73,0,0,0,32.22,16.26,77.7,77.7,0,0,0,7.21-11.73,66.58,66.58,0,0,1-11.44-5.46c1,0.73,1.94,1.48,2.83,2.26a74.92,74.92,0,0,0,64.59,0c0.89-0.78,1.82-1.53,2.82-2.26a66.29,66.29,0,0,1-11.41,5.43,77.05,77.05,0,0,0,7.17,11.71,105.47,105.47,0,0,0,32.27-16.25C129.58,52.47,126,28.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
                            Discord

                        </a>
                    </div>

                    <nav className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-bold text-slate-500 dark:text-zinc-500 border-t border-slate-100 dark:border-white/5 pt-4">
                        <a href="#" className="hover:text-indigo-500">이용약관</a>
                        <a href="#" className="hover:text-indigo-500">개인정보처리방침</a>
                        <a href="#" className="hover:text-indigo-500">패치노트</a>
                        <a href="#" className="hover:text-indigo-500">가이드</a>
                    </nav>
                </div>

            </div>
        </footer>
    );
};

export default Footer;