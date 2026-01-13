import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { MASTER_DATA } from '@/constants/arkPassiveData';

export const ArkPassiveTab = ({ character }: { character: any }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'진화' | '깨달음' | '도약'>('깨달음');
    const [selectedEffect, setSelectedEffect] = useState<any>(null);
    const [hoverInfo, setHoverInfo] = useState<{ effect: any; rect: DOMRect | null } | null>(null);

    useEffect(() => {
        const fetchNodes = async () => {
            if (!character?.CharacterName) return;
            setLoading(true); setError(null);
            try {
                const response = await fetch(`/arkpassive?name=${encodeURIComponent(character.CharacterName)}`);
                if (!response.ok) throw new Error(`${response.status}`);
                const json = await response.json();
                setData(json);
            } catch (error: any) { setError(error.message); } finally { setLoading(false); }
        };
        fetchNodes();
    }, [character?.CharacterName]);

    const safeJsonParse = (jsonString: string) => { try { return JSON.parse(jsonString); } catch (e) { return null; } };

    // 💡 수정: 문자열이 아닌 데이터가 들어올 경우를 대비한 방어 로직
    const cleanText = (text: any) => {
        if (!text || typeof text !== 'string') return '';
        return text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    };

    const getIconUrl = (iconId: string | number, tab: string) => {
        const idStr = String(iconId);

        // 1. 진화(Evolution) 탭
        if (tab === '진화') {
            return `https://cdn-lostark.game.onstove.com/efui_iconatlas/ark_passive_evolution/ark_passive_evolution_${idStr}.png`;
        }

        // 2. 깨달음 & 도약 탭 (신규 직업/노드 규칙 적용)
        // 예: gl_17 이 들어오면 -> ark_passive_gl 폴더 안의 ark_passive_gl_17.png 호출
        if (idStr.includes('_')) {
            const parts = idStr.split('_');

            // 만약 아이콘 ID가 'dr_skill_01_24'처럼 파츠가 3개 이상이면 공식 서버 규칙이 복잡하므로 인벤 사용
            if (parts.length > 2) {
                return `https://static.inven.co.kr/image_2011/site_image/lostark/arkpassiveicon/ark_passive_${idStr}.png?v=240902a`;
            }

            // 일반적인 2파츠 구성 (gl_17, dr_1 등) -> 공식 서버의 중첩 폴더 규칙 적용
            const folderKey = parts[0];
            const folderName = `ark_passive_${folderKey}`;
            return `https://cdn-lostark.game.onstove.com/efui_iconatlas/${folderName}/${folderName}_${parts[1]}.png`;
        }

        // 3. 기본 공용 아이콘 (숫자만 있거나 언더바 없는 경우)
        return `https://cdn-lostark.game.onstove.com/efui_iconatlas/ark_passive_01/ark_passive_01_${idStr}.png`;
    };

    const currentMaster = useMemo(() => {
        if (!MASTER_DATA) return [];
        const currentClass = character?.CharacterClassName || character?.CharacterClass;
        if (!currentClass) return [];

        if (activeTab === '진화') return MASTER_DATA.EVOLUTION || [];
        if (activeTab === '깨달음') return (MASTER_DATA.ENLIGHTENMENT_BY_CLASS as any)[currentClass] || [];
        if (activeTab === '도약') return (MASTER_DATA.LEAP_BY_CLASS as any)[currentClass] || [];

        return [];
    }, [activeTab, character]);

    const renderTitleWithTier = (fullText: string | undefined | null, tab: string, isModal = false) => {
        if (!fullText) return null; // 💡 데이터 누락 방지
        const text = cleanText(fullText);
        const tierMatch = text.match(/(\d+)티어/);
        const tierNum = tierMatch ? tierMatch[1] : null;
        const titleWithoutTier = text.replace(/\d+티어/, '').replace(tab, '').trim();

        const themeColors: Record<string, string> = {
            '진화': 'border-blue-500/30 text-blue-400 bg-blue-500/10',
            '깨달음': 'border-purple-500/30 text-purple-400 bg-purple-500/10',
            '도약': 'border-amber-500/30 text-amber-400 bg-amber-500/10'
        };

        return (
            <div className="flex items-center gap-2">
                {tierNum && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border leading-none ${themeColors[tab]}`}>
                        T{tierNum}
                    </span>
                )}
                <h4 className={`${isModal ? 'text-lg' : 'text-[13px]'} text-white font-bold`}>
                    {titleWithoutTier}
                </h4>
            </div>
        );
    };

    if (loading) return <div className="py-24 flex flex-col items-center justify-center bg-[#0f0f0f] min-h-[400px]"><Loader2 className="animate-spin text-indigo-500 w-8 h-8 mb-3" /><span className="text-zinc-500 text-sm">정보를 불러오는 중...</span></div>;
    if (error) return <div className="py-24 text-center bg-[#0f0f0f] text-zinc-500 flex flex-col items-center gap-4"><AlertCircle className="w-12 h-12 text-zinc-700" /><p>데이터 로딩 실패 ({error})</p></div>;

    return (
        <div className="w-full bg-[#0f0f0f] text-zinc-300 p-6 space-y-6 font-sans relative overflow-x-hidden">
            {/* 탭 네비게이션 */}
            <div className="flex gap-1 p-1 bg-[#1a1a1c] w-full max-w-[320px] rounded-lg border border-white/5 shadow-xl mx-auto">
                {['진화', '깨달음', '도약'].map((tab: any) => {
                    const isActive = activeTab === tab;
                    const activeStyles: Record<string, string> = {
                        '진화': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
                        '깨달음': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
                        '도약': 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    };
                    return (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setHoverInfo(null); }}
                            className={`flex-1 py-1.5 rounded text-[12px] font-bold transition-all border border-transparent
                                ${isActive ? activeStyles[tab] : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>

            {/* 포인트 정보 */}
            <div className="flex flex-row items-end justify-center gap-2">
                <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black tracking-tighter transition-colors duration-300 ${
                        activeTab === "진화" ? "text-blue-400" : activeTab === "깨달음" ? "text-purple-400" : "text-amber-400"
                    }`}>
                         {data?.Points?.find((p: any) => p.Name === activeTab)?.Value || 0}
                    </span>
                    <span className="text-xl font-bold text-zinc-600 ml-0.5">/</span>
                    <span className="text-xl font-bold text-zinc-500 mr-1.5">
                        {activeTab === "진화" ? 140 : activeTab === "깨달음" ? 101 : 70}
                    </span>
                </div>
                <div className={`px-3 py-0.5 rounded-full border shadow-inner mt-1 transition-all duration-300 ${
                    activeTab === "진화" ? "bg-blue-500/10 border-blue-500/20" :
                        activeTab === "깨달음" ? "bg-purple-500/10 border-purple-500/20" : "bg-amber-500/10 border-amber-500/20"
                }`}>
                    <p className={`text-xl font-bold tracking-widest transition-colors duration-300 ${
                        activeTab === "진화" ? "text-blue-400/80" :
                            activeTab === "깨달음" ? "text-purple-400/80" : "text-amber-400/80"
                    }`}>
                        {data?.Points?.find((p: any) => p.Name === activeTab)?.Description || "정보 없음"}
                    </p>
                </div>
            </div>

            {/* 메인 보드 */}
            <div className="flex flex-col gap-1">
                {[1, 2, 3, 4, 5].map((tierNum) => {
                    const tierNodes = currentMaster.filter(m => Number(m.tier) === tierNum);
                    if (tierNodes.length === 0) return null;
                    return (
                        <div key={tierNum} className="flex items-center w-full relative min-h-[140px] border-b border-white/[0.03] last:border-0">
                            <div className="flex flex-col items-center justify-center w-20 md:w-28 shrink-0 z-10 border-r border-white/5">
                                <span className="text-xl md:text-2xl font-black text-zinc-500 leading-none">{tierNum}</span>
                            </div>

                            <div className="flex-1 flex justify-center items-center gap-x-2 md:gap-x-10 ml-[-110px] pr-55 md:pr-38 relative h-full min-w-0">
                                {tierNodes.map((node) => {
                                    // 💡 수정: 안전한 데이터 비교 및 공백 제거 처리
                                    const activeEffect = data?.Effects?.find((eff: any) =>
                                        eff.Name?.includes(activeTab) &&
                                        eff.Description?.replace(/\s+/g, '').includes(node.name.replace(/\s+/g, ''))
                                    );
                                    const isActive = !!activeEffect;
                                    const currentLv = isActive ? (activeEffect.Description?.match(/Lv\.(\d+)/)?.[1] || node.max) : 0;

                                    const themeClass = activeTab === '진화' ? 'blue' : activeTab === '깨달음' ? 'purple' : 'amber';
                                    const activeBorderColor = activeTab === '진화' ? 'border-blue-500' : activeTab === '깨달음' ? 'border-purple-500' : 'border-amber-500';

                                    return (
                                        <div key={node.name} className="flex flex-col items-center relative py-4 w-16 md:w-24 shrink-0">
                                            <div
                                                className={`relative rounded-lg border transition-all flex items-center justify-center shrink-0 ${isActive ? `cursor-pointer ${activeBorderColor} bg-zinc-900 shadow-lg scale-110` : 'grayscale opacity-20 border-white/5 bg-zinc-900 scale-90'}`}
                                                style={{ width: 'clamp(44px, 5vw, 56px)', height: 'clamp(44px, 5vw, 56px)' }}
                                                onClick={() => isActive && setSelectedEffect(activeEffect)}
                                                onMouseEnter={(e) => isActive && setHoverInfo({ effect: activeEffect, rect: e.currentTarget.getBoundingClientRect() })}
                                                onMouseLeave={() => setHoverInfo(null)}
                                            >
                                                <img
                                                    src={getIconUrl(node.iconId, activeTab)}
                                                    className="w-[85%] h-[85%] object-contain"
                                                    referrerPolicy="no-referrer"
                                                />
                                                {isActive && (
                                                    <div className={`absolute -top-1 -right-1 bg-${themeClass}-600 text-white text-[10px] font-black px-1 rounded shadow-lg border border-white/20 z-20`}>
                                                        Lv.{currentLv}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-3 text-center w-full min-h-[35px] overflow-hidden px-1">
                                                <p className={`text-[11px] md:text-[13px] font-bold truncate leading-tight ${isActive ? 'text-zinc-100' : 'text-zinc-600'}`}>{node.name}</p>
                                                <p className={`text-[10px] font-black mt-0.5 ${isActive ? `text-${themeClass}-400` : 'text-zinc-800'}`}>{currentLv}/{node.max}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 툴팁 모달 */}
            <AnimatePresence>
                {hoverInfo && !selectedEffect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', left: hoverInfo.rect!.left + hoverInfo.rect!.width / 2, top: hoverInfo.rect!.top - 10, transform: 'translate(-50%, -100%)', zIndex: 9999, pointerEvents: 'none' }}
                        className="w-64"
                    >
                        <div className="bg-[#1a1a1c] border border-white/10 p-4 rounded-lg shadow-2xl">
                            <div className="flex items-center gap-3 mb-2 pb-2 border-b border-white/5">
                                <img src={hoverInfo.effect.Icon} className="w-8 h-8 rounded border border-white/10" />
                                {renderTitleWithTier(hoverInfo.effect.Description?.split(' Lv')[0], activeTab)}
                            </div>
                            <div className="text-[12px] leading-relaxed text-zinc-400">
                                {safeJsonParse(hoverInfo.effect.ToolTip)?.Element_002?.value ? cleanText(safeJsonParse(hoverInfo.effect.ToolTip).Element_002.value.split('||')[0]) : "정보 없음"}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 상세 정보 모달 */}
            <AnimatePresence>
                {selectedEffect && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEffect(null)} className="absolute inset-0 bg-black/80" />
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-[480px] bg-[#1a1a1c] border border-white/10 p-6 rounded-xl shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={selectedEffect.Icon} className="w-14 h-14 rounded-lg border border-white/10 p-1 bg-zinc-900 shadow-lg" />
                                <div>
                                    {renderTitleWithTier(selectedEffect.Description?.split(' Lv')[0], activeTab, true)}
                                    <span className={`text-sm font-bold mt-1 block ${
                                        activeTab === "진화" ? "text-blue-400" : activeTab === "깨달음" ? "text-purple-400" : "text-amber-400"
                                    }`}>현재 적용 효과</span>
                                </div>
                            </div>
                            <div className="bg-black/40 p-4 rounded-lg border border-white/5 text-[13px] leading-relaxed text-zinc-300 max-h-[400px] overflow-y-auto custom-scrollbar mb-3">
                                {safeJsonParse(selectedEffect.ToolTip)?.Element_002?.value ? (
                                    <div
                                        className="inline-block w-full"
                                        dangerouslySetInnerHTML={{
                                            __html: safeJsonParse(selectedEffect.ToolTip).Element_002.value
                                                .replace(/\|\|/g, '<br/>')
                                                .trim()
                                        }}
                                    />
                                ) : (
                                    <p className="py-1 text-center">상세 정보가 없습니다.</p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedEffect(null)}
                                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-sm transition-colors"
                            >
                                닫기
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};