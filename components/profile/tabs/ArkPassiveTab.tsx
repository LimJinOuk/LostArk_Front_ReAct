import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// API 응답 데이터 인터페이스
interface NodeData {
    id: string;
    category: '진화' | '깨달음' | '도약';
    name: string;
    level: number;
    maxLevel: number;
    points: string;
    row: number; // 1~4행
    col: number; // 1~6열
    type: 'orange' | 'cyan';
}

export const ArkPassiveTab = () => {
    const [activeTab, setActiveTab] = useState<'진화' | '깨달음' | '도약'>('진화');
    const [nodes, setNodes] = useState<NodeData[]>([]); // API 전체 데이터
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. API 호출 시뮬레이션
    useEffect(() => {
        const fetchNodes = async () => {
            setIsLoading(true);
            try {
                // 실제 환경에서는 fetch('/api/ark-passive') 등을 사용하세요.
                // 아래는 사진 레이아웃을 반영한 예시 데이터입니다.
                const mockData: NodeData[] = [
                    { id: 'v1', category: '진화', name: '치명', level: 10, maxLevel: 30, points: '1P', row: 1, col: 1, type: 'orange' },
                    { id: 'v2', category: '진화', name: '특화', level: 30, maxLevel: 30, points: '1P', row: 1, col: 2, type: 'orange' },
                    { id: 'v3', category: '진화', name: '한계 돌파', level: 3, maxLevel: 3, points: '10P', row: 2, col: 4, type: 'orange' },
                    { id: 'v4', category: '진화', name: '일격', level: 2, maxLevel: 2, points: '10P', row: 3, col: 3, type: 'cyan' },
                    { id: 'v5', category: '진화', name: '입식 타격가', level: 2, maxLevel: 2, points: '15P', row: 4, col: 4, type: 'orange' },
                    // 깨달음 탭 예시
                    { id: 'e1', category: '깨달음', name: '버스트 강화', level: 1, maxLevel: 1, points: '24P', row: 1, col: 4, type: 'orange' },
                    { id: 'e2', category: '깨달음', name: '오브 압축', level: 3, maxLevel: 3, points: '8P', row: 2, col: 4, type: 'orange' },
                ];
                setNodes(mockData);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNodes();
    }, []);

    // 2. 현재 탭에 해당하는 노드만 필터링
    const currentNodes = nodes.filter(n => n.category === activeTab);
    const selectedNode = nodes.find(n => n.id === selectedId);

    // 3. 레벨 변경 API 호출 (Optimistic Update)
    const updateLevel = async (delta: number) => {
        if (!selectedId) return;

        // 로컬 상태 먼저 변경 (즉각적인 피드백)
        setNodes(prev => prev.map(n => n.id === selectedId
            ? { ...n, level: Math.max(0, Math.min(n.maxLevel, n.level + delta)) }
            : n
        ));

        // 여기서 실제 API PUT/PATCH 요청을 보내세요.
        // await api.updateNodeLevel(selectedId, newLevel);
    };

    if (isLoading) return <div className="text-zinc-500 font-black p-20 text-center">데이터 로딩 중...</div>;

    return (
        <div className="relative bg-[#0a0a0a] p-10 rounded-[3rem] border border-zinc-900 min-h-[850px] w-full select-none">

            {/* 상단 탭 내비게이션 */}
            <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-900 w-fit mb-20">
                {['진화', '깨달음', '도약'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-10 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="relative pl-20">
                {/* 수직 단계 숫자 (1-4행 일직선 정렬) */}
                <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-zinc-800 flex flex-col justify-between py-[40px]">
                    {[1, 2, 3, 4].map((num) => (
                        <div key={num} className="relative -left-4 w-8 h-8 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-[10px] font-black text-zinc-600 z-10">
                            {num}
                        </div>
                    ))}
                </div>

                {/* 4행 6열 그리드 */}
                <div className="grid grid-rows-4 grid-cols-6 gap-y-[120px] gap-x-6">
                    {Array.from({ length: 24 }).map((_, i) => {
                        const row = Math.floor(i / 6) + 1;
                        const col = (i % 6) + 1;
                        const node = currentNodes.find(n => n.row === row && n.col === col);

                        return (
                            <div key={i} className="flex justify-center items-center h-20">
                                {node ? (
                                    <div onClick={() => setSelectedId(node.id)} className="group cursor-pointer flex flex-col items-center gap-3 transition-all active:scale-95">
                                        <div className="relative">
                                            <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300
                        ${node.level > 0
                                                ? (node.type === 'cyan' ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.4)]' : 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.4)]')
                                                : 'border-zinc-800 bg-zinc-900 opacity-30 group-hover:opacity-100'}`}>
                                                <span className={`text-2xl font-light ${node.level > 0 ? (node.type === 'cyan' ? 'text-cyan-300' : 'text-orange-300') : 'text-zinc-700'}`}>+</span>
                                                <div className="absolute -top-3 px-1.5 py-0.5 bg-black border border-white/20 rounded text-[9px] font-black text-zinc-400">{node.points}</div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-zinc-500 italic uppercase">Lv. {node.level} / {node.maxLevel}</p>
                                            <p className={`text-[12px] font-black tracking-tighter ${node.level > 0 ? 'text-zinc-100' : 'text-zinc-600'}`}>{node.name}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 opacity-0" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 조절 모달 */}
            <AnimatePresence>
                {selectedId && selectedNode && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedId(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-[320px] bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl">
                            <div className="flex flex-col items-center gap-8">
                                <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center ${selectedNode.type === 'cyan' ? 'border-cyan-400 text-cyan-400' : 'border-orange-500 text-orange-500'}`}>
                                    <span className="text-4xl font-light">+</span>
                                </div>
                                <div className="text-center">
                                    <h4 className="text-xl font-black text-white">{selectedNode.name}</h4>
                                    <p className="text-[10px] text-zinc-500 font-bold italic mt-1">API DATA SYNC</p>
                                </div>
                                <div className="flex items-center gap-6 w-full">
                                    <button onClick={() => updateLevel(-1)} className="flex-1 h-14 bg-zinc-800 rounded-2xl text-white text-2xl active:scale-90">-</button>
                                    <span className="text-2xl font-black text-white w-8 text-center">{selectedNode.level}</span>
                                    <button onClick={() => updateLevel(1)} className="flex-1 h-14 bg-zinc-800 rounded-2xl text-white text-2xl active:scale-90">+</button>
                                </div>
                                <button onClick={() => setSelectedId(null)} className="w-full py-4 bg-zinc-100 text-black rounded-2xl font-black text-xs">확인</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};