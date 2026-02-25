import React from 'react';
import { Diamond } from 'lucide-react';

interface EngravingItemProps {
    eng: any;
    index: number;
    isHovered: boolean;
    // 기존 상태 변경 함수들을 부모로부터 전달받음
    onInteraction: (index: number, name: string | null, desc: string) => void;
    getIconUrl: (name: string) => string;
    fallbackStoneIcon: string;
}

const EngravingItem: React.FC<EngravingItemProps> = ({
                                                         eng,
                                                         index,
                                                         isHovered,
                                                         onInteraction,
                                                         getIconUrl,
                                                         fallbackStoneIcon,
                                                     }) => {
    const n = typeof eng.Level === "number" ? eng.Level : 0;
    const m = typeof eng.AbilityStoneLevel === "number" ? eng.AbilityStoneLevel : 0;
    const iconUrl = getIconUrl(eng.Name);
    const stoneIcon = eng.AbilityStoneIcon || fallbackStoneIcon;

    const handleAction = () => {
        onInteraction(index, eng.Name || null, eng.Description || "");
    };

    return (
        <div
            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer border
      ${isHovered ? 'bg-white/10 border-white/10 shadow-md' : 'bg-transparent border-transparent hover:bg-white/[0.03]'}`}
            onMouseEnter={handleAction}
            onClick={handleAction}
        >
            <div className="flex items-center min-w-0 gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full overflow-hidden bg-black/60 border border-zinc-700">
                    <img src={iconUrl} alt={eng.Name} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-1 px-1 py-1 rounded-md shrink-0">
                    <Diamond size={12} className="text-[#f16022] fill-[#f16022]" />
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-zinc-500 text-[9px] font-bold uppercase">X</span>
                        <span className="text-white text-[14px] sm:text-[15px] font-black tabular-nums">{n}</span>
                    </div>
                </div>
                <span className="text-[#efeff0] font-bold text-[13px] sm:text-[14px] truncate">{eng.Name}</span>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {m > 0 && (
                    <div className="flex items-center gap-1">
                        <img src={stoneIcon} alt="Stone" className="w-3.5 h-4.5 brightness-125" />
                        <span className="text-zinc-400 text-[8px] font-bold uppercase">Lv.</span>
                        <span className="text-[#00ccff] text-[13px] sm:text-[14px] font-black">{m}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EngravingItem;