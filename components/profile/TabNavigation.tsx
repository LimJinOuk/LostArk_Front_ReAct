import React from "react";

type Props = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onUpdate: () => void;      // 추가
    onSimulator: () => void;   // 추가
};

export const TabNavigation: React.FC<Props> = ({ activeTab, setActiveTab, onUpdate, onSimulator }) => {
    const tabs = ["전투", "스킬", "아크 패시브", "캐릭터"];

    return (
        <div className="flex items-center w-full border-b border-white/5 pb-3">
            {/* 🔹 탭 섹션 (왼쪽) */}
            <div className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur">
                {tabs.map((t) => {
                    const isActive = activeTab === t;
                    return (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={[
                                "px-4 py-2 rounded-xl text-[13px] font-black tracking-widest transition-all",
                                isActive
                                    ? "bg-emerald-500/25 text-emerald-200 shadow-[0_0_0_1px_rgba(16,185,129,0.3)]"
                                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5",
                            ].join(" ")}
                        >
                            {t}
                        </button>
                    );
                })}
            </div>

            {/* 🔹 버튼 섹션 (오른쪽 끝으로 밀기) */}
            <div className="ml-auto flex items-center gap-2">
                <button
                    onClick={onSimulator}
                    className="px-4 py-1.5 bg-zinc-100 text-zinc-950 text-[13px] font-bold rounded-lg hover:bg-[#7C3AED] hover:text-white transition-all active:scale-95 shadow-md"
                >
                    시뮬레이터 전환
                </button>
                <button
                    onClick={onUpdate}
                    className="px-4 py-1.5 bg-zinc-900/40 text-zinc-200 text-[13px] font-bold rounded-lg border border-white/10 hover:bg-zinc-800/60 transition-all active:scale-95 shadow-md"
                >
                    업데이트
                </button>
            </div>
        </div>
    );
};