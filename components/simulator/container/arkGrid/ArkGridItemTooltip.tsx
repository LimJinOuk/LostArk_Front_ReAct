import React from 'react';
import { motion } from 'framer-motion';

// 텍스트 하이라이트 함수
const renderHighlightedText = (text: string, isUnlocked: boolean) => {
    if (!isUnlocked) return <span className="text-zinc-600">{text}</span>;
    return text.split(/(\d+(?:\.\d+)?%?|'\w+')/).map((part, idx) => (
        /(\d+(?:\.\d+)?%?|'\w+')/.test(part) ?
            <span key={idx} className="text-[#48c948] font-bold">{part}</span> : part
    ));
};

interface TooltipProps {
    data: any;       // JSON 데이터
    icon?: string;   // 카테고리별 아이콘 URL
    point: number;   // 현재 설정된 포인트
    theme: any;      // 등급별 테마
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

const ArkGridItemTooltip: React.FC<TooltipProps> = ({ data, icon, point, theme, onMouseEnter, onMouseLeave }) => {
    if (!data) return null;


    const detailEntries = Object.entries(data.details || {})
        .map(([p, desc]) => ({ p: parseInt(p), desc: desc as string }))
        .sort((a, b) => a.p - b.p);

    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-[105%] top-0 z-[100] w-[300px] bg-[#1c1d21] border border-white/10 rounded-lg shadow-2xl overflow-hidden font-sans pointer-events-auto"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            {/* --- 수정된 헤더 섹션 --- */}
            <div className={`p-3 bg-gradient-to-br ${theme.bg} relative z-10 flex flex-col gap-2 border-b border-black/20`}>
                <div className="flex gap-3 items-center">
                    {/* 1. 왼쪽 아이콘 (고정 사이즈로 안정감 부여) */}
                    <div className={`p-0.5 rounded-md border border-white/20 shrink-0 bg-black/40 shadow-lg`}>
                        <img src={icon} className="w-10 h-10 rounded-md object-cover" alt="" />
                    </div>
                    {/* 2. 정보 컨테이너 (중앙과 우측 분할) */}
                    <div className="flex flex-1 items-center justify-between min-w-0">
                        {/* 텍스트 영역: 타이틀과 귀속 정보를 수직 정렬 */}
                        <div className="flex flex-col min-w-0">
                            <div className={`text-[15px] font-bold ${theme.text} truncate leading-tight`}>
                                {data.title} <span className="text-[11px] opacity-80">({data.grade})</span>
                            </div>

                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] text-white/40 font-medium whitespace-nowrap">거래 불가</span>
                                <span className="w-[1px] h-2.5 bg-white/10" />
                                <span className="text-[10px] text-[#5fd3f1] font-bold truncate">귀속됨</span>
                            </div>
                        </div>
                        {/* 3. 포인트 뱃지 스타일: 우측 수직 중앙에 배치하여 강조와 조화 동시 만족 */}
                        <div className="flex flex-col items-end shrink-0 ml-3">
                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter leading-none mb-1">포인트</span>
                            <div className="flex items-baseline gap-0.5">
                    <span className={`text-[18px] font-black leading-none ${theme.text} drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}>
                        {point}
                    </span>
                                <span className={`text-[16px] font-bold ${theme.text}`}>P</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 효과 상세 리스트 (기존 스타일 유지하되 배경 최적화) --- */}
            <div className={`p-4 flex flex-col gap-2  bg-gradient-to-br ${theme.bg}/10 border-b border-black/20 relative z-10`}>
                {detailEntries.map((item, idx) => {
                    const isUnlocked = point >= item.p;
                    return (
                        <div key={idx} className="flex gap-3 relative">
                            {/* 좌측 포인트 인디케이터 */}
                            <div className="flex flex-col items-center w-8 shrink-0">
                                <div className={`text-[12px] font-black mb-1.5 transition-colors duration-300 ${isUnlocked ? 'text-[#f18c2d]' : 'text-zinc-700'}`}>
                                    {item.p}P
                                </div>
                                {idx !== detailEntries.length - 1 && (
                                    <div className={`w-[1px] h-full rounded-full ${isUnlocked ? 'bg-gradient-to-b from-[#f18c2d] to-zinc-800' : 'bg-zinc-800'}`} />
                                )}
                            </div>

                            {/* 효과 설명 */}
                            <div className="flex-1 pb-1">
                                <p className={`text-[12.5px] leading-relaxed break-keep font-semibold transition-colors duration-300 ${isUnlocked ? 'text-zinc-100' : 'text-zinc-600'}`}>
                                    {renderHighlightedText(item.desc, isUnlocked)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 말풍선 화살표 */}
            <div className="absolute top-6 -left-1.5 w-3 h-3 bg-[#1c1d21] border-l border-b border-white/10 rotate-45"
                 style={{ background: theme.bg.includes('from') ? theme.bg.split(' ')[1] : '#1c1d21' }}
            />
        </motion.div>
    );
};

export default ArkGridItemTooltip;