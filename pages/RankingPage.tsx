import React from 'react';
import { ShieldCheck, Sword, Star, Crown } from 'lucide-react';

interface Ranker {
    id: number;
    name: string;
    class: string; // 클래스 (예: 슬레이어, 바드)
    server: string; // 서버 (예: 카제로스, 루페온)
    level: string; // 아이템 레벨
    guild: string;
}

const RANKING_DATA: Ranker[] = [
    { id: 1, name: "모코코사냥꾼", class: "슬레이어", server: "카제로스", level: "1675.00", guild: "전설" },
    { id: 2, name: "데런의희망", class: "블레이드", server: "루페온", level: "1672.50", guild: "무적" },
    { id: 3, name: "바드공주님", class: "바드", server: "실리안", level: "1670.00", guild: "조화" },
    { id: 4, name: "강화는운빨", class: "워로드", server: "아브렐슈드", level: "1665.00", guild: "운빨겜" },
    { id: 5, name: "카단팬클럽", class: "카마인", server: "카단", level: "1662.50", guild: "질서" },
];

const RankingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#121619] text-[#e1e1e1] font-sans p-6">
            <div className="max-w-4xl mx-auto">

                {/* 상단 헤더 */}
                <header className="flex justify-between items-end border-b border-[#3a3f44] pb-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#d4ad63] flex items-center gap-2">
                            <Sword size={28} /> 전체 전투 레벨 랭킹
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">아크라시아의 최강자를 확인하세요.</p>
                    </div>
                    <div className="text-right text-xs text-gray-500">
                        기준일: 2026.02.02 21:00 (KST)
                    </div>
                </header>

                {/* Top 3 강조 카드 섹션 */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {RANKING_DATA.slice(0, 3).map((player, index) => (
                        <div
                            key={player.id}
                            className={`relative overflow-hidden rounded-lg border p-5 flex flex-col items-center transition-all hover:translate-y-[-5px] 
              ${index === 0 ? 'bg-[#1c1f23] border-[#d4ad63] shadow-[0_0_15px_rgba(212,173,99,0.3)]' : 'bg-[#181c20] border-[#3a3f44]'}`}
                        >
                            {index === 0 && <Crown className="text-[#d4ad63] absolute top-2 right-2" size={24} />}
                            <div className="w-16 h-16 bg-[#2a2f35] rounded-full mb-3 flex items-center justify-center border border-gray-600">
                                <span className="text-xs font-bold text-gray-400">{player.class}</span>
                            </div>
                            <h3 className="text-lg font-bold truncate">{player.name}</h3>
                            <p className="text-xs text-gray-500 mb-2">@{player.server}</p>
                            <div className="text-[#d4ad63] font-bold text-xl italic">Lv. {player.level}</div>
                            <div className="mt-2 px-3 py-1 bg-[#24292e] rounded text-[10px] text-gray-400">길드: {player.guild}</div>
                        </div>
                    ))}
                </div>

                {/* 하위 랭킹 테이블 */}
                <div className="bg-[#181c20] rounded-lg border border-[#3a3f44]">
                    <table className="w-full text-left">
                        <thead>
                        <tr className="border-b border-[#3a3f44] text-xs text-gray-500 uppercase">
                            <th className="px-6 py-4 font-medium">순위</th>
                            <th className="px-6 py-4 font-medium">캐릭터</th>
                            <th className="px-6 py-4 font-medium text-center">아이템 레벨</th>
                            <th className="px-6 py-4 font-medium">길드</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2f35]">
                        {RANKING_DATA.map((player, index) => (
                            <tr key={player.id} className="hover:bg-[#1c2227] transition-colors group">
                                <td className="px-6 py-4 font-bold text-gray-400 group-hover:text-white">
                                    {index + 1}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-[#e1e1e1]">{player.name}</span>
                                        <span className="text-[11px] text-gray-500">{player.server} | {player.class}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                    <span className="text-[#d4ad63] font-mono font-bold tracking-tight">
                      {player.level}
                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <ShieldCheck size={14} className="text-blue-400" />
                                        {player.guild}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default RankingPage;