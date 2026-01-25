import React from 'react';

const JewelryTooltip = ({ gemData }: { gemData: any }) => {
    if (!gemData) return null;

    const cleanText = (text: any) => {
        if (!text) return "";
        return String(text)
            .replace(/<BR>/gi, '\n')
            .replace(/<[^>]*>?/gm, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    };

    // --- [개선] 모든 숫자, %, +, Lv, 초 단위를 초록색으로 강조 ---
    const highlightEffect = (text: string) => {
        // 정규식: [직업명] 추출 또는 (숫자, %, +, Lv, 초) 패턴 추출
        const parts = text.split(/(\[.*?\])|((?:\+|Lv\s*)?\d+(?:\.\d+)?(?:%|초)?)/gi).filter(Boolean);

        return parts.map((part, i) => {
            const trimmedPart = part.trim();

            // 1. 수치 관련 (숫자, %, +, Lv, 초) -> 초록색
            if (/((?:\+|Lv\s*)?\d+(?:\.\d+)?(?:%|초)?)/gi.test(part)) {
                return <span key={i} className="text-[#48c948] font-bold">{part}</span>;
            }

            // 2. 직업명 ([블레이드]) -> 연한 회색
            if (part.startsWith('[') && part.endsWith(']')) {
                return <span key={i} className="text-zinc-400 mr-1">{part}</span>;
            }

            // 3. 스킬명 판단 (직업명 뒤에 오는 특정 키워드가 아닌 텍스트) -> 노란색
            const isFunctionWord = /피해|재사용|대기시간|증가|감소|공격력|기본/.test(trimmedPart);
            if (!isFunctionWord && trimmedPart.length > 0 && !/\d/.test(trimmedPart)) {
                return <span key={i} className="text-[#f9ba2e] font-bold">{part}</span>;
            }

            return part;
        });
    };

    let tooltipData: any = {};
    try {
        tooltipData = typeof gemData.Tooltip === 'string'
            ? JSON.parse(gemData.Tooltip)
            : gemData.Tooltip;
    } catch (e) {
        console.error("Tooltip 파싱 실패", e);
    }

    const titleData = tooltipData.Element_001?.value || {};
    const itemName = cleanText(gemData.Name || tooltipData.Element_000?.value || "보석");
    const gradeName = cleanText(titleData.leftStr0 || gemData.Grade || "보석");
    const tierInfo = cleanText(titleData.leftStr2 || "");

    const isAncient = gradeName.includes("고대");
    const isRelic = gradeName.includes("유물");
    const isLegendary = gradeName.includes("전설");

    const gradeColor = isAncient ? "#dcc999" : isRelic ? "#fa5d00" : isLegendary ? "#f9ba2e" : "#ffffff";

    // 헤더 그라데이션에 투명도 적용
    let headerGradient = "from-[#2a2e36]/60 to-transparent";
    if (isAncient) headerGradient = "from-[#3d3325]/60 to-transparent";
    else if (isRelic) headerGradient = "from-[#412608]/60 to-transparent";
    else if (isLegendary) headerGradient = "from-[#362f1b]/60 to-transparent";

    const elements = Object.values(tooltipData) as any[];
    const effectSection = elements.find(el =>
        el?.type === "ItemPartBox" &&
        (el?.value?.Element_000?.includes("효과") || el?.value?.Element_000?.includes("보석 효과"))
    );

    const rawEffect = effectSection?.value?.Element_001 || "";
    const [mainEffectRaw, additionalEffectRaw] = rawEffect.split("추가 효과");
    const mainEffects = mainEffectRaw.split('\n').map(cleanText).filter(Boolean);
    const additionalEffect = cleanText(additionalEffectRaw);

    return (
        // [변경 포인트] bg-[#111111]/60 와 backdrop-blur-md 적용
        <div className="w-[280px] bg-[#111111]/60 backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden text-[13px] font-sans text-left">

            {/* 헤더 섹션 */}
            <div className={`p-2 bg-gradient-to-br ${headerGradient} border-b border-white/5 relative`}>
                <div className="flex items-center gap-3">
                    <div className="w-[50px] h-[50px] bg-black/60 border rounded-md p-1 relative shadow-inner"
                         style={{ borderColor: `${gradeColor}66` }}>
                        <img src={gemData.Icon} alt="" className="w-full h-full object-contain transform scale-105" />
                        <span className="absolute bottom-0 right-1 text-[10px] text-white font-black drop-shadow-md">
                            Lv.{gemData.Level}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <h4 style={{ color: gradeColor }} className="text-[14px] font-bold leading-tight drop-shadow-md tracking-tight truncate">
                            {itemName}
                        </h4>
                        <span style={{ color: gradeColor }} className="text-[11px] font-bold opacity-90">
                            {gradeName}
                        </span>
                        <span className="text-white/40 text-[10px] font-medium">{tierInfo}</span>
                    </div>
                </div>
            </div>

            {/* 본문 섹션: bg-transparent로 설정하여 뒷배경 비침 효과 극대화 */}
            <div className="p-3 space-y-3 bg-transparent">
                {/* 메인 효과 (보석 효과) */}
                <div className="space-y-2">
                    <div className="text-white/30 font-bold text-[10px] tracking-widest flex items-center gap-1.5 uppercase">
                        [보석 효과]
                    </div>
                    <div className="space-y-1.5">
                        {mainEffects.map((eff, i) => (
                            <p key={i} className="text-white/90 text-[11px] leading-relaxed font-medium break-words">
                                {highlightEffect(eff)}
                            </p>
                        ))}
                    </div>
                </div>

                {/* 추가 효과 (기본 공격력 등) */}
                {additionalEffect && (
                    <div className="pt-4 border-t border-white/5">
                        <div className="text-white/30 font-bold text-[10px] tracking-widest mb-1 flex items-center gap-1.5 uppercase">
                            [추가 효과]
                        </div>
                        <div className="">
                            <p className="text-white/90 leading-relaxed font-medium break-words text-[11px]">
                                {highlightEffect(additionalEffect)}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* 하단 마무리 데코 */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
    );
};

export default JewelryTooltip;