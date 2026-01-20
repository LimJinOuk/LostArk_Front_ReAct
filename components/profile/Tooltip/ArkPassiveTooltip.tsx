import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArkPassiveModalProps {
    activeTab: '진화' | '깨달음' | '도약';
    hoverInfo: { effect: any; rect: DOMRect | null } | null;
    selectedEffect: any;
    setSelectedEffect: (effect: any) => void;
    renderTitleWithTier: (fullText: string | undefined | null, tab: string, isModal?: boolean) => React.ReactNode;
    safeJsonParse: (jsonString: string) => any;
    cleanText: (text: any) => string;
}

export const ArkPassiveModal = ({
                                    activeTab,
                                    hoverInfo,
                                    selectedEffect,
                                    setSelectedEffect,
                                    renderTitleWithTier,
                                    safeJsonParse,
                                    cleanText,
                                }: ArkPassiveModalProps) => {

    const themeColors: Record<string, string> = {
        '진화': 'text-blue-400',
        '깨달음': 'text-purple-400',
        '도약': 'text-amber-400'
    };

    // 제목에서 "n티어" 텍스트를 제거하는 헬퍼 함수
    const removeTierText = (text: string | undefined | null) => {
        if (!text) return '';
        // "1티어", "2티어" 등의 문구와 앞뒤 공백 제거
        return text.replace(/\d+티어/g, '').trim();
    };

    return (
        <>
            <AnimatePresence>
                {hoverInfo && !selectedEffect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        style={{
                            position: 'fixed',
                            left: hoverInfo.rect!.left + hoverInfo.rect!.width / 2,
                            top: hoverInfo.rect!.top - 12,
                            transform: 'translateX(-50%) translateY(-100%)',
                            zIndex: 9999,
                            pointerEvents: 'none',
                        }}
                        className="w-72"
                    >
                        <div className="bg-[#161618]/95 backdrop-blur-md border border-white/10 p-4 rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                                <div className="relative shrink-0">
                                    <img
                                        src={hoverInfo.effect.Icon}
                                        className="w-10 h-10 rounded-lg border border-white/10 bg-black/20"
                                        alt=""
                                    />
                                    {/* 1. 아이콘 우측 하단 티어 뱃지 */}
                                    {hoverInfo.effect.Description && (() => {
                                        const desc = hoverInfo.effect.Description;
                                        const tierMatch = desc.match(/(\d+)티어/);
                                        const tierNum = tierMatch ? tierMatch[1] : '1';

                                        // 색상 클래스 매핑
                                        let colorClass = 'text-white border-white/20'; // 기본값
                                        if (desc.includes('진화')) colorClass = 'text-blue-400 border-blue-400/50';
                                        else if (desc.includes('깨달음')) colorClass = 'text-purple-400 border-purple-400/50';
                                        else if (desc.includes('도약')) colorClass = 'text-amber-400 border-amber-400/50';

                                        return (
                                            <div className={`absolute -bottom-1 -right-1 bg-[#161618] border px-1 rounded text-[9px] font-bold ${colorClass} shadow-sm leading-tight`}>
                                                T{tierNum}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* 2. 제목 옆 티어 텍스트 제거 적용 */}
                                    {renderTitleWithTier(removeTierText(hoverInfo.effect.Description?.split(' Lv')[0]), activeTab)}
                                </div>
                            </div>

                            <div className="text-[12.5px] font-medium leading-relaxed text-zinc-400">
                                {(() => {
                                    const rawText = safeJsonParse(hoverInfo.effect.ToolTip)?.Element_002?.value
                                        ? cleanText(safeJsonParse(hoverInfo.effect.ToolTip).Element_002.value.split('||')[0])
                                        : "상세 정보가 없습니다.";

                                    const parts = rawText.split(/(\d+(?:\.\d+)?%?)/g);

                                    return parts.map((part, i) =>
                                        /(\d+(?:\.\d+)?%?)/.test(part) ? (
                                            <span key={i} className="font-bold text-green-400">{part}</span>
                                        ) : part
                                    );
                                })()}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedEffect && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedEffect(null)}
                            className="absolute inset-0 bg-black/85"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-[500px] bg-[#1a1a1c] border border-white/10 p-7 rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 opacity-50 ${activeTab === '진화' ? 'bg-blue-500' : activeTab === '깨달음' ? 'bg-purple-500' : 'bg-amber-500'}`} />

                            <div className="flex items-start gap-5 mb-8">
                                <div className="relative shrink-0">
                                    <img
                                        src={selectedEffect.Icon}
                                        className="w-16 h-16 rounded-xl border border-white/10 p-1.5 bg-zinc-900 shadow-2xl"
                                        alt=""
                                    />
                                    {/* 상세 모달 아이콘에도 티어 표시 */}
                                    {selectedEffect.Description && (() => {
                                        const desc = selectedEffect.Description;
                                        const tierNum = desc.match(/(\d+)티어/)?.[1] || '1';

                                        // activeTab 상태에 따라 border와 text 색상을 동적으로 할당
                                        let colorClass = 'text-white border-white/20'; // 기본값
                                        if (activeTab === '진화') colorClass = 'text-blue-400 border-blue-400/50';
                                        else if (activeTab === '깨달음') colorClass = 'text-purple-400 border-purple-400/50';
                                        else if (activeTab === '도약') colorClass = 'text-amber-400 border-amber-400/50';

                                        return (
                                            <div className={`absolute -bottom-1 -right-1 bg-[#1a1a1c] border px-1.5 py-0.5 rounded text-[11px] font-black ${colorClass} shadow-lg leading-tight`}>
                                                T{tierNum}
                                            </div>
                                        );
                                    })()}
                                </div>
                                <div className="flex-1">
                                    {/* 상세 모달 제목에서도 티어 텍스트 제거 */}
                                    {renderTitleWithTier(removeTierText(selectedEffect.Description?.split(' Lv')[0]), activeTab, true)}
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[13px] font-black py-1 uppercase tracking-widest ${themeColors[activeTab]}`}>
                                            현재 적용 효과
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-black/40 p-5 rounded-xl border border-white/5 text-[13.5px] leading-[1.6] text-zinc-300 max-h-[450px] overflow-y-auto custom-scrollbar mb-6 shadow-inner">
                                {safeJsonParse(selectedEffect.ToolTip)?.Element_002?.value ? (
                                    <div
                                        className="inline-block w-full space-y-2"
                                        dangerouslySetInnerHTML={{
                                            __html: safeJsonParse(selectedEffect.ToolTip).Element_002.value
                                                .replace(/\|\|/g, '<div class="h-2"></div>')
                                                .trim()
                                        }}
                                    />
                                ) : (
                                    <p className="py-4 text-center text-zinc-500">정보를 찾을 수 없습니다.</p>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedEffect(null)}
                                className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] border border-white/5 shadow-lg"
                            >
                                닫기
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};