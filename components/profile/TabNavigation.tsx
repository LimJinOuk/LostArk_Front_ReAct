import React from "react";

type Props = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

export const TabNavigation: React.FC<Props> = ({ activeTab, setActiveTab }) => {
    const tabs = ["전투", "스킬", "아크 패시브", "캐릭터"];

    return (
        <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            {/* 🔹 탭 뒤 카드(필) 섹션 */}
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
        </div>
    );
};
