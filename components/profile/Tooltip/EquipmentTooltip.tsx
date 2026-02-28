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
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < 640 : false
    );

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
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

    // 에스더 여부 확인
    const isEsther = gradeName === '에스더';

    // 일반 각인 또는 에스더 효과 그룹 찾기
    const engraveGroup = elements.find(el => el?.type === 'IndentStringGroup')?.value?.Element_000;

    const themes: any = {
        '일반': { bg: 'bg-[linear-gradient(135deg,#232323_0%,#3a3a3a_100%)]', border: 'border-white/10', text: 'text-zinc-400', glow: '', accent: 'bg-zinc-500' },
        '고급': { bg: 'bg-[linear-gradient(135deg,#18220b_0%,#33411a_100%)]', border: 'border-[#48c948]/30', text: 'text-[#4edb4e]', glow: 'shadow-[#48c948]/5', accent: 'bg-[#48c948]' },
        '희귀': { bg: 'bg-[linear-gradient(135deg,#111d2d_0%,#243d5c_100%)]', border: 'border-[#00b0fa]/30', text: 'text-[#33c2ff]', glow: 'shadow-[#00b0fa]/10', accent: 'bg-[#00b0fa]' },
        '영웅': { bg: 'bg-[linear-gradient(135deg,#201334_0%,#462b6d_100%)]', border: 'border-[#ce43fb]/30', text: 'text-[#d966ff]', glow: 'shadow-[#ce43fb]/10', accent: 'bg-[#ce43fb]' },
        '전설': { bg: 'bg-[linear-gradient(135deg,#362003_0%,#9e5f04_100%)]', border: 'border-[#f99200]/40', text: 'text-[#ffaa33]', glow: 'shadow-[#f99200]/15', accent: 'bg-[#f99200]' },
        '유물': { bg: 'bg-[linear-gradient(135deg,#341a09_0%,#a24407_100%)]', border: 'border-[#fa5d00]/50', text: 'text-[#ff7526]', glow: 'shadow-[#fa5d00]/25 drop-shadow-[0_0_15px_rgba(250,93,0,0.35)]', accent: 'bg-[#fa5d00]' },
        '고대': { bg: 'bg-[linear-gradient(135deg,#2b241a_0%,#b8a37c_100%)]', border: 'border-[#e9d2a6]/40', text: 'text-[#e9d2a6]' },
        '에스더': { bg: 'bg-[linear-gradient(135deg,#051716_0%,#156b69_100%)]', border: 'border-[#2edbd3]/60', text: 'text-[#45f3ec]' }
    };
    const theme = themes[gradeName] || themes['고대'];

    const TooltipBody = (
        <div
            className={`relative flex flex-col border border-white/10 shadow-2xl overflow-hidden font-sans transition-all duration-200 bg-[#0d0d0f]/10 backdrop-blur-md ${isMobile ? 'w-full rounded-t-2xl pb-4' : 'w-[300px] rounded-md'} ${theme.glow} ${className}`}
            style={!isMobile ? { maxHeight: '50vh' } : { maxHeight: '85vh' }}
        >
            {/* 헤더 섹션 */}
            <div className={`p-2 shrink-0 bg-[#111111] ${theme.bg} border-b border-white/10 z-10`}>
                <div className="flex gap-3 items-center">
                    <div className="relative shrink-0 w-[50px] h-[50px]">
                        <div className={`w-full h-full overflow-hidden rounded-md border-[1.5px] ${theme.border} bg-black ${theme.bg}`}>
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

                    {/* [좌측 섹션]: 에스더일 때 품질과 추가효과가 이쪽으로 이동 */}
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
                        {/* 에스더 전용: 좌측에 품질과 추가효과 배치 */}
                        {isEsther && (
                            <>
                                {quality !== -1 && (
                                    <div className="mt-2 space-y-1.5">
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
                                    <div className="mt-2 space-y-0.5">
                                        <p className="text-white/30 text-[11px] font-bold uppercase">[추가 효과]</p>
                                        <p className="text-white/90 text-[11px] font-semibold leading-relaxed">{cleanText(addEffect)}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* [우측 섹션] */}
                    <div className="space-y-2 col-span-1">
                        {!isEsther ? (
                            /* 일반 아이템 우측 레이아웃 */
                            <>
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
                            </>
                        ) : (
                            /* 에스더 아이템 전용 우측 레이아웃 (에스더 효과 배치) */
                            <>
                            {engraveGroup && (
                                <div className="space-y-1">
                                    <p className="text-[#2edbd3]/90 text-[11px] font-bold uppercase">[{cleanText(engraveGroup.topStr)}]</p>
                                    {Object.values(engraveGroup.contentStr).map((c: any, i: number) => {
                                        const t = cleanText(c.contentStr);
                                        if (!t) return null;

                                        // 정규식 설명:
                                        // 1. ('.*?') : 작은따옴표로 감싸진 텍스트
                                        // 2. (\d+[\d.,%+~-]*[초m%+]?) : 숫자로 시작해서 단위(초, m, %, + 등)까지 포함된 덩어리
                                        const parts = t.split(/('.*?'|\d+[\d.,%+~-]*(?:초|m|%|\+)?)/g);

                                        return (
                                            <p key={i} className="text-[11px] font-medium leading-snug text-white/80">
                                                {parts.map((part, index) => {
                                                    if (part.startsWith("'") && part.endsWith("'")) {
                                                        // 민트색: '내용'
                                                        return <span key={index} className="text-[#45f3ec]">{part}</span>;
                                                    } else if (/^\d/.test(part)) {
                                                        // 초록색: 숫자 + 단위(초, m, %, + 등)
                                                        return <span key={index} className="text-[#48c948] font-bold">{part}</span>;
                                                    }
                                                    return part;
                                                })}
                                            </p>
                                        );
                                    })}
                                </div>
                            )}
                            </>
                        )}

                        {/* 각인은 에스더가 아닐 때만 하단에 추가 출력 (필요시) */}
                        {!isEsther && engraveGroup && (
                            <div className="mt-2 space-y-0.5">
                                <p className="text-[#2edbd3]/90 text-[11px] font-bold uppercase">[{cleanText(engraveGroup.topStr)}]</p>
                                {Object.values(engraveGroup.contentStr).map((c: any, i: number) => {
                                    const t = cleanText(c.contentStr);
                                    if(!t) return null;
                                    return <p key={i} className={`text-[11px] font-medium leading-snug ${t.includes('감소') ? 'text-[#fe2e2e]' : 'text-white/80'}`}>{t}</p>;
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-[1px] shrink-0 from-transparent via-white/10 to-transparent" />
        </div>
    );

    return (
        <>
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
        </>
    );
};

export default EquipmentTooltip;