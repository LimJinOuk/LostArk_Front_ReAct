import React from 'react';

const cleanText = (str: string) => {
    if (!str) return '';
    return str
        .replace(/<BR>/gi, '\n')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\\r\\n/g, '\n')
        .replace(/\n\s+/g, '\n')
        .trim();
};

interface TooltipProps {
    data: any;
    className?: string;
}

const AccessoryTooltip = ({ data, className = "" }: TooltipProps) => {
    if (!data) return null;

    const elements = Object.values(data) as any[];

    // 데이터 추출
    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const quality = titleInfo.qualityValue ?? -1;
    const itemGradeName = titleInfo.leftStr0?.split(' ')[0] || "고대";
    const itemGradeFull = titleInfo.leftStr0;
    const itemLevelAndTier = cleanText(titleInfo.leftStr2 || "");
    const itemIcon = titleInfo.slotData?.iconPath;

    const bindingInfo = cleanText(data.Element_002?.value || "");
    const tradeInfo = cleanText(data.Element_003?.value || "").replace('|', '');

    const baseEffectObj = elements.find((el: any) =>
        el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000) === '기본 효과'
    );
    const specialEffectObj = elements.find((el: any) =>
        el?.type === 'ItemPartBox' &&
        ["연마 효과", "팔찌 효과", "특수 효과", "추가 효과"].includes(cleanText(el?.value?.Element_000))
    );
    const arcPassiveObj = elements.find((el: any) =>
        el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000).includes('아크 패시브')
    );
    const randomEffectObj = elements.find((el: any) => el?.value?.topStr === "무작위 각인 효과");

    // 인게임 등급별 테마 (방어구와 통일)
    const themes: any = {
        '고대': { bg: 'from-[#2a1a12] via-[#111111] to-[#111111]', text: 'text-[#e7a15d]', border: 'border-[#a6632d]/40' },
        '유물': { bg: 'from-[#412608] via-[#111111] to-[#111111]', text: 'text-[#f99200]', border: 'border-[#f99200]/30' },
        '전설': { bg: 'from-[#362e15] via-[#111111] to-[#111111]', text: 'text-[#f9ae00]', border: 'border-[#f9ae00]/30' },
    };
    const theme = themes[itemGradeName] || themes['고대'];

    const getQualityColor = (q: number) => {
        if (q === 100) return '#FF8000';
        if (q >= 90) return '#CE43FB';
        if (q >= 70) return '#00B0FA';
        if (q >= 30) return '#00D100';
        return '#919191';
    };

    return (
        <div className={`z-[9999] w-[340px] bg-[#111111] border border-[#333] rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-sans ${className}`}>

            {/* --- 상단 헤더 섹션 --- */}
            <div className={`p-4 bg-gradient-to-br ${theme.bg} border-b border-white/5`}>
                <div className="flex gap-4 items-center">
                    {/* 아이콘: 박스 풀 사이즈 */}
                    <div className="relative shrink-0 w-[58px] h-[58px]">
                        <div className={`w-full h-full overflow-hidden rounded-md border ${theme.border} bg-black`}>
                            <img src={itemIcon} className="w-full h-full object-cover transform scale-[1.02]" alt="" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[19px] font-bold leading-tight drop-shadow-md truncate ${theme.text}`}>
                            {itemName}
                        </h4>
                        <div className="mt-1">
                            <div className="text-[13px] font-medium text-[#c6c6c6]">{cleanText(itemGradeFull)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-5 bg-[#111111]">
                {/* 1. 거래 및 귀속 정보 / 아이템 레벨 / 아크 패시브 */}
                <div className="space-y-1 pb-3 border-b border-white/5">
                    <div className="text-[12px] text-[#a9a9a9]">{bindingInfo}</div>
                    <div className="text-[12px] text-[#4cdfff] font-medium">{tradeInfo}</div>

                    {/* 아이템 레벨 정보 */}
                    <div className="text-[13px] text-[#eee] font-medium pt-1">
                        {itemLevelAndTier}
                    </div>

                    {/* 아크 패시브 위치 이동: 글자색 #ffcf4d 적용 */}
                    {arcPassiveObj && (
                        <div className="text-[13px] font-bold text-[#ffcf4d]">{cleanText(arcPassiveObj.value.Element_001)}
                        </div>
                    )}
                </div>

                {/* 2. 품질 바 */}
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

                {/* 4. 효과 정보 섹션 */}
                <div className="space-y-5">
                    {/* 기본 효과 */}
                    {baseEffectObj?.value?.Element_001 && (
                        <div className="space-y-1">
                            <div className="text-[#a9a9a9] text-[12px] font-bold">[기본 효과]</div>
                            <div className="text-[#eee] text-[13px] leading-relaxed whitespace-pre-line font-medium">
                                {cleanText(baseEffectObj.value.Element_001)}
                            </div>
                        </div>
                    )}

                    {/* 연마 / 팔찌 / 특수 효과 (장신구 핵심 포인트 색상) */}
                    {specialEffectObj?.value?.Element_001 && (
                        <div className="space-y-1">
                            <div className="text-[#a9a9a9] text-[12px] font-bold">[{cleanText(specialEffectObj.value.Element_000)}]</div>
                            <div className="text-[#4cdfff] text-[13px] font-medium whitespace-pre-line leading-relaxed">
                                {cleanText(specialEffectObj.value.Element_001)}
                            </div>
                        </div>
                    )}

                    {/* 무작위 각인 (어빌리티 스톤 등) */}
                    {randomEffectObj && (
                        <div className="space-y-2">
                            <div className="text-[#a9a9a9] text-[12px] font-bold">[무작위 각인 효과]</div>
                            <div className="space-y-1.5">
                                {Object.values(randomEffectObj.value.contentStr).map((eff: any, idx: number) => (
                                    <div key={idx} className={`text-[13px] font-medium leading-snug ${eff.contentStr.includes('감소') ? 'text-[#ff6666]' : 'text-[#eee]'}`}>
                                        • {cleanText(eff.contentStr)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* 하단 장식 라인 */}
            <div className="h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
};

export default AccessoryTooltip;