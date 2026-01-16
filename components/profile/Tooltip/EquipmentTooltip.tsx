import React from 'react';

const cleanText = (str: string) => {
    if (!str) return '';
    return str
        .replace(/<BR>/gi, '\n')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\n\s+/g, '\n')
        .trim();
};

interface TooltipProps {
    data: any;
    className?: string;
}

const EquipmentTooltip = ({ data, className = "" }: TooltipProps) => {
    if (!data) return null;

    // --- 데이터 추출 ---
    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const quality = titleInfo.qualityValue ?? -1;

    // 등급 판별 (에스더 우선 체크)
    const rawGrade = titleInfo.leftStr0 || "";
    const isEsther = rawGrade.includes('에스더');
    const gradeName = isEsther ? '에스더' : (rawGrade.split(' ')[0] || "고대");

    const itemIcon = titleInfo.slotData?.iconPath;
    const itemGrade = titleInfo.leftStr0;
    const itemLevelAndTier = cleanText(titleInfo.leftStr2 || "");

    const elements = Object.values(data) as any[];

    const baseEffectObj = elements.find((el: any) =>
        el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000) === '기본 효과'
    );
    const addEffectObj = elements.find((el: any) =>
        el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000).includes('추가 효과')
    );
    const advRefineObj = elements.find((el: any) =>
        typeof el?.value === 'string' && el.value.includes('[상급 재련]')
    );

    // 등급별 인게임 테마
    const themes: any = {
        '일반': { bg: 'from-[#222] to-[#111]', border: 'border-white/20', text: 'text-[#ffffff]' },
        '고급': { bg: 'from-[#1a2e1a] to-[#111]', border: 'border-[#48c948]/30', text: 'text-[#48c948]' },
        '희귀': { bg: 'from-[#1a2a3e] to-[#111]', border: 'border-[#00b0fa]/30', text: 'text-[#00b0fa]' },
        '영웅': { bg: 'from-[#2e1a3e] to-[#111]', border: 'border-[#ce43fb]/30', text: 'text-[#ce43fb]' },
        '전설': { bg: 'from-[#41321a] to-[#111]', border: 'border-[#f99200]/30', text: 'text-[#f99200]' },
        '유물': {
            // [기존 고대 스타일을 유물로 적용]
            bg: 'from-[#2a1a12] to-[#111111]',
            border: 'border-[#a6632d]/50',
            text: 'text-[#e7a15d]',
            glow: 'shadow-[#a6632d]/20'
        },
        '고대': {
            // [요청하신 고대 전용 스타일 적용]
            bg: 'from-[#3d3325] to-[#1a1a1c]',
            border: 'border-[#e9d2a6]/30',
            text: 'text-[#c69c6d]',
            glow: 'shadow-[#e9d2a6]/10'
        },
        '에스더': {
            bg: 'from-[#0d2e2e] to-[#111111]',
            border: 'border-[#2edbd3]/60',
            text: 'text-[#2edbd3]',
            glow: 'shadow-[#2edbd3]/30'
        }
    };

    const theme = themes[gradeName] || themes['고대'];

    const getQualityColor = (q: number) => {
        if (q === 100) return '#FF8000';
        if (q >= 90) return '#CE43FB';
        if (q >= 70) return '#00B0FA';
        if (q >= 30) return '#00D100';
        return '#919191';
    };

    return (
        <div className={`absolute z-[9999] w-[340px] bg-[#111111] border border-[#333] rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.9)] ${theme.glow} overflow-hidden font-sans ${className}`}>

            {/* --- 상단 헤더 섹션 --- */}
            <div className={`p-4 bg-gradient-to-br ${theme.bg} border-b border-white/5 relative`}>
            {/* 에스더 상단 광채 라인 */}
            {isEsther && <div className="absolute top-0 left-0 w-full h-[1px] bg-[#2edbd3] opacity-30" />}

            <div className="flex gap-4 items-center">
                {/* 아이콘 섹션 */}
                <div className="relative shrink-0 w-[58px] h-[58px]">
                    <div className={`w-full h-full overflow-hidden rounded-md border ${theme.border} bg-black relative z-10`}>
                        <img src={itemIcon} className="w-full h-full object-cover transform scale-[1.05]" alt="" />
                    </div>
                    {/* 에스더 전용 아이콘 백그라운드 글로우 */}
                    {isEsther && (
                        <div className="absolute inset-[-2px] bg-[#2edbd3] opacity-20 blur-sm rounded-md" />
                    )}
                </div>

                {/* 이름 및 등급 정보 */}
                <div className="flex-1 min-w-0">
                    <h4 className={`text-[19px] font-bold leading-tight drop-shadow-[0_2px_3px_rgba(0,0,0,1)] truncate ${theme.text}`}>
                        {itemName}
                    </h4>
                    <div className="mt-1">
                        <div className="text-[13px] font-medium text-[#c6c6c6]">
                            {cleanText(itemGrade)}
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {/* --- 본문 콘텐츠 영역 --- */}
            <div className="p-4 space-y-4 bg-[#111111]">

                {/* 아이템 레벨 및 상급 재련 정보 */}
                <div className="space-y-1 pb-3 border-b border-white/5">
                    <div className="text-[13px] text-[#eee] font-medium">{itemLevelAndTier}</div>
                    {advRefineObj && (
                        <div className="text-[13px] text-[#ffcf4d] font-medium">
                            {cleanText(advRefineObj.value).split('\n')[0]}
                        </div>
                    )}
                </div>

                {/* 품질 바 섹션 (에스더는 품질 데이터가 없을 때를 대비해 0 이상일 때만 표시하거나, 로직에 따라 조정 가능) */}
                {quality !== -1 && (
                    <div className="space-y-1">
                        <div className="flex justify-between items-end">
                            <span className="text-[#a9a9a9] text-[12px]">품질</span>
                            <span className="text-[14px] font-bold" style={{ color: getQualityColor(quality) }}>{quality}</span>
                        </div>
                        <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden border border-black/60">
                            <div
                                className="h-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${quality}%`,
                                    backgroundColor: getQualityColor(quality),
                                    boxShadow: `0 0 10px ${getQualityColor(quality)}80`
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* [기본 효과] & [추가 효과] */}
                <div className="space-y-4 pt-2">
                    {baseEffectObj?.value?.Element_001 && (
                        <div className="space-y-1">
                            <div className="text-[#a9a9a9] text-[12px] font-bold">[기본 효과]</div>
                            <div className="text-[#eee] text-[13px] leading-relaxed whitespace-pre-line">
                                {cleanText(baseEffectObj.value.Element_001)}
                            </div>
                        </div>
                    )}

                    {addEffectObj?.value?.Element_001 && (
                        <div className="space-y-1">
                            <div className="text-[#a9a9a9] text-[12px] font-bold">[추가 효과]</div>
                            <div className={`${isEsther ? 'text-[#2edbd3]' : 'text-[#4cdfff]'} text-[13px] font-medium whitespace-pre-line`}>
                                {cleanText(addEffectObj.value.Element_001)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 하단 장식용 마무리 라인 */}
            <div className={`h-[2px] bg-gradient-to-r from-transparent ${isEsther ? 'via-[#2edbd3]/20' : 'via-white/5'} to-transparent`} />
        </div>
    );
};

export default EquipmentTooltip;