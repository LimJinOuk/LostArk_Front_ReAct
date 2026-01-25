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

    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const quality = titleInfo.qualityValue ?? -1;

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

    // [수정] 테마 그라데이션에 투명도 적용 (to-transparent 로 변경)
    const themes: any = {
        '일반': { bg: 'from-[#222]/60 to-transparent', border: 'border-white/20', text: 'text-[#ffffff]' },
        '고급': { bg: 'from-[#1a2e1a]/60 to-transparent', border: 'border-[#48c948]/30', text: 'text-[#48c948]' },
        '희귀': { bg: 'from-[#1a2a3e]/60 to-transparent', border: 'border-[#00b0fa]/30', text: 'text-[#00b0fa]' },
        '영웅': { bg: 'from-[#2e1a3e]/60 to-transparent', border: 'border-[#ce43fb]/30', text: 'text-[#ce43fb]' },
        '전설': { bg: 'from-[#41321a]/60 to-transparent', border: 'border-[#f99200]/30', text: 'text-[#f99200]' },
        '유물': { bg: 'from-[#2a1a12]/60 to-transparent', border: 'border-[#a6632d]/50', text: 'text-[#e7a15d]', glow: 'shadow-[#a6632d]/20' },
        '고대': { bg: 'from-[#3d3325]/60 to-transparent', border: 'border-[#e9d2a6]/30', text: 'text-[#c69c6d]', glow: 'shadow-[#e9d2a6]/10' },
        '에스더': { bg: 'from-[#0d2e2e]/60 to-transparent', border: 'border-[#2edbd3]/60', text: 'text-[#2edbd3]', glow: 'shadow-[#2edbd3]/30' }
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
        // [수정] bg-[#111111]/60 정도로 조절 (10은 너무 투명해서 글자가 안 보일 수 있음)
        <div className={`absolute z-[9999] w-[280px] bg-[#111111]/60 backdrop-blur-md border border-white/10 rounded-sm shadow-2xl ${theme.glow} overflow-hidden font-sans ${className}`}>

            {/* --- 상단 헤더 섹션 --- */}
            <div className={`p-2 bg-gradient-to-br ${theme.bg} border-b border-white/5 relative`}>
                {isEsther && <div className="absolute top-0 left-0 w-full h-[1px] bg-[#2edbd3] opacity-30" />}

                <div className="flex gap-2 items-center">
                    <div className="relative shrink-0 w-[50px] h-[50px]">
                        <div className={`w-full h-full overflow-hidden rounded-md border ${theme.border} bg-black/40 relative z-10`}>
                            <img src={itemIcon} className="w-full h-full object-cover transform scale-[1.05]" alt="" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[14px] font-bold leading-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] truncate ${theme.text}`}>
                            {itemName}
                        </h4>
                        <div className="mt-0.3 text-[12px] font-medium text-white/60">
                            {cleanText(itemGrade)}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 본문 콘텐츠 영역 [수정: bg-[#111111] 삭제] --- */}
            <div className="p-3 space-y-3 bg-transparent">

                <div className="space-y-1 pb-3 border-b border-white/10">
                    <div className="text-[12px] text-white/80 font-medium">{itemLevelAndTier}</div>
                    {advRefineObj && (
                        <div className="text-[12px] text-[#ffcf4d] font-bold">
                            {cleanText(advRefineObj.value).split('\n')[0]}
                        </div>
                    )}
                </div>

                {quality !== -1 && (
                    <div className="space-y-1">
                        <div className="flex justify-between items-end px-0.5">
                            <span className="text-white/40 text-[11px] font-bold">품질</span>
                            <span className="text-[14px] font-bold" style={{ color: getQualityColor(quality) }}>{quality}</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${quality}%`,
                                    backgroundColor: getQualityColor(quality),
                                    boxShadow: `0 0 8px ${getQualityColor(quality)}60`
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-4 pt-1">
                    {baseEffectObj?.value?.Element_001 && (
                        <div className="space-y-1">
                            <div className="text-white/30 text-[11px] font-bold">[기본 효과]</div>
                            <div className="text-white/90 text-[12px] leading-relaxed whitespace-pre-line font-medium">
                                {cleanText(baseEffectObj.value.Element_001)}
                            </div>
                        </div>
                    )}

                    {addEffectObj?.value?.Element_001 && (
                        <div className="space-y-1 p-2 bg-white/5 rounded-sm border-l border-white/10">
                            <div className="text-white/30 text-[11px] font-bold">[추가 효과]</div>
                            <div className={`${isEsther ? 'text-[#2edbd3]' : 'text-[#4cdfff]'} text-[12px] font-semibold whitespace-pre-line`}>
                                {cleanText(addEffectObj.value.Element_001)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={`h-[2px] bg-gradient-to-r from-transparent ${isEsther ? 'via-[#2edbd3]/20' : 'via-white/10'} to-transparent`} />
        </div>
    );
};

export default EquipmentTooltip;