import React, { useState } from "react";
import { createPortal } from "react-dom";

import JewelryTooltip from "@/components/profile/Tooltip/JewelryTooltip";

type Props = {
  gem: any;
};

// Gem icon used in SkillRow (shows tooltip without scroll tracking).
export function GemItem({ gem }: Props) {
  const [isHover, setIsHover] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    setRect(e.currentTarget.getBoundingClientRect());
    setIsHover(!isHover);
  };

  return (
    <div
      className="relative flex flex-col items-center gap-0.5"
      onMouseEnter={(e) => {
        setRect(e.currentTarget.getBoundingClientRect());
        setIsHover(true);
      }}
      onMouseLeave={() => setIsHover(false)}
      onClick={handleInteraction}
    >
      <div className="relative group/gem cursor-help transition-transform hover:scale-110 active:scale-90">
        <img
          src={gem.Icon}
          className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]"
          alt="gem"
        />
        <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-black text-[8px] sm:text-[9px] px-1 rounded border border-white/10 font-black text-zinc-200">
          {gem.Level}
        </div>
      </div>

      {isHover &&
        gem.originalData &&
        rect &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: rect.bottom + window.scrollY + 8,
              left: Math.max(
                16,
                Math.min(
                  window.innerWidth - 296,
                  rect.left + window.scrollX + rect.width / 2 - 150
                )
              ),
              zIndex: 10000,
              pointerEvents: "none",
            }}
          >
            <div className="w-[280px] scale-[0.85] sm:scale-100 origin-top">
              <JewelryTooltip gemData={gem.originalData} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

