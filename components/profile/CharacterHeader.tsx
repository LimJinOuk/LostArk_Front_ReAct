import React, { useMemo } from 'react';
import { Shield, Swords, Zap, Target, Flame, Trophy, GripVertical, Users } from 'lucide-react';

// 1. 공통 스탯 컴포넌트 (크기를 통일하여 좌우 대칭 유지)
const StatRow = ({ label, value, icon, color = "text-white", isSmall = false }: any) => (
    <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-1.5 text-zinc-500">
            {React.cloneElement(icon as React.ReactElement, { size: 13 })}
            <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
        </div>
        <span className={`text-base font-[1000] tracking-tighter ${color} leading-none`}>
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

export const CharacterHeader = ({ character }: { character: any }) => {
    const { iconName, text } = useMemo(() => parseTitle(character.Title), [character.Title]);
    const stats = character.Stats || [];
    const getStat = (type: string) => stats.find((s: any) => s.Type === type)?.Value || "-";

    const lightColors = ['rgba(168, 85, 247, 0.45)', 'rgba(30, 58, 138, 0.6)', 'rgba(244, 63, 94, 0.45)'];
    const randomColor = useMemo(() => lightColors[Math.floor(Math.random() * lightColors.length)], []);

    return (
        <div className="relative w-full max-w-[420px] mx-auto min-h-[280px] bg-[#0c0e12] text-white p-6 overflow-hidden rounded-2xl border border-white/5 shadow-2xl flex flex-col">

            {/* 배경 효과 */}
            <div className="absolute inset-0 z-[1] pointer-events-none opacity-30">
                <div className="absolute inset-[-100px] animate-snow-fast"
                     style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')", backgroundSize: '600px' }} />
            </div>

            {/* 캐릭터 이미지 (오른쪽 배치) */}
            <div className="absolute right-[-25%] bottom-[-38%] w-[450px] h-[480px] z-0 pointer-events-none">
                <div className="relative w-full h-full">
                    <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-r from-[#0c0e12] via-[#0c0e12]/80 to-transparent z-10" />
                    <img src={character.CharacterImage} alt={character.CharacterName}
                         className="w-full h-full object-cover object-top contrast-[1.1] animate-soft-float scale-[1.1]" />
                </div>
            </div>

            {/* 콘텐츠 레이어 */}
            <div className="relative z-20 flex flex-col h-full flex-1">

                {/* 상단 뱃지 영역 */}
                <div className="flex flex-wrap items-center gap-1.5 mb-5">
                    <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                        {character.ServerName}
                    </span>
                    <span className="bg-white/5 px-2 py-0.5 rounded text-[9px] font-black text-zinc-300 border border-white/10">
                        {character.CharacterClassName}
                    </span>
                </div>

                {/* 이름 및 칭호 */}
                <div className="mb-8">
                    <div className="flex items-center gap-1.5 mb-1 opacity-90">
                        {iconName && (
                            <img src={`https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/emoticon/${iconName}.png`}
                                 className="w-6 h-6 object-contain shadow-pink-500/20 shadow-lg" alt="title" />
                        )}
                        <span className="text-[11px] font-bold text-pink-300 uppercase tracking-widest">{text}</span>
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter leading-none mb-2 drop-shadow-md">
                        {character.CharacterName}
                    </h1>
                    <div className="flex items-center gap-1.5 font-bold italic text-amber-500">
                        <Trophy size={14} />
                        <span className="text-base text-white">Lv.{character.CharacterLevel}</span>
                    </div>
                </div>

                {/* [핵심 수정] 하단 데이터: 좌우 나란히 배치 (3행 2열 구조) */}
                <div className="pt-2 flex flex-col gap-4 max-w-[200px]">

                    {/* 1행: 아이템 레벨 | 치명 */}
                    <div className="flex items-center">
                        <StatRow label="아이템 레벨" value={character.ItemAvgLevel} icon={<Shield />} />
                        <StatRow label="치명" value={getStat("치명")} icon={<Target className="text-orange-400" />} />
                    </div>

                    {/* 2행: 전투력 | 특화 */}
                    <div className="flex items-center">
                        <StatRow label="전투력" value={character.CombatPower} color="text-rose-500" icon={<Swords />} />
                        <StatRow label="특화" value={getStat("특화")} icon={<Flame className="text-rose-400" />} />
                    </div>

                    {/* 3행: 원정대 레벨 | 신속 */}
                    <div className="flex items-center">
                        <StatRow label="원정대" value={`Lv.${character.ExpeditionLevel}`} icon={<Zap />} />
                        <StatRow label="신속" value={getStat("신속")} icon={<Zap className="text-cyan-400" />} />
                    </div>

                </div>
            </div>

            {/* 하단 글로우 */}
            <div className="absolute -bottom-1/3 left-0 z-10 pointer-events-none animate-light-pulse opacity-40 blur-[80px]"
                 style={{ width: '100%', height: '100%', background: `radial-gradient(circle at center, ${randomColor} 0%, transparent 50%)` }} />

            <style>{`
                @keyframes snow-vertical { 0% { background-position: 0px 0px; } 100% { background-position: 50px 1000px; } }
                .animate-snow-fast { animation: snow-vertical 16s linear infinite; }
                .animate-light-pulse { animation: light-pulse 8s ease-in-out infinite; }
                @keyframes light-pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
                .animate-soft-float { animation: soft-float 6s ease-in-out infinite; }
                @keyframes soft-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            `}</style>
        </div>
    );
};