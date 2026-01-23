import React from "react";
import { RefreshCw, Layout } from 'lucide-react';

type Props = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onUpdate: () => void;
    onSimulator: () => void;
};

export const TabNavigation: React.FC<Props> = ({ activeTab, setActiveTab, onUpdate, onSimulator }) => {
    const tabs = ["전투", "스킬", "아크 패시브", "캐릭터"];

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* 🔹 탭 메뉴 섹션: 420px 너비에 맞춰 4개 메뉴를 한 줄(4열)로 배치 */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-black/20 rounded-2xl border border-white/5">
                {tabs.map((t) => {
                    const isActive = activeTab === t;
                    return (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`
                                py-2.5 rounded-xl text-[11px] font-black tracking-tighter transition-all duration-300
                                ${isActive
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 translate-y-[-1px]"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}
                            `}
                        >
                            {t}
                        </button>
                    );
                })}
            </div>

            {/* 🔹 버튼 섹션: 하단에 가로로 배치 (탭 메뉴보다 시각적 무게감을 낮춤) */}
            <div className="flex gap-2">
                <button
                    onClick={onSimulator}
                    className="group flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-100 text-zinc-950 text-[11px] font-black rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-95 shadow-md"
                >
                    <Layout size={14} className="group-hover:rotate-12 transition-transform" />
                    시뮬레이터
                </button>
                <button
                    onClick={onUpdate}
                    className="group flex-[0.6] flex items-center justify-center gap-2 py-3 bg-zinc-900/80 text-zinc-400 text-[11px] font-bold rounded-xl border border-white/5 hover:border-zinc-500 hover:text-zinc-200 transition-all active:scale-95"
                >
                    <RefreshCw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
                    갱신
                </button>
            </div>
        </div>
    );
};