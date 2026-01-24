import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Zap } from 'lucide-react';
import { ArkPassiveModal } from '@/components/profile/Tooltip/ArkPassiveTooltip.tsx';
import { MASTER_DATA } from '@/constants/ArkPassiveData/arkPassiveData.tsx';

// 탭의 순서를 정의하여 애니메이션 방향 결정
const TABS = ['진화', '깨달음', '도약'] as const;
type TabType = typeof TABS[number];

export const ArkPassiveTab = ({ character }: { character: any }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('깨달음');
    const [[page, direction], setPage] = useState([0, 0]); // 애니메이션 방향 관리
    const [selectedEffect, setSelectedEffect] = useState<any>(null);
    const [hoverInfo, setHoverInfo] = useState<{ effect: any; rect: DOMRect | null } | null>(null);

    // 탭 클릭 핸들러
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

    // 헬퍼 함수들은 유지
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

    if (loading) return <div className="py-24 flex flex-col items-center justify-center bg-[#0d0d0f] min-h-[500px]"><Loader2 className="animate-spin text-indigo-500 w-10 h-10 mb-4 opacity-50" />
        <span className="text-zinc-500 text-sm font-medium tracking-widest animate-pulse">ARCHIVE LOADING...</span></div>;

    return (
        <div className="w-full bg-[#0d0d0f] text-zinc-300 p-2 space-y-1 font-sans relative overflow-hidden rounded-2xl shadow-2xl border border-white/5">
            {/* 상단 앰비언트 라이트 (모션 포함) */}
            <motion.div
                animate={{ backgroundColor: activeTab === '진화' ? '#3b82f6' : activeTab === '깨달음' ? '#a855f7' : '#f59e0b' }}
                className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[300px] blur-[120px] opacity-[0.07] pointer-events-none transition-colors duration-1000"
            />

            {/* 헤더 부위: 탭 & 포인트 */}
            <div className="relative z-10 flex flex-col items-center gap-3">
                {/* 탭 네비게이션 */}
                <div className="inline-flex p-1.5 bg-black/40 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`relative px-8 py-2 rounded-lg text-xs font-bold transition-all duration-500 overflow-hidden
                                ${activeTab === tab ? theme.color : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {activeTab === tab && (
                                <motion.div layoutId="activeTabBg" className={`absolute inset-0 ${theme.bg} border-t border-white/10`} transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                            )}
                            <span className="relative z-10">{tab}</span>
                        </button>
                    ))}
                </div>

                {/* 포인트 보드 (AnimatePresence로 숫자 전환 모션) */}
                <div className="flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-3"
                        >
                            <div className="flex items-baseline gap-1.5">
                                <span className={`text-3xl font-black tracking-tighter ${theme.color} drop-shadow-2xl`}>
                                    {data?.Points?.find((p: any) => p.Name === activeTab)?.Value || 0}
                                </span>
                                <span className="text-2xl font-bold text-zinc-700">/</span>
                                <span className="text-2xl font-bold text-zinc-500">
                                    {activeTab === "진화" ? 140 : activeTab === "깨달음" ? 101 : 70}
                                </span>
                            </div>
                            <div className={`relative z-10 translate-y-[2px] flex items-center gap-2.5 px-3.5 py-1 rounded-lg relative overflow-hidden`}>
                                {/* translate-y-[-4px] 값을 조절하여 1px 단위로 세밀하게 이동 가능합니다 */}
                                <div className={`absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent via-white/5 to-white/10`} />
                                <span className={`relative z-10 text-[12px] font-black tracking-widest uppercase ${theme.color}`}>
                                    {data?.Points?.find((p: any) => p.Name === activeTab)?.Description || "Passive"}
                                </span>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* 메인 보드 (슬라이딩 애니메이션 적용) */}
            <div className="relative overflow-hidden min-h-[200px]">
                <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                        key={activeTab}
                        custom={direction}
                        initial={{ x: direction * 100 + '%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * -100 + '%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="w-full flex flex-col gap-2"
                    >
                        {[1, 2, 3, 4, 5].map((tierNum) => {
                            const tierNodes = currentMaster.filter(m => Number(m.tier) === tierNum);
                            if (tierNodes.length === 0) return null;
                            return (
                                <div key={tierNum} className="flex items-stretch w-full min-h-[120px] border-white/[0.02] last:border-0 group">
                                    {/* 티어 표시 */}
                                    <div className="flex flex-col items-center justify-center w-20 shrink-0 from-transparent to-white/[0.01]">
                                        <span className="text-2xl font-black text-zinc-500 group-hover:text-zinc-300 transition-colors">{tierNum}</span>
                                    </div>

                                    {/* 노드 그리드 */}
                                    <div className="flex-1 flex justify-center items-center gap-x-1 px-10">
                                        {tierNodes.map((node) => {
                                            const activeEffect = data?.Effects?.find((eff: any) =>
                                                eff.Name?.includes(activeTab) &&
                                                eff.Description?.replace(/\s+/g, '').includes(node.name.replace(/\s+/g, ''))
                                            );
                                            const isActive = !!activeEffect;
                                            const currentLv = isActive ? (activeEffect.Description?.match(/Lv\.(\d+)/)?.[1] || node.max) : 0;
                                            const progressWidth = (Number(currentLv) / Number(node.max)) * 100;

                                            return (
                                                <div key={node.name} className="flex flex-col items-center w-24 shrink-0">
                                                    <motion.div
                                                        whileHover={isActive ? { scale: 1.1, y: -5 } : {}}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`relative rounded-xl border-2 transition-all duration-500 
                                                            ${isActive ? `cursor-pointer ${theme.border} ${theme.shadow} bg-zinc-900 shadow-2xl` : 'grayscale opacity-20 border-white/5 bg-zinc-950 scale-90'}`}
                                                        style={{ width: '50px', height: '50px' }}
                                                        onClick={() => isActive && setSelectedEffect(activeEffect)}
                                                        onMouseEnter={(e) => isActive && setHoverInfo({ effect: activeEffect, rect: e.currentTarget.getBoundingClientRect() })}
                                                        onMouseLeave={() => setHoverInfo(null)}
                                                    >
                                                        <img src={getIconUrl(node.iconId, activeTab)} className="w-full h-full p-1.5 object-contain relative z-10" />

                                                        {/* 활성화 노드 글로우 */}
                                                        {isActive && <div className={`absolute inset-0 blur-lg opacity-40 ${theme.bg}`} />}
                                                    </motion.div>

                                                    <div className="mt-2 text-center w-full">
                                                        <p className={`text-[12px] font-bold leading-tight line-clamp-2 min-h-[20px] ${isActive ? 'text-zinc-100' : 'text-zinc-700'}`}>
                                                            {node.name}
                                                        </p>

                                                        {/* isActive가 true일 때만 레벨 숫자와 미니바를 렌더링 */}
                                                        {isActive && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 5 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className="flex flex-col items-center gap-0.5"
                                                            >
                                                                {/* 랭크, 레벨 디자인 */}
                                                                <div className="flex items-baseline gap-0.5">
                                                                    <span className={`text-[10px] font-black tracking-tighter ${theme.color}`}>
                                                                        LV.{currentLv}
                                                                    </span>
                                                                    <span className="text-[9px] font-bold text-zinc-700">/</span>
                                                                    <span className="text-[9px] font-bold text-zinc-700">{node.max}</span>
                                                                </div>

                                                                {/* 미니 프로그레스 바 */}
                                                                <div className="w-12 h-[5px] bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${progressWidth}%` }}
                                                                        className={`h-full ${theme.bar} rounded-full`}
                                                                    />
                                                                </div>
                                                            </motion.div>
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