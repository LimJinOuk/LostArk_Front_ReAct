import React, { useEffect, useState } from 'react';
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
    const cleanText = (text: string) => text ? text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim() : '';

    // 티어 배지 렌더링 함수
    const renderTitleWithTier = (fullText: string, tab: string, isModal = false) => {
        const text = cleanText(fullText);
        const tierMatch = text.match(/(\d+)티어/);
        const tierNum = tierMatch ? tierMatch[1] : null;

        // 제목에서 탭이름과 티어 정보를 제거하여 핵심 명칭만 남김
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

    const getIconUrl = (iconId: string | number, tab: string) => {
        if (tab === '진화') return `https://cdn-lostark.game.onstove.com/efui_iconatlas/ark_passive_evolution/ark_passive_evolution_${iconId}.png`;
        const idStr = String(iconId);
        if (idStr.includes('_')) {
            const [folderKey, realId] = idStr.split('_');
            const folderName = `ark_passive_${folderKey}`;
            return `https://cdn-lostark.game.onstove.com/efui_iconatlas/${folderName}/${folderName}_${realId}.png`;
        }
        return `https://cdn-lostark.game.onstove.com/efui_iconatlas/ark_passive_01/ark_passive_01_${iconId}.png`;
    };

    const getCurrentMaster = () => {
        if (!MASTER_DATA) return [];
        if (activeTab === '진화') return MASTER_DATA.EVOLUTION || [];
        if (activeTab === '도약') return MASTER_DATA.LEAP || [];
        if (activeTab === '깨달음') {
            const currentClass = character?.CharacterClassName || character?.CharacterClass;
            return (currentClass && (MASTER_DATA.ENLIGHTENMENT_BY_CLASS as any)[currentClass]) || [];
        }
        return [];
    };

    if (loading) return <div className="py-24 flex flex-col items-center justify-center bg-[#0f0f0f] min-h-[400px]"><Loader2 className="animate-spin text-indigo-500 w-8 h-8 mb-3" /><span className="text-zinc-500 text-sm">정보를 불러오는 중...</span></div>;
    if (error) return <div className="py-24 text-center bg-[#0f0f0f] text-zinc-500 flex flex-col items-center gap-4"><AlertCircle className="w-12 h-12 text-zinc-700" /><p>데이터 로딩 실패 ({error})</p></div>;

    const currentMaster = getCurrentMaster();
    const tiers = [1, 2, 3, 4, 5];

    return (
        <div className="w-full bg-[#0f0f0f] text-zinc-300 p-6 space-y-10 font-sans relative overflow-x-hidden">

            {/* 상단 헤더 컨테이너: 3단 그리드 */}
            <div className="w-full max-w-5xl mx-auto mb-6 px-4 grid grid-cols-3 items-center sticky top-4 z-50">
                <div></div>

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
                <div className="flex flex-col items-end justify-center">
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
                        <span className="text-zinc-500 font-bold text-xs uppercase">Points</span>
                    </div>

                    <div className={`px-3 py-0.5 rounded-full border shadow-inner mt-1 transition-all duration-300 ${
                        activeTab === "진화" ? "bg-blue-500/10 border-blue-500/20" :
                            activeTab === "깨달음" ? "bg-purple-500/10 border-purple-500/20" : "bg-amber-500/10 border-amber-500/20"
                    }`}>
                        <p className={`text-[10px] font-bold tracking-widest transition-colors duration-300 ${
                            activeTab === "진화" ? "text-blue-400/80" :
                                activeTab === "깨달음" ? "text-purple-400/80" : "text-amber-400/80"
                        }`}>
                            {data?.Points?.find((p: any) => p.Name === activeTab)?.Description || "정보 없음"}
                        </p>
                    </div>
                </div>
            </div>

            {/* 메인 보드 */}
            <div className="flex flex-col gap-1">
                {tiers.map((tierNum) => {
                    const tierNodes = currentMaster.filter(m => Number(m.tier) === tierNum);
                    if (tierNodes.length === 0) return null;
                    return (
                        <div key={tierNum} className="flex items-center w-full relative min-h-[140px] border-b border-white/[0.03] last:border-0">
                            <div className="flex flex-col items-center justify-center w-20 md:w-28 shrink-0 z-10 border-r border-white/5">
                                <span className="text-xl md:text-2xl font-black text-zinc-500 leading-none">{tierNum}</span>
                            </div>

                            <div className="flex-1 flex justify-center items-center gap-x-2 md:gap-x-10 pr-55 md:pr-38 relative h-full min-w-0">
                                {tierNodes.map((node, nodeIdx) => {
                                    const activeEffect = data?.Effects?.find((eff: any) =>
                                        eff.Name.includes(activeTab) && eff.Description.replace(/\s+/g, '').includes(node.name.replace(/\s+/g, ''))
                                    );
                                    const isActive = !!activeEffect;
                                    const currentLv = isActive ? (activeEffect.Description.match(/Lv\.(\d+)/)?.[1] || node.max) : 0;
                                    const isMainLine = activeTab === '깨달음' && (tierNum === 1 || tierNum === 2 || (tierNum === 3 && (nodeIdx === 1 || nodeIdx === 2)) || (tierNum === 4 && (nodeIdx === 1 || nodeIdx === 2)));

                                    return (
                                        <div key={node.name} className="flex flex-col items-center relative py-4 w-16 md:w-24 shrink-0">
                                            {tierNum > 1 && isMainLine && <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-[1px] h-10 bg-indigo-500/20" />}
                                            <div
                                                className={`relative rounded-lg border transition-all flex items-center justify-center shrink-0 ${isActive ? 'cursor-pointer border-indigo-500 bg-zinc-900 shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-110' : 'grayscale opacity-20 border-white/5 bg-zinc-900 scale-90'}`}
                                                style={{ width: 'clamp(44px, 5vw, 56px)', height: 'clamp(44px, 5vw, 56px)' }}
                                                onClick={() => isActive && setSelectedEffect(activeEffect)}
                                                onMouseEnter={(e) => isActive && setHoverInfo({ effect: activeEffect, rect: e.currentTarget.getBoundingClientRect() })}
                                                onMouseLeave={() => setHoverInfo(null)}
                                            >
                                                <img src={getIconUrl(node.iconId, activeTab)} className="w-[85%] h-[85%] object-contain" />
                                                {isActive && <div className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black px-1 rounded shadow-lg border border-indigo-400/50 z-20">Lv.{currentLv}</div>}
                                            </div>
                                            <div className="mt-3 text-center w-full min-h-[35px] overflow-hidden px-1">
                                                <p className={`text-[11px] md:text-[13px] font-bold truncate leading-tight ${isActive ? 'text-zinc-100' : 'text-zinc-600'}`}>{node.name}</p>
                                                <p className={`text-[10px] font-black mt-0.5 ${isActive ? 'text-indigo-400' : 'text-zinc-800'}`}>{currentLv}/{node.max}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 툴팁 */}
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
                                {renderTitleWithTier(hoverInfo.effect.Description.split(' Lv')[0], activeTab)}
                            </div>
                            <div className="text-[12px] leading-relaxed text-zinc-400">
                                {safeJsonParse(hoverInfo.effect.ToolTip)?.Element_002?.value ? cleanText(safeJsonParse(hoverInfo.effect.ToolTip).Element_002.value.split('||')[0]) : "정보 없음"}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 모달 */}
            <AnimatePresence>
                {selectedEffect && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEffect(null)} className="absolute inset-0 bg-black/80" />
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-[480px] bg-[#1a1a1c] border border-white/10 p-6 rounded-xl shadow-2xl">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={selectedEffect.Icon} className="w-14 h-14 rounded-lg border border-indigo-500/50 p-1 bg-zinc-900 shadow-lg" />
                                <div>
                                    {renderTitleWithTier(selectedEffect.Description.split(' Lv')[0], activeTab, true)}
                                    <span className={`text-sm font-bold mt-1 block ${
                                        activeTab === "진화" ? "text-blue-400" : activeTab === "깨달음" ? "text-purple-400" : "text-amber-400"
                                    }`}>현재 적용 효과</span>
                                </div>
                            </div>
                            {/* 본문 박스: h-auto(자동 높이)와 min-h 제거 */}
                            <div className="bg-black/40 p-4 rounded-lg border border-white/5 text-[13px] leading-relaxed text-zinc-300 max-h-[400px] overflow-y-auto custom-scrollbar mb-3">
                                {safeJsonParse(selectedEffect.ToolTip)?.Element_002?.value ? (
                                    <div
                                        className="inline-block w-full" // 블록 요소가 꽉 차지 않게 함
                                        dangerouslySetInnerHTML={{
                                            __html: safeJsonParse(selectedEffect.ToolTip).Element_002.value
                                                .replace(/\|\|/g, '<br/>') // 간격을 좁히기 위해 <br/> 두 번에서 한 번으로 수정
                                                .trim()
                                        }}
                                    />
                                ) : (
                                    <p className="py-1 text-center">상세 정보가 없습니다.</p>
                                )}
                            </div>

                            {/* 버튼: 마진을 줄여 본문과 밀착 */}
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