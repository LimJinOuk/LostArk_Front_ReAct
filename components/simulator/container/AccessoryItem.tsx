import React, { useState, useEffect } from 'react';

interface AccessoryProps {
    item: any;
    i: number;
    accessoryStates: any;
    onAccessoryUpdate: (name: string, data: any) => void;
    theme: any;
    partName: string;
    isBracelet: boolean;
    cleanText: (text: string) => string;
    setHoveredIndex: (i: number | null) => void;
    setHoveredData: (data: any | null) => void;
    tooltip: any;
}

type Thresholds = { 상: number; 중: number; 하: number };

const MAX_STATS: Record<string, number[]> = {
    "반지": [11091, 11349, 11865, 12897],
    "귀걸이": [11944, 12222, 12778, 13889],
    "목걸이": [15357, 15714, 16428, 17857]
};

const SHORT_NAMES: Record<string, Record<string, string>> = {
    common: {
        "무기공격력_FIXED": "무공(고정)",
        "공격력_FIXED": "공격력(고정)",
        "최대 생명력": "최생",
        "최대 마나": "최마",
        "상태이상 공격 지속시간": "상태이상",
        "전투 중 생명력 회복량": "전투회복"
    },
    necklace: { "추가 피해": "추피", "적에게 주는 피해": "적주피", "낙인력": "낙인력", "세레나데, 신앙, 조화 게이지 획득량": "서포터 아덴" },
    earring: { "무기공격력_PCT": "무공(%)", "공격력_PCT": "공격력(%)", "파티원 회복 효과": "파티회복", "파티원 보호막 효과": "파티보호" },
    ring: { "치명타 적중률": "치적", "치명타 피해": "치피", "아군 공격력 강화 효과": "아공강", "아군 피해량 강화 효과": "아피강" }
};

const BRACELET_OPTIONS: Record<string, string[]> = {
    "추피(악마/대악마)": ["2.5%", "3%", "3.5%"],
    "치피(치명타 적중시 피증 1.5%)": ["6.8%", "8.4%", "10%"],
    "무공(생명)": ["6900", "7800", "8700"],
    "무공(스탯)": ["7200", "8100", "9000"],
    "적주피(재사용 대기시간 2% 증가)": ["4.5%", "5%", "5.5%"],
    "치적(치명타 적중시 피증 1.5%)": ["3.4%", "4.2%", "5%"],
    "치피": ["6.8%", "8.4%", "10%"],
    "무공": ["7200", "8100", "9000"],
    "적중 시 무공(공이속 1%)": ["1160", "1320", "1480"],
    "비방향성 공격": ["2.5%", "3%", "3.5%"],
    "백어택 스킬": ["2.5%", "3%", "3.5%"],
    "헤드어택 스킬": ["2.5%", "3%", "3.5%"],
    "적주피": ["2%", "2.5%", "3%"],
    "추피": ["3%", "3.5%", "4%"],
    "치적": ["3.4%", "3.5%", "4%"],
    "힘민지": ["10000", "13000", "16000"],
    "공이속": ["4%", "5%", "6%"]
};

const ACC_THRESHOLDS: Record<string, Record<string, Thresholds>> = {
    common: {
        "무기공격력_FIXED": { 상: 960, 중: 480, 하: 195 },
        "공격력_FIXED": { 상: 390, 중: 195, 하: 80 },
        "최대 생명력": { 상: 6500, 중: 3250, 하: 1300 },
        "최대 마나": { 상: 30, 중: 15, 하: 6 },
        "상태이상 공격 지속시간": { 상: 1.0, 중: 0.5, 하: 0.2 },
        "전투 중 생명력 회복량": { 상: 50, 중: 25, 하: 10 },
    },
    necklace: { "추가 피해": { 상: 2.6, 중: 1.6, 하: 0.7 }, "적에게 주는 피해": { 상: 2.0, 중: 1.2, 하: 0.55 }, "낙인력": { 상: 8.0, 중: 4.8, 하: 2.15 }, "세레나데, 신앙, 조화 게이지 획득량": { 상: 6.0, 중: 3.6, 하: 1.6 } },
    earring: { "무기공격력_PCT": { 상: 3.0, 중: 1.8, 하: 0.8 }, "공격력_PCT": { 상: 1.55, 중: 0.95, 하: 0.4 }, "파티원 회복 효과": { 상: 3.5, 중: 2.1, 하: 0.95 }, "파티원 보호막 효과": { 상: 3.5, 중: 2.1, 하: 0.95 } },
    ring: { "치명타 적중률": { 상: 1.55, 중: 0.95, 하: 0.4 }, "치명타 피해": { 상: 4.0, 중: 2.4, 하: 1.1 }, "아군 공격력 강화 효과": { 상: 5.0, 중: 3.0, 하: 1.35 }, "아군 피해량 강화 효과": { 상: 7.5, 중: 4.5, 하: 2.0 } },
};

// 공통 스타일 클래스 정의
const styles = {
    select: "bg-zinc-900/60 text-zinc-300 text-[10px] font-bold rounded border border-white/5 px-1 py-0.5 outline-none hover:border-white/20 hover:bg-zinc-800 transition-all cursor-pointer appearance-none",
    input: "bg-black/30 text-[11px] text-white font-bold outline-none text-right rounded border border-transparent focus:border-white/20 transition-all",
    label: "text-[9px] text-white/40 font-medium uppercase tracking-tighter"
};

export const AccessoryItem = ({
                                  item, i, accessoryStates, onAccessoryUpdate,
                                  theme, partName, isBracelet, cleanText,
                                  setHoveredIndex, setHoveredData, tooltip
                              }: AccessoryProps) => {

    const itemName = item.Name || "아이템 이름";

    const getAccessoryStats = (tooltip: any) => {
        const elements = Object.values(tooltip) as any[];
        const baseElement = elements.find(el => el?.type === 'ItemPartBox' && el?.value?.Element_000?.includes('기본 효과'));
        const baseText = baseElement?.value?.Element_001 || "";
        const statMatch = baseText.match(/(?:힘|민첩|지능)\s*\+(\d+)/);
        const currentStat = statMatch ? parseInt(statMatch[1]) : 0;

        const polishElement = elements.find(el => el?.type === 'ItemPartBox' && el?.value?.Element_000?.includes('연마 효과'));
        const polishHtml = polishElement?.value?.Element_001 || "";
        const polishLevel = (polishHtml.match(/img src/g) || []).length;

        const grindContent = cleanText(polishHtml);
        const effects = [...grindContent.matchAll(/([가-힣\s,]+?)\s*\+([\d.]+%?)/g)].map(m => ({
            name: m[1].trim(),
            value: m[2],
        }));

        return { currentStat, polishLevel, effects };
    };

    const { currentStat, polishLevel, effects: normalEffects } = getAccessoryStats(tooltip);

    const getInitialSelectValue = (effect: any) => {
        if (!effect) return "";
        const accType = partName === "목걸이" ? 'necklace' : (partName === "귀걸이" ? 'earring' : 'ring');
        const availableOptions = { ...SHORT_NAMES.common, ...SHORT_NAMES[accType] };
        const isPct = String(effect.value).includes("%");
        const cleanName = effect.name.replace(/\s/g, "");
        let searchKey = cleanName;
        if (searchKey === "공격력") searchKey = isPct ? "공격력_PCT" : "공격력_FIXED";
        if (searchKey === "무기공격력") searchKey = isPct ? "무기공격력_PCT" : "무기공격력_FIXED";
        if (!availableOptions[searchKey]) {
            searchKey = Object.keys(availableOptions).find(k => k.replace(/\s/g, "").includes(cleanName)) || "";
        }
        return availableOptions[searchKey] ? searchKey : "";
    };

    const getInitialGrade = (effect: any, matchedKey: string) => {
        if (!effect || !matchedKey) return "";
        const accType = partName === "목걸이" ? 'necklace' : (partName === "귀걸이" ? 'earring' : 'ring');
        const num = parseFloat(String(effect.value).replace(/[^0-9.]/g, ""));
        const criteria = ACC_THRESHOLDS[accType]?.[matchedKey] || ACC_THRESHOLDS.common[matchedKey];
        if (!criteria) return "하";
        if (num >= criteria.상) return "상";
        if (num >= criteria.중) return "중";
        return "하";
    };

    const [localState, setLocalState] = useState<any>(() => {
        const initialMainStatPct = ((currentStat / (MAX_STATS[partName]?.[polishLevel] || 1)) * 100).toFixed(1);
        let data: any = { mainStatPct: initialMainStatPct };

        if (isBracelet) {
            const rawContent = cleanText(tooltip.Element_005?.value?.Element_001 || "");
            const braceletStats = [...rawContent.matchAll(/([가-힣\s]+?)\s*\+([\d.]+%?)/g)]
                .map(m => ({ name: m[1].trim(), value: m[2] }))
                .filter(e => ["특화", "치명", "신속", "힘", "민첩", "지능", "체력"].includes(e.name));

            [0, 1, 2, 3].forEach((idx) => {
                data[`baseName_${idx}`] = braceletStats[idx]?.name || "선택";
                data[`baseValue_${idx}`] = braceletStats[idx]?.value || "0";
            });
            [0, 1, 2].forEach(idx => data[`brac_option_${idx}`] = { name: "", grade: "중" });
        } else {
            normalEffects.forEach((eff: any, idx: number) => {
                const name = getInitialSelectValue(eff);
                const grade = getInitialGrade(eff, name);
                data[`acc_effect_${idx}`] = { name, grade };
            });
        }
        return data;
    });

    const getGradeColor = (grade: string) => {
        const colors: Record<string, string> = {
            "상": "text-yellow-400 font-black drop-shadow-[0_0_3px_rgba(250,204,21,0.4)]",
            "중": "text-purple-400 font-bold",
            "하": "text-blue-400 font-medium"
        };
        return colors[grade] || "text-zinc-600";
    };

    const updateState = (newData: any) => {
        const updated = { ...localState, ...newData };
        setLocalState(updated);
        onAccessoryUpdate(itemName, updated);
    };

    const refreshAccValueDisplay = (thresholdKey: string, selectedGrade: string) => {
        const accType = partName === "목걸이" ? 'necklace' : (partName === "귀걸이" ? 'earring' : 'ring');
        const criteria = ACC_THRESHOLDS[accType]?.[thresholdKey] || ACC_THRESHOLDS.common[thresholdKey];
        if (criteria && selectedGrade) {
            const val = criteria[selectedGrade as '상' | '중' | '하'];
            const isPercent = thresholdKey.includes("_PCT") ||
                !["무기공격력_FIXED", "공격력_FIXED", "최대 생명력", "최대 마나", "전투 중 생명력 회복량"].includes(thresholdKey);
            return isPercent ? `${val.toFixed(2)}%` : val.toLocaleString();
        }
        return "-";
    };

    useEffect(() => {
        onAccessoryUpdate(itemName, localState);
    }, []);

    return (
        <div
            onMouseEnter={() => { if(setHoveredIndex) setHoveredIndex(i); if(setHoveredData) setHoveredData(tooltip); }}
            onMouseLeave={() => { if(setHoveredIndex) setHoveredIndex(null); if(setHoveredData) setHoveredData(null); }}
            className="relative group flex flex-nowrap items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-all h-[68px] min-w-0 border border-transparent hover:border-white/5 active:scale-[0.99]"
        >
            {/* 아이콘 영역 */}
            <div className="relative shrink-0">
                <div className={`p-0.5 rounded-lg border shadow-2xl bg-gradient-to-br ${theme.bg} ${theme.border}`}>
                    <img src={item.Icon} className="w-11 h-11 rounded-md object-cover" alt="" />
                </div>
            </div>

            {/* 메인 정보 (힘민지/팔찌) */}
            <div className="flex-1 min-w-0">
                <h3 className={`font-black text-[12px] tracking-tight ${theme.text} mb-1 opacity-90`}>{partName}</h3>
                {!isBracelet ? (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[11px] text-white/70 tracking-tight uppercase">힘민지</span>
                            <div className="flex items-baseline gap-0.5">
                                {/* [수정] 숫자 입력창: 크기 12px */}
                                <input
                                    type="text"
                                    className={`${styles.input} w-10 px-1 text-[12px] text-yellow-400 bg-white/15 rounded border-none focus:ring-0 bg-white`}
                                    value={localState.mainStatPct || ""}
                                    onChange={(e) => updateState({ mainStatPct: e.target.value })}
                                />
                                {/* [수정] % 기호: 크기 11px, 은은한 노란색/투명도 */}
                                <span className="text-[11px] text-white/70 "> %</span>
                            </div>
                        </div>
                        {/* 게이지 바 */}
                        <div className="w-[85px] h-1 bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-700 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                                style={{ width: `${localState.mainStatPct}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1" onClick={(e) => e.stopPropagation()}>
                        {[0, 1, 2, 3].map((idx) => (
                            <div key={idx} className="flex items-center group/item h-5">
                                {/* 1. 스탯 이름 선택: 텍스트만 깔끔하게 노출 */}
                                <select
                                    className={`${styles.select}`}
                                    value={localState[`baseName_${idx}`] || "선택"}
                                    onChange={(e) => updateState({ [`baseName_${idx}`]: e.target.value })}
                                >
                                    {["선택", "특화", "치명", "신속", "힘", "민첩", "지능", "체력"].map(s => (
                                        <option key={s} value={s} className="bg-zinc-900 text-white">{s.substring(0, 2)}</option>
                                    ))}
                                </select>

                                {/* 3. 수치 입력: 하단 라인만 살려 심플하게 유지 */}
                                <input
                                    type="text"
                                    className="bg-black/40 text-[11px] text-white font-bold w-8 px-1 outline-none rounded border border-transparent focus:border-white/20 focus:bg-black/50 text-right transition-all"
                                    value={localState[`baseValue_${idx}`] || "0"}
                                    onChange={(e) => updateState({ [`baseValue_${idx}`]: e.target.value })}
                                />

                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 효과 영역 */}
            <div className="w-[195px] flex flex-col gap-1 border-l border-white/10 pl-3 relative z-10" onClick={(e) => e.stopPropagation()}>
                {isBracelet ? (
                    [0, 1, 2].map((idx) => {
                        const opt = localState[`brac_option_${idx}`] || { name: "", grade: "중" };
                        const effectData = BRACELET_OPTIONS[opt.name];
                        const displayVal = effectData ? effectData[opt.grade === "상" ? 2 : opt.grade === "중" ? 1 : 0] : "-";
                        return (
                            <div key={idx} className="flex items-center gap-1.5 h-4 justify-between">
                                <select
                                    className={`${styles.select} flex-1 overflow-hidden text-ellipsis text-[11px] w-[110px]`}
                                    value={opt.name}
                                    onChange={(e) => updateState({ [`brac_option_${idx}`]: { ...opt, name: e.target.value } })}
                                >
                                    <option value="">효과 부여</option>
                                    {Object.keys(BRACELET_OPTIONS).map(o => <option key={o} value={o} className="bg-zinc-900">{o}</option>)}
                                </select>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <select
                                        className={`${styles.select} w-7 text-center text-[11px]`}
                                        value={opt.grade}
                                        onChange={(e) => updateState({ [`brac_option_${idx}`]: { ...opt, grade: e.target.value } })}
                                    >
                                        <option value="상">상</option><option value="중">중</option><option value="하">하</option>
                                    </select>
                                    <span className={`w-10 text-right text-[11px] ${getGradeColor(opt.grade)}`}>{displayVal}</span>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    [0, 1, 2].map((idx) => {
                        const eff = localState[`acc_effect_${idx}`] || { name: "", grade: "" };
                        const accType = partName === "목걸이" ? 'necklace' : (partName === "귀걸이" ? 'earring' : 'ring');
                        const options = { ...SHORT_NAMES.common, ...SHORT_NAMES[accType] };
                        return (
                            <div key={idx} className="flex items-center gap-1.5 h-4 justify-between">
                                <select
                                    className={`${styles.select} flex-1 text-[11px] w-[110px]`}
                                    value={eff.name}
                                    onChange={(e) => updateState({ [`acc_effect_${idx}`]: { ...eff, name: e.target.value } })}
                                >
                                    <option value="">연마 옵션</option>
                                    {Object.keys(options).map(k => (
                                        <option key={k} value={k} className="bg-zinc-900">
                                            {k.replace("_FIXED","").replace("_PCT","")}
                                        </option>
                                    ))}
                                </select>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <select
                                        className={`${styles.select} w-7 text-center text-[11px]`}
                                        value={eff.grade}
                                        onChange={(e) => updateState({ [`acc_effect_${idx}`]: { ...eff, grade: e.target.value } })}
                                    >
                                        <option value="">-</option><option value="상">상</option><option value="중">중</option><option value="하">하</option>
                                    </select>
                                    <span className={`w-12 text-right text-[11px] ${getGradeColor(eff.grade)}`}>
                                        {refreshAccValueDisplay(eff.name, eff.grade)}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};