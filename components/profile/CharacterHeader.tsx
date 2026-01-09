import React from 'react';

export const CharacterHeader = ({ character }: { character: any }) => {
    const data = {
        name: character.CharacterName,
        server: character.ServerName,
        class: character.CharacterClassName,
        title: character.Title || "칭호 없음",
        itemLevel: character.ItemAvgLevel,
        combatPower: character.CombatPower,
        battleLevel: character.CharacterLevel,
        expeditionLevel: character.ExpeditionLevel,
        image: character.CharacterImage
    };

    return (
        <div className="relative bg-zinc-900/30 rounded-[2.5rem] p-10 border border-white/[0.05] overflow-hidden">

            {/* 1. 배경 이미지: 이름 뒤에 은은하게 배치 (Opacity 최적화) */}
            <div className="absolute top-[-20%] left-[15%] w-[40%] h-[150%] opacity-[0.15] pointer-events-none">
                <img
                    src={data.image}
                    className="w-full h-full object-cover object-top blur-xl grayscale-[0.5]"
                    alt=""
                />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">

                {/* 2. 왼쪽: 아바타 크기 확대 및 정보 배치 */}
                <div className="flex items-center gap-10">
                    <div className="relative group">
                        {/* 이미지 외곽에 미세한 글로우 추가 */}
                        <div className="absolute -inset-1 bg-white/5 rounded-[2rem] blur-md"></div>
                        <div className="relative w-40 h-40 bg-zinc-950 rounded-[2rem] overflow-hidden ring-1 ring-white/10 shadow-2xl">
                            <img
                                src={data.image}
                                className="w-full h-full object-cover object-[center_15%] scale-[1.5] translate-y-6"
                                alt={data.name}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-[14px] font-bold tracking-wide">
                            <span className="text-zinc-500">@{data.server}</span>
                            <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                            <span className="text-emerald-500">{data.class}</span>
                        </div>

                        <h1 className="text-5xl font-black text-white tracking-tighter italic leading-none">
                            {data.name}
                        </h1>

                        <p className="text-[17px] font-medium text-zinc-400 opacity-80">
                            {data.title}
                        </p>
                    </div>
                </div>

                {/* 3. 우측 스탯: 크기를 키우고 간격을 조정하여 중앙 공백 해결 */}
                <div className="grid grid-cols-3 gap-12 lg:gap-20 bg-white/[0.02] px-10 py-8 rounded-[2rem] border border-white/[0.03]">
                    {[
                        { label: '아이템 레벨', val: data.itemLevel, color: 'text-zinc-100', size: 'text-3xl' },
                        { label: '전투력', val: data.combatPower.toLocaleString(), color: 'text-zinc-100', size: 'text-3xl' },
                        { label: '전투 / 원정대', val: `${data.battleLevel} / ${data.expeditionLevel}`, color: 'text-zinc-400', size: 'text-2xl' },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col gap-3 min-w-fit">
                            <p className="text-[13px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                                {stat.label}
                            </p>
                            <p className={`${stat.size} font-black tracking-tighter ${stat.color}`}>
                                {stat.val}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};