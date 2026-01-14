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

    // --- [추가] 특정 단어를 감지하여 스타일을 입히는 함수 ---
    const highlightEffect = (text: string) => {
        const parts = text.split(/(\[.*?\])|(\d+(?:\.\d+)?%)|(?<=\] )(.*?)(?= 피해| 재사용)/g).filter(Boolean);

        return parts.map((part, i) => {
            const trimmedPart = part.trim();

            // 1. 수치 (% 포함) -> 초록색
            if (/\d+(?:\.\d+)?%/.test(part)) {
                return <span key={i} className="text-[#8de27a] font-bold">{part}</span>;
            }

            // 2. 직업명 ([블레이드]) -> 연한 회색
            if (part.startsWith('[') && part.endsWith(']')) {
                return <span key={i} className="text-zinc-400 mr-1">{part}</span>;
            }

            // 3. 스킬명 판단 (직업명 뒤에 오는 텍스트 덩어리)
            // '피해', '재사용', '공격력', '증가' 등 기능어는 제외
            const isFunctionWord = /피해|재사용|대기시간|증가|감소|공격력|기본/.test(trimmedPart);

            // 직업명 바로 뒤에 오는 덩어리이거나 특정 키워드가 아닌 경우 노란색
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

    let headerGradient = "from-[#2a2e36] via-[#1c1e23] to-[#252d2d]";
    if (isAncient) headerGradient = "from-[#3d3325] via-[#1c1e23] to-[#1c1e23]";
    else if (isRelic) headerGradient = "from-[#412608] via-[#1c1e23] to-[#1c1e23]";
    else if (isLegendary) headerGradient = "from-[#362f1b] via-[#1c1e23] to-[#1c1e23]";

    const elements = Object.values(tooltipData) as any[];
    const effectSection = elements.find(el =>
        el?.type === "ItemPartBox" &&
        (el?.value?.Element_000?.includes("효과") || el?.value?.Element_000?.includes("보석 효과"))
    );

    const rawEffect = effectSection?.value?.Element_001 || "";
    const [mainEffectRaw, additionalEffectRaw] = rawEffect.split("추가 효과");
    const mainEffects = mainEffectRaw.split('\n').map(cleanText).filter(Boolean);
    console.log("mainEffects: ",mainEffects);
    const additionalEffect = cleanText(additionalEffectRaw);
    console.log("additionalEffect",additionalEffect);

    return (
        <div className="w-[340px] bg-[#1c1e23] border border-[#4d4d4d] shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden text-[13px] font-sans text-left">
            {/* 헤더 섹션 */}
            <div className={`p-4 bg-gradient-to-br ${headerGradient} border-b border-white/5 relative`}>
                <span className="absolute top-4 right-4 text-[#8de27a] font-medium text-[11px] drop-shadow-md">장착중</span>
                <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-black border rounded-md p-1.5 relative shadow-inner"
                         style={{ borderColor: `${gradeColor}66` }}>
                        <img src={gemData.Icon} alt="" className="w-full h-full object-contain transform scale-105" />
                        <span className="absolute bottom-0 right-1 text-[10px] text-white font-bold drop-shadow-md">
                            Lv.{gemData.Level}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <h4 style={{ color: gradeColor }} className="text-[17px] font-bold leading-tight drop-shadow-md tracking-tight">
                            {itemName}
                        </h4>
                        <span style={{ color: gradeColor }} className="text-[12px] font-medium opacity-90">
                            {gradeName}
                        </span>
                        <span className="text-zinc-400 text-[11px] font-medium">{tierInfo}</span>
                    </div>
                </div>
            </div>

            {/* 본문 섹션 */}
            <div className="p-4 space-y-5 bg-[#17191e]">
                {/* 메인 효과 (보석 효과) */}
                <div className="space-y-2">
                    <div className="text-[#a3dcff] font-bold text-[12px] flex items-center gap-1.5">
                        <span className="w-1 h-3 rounded-full" />
                        [보석 효과]
                    </div>
                    <div className="pl-2 space-y-1.5">
                        {mainEffects.map((eff, i) => (
                            <p key={i} className="text-[#eee] leading-relaxed font-medium">
                                {highlightEffect(eff)}
                            </p>
                        ))}
                    </div>
                </div>

                {/* 추가 효과 (기본 공격력 등) */}
                {additionalEffect && (
                    <div className="pt-3 border-t border-white/5">
                        <div className="text-[#a3dcff] font-bold text-[12px] mb-2 flex items-center gap-1.5">
                            <span className="w-1 h-3 rounded-full" />
                            [추가 효과]
                        </div>
                        <div className="pl-2">
                            <p className="text-[#eee] leading-relaxed font-medium">
                                {highlightEffect(additionalEffect)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JewelryTooltip;