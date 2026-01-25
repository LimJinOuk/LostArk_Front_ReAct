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

const thresholds: Record<string, { 상: number; 중: number; 하: number }> = {
    '추가 피해': { 상: 2.6, 중: 1.6, 하: 0.6 },
    '적에게 주는 피해': { 상: 2.0, 중: 1.2, 하: 0.55 },
    '치명타 적중률': { 상: 1.55, 중: 0.95, 하: 0.4 },
    '치명타 피해': { 상: 4.0, 중: 2.4, 하: 1.1 },
    '조화 게이지 획득량': { 상: 2.6, 중: 1.6, 하: 0.6 },
    '세레나데, 신앙, 조화 게이지 획득량': { 상: 2.6, 중: 1.6, 하: 0.6 },
    '낙인력': { 상: 2.6, 중: 1.6, 하: 0.6 },
    '파티원 회복 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
    '파티원 보호막 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
    '아군 공격력 강화 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
    '아군 피해량 강화 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
    '공격력_PCT': { 상: 1.55, 중: 0.95, 하: 0.4 },
    '공격력_FIXED': { 상: 390, 중: 195, 하: 80 },
    '무기 공격력_PCT': { 상: 3.0, 중: 1.8, 하: 0.8 },
    '무기 공격력_FIXED': { 상: 960, 중: 480, 하: 195 },
    '최대 생명력': { 상: 4000, 중: 2400, 하: 1100 },
    '최대 마나': { 상: 45, 중: 27, 하: 12 },
    '상태이상 공격 지속시간': { 상: 2.6, 중: 1.6, 하: 0.6 },
    '전투 중 생명력 회복량': { 상: 125, 중: 75, 하: 34 }
};

interface TooltipProps {
    data: any;
    className?: string;
}

const AccessoryTooltip = ({ data, className = "" }: TooltipProps) => {
    if (!data) return null;

    const elements = Object.values(data) as any[];

    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const quality = titleInfo.qualityValue ?? -1;
    const itemGradeName = titleInfo.leftStr0?.split(' ')[0] || "고대";
    const itemGradeFull = titleInfo.leftStr0;
    const itemLevelAndTier = cleanText(titleInfo.leftStr2 || "");
    const itemIcon = titleInfo.slotData?.iconPath;

    const bindingInfo = cleanText(data.Element_002?.value || "");
    const tradeInfo = cleanText(data.Element_003?.value || "").replace('|', '');

    const baseEffectObj = elements.find((el: any) => el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000) === '기본 효과');
    const specialEffectObj = elements.find((el: any) => el?.type === 'ItemPartBox' && ["연마 효과", "팔찌 효과", "특수 효과", "추가 효과"].includes(cleanText(el?.value?.Element_000)));
    const arcPassiveObj = elements.find((el: any) => el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000).includes('아크 패시브'));

    // [수정] 헤더 테마 투명화
    const themes: any = {
        '고대': { bg: 'from-[#3d3325]/60 to-transparent', text: 'text-[#d6aa71]', border: 'border-[#d6aa71]/50' },
        '유물': { bg: 'from-[#2a1a12]/60 to-transparent', text: 'text-[#e7a15d]', border: 'border-[#a6632d]/40' },
        '전설': { bg: 'from-[#362e15]/60 to-transparent', text: 'text-[#f9ae00]', border: 'border-[#f9ae00]/30' },
    };
    const theme = themes[itemGradeName] || themes['고대'];

    const renderGrindEffect = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, i) => {
            const match = line.match(/([가-힣\s,]+)\s*([\+\-]?[\d\.]+)(%?)/);
            if (!match) return <div key={i}>{line}</div>;

            const name = match[1].trim();
            const value = parseFloat(match[2]);
            const isPercent = match[3] === '%';

            let targetKey = name;
            if (name === '공격력') targetKey = isPercent ? '공격력_PCT' : '공격력_FIXED';
            else if (name === '무기 공격력') targetKey = isPercent ? '무기 공격력_PCT' : '무기 공격력_FIXED';

            const criteria = thresholds[targetKey];
            let colorClass = "text-blue-400";

            if (criteria) {
                if (value >= criteria.상) colorClass = "text-yellow-400 font-bold";
                else if (value >= criteria.중) colorClass = "text-purple-400 font-bold";
                else if (value >= criteria.하) colorClass = "text-blue-400";
            }

            return <div key={i} className={colorClass}>{line}</div>;
        });
    };

    const getQualityColorHex = (q: number) => {
        if (q === 100) return '#FF8000';
        if (q >= 90) return '#CE43FB';
        if (q >= 70) return '#00B0FA';
        if (q >= 30) return '#00D100';
        return '#919191';
    };

    return (
        <div
            className={`z-[9999] w-[280px] border border-white/10 rounded-sm shadow-2xl backdrop-blur-md overflow-hidden font-sans ${className}`}
            style={{ backgroundColor: 'rgba(17, 17, 17, 0.6)' }} // 확실한 60% 투명도 적용
        >
            {/* 헤더 섹션 */}
            <div className={`p-2 bg-gradient-to-br ${theme.bg} border-b border-white/5`}>
                <div className="flex gap-4 items-center">
                    <div className="relative shrink-0 w-[50px] h-[50px]">
                        <div className={`w-full h-full overflow-hidden rounded-md border-2 ${theme.border} bg-black/40`}>
                            <img src={itemIcon} className="w-full h-full object-cover" alt="" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[14px] font-bold leading-tight drop-shadow-md truncate ${theme.text}`}>
                            {itemName}
                        </h4>
                        <div className="mt-1">
                            <div className="text-[12px] font-medium text-white/60">{cleanText(itemGradeFull)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 본문 콘텐츠 영역 */}
            <div className="p-3 space-y-3 bg-transparent">
                <div className="space-y-1 pb-3 border-b border-white/5">
                    <div className="text-[11px] text-white/40">{bindingInfo}</div>
                    <div className="text-[11px] text-[#4cdfff] font-medium">{tradeInfo}</div>
                    <div className="text-[12px] text-white font-medium pt-1">{itemLevelAndTier}</div>
                    {arcPassiveObj && (
                        <div className="text-[12px] font-bold text-[#ffcf4d]">{cleanText(arcPassiveObj.value.Element_001)}</div>
                    )}
                </div>

                {quality !== -1 && (
                    <div className="space-y-1">
                        <div className="flex justify-between items-end">
                            <span className="text-white/40 text-[11px]">품질</span>
                            <span className="text-[12px] font-bold" style={{ color: getQualityColorHex(quality) }}>{quality}</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full transition-all duration-700" style={{ width: `${quality}%`, backgroundColor: getQualityColorHex(quality), boxShadow: `0 0 8px ${getQualityColorHex(quality)}80` }} />
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {baseEffectObj?.value?.Element_001 && (
                        <div className="space-y-1">
                            <div className="text-white/30 text-[11px] font-bold">[기본 효과]</div>
                            <div className="text-white/90 text-[12px] leading-relaxed whitespace-pre-line font-medium">
                                {cleanText(baseEffectObj.value.Element_001)}
                            </div>
                        </div>
                    )}

                    {specialEffectObj?.value?.Element_001 && (
                        <div className="space-y-1">
                            <div className="text-white/30 text-[11px] font-bold">[{cleanText(specialEffectObj.value.Element_000)}]</div>
                            {/* 박스 스타일 제거: 텍스트만 노출 */}
                            <div className="text-[12px] font-medium whitespace-pre-line leading-relaxed pl-1">
                                {renderGrindEffect(cleanText(specialEffectObj.value.Element_001))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
};

export default AccessoryTooltip;