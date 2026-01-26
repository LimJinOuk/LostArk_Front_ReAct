import React, { useMemo } from "react";
import { Target, Flame, Zap, Trophy } from 'lucide-react';

type Props = {
    character: any;
};

const StatRow = ({ label, value, icon, color = "text-white" }: any) => (
    <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-1.5 text-zinc-500">
            {React.cloneElement(icon as React.ReactElement, { size: 13 })}
            <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
        </div>
        <span className={`text-[22px] font-[1000] tracking-tighter ${color} leading-none tabular-nums`}>
            {value}
        </span>
    </div>
);

const parseTitle = (titleStr: string) => {
    if (!titleStr) return { iconName: null, text: "원정대의 희망" };
    const imgMatch = titleStr.match(/src='([^']+)'/);
    const iconName = imgMatch ? imgMatch[1] : null;
    const pureText = titleStr.replace(/<[^>]*>?/gm, '').replace(/<\/?[^>]+(>|$)/g, "").trim();
    return { iconName, text: pureText };
};

export const SimulatorCharacterHeader: React.FC<Props> = ({ character }) => {
    if (!character) return null;

    const { iconName, text } = useMemo(() => parseTitle(character.Title), [character.Title]);
    const stats = useMemo(() => character?.Stats ?? character?.stats ?? [], [character]);

    const getStat = (type: string) => {
        const v = stats.find((s: any) => s?.Type === type || s?.type === type)?.Value
            ?? stats.find((s: any) => s?.Type === type || s?.type === type)?.value
            ?? "0";
        return String(v);
    };

    // 캐릭터 테마에 맞춘 광원 색상 추출
    const lightColors = ["rgba(168, 85, 247, 0.4)", "rgba(232, 103, 50, 0.4)", "rgba(30, 58, 138, 0.5)"];
    const randomColor = useMemo(() => lightColors[Math.floor(Math.random() * lightColors.length)], []);

    return (
        <div className="relative w-full max-w-[420px] mx-auto min-h-[320px] bg-[#0c0e12] text-white p-7 overflow-hidden rounded-2xl border border-white/5 shadow-2xl flex flex-col group">

            {/* ✅ 배경 이펙트 */}
            <div className="absolute inset-0 z-[1] pointer-events-none opacity-20">
                <div className="absolute inset-0 animate-scanline bg-gradient-to-b from-transparent via-white/10 to-transparent h-20 w-full" />
                <div className="absolute inset-[-100px] animate-slow-drift"
                     style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')", backgroundSize: '600px' }} />
            </div>

            {/* ✅ 캐릭터 이미지 및 상단 광원 효과 */}
            <div className="absolute right-[-20%] bottom-[-15%] w-[420px] h-[110%] z-[2] pointer-events-none transition-transform duration-1000">
                <div className="relative w-full h-full">
                    {/* 🌟 캐릭터 뒤쪽 광원 (Backlight) */}
                    <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-white/5 blur-[80px] animate-pulse" />

                    {/* 🌟 캐릭터 앞쪽 흐르는 광원 (Overlight) */}
                    <div className="absolute inset-0 z-20 overflow-hidden">
                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-light-sweep opacity-30"
                             style={{ background: `conic-gradient(from 0deg, transparent, ${randomColor}, transparent 40%)` }} />
                    </div>

                    {/* 이미지 마스크 */}
                    <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#0c0e12] via-[#0c0e12]/80 to-transparent z-10" />
                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0c0e12] to-transparent z-10" />

                    <img src={character.CharacterImage} alt={character.CharacterName}
                         className="w-full h-full object-cover object-top brightness-90 relative z-0" />
                </div>
            </div>

            {/* ✅ 메인 콘텐츠 */}
            <div className="relative z-10 flex flex-col h-full flex-1">
                <div className="flex items-center gap-2 mb-4">
                    <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                        {character.ServerName || "Server"}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-l border-white/10 pl-2">
                        {character.CharacterClassName}
                    </span>
                </div>

                <div className="mb-10">
                    <div className="flex items-center gap-1.5 mb-1.5 opacity-90">
                        {iconName && <img src={`https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/emoticon/${iconName}.png`} className="w-5 h-5 object-contain" alt="" />}
                        <span className="text-xs font-bold text-zinc-400 tracking-tight">{text}</span>
                    </div>
                    <h1 className="text-3xl font-[1000] tracking-tighter leading-none mb-3 drop-shadow-xl uppercase">
                        {character.CharacterName}
                    </h1>
                    <div className="flex items-center gap-1.5 font-bold text-amber-500">
                        <Trophy size={14} className="animate-pulse" />
                        <span className="text-sm text-white/90 font-black">Lv.{character.CharacterLevel}</span>
                    </div>
                </div>

                {/* ✅ 스탯 영역 */}
                <div className="mt-auto pt-6 border-t border-white/5 relative z-20 flex flex-col gap-5 max-w-[180px]">
                    <StatRow label="치명" value={getStat("치명")} icon={<Target className="text-orange-400" />} />
                    <StatRow label="특화" value={getStat("특화")} icon={<Flame className="text-rose-400" />} />
                    <StatRow label="신속" value={getStat("신속")} icon={<Zap className="text-cyan-400" />} />
                </div>
            </div>

            <style>{`
                @keyframes scanline { from { transform: translateY(-100%); } to { transform: translateY(300%); } }
                .animate-scanline { animation: scanline 10s linear infinite; }
                @keyframes slow-drift { 0% { background-position: 0px 0px; } 100% { background-position: 40px 40px; } }
                .animate-slow-drift { animation: slow-drift 20s linear infinite; }
                /* 🌟 캐릭터를 훑고 지나가는 광원 애니메이션 */
                @keyframes light-sweep {
                    0% { transform: rotate(0deg); opacity: 0; }
                    20% { opacity: 0.4; }
                    50% { opacity: 0.1; }
                    100% { transform: rotate(360deg); opacity: 0; }
                }
                .animate-light-sweep { animation: light-sweep 12s linear infinite; }
            `}</style>
        </div>
    );
};