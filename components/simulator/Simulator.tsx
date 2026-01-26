import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {Loader2, Search, ShieldAlert, RotateCcw, Diamond} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ 애니메이션 추가
import { SynergyBuffTab } from "./SynergyBuffTab";
import { ResultTab } from "./Result";
import EquipmentTooltip from "@/components/profile/Tooltip/EquipmentTooltip.tsx";
import { ArkPassiveBoard } from "./ArkPassiveBoard.tsx";
import engravingIconMap from "@/components/profile/tabs/engravingsIdTable.json";
import JewelryTooltip from "@/components/profile/Tooltip/JewelryTooltip.tsx";
import { CharacterInfo } from "../../types.ts";
import { SimTab } from "./SimulatorNav";
import AccessoryTooltip from "@/components/profile/Tooltip/AccessoryTooltip.tsx";
import { MASTER_DATA } from '@/constants/ArkPassiveData/arkPassiveData';

type CharacterInfoCompat = CharacterInfo & { CharacterName?: string };

// 🔹 Props 인터페이스: activeTab 추가
interface SimulatorProps {
    character?: CharacterInfoCompat | null;
    activeTab: SimTab;
}

interface EquipmentItemProps {
    item: any;
    i: number;
    theme: any;
    tooltip: any;
    quality: number | string;
    reinforceLevel: string;
    advancedReinforce: string | number;
    itemName: string;
    REINFORCE_OPTIONS: Array<{ label: string; value: number; tier: number }>;
    setHoveredIndex: (idx: number | null) => void;
    setHoveredData: (data: any) => void;
}

/* ---------------------- 상수 및 스타일 (기존 유지) ---------------------- */
const gradeStyles: any = {
    '일반': { bg: 'from-zinc-800 to-zinc-950', border: 'border-white/10', text: 'text-zinc-400', accent: 'bg-zinc-500' },
    '고급': { bg: 'from-[#1a2e1a] to-[#0a0f0a]', border: 'border-[#48c948]/30 shadow-[0_0_10px_rgba(72,201,72,0.05)]', text: 'text-[#4edb4e]', accent: 'bg-[#48c948]' },
    '희귀': { bg: 'from-[#1a2a3e] to-[#0a0d12]', border: 'border-[#00b0fa]/30 shadow-[0_0_10px_rgba(0,176,250,0.1)]', text: 'text-[#33c2ff]', accent: 'bg-[#00b0fa]' },
    '영웅': { bg: 'from-[#2e1a3e] to-[#120a1a]', border: 'border-[#ce43fb]/30 shadow-[0_0_10px_rgba(206,67,251,0.1)]', text: 'text-[#d966ff]', accent: 'bg-[#ce43fb]' },
    '전설': { bg: 'from-[#41321a] to-[#1a120a]', border: 'border-[#f99200]/40 shadow-[0_0_10px_rgba(249,146,0,0.15)]', text: 'text-[#ffaa33]', accent: 'bg-[#f99200]' },
    '유물': { bg: 'from-[#351a0a] to-[#0a0a0a]', border: 'border-[#fa5d00]/50 shadow-[0_0_10px_rgba(250,93,0,0.2)]', text: 'text-[#ff7526]', accent: 'bg-[#fa5d00]' },
    '고대': { bg: 'from-[#3d3325] to-[#0f0f10]', border: 'border-[#e9d2a6]/40', text: 'text-[#e9d2a6]', accent: 'bg-[#e9d2a6]' },
    '에스더': { bg: 'from-[#0d2e2e] to-[#050505]', border: 'border-[#2edbd3]/60 shadow-[0_0_12px_rgba(46,219,211,0.2)]', text: 'text-[#45f3ec]', accent: 'bg-[#2edbd3]' }
};

/* --- [필수] 섹션 외부 상단에 정의되어야 할 테마 객체 --- */
const arkTheme = {
    '진화': { color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10', shadow: 'shadow-blue-500/20', bar: 'bg-blue-500' },
    '깨달음': { color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', shadow: 'shadow-purple-500/20', bar: 'bg-purple-500' },
    '도약': { color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10', shadow: 'shadow-amber-500/20', bar: 'bg-amber-500' }
};

const shortNames: Record<string, string> = {
    '추가 피해': '추피', '적에게 주는 피해': '적주피', '치명타 적중률': '치적', '치명타 피해': '치피',
    '공격력': '공격력', '무기 공격력': '무공', '조화 게이지 획득량': '아덴획득', '낙인력': '낙인력'
};

/* ---------------------- Interfaces & Utils (기존 유지) ---------------------- */
interface Equipment { Type: string; Name: string; Icon: string; Grade: string; Tooltip: string; }
const cleanText = (text: any): string => {
    if (!text) return "";
    if (typeof text === "string") return text.replace(/<[^>]*>?/gm, "").trim();
    return "";
};
const getQualityColor = (q: number) => {
    if (q === 100) return "text-[#FF8000] border-[#FF8000]";
    if (q >= 90) return "text-[#CE43FB] border-[#CE43FB]";
    if (q >= 70) return "text-[#00B0FA] border-[#00B0FA]";
    if (q >= 30) return "text-[#00D100] border-[#00D100]";
    return "text-[#FF4040] border-[#FF4040]";
};
const FALLBACK_ABILITY_STONE_ICON =
    'https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/game/ico_ability_stone_symbol.png';


function safeClone<T>(v: T): T { try { return JSON.parse(JSON.stringify(v)); } catch { return v; } }

function parseReinforceAndAdvanced(item: Equipment, tooltip: any) {
    const reinforce = item?.Name?.match(/\+(\d+)/)?.[1] || "";
    const reinforceLabel = reinforce ? `+${reinforce}` : "";
    const advSrc = cleanText(tooltip?.Element_005?.value || "") + " " + cleanText(tooltip?.Element_006?.value || "");
    const advMatch = advSrc.match(/\[상급\s*재련\]\s*(\d+)\s*단계/);
    const advanced = advMatch?.[1] || "0";
    return { reinforceLabel, advanced };
}

const EquipmentItem = ({
                           item, i, theme, tooltip, quality, reinforceLevel,
                           advancedReinforce, itemName, REINFORCE_OPTIONS,
                           setHoveredIndex, setHoveredData
                       }: EquipmentItemProps) => {

    const [localQuality, setLocalQuality] = useState(quality);
    const [localAdv, setLocalAdv] = useState(advancedReinforce);

    // 초기 로드 시 딱 한 번만 실행되도록 함수형 업데이트 사용
    const [selectedOption, setSelectedOption] = useState(() => {
        const level = reinforceLevel.replace('+', '');
        // 현재 장비 수치와 일치하는 옵션을 찾되, 없으면 4티어 기본값
        return REINFORCE_OPTIONS.find(opt => String(opt.value) === level) || REINFORCE_OPTIONS[0];
    });

    // ⚠️ [수정 포인트] 의존성 배열에서 REINFORCE_OPTIONS를 제거하거나,
    // 부모로부터 넘어오는 값이 실제로 '변경'되었을 때만 초기화하도록 조건 추가
    useEffect(() => {
        const level = reinforceLevel.replace('+', '');
        const found = REINFORCE_OPTIONS.find(opt => String(opt.value) === level);

        // 사용자가 선택한 값과 서버에서 온 초기값이 다를 때만 동기화 (캐릭터 검색 시)
        if (found) {
            setLocalQuality(quality);
            setLocalAdv(advancedReinforce);
            setSelectedOption(found);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reinforceLevel, quality, advancedReinforce]);
    // 💡 REINFORCE_OPTIONS를 의존성에서 제외하여 리렌더링 시 초기화를 방지합니다.

    const handleKeyDown = (e: any, type: string, value: any) => {
        if (e.key === 'Enter') e.currentTarget.blur();
    };

    return (
        <div
            onMouseEnter={() => { setHoveredIndex(i); setHoveredData(tooltip); }}
            onMouseLeave={() => { setHoveredIndex(null); setHoveredData(null); }}
            className="relative group flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors h-[62px] cursor-help"
        >
            <div className="relative shrink-0">
                <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow || ''}`}>
                    <img src={item.Icon} className="w-10 h-10 rounded-md object-cover bg-black/20" alt={itemName} />
                </div>
                <input
                    type="number"
                    min="0" max="100"
                    value={localQuality}
                    onChange={(e) => setLocalQuality(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, '품질', localQuality)}
                    className={`absolute -bottom-1 -right-1 w-7 px-0.5 rounded-md text-[10px] font-black border border-zinc-700 bg-zinc-900 text-center focus:outline-none focus:ring-1 focus:ring-yellow-500
                    ${getQualityColor(Number(localQuality))} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors`}
                />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-[12px] truncate mb-1 ${theme.text}`}>{itemName}</h3>
                <div className="flex items-center gap-2">
                    <select
                        className="bg-zinc-800 text-white/70 text-[10px] px-2 py-0.5 rounded border border-zinc-700 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer scrollbar-hide"
                        value={`${selectedOption.tier}-${selectedOption.value}`}
                        onChange={(e) => {
                            const [tier, val] = e.target.value.split('-');
                            const found = REINFORCE_OPTIONS.find(opt => opt.tier === Number(tier) && opt.value === Number(val));
                            if (found) {
                                setSelectedOption(found); // 여기서 상태가 변경되면 위 useEffect는 실행되지 않아야 함
                            }
                        }}
                    >
                        {REINFORCE_OPTIONS.map(opt => (
                            <option
                                key={`${opt.tier}-${opt.value}`}
                                value={`${opt.tier}-${opt.value}`}
                                className="bg-zinc-900 text-white"
                            >
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
                            onKeyDown={(e) => handleKeyDown(e, '상재', localAdv)}
                            className="w-5 bg-transparent text-sky-400 text-[10px] font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};





const GemSlot = ({ gem, index, hoverIdx, hoverData, setHoverIdx, setHoverData, isCenter = false }: any) => {
    const sizeClasses = isCenter ? "w-14 h-14" : "w-12 h-12";

    if (!gem) return <div className={`${sizeClasses} rounded-full bg-white/5 opacity-10 border border-zinc-800`} />;

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
    } catch (e) { skillIcon = gem.Icon; }

    return (
        /* 최상위 컨테이너: 여기에 MouseLeave를 걸어야 툴팁으로 이동해도 사라지지 않음 */
        <div
            className="relative group flex flex-col items-center"
            onMouseEnter={() => { setHoverIdx(index); setHoverData(gem); }}
            onMouseLeave={() => { setHoverIdx(null); setHoverData(null); }}
        >
            <div className="flex flex-col items-center cursor-help">
                <div
                    className={`${sizeClasses} rounded-full transition-all duration-300 group-hover:scale-105 flex items-center justify-center overflow-hidden border border-zinc-700/50 shadow-lg`}
                    style={{
                        background: `radial-gradient(circle at center, ${gradeColor} 0%, #07090c 100%)`,
                    }}
                >
                    <img
                        src={skillIcon}
                        alt=""
                        className="w-full h-full object-cover scale-110 drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]"
                    />
                </div>
                <span className="mt-1 text-zinc-500 text-[11px] font-bold group-hover:text-zinc-300 transition-colors">
                    Lv.{gem.Level}
                </span>
            </div>


            {/* 툴팁: pointer-events-auto(기본값)를 유지하여 마우스 상호작용 허용 */}
            {hoverIdx === index && hoverData && (
                <div
                    className="absolute left-[80%] top-0 z-[9999] pl-4 pt-2 pointer-events-auto"
                    style={{ width: 'max-content' }}
                >
                    <div className="animate-in fade-in zoom-in-95 duration-150">
                        <JewelryTooltip gemData={hoverData} />
                    </div>
                </div>
            )}
        </div>
    );
};

/* ---------------------- 메인 컴포넌트 ---------------------- */
export const Simulator: React.FC<SimulatorProps> = ({ character: propCharacter, activeTab }) => {
    const location = useLocation();
    const initialCharacter = useMemo(() => (propCharacter ?? (location.state as any)?.character) as CharacterInfo | null, [location.state, propCharacter]);
    const [character, setCharacter] = useState<CharacterInfoCompat | null>(initialCharacter);
    const [loading, setLoading] = useState(false);
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [originalArkPassive, setOriginalArkPassive] = useState<any>(null);
    const [gems, setGems] = useState<any>(null);
    const [engravings, setEngravings] = useState<any>(null);
    // 툴팁 상태 관리
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoveredData, setHoveredData] = useState<any>(null);
    const [accHoverIdx, setAccHoverIdx] = useState<number | null>(null);
    const [accHoverData, setAccHoverData] = useState<any>(null);
    const [jewlryHoverIdx , setJewlryHoverIdx] = React.useState<any>(null);
    const [jewlryHoverData, setJewlryHoverData] = React.useState<any>(null);
    const getItemsByType = (types: string[]) =>
        equipments.filter(item => types.includes(item.Type));
    // Simulator 컴포넌트 내부 상단에 추가
    const TABS = ['진화', '깨달음', '도약'] as const;
    const [activeArkTab, setActiveArkTab] = useState<TabType>('깨달음');
    type TabType = typeof TABS[number];
    const [[page, direction], setPage] = useState([0, 0]);
    const [hoverInfo, setHoverInfo] = useState<{ effect: any; rect: DOMRect | null } | null>(null);
    const [engrHoverIdx, setEngrHoverIdx] = useState<number | null>(null);
    const [engrHoverName, setEngrHoverName] = useState<string | null>(null);
    const [engrHoverDesc, setEngrHoverDesc] = useState<string>("");

    // Simulator 컴포넌트 내부 상단에 추가
    const [arkData, setArkData] = useState<any>(null);

    //아크 페시브 초기화
    const handleReset = () => {
        if (originalArkPassive) {
            // 원본 데이터를 다시 복사하여 상태 초기화
            setArkData(JSON.parse(JSON.stringify(originalArkPassive)));
            // 선택된 효과나 모달도 닫아주는 것이 깔끔합니다.
            setSelectedEffect(null);
            alert("아크 패시브 설정이 초기 상태로 복구되었습니다.");
        }
    };

// 데이터가 로드되면 시뮬레이션 상태에 복사
    useEffect(() => {
        if (originalArkPassive) {
            setArkData(JSON.parse(JSON.stringify(originalArkPassive)));
        }
    }, [originalArkPassive]);

    const updateLevel = (nodeName: string, delta: number, maxLv: number) => {
        if (!arkData) return;

        setArkData((prev: any) => {
            const next = JSON.parse(JSON.stringify(prev));
            // 효과 찾기 (공백 제거 후 비교로 정확도 향상)
            let effectIndex = next.Effects.findIndex((e: any) =>
                e.Name.includes(activeArkTab) &&
                e.Description.replace(/\s+/g, '').includes(nodeName.replace(/\s+/g, ''))
            );

            // [추가] 만약 없는 노드인데 +를 눌렀다면 새로 생성
            if (effectIndex === -1 && delta > 0) {
                next.Effects.push({
                    Name: `[아크 패시브] ${activeArkTab} 티어`,
                    Description: `${nodeName} Lv.0`
                });
                effectIndex = next.Effects.length - 1;
            }

            if (effectIndex !== -1) {
                const currentLvMatch = next.Effects[effectIndex].Description.match(/Lv\.(\d+)/);
                let currentLv = currentLvMatch ? parseInt(currentLvMatch[1]) : 0;
                const nextLv = Math.min(Math.max(currentLv + delta, 0), maxLv);

                next.Effects[effectIndex].Description = next.Effects[effectIndex].Description.replace(/Lv\.\d+/, `Lv.${nextLv}`);
            }
            return next;
        });
    };
    const engravingDescToHtml = (desc: string) => {
        if (!desc) return "";

        // <FONT COLOR='#99ff99'>텍스트</FONT> → <span style="color:#99ff99">텍스트</span>
        let html = desc
            .replace(/<FONT\s+COLOR=['"](#?[0-9a-fA-F]{6})['"]>/g, `<span style="color:$1">`)
            .replace(/<\/FONT>/g, `</span>`);

        // 줄바꿈이 올 수도 있으니 처리
        html = html.replace(/\n/g, "<br />");

        return html;
    };

// 아이콘 URL 헬퍼
    const getArkIconUrl = (iconId: string | number, tab: string) => {
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


    // 2. 데이터 로딩
    useEffect(() => { setCharacter(initialCharacter); }, [initialCharacter]);
    const characterName = character?.CharacterName ?? character?.name ?? "";

    useEffect(() => {
        if (!characterName) return;
        setLoading(true);
        Promise.all([
            fetch(`/equipment?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
            fetch(`/arkpassive?name=${encodeURIComponent(characterName)}`).then((r) => r.json()),
            fetch(`/gems?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/engravings?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
        ]).then(([eqData, passiveData, gemData, engData]) => {
            setEquipments(Array.isArray(eqData) ? eqData : []);
            setOriginalArkPassive(passiveData ?? null);
            setGems(gemData); // 보석 데이터 저장
            setEngravings(engData);
        }).finally(() => setLoading(false));
    }, [characterName]);

    // 3. 데이터 가공
    const leftEquipList = useMemo(() => {
        const weapon = equipments.filter(i => i.Type === "무기");
        const armors = equipments.filter(i => ["투구", "상의", "하의", "장갑", "어깨"].includes(i.Type));
        return [...weapon.slice(0, 1), ...armors];
    }, [equipments]);

    const accessories = useMemo(() => {
        return equipments.filter(i => ["목걸이", "귀걸이", "반지", "팔찌"].includes(i.Type));
    }, [equipments]);


    const normalizeEngravingName = (name: string) => {
        return (name || "")
            .replace(/\[[^\]]*]/g, "")     // [강화] 같은거 제거
            .replace(/\([^)]*\)/g, "")     // (중력 해방) 같은거 제거
            .replace(/\s+/g, " ")
            .trim();
    };
    const getEngravingIconUrl = (name: string) => {
        const key = normalizeEngravingName(name);
        return (engravingIconMap as Record<string, string>)[key] || "";
    };
    // 4. 탭별 렌더링 함수 (CharacterCard 방식)
    const renderContent = () => {
        switch (activeTab) {
            case "info":
                return (
                    <div className="flex flex-col gap-6 p-4 text-zinc-300 min-h-screen max-w-[1200px] mx-auto">

                        {/* 왼쪽 섹션: 장비 & 각인 & 아크패시브 */}
                        <div className="flex-1 min-w-0 space-y-6">
                        {/* 왼쪽: 장비 섹션 */}

                            <section className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 items-stretch bg-[#121213] p-5 rounded-2xl border border-white/5">
                                {/* 왼쪽: 전투 장비 Section (가로 너비 유지) */}
                                <div className="w-full lg:w-[40%] flex flex-col shrink-0">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
                                        <div className="w-1.5 h-5 bg-blue-950 rounded-full"></div>
                                        <h1 className="text-base font-extrabold text-white tracking-tight uppercase">전투 장비</h1>
                                    </div>

                                    <div className="flex flex-col">
                                        {getItemsByType(['무기', '투구', '상의', '하의', '장갑', '어깨'])
                                            .sort((a, b) => (a.Type === '무기' ? 1 : b.Type === '무기' ? -1 : 0))
                                            .map((item, i) => {
                                                let tooltip;
                                                try { tooltip = JSON.parse(item.Tooltip); } catch (e) { return null; }

                                                const quality = tooltip?.Element_001?.value?.qualityValue ?? 0;
                                                const reinforceLevel = item.Name.match(/\+(\d+)/)?.[0] || '';
                                                const itemName = cleanText(item.Name).replace(/\+\d+\s/, '');

                                                // 등급 결정 로직
                                                const rawGrade = (item.Grade || "").trim();
                                                let currentGrade = "일반";
                                                if (rawGrade.includes('에스더')) currentGrade = '에스더';
                                                else if (rawGrade.includes('고대')) currentGrade = '고대';
                                                else if (rawGrade.includes('유물')) currentGrade = '유물';
                                                else if (rawGrade.includes('전설')) currentGrade = '전설';
                                                const theme = gradeStyles[currentGrade] || gradeStyles['일반'];

                                                const advMatch = cleanText(tooltip?.Element_005?.value || "").match(/\[상급\s*재련\]\s*(\d+)단계/);
                                                const advancedReinforce = advMatch ? advMatch[1] : "0";

                                                const REINFORCE_OPTIONS = [
                                                    ...Array.from({ length: 20 }, (_, i) => ({ label: `4티어 +${25 - i}`, value: 25 - i, tier: 4 })),
                                                    ...Array.from({ length: 17 }, (_, i) => ({ label: `일리아칸 +${25 - i}`, value: 25 - i, tier: 3 })),
                                                    ...Array.from({ length: 17 }, (_, i) => ({ label: `아브 +${25 - i}`, value: 25 - i, tier: 2 })),
                                                ].filter(opt => opt.value >= 9 || (opt.tier === 4 && opt.value >= 6));

                                                return (
                                                    <EquipmentItem
                                                        key={item.Name} // key는 오직 여기서만 사용
                                                        item={item}
                                                        i={i}
                                                        theme={theme}
                                                        tooltip={tooltip}
                                                        quality={quality}
                                                        reinforceLevel={reinforceLevel}
                                                        advancedReinforce={advancedReinforce}
                                                        itemName={itemName}
                                                        REINFORCE_OPTIONS={REINFORCE_OPTIONS}
                                                        setHoveredIndex={setHoveredIndex}
                                                        setHoveredData={setHoveredData}
                                                    />
                                                );
                                            })}
                                    </div>

                                </div>
                                {/* 오른쪽: 액세서리 Section (가로 너비 확장 및 내부 비율 조정) */}
                                {/* [오른쪽: 액세서리 Section] 여유 공간 확보 */}
                                <div className="w-full lg:flex-1 flex flex-col min-w-0">
                                    <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
                                        <div className="w-1.5 h-5 bg-blue-950 rounded-full"></div>
                                        <h1 className="text-base font-extrabold text-white tracking-tight uppercase">악세사리</h1>
                                    </div>

                                    <div className="flex flex-col">
                                        {getItemsByType(['목걸이', '귀걸이', '반지', '팔찌'])
                                            .filter(item => {
                                                try {
                                                    const tooltip = JSON.parse(item.Tooltip);
                                                    return (tooltip.Element_001?.value?.qualityValue ?? 0) !== -1;
                                                } catch(e) { return false; }
                                            })
                                            .map((item, i) => {
                                                const tooltip = JSON.parse(item.Tooltip);
                                                const quality = tooltip.Element_001?.value?.qualityValue ?? 0;
                                                const itemName = item.Name || "아이템 이름";

                                                const rawGrade = (item.Grade || "").trim();
                                                let currentGrade = "일반";
                                                if (rawGrade.includes('고대')) currentGrade = '고대';
                                                else if (rawGrade.includes('유물')) currentGrade = '유물';
                                                else if (rawGrade.includes('전설')) currentGrade = '전설';
                                                else if (rawGrade.includes('영웅')) currentGrade = '영웅';

                                                const theme = gradeStyles[currentGrade] || gradeStyles['일반'];
                                                const passive = cleanText(tooltip.Element_007?.value?.Element_001 || '').match(/\d+/)?.[0] || '0';
                                                const tierStr = tooltip.Element_001?.value?.leftStr2 || "";
                                                const tier = tierStr.replace(/[^0-9]/g, "").slice(-1) || "4";

                                                const grindContent = cleanText(tooltip.Element_006?.value?.Element_001 || tooltip.Element_005?.value?.Element_001 || '');
                                                const effects = [...grindContent.matchAll(/([가-힣\s]+?)\s*\+([\d.]+%?)/g)].map(m => ({
                                                    name: m[1].trim(),
                                                    value: m[2]
                                                }));

                                                const shortNames = {
                                                    '추가 피해': '추피', '적에게 주는 피해': '적주피', '치명타 적중률': '치적', '치명타 피해': '치피',
                                                    '공격력': '공격력', '무기 공격력': '무공', '조화 게이지 획득량': '아덴획득', '낙인력': '낙인력',
                                                    '파티원 회복 효과': '파티회복', '파티원 보호막 효과': '파티보호', '아군 공격력 강화 효과': '아공강',
                                                    '아군 피해량 강화 효과': '아피강', '최대 생명력': '최생', '최대 마나': '최마',
                                                    '전투 중 생명력 회복량': '전투회복', '상태이상 공격 지속시간': '상태이상'
                                                };

                                                return (
                                                    <div key={i}
                                                        // 마우스 이동 시 툴팁 유지를 위해 전체 행에 이벤트 적용
                                                         onMouseEnter={() => {
                                                             setAccHoverIdx(i);
                                                             setAccHoverData(tooltip);
                                                         }}
                                                         onMouseLeave={() => {
                                                             setAccHoverIdx(null);
                                                             setAccHoverData(null);
                                                         }}
                                                         className="relative group flex flex-nowrap items-center gap-2 lg:gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors h-[62px] cursor-help min-w-0 min-w-0">

                                                        {/* 아이콘 및 품질 (툴팁 기준점) */}
                                                        <div className="relative shrink-0">
                                                            <div className={`p-0.5 rounded-lg border shadow-lg bg-gradient-to-br ${theme.bg} ${theme.border} ${theme.glow || ''}`}>
                                                                <img src={item.Icon} className="w-10 h-10 rounded-md object-cover bg-black/20" alt="" />
                                                                {currentGrade === '고대' && (
                                                                    <div className="absolute inset-0 rounded-lg shadow-[inset_0_1px_4px_rgba(255,255,255,0.1)] pointer-events-none" />
                                                                )}
                                                            </div>

                                                            <div className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900 ${theme.text}`}>
                                                                {quality}
                                                            </div>

                                                            {/* --- 툴팁 모달: 아이콘 바로 오른쪽 밀착 및 유지 --- */}
                                                            {accHoverIdx === i && accHoverData && (
                                                                <div
                                                                    className="absolute left-full top-0 z-[9999] pointer-events-auto flex items-start"
                                                                    // paddingLeft를 통해 아이콘과 모달 사이의 마우스 인식 끊김 방지
                                                                    style={{ paddingLeft: '12px', width: 'max-content' }}
                                                                >
                                                                    <div className="animate-in fade-in slide-in-from-left-1 duration-200">
                                                                        <AccessoryTooltip data={accHoverData} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* 이름 및 티어 정보 */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`font-bold text-[12px] truncate mb-0.5 ${theme.text}`}>{itemName}</h3>
                                                            <div className="flex gap-1.5 text-[9px] whitespace-nowrap">
                                                                <span className="text-orange-400 font-bold">깨달음 +{passive}</span>
                                                                <span className="text-white/40 font-medium">{tier}티어</span>
                                                            </div>
                                                        </div>

                                                        {/* 연마 효과 영역 (기존 로직 유지) */}
                                                        <div className="w-[100px] flex flex-col justify-center items-end border-l border-white/5 pl-2 shrink-0">
                                                            {[0, 1, 2].map((idx) => {
                                                                const rawName = effects[idx]?.name || '';
                                                                const val = effects[idx]?.value || '-';
                                                                const dispName = shortNames[rawName] || rawName || '-';

                                                                const getDynamicColor = (name, valueStr) => {
                                                                    if (valueStr === '-' || !valueStr) return 'text-white/20';
                                                                    const num = parseFloat(valueStr.replace(/[^0-9.]/g, ''));
                                                                    const isPercent = valueStr.includes('%');
                                                                    const thresholds = {
                                                                        '추가 피해': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                                        '적에게 주는 피해': { 상: 2.0, 중: 1.2, 하: 0.55 },
                                                                        '치명타 적중률': { 상: 1.55, 중: 0.95, 하: 0.4 },
                                                                        '치명타 피해': { 상: 4.0, 중: 2.4, 하: 1.1 },
                                                                        '조화 게이지 획득량': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                                        '낙인력': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                                        '파티원 회복 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                                        '파티원 보호막 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                                        '아군 공격력 강화 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                                        '아군 피해량 강화 효과': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                                        '공격력_PCT': { 상: 1.55, 중: 0.95, 하: 0.4 },
                                                                        '공격력_FIXED': { 상: 390, 중: 195, 하: 80 },
                                                                        '무기 공격력_PCT': { 상: 3.0, 중: 1.8, 하: 0.8 },
                                                                        '무기 공격력_FIXED': { 상: 960, 중: 480, 하: 195 },
                                                                        '최대 생명력': { 상: 4000, 중: 2400, 하: 1100 },
                                                                        '최대 마나': { 상: 45, 중: 27, 하: 12 },
                                                                        '상태이상 공격 지속시간': { 상: 2.6, 중: 1.6, 하: 0.6 },
                                                                        '전투 중 생명력 회복량': { 상: 125, 중: 75, 하: 34 }
                                                                    };

                                                                    let targetKey = name;
                                                                    if (name === '공격력') targetKey = isPercent ? '공격력_PCT' : '공격력_FIXED';
                                                                    else if (name === '무기 공격력') targetKey = isPercent ? '무기 공격력_PCT' : '무기 공격력_FIXED';

                                                                    const criteria = thresholds[targetKey];
                                                                    if (!criteria) return 'text-zinc-500';
                                                                    if (num >= criteria.상) return 'text-yellow-400 font-black';
                                                                    if (num >= criteria.중) return 'text-purple-400 font-bold';
                                                                    return 'text-blue-400 font-medium';
                                                                };

                                                                return (
                                                                    <div key={idx} className="flex justify-between w-full text-[10px] leading-tight gap-1 items-center">
                                                                        {/* [수정] truncate와 shrink를 사용해 수치가 밀리지 않게 함 */}
                                                                        <span className="text-white/40 font-medium truncate shrink">{dispName}</span>
                                                                        <span className={`${getDynamicColor(rawName, val)} font-bold whitespace-nowrap shrink-0`}>{val}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                        <div className="flex items-center gap-4 p-2.5 rounded-xl border border-white/5 h-[62px] text-[10px]">
                                            팔찌 효율 계산 행
                                        </div>
                                    </div>
                                </div>
                            </section>


                        {/* 오른쪽: 아크패시브 섹션 */}
                            <section className="w-full max-w-full overflow-hidden bg-[#0d0d0f] text-zinc-300 p-6 relative overflow-hidden rounded-2xl shadow-2xl border border-white/5 mt-6">
                                {/* 앰비언트 라이트 */}
                                <motion.div
                                    animate={{ backgroundColor: activeArkTab === '진화' ? '#3b82f6' : activeArkTab === '깨달음' ? '#a855f7' : '#f59e0b' }}
                                    className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[400px] h-[300px] blur-[120px] opacity-[0.07] pointer-events-none transition-colors duration-1000"
                                />

                                {/* 상단 툴바: 초기화 버튼 배치 */}
                                <div className="absolute top-8 right-12 z-20">
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 text-zinc-500 hover:text-red-400 transition-all group"
                                        title="설정 초기화"
                                    >
                                        <RotateCcw size={14} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
                                        <span className="text-[11px] font-bold uppercase tracking-wider">Reset</span>
                                    </button>
                                </div>

                                {/* 헤더: 탭 & 포인트 (arkData 기반으로 변경 권장) */}
                                <div className="relative z-10 flex flex-col items-center gap-4">
                                    <div className="inline-flex p-1.5 bg-black/40 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl">
                                        {['진화', '깨달음', '도약'].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    const newIndex = ['진화', '깨달음', '도약'].indexOf(tab);
                                                    const currentIndex = ['진화', '깨달음', '도약'].indexOf(activeArkTab);
                                                    setPage([newIndex, newIndex > currentIndex ? 1 : -1]);
                                                    setActiveArkTab(tab as any);
                                                }}
                                                className={`relative px-8 py-2 rounded-lg text-xs font-bold transition-all duration-500
                    ${activeArkTab === tab ? arkTheme[tab as keyof typeof arkTheme].color : 'text-zinc-500 hover:text-zinc-300'}`}
                                            >
                                                {activeArkTab === tab && (
                                                    <motion.div layoutId="activeTabBg" className={`absolute inset-0 ${arkTheme[tab as keyof typeof arkTheme].bg} border-t border-white/10 rounded-lg`} />
                                                )}
                                                <span className="relative z-10">{tab}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* 포인트 표시: arkData에서 가져오도록 수정 */}
                                    <div className="flex flex-col items-center">
                                        <AnimatePresence mode="wait">
                                            <motion.div key={activeArkTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center gap-3">
                                                <div className="flex items-baseline gap-1.5">
                        <span className={`text-3xl font-black tracking-tighter ${arkTheme[activeArkTab].color}`}>
                            {arkData?.Points?.find((p: any) => p.Name === activeArkTab)?.Value || 0}
                        </span>
                                                    <span className="text-2xl font-bold text-zinc-700">/</span>
                                                    <span className="text-2xl font-bold text-zinc-500">{activeArkTab === "진화" ? 140 : activeArkTab === "깨달음" ? 101 : 70}</span>
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* 메인 보드 */}
                                <div className="relative min-h-[400px] w-full max-w-full overflow-hidden">
                                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                                        <motion.div
                                            key={activeArkTab}
                                            custom={direction}
                                            initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }} // 수치 대신 문자열 % 사용 권장
                                            animate={{ x: 0, opacity: 1 }}
                                            exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
                                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                            className="w-full flex flex-col gap-2" // w-full 필수
                                        >
                                            {[1, 2, 3, 4, 5].map((tierNum) => {
                                                const currentClass = character?.CharacterClassName || character?.CharacterClass;
                                                const nodes = (activeArkTab === '진화' ? MASTER_DATA.EVOLUTION :
                                                    activeArkTab === '깨달음' ? (MASTER_DATA.ENLIGHTENMENT_BY_CLASS as any)[currentClass] :
                                                        (MASTER_DATA.LEAP_BY_CLASS as any)[currentClass]) || [];
                                                const tierNodes = nodes.filter((m: any) => Number(m.tier) === tierNum);
                                                if (tierNodes.length === 0) return null;

                                                return (
                                                    <div key={tierNum} className="flex items-stretch w-full min-h-[115px] group border-b border-white/[0.02] last:border-0">
                                                        <div className="flex flex-col items-center justify-center w-8 shrink-0">
                                                            <span className="text-2xl font-black text-zinc-800 group-hover:text-zinc-600 transition-colors">{tierNum}</span>
                                                        </div>

                                                        <div className="flex-1 flex justify-center items-center gap-x-1 pl-4 pr-6">
                                                            {tierNodes.map((node: any) => {
                                                                /* [수정 1] 원본 대신 시뮬레이션 데이터(arkData)에서 효과 찾기 */
                                                                const activeEffect = arkData?.Effects?.find((eff: any) =>
                                                                    eff.Name?.includes(activeArkTab) &&
                                                                    eff.Description?.replace(/\s+/g, '').includes(node.name.replace(/\s+/g, ''))
                                                                );

                                                                /* [수정 2] 레벨 추출 로직 고도화 */
                                                                const currentLv = activeEffect ? (parseInt(activeEffect.Description.match(/Lv\.(\d+)/)?.[1] || "0")) : 0;
                                                                const isRealActive = currentLv > 0; // 레벨이 0보다 커야 실제 활성화
                                                                const progressWidth = (currentLv / Number(node.max)) * 100;
                                                                const currentTheme = arkTheme[activeArkTab];

                                                                return (
                                                                    <div key={node.name} className="flex flex-col items-center w-24 shrink-0">
                                                                        {/* [수정 3] 아이콘: 레벨 0일 때 흑백 처리 */}
                                                                        <motion.div
                                                                            animate={{
                                                                                filter: isRealActive ? "grayscale(0%)" : "grayscale(100%)",
                                                                                opacity: isRealActive ? 1 : 0.4
                                                                            }}
                                                                            whileHover={isRealActive ? { scale: 1.1, y: -5 } : {}}
                                                                            className={`relative rounded-xl border-2 transition-all duration-500 
                                                    ${isRealActive ? `cursor-pointer ${currentTheme.border} ${currentTheme.shadow} bg-zinc-900 shadow-2xl`
                                                                                : 'border-white/5 bg-zinc-950 scale-90'}`}
                                                                            style={{ width: '40px', height: '40px' }}
                                                                            onMouseEnter={(e) => isRealActive && setHoverInfo({ effect: activeEffect, rect: e.currentTarget.getBoundingClientRect() })}
                                                                            onMouseLeave={() => setHoverInfo(null)}
                                                                        >
                                                                            <img src={getArkIconUrl(node.iconId, activeArkTab)} className="w-full h-full p-1 object-contain relative z-10" alt="" />
                                                                            {isRealActive && <div className={`absolute inset-0 blur-lg opacity-40 ${currentTheme.bg}`} />}
                                                                        </motion.div>

                                                                        <div className="mt-1 text-center w-full group/node">
                                                                            {/* min-h를 줄이고 mb(마진 바텀)를 음수로 주거나 mt(마진 탑)를 제거하여 밀착시킵니다. */}
                                                                            <p className={`text-[11px] font-bold leading-tight line-clamp-2 min-h-[22px] ${isRealActive ? 'text-zinc-100' : 'text-zinc-700'}`}>
                                                                                {node.name}
                                                                            </p>

                                                                            {/* [수정 4] 레벨 조절기는 항상 표시, 미니바도 0% 상태로 유지 */}
                                                                            <div className="flex flex-col items-center gap-1">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); updateLevel(node.name, -1, node.max); }}
                                                                                        className="w-4 h-4 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-400 hover:text-white"
                                                                                    >
                                                                                        <span className="text-[10px] font-bold">−</span>
                                                                                    </button>

                                                                                    <div className="flex items-baseline gap-0.5 min-w-[35px] justify-center">
                                                                                        <span className={`text-[10px] font-black tracking-tighter ${isRealActive ? currentTheme.color : 'text-zinc-600'}`}>
                                                                                            LV.{currentLv}
                                                                                        </span>
                                                                                        <span className="text-[9px] font-bold text-zinc-800">/</span>
                                                                                        <span className="text-[9px] font-bold text-zinc-800">{node.max}</span>
                                                                                    </div>

                                                                                    <button
                                                                                        onClick={(e) => { e.stopPropagation(); updateLevel(node.name, 1, node.max); }}
                                                                                        className="w-4 h-4 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-400 hover:text-white"
                                                                                    >
                                                                                        <span className="text-[10px] font-bold">+</span>
                                                                                    </button>
                                                                                </div>

                                                                                <div className="w-12 h-[3px] bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                                                                                    <motion.div
                                                                                        initial={false}
                                                                                        animate={{ width: `${progressWidth}%` }}
                                                                                        className={`h-full ${isRealActive ? currentTheme.bar : 'bg-zinc-700'} rounded-full`}
                                                                                    />
                                                                                </div>
                                                                            </div>
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
                            </section>

                            {/*보석*/}
                            <section className="mt-10 w-full flex flex-col items-center px-4 select-none">
                                {/* 1. 헤더 */}
                                <div className="w-full max-w-3xl flex items-center justify-between border-b border-zinc-800/50 pb-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-4 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                                        <h1 className="text-base font-extrabold text-zinc-200 tracking-tight uppercase">보석</h1>
                                    </div>

                                    {/* 미니멀 고스트 배지 디자인 적용 */}
                                    <div className="flex items-center gap-2.5 px-3 py-1.5 backdrop-blur-sm">
                                        <div className="w-1 h-3 bg-sky-400 rounded-full"></div>
                                        <span className="text-[12px] text-[#efeff0] font-semibold tracking-tight leading-none truncate max-w-[200px] md:max-w-none">
                {gems?.Effects?.Description?.replace(/<[^>]*>?/gm, '').trim() || "정보 없음"}
            </span>
                                    </div>
                                </div>

                                {/* 2. 메인 보드 */}
                                <div className="relative w-full max-w-2xl rounded-[40px] border border-white/5 flex items-center justify-center min-h-[280px] md:min-h-[280px] overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                                     style={{
                                         background: `radial-gradient(circle at center, #1a202c 0%, #0d1117 40%, #05070a 100%)`,
                                     }}>

                                    {/* 배경 특수 효과 */}
                                    <div className="absolute inset-0 z-0 pointer-events-none rounded-[40px] overflow-hidden">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.15)_0%,_transparent_70%)] animate-pulse" />
                                        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0%,_rgba(139,92,246,0.08)_15%,_transparent_30%,_rgba(56,189,248,0.08)_60%,_transparent_100%)]" />
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.4)_100%)]" />
                                    </div>

                                    {/* 3. 보석 배치 */}
                                    <div className="relative z-10 flex flex-col items-center gap-2 transform scale-[0.85] sm:scale-100 transition-all duration-500">
                                        {/* 1행 */}
                                        <div className="flex items-center gap-12 md:gap-20 mb-1">
                                            <div className="flex gap-3">
                                                {[0, 1].map(idx => (
                                                    <GemSlot key={idx} gem={gems?.Gems?.[idx]} index={idx} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                                ))}
                                            </div>
                                            <div className="flex gap-3">
                                                {[2, 3].map(idx => (
                                                    <GemSlot key={idx} gem={gems?.Gems?.[idx]} index={idx} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                                ))}
                                            </div>
                                        </div>

                                        {/* 2행 */}
                                        <div className="flex items-center justify-center gap-4 md:gap-6 -mt-1 relative">
                                            <GemSlot gem={gems?.Gems?.[4]} index={4} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-blue-500/20 blur-[40px] rounded-full scale-150 animate-pulse"></div>
                                                <GemSlot gem={gems?.Gems?.[5]} index={5} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} isCenter={true} />
                                            </div>
                                            <GemSlot gem={gems?.Gems?.[6]} index={6} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                        </div>

                                        {/* 3행 */}
                                        <div className="flex items-center gap-12 md:gap-20 -mt-1">
                                            <div className="flex gap-3">
                                                {[7, 8].map(idx => (
                                                    <GemSlot key={idx} gem={gems?.Gems?.[idx]} index={idx} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                                ))}
                                            </div>
                                            <div className="flex gap-3">
                                                {[9, 10].map(idx => (
                                                    <GemSlot key={idx} gem={gems?.Gems?.[idx]} index={idx} hoverIdx={jewlryHoverIdx} hoverData={jewlryHoverData} setHoverIdx={setJewlryHoverIdx} setHoverData={setJewlryHoverData} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>


                            {/*각인*/}
                            <section className="bg-[#121213] rounded-xl border border-white/5 p-6 shadow-2xl">
                                <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-2 mb-2">
                                    <div className="w-1.5 h-5 bg-blue-950 rounded-full"></div>
                                    <h1 className="text-base font-extrabold text-white tracking-tight uppercase">
                                        활성 각인
                                    </h1>
                                </div>

                                <div className="flex flex-col gap-0.5">
                                    {(engravings?.ArkPassiveEffects ?? []).map((eng, i) => {
                                        const n = typeof eng.Level === "number" ? eng.Level : 0;
                                        const m = typeof eng.AbilityStoneLevel === "number" ? eng.AbilityStoneLevel : 0;
                                        const iconUrl = getEngravingIconUrl(eng.Name);
                                        const stoneIcon = eng.AbilityStoneIcon || FALLBACK_ABILITY_STONE_ICON;

                                        return (
                                            <div
                                                key={i}
                                                className="relative flex items-center justify-between px-2 py-1 rounded-sm group transition-all duration-200 cursor-default hover:bg-white/[0.02]"
                                                onMouseEnter={() => {
                                                    setEngrHoverIdx(i);
                                                    setEngrHoverName(eng.Name || null);
                                                    setEngrHoverDesc(eng.Description || "");
                                                }}
                                                onMouseLeave={() => {
                                                    setEngrHoverIdx(null);
                                                    setEngrHoverName(null);
                                                    setEngrHoverDesc("");
                                                }}
                                            >
                                                <div className="flex items-center min-w-0">
                                                    {/* 1. 각인 원형 아이콘 */}
                                                    <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-black/60 mr-4 border border-[#3e444d]">
                                                        <img
                                                            src={iconUrl}
                                                            alt={eng.Name}
                                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                        />
                                                    </div>

                                                    {/* 2. 단계 표시 */}
                                                    <div className="flex items-center gap-1.5 mr-4">
                                                        <Diamond
                                                            size={14}
                                                            className="text-[#f16022] fill-[#f16022] drop-shadow-[0_0_5px_rgba(241,96,34,0.5)]"
                                                        />
                                                        <span className="text-[#a8a8a8] text-sm font-medium">x</span>
                                                        <span className="text-white text-base font-bold leading-none tabular-nums">{n}</span>
                                                    </div>

                                                    {/* 3. 각인명 + (이름 옆 툴팁 앵커) */}
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        {/* ✅ 이름 래퍼를 relative로 만들고, 여기서 툴팁을 '옆'에 띄움 */}
                                                        <div className="relative min-w-0">
                                                <span className="text-[#efeff0] font-bold text-[14px] tracking-tight truncate">
                                                    {eng.Name}
                                                </span>

                                                            {/* ✅ 이름 옆 툴팁 */}
                                                            {engrHoverIdx === i && engrHoverDesc && (
                                                                <div
                                                                    className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[9999]"
                                                                    onMouseEnter={() => setEngrHoverIdx(i)}
                                                                    onMouseLeave={() => {
                                                                        setEngrHoverIdx(null);
                                                                        setEngrHoverName(null);
                                                                        setEngrHoverDesc("");
                                                                    }}
                                                                >
                                                                    <div className="w-[380px] max-w-[60vw] rounded-xl border border-white/10 bg-[#0b0c10]/95 shadow-2xl backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-150">
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 bg-black/40 shrink-0">
                                                                                <img src={iconUrl} alt="" className="w-full h-full object-cover" />
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <div className="text-[13px] font-black text-white mb-1 truncate">
                                                                                    {engrHoverName}
                                                                                </div>
                                                                                <div
                                                                                    className="text-[12px] leading-relaxed text-zinc-200"
                                                                                    dangerouslySetInnerHTML={{
                                                                                        __html: engravingDescToHtml(engrHoverDesc),
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* 스톤 레벨 */}
                                                        {m > 0 && (
                                                            <div className="flex items-center gap-1.5 ml-2">
                                                                <img
                                                                    src={stoneIcon}
                                                                    alt="Stone"
                                                                    className="w-4 h-5 object-contain brightness-125"
                                                                />
                                                                <div className="flex items-baseline gap-0.5">
                                                                    <span className="text-[#5e666f] text-[11px] font-bold">Lv.</span>
                                                                    <span className="text-[#00ccff] text-[17px] font-black">{m}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                            </section>
                    </div>
                    </div>
                );
            case "synergy":
                return <SynergyBuffTab character={character} />;
            case "result":
                return <ResultTab character={character} />;
            default:
                return null;
        }
    };

    if (loading) return (
        <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-emerald-500 w-8 h-8 mb-3" />
            <span className="text-zinc-500 text-sm font-bold">정보 동기화 중...</span>
        </div>
    );

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};