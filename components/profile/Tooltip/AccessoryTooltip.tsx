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

// --- 연마 등급 기준표 적용 ---
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

    // 효과 섹션 탐색
    const baseEffectObj = elements.find((el: any) => el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000) === '기본 효과');
    const specialEffectObj = elements.find((el: any) => el?.type === 'ItemPartBox' && ["연마 효과", "팔찌 효과", "특수 효과", "추가 효과"].includes(cleanText(el?.value?.Element_000)));
    const arcPassiveObj = elements.find((el: any) => el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000).includes('아크 패시브'));

    // 등급별 테마 (앞선 요청에 맞춘 고대 전용 색상)
    const themes: any = {
        '고대': { bg: 'from-[#3d3325] via-[#1a1a1c] to-[#111]', text: 'text-[#d6aa71]', border: 'border-[#d6aa71]/50' },
        '유물': { bg: 'from-[#2a1a12] via-[#111] to-[#111]', text: 'text-[#e7a15d]', border: 'border-[#a6632d]/40' },
        '전설': { bg: 'from-[#362e15] via-[#111] to-[#111]', text: 'text-[#f9ae00]', border: 'border-[#f9ae00]/30' },
    };
    const theme = themes[itemGradeName] || themes['고대'];

    // 연마 효과 텍스트 색상 판별 함수
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
            let colorClass = "text-blue-400"; // 기본 색상 (하늘색)

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
        <div className={`z-[9999] w-[340px] bg-[#111111] border border-[#333] rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden font-sans ${className}`}>
            {/* 헤더 섹션 */}
            <div className={`p-4 bg-gradient-to-br ${theme.bg} border-b border-white/5`}>
                <div className="flex gap-4 items-center">
                    <div className="relative shrink-0 w-[58px] h-[58px]">
                        <div className={`w-full h-full overflow-hidden rounded-md border-2 ${theme.border} bg-black`}>
                            <img src={itemIcon} className="w-full h-full object-cover" alt="" />
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
                {/* 귀속/거래/레벨 정보 */}
                <div className="space-y-1 pb-3 border-b border-white/5">
                    <div className="text-[12px] text-[#a9a9a9]">{bindingInfo}</div>
                    <div className="text-[12px] text-[#4cdfff] font-medium">{tradeInfo}</div>
                    <div className="text-[13px] text-[#eee] font-medium pt-1">{itemLevelAndTier}</div>
                    {arcPassiveObj && (
                        <div className="text-[13px] font-bold text-[#ffcf4d]">{cleanText(arcPassiveObj.value.Element_001)}</div>
                    )}
                </div>

                {/* 품질 바 */}
                {quality !== -1 && (
                    <div className="space-y-1">
                        <div className="flex justify-between items-end">
                            <span className="text-[#a9a9a9] text-[12px]">품질</span>
                            <span className="text-[14px] font-bold" style={{ color: getQualityColorHex(quality) }}>{quality}</span>
                        </div>
                        <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden border border-black">
                            <div className="h-full transition-all duration-700" style={{ width: `${quality}%`, backgroundColor: getQualityColorHex(quality), boxShadow: `0 0 8px ${getQualityColorHex(quality)}80` }} />
                        </div>
                    </div>
                )}

                {/* 효과 정보 섹션 */}
                <div className="space-y-5">
                    {baseEffectObj?.value?.Element_001 && (
                        <div className="space-y-1">
                            <div className="text-[#a9a9a9] text-[12px] font-bold">[기본 효과]</div>
                            <div className="text-[#eee] text-[13px] leading-relaxed whitespace-pre-line font-medium">
                                {cleanText(baseEffectObj.value.Element_001)}
                            </div>
                        </div>
                    )}

                    {specialEffectObj?.value?.Element_001 && (
                        <div className="space-y-1">
                            <div className="text-[#a9a9a9] text-[12px] font-bold">[{cleanText(specialEffectObj.value.Element_000)}]</div>
                            <div className="text-[13px] font-medium whitespace-pre-line leading-relaxed">
                                {renderGrindEffect(cleanText(specialEffectObj.value.Element_001))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
    );
};

export default AccessoryTooltip;