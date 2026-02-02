import React from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-slate-200 dark:border-white/5 pt-16 pb-12 bg-white dark:bg-void relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-8">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

                    {/* Brand Section (5 cols) */}
                    <div className="md:col-span-5 space-y-5">
                        <h2 className="text-3xl font-black tracking-tighter text-midnight dark:text-white">LOAPANG</h2>
                        <p className="text-sm font-medium text-slate-400 dark:text-zinc-500 max-w-xs leading-relaxed">
                            아크라시아의 모험가들을 위한 <br />
                            고효율 전투 시뮬레이터 및 데이터 분석 도구
                        </p>
                        <div className="flex flex-col gap-1 pt-4 border-t border-slate-100 dark:border-white/5 w-fit">
                            <p className="text-[10px] font-bold text-slate-300 dark:text-zinc-800 italic uppercase tracking-widest">
                                Not affiliated with Smilegate RPG.
                            </p>
                        </div>
                    </div>

                    {/* Quick Links (4 cols) */}
                    <div className="md:col-span-4 grid grid-cols-2 gap-8 md:pt-2">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-midnight dark:text-white uppercase tracking-[0.2em] opacity-40">Legal</h4>
                            <ul className="space-y-3 text-[13px] font-bold text-slate-400 dark:text-zinc-600">
                                <li className="hover:text-midnight dark:hover:text-zinc-300 cursor-pointer transition-colors">이용약관</li>
                                <li className="hover:text-midnight dark:hover:text-zinc-400 cursor-pointer transition-colors">개인정보처리방침</li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-midnight dark:text-white uppercase tracking-[0.2em] opacity-40">Service</h4>
                            <ul className="space-y-3 text-[13px] font-bold text-slate-400 dark:text-zinc-600">
                                <li className="hover:text-midnight dark:hover:text-zinc-300 cursor-pointer transition-colors">패치노트</li>
                                <li className="hover:text-midnight dark:hover:text-zinc-300 cursor-pointer transition-colors">가이드</li>
                            </ul>
                        </div>
                    </div>

                    {/* Discord Section (3 cols) */}
                    <div className="md:col-span-3 flex flex-col md:items-end gap-5">
                        <h4 className="text-[10px] font-black text-midnight dark:text-white uppercase tracking-[0.2em] opacity-40">Community</h4>
                        <a
                            href="#"
                            className="group inline-flex items-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] px-6 py-3 rounded-2xl text-white transition-all shadow-lg shadow-[#5865F2]/20 text-xs font-black tracking-tight w-fit"
                        >
                            {/* Discord Official SVG Icon */}
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 127.14 96.36"
                                fill="currentColor"
                                className="group-hover:scale-110 transition-transform duration-300"
                            >
                                <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.71,32.65-1.82,56.6,0.48,80.1a105.73,105.73,0,0,0,32.22,16.26,77.7,77.7,0,0,0,7.21-11.73,66.58,66.58,0,0,1-11.44-5.46c1,0.73,1.94,1.48,2.83,2.26a74.92,74.92,0,0,0,64.59,0c0.89-0.78,1.82-1.53,2.82-2.26a66.29,66.29,0,0,1-11.41,5.43,77.05,77.05,0,0,0,7.17,11.71,105.47,105.47,0,0,0,32.27-16.25C129.58,52.47,126,28.78,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
                            </svg>

                            JOIN DISCORD
                        </a>
                        <p className="text-[10px] font-medium text-slate-300 dark:text-zinc-700 md:text-right">
                            질문이나 피드백은 <br /> 디스코드 서버를 이용해 주세요.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;