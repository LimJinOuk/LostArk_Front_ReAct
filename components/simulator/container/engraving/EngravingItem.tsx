import React, { useState, useEffect, useRef } from 'react';
import { Diamond, ChevronDown } from 'lucide-react';

const ALL_ENGRAVINGS = [
    "각성", "강령술", "강화 방패", "결투의 대가", "구슬동자", "굳은 의지", "급소 타격",
    "기습의 대가", "긴급구조", "달인의 저력", "돌격대장", "마나 효율 증가", "마나의 흐름",
    "바리케이드", "번개의 분노", "부러진 뼈", "분쇄의 주먹", "불굴", "선수필승", "속전속결",
    "슈퍼 차지", "승부사", "시선 집중", "실드관통", "아드레날린", "안정된 상태", "약자 무시",
    "에테르 포식자", "여신의 가호", "예리한 둔기", "원한", "위기 모면", "저주받은 인형",
    "전문의", "정기 흡수", "정밀 단도", "중갑 착용", "질량 증가", "최대 마나 증가",
    "추진력", "타격의 대가", "탈출의 명수", "폭발물 전문가"
];

const ALL_GRADES = ["유물", "전설", "영웅", "희귀", "고급", "일반"];

const getGradeColor = (grade: string) => {
    switch (grade) {
        case "유물": return "border-[#fa5d00] text-[#ff7526]";
        case "전설": return "border-[#f99200] text-[#ffaa33]";
        case "영웅": return "border-[#ce43fb] text-[#d966ff]";
        case "희귀": return "border-[#00b0fa] text-[#33c2ff]";
        case "고급": return "border-[#48c948] text-[#4edb4e]";
        default: return "border-zinc-600 text-zinc-400";
    }
};

interface EngravingItemProps {
    eng: any;
    index: number;
    isHovered: boolean;
    onInteraction: (index: number, name: string | null, desc: string) => void;
    onUpdate: (index: number, updatedEng: any) => void;
    getIconUrl: (name: string) => string;
    fallbackStoneIcon: string;
}

const EngravingItem: React.FC<EngravingItemProps> = ({
                                                         eng, index, isHovered, onInteraction, onUpdate, getIconUrl, fallbackStoneIcon,
                                                     }) => {
    const [engOptions, setEngOptions] = useState<any>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLDivElement>(null); // 선택된 아이템 참조용

    const n = typeof eng.Level === "number" ? eng.Level : 0;
    const m = typeof eng.AbilityStoneLevel === "number" ? eng.AbilityStoneLevel : 0;
    const grade = eng.Grade || "일반";
    const iconUrl = getIconUrl(eng.Name);
    const stoneIcon = eng.AbilityStoneIcon || fallbackStoneIcon;

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ✨ 드롭다운이 열릴 때 선택된 각인으로 스크롤 이동
    useEffect(() => {
        if (isDropdownOpen && selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({
                block: 'start',
                behavior: 'smooth'
            });
        }
    }, [isDropdownOpen]);

    const calculateDescription = (data: any, level: number, stoneLevel: number, currentGrade: string) => {
        if (!data || !data.effects) return "데이터를 불러올 수 없습니다.";
        const effects = data.effects;
        let finalDesc = effects.description;
        const gradeKey = currentGrade === "유물" ? "relic" : "legendary";
        const targetLevelData = effects[gradeKey]?.find((l: any) => l.level === (level || 1)) || effects.base;
        let finalValues = { ...targetLevelData };

        if (stoneLevel > 0 && effects.abilityStone) {
            const stoneData = effects.abilityStone.find((s: any) => s.level === stoneLevel);
            if (stoneData) {
                Object.keys(stoneData).forEach(key => {
                    if (key === "level") return;
                    const isAdd = key.startsWith("add");
                    const targetParam = key.replace("add", "").replace("reduce", "").toLowerCase();
                    const baseKey = Object.keys(finalValues).find(k => k.toLowerCase() === targetParam);
                    if (baseKey) {
                        if (isAdd) finalValues[baseKey] += stoneData[key];
                        else finalValues[baseKey] -= stoneData[key];
                    }
                });
            }
        }

        Object.keys(finalValues).forEach(key => {
            const val = typeof finalValues[key] === "number" ? finalValues[key].toFixed(2).replace(/\.00$/, "") : finalValues[key];
            finalDesc = finalDesc.replace(new RegExp(`\\{${key}\\}`, "g"), val);
        });
        return finalDesc;
    };

    useEffect(() => {
        const fetchEngravingData = async () => {
            if (!eng.Name) return;
            try {
                const mod = await import(`../../../../constants/engravingData/${eng.Name}.json`);
                const data = mod.default || mod;
                setEngOptions(data);
                const newDesc = calculateDescription(data, n, m, grade);
                onUpdate(index, { ...eng, Description: newDesc });
            } catch (err) {
                console.warn(`${eng.Name} JSON 로드 실패`);
            }
        };
        fetchEngravingData();
    }, [eng.Name]);

    const updateAll = (newLevel: number, newStoneLevel: number, newGrade: string, newName: string) => {
        const newDesc = calculateDescription(engOptions, newLevel, newStoneLevel, newGrade);
        onUpdate(index, {
            ...eng,
            Name: newName,
            Level: newLevel,
            AbilityStoneLevel: newStoneLevel,
            Grade: newGrade,
            Description: newDesc
        });
    };

    const handleLevelChange = (val: number) => updateAll(val, m, grade, eng.Name);
    const handleStoneLevelChange = (val: number) => updateAll(n, val, grade, eng.Name);
    const handleGradeChange = (val: string) => updateAll(n, m, val, eng.Name);
    const handleNameChange = (val: string) => {
        onUpdate(index, { ...eng, Name: val });
        setIsDropdownOpen(false);
    };

    const gradeStyles = getGradeColor(grade);

    return (
        <div
            className={`flex items-center mt-1 justify-between px-1.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer border
            ${isHovered ? 'bg-white/10 border-white/10 shadow-md' : 'bg-transparent border-transparent hover:bg-white/[0.03]'}`}
            onMouseEnter={() => onInteraction(index, eng.Name || null, eng.Description || "")}
        >
            <div className="flex items-center min-w-0 gap-1.5 flex-1">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full overflow-hidden bg-black/60`}>
                    <img src={iconUrl} alt={eng.Name} className="w-full h-full object-cover" />
                </div>

                {/* 각인 레벨 */}
                <div className="relative flex items-center gap-0.5 px-1 py-1 rounded-md shrink-0 bg-white/5 border border-white/5 group/lv transition-colors hover:bg-white/10">
                    <Diamond className="w-3.5 h-4.5 text-[#f16022] fill-[#f16022] shrink-0" />
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-zinc-500 text-[9px] font-bold uppercase">X</span>
                        <span className="text-white text-[14px] sm:text-[15px] font-black tabular-nums leading-none">{n}</span>
                    </div>
                    <ChevronDown size={8} className="text-zinc-500 ml-0.5 shrink-0" />
                    <select
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                        value={n}
                        onChange={(e) => handleLevelChange(Number(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {[0, 1, 2, 3, 4].map((lv) => <option key={lv} value={lv} className="bg-[#1a1a1b]">Lv.{lv}</option>)}
                    </select>
                </div>

                {/* 등급 & 이름 영역 */}
                <div className="flex items-center min-w-0 flex-1 gap-1">
                    <div className="relative shrink-0 flex items-center">
                        <span className={`text-[11px] sm:text-[13px] font-black ${gradeStyles.split(' ')[1]}`}>({grade})</span>
                        <select
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            value={grade}
                            onChange={(e) => handleGradeChange(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {ALL_GRADES.map((g) => <option key={g} value={g} className="bg-[#1a1a1b]">{g}</option>)}
                        </select>
                    </div>

                    {/* 이름 선택 드롭다운 */}
                    <div className="relative flex-1 min-w-0" ref={dropdownRef}>
                        <div
                            className="flex items-center justify-between group cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDropdownOpen(!isDropdownOpen);
                            }}
                        >
                            <span className="text-[#efeff0] font-bold text-[13px] sm:text-[14px] truncate group-hover:text-white transition-colors">
                                {eng.Name || "각인 선택"}
                            </span>
                            <ChevronDown size={10} className={`text-zinc-500 ml-1 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {isDropdownOpen && (
                            <div className="absolute top-[calc(100%+8px)] left-0 min-w-[180px] z-[100] bg-[#1a1a1b] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="max-h-[240px] overflow-y-auto py-1
                                    [&::-webkit-scrollbar]:w-1.5
                                    [&::-webkit-scrollbar-track]:bg-transparent
                                    [&::-webkit-scrollbar-thumb]:bg-white/10
                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                    hover:[&::-webkit-scrollbar-thumb]:bg-white/20
                                    transition-colors"
                                >
                                    {ALL_ENGRAVINGS.map((name) => {
                                        const isSelected = eng.Name === name;
                                        return (
                                            <div
                                                key={name}
                                                // 선택된 아이템에 ref를 할당합니다.
                                                ref={isSelected ? selectedItemRef : null}
                                                className={`px-4 py-2.5 text-[13px] sm:text-[14px] transition-colors cursor-pointer
                                                    ${isSelected
                                                    ? 'bg-blue-500/20 text-blue-400 font-bold'
                                                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNameChange(name);
                                                }}
                                            >
                                                {name}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 어빌리티 스톤 */}
            <div className="relative flex items-center shrink-0 ml-1">
                <div className={`relative flex items-center gap-0.5 px-1 py-1 rounded border transition-colors ${m > 0 ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'border-transparent hover:bg-white/5'}`}>
                    <img src={stoneIcon} alt="Stone" className={`w-3.5 h-4.5 shrink-0 ${m > 0 ? 'brightness-125' : 'grayscale opacity-30'}`} />
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-zinc-400 text-[8px] font-bold uppercase">Lv.</span>
                        <span className={`text-[14px] sm:text-[15px] font-black tabular-nums leading-none ${m > 0 ? 'text-[#00ccff]' : 'text-zinc-600'}`}>{m}</span>
                    </div>
                    <ChevronDown size={8} className="text-zinc-600 ml-0.5 shrink-0" />
                    <select
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                        value={m}
                        onChange={(e) => handleStoneLevelChange(Number(e.target.value))}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {[0, 1, 2, 3, 4].map((lv) => <option key={lv} value={lv} className="bg-[#1a1a1b]">Lv.{lv}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default EngravingItem;