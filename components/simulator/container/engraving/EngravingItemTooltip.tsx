import React from 'react';

interface EngravingTooltipProps {
    hoverName: string | null;
    hoverDesc: string;
    getIconUrl: (name: string) => string;
    engravingDescToHtml: (desc: string) => string;
}

const EngravingTooltip: React.FC<EngravingTooltipProps> = ({
                                                               hoverName,
                                                               hoverDesc,
                                                               getIconUrl,
                                                               engravingDescToHtml,
                                                           }) => {
    return (
        <section className={`w-full lg:basis-1/2 flex-1 bg-[#1c1c1e]/50 sm:rounded-xl border-b sm:border border-white/5 p-4 min-h-[120px] lg:min-h-[400px] flex flex-col min-w-0 ${!hoverName && 'hidden lg:flex'}`}>
            {hoverName ? (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl shrink-0">
                            <img src={getIconUrl(hoverName)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-0.5">각인 효과</div>
                            <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">{hoverName}</h2>
                        </div>
                    </div>

                    <div
                        className="text-[13px] sm:text-[14px] leading-snug text-zinc-300 bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner"
                        dangerouslySetInnerHTML={{ __html: engravingDescToHtml(hoverDesc) }}
                    />
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