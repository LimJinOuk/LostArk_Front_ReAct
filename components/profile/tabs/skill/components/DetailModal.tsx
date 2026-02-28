import React from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

import { getModalPosition } from "@/components/profile/tabs/skill/utils";
import { SkillHighlightText, TripodHighlightText } from "@/components/profile/tabs/skill/components/HighlightText";

type Props = {
  skillName?: string;
  skillType?: string;
  ManaCost?: string;
  cooldown?: string;
  specs?: string[];
  description?: string;
  anchorRect: DOMRect | null;
  isTripodOrRune?: boolean;
};

// Tooltip modal rendered via portal.
export function DetailModal({
  skillName = "",
  skillType = "",
  ManaCost = "",
  cooldown = "",
  specs = [],
  description = "",
  anchorRect,
  isTripodOrRune = false,
}: Props) {
  if (!anchorRect) return null;
  const { top, left } = getModalPosition(anchorRect);
  const cooldownValue =
    typeof cooldown === "string" ? cooldown.replace("재사용 대기시간", "").trim() : "";

  return createPortal(
    <div style={{ position: "absolute", top, left, zIndex: 10000, pointerEvents: "none" }}>
      <motion.div
        initial={{ opacity: 0, y: -5, x: "-50%", scale: 0.98 }}
        animate={{ opacity: 1, y: 12, x: "-50%", scale: 1 }}
        exit={{ opacity: 0, y: -5, x: "-50%", scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="w-64 bg-[#0c0c0e]/50 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl"
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0c0c0e]/50 border-l border-t border-white/10 rotate-45" />

        <div className="bg-white/5 p-3 border-b border-white/5 relative z-10">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-0.5">
              <h5 className="text-[13px] sm:text-[14px] font-bold text-white leading-tight break-keep">
                {skillName}
              </h5>
              {cooldownValue && (
                <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-400 font-medium">
                  <Clock size={11} className="shrink-0" />
                  <span>{cooldownValue}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
              {skillType && (
                <span className="text-[9px] sm:text-[10px] font-medium text-zinc-500">
                  [{skillType}]
                </span>
              )}
              {ManaCost && (
                <span className="text-[9px] sm:text-[10px] font-bold text-sky-400 whitespace-nowrap">
                  {ManaCost}
                </span>
              )}
            </div>
          </div>
        </div>

        {specs.length > 0 && (
          <div className="p-3 py-2 space-y-1 relative z-10">
            {specs.map((spec, idx) => {
              const [label, value] = spec.split(" : ");
              return (
                <div key={idx} className="flex justify-between text-[11px] sm:text-[12px]">
                  <span className="text-zinc-400">{label}</span>
                  <span className="text-cyan-100 font-semibold">{value || spec}</span>
                </div>
              );
            })}
          </div>
        )}

        {description && (
          <div className="p-3 pt-2 border-t border-white/5 bg-black/20 relative z-10">
            <p className="text-[10px] sm:text-[11px] text-zinc-300 leading-normal break-keep">
              {isTripodOrRune ? (
                <TripodHighlightText text={description} />
              ) : (
                <SkillHighlightText text={description} />
              )}
            </p>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

