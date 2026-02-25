import React from 'react';

interface EngravingTooltipProps {
    hoverName: string | null;
    hoverDesc: string;
    getIconUrl: (name: string) => string;
}

const EngravingTooltip: React.FC<EngravingTooltipProps> = ({
                                                               hoverName,
                                                               hoverDesc,
                                                               getIconUrl,
                                                           }) => {

    /**
     * 버그 수정 버전: HTML 태그를 처리하고 숫자에 색상을 입히는 함수
     */
    const renderStyledDescription = (text: string) => {
        if (!text) return null;

        // 1. HTML 태그 제거
        const cleanText = text.replace(/<[^>]*>?/gm, '');

        /**
         * 정규표현식 설명:
         * (\d+(?:\.\d+)?) : 숫자(소수점 포함)를 찾습니다.
         * (%?|회|개|명|초|m|분|레벨) : 숫자 바로 뒤에 붙는 단위들을 그룹화합니다.
         * ? : 위 단위가 없을 수도 있음을 의미합니다.
         */
        const parts = cleanText.split(/(\d+(?:\.\d+)?(?:%|회|개|명|초|m|분|레벨)?)/g);

        return parts.map((part, index) => {
            // 숫자로 시작하는 파트인지 확인
            if (part.match(/^\d/)) {
                const nextPart = parts[index + 1] || "";
                const isIncrease = nextPart.includes("증가")||nextPart.includes("강화");
                const isDecrease = nextPart.includes("감소");

                let textColor = "text-yellow-200"; // 기본 노란색
                if (isIncrease) textColor = "text-green-400";
                if (isDecrease) textColor = "text-red-400";

                return (
                    <span key={index} className={`font-bold ${textColor}`}>
                    {part}
                </span>
                );
            }
            return part;
        });
    };

    return (
        <section className={`w-full lg:basis-1/2 flex-1 bg-[#1c1c1e]/50 sm:rounded-xl border-b sm:border border-white/5 p-4 min-h-[120px] lg:min-h-[400px] flex flex-col min-w-0 ${!hoverName && 'hidden lg:flex'}`}>
            {hoverName ? (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl shrink-0">
                            <img src={getIconUrl(hoverName)} alt={hoverName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="text-blue-400 text-[11px] font-black uppercase tracking-widest mb-0.5">각인 효과</div>
                            <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">{hoverName}</h2>
                        </div>
                    </div>

                    {/* 수정된 부분: 원본 데이터의 HTML 스타일을 살리고 싶다면 아래 방식을 권장합니다 */}
                    <div className="text-[13px] sm:text-[14px] leading-relaxed text-zinc-300 bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner whitespace-pre-wrap">
                        {/* 방법 A: 기존 로직 유지 (태그 제거 후 재가공) */}
                        {renderStyledDescription(hoverDesc)}

                    </div>
                </div>
            ) : (
                <div className="my-auto flex flex-col items-center justify-center space-y-2 opacity-20">
                    <div className="w-10 h-10 rounded-full border border-dashed border-white flex items-center justify-center text-lg font-bold text-white">?</div>
                    <p className="text-xs font-medium text-white tracking-tight text-center">각인을 선택하여 상세 내용을 확인하세요</p>
                </div>
            )}
        </section>
    );
};

export default EngravingTooltip;