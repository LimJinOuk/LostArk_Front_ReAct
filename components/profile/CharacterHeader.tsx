import React, { useMemo } from 'react';
// lucide-react에서는 실제 아이콘들만 가져와야 합니다.
import { Shield, Swords, Zap, Target, Flame, Trophy, GripVertical } from 'lucide-react';

// 1. 하위 컴포넌트: SlimStat (치명, 특화, 신속)
const SlimStat = ({ icon, label, value }: any) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-xs text-zinc-500 font-bold tracking-tight">{label}</span>
        </div>
        <span className="text-xl font-black">{value}</span>
    </div>
);

// 2. 하위 컴포넌트: SimpleStat (아이템 레벨, 전투력 등)
const SimpleStat = ({ label, value, icon, color = "text-white" }: any) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-zinc-500">
            {icon}
            <span className="text-xs font-black tracking-[0.2em] uppercase">{label}</span>
        </div>
        <span className={`text-5xl font-[1000] tracking-tighter ${color} leading-none`}>{value}</span>
    </div>
);

// 3. 메인 컴포넌트
export const CharacterHeader = ({ character }: { character: any }) => {
    const stats = character.Stats || [];
    const getStat = (type: string) => stats.find((s: any) => s.Type === type)?.Value || "-";

    const lightColors = useMemo(
        () => [
            'rgba(168, 85, 247, 0.45)', 'rgba(232, 103, 50, 0.45)',
            'rgba(30, 58, 138, 0.6)', 'rgba(16, 185, 129, 0.4)',
            'rgba(244, 63, 94, 0.45)', 'rgba(6, 182, 212, 0.45)',
            'rgba(220, 38, 38, 0.4)',
        ],
        []
    );

    const randomColor = useMemo(() => {
        return lightColors[Math.floor(Math.random() * lightColors.length)];
    }, [lightColors]);

    return (
        <div className="relative w-full max-w-8xl mx-auto min-h-[400px] bg-[#0c0e12] text-white p-10 overflow-hidden rounded-2xl border border-white/5 group">

            {/* [모션] 강화된 눈 내리는 효과 (더 크고 하얗게) */}
            <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
                {/* 1층: 가장 큰 눈송이 (가까운 느낌) */}
                <div
                    className="absolute inset-[-100px] opacity-60 animate-snow-fast brightness-[200%]"
                    style={{
                        backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
                        backgroundSize: '800px' // 입자 크기 대폭 확대
                    }}
                />
                {/* 2층: 중간 눈송이 */}
                <div
                    className="absolute inset-[-100px] opacity-40 animate-snow-med brightness-[150%]"
                    style={{
                        backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
                        backgroundSize: '500px'
                    }}
                />
                {/* 3층: 작은 눈송이 (배경) */}
                <div
                    className="absolute inset-[-100px] opacity-20 animate-snow-slow brightness-[100%]"
                    style={{
                        backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')",
                        backgroundSize: '300px'
                    }}
                />
            </div>

            {/* [레이어 1] 캐릭터 이미지 */}
            <div className="absolute right-[-2%] top-[-10%] w-[650px] h-[120%] z-0 animate-soft-float">
                <div className="relative w-full h-full">
                    <div className="absolute inset-y-0 left-0 w-60 bg-gradient-to-r from-[#0c0e12] via-[#0c0e12]/80 to-transparent z-10" />
                    <img
                        src={character.CharacterImage}
                        alt={character.CharacterName}
                        className="w-full h-full object-cover object-top opacity-90 contrast-[1.1] brightness-[0.9] transition-transform duration-1000"
                    />
                </div>
            </div>

            {/* [레이어 2] 콘텐츠 UI */}
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[320px]">
                <div className="flex gap-2">
                    <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider animate-pulse">
                        {character.ServerName}
                    </span>
                    <span className="bg-white/5 backdrop-blur-md px-3 py-1 rounded-md text-xs font-bold text-zinc-400 border border-white/10">
                        {character.CharacterClassName}
                    </span>
                </div>

                <div className="mt-8">
                    <div className="flex items-center gap-2 mb-2 opacity-80">
                        <GripVertical size={16} className="text-zinc-600" />
                        <p className="text-sm text-zinc-500 font-medium tracking-wide italic">{character.Title || "원정대의 희망"}</p>
                    </div>

                    <h1 className="text-7xl font-black tracking-tighter mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        {character.CharacterName}
                    </h1>

                    <div className="flex items-center gap-10">
                        <div className="flex flex-col gap-1 border-r border-white/10 pr-10">
                            <div className="flex items-center gap-2">
                                <Trophy size={16} className="text-amber-500 animate-bounce-subtle" />
                                <span className="text-lg font-black italic">Lv.{character.CharacterLevel}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <SlimStat icon={<Target size={16} className="text-orange-400" />} label="치명" value={getStat("치명")} />
                            <SlimStat icon={<Flame size={16} className="text-rose-400" />} label="특화" value={getStat("특화")} />
                            <SlimStat icon={<Zap size={16} className="text-cyan-400" />} label="신속" value={getStat("신속")} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-auto pt-8">
                    <div className="flex gap-14">
                        <SimpleStat label="아이템 레벨" value={character.ItemAvgLevel} icon={<Shield size={22} />} />
                        <SimpleStat label="전투력" value={character.CombatPower} color="text-rose-500" icon={<Swords size={22} />} />
                        <SimpleStat label="원정대" value={`Lv.${character.ExpeditionLevel}`} icon={<Zap size={22} />} />
                    </div>
                </div>
            </div>

            {/* [레이어 3] 핵심 광원 모션 */}
            <div
                className="absolute -bottom-1/4 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-light-pulse"
                style={{
                    width: '150%',
                    height: '120%',
                    background: `radial-gradient(circle at center, ${randomColor} 0%, transparent 40%)`,
                    mixBlendMode: 'screen',
                    filter: 'blur(120px)',
                }}
            />

            <div className="absolute inset-0 z-30 pointer-events-none bg-gradient-to-t from-[#0c0e12] via-transparent to-transparent opacity-20" />

            {/* CSS 애니메이션 스타일 */}
            <style>{`
                @keyframes light-pulse {
                    0%, 100% { opacity: 0.5; transform: translate(-50%, 0) scale(1); }
                    50% { opacity: 0.8; transform: translate(-50%, -5%) scale(1.1); }
                }
                @keyframes grain {
                    0% { transform: translate(0, 0); }
                    10% { transform: translate(-1%, -1%); }
                    30% { transform: translate(1%, 1%); }
                    50% { transform: translate(-1%, 1%); }
                    70% { transform: translate(1%, -1%); }
                    90% { transform: translate(-1%, 0); }
                    100% { transform: translate(0, 0); }
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                }
                /* 눈 내리는 애니메이션: 위에서 아래로 대각선 흐름 */
                    @keyframes snow-vertical {
                    0% { background-position: 0px 0px; }
                    100% { background-position: 50px 1000px; }
                }

                .animate-snow-fast { animation: snow-vertical 16s linear infinite; }
                .animate-snow-med { animation: snow-vertical 27s linear infinite; }
                .animate-snow-slow { animation: snow-vertical 42s linear infinite; }

                @keyframes ultra-soft-float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(0.1deg); }
                }
                
                @keyframes deep-pulse {
                    0%, 100% { opacity: 0.4; transform: translate(-50%, 5%) scale(1); }
                    50% { opacity: 0.7; transform: translate(-50%, -2%) scale(1.05); }
                }

                    /* 기존 ultra-soft-float 및 deep-pulse는 유지 */
                .animate-soft-float { animation: soft-float 8s ease-in-out infinite; }
                .animate-light-pulse { animation: light-pulse 10s ease-in-out infinite; }
                .animate-grain { animation: grain 1s steps(1) infinite; }
                .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
            `}</style>
        </div>
    );
};