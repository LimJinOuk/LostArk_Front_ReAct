import React, { useMemo } from "react";
import { GripVertical, Target, Flame, Zap } from 'lucide-react';

type Props = {
    character: any;
};

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

    const lightColors = ["rgba(168, 85, 247, 0.25)", "rgba(232, 103, 50, 0.25)", "rgba(30, 58, 138, 0.35)", "rgba(16, 185, 129, 0.25)", "rgba(244, 63, 94, 0.25)"];
    const randomColor = useMemo(() => lightColors[Math.floor(Math.random() * lightColors.length)], []);

    return (
        <div className="relative w-full max-w-8xl mx-auto h-[240px] bg-[#0c0e12] text-white p-8 overflow-hidden rounded-2xl border border-white/5 group shadow-2xl">

            {/* ✅ 신규 배경 모션 1: 무한히 회전하는 미세 입자 (Cosmic Drift) */}
            <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
                <div className="absolute inset-[-100%] animate-slow-spin opacity-30"
                     style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: '100px 100px' }} />
                <div className="absolute inset-[-100%] animate-slow-spin-reverse opacity-20"
                     style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: '150px 150px' }} />
            </div>

            {/* ✅ 신규 배경 모션 2: 흐르는 스캔라인 (Simulator 컨셉) */}
            <div className="absolute inset-0 z-[2] pointer-events-none bg-grid-white/[0.02] bg-[size:40px_40px]" />
            <div className="absolute inset-0 z-[2] pointer-events-none animate-scanline bg-gradient-to-b from-transparent via-white/[0.03] to-transparent h-20 w-full" />

            {/* 캐릭터 이미지 */}
            <div className="absolute right-[-2%] top-[-20%] w-[500px] h-[140%] z-[3] animate-soft-float">
                <div className="relative w-full h-full">
                    <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#0c0e12] via-[#0c0e12]/70 to-transparent z-10" />
                    <img src={character.CharacterImage} alt={character.CharacterName} className="w-full h-full object-cover object-top opacity-80 contrast-[1.1]" />
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="relative z-10 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-3">
                    <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        {character.ServerName || "Server"}
                    </span>
                    <div className="flex items-center border-l border-white/10 pl-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{character.CharacterClassName}</span>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <GripVertical size={14} className="text-zinc-600" />
                        {iconName && <img src={`https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/emoticon/${iconName}.png`} className="w-5 h-5 object-contain opacity-80" alt="" />}
                        <span className="text-sm font-bold tracking-tight text-zinc-400">{text}</span>
                    </div>
                    <h1 className="text-[40px] font-black tracking-tighter mb-4 drop-shadow-lg uppercase leading-tight">{character.CharacterName}</h1>
                </div>

                <div className="flex gap-4 items-center mt-2">
                    <CompactStat icon={<Target size={16} />} label="치명" value={getStat("치명")} iconColor="text-orange-400" />
                    <CompactStat icon={<Flame size={16} />} label="특화" value={getStat("특화")} iconColor="text-rose-400" />
                    <CompactStat icon={<Zap size={16} />} label="신속" value={getStat("신속")} iconColor="text-cyan-400" />
                </div>
            </div>

            {/* 유동적인 광원 모션 */}
            <div className="absolute -bottom-1/2 left-1/4 z-0 pointer-events-none animate-nebula-pulse"
                 style={{ width: '120%', height: '120%', background: `radial-gradient(circle at center, ${randomColor} 0%, transparent 60%)`, filter: 'blur(100px)', mixBlendMode: 'screen' }} />

            <style>{`
                @keyframes slow-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-slow-spin { animation: slow-spin 120s linear infinite; }
                @keyframes slow-spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                .animate-slow-spin-reverse { animation: slow-spin-reverse 180s linear infinite; }
                @keyframes scanline { from { transform: translateY(-100%); } to { transform: translateY(300%); } }
                .animate-scanline { animation: scanline 8s linear infinite; }
                @keyframes nebula-pulse { 0%, 100% { opacity: 0.3; transform: scale(1) translate(0, 0); } 50% { opacity: 0.6; transform: scale(1.1) translate(-5%, -5%); } }
                .animate-nebula-pulse { animation: nebula-pulse 15s ease-in-out infinite; }
                @keyframes soft-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
                .animate-soft-float { animation: soft-float 6s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

const CompactStat = ({ icon, label, value, iconColor }: { icon: React.ReactNode; label: string; value: string; iconColor: string }) => (
    <div className="flex items-center gap-2.5 px-4 first:pl-0 border-l border-white/5 first:border-0 z-20">
        <div className={`${iconColor} opacity-80`}>{icon}</div>
        <div className="flex items-baseline gap-1.5">
            <span className="text-[13px] font-black text-zinc-500 uppercase tracking-tighter">{label}</span>
            <span className="text-[24px] font-[1000] tracking-tighter leading-none text-white tabular-nums">{value}</span>
        </div>
    </div>
);