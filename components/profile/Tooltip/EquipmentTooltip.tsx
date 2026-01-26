import React, { useLayoutEffect, useRef, useState } from 'react';

const cleanText = (str: any) => {
    if (!str) return '';
    const target = typeof str === 'string' ? str : JSON.stringify(str);
    return target
        .replace(/<P ALIGN='CENTER'>/gi, '')
        .replace(/<\/P>/gi, '\n')
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
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [positionStyle, setPositionStyle] = useState<string>("top-0");
    const [coords, setCoords] = useState({ top: 0, left: 0, opacity: 0, maxHeight: 'auto' });

    useLayoutEffect(() => {
        if (tooltipRef.current && tooltipRef.current.parentElement) {
            const tooltip = tooltipRef.current;
            const parent = tooltip.parentElement;
            const parentRect = parent.getBoundingClientRect();

            // --- 설정값 (프로젝트 상황에 맞게 조절하세요) ---
            const HEADER_HEIGHT = 64; // 페이지 상단 고정 헤더 높이
            const BOTTOM_MARGIN = 40; // 하단 네비게이션 바 및 안전 마진
            const SIDE_MARGIN = 20;   // 최소 여백

            const viewportHeight = window.innerHeight;
            const scrollY = window.scrollY;

            // 1. 가용 범위 계산 (Safe Area)
            const safeTopLimit = HEADER_HEIGHT + 10;
            const safeBottomLimit = viewportHeight - BOTTOM_MARGIN;
            const availableHeight = safeBottomLimit - safeTopLimit;

            // 2. 기본 위치 설정 (부모 아래쪽)
            let finalTop = parentRect.bottom + 8;
            const finalLeft = parentRect.left; // 가로 위치 (필요시 보정 가능)

            const tooltipHeight = tooltip.offsetHeight;

            // 3. 상/하 위치 결정 및 높이 보정
            const spaceBelow = safeBottomLimit - parentRect.bottom;
            const spaceAbove = parentRect.top - safeTopLimit;

            let finalMaxHeight = availableHeight;

            if (spaceBelow < tooltipHeight && spaceAbove > spaceBelow) {
                // [위로 배치] 상단 헤더에 잘리지 않게 처리
                const preferredTop = parentRect.top - tooltipHeight - 8;
                finalTop = Math.max(safeTopLimit, preferredTop);
                finalMaxHeight = parentRect.top - finalTop - 8; // 부모 요소 위까지만

                // 만약 툴팁이 너무 길어 상단 제한에 걸리면 높이 제한
                if (preferredTop < safeTopLimit) {
                    finalMaxHeight = parentRect.top - safeTopLimit - 8;
                }
            } else {
                // [아래로 배치] 하단 바에 잘리지 않게 처리
                finalTop = parentRect.bottom + 8;
                finalMaxHeight = safeBottomLimit - finalTop - 10;
            }

            // 4. 최종 좌표 적용 (fixed 포지션이므로 scrollY를 더하지 않음)
            setCoords({
                top: finalTop,
                left: finalLeft,
                opacity: 1,
                maxHeight: `${Math.floor(finalMaxHeight)}px`
            });
        }
    }, [data]);
    if (!data) return null;

    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const quality = titleInfo.qualityValue ?? -1;
    const itemIcon = titleInfo.slotData?.iconPath;
    const itemGrade = cleanText(titleInfo.leftStr0 || "");
    const itemLevelAndTier = cleanText(titleInfo.leftStr2 || "");

    const gradeName = itemGrade.includes('에스더') ? '에스더' : (itemGrade.split(' ')[0] || "고대");
    const elements = Object.values(data) as any[];

    const findByTitle = (key: string) =>
        elements.find(el => cleanText(el?.value?.Element_000 || "").includes(key))?.value?.Element_001;

    const findSingleText = (keywords: string[]) =>
        elements.filter(el => el?.type === 'SingleTextBox' && keywords.some(k => String(el.value).includes(k)))
            .map(el => cleanText(el.value));

    const baseEffect = findByTitle('기본 효과');
    const addEffect = findByTitle('추가 효과');
    const stoneBonus = findByTitle('세공 단계 보너스');
    const arkPassive = findByTitle('아크 패시브 포인트');
    const advRefine = elements.find(el => String(el?.value).includes('[상급 재련]'))?.value;
    const engraveGroup = elements.find(el => el?.type === 'IndentStringGroup')?.value?.Element_000;

    const topInfos = findSingleText(['전용', '귀속', '거래 제한', '티어 4']);
    const bottomInfos = findSingleText(['느낌이 난다', '내구도', '[제작]', '판매불가', '분해불가']);

    const themes: any = {
        '일반': { bg: 'from-[#222]/40 to-transparent', border: 'border-white/20', text: 'text-[#ffffff]' },
        '고급': { bg: 'from-[#1a2e1a]/40 to-transparent', border: 'border-[#48c948]/30', text: 'text-[#48c948]' },
        '희귀': { bg: 'from-[#1a2a3e]/40 to-transparent', border: 'border-[#00b0fa]/30', text: 'text-[#00b0fa]' },
        '영웅': { bg: 'from-[#2e1a3e]/40 to-transparent', border: 'border-[#ce43fb]/30', text: 'text-[#ce43fb]' },
        '전설': { bg: 'from-[#41321a]/40 to-transparent', border: 'border-[#f99200]/30', text: 'text-[#f99200]' },
        '유물': { bg: 'from-[#2a1a12]/40 to-transparent', border: 'border-[#a6632d]/50', text: 'text-[#e7a15d]', glow: 'shadow-[#a6632d]/20' },
        '고대': { bg: 'from-[#3d3325]/40 to-transparent', border: 'border-[#e9d2a6]/30', text: 'text-[#c69c6d]', glow: 'shadow-[#e9d2a6]/10' },
        '에스더': { bg: 'from-[#0d2e2e]/40 to-transparent', border: 'border-[#2edbd3]/60', text: 'text-[#2edbd3]', glow: 'shadow-[#2edbd3]/30' }
    };
    const theme = themes[gradeName] || themes['고대'];

    return (
        <div
            ref={tooltipRef}
            className={`absolute z-[9999] w-[300px] max-h-[50vh] overflow-y-auto overflow-x-hidden
                /* Webkit 스크롤바 커스텀 */
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-white/5
                [&::-webkit-scrollbar-thumb]:bg-white/20
                [&::-webkit-scrollbar-thumb]:rounded-full
                hover:[&::-webkit-scrollbar-thumb]:bg-white/40
                
                /* 부모 배경을 투명하게 설정하여 자식들의 독립적인 배경 적용 */
                bg-transparent border border-white/10 rounded-md shadow-2xl 
                ${theme.glow} ${positionStyle} font-sans transition-all duration-200 ${className}`}
        >
            {/* 1. 헤더 섹션: 투명도 없음 (불투명) */}
            <div className={`p-2 bg-[#111111] bg-gradient-to-br ${theme.bg} border-b border-white/5 sticky top-0 z-10`}>
                <div className="flex gap-4 items-center">
                    <div className={`w-[50px] h-[50px] shrink-0 rounded-md border ${theme.border} bg-black/40 p-1`}>
                        <img src={itemIcon} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[14px] font-bold leading-tight drop-shadow-md truncate ${theme.text}`}>
                            {itemName}
                        </h4>
                        <div className="mt-1">
                            <div className="text-[12px] font-medium text-white/60">{itemGrade}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 본문 섹션: 투명도 60% 및 블러 적용 */}
            <div className="p-4 space-y-5 bg-[#111111]/60 backdrop-blur-md">
                {/* 요약 정보 섹션 */}
                <div className="space-y-1 text-[12px]">
                    <div className="text-white font-bold">{itemLevelAndTier}</div>
                    {topInfos.map((info, i) => (
                        <div key={i} className="text-white/60 font-medium">{info}</div>
                    ))}
                    {advRefine && <div className="text-[#ffcf4d] font-bold mt-1 whitespace-pre-line">{cleanText(advRefine)}</div>}
                </div>

                {/* 품질 섹션 */}
                {quality !== -1 && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-bold text-white/40 uppercase tracking-tighter">
                            <span>품질</span>
                            <span style={{ color: quality === 100 ? '#FF8000' : quality >= 90 ? '#CE43FB' : '#00B0FA' }}>{quality}</span>
                        </div>
                        <div className="h-1.5 bg-black/60 rounded-full border border-white/5 overflow-hidden">
                            <div className="h-full transition-all duration-700" style={{ width: `${quality}%`, backgroundColor: quality === 100 ? '#FF8000' : quality >= 90 ? '#CE43FB' : '#00B0FA' }} />
                        </div>
                    </div>
                )}

                {/* 효과 섹션 */}
                <div className="space-y-5">
                    {baseEffect && (
                        <div className="space-y-1">
                            <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">[기본 효과]</p>
                            <p className="text-white/90 text-[12px] whitespace-pre-line leading-relaxed font-medium">{cleanText(baseEffect)}</p>
                        </div>
                    )}
                    {addEffect && (
                        <div className="space-y-1">
                            <p className="text-white/30 text-[11px] font-bold uppercase tracking-wide">[추가 효과]</p>
                            <p className="text-[#4cdfff] text-[12px] font-semibold whitespace-pre-line leading-relaxed">{cleanText(addEffect)}</p>
                        </div>
                    )}
                    {arkPassive && (
                        <div className="space-y-1">
                            <p className="text-emerald-400/70 text-[11px] font-bold uppercase tracking-wide">[아크 패시브 포인트 효과]</p>
                            <p className="text-emerald-400 text-[12px] font-bold">{cleanText(arkPassive)}</p>
                        </div>
                    )}
                    {stoneBonus && (
                        <div className="space-y-1">
                            <p className="text-[#A9D0F5] text-[11px] font-bold uppercase tracking-wide">[세공 단계 보너스]</p>
                            <p className="text-white/90 text-[12px] whitespace-pre-line leading-relaxed">{cleanText(stoneBonus)}</p>
                        </div>
                    )}
                    {engraveGroup && (
                        <div className="space-y-2">
                            <p className="text-[#A9D0F5] text-[11px] font-bold uppercase tracking-wide">[{cleanText(engraveGroup.topStr)}]</p>
                            <div className="space-y-1 px-0.5">
                                {Object.values(engraveGroup.contentStr).map((c: any, i: number) => {
                                    const t = cleanText(c.contentStr);
                                    if(!t) return null;
                                    const isRed = t.includes('감소');
                                    const isGreen = t.includes('보너스');
                                    return <p key={i} className={`text-[12px] font-medium ${isRed ? 'text-[#fe2e2e]' : isGreen ? 'text-[#73DC04]' : 'text-white/90'}`}>{t}</p>;
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* 하단 상세 섹션 */}
                {bottomInfos.length > 0 && (
                    <div className="pt-3 space-y-2 border-t border-white/5">
                        {bottomInfos.map((info, i) => {
                            const isFlavor = info.includes('느낌이');
                            const isWarning = info.includes('불가');
                            return (
                                <p key={i} className={`text-[11px] leading-relaxed ${isFlavor ? 'text-[#E2C87A] italic' : isWarning ? 'text-[#C24B46] font-bold' : 'text-white/40'}`}>
                                    {info}
                                </p>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EquipmentTooltip;