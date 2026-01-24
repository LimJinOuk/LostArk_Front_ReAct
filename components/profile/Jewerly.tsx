import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import JewelryTooltip from '@/components/profile/Tooltip/JewelryTooltip.tsx';
import { Loader2 } from 'lucide-react';

const GemSlot = ({ gem, index, hoverIdx, hoverData, setHoverIdx, setHoverData, isCenter = false }: any) => {
    const [coords, setCoords] = useState({ top: 0, left: 0, isBottom: false });
    const slotRef = useRef<HTMLDivElement>(null);
    const sizeClasses = isCenter ? "w-14 h-14" : "w-12 h-12";

    const updatePosition = () => {
        if (slotRef.current) {
            const rect = slotRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // 툴팁의 실제 높이를 알 수 없으므로 여유를 둡니다.
            // 보통 보석 툴팁은 300~400px 사이입니다.
            const estimatedHeight = 300;

            let targetTop = rect.top - 1;
            let flipped = false;

            // 하단 잘림 방지
            if (targetTop + estimatedHeight > windowHeight) {
                // 하단 공간이 부족하면 아래에서 위로 쌓이게 위치 조정
                // 툴팁의 하단 끝을 보석 아이콘의 하단 라인에 맞춥니다.
                targetTop = rect.bottom - estimatedHeight + 20;
                flipped = true;
            }

            // 상단 잘림 방지 (너무 위로 올라갔을 때)
            if (targetTop < 10) targetTop = 10;

            setCoords({
                top: targetTop,
                left: rect.right + 12,
                isBottom: flipped
            });
        }
    };

    useEffect(() => {
        if (hoverIdx === index) {
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [hoverIdx, index]);

    if (!gem) return <div className={`${sizeClasses} rounded-full bg-white/5 opacity-10 border border-zinc-800`} />;

    // --- [에러 해결 구간: 변수 정의 로직 복구] ---
    let skillIcon = gem.Icon;
    let gradeColor = "#1f2937";

    try {
        if (gem.Tooltip) {
            const tooltip = typeof gem.Tooltip === 'string' ? JSON.parse(gem.Tooltip) : gem.Tooltip;
            skillIcon = tooltip.Element_001?.value?.slotData?.iconPath || gem.Icon;
            const gradeName = tooltip.Element_001?.value?.leftStr0 || gem.Grade || "";

            if (gradeName.includes("고대")) gradeColor = "#2a4d4f";
            else if (gradeName.includes("유물")) gradeColor = "#4d2b14";
            else if (gradeName.includes("전설")) gradeColor = "#45381a";
        }
    } catch (e) {
        skillIcon = gem.Icon;
    }
    // ------------------------------------------

    const handleMouseEnter = () => {
        updatePosition();
        setHoverIdx(index);
        setHoverData(gem);
    };

    return (
        <div
            ref={slotRef}
            className="relative group flex flex-col items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => { setHoverIdx(null); setHoverData(null); }}
        >
            <div className="flex flex-col items-center cursor-help">
                <div
                    className={`${sizeClasses} rounded-full transition-all duration-300 group-hover:scale-110 flex items-center justify-center overflow-hidden border border-zinc-700/50 shadow-lg`}
                    style={{ background: `radial-gradient(circle at center, ${gradeColor} 0%, #07090c 100%)` }}
                >
                    <img src={skillIcon} alt="" className="w-full h-full object-cover scale-110" />
                </div>
                <span className="mt-1 text-zinc-500 text-[10px] font-bold group-hover:text-zinc-300">
                    Lv.{gem.Level}
                </span>
            </div>

            {hoverIdx === index && hoverData && createPortal(
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        width: 'max-content'
                    }}
                >
                    <div className={`animate-in fade-in ${coords.isBottom ? 'slide-in-from-bottom-2' : 'zoom-in-95'} duration-150 pointer-events-auto`}>
                        <JewelryTooltip gemData={hoverData} />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export const Jewely = ({ character }: { character: any }) => {
    const [jewlryHoverIdx, setJewlryHoverIdx] = useState<any>(null);
    const [jewlryHoverData, setJewlryHoverData] = useState<any>(null);
    const [gems, setGems] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!character?.CharacterName) return;
        setLoading(true);
        fetch(`/gems?name=${encodeURIComponent(character.CharacterName)}`)
            .then(res => res.json())
            .then(data => setGems(data))
            .catch(err => console.error('데이터 로딩 실패:', err))
            .finally(() => setLoading(false));
    }, [character?.CharacterName]);

    if (loading) {
        return (
            <div className="w-full h-48 flex items-center justify-center">
                <Loader2 className="animate-spin text-zinc-500" size={24} />
            </div>
        );
    }

    return (
        <section className="w-full flex flex-col items-center select-none overflow-visible">
            {/* 상단 효과 배지: py-0.5, mb-1로 세로 여백 최소화 */}
            <div className="flex items-center gap-1.5 px-3 py-0.5 mb-1 mt-1 rounded-full from-zinc-900 via-zinc-800/80 to-zinc-900 ">
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-2 h-2 bg-sky-400/30 rounded-full blur-[3px] animate-pulse"></div>
                    <div className="w-1 h-1 bg-sky-300 rounded-full shadow-[0_0_5px_#38bdf8]"></div>
                </div>
                <span className="text-[10px] sm:text-[11px] text-sky-100/70 font-medium tracking-tight leading-tight">
            {gems?.Effects?.Description?.replace(/<[^>]*>?/gm, '').trim() || "효과 없음"}
        </span>
            </div>

            {/* 메인 슬롯 영역: 높이를 강제로 제어하지 않고 콘텐츠에 밀착 */}
            <div className="relative w-full flex items-center justify-center overflow-visible">
                {/* 배경 광원: 범위를 좁혀 콤팩트하게 변경 */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-sky-900/20 blur-[40px] rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-sky-500/10 blur-[20px] rounded-full animate-pulse" />
                </div>

                {/* 보석 슬롯 레이아웃: gap-0.5(세로), gap-8(가로) 조정 */}
                <div className="relative z-10 flex flex-col items-center gap-0.5 transform scale-[0.85] sm:scale-95 transition-transform origin-top">
                    {/* 상단 라인 */}
                    <div className="flex items-center gap-9">
                        <div className="flex gap-3.5">
                            {[0, 1].map(idx => (
                                <GemSlot key={idx} gem={gems?.Gems?.[idx]} index={idx} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                            ))}
                        </div>
                        <div className="flex gap-3.5">
                            {[2, 3].map(idx => (
                                <GemSlot key={idx} gem={gems?.Gems?.[idx]} index={idx} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                            ))}
                        </div>
                    </div>

                    {/* 중앙 라인: py-0으로 여백 제거 */}
                    <div className="flex items-center justify-center gap-4 relative">
                        <GemSlot gem={gems?.Gems?.[4]} index={4} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                        <div className="relative">
                            <div className="absolute inset-0 bg-sky-400/15 blur-[15px] rounded-full scale-125 animate-pulse"></div>
                            <GemSlot gem={gems?.Gems?.[5]} index={5} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} isCenter={true} />
                        </div>
                        <GemSlot gem={gems?.Gems?.[6]} index={6} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                    </div>

                    {/* 하단 라인 */}
                    <div className="flex items-center gap-9">
                        <div className="flex gap-3.5">
                            {[7, 8].map(idx => (
                                <GemSlot key={idx} gem={gems?.Gems?.[idx]} index={idx} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                            ))}
                        </div>
                        <div className="flex gap-3.5">
                            {[9, 10].map(idx => (
                                <GemSlot key={idx} gem={gems?.Gems?.[idx]} index={idx} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};