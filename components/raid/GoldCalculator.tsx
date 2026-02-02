import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Coins, Loader2, LayoutGrid, Check, Plus, Zap,
    RotateCcw, X, ChevronRight, BarChart3, Sword,
    Shield, Sparkles, MinusCircle, ChevronDown
} from 'lucide-react';

// 카테고리별 아이콘 매핑
const categoryIcons: Record<string, React.ReactNode> = {
    '군단장 레이드': <Sword size={18} />,
    '어비스 던전': <Shield size={18} />,
    '카제로스 레이드': <Sparkles size={18} />,
    '기타': <LayoutGrid size={18} />,
};

const GoldCalculator = () => {
    const [raids, setRaids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState<string>('');
    const [selectedRaids, setSelectedRaids] = useState<any[]>([]);

    useEffect(() => {
        fetch('/goldCalculator')
            .then(res => res.json())
            .then(data => {
                setRaids(data);
                if (data.length > 0) setActiveType(data[0].type);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const raidTypes = Array.from(new Set(raids.map(r => r.type)));

    const handleDiffChange = (title: string, diff: string) => {
        setSelectedRaids(prev => {
            const exists = prev.find(r => r.title === title);
            if (exists) {
                if (exists.diff === diff) return prev.filter(r => r.title !== title);
                return prev.map(r => r.title === title ? { ...r, diff, selectedGates: [], extraGates: [] } : r);
            }
            return [...prev, { title, diff, selectedGates: [], extraGates: [] }];
        });
    };

    const toggleGateSequential = (title: string, targetGate: string) => {
        setSelectedRaids(prev => prev.map(r => {
            if (r.title !== title) return r;
            const raidInfo = raids.find(rd => rd.title === title);
            if (!raidInfo) return r;
            const allGates = raidInfo.difficulty.filter((d: any) => d.difficulty === r.diff).map((d: any) => d.gate);
            const targetIndex = allGates.indexOf(targetGate);
            const isAlreadySelected = r.selectedGates.includes(targetGate);
            const newSelected = isAlreadySelected ? allGates.slice(0, targetIndex) : allGates.slice(0, targetIndex + 1);
            return { ...r, selectedGates: newSelected, extraGates: r.extraGates.filter((eg: any) => newSelected.includes(eg)) };
        }));
    };

    const toggleExtra = (title: string, gate: string) => {
        setSelectedRaids(prev => prev.map(r => {
            if (r.title !== title) return r;
            return { ...r, extraGates: r.extraGates.includes(gate) ? r.extraGates.filter((g: any) => g !== gate) : [...r.extraGates, gate] };
        }));
    };

    const calculateTotalGold = () => {
        return selectedRaids.reduce((total, selected) => {
            const raid = raids.find(r => r.title === selected.title);
            if (!raid) return total;
            return total + selected.selectedGates.reduce((gateSum: number, gateName: string) => {
                const gateData = raid.difficulty.find((d: any) => d.difficulty === selected.diff && d.gate === gateName);
                if (!gateData) return gateSum;
                const isExtra = selected.extraGates.includes(gateName);
                return gateSum + (isExtra ? gateData.gold - gateData.extraRewardCost : gateData.gold);
            }, 0);
        }, 0);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-black text-indigo-500"><Loader2 className="animate-spin" /></div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-2 md:px-8 md:py-4 space-y-2 bg-slate-50 dark:bg-zinc-950 min-h-screen transition-colors duration-300">

            {/* [상단] 대형 폰트 헤더 대시보드 */}
            <header className="mb-4 relative overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
                {/* 배경 장식 레이어 (Glassmorphism Effects) */}
                <div className="absolute top-0 left-0 w-full h-full -z-0">
                    {/* 우측 하단 큰 보라색 빛 */}
                    <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px]" />
                    {/* 좌측 상단 은은한 푸른 빛 */}
                    <div className="absolute -left-10 -top-10 w-48 h-48 bg-blue-400/15 dark:bg-blue-600/7 rounded-full blur-[80px]" />
                    {/* 중앙 미세한 패턴 (선택 사항) */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        {/* 상단 라벨 */}
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <p className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                                Weekly Estimated Gold
                            </p>
                        </div>

                        {/* 메인 골드 수치 */}
                        <div className="flex items-baseline gap-2">
                            <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">
                                {calculateTotalGold().toLocaleString()}
                            </h1>
                            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-slate-400 to-slate-500 dark:from-zinc-500 dark:to-zinc-400">
                    G
                </span>
                        </div>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedRaids([])}
                            className="group relative flex items-center justify-center gap-2 px-6 py-3.5
                            bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-transparent
                            hover:from-white/60 hover:to-white/20 dark:hover:from-white/15 dark:hover:to-white/5
                            text-slate-900 dark:text-zinc-200 rounded-2xl text-sm font-bold
                            transition-all duration-300 active:scale-95
                            border border-white/50 dark:border-white/10 shadow-sm backdrop-blur-md"
                            >
                            {/* 호버 시 나타나는 내부 광택 효과 */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <RotateCcw
                            size={18}
                            className="relative z-10 opacity-70 group-hover:rotate-[-180deg] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-500 ease-in-out"
                        />

                        <span className="relative z-10 tracking-tight">전체 초기화</span>

                            {/* 버튼 하단 은은한 강조 선 */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                    </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-4">
                {/* [좌측] 카테고리 탭 (아이콘 추가) */}
                <aside className="w-full lg:w-64 shrink-0 space-y-6">
                    {/* 헤더 부분 - 미니멀한 타이포그래피 */}
                    <div className="px-4">
                        <h2 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 size={16} strokeWidth={2.5} className="text-indigo-500" />
                            Categories
                        </h2>
                    </div>

                    <div className="space-y-1.5 px-2">
                        {raidTypes.map((type) => {
                            const isActive = activeType === type;
                            const exampleRaid = raids.find(r => r.type === type);
                            const titleName = exampleRaid ? exampleRaid.title : '';

                            return (
                                <button
                                    key={type}
                                    onClick={() => setActiveType(type)}
                                    className={`w-full group relative flex flex-col items-start px-5 py-4 rounded-[1.25rem] transition-all duration-200 ${
                                        isActive
                                            ? 'bg-slate-100 dark:bg-zinc-800 shadow-sm'
                                            : 'bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                                    }`}
                                >
                                    {/* 활성 상태 인디케이터 (좌측 얇은 바) */}
                                    {isActive && (
                                        <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full" />
                                    )}

                                    <div className="flex items-center min-w-0 text-left py-1 gap-2">
                                        {/* 상단 타입: 작고 가볍게 보조 정보 역할 */}
                                        <span className={`text-[12px] font-semibold uppercase tracking-widest whitespace-nowrap transition-colors ${
                                            isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                                        }`}>
                                            {type}
                                        </span>

                                        {/* 구분선 (선택 사항: 애플 스타일의 정갈함을 더해줌) */}
                                        <span className="w-[1px] h-3 bg-slate-200 dark:bg-slate-700" />

                                        {/* 타이틀: 더 크고 선명하게 메인 정보 강조 */}
                                        <span className={`text-[14px] font-medium tracking-tight truncate transition-colors ${
                                            isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500'
                                        }`}>
                                            {titleName}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>
                <main className="flex-1 ">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                        {/* [중앙] 레이드 카드 (뱃지 UI 적용) */}
                        <div className="grid gap-6 min-h-[300px]">
                            {raids.filter(r => r.type === activeType).map((raid) => {
                                const selection = selectedRaids.find(s => s.title === raid.title);
                                const diffTypes = Array.from(new Set(raid.difficulty.map((d: any) => d.difficulty)));

                                return (
                                    <div
                                        key={raid.title}
                                        className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-800"
                                    >
                                        {/* 레이드 타이틀 섹션 */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                                                {raid.title}
                                            </h3>

                                            {/* 난이도 선택 (깔끔한 버튼 그룹) */}
                                            <div className="inline-flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                                                {diffTypes.map((diff: any) => (
                                                    <button
                                                        key={diff}
                                                        onClick={() => handleDiffChange(raid.title, diff)}
                                                        className={`px-3 py-2 rounded-lg text-[12px] font-bold transition-all ${
                                                            selection?.diff === diff
                                                                ? 'bg-white dark:bg-zinc-700 text-indigo-600 shadow-sm'
                                                                : 'text-slate-500 hover:text-slate-700'
                                                        }`}
                                                    >
                                                        {diff}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 관문 선택 리스트 */}
                                        <div className="space-y-2">
                                            {selection ? (
                                                raid.difficulty.filter((d: any) => d.difficulty === selection.diff).map((g: any, idx: number) => {
                                                    const isGateSelected = selection.selectedGates.includes(g.gate);
                                                    const isExtraSelected = selection.extraGates.includes(g.gate);

                                                    return (
                                                        <div
                                                            key={g.gate}
                                                            className={`flex items-center group rounded-2xl p-4 transition-colors ${
                                                                isGateSelected
                                                                    ? 'bg-indigo-50/50 dark:bg-indigo-500/5'
                                                                    : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                                                            }`}
                                                        >
                                                            {/* 체크박스 형태로 직관성 강화 */}
                                                            <button
                                                                onClick={() => toggleGateSequential(raid.title, g.gate)}
                                                                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                                                    isGateSelected
                                                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                                                        : 'border-slate-300 dark:border-zinc-700 bg-transparent'
                                                                }`}
                                                            >
                                                                {isGateSelected && <Check size={14} strokeWidth={4} />}
                                                            </button>

                                                            {/* 관문 정보 */}
                                                            <div
                                                                className="ml-4 flex-1 cursor-pointer"
                                                                onClick={() => toggleGateSequential(raid.title, g.gate)}
                                                            >
                                                                <div className="flex items-center gap-2">
                                            <span className={`font-bold ${isGateSelected ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                                {g.gate}
                                            </span>
                                                                    <span className="text-xs text-slate-400 font-medium">
                                                {g.gold.toLocaleString()} G
                                            </span>
                                                                </div>
                                                            </div>

                                                            {/* 더보기 버튼 (심플) */}
                                                            {isGateSelected && (
                                                                <button
                                                                    onClick={() => toggleExtra(raid.title, g.gate)}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                                        isExtraSelected
                                                                            ? 'bg-yellow-600 border-yellow-700 text-yellow-100'
                                                                            : 'border-none text-yellow-500 hover:bg-yellow-700'
                                                                    }`}
                                                                >
                                                                    더보기
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="mt-22 h-24 flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-zinc-800 rounded-2xl text-slate-300 font-bold text-sm">
                                                    난이도를 먼저 선택해 주세요
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* [우측] 요약창 (차감 내역 강조) */}
                        <aside className="sticky top-8">
                            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-zinc-800">
                                {/* 헤더 섹션 */}
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                        상세 요약
                                    </h3>
                                    {selectedRaids.length > 0 && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                            <Check size={12} strokeWidth={3} />
                                            <span className="text-[10px] font-black">{selectedRaids.length}</span>
                                        </div>
                                    )}
                                </div>

                                {/* 선택된 레이드 리스트 */}
                                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedRaids.length === 0 ? (
                                        <div className="text-center py-20">
                                            <p className="text-sm font-medium text-slate-300 dark:text-zinc-700 font-bold uppercase tracking-widest">Empty</p>
                                        </div>
                                    ) : (
                                        selectedRaids.map((sr) => {
                                            const raidData = raids.find(r => r.title === sr.title);
                                            let subTotalGold = 0;
                                            let subTotalDeduction = 0;

                                            sr.selectedGates.forEach((gn: string) => {
                                                const g = raidData?.difficulty.find((d: any) => d.difficulty === sr.diff && d.gate === gn);
                                                if (g) {
                                                    subTotalGold += g.gold;
                                                    if (sr.extraGates.includes(gn)) subTotalDeduction += g.extraRewardCost;
                                                }
                                            });

                                            return (
                                                <div key={sr.title} className="space-y-2 pb-5 border-b border-slate-50 dark:border-zinc-800 last:border-0">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[15px] font-bold text-slate-800 dark:text-zinc-100">{sr.title}</span>
                                                            <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 rounded font-black uppercase">{sr.diff}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-slate-700 dark:text-zinc-300">
                                    {(subTotalGold - subTotalDeduction).toLocaleString()} G
                                </span>
                                                    </div>

                                                    {/* 상세 계산식 표기 영역 */}
                                                    <div className="bg-slate-50/50 dark:bg-zinc-800/30 rounded-xl p-3 space-y-1.5">
                                                        <div className="flex justify-between text-[11px] font-medium text-slate-500">
                                                            <span>기본 획득 골드</span>
                                                            <span className="font-bold">+{subTotalGold.toLocaleString()} G</span>
                                                        </div>
                                                        {subTotalDeduction > 0 && (
                                                            <div className="flex justify-between text-[11px] font-medium text-red-500 dark:text-red-400">
                                                                <span>더보기 비용 차감</span>
                                                                <span className="font-bold">-{subTotalDeduction.toLocaleString()} G</span>
                                                            </div>
                                                        )}
                                                        <div className="h-px bg-slate-200/50 dark:bg-zinc-700/50 my-1" />
                                                        <p className="text-[10px] text-slate-400 truncate">
                                                            {sr.selectedGates.join(', ')} 선택
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* 하단 최종 합계 섹션 */}
                                {selectedRaids.length > 0 && (
                                    <div className="mt-6 pt-6 border-t-2 border-slate-100 dark:border-zinc-800">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">최종 합계</span>
                                            <div className="text-right">
                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                            {calculateTotalGold().toLocaleString()}
                        </span>
                                                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 ml-1">G</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedRaids([])}
                                            className="w-full py-3.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 dark:shadow-none"
                                        >
                                            <RotateCcw size={14} />
                                            전체 초기화
                                        </button>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default GoldCalculator;