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
    const gradeName = titleInfo.leftStr0?.split(' ')[0] || "고대";
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

    // 등급별 인게임 테마 (더 어둡고 묵직하게 수정)
    const themes: any = {
        '고대': {
            bg: 'from-[#2a1a12] via-[#111111] to-[#111111]',
            text: 'text-[#e7a15d]',
            border: 'border-[#a6632d]/40'
        },
        '유물': {
            bg: 'from-[#412608] via-[#111111] to-[#111111]',
            text: 'text-[#f99200]',
            border: 'border-[#f99200]/30'
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
        <div className={`absolute z-[9999] w-[340px] bg-[#111111] border border-[#333] rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-sans ${className}`}>

            {/* --- 상단 헤더 섹션 (로스트아크 특유의 그라데이션) --- */}
            <div className={`p-4 bg-gradient-to-br ${theme.bg} border-b border-white/5`}>
                <div className="flex gap-4 items-center">
                    {/* 아이콘: 박스에 꽉 채우기 */}
                    <div className="relative shrink-0 w-[58px] h-[58px]">
                        <div className={`w-full h-full overflow-hidden rounded-md border ${theme.border} bg-black`}>
                            <img src={itemIcon} className="w-full h-full object-cover transform scale-[1.02]" alt="" />
                        </div>
                    </div>

                    {/* 이름 및 등급 정보 */}
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[19px] font-bold leading-tight drop-shadow-md truncate ${theme.text}`}>
                            {itemName}
                        </h4>
                        <div className="mt-1 space-y-0.5">
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

                {/* 품질 바 섹션 */}
                {quality !== -1 && (
                    <div className="space-y-1">
                        <div className="flex justify-between items-end">
                            <span className="text-[#a9a9a9] text-[12px]">품질</span>
                            <span className="text-[14px] font-bold" style={{ color: getQualityColor(quality) }}>{quality}</span>
                        </div>
                        <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden border border-black">
                            <div
                                className="h-full transition-all duration-700"
                                style={{
                                    width: `${quality}%`,
                                    backgroundColor: getQualityColor(quality),
                                    boxShadow: `0 0 8px ${getQualityColor(quality)}80`
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
                            <div className="text-[#4cdfff] text-[13px] font-medium whitespace-pre-line">
                                {cleanText(addEffectObj.value.Element_001)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 하단 장식용 로아 스타일 마무리 라인 */}
            <div className="h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
};

export default EquipmentTooltip;