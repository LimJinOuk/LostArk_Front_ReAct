import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const cleanText = (str: any) => {
    if (!str) return '';
    const target = typeof str === 'string' ? str : JSON.stringify(str);
    return target
        .replace(/<P ALIGN='CENTER'>/gi, '')
        .replace(/<\/P>/gi, '\n')
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

const MAX_STATS: Record<string, number[]> = {
    "반지":   [11091, 11349, 11865, 12897],
    "귀걸이": [11944, 12222, 12778, 13889],
    "목걸이": [15357, 15714, 16428, 17857]
};

interface TooltipProps {
    data: any;
    className?: string;
    onClose?: () => void;
}

const AccessoryTooltip = ({ data, className = "", onClose }: TooltipProps) => {
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 640 : false
    );

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!data) return null;

    const elements = Object.values(data) as any[];
    const itemName = cleanText(data.Element_000?.value || "");
    const titleInfo = data.Element_001?.value || {};
    const quality = titleInfo.qualityValue ?? -1;
    const itemGradeName = titleInfo.leftStr0?.split(' ')[0] || "고대";
    const itemGradeFull = titleInfo.leftStr0;
    const itemLevelAndTier = cleanText(titleInfo.leftStr2 || "");
    const itemIcon = titleInfo.slotData?.iconPath;
    const tradeInfo = cleanText(data.Element_003?.value || "").replace('|', '');

    const isBracelet = itemName.includes("팔찌");

    const baseEffectObj = elements.find((el: any) => el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000) === '기본 효과');
    const specialEffectObj = elements.find((el: any) => el?.type === 'ItemPartBox' && ["연마 효과", "팔찌 효과", "특수 효과", "추가 효과"].includes(cleanText(el?.value?.Element_000)));
    const arcPassiveObj = elements.find((el: any) => el?.type === 'ItemPartBox' && cleanText(el?.value?.Element_000).includes('아크 패시브'));

    // 팔찌 텍스트 하이라이트 함수 (숫자: 초록, 따옴표: 민트)
    const renderBraceletHighlight = (text: string) => {
        return text.split('\n').map((line, i) => {
            const parts = line.split(/('.*?'|\d+[\d.,%+~-]*(?:초|m|%|\+)?)/g);
            return (
                <div key={i} className="text-[11px] font-medium leading-snug text-white/80 mb-0.5">
                    {parts.map((part, index) => {
                        if (part.startsWith("'") && part.endsWith("'")) return <span key={index} className="text-[#45f3ec]">{part}</span>;
                        if (/^\d/.test(part)) return <span key={index} className="text-[#48c948] font-bold">{part}</span>;
                        return part;
                    })}
                </div>
            );
        });
    };

    const themes: any = {
        '일반': { bg: 'bg-[linear-gradient(135deg,#232323_0%,#3a3a3a_100%)]', border: 'border-white/10', text: 'text-zinc-400' },
        '고급': { bg: 'bg-[linear-gradient(135deg,#18220b_0%,#33411a_100%)]', border: 'border-[#48c948]/30', text: 'text-[#4edb4e]' },
        '희귀': { bg: 'bg-[linear-gradient(135deg,#111d2d_0%,#243d5c_100%)]', border: 'border-[#00b0fa]/30', text: 'text-[#33c2ff]' },
        '영웅': { bg: 'bg-[linear-gradient(135deg,#201334_0%,#462b6d_100%)]', border: 'border-[#ce43fb]/30', text: 'text-[#d966ff]' },
        '전설': { bg: 'bg-[linear-gradient(135deg,#362003_0%,#9e5f04_100%)]', border: 'border-[#f99200]/40', text: 'text-[#ffaa33]' },
        '유물': { bg: 'bg-[linear-gradient(135deg,#341a09_0%,#a24407_100%)]', border: 'border-[#fa5d00]/50', text: 'text-[#ff7526]' },
        '고대': { bg: 'bg-[linear-gradient(135deg,#2b241a_0%,#b8a37c_100%)]', border: 'border-[#e9d2a6]/40', text: 'text-[#e9d2a6]' },
        '에스더': { bg: 'bg-[linear-gradient(135deg,#0c2e2c_0%,#2faba8_100%)]', border: 'border-[#2edbd3]/60', text: 'text-[#45f3ec]' }
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

    const TooltipBody = (
        <div
            className={`relative flex flex-col border border-white/10 shadow-2xl overflow-hidden font-sans transition-all duration-200 bg-[#0d0d0f]/10 
            ${isMobile ? 'w-full rounded-t-xl pointer-events-auto' : 'w-[280px] rounded-md pointer-events-none'} 
            ${className}`}
            style={!isMobile ? { maxHeight: '50vh' } : { maxHeight: '80vh' }}
        >
            <div className={`p-2 shrink-0 bg-[#111111] ${theme.bg} border-b border-white/10 z-10`}>
                <div className="flex gap-3 items-center">
                    <div className="relative shrink-0 w-[50px] h-[50px]">
                        <div className={`w-full h-full overflow-hidden rounded-md border-[1.5px] ${theme.border} bg-black ${theme.bg}`}>
                            <img src={itemIcon} className="w-full h-full object-cover" alt="" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[14px] font-bold leading-tight drop-shadow-md truncate ${theme.text}`}>{itemName}</h4>
                        <div className="mt-1 flex items-center gap-2 text-white/60 text-[12px] font-bold">
                            <span>{cleanText(itemGradeFull)}</span>
                            <span className="w-[1px] h-2.5 bg-white/30" />
                            <span>{itemLevelAndTier.replace('아이템 ', '')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#111111]/10 backdrop-blur-md">
                <div className="p-3 grid grid-cols-2 gap-x-4 bg-[#111111]/40">
                    {/* [좌측 섹션] */}
                    <div className="space-y-4 col-span-1 border-r border-white/5 pr-4">
                        {isBracelet ? (
                            <>
                                {arcPassiveObj && (
                                    <div className="space-y-1">
                                        <p className="text-[#ffcf4d] text-[10px] font-bold uppercase">[아크 패시브]</p>
                                        <p className="text-white text-[11px] font-bold leading-tight">{cleanText(arcPassiveObj.value.Element_001)}</p>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <p className="text-white/30 text-[10px] font-bold uppercase">[기본 옵션]</p>
                                    {specialEffectObj && cleanText(specialEffectObj.value.Element_001).split('\n').map((line, idx) => {
                                        // 스탯 관련 옵션만 필터링하여 좌측에 배치
                                        if (/치명|특화|신속|제압|인내|숙련|힘|민첩|지능/.test(line)) {
                                            return <div key={idx}>{renderBraceletHighlight(line)}</div>;
                                        }
                                        return null;
                                    })}
                                </div>
                            </>
                        ) : (
                            specialEffectObj?.value?.Element_001 && (
                                <div className="pt-1 border-t border-white/5">
                                    <div className="text-[11.5px] font-bold whitespace-pre-line leading-relaxed">
                                        {renderGrindEffect(cleanText(specialEffectObj.value.Element_001))}
                                    </div>
                                </div>
                            )
                        )}
                        <div className={`text-[12px] font-bold ${tradeInfo.includes('불가') ? 'text-red-500' : 'text-cyan-500'}`}>
                            [{tradeInfo}]
                        </div>
                    </div>

                    {/* [우측 섹션] */}
                    <div className="space-y-4">
                        {isBracelet ? (
                            <div className="space-y-1">
                                <p className="text-[#A9D0F5] text-[10px] font-bold uppercase">[팔찌 효과]</p>
                                {specialEffectObj && cleanText(specialEffectObj.value.Element_001).split('\n').map((line, idx) => {
                                    // 특수 효과들만 필터링하여 우측에 배치
                                    if (!/치명|특화|신속|제압|인내|숙련|힘|민첩|지능/.test(line)) {
                                        return <div key={idx}>{renderBraceletHighlight(line)}</div>;
                                    }
                                    return null;
                                })}
                            </div>
                        ) : (
                            <>
                                {quality !== -1 && (
                                    <div className="space-y-0.5 w-28">
                                        <div className="flex justify-between items-end">
                                            <span className="text-white/40 text-[11px]">품질</span>
                                            <span className="text-[12px] font-bold" style={{ color: getQualityColorHex(quality) }}>{quality}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/40 rounded-full overflow-hidden border border-white/5">
                                            <div className="h-full transition-all duration-700" style={{ width: `${quality}%`, backgroundColor: getQualityColorHex(quality) }} />
                                        </div>
                                    </div>
                                )}
                                {baseEffectObj?.value?.Element_001 && (() => {
                                    const part = ["목걸이", "귀걸이", "반지"].find(p => itemName.includes(p)) || "목걸이";
                                    const rawPolishHtml = data.Element_006?.value?.Element_001 || "";
                                    const polishLevel = (rawPolishHtml.match(/img src/g) || []).length;
                                    const currentStatMatch = baseEffectObj.value.Element_001.match(/\+(\d+)/);
                                    const currentStat = currentStatMatch ? parseInt(currentStatMatch[1]) : 0;
                                    const maxValue = MAX_STATS[part][polishLevel];
                                    const percentage = maxValue ? (currentStat / maxValue) * 100 : 0;

                                    return (
                                        <div className="space-y-0.5 w-28">
                                            <div className="flex justify-between items-center text-[#FFD200] text-[11.5px] font-bold py-0.5">
                                                힘민지: {percentage.toFixed(1)}%
                                            </div>
                                            <div className="h-1.5 w-full bg-white/40 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#FFD200]/60 transition-all duration-500" style={{ width: `${Math.min(100, percentage)}%` }} />
                                            </div>
                                            <div className="text-white/90 text-[12px] leading-relaxed whitespace-pre-line font-medium pt-1">
                                                {cleanText(baseEffectObj.value.Element_001)}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <div className="h-[1px] shrink-0 from-transparent via-white/10 to-transparent" />
        </div>
    );

    return (
        <AnimatePresence>
            {isMobile ? (
                <div className="fixed inset-0 z-[9999] flex items-end justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full"
                    >
                        {TooltipBody}
                    </motion.div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="contents"
                >
                    {TooltipBody}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AccessoryTooltip;