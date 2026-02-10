import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
    onClose?: () => void;
}

const EquipmentTooltip = ({ data, className = "", onClose }: TooltipProps) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({
        top: 0,
        left: 0,
        maxHeight: 'auto',
        isReady: false
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useLayoutEffect(() => {
        if (!isMobile && tooltipRef.current && tooltipRef.current.parentElement) {
            const tooltip = tooltipRef.current;
            const parent = tooltip.parentElement;
            const parentRect = parent.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const safeTopLimit = 74;
            const safeBottomLimit = viewportHeight - 40;
            const tooltipWidth = 420; // PC 버전 고정 너비

            let finalTop = parentRect.top;
            let finalLeft = parentRect.right + 12;

            // 화면 오른쪽을 벗어나는 경우 왼쪽으로 배치
            if (finalLeft + tooltipWidth > viewportWidth) {
                finalLeft = parentRect.left - tooltipWidth - 12;
            }

            const tooltipHeight = tooltip.offsetHeight;
            // 화면 하단을 벗어나는 경우 위로 조정
            if (finalTop + tooltipHeight > safeBottomLimit) {
                finalTop = Math.max(safeTopLimit, safeBottomLimit - tooltipHeight);
            }

            setCoords({
                top: finalTop,
                left: finalLeft,
                maxHeight: `${Math.floor(safeBottomLimit - safeTopLimit)}px`,
                isReady: true
            });
        }
    }, [data, isMobile]);

    if (!data) return null;

    /* 데이터 파싱부 */
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
    const arkPassive = findByTitle('아크 패시브 포인트');
    const advRefine = elements.find(el => String(el?.value).includes('[상급 재련]'))?.value;
    const engraveGroup = elements.find(el => el?.type === 'IndentStringGroup')?.value?.Element_000;
    const bottomInfos = findSingleText(['느낌이 난다', '내구도', '[제작]', '판매불가', '분해불가']);

    const themes: any = {
        '일반': { bg: 'from-[#222]/40', border: 'border-white/20', text: 'text-[#ffffff]' },
        '고급': { bg: 'from-[#1a2e1a]/40', border: 'border-[#48c948]/30', text: 'text-[#48c948]' },
        '희귀': { bg: 'from-[#1a2a3e]/40', border: 'border-[#00b0fa]/30', text: 'text-[#00b0fa]' },
        '영웅': { bg: 'from-[#2e1a3e]/40', border: 'border-[#ce43fb]/30', text: 'text-[#ce43fb]' },
        '전설': { bg: 'from-[#41321a]/40', border: 'border-[#f99200]/30', text: 'text-[#f99200]' },
        '유물': { bg: 'from-[#2a1a12]/40', border: 'border-[#a6632d]/50', text: 'text-[#e7a15d]', glow: 'shadow-[#a6632d]/20' },
        '고대': { bg: 'from-[#3d3325]/40', border: 'border-[#e9d2a6]/30', text: 'text-[#c69c6d]', glow: 'shadow-[#e9d2a6]/10' },
        '에스더': { bg: 'from-[#0d2e2e]/40', border: 'border-[#2edbd3]/60', text: 'text-[#2edbd3]', glow: 'shadow-[#2edbd3]/30' }
    };
    const theme = themes[gradeName] || themes['고대'];

    const Content = (
        <div
            ref={tooltipRef}
            style={!isMobile ? {
                top: coords.top,
                left: coords.left,
                maxHeight: coords.maxHeight,
                position: 'fixed',
                width: '420px', // PC 너비 확장
                visibility: coords.isReady ? 'visible' : 'hidden',
                opacity: coords.isReady ? 1 : 0
            } : {}}
            className={`${isMobile ? 'w-full max-h-[80vh] rounded-t-2xl pb-6' : 'rounded-xl'}
                z-[9999] overflow-y-auto bg-[#0d0d0f]/90 backdrop-blur-xl border-t border-x border-white/10 shadow-2xl
                ${theme.glow} font-sans ${className} transition-opacity duration-300`}
        >
            {/* 드래그 핸들 (모바일 전용) */}
            {isMobile && (
                <div className="flex justify-center py-2">
                    <div className="w-8 h-1 bg-white/10 rounded-full" />
                </div>
            )}

            {/* 헤더 */}
            <div className={`px-4 py-3 bg-gradient-to-br ${theme.bg} to-transparent border-b border-white/5 sticky top-0 z-10 backdrop-blur-md`}>
                <div className="flex gap-3 items-center">
                    <div className={`w-11 h-11 shrink-0 rounded border ${theme.border} bg-black/40 p-1`}>
                        <img src={itemIcon} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[13px] font-bold truncate ${theme.text}`}>{itemName}</h4>
                        <div className="text-[11px] text-white/50">{itemGrade}</div>
                    </div>
                </div>
                {isMobile && (
                    <button onClick={onClose} className="absolute top-2 right-2 p-1.5 text-white/20 hover:text-white">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* 본문: PC/모바일 공통 좌우 레이아웃 */}
            <div className="p-4 grid grid-cols-2 gap-x-5 gap-y-4">

                {/* 왼쪽 컬럼: 기본 정보 및 수치 */}
                <div className="space-y-4 col-span-1 border-r border-white/5 pr-4">
                    <div className="text-[11px] leading-tight">
                        <div className="text-white font-bold">{itemLevelAndTier}</div>
                        {advRefine && <div className="text-[#ffcf4d] font-semibold mt-1">{cleanText(advRefine)}</div>}
                    </div>

                    {quality !== -1 && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold text-white/30 uppercase tracking-tight">
                                <span>품질 {quality}</span>
                            </div>
                            <div className="h-1 bg-black/60 rounded-full overflow-hidden">
                                <div className="h-full transition-all duration-700" style={{ width: `${quality}%`, backgroundColor: quality === 100 ? '#FF8000' : quality >= 90 ? '#CE43FB' : '#00B0FA' }} />
                            </div>
                        </div>
                    )}

                    {baseEffect && (
                        <div className="space-y-1">
                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-tight">[기본 효과]</p>
                            <p className="text-white/80 text-[11px] whitespace-pre-line leading-relaxed font-medium">{cleanText(baseEffect)}</p>
                        </div>
                    )}
                </div>

                {/* 오른쪽 컬럼: 추가 효과 및 각인 */}
                <div className="space-y-4 col-span-1">
                    {addEffect && (
                        <div className="space-y-1">
                            <p className="text-white/20 text-[10px] font-bold uppercase tracking-tight">[추가 효과]</p>
                            <p className="text-[#4cdfff] text-[11px] font-semibold leading-relaxed">{cleanText(addEffect)}</p>
                        </div>
                    )}

                    {arkPassive && (
                        <div className="space-y-1">
                            <p className="text-emerald-400/40 text-[10px] font-bold uppercase tracking-tight">[아크 패시브]</p>
                            <p className="text-emerald-400 text-[11px] font-bold leading-tight">{cleanText(arkPassive)}</p>
                        </div>
                    )}

                    {engraveGroup && (
                        <div className="space-y-1.5">
                            <p className="text-[#A9D0F5]/40 text-[10px] font-bold uppercase tracking-tight">[{cleanText(engraveGroup.topStr)}]</p>
                            <div className="space-y-1">
                                {Object.values(engraveGroup.contentStr).map((c: any, i: number) => {
                                    const t = cleanText(c.contentStr);
                                    if(!t) return null;
                                    return <p key={i} className={`text-[11px] font-medium leading-snug ${t.includes('감소') ? 'text-[#fe2e2e]' : 'text-white/80'}`}>{t}</p>;
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* 하단 정보: 전체 너비 사용 */}
                {bottomInfos.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-1 col-span-2">
                        {bottomInfos.map((info, i) => (
                            <p key={i} className="text-[10px] text-white/30 leading-tight italic">{info}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-[10000] flex items-end justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                />
                <motion.div
                    className="relative w-full z-10 px-2"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                >
                    {Content}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="absolute top-0 left-0 pointer-events-none">
            <div className="pointer-events-auto">
                {Content}
            </div>
        </div>
    );
};

export default EquipmentTooltip;