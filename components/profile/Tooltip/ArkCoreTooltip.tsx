import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// 텍스트 정제 함수
const cleanText = (str: any) => {
    if (typeof str !== 'string') return '';
    return str
        .replace(/<BR>|<br>/gi, '\n')
        .replace(/<[^>]*>?/gm, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
};

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
    currentPoint?: number;
    onClose?: () => void; // 모바일 모달 닫기용
}

const ArkCoreTooltip = ({ data, Gems, currentPoint, onClose }: ArkCoreTooltipProps) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        // 모달 오픈 시 스크롤 방지
        if (isMobile && data) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';

        return () => {
            window.removeEventListener('resize', checkMobile);
            document.body.style.overflow = 'unset';
        };
    }, [isMobile, data]);

    if (!data) return null;

    const elements = Object.values(data) as any[];
    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const itemGradeRaw = cleanText(titleInfo.leftStr0 || "");
    const itemIcon = titleInfo.slotData?.iconPath;

    const tradeInfo = (() => {
        const tradeElement = elements.find(
            (el) => (el?.type === "MultiTextBox" || el?.type === "SingleTextBox")
                && el.value?.includes("거래")
        );
        return tradeElement ? cleanText(tradeElement.value).replace('|', '').trim() : "거래 불가";
    })();

    let currentGrade = "일반";
    ['에스더', '고대', '유물', '전설', '영웅', '희귀', '고급'].forEach(g => {
        if (itemGradeRaw.includes(g)) currentGrade = g;
    });
    const theme = gradeStyles[currentGrade] || gradeStyles['일반'];

    const coreType = elements.find(el => cleanText(el?.value?.Element_000) === "코어 타입")?.value?.Element_001 || "";
    const coreOptionRaw = elements.find(el => cleanText(el?.value?.Element_000) === "코어 옵션")?.value?.Element_001 || "";

    const options = coreOptionRaw
        .split(/<br>|<BR>|\n/)
        .map((line: string) => {
            const pointMatch = line.match(/\[(\d+)P\]/);
            const effect = cleanText(line.replace(/\[\d+P\]/, ''));
            return pointMatch ? { point: Number(pointMatch[1]), effect } : null;
        })
        .filter((opt: any) => opt && opt.point <= (currentPoint || 0));

    const coreConditionRaw = elements.find(el => cleanText(el?.value?.Element_000) === "코어 옵션 발동 조건")?.value?.Element_001 || "";
    const activationConditions = coreConditionRaw
        .split(/<br>|<BR>|\n/)
        .map((line: string) => cleanText(line))
        .filter(Boolean);

    // 공통 툴팁 바디
    const TooltipContent = (
        <div className={`flex flex-col border border-white/10 rounded-lg shadow-2xl overflow-hidden bg-[#1c1d21] font-sans ${isMobile ? 'w-[90vw] max-w-[340px]' : 'w-[300px]'}`}>
            {/* 1. 상단 정보 영역 */}
            <div className={`p-3 bg-gradient-to-br ${theme.bg} relative z-10 flex flex-col gap-2.5 border-b border-black/20`}>
                <div className="flex justify-between items-start">
                    <div className={`text-[14px] font-bold ${theme.text} leading-tight break-keep flex-1 mr-2`}>
                        {itemName}
                    </div>
                    {/* 모바일 전용 닫기 버튼 */}
                    {isMobile && (
                        <button onClick={onClose} className="p-1 -mr-1 text-white/40 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="flex gap-3 items-center">
                    <div className={`p-0.5 rounded-md border ${theme.border} ${theme.glow} shrink-0 bg-black/40`}>
                        <img src={itemIcon} className="w-10 h-10 rounded-md object-cover" alt="" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className={`text-[13px] font-bold ${theme.text} truncate`}>{itemGradeRaw}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-white/40 font-medium whitespace-nowrap">{tradeInfo}</span>
                            <span className="w-[1px] h-2 bg-white/10" />
                            <span className="text-[10px] text-[#5fd3f1] font-bold truncate">{coreType}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 bg-black/30 rounded-md p-2 border border-white/5">
                    {options.map((opt: any, i: number) => (
                        <div key={i} className="flex gap-2 items-start">
                            <span className="text-[11.5px] font-black shrink-0 text-[#f18c2d] bg-[#f18c2d]/10 px-1 rounded leading-[1.5]">
                                {opt.point}P
                            </span>
                            <span className="text-[11.5px] font-semibold text-zinc-100 leading-[1.5] break-keep">
                                {opt.effect.split(/(\d+(?:\.\d+)?%?|'\w+')/).map((part: string, idx: number) => (
                                    /(\d+(?:\.\d+)?%?|'\w+')/.test(part) ?
                                        <span key={idx} className="text-[#48c948] font-bold">{part}</span> : part
                                ))}
                            </span>
                        </div>
                    ))}
                </div>

                {activationConditions.length > 0 && (
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 border-t border-white/5 pt-1.5">
                        {activationConditions.map((cond: string, i: number) => (
                            <div key={i} className="flex items-center gap-1 text-[10px] text-white/40 font-medium">
                                <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                                {cond}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. 하단 젬 영역 */}
            {Gems && Gems.length > 0 && (
                <div className="p-2 bg-[#1c1d21]/80 space-y-1.5 max-h-[200px] overflow-y-auto
                    [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10">
                    {Gems.map((gem, idx) => {
                        let gemTooltip;
                        try { gemTooltip = typeof gem.Tooltip === 'string' ? JSON.parse(gem.Tooltip) : gem.Tooltip; }
                        catch { return null; }

                        const gemEffect = gemTooltip?.Element_005?.value?.Element_001 || "";
                        const gemPointMatch = (gemTooltip?.Element_004?.value?.Element_001 || "").match(/젬 포인트\s*:\s*(\d+)/);
                        const gemPoint = gemPointMatch ? gemPointMatch[1] : null;

                        return (
                            <div key={idx} className="bg-white/5 border border-white/5 p-1.5 rounded flex items-start gap-2.5">
                                <div className="flex flex-col items-center gap-0.5 shrink-0">
                                    <img src={gem.Icon} className="w-7 h-7 rounded border border-white/10" alt="" />
                                    {gemPoint && <span className="text-[9px] text-[#9299FF] font-black">+{gemPoint}P</span>}
                                </div>
                                <div className="text-[10px] text-zinc-300 leading-snug font-medium pt-0.5">
                                    {cleanText(gemEffect).split('\n')
                                        .filter(l => !l.includes('필요') && !l.includes('포인트'))
                                        .map((line, li) => (
                                            <div key={li} className="mb-0.5 last:mb-0">
                                                {line.split(/((?:\+|Lv.\s*)?\d+(?:\.\d+)?%?)/i).map((part, pi) =>
                                                    /((?:\+|Lv.\s*)?\d+(?:\.\d+)?%?)/i.test(part) ?
                                                        <span key={pi} className="text-[#48c948] font-bold">{part}</span> : part
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // 모바일 렌더링 (중앙 모달)
    if (isMobile) {
        return (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                {/* 배경 오버레이 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                />
                {/* 모달 컨텐츠 */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative z-10"
                >
                    {TooltipContent}
                </motion.div>
            </div>
        );
    }

    // PC 렌더링 (기존 툴팁)
    return TooltipContent;
};

export default ArkCoreTooltip;