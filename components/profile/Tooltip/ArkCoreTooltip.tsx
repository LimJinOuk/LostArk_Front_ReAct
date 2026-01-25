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

// --- [등급별 스타일 정의: 투명도 최적화 버전] ---
const gradeStyles: any = {
    '일반': { bg: 'from-zinc-800/60 to-transparent', border: 'border-white/10', text: 'text-zinc-400', glow: '', accent: 'bg-zinc-500' },
    '고급': { bg: 'from-[#1a2e1a]/60 to-transparent', border: 'border-[#48c948]/30', text: 'text-[#4edb4e]', glow: 'shadow-[#48c948]/5', accent: 'bg-[#48c948]' },
    '희귀': { bg: 'from-[#1a2a3e]/60 to-transparent', border: 'border-[#00b0fa]/30', text: 'text-[#33c2ff]', glow: 'shadow-[#00b0fa]/10', accent: 'bg-[#00b0fa]' },
    '영웅': { bg: 'from-[#2e1a3e]/60 to-transparent', border: 'border-[#ce43fb]/30', text: 'text-[#d966ff]', glow: 'shadow-[#ce43fb]/10', accent: 'bg-[#ce43fb]' },
    '전설': { bg: 'from-[#41321a]/60 to-transparent', border: 'border-[#f99200]/40', text: 'text-[#ffaa33]', glow: 'shadow-[#f99200]/15', accent: 'bg-[#f99200]' },
    '유물': {
        bg: 'from-[#351a0a]/60 to-transparent',
        border: 'border-[#fa5d00]/50 shadow-[0_0_10px_rgba(250,93,0,0.2)]',
        text: 'text-[#ff7526] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
        glow: 'shadow-[#fa5d00]/25 drop-shadow-[0_0_15px_rgba(250,93,0,0.35)]',
        accent: 'bg-[#fa5d00]'
    },
    '고대': {
        bg: 'from-[#3d3325]/60 to-transparent',
        border: 'border-[#e9d2a6]/40',
        text: 'text-[#e9d2a6]',
        glow: 'shadow-[#e9d2a6]/25 drop-shadow-[0_0_15px_rgba(233,210,166,0.3)]',
        accent: 'bg-[#e9d2a6]'
    },
    '에스더': {
        bg: 'from-[#0d2e2e]/60 to-transparent',
        border: 'border-[#2edbd3]/60 shadow-[0_0_12px_rgba(46,219,211,0.2)]',
        text: 'text-[#45f3ec] drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]',
        glow: 'shadow-[#2edbd3]/30 drop-shadow-[0_0_18px_rgba(46,219,211,0.4)]',
        accent: 'bg-[#2edbd3]'
    }
};

interface ArkCoreTooltipProps {
    data: any;
    Gems?: any[];
}

const ArkCoreTooltip = ({ data, Gems }: ArkCoreTooltipProps) => {
    if (!data) return null;

    const elements = Object.values(data) as any[];

    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const itemGradeRaw = cleanText(titleInfo.leftStr0 || "");
    const itemIcon = titleInfo.slotData?.iconPath;

    let currentGrade = "일반";
    if (itemGradeRaw.includes('에스더')) currentGrade = '에스더';
    else if (itemGradeRaw.includes('고대')) currentGrade = '고대';
    else if (itemGradeRaw.includes('유물')) currentGrade = '유물';
    else if (itemGradeRaw.includes('전설')) currentGrade = '전설';
    else if (itemGradeRaw.includes('영웅')) currentGrade = '영웅';
    else if (itemGradeRaw.includes('희귀')) currentGrade = '희귀';
    else if (itemGradeRaw.includes('고급')) currentGrade = '고급';

    const theme = gradeStyles[currentGrade] || gradeStyles['일반'];

    const coreSubTitle = elements.find(el => el?.value?.Element_000 === "코어 타입")?.value?.Element_001 || "";
    const coreSupplyPointRaw = elements.find(el => el?.value?.Element_000 === "코어 공급 의지력")?.value?.Element_001 || "";
    const coreSupplyPoint = coreSupplyPointRaw.replace(/[^0-9]/g, "");

    const coreOptionRaw = elements.find(el =>
        cleanText(el?.value?.Element_000) === "코어 옵션"
    )?.value?.Element_001 || "";
    const coreCondition = elements.find(el => el?.value?.Element_000 === "코어 옵션 발동 조건")?.value?.Element_001;

    const allOptionLines = coreOptionRaw
        .replace(/<br>|<BR>/gi, '\n')
        .split('\n')
        .map(line => cleanText(line))
        .filter(Boolean);
    const headerSummaryLines = allOptionLines.filter(line => line.trim().startsWith('['));

    return (
        <div
            className="w-[300px] border border-white/10 rounded-lg shadow-2xl overflow-hidden font-sans text-sm backdrop-blur-md"
            style={{ backgroundColor: 'rgba(28, 29, 33, 0.6)' }} // 배경 60% 투명도
        >
            {/* 헤더 영역 */}
            <div className={`p-3 bg-gradient-to-br ${theme.bg} border-b border-black/30 relative overflow-hidden`}>
                {['고대', '에스더'].includes(currentGrade) && (
                    <div className={`absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent`} />
                )}

                <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                        <div className={`text-[14px] font-bold ${theme.text}`}>{itemName}</div>
                        {coreSupplyPoint && (
                            <div className={`px-2 py-0.5 rounded text-[11px] font-bold border ${theme.accent.replace('bg-', 'border-')}/30 bg-black/40 ${theme.text}`}>
                                {coreSupplyPoint}P 공급
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="relative shrink-0">
                            <div className={`p-0.5 rounded-md border ${theme.border} ${theme.glow}`}>
                                <img src={itemIcon} className="w-11 h-11 rounded-md object-cover bg-black/40" alt="" />
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 min-w-0">
                            <div className={`text-[12px] font-bold ${theme.text} truncate leading-tight`}>
                                {itemGradeRaw}
                            </div>
                            <div className="text-[11px] text-white/50 font-medium leading-tight mb-1.5">
                                {coreSubTitle}
                            </div>

                            <div className="mt-0 flex flex-col gap-1">
                                {headerSummaryLines.slice(0, 2).map((line, i) => {
                                    const pointMatch = line.match(/^(\[\d+(?:~\d+)?P\])(.*)/);
                                    if (!pointMatch) return null;

                                    return (
                                        <div key={i} className="flex gap-1.5 items-start">
                                            <span className="text-[11px] font-black shrink-0 text-[#f18c2d] leading-[1.4]">
                                                {pointMatch[1]}
                                            </span>
                                            <span className="text-[11px] font-semibold text-zinc-100 leading-[1.4] break-keep whitespace-pre-wrap">
                                                {pointMatch[2].trim().split(/((?:\+)?\d+(?:\.\d+)?(?:%|초)?)/).map((part, index) =>
                                                    /((?:\+)?\d+(?:\.\d+)?(?:%|초)?)/.test(part)
                                                        ? <span key={index} className="text-[#48c948] font-bold">{part}</span>
                                                        : part
                                                )}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 본문 콘텐츠 영역 */}
            <div className="p-2 space-y-3 bg-transparent">
                {Gems && Gems.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {Gems.map((gem, idx) => {
                            let gemTooltip;
                            try {
                                gemTooltip = typeof gem.Tooltip === 'string' ? JSON.parse(gem.Tooltip) : gem.Tooltip;
                            } catch { return null; }

                            const gemEffect = gemTooltip?.Element_005?.value?.Element_001 || "";
                            const gemPointMatch = (gemTooltip?.Element_004?.value?.Element_001 || "").match(/젬 포인트\s*:\s*(\d+)/);
                            const gemPoint = gemPointMatch ? gemPointMatch[1] : null;

                            return (
                                <div key={idx} className="bg-white/[0.05] border border-white/5 p-2 rounded flex flex-col gap-1.5 min-h-[85px]">
                                    <div className="flex items-center gap-2">
                                        <img src={gem.Icon} className={`w-8 h-8 rounded bg-black/40 border ${theme.border} p-0.5`} alt="" />
                                        {gemPoint && <span className="text-[10px] text-[#9299FF] font-black">+{gemPoint}P</span>}
                                    </div>

                                    <div className="text-[10.5px] text-zinc-300 leading-snug font-medium break-words">
                                        {cleanText(gemEffect).split('\n')
                                            .filter(l => !l.includes('필요') && !l.includes('포인트'))
                                            .map((line, li) => (
                                                <div key={li} className="mb-0.5 last:mb-0">
                                                    {line.split(/((?:\+|Lv.\s*)?\d+(?:\.\d+)?%?)/i).map((part, pi) =>
                                                        /((?:\+|Lv.\s*)?\d+(?:\.\d+)?%?)/i.test(part)
                                                            ? <span key={pi} className="text-[#48c948] font-bold">{part}</span>
                                                            : part
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {coreCondition && (
                    <div className="pt-2 border-t border-white/5 text-[11px] text-white/40 leading-relaxed italic px-1 pb-1">
                        {cleanText(coreCondition)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArkCoreTooltip;