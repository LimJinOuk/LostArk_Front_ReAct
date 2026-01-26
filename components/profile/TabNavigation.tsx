import React from "react";
import { RefreshCw, Layout } from 'lucide-react';

type Props = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onUpdate: () => void;
    onSimulator: () => void;
    // 쿨타임 관련 Props 추가
    isCooldown?: boolean;
    timeLeft?: number;
};

export const TabNavigation: React.FC<Props> = ({
                                                   activeTab,
                                                   setActiveTab,
                                                   onUpdate,
                                                   onSimulator,
                                                   isCooldown = false,
                                                   timeLeft = 0
                                               }) => {
    const tabs = ["전투", "스킬", "아크 패시브", "캐릭터"];

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-black/40 rounded-xl border border-white/5">
                {tabs.map((t) => {
                    const isActive = activeTab === t;
                    return (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`
                                py-2.5 rounded-lg text-[11px] font-black tracking-tighter transition-all duration-200
                                ${isActive
                                ? "bg-blue-950 text-blue-100 shadow-lg shadow-blue-950/80"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}
                            `}
                        >
                            {t}
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-1.5">
                <button
                    onClick={onSimulator}
                    className="group flex-[1.2] flex items-center justify-center gap-1.5 py-2.5 bg-zinc-200 text-zinc-950 text-[10px] font-black rounded-lg hover:bg-blue-500 hover:text-white transition-all active:scale-[0.97] shadow-sm"
                >
                    <Layout size={12} className="group-hover:rotate-6 transition-transform" />
                    시뮬레이터로 전환
                </button>

                {/* 갱신 버튼: 쿨타임 상태에 따라 스타일 및 텍스트 변경 */}
                <button
                    onClick={onUpdate}
                    disabled={isCooldown}
                    className={`
                        group flex-[0.8] flex items-center justify-center gap-1.5 py-2.5 rounded-lg border transition-all text-[10px] font-bold
                        ${isCooldown
                        ? "bg-zinc-800/40 text-zinc-600 border-white/5 cursor-not-allowed"
                        : "bg-zinc-900/60 text-zinc-500 border-white/5 hover:border-zinc-700 hover:text-zinc-300 active:scale-[0.97]"
                    }
                    `}
                >
                    <RefreshCw
                        size={11}
                        className={`transition-transform duration-700 ${isCooldown ? "animate-spin-slow opacity-50" : "group-hover:rotate-180"}`}
                    />
                    {isCooldown ? `${timeLeft}s` : "갱신"}
                </button>
            </div>
        </div>
    );
};