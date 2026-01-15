import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Server, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 1. 데이터 타입 정의
interface CharacterData {
    ServerName: string;
    CharacterName: string;
    CharacterLevel: number;
    CharacterClassName: string;
    ItemAvgLevel: string;
}

interface CharacterDetailTabProps {
    character: {
        CharacterName: string;
        [key: string]: any;
    };
}

export const CharacterDetailTab = ({ character }: CharacterDetailTabProps) => {
    const navigate = useNavigate();
    const [data, setData] = useState<CharacterData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 2. Siblings 데이터 호출
    useEffect(() => {
        const fetchSiblings = async () => {
            if (!character?.CharacterName) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // 백엔드 @RequestParam String query 에 맞춰 query= 사용
                const response = await fetch(`/siblings?name=${encodeURIComponent(character.CharacterName)}`);

                if (!response.ok) {
                    throw new Error(`서버 응답 에러: ${response.status}`);
                }

                const json = await response.json();
                setData(json || []);
            } catch (error: any) {
                console.error("로딩 실패:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSiblings();
    }, [character?.CharacterName]);

    // 3. 캐릭터 클릭 시 이동 로직
    const handleCharacterClick = (e: React.MouseEvent, targetName: string) => {
        e.preventDefault();
        e.stopPropagation(); // 부모 컴포넌트의 클릭 이벤트 전파 방지

        if (targetName === character.CharacterName) return;

        // App.tsx의 Route path="/profilePage" 와 일치시킴
        // window.location.href 대신 navigate를 사용하여 SPA 흐름 유지
        navigate(`/profilePage?name=${encodeURIComponent(targetName)}`);
    };

    // 4. 서버별 그룹화 및 레벨순 정렬
    const groupedByServer = useMemo(() => {
        if (!data || data.length === 0) return {};

        const groups = data.reduce((acc: Record<string, CharacterData[]>, char: CharacterData) => {
            const server = char.ServerName || "기타";
            if (!acc[server]) acc[server] = [];
            acc[server].push(char);
            return acc;
        }, {});

        // 각 서버 내에서 아이템 레벨 내림차순 정렬
        Object.keys(groups).forEach(server => {
            groups[server].sort((a, b) => {
                const levelA = parseFloat(a.ItemAvgLevel.replace(/,/g, ''));
                const levelB = parseFloat(b.ItemAvgLevel.replace(/,/g, ''));
                return levelB - levelA;
            });
        });
        return groups;
    }, [data]);

    // 로딩 화면
    if (loading) return (
        <div className="w-full py-32 flex flex-col items-center justify-center bg-[#0f0f0f] rounded-xl border border-white/5">
            <Loader2 className="animate-spin text-indigo-500 w-10 h-10 mb-4" />
            <p className="text-zinc-500 font-medium">원정대 정보를 동기화 중...</p>
        </div>
    );

    // 에러 화면
    if (error) return (
        <div className="w-full py-32 flex flex-col items-center justify-center bg-[#0f0f0f] rounded-xl border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-500/50 mb-4" />
            <p className="text-zinc-300 font-bold">원정대 정보를 불러오지 못했습니다.</p>
            <p className="text-zinc-600 text-sm mt-2">{error}</p>
        </div>
    );

    return (
        <div className="w-full bg-[#0f0f0f] text-zinc-300 p-2 sm:p-6 space-y-10 font-sans">
            {Object.entries(groupedByServer).map(([serverName, characters]) => (
                <div key={serverName} className="space-y-5">
                    {/* 서버 구분선 헤더 */}
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-500/10 rounded-md">
                            <Server className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-black text-zinc-100 tracking-tight">{serverName}</h3>
                        <span className="text-xs font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded border border-white/5">
                            {characters.length}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent shadow-sm" />
                    </div>

                    {/* 캐릭터 리스트 그리드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {characters.map((item, idx) => {
                                const isCurrent = item.CharacterName === character.CharacterName;
                                return (
                                    <motion.div
                                        key={item.CharacterName}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        whileHover={!isCurrent ? { y: -5, scale: 1.02 } : {}}
                                        onClick={(e) => handleCharacterClick(e, item.CharacterName)}
                                        className={`relative p-5 rounded-2xl border transition-all duration-300 group
                                            ${isCurrent
                                            ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)] cursor-default'
                                            : 'bg-[#161618] border-white/5 hover:border-indigo-500/40 hover:bg-[#1c1c1e] cursor-pointer shadow-xl'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className={`font-black text-[15px] mb-0.5 tracking-tight transition-colors 
                                                    ${isCurrent ? 'text-indigo-400' : 'text-zinc-100 group-hover:text-indigo-300'}`}>
                                                    {item.CharacterName}
                                                </p>
                                                <p className="text-xs font-bold text-zinc-500 group-hover:text-zinc-400">
                                                    {item.CharacterClassName}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-black/40 text-zinc-500 border border-white/5">
                                                Lv.{item.CharacterLevel}
                                            </span>
                                        </div>

                                        <div className="mt-6 flex items-end justify-between">
                                            <div>
                                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Item Level</p>
                                                <p className={`text-xl font-black tracking-tighter transition-colors 
                                                    ${isCurrent ? 'text-indigo-300' : 'text-zinc-300 group-hover:text-white'}`}>
                                                    {item.ItemAvgLevel}
                                                </p>
                                            </div>
                                            {!isCurrent && (
                                                <div className="p-2 rounded-full bg-zinc-800/50 text-zinc-600 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>

                                        {isCurrent && (
                                            <div className="absolute -top-2.5 right-4 bg-indigo-500 text-[10px] text-white font-black px-2.5 py-1 rounded-full shadow-lg border-2 border-[#0f0f0f]">
                                                CURRENT
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            ))}
        </div>
    );
};