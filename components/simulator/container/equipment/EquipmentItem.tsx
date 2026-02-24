import React, { useState, useEffect } from 'react';

// --- 1. 품질 수치에 따른 색상 반환 함수 ---
const getQualityColor = (q: number) => {
    if (q === 100) return "text-[#FF8000] border-[#FF8000]";
    if (q >= 90) return "text-[#CE43FB] border-[#CE43FB]";
    if (q >= 70) return "text-[#00B0FA] border-[#00B0FA]";
    if (q >= 30) return "text-[#00D100] border-[#00D100]";
    return "text-[#FF4040] border-[#FF4040]";
};

// --- 2. 등급별 스타일 정의 ---
const gradeStyles: Record<string, any> = {
    일반: { bg: "from-zinc-800 to-zinc-950", border: "border-white/10", text: "text-zinc-400" },
    고급: { bg: "from-[#1a2e1a] to-[#0a0f0a]", border: "border-[#48c948]/30", text: "text-[#4edb4e]" },
    희귀: { bg: "from-[#1a2a3e] to-[#0a0d12]", border: "border-[#00b0fa]/30", text: "text-[#33c2ff]" },
    영웅: { bg: "from-[#2e1a3e] to-[#120a1a]", border: "border-[#ce43fb]/30", text: "text-[#d966ff]" },
    전설: { bg: "from-[#41321a] to-[#1a120a]", border: "border-[#f99200]/40", text: "text-[#ffaa33]" },
    유물: { bg: "from-[#351a0a] to-[#0a0a0a]", border: "border-[#fa5d00]/50", text: "text-[#ff7526]" },
    고대: { bg: "from-[#3d3325] to-[#0f0f10]", border: "border-[#e9d2a6]/40", text: "text-[#e9d2a6]" },
    에스더: { bg: "from-[#0d2e2e] to-[#050505]", border: "border-[#2edbd3]/60", text: "text-[#45f3ec]" },
};

// --- 3. Props 타입 정의 (TypeScript 권장) ---
interface EquipmentItemProps {
    item: any;
    i: number;
    theme: any;
    tooltip: any;
    quality: number;
    reinforceLevel: string;
    advancedReinforce: string;
    itemName: string;
    REINFORCE_OPTIONS: any[];
    setHoveredIndex: (i: number | null) => void;
    setHoveredData: (data: any | null) => void;
    onUpdate: (name: string, data: any) => void;
}

export const EquipmentItem = ({
                                  item, i, theme, tooltip, quality, reinforceLevel,
                                  advancedReinforce, itemName, REINFORCE_OPTIONS,
                                  setHoveredIndex, setHoveredData, onUpdate
                              }: EquipmentItemProps) => {

    const [localQuality, setLocalQuality] = useState(quality);
    const [localAdv, setLocalAdv] = useState(advancedReinforce);
    const [selectedOption, setSelectedOption] = useState(() => {
        const level = reinforceLevel.replace("+", "");
        return (
            REINFORCE_OPTIONS.find((opt: any) => String(opt.value) === level) ||
            REINFORCE_OPTIONS[0]
        );
    });

    // 부모 상태 업데이트 (디바운싱 없이 즉시 반영)
    useEffect(() => {
        if (!onUpdate) return;
        onUpdate(itemName, {
            quality: Number(localQuality),
            level: Number(selectedOption.value),
            tier: Number(selectedOption.tier),
            advancedReinforce: Number(localAdv)
        });
    }, [localQuality, localAdv, selectedOption, itemName]);

// 외부 Props 변경 시 로컬 상태 동기화 (검색 결과 등이 바뀔 때만 대응)
    useEffect(() => {
        const level = reinforceLevel.replace("+", "");
        const found = REINFORCE_OPTIONS.find((opt: any) => String(opt.value) === level);

        if (found) {
            // 현재 로컬 상태와 들어온 props가 다를 때만 업데이트 (불필요한 덮어쓰기 방지)
            if (Number(localQuality) !== Number(quality)) setLocalQuality(quality);
            if (Number(localAdv) !== Number(advancedReinforce)) setLocalAdv(advancedReinforce);
            if (selectedOption.value !== found.value || selectedOption.tier !== found.tier) {
                setSelectedOption(found);
            }
        }
        // 의존성 배열에서 REINFORCE_OPTIONS 등 매번 새로 생성되는 객체는 제외하거나 주의해야 합니다.
    }, [quality, reinforceLevel, advancedReinforce]);
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") (e.currentTarget as HTMLElement).blur();
    };

    return (
        <div
            onMouseEnter={() => { setHoveredIndex(i); setHoveredData(tooltip); }}
            onMouseLeave={() => { setHoveredIndex(null); setHoveredData(null); }}
            className="relative group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors h-[68px] cursor-help"
        >
            {/* 아이콘 및 품질 입력 */}
            <div className="relative shrink-0 pointer-events-auto">
                <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border}`}>
                    <img src={item.Icon} className="w-11 h-11 rounded-md object-cover" alt={itemName} />
                </div>
                <input
                    type="number"
                    min="0" max="100"
                    value={localQuality}
                    onChange={(e) => setLocalQuality(Number(e.target.value))}
                    onKeyDown={handleKeyDown}
                    className={`absolute -bottom-1 -right-1 w-7 px-0.5 rounded-md text-[10px] font-black border border-zinc-700 bg-zinc-900 text-center focus:outline-none focus:ring-1 focus:ring-yellow-500 ${getQualityColor(Number(localQuality))} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors`}
                />
            </div>

            {/* 정보 및 선택 영역 */}
            <div className="flex-1 min-w-0 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <h3 className={`font-bold text-[12px] truncate mb-1 ${theme.text}`}>{itemName}</h3>
                <div className="flex items-center gap-2">
                    <select
                        className="bg-zinc-800 text-white/70 text-[10px] px-2 py-0.5 rounded border border-zinc-700 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        value={`${selectedOption.tier}-${selectedOption.value}`}
                        onChange={(e) => {
                            const [tier, val] = e.target.value.split("-");
                            const found = REINFORCE_OPTIONS.find((opt: any) => opt.tier === Number(tier) && opt.value === Number(val));
                            if (found) setSelectedOption(found);
                        }}
                    >
                        {REINFORCE_OPTIONS.map((opt: any) => (
                            <option key={`${opt.tier}-${opt.value}`} value={`${opt.tier}-${opt.value}`}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-1 bg-zinc-800 px-2 py-0.5 rounded border border-sky-700 focus-within:border-sky-500 transition-colors">
                        <span className="text-sky-400 text-[10px] font-bold">상재</span>
                        <input
                            type="number"
                            min="0" max="20"
                            value={localAdv}
                            onChange={(e) => setLocalAdv(e.target.value)}
                            onKeyDown={handleKeyDown}
                            /* 아래 className에 스핀 버튼 제거 스타일 추가 */
                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-5 bg-transparent text-sky-400 text-[10px] font-bold focus:outline-none text-center"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};