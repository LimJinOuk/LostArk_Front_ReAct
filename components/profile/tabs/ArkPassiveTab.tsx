import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ArkPassiveModal } from '@/components/profile/Tooltip/ArkPassiveTooltip.tsx';
import { MASTER_DATA } from '@/constants/ArkPassiveData/arkPassiveData.tsx';

const TABS = ['진화', '깨달음', '도약'] as const;
type TabType = typeof TABS[number];

export const ArkPassiveTab = ({ character }: { character: any }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('깨달음');
    const [[page, direction], setPage] = useState([0, 0]);
    const [selectedEffect, setSelectedEffect] = useState<any>(null);
    const [hoverInfo, setHoverInfo] = useState<{ effect: any; rect: DOMRect | null } | null>(null);

    const handleTabChange = (newTab: TabType) => {
        const newIndex = TABS.indexOf(newTab);
        const currentIndex = TABS.indexOf(activeTab);
        setPage([newIndex, newIndex > currentIndex ? 1 : -1]);
        setActiveTab(newTab);
        setHoverInfo(null);
    };

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
    const cleanText = (text: any) => { if (!text || typeof text !== 'string') return ''; return text.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim(); };

    const getIconUrl = (iconId: string | number, tab: string) => {
        const idStr = String(iconId);
        if (tab === '진화') return `https://cdn-lostark.game.onstove.com/efui_iconatlas/ark_passive_evolution/ark_passive_evolution_${idStr}.png`;
        if (idStr.includes('_')) {
            const parts = idStr.split('_');
            if (parts.length > 2) return `https://static.inven.co.kr/image_2011/site_image/lostark/arkpassiveicon/ark_passive_${idStr}.png?v=240902a`;
            const folderName = `ark_passive_${parts[0]}`;
            return `https://cdn-lostark.game.onstove.com/efui_iconatlas/${folderName}/${folderName}_${parts[1]}.png`;
        }
        return `https://cdn-lostark.game.onstove.com/efui_iconatlas/ark_passive_01/ark_passive_01_${idStr}.png`;
    };

    const currentMaster = useMemo(() => {
        const currentClass = character?.CharacterClassName || character?.CharacterClass;
        if (!currentClass || !MASTER_DATA) return [];
        if (activeTab === '진화') return MASTER_DATA.EVOLUTION || [];
        if (activeTab === '깨달음') return (MASTER_DATA.ENLIGHTENMENT_BY_CLASS as any)[currentClass] || [];
        if (activeTab === '도약') return (MASTER_DATA.LEAP_BY_CLASS as any)[currentClass] || [];
        return [];
    }, [activeTab, character]);

    const theme = {
        '진화': { color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10', shadow: 'shadow-blue-500/20', bar: 'bg-blue-500' },
        '깨달음': { color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', shadow: 'shadow-purple-500/20', bar: 'bg-purple-500' },
        '도약': { color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10', shadow: 'shadow-amber-500/20', bar: 'bg-amber-500' }
    }[activeTab];

    const renderTitleWithTier = (fullText: string | undefined | null, tab: string, isModal = false) => {
        if (!fullText) return null;
        const text = cleanText(fullText);
        const tierMatch = text.match(/(\d+)티어/);
        const tierNum = tierMatch ? tierMatch[1] : null;
        const titleWithoutTier = text.replace(/\d+티어/, '').replace(tab, '').trim();

        return (
            <div className="flex items-center gap-2">
                {tierNum && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none bg-black/40 ${theme.border} ${theme.color}`}>
                        T{tierNum}
                    </span>
                )}
                <h4 className={`${isModal ? 'text-lg' : 'text-[13px]'} text-zinc-100 font-bold tracking-tight`}>
                    {titleWithoutTier}
                </h4>
            </div>
        );
    };

    if (loading) return (
        <div className="py-20 flex flex-col items-center justify-center bg-[#0d0d0f] min-h-[400px]">
            <Loader2 className="animate-spin text-indigo-500 w-8 h-8 mb-4 opacity-50" />
            <span className="text-zinc-500 text-[11px] font-medium tracking-[0.2em] animate-pulse uppercase">Archive Loading</span>
        </div>
    );

    return (
        <div className="w-full bg-[#0d0d0f] text-zinc-300 p-1.5 sm:p-4 space-y-3 font-sans relative overflow-hidden rounded-2xl shadow-2xl border border-white/5">
            {/* 앰비언트 라이트 (모바일에서는 더 작게) */}
            <motion.div
                animate={{ backgroundColor: activeTab === '진화' ? '#3b82f6' : activeTab === '깨달음' ? '#a855f7' : '#f59e0b' }}
                className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[240px] sm:w-[400px] h-[200px] blur-[80px] sm:blur-[120px] opacity-[0.06] pointer-events-none transition-colors duration-1000"
            />

            {/* 헤더 부위: 탭 & 포인트 */}
            <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4">
                {/* 탭 네비게이션 - 모바일 컴팩트화 */}
                <div className="inline-flex p-1 bg-black/50 backdrop-blur-xl rounded-xl border border-white/5 w-full sm:w-auto">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`relative flex-1 sm:flex-none px-4 sm:px-8 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-all duration-300
                                ${activeTab === tab ? theme.color : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {activeTab === tab && (
                                <motion.div layoutId="activeTabBg" className={`absolute inset-0 ${theme.bg} border-t border-white/10`} transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                            )}
                            <span className="relative z-10">{tab}</span>
                        </button>
                    ))}
                </div>

                {/* 포인트 보드 */}
                <div className="mt-1 flex flex-col items-center scale-90 sm:scale-100">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center gap-3"
                        >
                            {/* 포인트 숫자 영역 */}
                            <div className="flex items-baseline gap-1">
                <span className={`text-2xl sm:text-3xl font-black tracking-tighter ${theme.color}`}>
                    {data?.Points?.find((p: any) => p.Name === activeTab)?.Value || 0}
                </span>
                                <span className="text-lg sm:text-2xl font-bold text-zinc-700">/</span>
                                <span className="text-lg sm:text-2xl font-bold text-zinc-600">
                    {activeTab === "진화" ? 140 : activeTab === "깨달음" ? 101 : 70}
                </span>
                            </div>

                            {/* 배경 및 테두리가 탭에 따라 변하는 설명 박스 */}
                            <div className={`px-2.5 py-0.5 rounded-md border transition-colors duration-500 ${theme.bg} ${theme.border} backdrop-blur-sm`}>
                <span className={`text-[12px] font-black tracking-widest uppercase ${theme.color}`}>
                    {data?.Points?.find((p: any) => p.Name === activeTab)?.Description || "Passive"}
                </span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* 메인 보드 */}
            <div className="relative overflow-hidden min-h-[300px]">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={activeTab}
                        custom={direction}
                        initial={{ x: direction * 50 + '%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * -50 + '%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        /* [수정] 모바일에서 티어(Tier) 간의 간격을 좁힘 (gap-5 -> gap-1) */
                        className="w-full flex flex-col gap-1 sm:gap-2"
                    >
                        {[1, 2, 3, 4, 5].map((tierNum) => {
                            const tierNodes = currentMaster.filter(m => Number(m.tier) === tierNum);
                            if (tierNodes.length === 0) return null;
                            return (
                                /* [수정] 모바일에서 티어 박스 하단 패딩 및 상단 마진 최소화 (pb-4 mt-1 -> pb-1 mt-0) */
                                <div key={tierNum} className="flex flex-col sm:flex-row items-center sm:items-stretch w-full border-b border-white/[0.03] sm:border-b-0 last:border-0 pb-1 sm:pb-0 mt-0">

                                    {/* 티어 번호: 모바일에서는 높이 차지 최소화 */}
                                    <div className="flex items-center justify-center w-full sm:w-16 shrink-0 mb-1 sm:mb-0">
                            <span className="hidden sm:block text-2xl font-black text-zinc-600 group-hover:text-zinc-300 transition-colors">
                                {tierNum}
                            </span>
                                    </div>

                                    {/* 노드 그리드 - [수정] 모바일 행 간격 핵심: gap-y-4 -> gap-y-1로 단축 */}
                                    <div className="flex-1 flex flex-wrap sm:flex-nowrap justify-center items-start sm:items-center gap-x-2 gap-y-1 sm:gap-x-1 px-1 sm:px-6">
                                        {tierNodes.map((node) => {
                                            const activeEffect = data?.Effects?.find((eff: any) =>
                                                eff.Name?.includes(activeTab) &&
                                                eff.Description?.replace(/\s+/g, '').includes(node.name.replace(/\s+/g, ''))
                                            );
                                            const isActive = !!activeEffect;
                                            const currentLv = isActive ? (activeEffect.Description?.match(/Lv\.(\d+)/)?.[1] || node.max) : 0;
                                            const progressWidth = (Number(currentLv) / Number(node.max)) * 100;

                                            return (
                                                /* [수정] 개별 노드 하단 마진 제거 (mb-0) */
                                                <div key={node.name} className="flex flex-col items-center w-[72px] sm:w-24 shrink-0 mb-0 sm:mb-4">
                                                    <motion.div
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`relative rounded-xl border-[1.5px] transition-all duration-300
                                            ${isActive ? `cursor-pointer ${theme.border} ${theme.shadow} bg-zinc-900 shadow-xl` : 'grayscale opacity-20 border-white/5 bg-zinc-950 scale-90'}`}
                                                        style={{
                                                            width: typeof window !== 'undefined' && window.innerWidth < 640 ? '42px' : '48px',
                                                            height: typeof window !== 'undefined' && window.innerWidth < 640 ? '42px' : '48px'
                                                        }}
                                                        onClick={() => isActive && setSelectedEffect(activeEffect)}
                                                        onMouseEnter={(e) => isActive && !('ontouchstart' in window) && setHoverInfo({ effect: activeEffect, rect: e.currentTarget.getBoundingClientRect() })}
                                                        onMouseLeave={() => setHoverInfo(null)}
                                                    >
                                                        <img src={getIconUrl(node.iconId, activeTab)} className="w-full h-full p-1.5 object-contain relative z-10" />
                                                        {isActive && <div className={`absolute inset-0 blur-md opacity-30 ${theme.bg}`} />}
                                                    </motion.div>

                                                    {/* 텍스트 영역: 간격 밀착 */}
                                                    <div className="mt-0.5 sm:mt-2 text-center w-full px-0.5">
                                                        <p className={`text-[10px] sm:text-[12px] font-bold leading-[1.1] sm:leading-tight line-clamp-2 min-h-0 mb-0 sm:mb-1 ${isActive ? 'text-zinc-100' : 'text-zinc-800'}`}>
                                                            {node.name}
                                                        </p>

                                                        {isActive && (
                                                            <div className="mt-0 sm:mt-1 flex flex-col items-center gap-0">
                                                                <div className="flex items-baseline gap-0.5 text-[9px] sm:text-[11px] font-black leading-none scale-90 sm:scale-100">
                                                                    <span className={theme.color}>Lv{currentLv}</span>
                                                                    <span className="text-zinc-700">/</span>
                                                                    <span className="text-zinc-700">{node.max}</span>
                                                                </div>
                                                                <div className="w-8 sm:w-10 h-[2px] sm:h-[3px] mt-[1px] sm:mt-1 bg-zinc-800 rounded-full overflow-hidden">
                                                                    <div className={`h-full ${theme.bar}`} style={{ width: `${progressWidth}%` }} />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            <ArkPassiveModal
                activeTab={activeTab}
                hoverInfo={hoverInfo}
                selectedEffect={selectedEffect}
                setSelectedEffect={setSelectedEffect}
                renderTitleWithTier={renderTitleWithTier}
                safeJsonParse={safeJsonParse}
                cleanText={cleanText}
            />
        </div>
    );
};