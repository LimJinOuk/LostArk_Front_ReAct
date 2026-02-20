import React, { useState, useEffect } from 'react';
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
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        if (isMobile && data) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';

        return () => {
            window.removeEventListener('resize', checkMobile);
            document.body.style.overflow = 'unset';
        };
    }, [isMobile, data]);

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

    const baseEffect = findByTitle('기본 효과');
    const addEffect = findByTitle('추가 효과');
    const arkPassive = findByTitle('아크 패시브 포인트');
    const advRefineRaw = elements.find(el => el && String(el.value).includes('[상급 재련]'))?.value;
    const advRefine = advRefineRaw ? cleanText(advRefineRaw).split('\n')[0] : null;
    const engraveGroup = elements.find(el => el?.type === 'IndentStringGroup')?.value?.Element_000;

    // 하단 정보 제거를 위해 findSingleText 및 bottomInfos 관련 로직 삭제

    const themes: any = {
        '일반': { bg: 'from-[#222]/40', border: 'border-white/20', text: 'text-[#ffffff]' },
        '고급': { bg: 'from-[#1a2e1a]/40', border: 'border-[#48c948]/30', text: 'text-[#48c948]' },
        '희귀': { bg: 'from-[#1a2a3e]/40', border: 'border-[#00b0fa]/30', text: 'text-[#00b0fa]' },
        '영웅': { bg: 'from-[#2e1a3e]/40', border: 'border-[#ce43fb]/30', text: 'text-[#ce43fb]' },
        '고대': { bg: 'from-[#3d3325] to-transparent', text: 'text-[#d6aa71]', border: 'border-[#d6aa71]/50' },
        '유물': { bg: 'from-[#2a1a12]/60 to-transparent', text: 'text-[#e7a15d]', border: 'border-[#a6632d]/40' },
        '전설': { bg: 'from-[#362e15]/60 to-transparent', text: 'text-[#f9ae00]', border: 'border-[#f9ae00]/30' },
        '에스더': { bg: 'from-[#0d2e2e]/40', border: 'border-[#2edbd3]/60', text: 'text-[#2edbd3]', glow: 'shadow-[#2edbd3]/30' }
    };
    const theme = themes[gradeName] || themes['고대'];

    const TooltipBody = (
        <div
            className={`relative flex flex-col border border-white/10 shadow-2xl overflow-hidden font-sans transition-all duration-200 bg-[#0d0d0f]/10 backdrop-blur-md ${isMobile ? 'w-full rounded-t-2xl pb-4' : 'w-[300px] rounded-md'} ${theme.glow} ${className}`}
            style={!isMobile ? { maxHeight: '50vh' } : { maxHeight: '85vh' }}
        >
            {/* 상단 핸들 제거됨 */}

            {/* 헤더 섹션 */}
            <div className={`p-2 shrink-0 bg-[#111111] bg-gradient-to-br ${theme.bg} border-b border-white/10 z-10`}>
                <div className="flex gap-3 items-center">
                    <div className="relative shrink-0 w-[50px] h-[50px]">
                        <div className={`w-full h-full overflow-hidden rounded-md border-[1.5px] ${theme.border} bg-black bg-gradient-to-br ${theme.bg}`}>
                            <img src={itemIcon} className="w-full h-full object-cover" alt="" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className={`text-[14px] font-bold truncate leading-tight ${theme.text}`}>{itemName}</h4>
                        <div className="text-[12px] font-bold text-white/60 mt-0.5">{itemGrade}</div>
                    </div>
                    {isMobile && (
                        <button onClick={onClose} className="p-1 text-white/40 hover:text-white">
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* 본문 섹션 */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#111111]/10 backdrop-blur-md
                [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="p-3 grid grid-cols-2 gap-x-5 gap-y-1 bg-[#111111]/40">
                    <div className="space-y-2 col-span-1 border-r border-white/5 pr-4">
                        <div className="text-[11.5px] leading-tight font-bold text-white">
                            {itemLevelAndTier}
                            {advRefine && <div className="text-[#ffcf4d] mt-1">{advRefine}</div>}
                        </div>
                        {baseEffect && (
                            <div className="space-y-1">
                                <p className="text-white/30 text-[11px] font-bold uppercase">[기본 효과]</p>
                                <p className="text-white/90 text-[11px] whitespace-pre-line leading-relaxed">{cleanText(baseEffect)}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 col-span-1">
                        {quality !== -1 && (
                            <div className="mb-2 space-y-1.5">
                                <div className="flex justify-between text-[11px] font-bold text-white/90 uppercase">
                                    <span>품질 {quality}</span>
                                </div>
                                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full transition-all duration-700"
                                        style={{
                                            width: `${quality}%`,
                                            backgroundColor: quality === 100 ? '#FF8000' : quality >= 90 ? '#CE43FB' : quality >= 70 ? '#00B0FA' : '#00D100'
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        {addEffect && (
                            <div className="space-y-0.5">
                                <p className="text-white/30 text-[11px] font-bold uppercase">[추가 효과]</p>
                                <p className="text-white/90 text-[11px] font-semibold leading-relaxed">{cleanText(addEffect)}</p>
                            </div>
                        )}
                        {arkPassive && (
                            <div className="mt-2">
                                <p className="text-white/30 text-[11px] font-bold uppercase">[아크 패시브]</p>
                                <p className="text-white/90 text-[11px] font-bold leading-tight">{cleanText(arkPassive)}</p>
                            </div>
                        )}
                        {engraveGroup && (
                            <div className="mt-2 space-y-0.5">
                                <p className="text-[#A9D0F5]/40 text-[11px] font-bold uppercase">[{cleanText(engraveGroup.topStr)}]</p>
                                {Object.values(engraveGroup.contentStr).map((c: any, i: number) => {
                                    const t = cleanText(c.contentStr);
                                    if(!t) return null;
                                    return <p key={i} className={`text-[11px] font-medium leading-snug ${t.includes('감소') ? 'text-[#fe2e2e]' : 'text-white/80'}`}>{t}</p>;
                                })}
                            </div>
                        )}
                    </div>
                </div>
                {/* 하단 정보 섹션 제거됨 */}
            </div>

            <div className="h-[1px] shrink-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
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
                    className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
                />
                <motion.div
                    className="relative w-full z-10"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                >
                    {TooltipBody}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="absolute top-0 left-0 z-[9999]">
            {TooltipBody}
        </div>
    );
};

export default EquipmentTooltip;