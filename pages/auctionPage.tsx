import React from 'react';
import { Calculator, Gavel, Trophy, ChevronRight } from 'lucide-react';

const RaidPage = () => {
    return (
        <div className="max-w-5xl mx-auto space-y-12 py-10">
            <div className="text-center space-y-4">
                <h2 className="text-5xl font-black italic tracking-tighter">RAID & AUCTION</h2>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">효율적인 전리품 분배를 위한 계산 도구</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Auction Calculator Card */}
                <div className="bg-surface p-10 rounded-[3rem] border border-white/5 hover:border-emerald-500/30 transition-all group">
                    <Gavel className="text-emerald-500 mb-6" size={40} />
                    <h3 className="text-2xl font-black mb-4">경매 분배금 계산기</h3>
                    <div className="space-y-4">
                        <div className="bg-zinc-900 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">아이템 시세 입력</p>
                            <input type="number" className="bg-transparent w-full text-2xl font-black outline-none" placeholder="0" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-black text-zinc-600 uppercase">4인 기준 입찰가</p>
                                <p className="text-lg font-black text-emerald-400 mt-1">0 G</p>
                            </div>
                            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-black text-zinc-600 uppercase">8인 기준 입찰가</p>
                                <p className="text-lg font-black text-emerald-400 mt-1">0 G</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Raid Rewards Card (Placeholder) */}
                <div className="bg-zinc-900/30 p-10 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                    <Trophy className="text-zinc-700 mb-4" size={48} />
                    <h3 className="text-xl font-black text-zinc-500 italic">RAID REWARDS DATABASE</h3>
                    <p className="text-sm text-zinc-600 mt-2 font-medium">관문별 보상 데이터 업데이트 중입니다.</p>
                </div>
            </div>
        </div>
    );
};

export default RaidPage;