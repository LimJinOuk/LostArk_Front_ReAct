import React from 'react';

// JSON 데이터 임포트
import Annihilation from "@/constants/JewelyData/Annihilation.json";
import Searing from "@/constants/JewelyData/Searing.json";
import Engulfing from "@/constants/JewelyData/Engulfing.json";
import Prominence from "@/constants/JewelyData/Prominence.json";

const GEM_DATA_MAP: Record<string, any[]> = {
    "멸화": Annihilation,
    "작열": Searing,
    "겁화": Engulfing,
    "홍염": Prominence
};

const JewelryItemTooltip = ({ data }: { data: any }) => {
    if (!data) return null;
    const { isPick, kind, level, originGem } = data;

    // --- [1] 텍스트 정제 함수 ---
    const cleanText = (text: any) => {
        if (!text) return "";
        return String(text)
            .replace(/<BR>/gi, '\n')
            .replace(/<[^>]*>?/gm, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    };

    const highlightEffect = (text: string) => {
        const parts = text.split(/(\[.*?\])|((?:\+|Lv\s*)?\d+(?:\.\d+)?(?:%|초)?)/gi).filter(Boolean);
        return parts.map((part, i) => {
            if (/((?:\+|Lv\s*)?\d+(?:\.\d+)?(?:%|초)?)/gi.test(part)) {
                return <span key={i} className="text-[#48c948] font-bold">{part}</span>;
            }
            if (part.startsWith('[') && part.endsWith(']')) {
                return <span key={i} className="text-zinc-400 mr-1">{part}</span>;
            }
            const trimmedPart = part.trim();
            const isFunctionWord = /피해|재사용|대기시간|증가|감소|공격력|기본/.test(trimmedPart);
            if (!isFunctionWord && trimmedPart.length > 0 && !/\d/.test(trimmedPart)) {
                return <span key={i} className="text-[#f9ba2e] font-bold">{part}</span>;
            }
            return part;
        });
    };

    // --- [2] 효과 텍스트 처리 (특정 문구 제거 및 분리) ---
    const processEffectText = (rawText: string) => {
        if (!rawText) return { main: "", add: "" };
        // "특정 스킬의", "스킬의" 문구를 완전히 제거
        let cleaned = rawText.replace(/특정\s?스킬의\s|스킬의\s/g, "").trim();

        if (cleaned.includes("추가 효과")) {
            const parts = cleaned.split("추가 효과");
            return {
                main: parts[0].trim(),
                add: parts[1] ? parts[1].trim() : ""
            };
        }
        return { main: cleaned, add: "" };
    };

    // --- [3] 데이터 파싱 및 스킬명 추출 ---
    let tooltipObj: any = {};
    try {
        tooltipObj = typeof originGem?.Tooltip === 'string'
            ? JSON.parse(originGem.Tooltip)
            : (originGem?.Tooltip || {});
    } catch (e) { tooltipObj = {}; }

    // ✅ 핵심: "피해" 혹은 "재사용" 앞의 글자를 스킬 이름으로 추출
    let skillName = "";
    Object.values(tooltipObj).forEach((el: any) => {
        if (el?.type === "ItemPartBox" && el?.value?.Element_001) {
            const text = cleanText(el.value.Element_001);
            // "피해" 혹은 "재사용" 이라는 단어를 기준으로 그 앞부분을 캡처
            // 예: "[블레이드] 터닝 슬래쉬 피해 40.00% 증가" -> "[블레이드] 터닝 슬래쉬" 추출
            const match = text.match(/(.*?) (?:피해|재사용)/);
            if (match && match[1]) {
                skillName = match[1].trim();
            }
        }
    });

    const titleData = tooltipObj.Element_001?.value || {};
    let rawName = cleanText(originGem?.Name || "보석");
    let itemName = rawName.replace(/\d+레벨\s?/, "").trim();
    const gradeName = cleanText(titleData.leftStr0 || originGem?.Grade || "보석");
    const tierInfo = cleanText(titleData.leftStr2 || "티어 정보 없음");

    let displayEffect = "";
    let additionalEffect = "";

    if (isPick && kind && level) {
        // ✅ [수정 모드]
        const jsonData = GEM_DATA_MAP[kind];
        const levelInfo = jsonData?.find(d => d.level === level);
        const processed = processEffectText(levelInfo?.effect_1 || "");

        // 추출한 실제 스킬 이름 + JSON의 효과 수치 결합
        displayEffect = skillName ? `${skillName} ${processed.main}` : processed.main;
        additionalEffect = levelInfo?.effect_2 || processed.add;
    } else {
        // ✅ [기본 모드]
        const elements = Object.values(tooltipObj) as any[];
        const effectSections = elements.filter(el =>
            el?.type === "ItemPartBox" && el?.value?.Element_000?.includes("효과")
        );
        if (effectSections.length > 0) {
            const processed = processEffectText(cleanText(effectSections[0]?.value?.Element_001));
            displayEffect = processed.main;
            additionalEffect = processed.add || (effectSections[1] ? cleanText(effectSections[1].value.Element_001) : "");
        }
    }

    const jsonData = kind ? GEM_DATA_MAP[kind] : null;
    const levelInfo = jsonData?.find(d => d.level === level);
    const displayIcon = (isPick && levelInfo?.iconUrl) ? levelInfo.iconUrl : originGem?.Icon;

    const isAncient = gradeName.includes("고대");
    const isRelic = gradeName.includes("유물");
    const gradeColor = isAncient ? "#dcc999" : isRelic ? "#fa5d00" : "#f9ba2e";
    const headerGradient = isAncient ? "from-[#3d3325]" : isRelic ? "from-[#412608]" : "from-[#362f1b]";

    return (
        <div className="w-[280px] pointer-events-none border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,1)] rounded-sm overflow-hidden text-[13px] font-sans text-left">
            {/* 헤더 섹션 */}
            <div className={`p-3 bg-gradient-to-br ${headerGradient} to-[#111] border-b border-white/5 relative z-10`}>
                <div className="flex items-center gap-3">
                    <div className="w-[52px] h-[52px] bg-black border rounded-md p-1 relative shadow-inner"
                         style={{ borderColor: `${gradeColor}66` }}>
                        <img src={displayIcon} alt="" className="w-full h-full object-contain" />
                        <span className="absolute bottom-0 right-1 text-[11px] text-white font-black drop-shadow-md">
                            Lv.{isPick ? level : (originGem?.Level || 0)}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <h4 style={{ color: gradeColor }} className="text-[15px] font-bold leading-tight truncate">
                            {itemName}
                        </h4>
                        <span style={{ color: gradeColor }} className="text-[12px] font-bold opacity-90">
                            {gradeName}
                        </span>
                    </div>
                </div>
            </div>

            {/* 본문 섹션 */}
            <div className="p-4 space-y-5 bg-[#0c0c0c]/70 backdrop-blur-md">
                {displayEffect && (
                    <div className="flex flex-col gap-2">
                        <div className="text-white/80 font-bold text-[12px] tracking-widest uppercase flex items-center gap-1.5">
                            <div className="w-1 h-1 bg-white/80 rounded-full"/> [보석 효과]
                        </div>
                        <div className="text-white/90 text-[13px] leading-relaxed font-medium whitespace-pre-wrap block">
                            {highlightEffect(displayEffect)}
                        </div>
                    </div>
                )}

                {additionalEffect && (
                    <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                        <div className="text-white/80 font-bold text-[12px] tracking-widest uppercase flex items-center gap-1.5">
                            <div className="w-1 h-1 bg-white/80 rounded-full"/> [추가 효과]
                        </div>
                        <div className="text-white/90 text-[13px] leading-relaxed font-medium whitespace-pre-wrap block">
                            {highlightEffect(additionalEffect)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JewelryItemTooltip;