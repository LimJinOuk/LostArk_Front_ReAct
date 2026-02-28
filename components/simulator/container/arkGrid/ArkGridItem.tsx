import React, { useState, useEffect, useRef } from 'react';
import ArkGridItemTooltip from "@/components/simulator/container/arkGrid/ArkGridItemTooltip.tsx";

// 직업별 폴더 매핑
export const JOB_FOLDER_MAP: Record<string, string> = {
    "발키리": "Valkyrie", "워로드": "WarLord", "버서커": "Berserker", "디스트로이어": "Destroyer",
    "홀리나이트": "HolyNights", "슬레이어": "Slayer", "배틀마스터": "BattleMaster", "인파이터": "InFighter",
    "기공사": "SoulMaster", "창술사": "LanceMaster", "스트라이커": "Striker", "브레이커": "Breaker",
    "데빌헌터": "DevilHunter", "블래스터": "Blaster", "호크아이": "HawkEye", "스카우터": "Scouter",
    "건슬링어": "GunSlinger", "바드": "Bard", "서머너": "Summoner", "아르카나": "Arcana",
    "소서리스": "Sorceress", "블레이드": "Blade", "데모닉": "Demonic", "리퍼": "Reaper",
    "소울이터": "SoulEater", "도화가": "Artist", "기상술사": "WeatherArtist", "환수사": "WildSoul",
    "가디언나이트": "GuardianKnight"
};

const CORE_ICON_MAP: Record<string, string> = {
    "질서의 해 코어": "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_96.png",
    "질서의 달 코어": "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_97.png",
    "질서의 별 코어": "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_98.png",
    "혼돈의 해 코어": "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_99.png",
    "혼돈의 달 코어": "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_100.png",
    "혼돈의 별 코어": "https://cdn-lostark.game.onstove.com/efui_iconatlas/use/use_13_101.png" // 알려주신 마지막 중복 키 수정
};

const gradeStyles: { [key: string]: { bg: string; text: string; accent: string } } = {
    고대: { bg: 'from-[#3d3325] to-[#251d13]', text: 'text-[#ffac5e]', accent: 'bg-[#ffac5e]' },
    유물: { bg: 'from-[#3d2109] to-[#211104]', text: 'text-[#ff8000]', accent: 'bg-[#ff8000]' },
    전설: { bg: 'from-[#362e15] to-[#1e190b]', text: 'text-[#ffae00]', accent: 'bg-[#ffae00]' },
    영웅: { bg: 'from-[#2a1a3d] to-[#160d21]', text: 'text-[#ce43ff]', accent: 'bg-[#ce43ff]' },
    일반: { bg: 'from-[#222222] to-[#111111]', text: 'text-gray-400', accent: 'bg-gray-400' },
};

interface ArkGridProps {
    arkGrid: any;
    setArkGrid: React.Dispatch<React.SetStateAction<any>>;
    characterJob: string;
    onArkGridUpdate?: (slots: any[]) => void;
}

const ArkGridItem: React.FC<ArkGridProps> = ({ arkGrid, setArkGrid, characterJob, onArkGridUpdate}) => {
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const [coreOptions, setCoreOptions] = useState<Record<string, any[]>>({});
    const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const loadCoreData = async () => {
            const folderName = JOB_FOLDER_MAP[characterJob];
            if (!folderName) return;

            try {
                const [moonMod, sunMod, starMod] = await Promise.all([
                    import(`../../../../constants/ArkGridData/${folderName}/ArkGridCore${folderName}Moon.json`),
                    import(`../../../../constants/ArkGridData/${folderName}/ArkGridCore${folderName}Sun.json`),
                    import(`../../../../constants/ArkGridData/${folderName}/ArkGridCore${folderName}Star.json`)
                ]);

                const newOptions: Record<string, any[]> = {};

                const extractData = (mod: any, label: string) => {
                    const rawData = mod.default ? mod.default : mod;
                    if (Array.isArray(rawData)) {
                        if (label === "달") {
                            newOptions["질서의 달 코어"] = rawData;
                            newOptions["혼돈의 달 코어"] = rawData;
                        } else if (label === "해") {
                            newOptions["질서의 해 코어"] = rawData;
                            newOptions["혼돈의 해 코어"] = rawData;
                        } else if (label === "별") {
                            newOptions["질서의 별 코어"] = rawData;
                            newOptions["혼돈의 별 코어"] = rawData;
                        }
                    }
                };

                extractData(moonMod, "달");
                extractData(sunMod, "해");
                extractData(starMod, "별");

                setCoreOptions(newOptions);
            } catch (error) {
                console.error("❌ 데이터 로드 실패:", error);
            }
        };

        loadCoreData();
    }, [characterJob]);

    // ArkGridItem.tsx 내부

// ... (기존 useEffect 로드 로직 아래에 추가)

    useEffect(() => {
        if (Object.keys(coreOptions).length > 0 && arkGrid?.Slots) {
            let isChanged = false;

            const updatedSlots = arkGrid.Slots.map((slot: any) => {
                const category = slot.Name.split(":")[0]?.trim();
                const subName = slot.Name.split(":")[1]?.trim() || "";
                const options = coreOptions[category] || [];

                const selectedData = options.find(opt => opt.title === subName && opt.grade === slot.Grade)
                    || options.find(opt => opt.title === subName)
                    || options[0];
                if (!selectedData) return slot;
                // 툴팁의 details를 기반으로 포인트별 효과 추출
                const currentPoint = slot.Point || 0;
                const activeEffects = Object.entries(selectedData.details || {})
                    .filter(([p]) => currentPoint >= Number(p))
                    .map(([_, desc]) => ({
                        arkGridEffects: desc as string
                    }));
                // 이전 데이터와 비교하여 변경 사항 확인
                const newTooltip = JSON.stringify(selectedData);
                // Avoid JSON.stringify deep compare in render/updates; compare by length + content
                const prevEffects = Array.isArray((slot as any).arkGridEffect) ? (slot as any).arkGridEffect : [];
                const hasEffectChanged =
                    prevEffects.length !== activeEffects.length ||
                    prevEffects.some((e: any, idx: number) => e?.arkGridEffects !== activeEffects[idx]?.arkGridEffects);
                const hasTooltipChanged = slot.Tooltip !== newTooltip;

                if (hasEffectChanged || hasTooltipChanged) {
                    isChanged = true;
                    return {
                        ...slot,
                        Tooltip: newTooltip,
                        arkGridEffect: activeEffects,
                        Point: currentPoint
                    };
                }
                return slot;
            });
            if (isChanged) {
                // 부모의 setArkGrid 호출
                setArkGrid((prev: any) => ({ ...prev, Slots: updatedSlots }));
                // 시뮬레이터 페이지로 즉시 전송
                onArkGridUpdate?.(updatedSlots);
            }
        }
    }, [coreOptions, arkGrid?.Slots, onArkGridUpdate]);


    const handleMouseEnter = (idx: number) => {
        if (leaveTimer.current) clearTimeout(leaveTimer.current);
        setHoverIdx(idx);
    };

    const handleMouseLeave = () => {
        leaveTimer.current = setTimeout(() => {
            setHoverIdx(null);
        }, 150);
    };

    return (
        <section className="bg-[#121213] pt-5 pb-2 px-5 rounded-2xl border border-white/5 shadow-2xl flex flex-col h-fit w-full max-w-[400px]">
            <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-1">
                <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                <h1 className="text-[15px] font-extrabold text-white tracking-tight uppercase">아크 그리드</h1>
            </div>

            <div className="flex flex-col gap-0.5">
                {arkGrid?.Slots?.map((slot: any, i: number) => {
                    // "질서의 해 코어 : 옵션명" 형태에서 데이터 분리
                    const nameParts = slot.Name.split(":");
                    const category = nameParts[0]?.trim();
                    const subName = nameParts[1]?.trim() || "";

                    const currentGrade = slot.Grade || "일반";
                    const theme = gradeStyles[currentGrade] || gradeStyles['일반'];
                    const options = coreOptions[category] || [];

                    // 핵심 수정: 초기 매칭 실패 방지 로직
                    // 1. 이름과 등급이 완벽히 일치하는 데이터 탐색
                    // 2. 없으면 이름만 일치하는 데이터 탐색
                    // 3. 그것도 없으면 해당 카테고리의 첫 번째 데이터를 기본값으로 설정
                    const selectedData = options.find(opt => opt.title === subName && opt.grade === currentGrade)
                        || options.find(opt => opt.title === subName)
                        || options[0];

                    return (
                        <div key={i} className="relative" onMouseEnter={() => handleMouseEnter(i)} onMouseLeave={handleMouseLeave}>
                            <div className={`relative group flex items-center gap-3 rounded-xl transition-all h-[62px] px-2 pl-0 cursor-pointer ${hoverIdx === i ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'}`}>
                                <div className="relative shrink-0">
                                    <div className={`w-12 h-12 rounded-xl p-[2px] transition-all flex items-center justify-center bg-gradient-to-br ${theme.bg} border ${hoverIdx === i ? 'border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'border-[#e9d2a6]/10'}`}>
                                        <img src={slot.Icon} className="w-full h-full object-contain filter drop-shadow-md" alt="" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                                    <div className={`text-[10.5px] font-bold opacity-80 ${theme.text}`}>{category}</div>
                                    <div className="relative group/select">
                                        <select
                                            className={`bg-transparent text-[13px] font-extrabold outline-none cursor-pointer appearance-none w-full pr-4 ${theme.text}`}
                                            value={`${subName}|${currentGrade}`}
                                            onChange={(e) => {
                                                const [name, grade] = e.target.value.split('|');
                                                const selected = options.find(opt => opt.title === name && opt.grade === grade);
                                                if (selected) {
                                                    const updatedSlots = [...arkGrid.Slots];
                                                    updatedSlots[i] = {
                                                        ...updatedSlots[i],
                                                        Name: `${category} : ${selected.title}`,
                                                        Grade: selected.grade,
                                                        Tooltip: JSON.stringify(selected),
                                                        Point: updatedSlots[i].Point || 0
                                                    };
                                                    setArkGrid({ ...arkGrid, Slots: updatedSlots });
                                                }
                                            }}
                                        >
                                            {options.length > 0 ? (
                                                options.map((opt, idx) => (
                                                    <option key={idx} value={`${opt.title}|${opt.grade}`} className="bg-[#1a1a1b] text-white">
                                                        {opt.title} ({opt.grade})
                                                    </option>
                                                ))
                                            ) : (
                                                <option value={`${subName}|${currentGrade}`}>{subName} ({currentGrade})</option>
                                            )}
                                        </select>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover/select:opacity-100">
                                            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <select
                                        className="bg-white/5 border border-white/10 rounded-md text-[13px] font-black text-white/90 outline-none w-12 h-7 text-center hover:border-yellow-500/50 appearance-none
                                        [&::-webkit-scrollbar]:hidden
                                        [scrollbar-width:none]
                                        [-ms-overflow-style:none]"
                                        value={slot.Point}
                                        onChange={(e) => {
                                            const updatedSlots = [...arkGrid.Slots];
                                            updatedSlots[i] = { ...updatedSlots[i], Point: parseInt(e.target.value) };
                                            setArkGrid({ ...arkGrid, Slots: updatedSlots });
                                        }}
                                    >
                                        {Array.from({ length: 21 }, (_, idx) => 20 - idx).map(num => (
                                            <option key={num} value={num} className="bg-[#1a1a1b] text-white">{num}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* 툴팁 모달 */}
                            {hoverIdx === i && selectedData && (
                                <ArkGridItemTooltip
                                    data={selectedData}
                                    icon={CORE_ICON_MAP[category]} // 아이콘 URL 전달
                                    point={slot.Point}
                                    theme={theme}
                                    onMouseEnter={() => handleMouseEnter(i)}
                                    onMouseLeave={handleMouseLeave}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default ArkGridItem;