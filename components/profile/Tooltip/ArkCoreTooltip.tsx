import React from 'react';

// 텍스트 정제 함수
const cleanText = (str: any) => {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<BR>/gi, '\n')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

interface ArkCoreTooltipProps {
    data: any;    // 이미 파싱된 Tooltip 객체
    Gems?: any[]; // Gems 배열
}

const ArkCoreTooltip = ({ data, Gems }: ArkCoreTooltipProps) => {
    if (!data) return null;

    // 1. 현재 총 포인트 계산 (젬들의 '젬 포인트' 합산)
    const currentTotalPoint = Gems?.reduce((acc, gem) => {
        try {
            const gemTooltip = typeof gem.Tooltip === 'string' ? JSON.parse(gem.Tooltip) : gem.Tooltip;
            const rawPointText = gemTooltip?.Element_004?.value?.Element_001 || "";
            const match = rawPointText.match(/젬 포인트\s*:\s*(\d+)/);
            return acc + (match ? parseInt(match[1]) : 0);
        } catch (e) { return acc; }
    }, 0) || 0;

    const elements = Object.values(data) as any[];

    // 2. 데이터 추출 (코어 공급 의지력 추가)
    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const itemGrade = cleanText(titleInfo.leftStr0 || "");
    const itemIcon = titleInfo.slotData?.iconPath;

    const coreSubTitle = elements.find(el => el?.value?.Element_000 === "코어 타입")?.value?.Element_001 || "";

    // --- [추가된 부분: 코어 공급 의지력 추출] ---
    const coreSupplyPointRaw = elements.find(el => el?.value?.Element_000 === "코어 공급 의지력")?.value?.Element_001 || "";
    const coreSupplyPoint = coreSupplyPointRaw.replace(/[^0-9]/g, ""); // "15 포인트" -> "15"
    // ------------------------------------------

    const coreOptionRaw = elements.find(el =>
        cleanText(el?.value?.Element_000) === "코어 옵션"
    )?.value?.Element_001 || "";
    const coreCondition = elements.find(el => el?.value?.Element_000 === "코어 옵션 발동 조건")?.value?.Element_001;
    const jobLimit = elements.find(el => el?.type === "SingleTextBox" && el?.value && !el?.value.includes("분해") && !el.value.includes("["))?.value;

    const isRelic = itemGrade.includes("유물");
    const gradeColor = isRelic ? "text-[#FA5D00]" : "text-[#F9AE00]";
    const bgGradient = isRelic ? "from-[#2A1A0A] to-[#1C1D21]" : "from-[#242115] to-[#1C1D21]";

    const allOptionLines = coreOptionRaw
        .replace(/<br>|<BR>/gi, '\n') // 태그를 줄바꿈 문자로 변환
        .split('\n')
        .map(line => cleanText(line)) // 각 줄의 태그 제거
        .filter(Boolean);
    const headerSummaryLines = allOptionLines.filter(line => line.trim().startsWith('['));

    return (
        <div className="w-80 bg-[#1C1D21] border border-white/10 rounded-lg shadow-2xl overflow-hidden font-sans text-sm shadow-black/50">
            {/* 헤더 영역 */}
            <div className={`p-4 bg-gradient-to-br ${bgGradient} border-b border-black/20`}>
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div className={`text-[15px] font-bold ${gradeColor}`}>{itemName}</div>
                        {/* 코어 공급 포인트 표시 */}
                        {coreSupplyPoint && (
                            <div className="bg-orange-500/10 border border-orange-500/30 px-2 py-0.5 rounded text-[11px] text-orange-400 font-bold">
                                {coreSupplyPoint}P 공급
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="relative shrink-0">
                            <img src={itemIcon} className="w-14 h-14 rounded-md border border-white/10 shadow-inner bg-black/40" alt="" />
                        </div>

                        {/* [포인트 옵션 요약 영역] */}
                        <div className="flex flex-col flex-1 min-w-0">
                            <div className={`text-[13px] font-bold ${gradeColor} truncate leading-tight`}>
                                {itemGrade}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-medium leading-tight mb-1">
                                {coreSubTitle}
                            </div>

                            {/* 옵션 리스트 영역 */}
                            <div className="mt-0 flex flex-col gap-1.5">
                                {headerSummaryLines.length > 0 && (
                                    headerSummaryLines.slice(0, 2).map((line, i) => {
                                        const pointMatch = line.match(/^(\[\d+(?:~\d+)?P\])(.*)/);
                                        if (!pointMatch) return null;

                                        // 숫자와 %를 초록색으로 강조하는 함수
                                        const formatDescription = (text: string) => {
                                            const parts = text.split(/(\d+(?:\.\d+)?%)/g);
                                            return parts.map((part, index) =>
                                                /(\d+(?:\.\d+)?%)/.test(part)
                                                    ? <span key={index} className="text-green-400 font-bold">{part}</span>
                                                    : part
                                            );
                                        };

                                        return (
                                            <div key={i} className="flex gap-1.5 items-start">
                                                {/* 1. 포인트 부분: 줄바꿈 시에도 상단 고정 (shrink-0) */}
                                                <span className="text-[12px] font-black shrink-0 text-[#f18c2d] leading-[1.4]">
                            {pointMatch[1]}
                        </span>

                                                {/* 2. 설명 부분: truncate를 제거하고 줄바꿈 허용 */}
                                                <span className="text-[12px] font-semibold text-zinc-100 leading-[1.4] break-keep whitespace-pre-wrap">
                            {formatDescription(pointMatch[2].trim())}
                        </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>




                    </div>
                </div>
            </div>

            <div className="p-4 space-y-5 bg-[#1C1D21]">

                {/* 장착 젬 상세 */}
                {Gems && Gems.length > 0 && (
                    <div className="space-y-2">
                        {Gems.map((gem, idx) => {
                            let gemTooltip;
                            try {
                                gemTooltip = typeof gem.Tooltip === 'string' ? JSON.parse(gem.Tooltip) : gem.Tooltip;
                            } catch { return null; }

                            const gemEffect = gemTooltip?.Element_005?.value?.Element_001 || "";
                            const gemPointInfo = gemTooltip?.Element_004?.value?.Element_001 || "";
                            const gemPointMatch = gemPointInfo.match(/젬 포인트\s*:\s*(\d+)/);
                            const gemPoint = gemPointMatch ? gemPointMatch[1] : null;

                            return (
                                <div key={idx} className="bg-black/40 border border-white/5 p-3 rounded-md flex gap-3 items-start">
                                    <img src={gem.Icon} className="w-10 h-10 rounded bg-zinc-900 border border-[#F9AE00]/30 p-1" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <div className="text-[13px] font-bold text-[#F9AE00] truncate">{cleanText(gemTooltip?.Element_000?.value)}</div>
                                            {gemPoint && <span className="text-[11px] text-[#9299FF] font-bold shrink-0">+{gemPoint}P</span>}
                                        </div>
                                        <div className="text-[11px] text-zinc-300 leading-snug mt-1.5 whitespace-pre-line font-medium">
                                            {cleanText(gemEffect).split('\n')
                                                .filter(l => !l.includes('필요') && !l.includes('포인트'))
                                                .map((line, li) => (
                                                    <div key={li}>
                                                        {line.split(/(\d+(?:\.\d+)?%)/).map((p, pi) =>
                                                            p.endsWith('%') ? <span key={pi} className="text-[#24FD3A]">{p}</span> : p
                                                        )}
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {/* 발동 조건 */}
                {coreCondition && (
                    <div className="pt-2 border-t border-white/5 text-[12px] text-zinc-500 leading-relaxed font-medium px-1 italic whitespace-pre-line">
                        {cleanText(coreCondition)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArkCoreTooltip;