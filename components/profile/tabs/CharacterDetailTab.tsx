import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CLASS_ICON_MAP, DEFAULT_ICON } from '@/constants/classIcons';

interface CharacterData {
    ServerName: string;
    CharacterName: string;
    CharacterLevel: number;
    CharacterClassName: string;
    ItemAvgLevel: string;
}

interface CharacterDetailTabProps {
    character?: {
        CharacterName?: string;
        [key: string]: any;
    };
}

const getGradeStyles = (levelStr: string, isCurrent: boolean) => {
    const level = parseFloat(levelStr.replace(/,/g, ''));

    if (level >= 1680) return {
        bg: 'from-[#3d3325] to-[#1a1a1c]',
        border: 'border-[#e9d2a6]/100',
        text: 'text-[#f5e4bc]',
        glow: isCurrent ? 'shadow-[0_0_20px_rgba(233,210,166,0.4)]' : 'shadow-[#e9d2a6]/10'
    };
    if (level >= 1600) return {
        bg: 'from-[#2a1a12] to-[#111111]',
        border: 'border-[#e9d2a6]/80',
        text: 'text-[#dcc8a0]',
        glow: isCurrent ? 'shadow-[0_0_20px_rgba(254,150,0,0.2)]' : ''
    };
    if (level >= 1580) return {
        bg: 'from-[#2a1a12] to-[#111111]',
        border: 'border-[#e9d2a6]/60',
        text: 'text-[#e67a39]',
        glow: isCurrent ? 'shadow-[0_0_20px_rgba(206,67,0,0.2)]' : ''
    };
    if (level >= 1490) return {
        bg: 'from-[#41321a] to-[#111111]',
        border: 'border-[#e9d2a6]/40',
        text: 'text-[#c2b378]',
        glow: isCurrent ? 'shadow-[0_0_20px_rgba(255,234,26,0.15)]' : ''
    };
    if (level >= 1415) return {
        bg: 'from-[#1a2a3e] to-[#111]',
        border: 'border-[#e9d2a6]/20',
        text: 'text-[#7890a8]',
        glow: isCurrent ? 'shadow-[0_0_20px_rgba(0,176,255,0.15)]' : ''
    };
    return {
        bg: 'from-[#222] to-[#111]',
        border: 'border-[#e9d2a6]/10',
        text: 'text-[#888888]',
        glow: ''
    };
};

export const CharacterDetailTab = ({ character }: CharacterDetailTabProps) => {
    const navigate = useNavigate();
    const [data, setData] = useState<CharacterData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSiblings = async () => {
            if (!character?.CharacterName) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(`/siblings?name=${encodeURIComponent(character.CharacterName)}`);
                if (!response.ok) throw new Error(`에러: ${response.status}`);
                const json = await response.json();
                setData(json || []);
            } catch (err: any) {
                setError("원정대 데이터를 불러오는 중 에러가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchSiblings();
    }, [character?.CharacterName]);

    const groupedByServer = useMemo(() => {
        if (!data || data.length === 0) return {};
        const groups = data.reduce((acc: Record<string, CharacterData[]>, char: CharacterData) => {
            const server = char.ServerName || "기타";
            if (!acc[server]) acc[server] = [];
            acc[server].push(char);
            return acc;
        }, {});

        Object.keys(groups).forEach(server => {
            groups[server].sort((a, b) => {
                const levelA = parseFloat(a.ItemAvgLevel.replace(/,/g, ''));
                const levelB = parseFloat(b.ItemAvgLevel.replace(/,/g, ''));
                return levelB - levelA;
            });
        });
        return groups;
    }, [data]);

    if (loading) return (
        <div className="w-full py-40 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-purple-500 w-8 h-8 mb-4" />
            <p className="text-zinc-500 text-xs tracking-widest uppercase">Syncing Expedition</p>
        </div>
    );

    if (error) return (
        <div className="w-full py-20 text-center text-zinc-500">{error}</div>
    );

    return (
        <div className="w-full bg-zinc-950 p-3 sm:p-6 space-y-6 sm:space-y-10">
            {Object.entries(groupedByServer).map(([serverName, characters]) => (
                <div key={serverName} className="space-y-4 sm:space-y-6">
                    {/* 서버 헤더 */}
                    <div className="flex items-center gap-3">
                        <h3 className="text-base sm:text-xl font-black text-white tracking-tighter uppercase">{serverName}</h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-zinc-500/40 to-transparent" />
                        <span className="text-[10px] text-zinc-600 font-bold uppercase sm:hidden">{characters.length}</span>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 sm:gap-2">
                        <AnimatePresence>
                            {characters.map((item) => {
                                const isCurrent = item.CharacterName === character?.CharacterName;
                                const grade = getGradeStyles(item.ItemAvgLevel, isCurrent);

                                return (
                                    <motion.div
                                        key={item.CharacterName}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        whileTap={!isCurrent ? { scale: 0.98 } : {}}
                                        onClick={() => !isCurrent && navigate(`/profilePage?name=${encodeURIComponent(item.CharacterName)}`)}
                                        className={`group relative overflow-hidden rounded-xl border transition-all duration-300
                                            ${isCurrent
                                            ? `bg-white/[0.07] ${grade.border} ${grade.glow} ring-1 ring-white/10`
                                            : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/20 cursor-pointer'}`}
                                    >
                                        <div className="relative z-10 flex items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-2">
                                            {/* [좌측] 캐릭터 정보 */}
                                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                                <div className="shrink-0">
                                                    <img
                                                        src={CLASS_ICON_MAP[item.CharacterClassName] || DEFAULT_ICON}
                                                        alt=""
                                                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border p-0.5 bg-black/40
                                                            ${isCurrent ? grade.border : 'border-white/10'}`}
                                                    />
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 min-w-0">
                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                        <h4 className={`text-[13px] sm:text-[14px] font-black truncate ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                                                            {item.CharacterName}
                                                        </h4>
                                                        {isCurrent && <Sparkles size={10} className="text-purple-400 shrink-0" />}
                                                    </div>
                                                    <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 whitespace-nowrap">
                                                        {item.CharacterClassName} <span className="hidden sm:inline text-zinc-800 px-1">|</span> <span className="sm:hidden text-zinc-800">/</span> Lv.{item.CharacterLevel}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* [우측] 레벨 */}
                                            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <div className={`p-0.5 sm:p-1 rounded-md ${grade.bg} ${grade.text} opacity-80 sm:opacity-100`}>
                                                        <Trophy size={10} className="sm:w-[12px] sm:h-[12px]" fill="currentColor" fillOpacity={0.2} />
                                                    </div>
                                                    <span className={`text-[14px] sm:text-[15px] font-black tracking-tighter ${grade.text}`}>
                                                        {item.ItemAvgLevel}
                                                    </span>
                                                </div>
                                                {!isCurrent && (
                                                    <ChevronRight size={14} className="sm:w-[16px] sm:h-[16px] text-zinc-700 group-hover:text-white transition-colors" />
                                                )}
                                            </div>
                                        </div>

                                        {/* 강조 선 */}
                                        {isCurrent && (
                                            <div className={`absolute right-0 top-0 bottom-0 w-[2px] sm:w-1 bg-gradient-to-b ${grade.bg}`} />
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