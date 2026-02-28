import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";

import ArkCoreTooltip from "@/components/profile/Tooltip/ArkCoreTooltip.tsx";
import { gradeStyles } from "@/components/profile/tabs/combat/styles";

type Props = {
  arkGrid: any | null;
};

// Middle section of Combat tab: Ark Grid (left) + Gem Effects (right).
export function ArkGridAndGemEffectSection({ arkGrid }: Props) {
  const [arkCoreHoverIdx, setArkCoreHoverIdx] = useState<number | null>(null);
  const [arkCoreHoverData, setArkCoreHoverData] = useState<any>(null);
  const [selectedArkGrid, setSelectedArkGrid] = useState<any>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 items-start px-0">
      {/* [Left box] Ark Grid */}
      <section className="bg-[#121213] pt-5 pb-2 px-4 sm:px-5 rounded-none sm:rounded-2xl border-y sm:border border-white/5 shadow-2xl flex flex-col h-fit relative">
        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-1 mx-1">
          <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
          <h1 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight uppercase">
            아크 그리드
          </h1>
        </div>

        <div className="flex flex-col gap-0.5 mb-0">
          {arkGrid?.Slots?.map((slot: any, i: number) => {
            const nameParts = slot.Name.split(/\s*:\s*/);
            const category = nameParts[0];
            const subName = nameParts[1];

            const rawGrade = (slot.Grade || "").trim();
            let currentGrade = "일반";
            if (rawGrade.includes("고대")) currentGrade = "고대";
            else if (rawGrade.includes("유물")) currentGrade = "유물";
            else if (rawGrade.includes("전설")) currentGrade = "전설";
            else if (rawGrade.includes("영웅")) currentGrade = "영웅";

            const theme = (gradeStyles as any)[currentGrade] || gradeStyles["일반"];

            // Parse tooltip once per row render.
            const parsedTooltip =
              typeof slot.Tooltip === "string" ? JSON.parse(slot.Tooltip) : slot.Tooltip;

            return (
              <div
                key={i}
                className="relative group flex items-center gap-3 rounded-xl hover:bg-white/[0.04] transition-all h-[62px] cursor-help px-1 sm:px-2"
                onMouseEnter={() => {
                  setArkCoreHoverIdx(i);
                  setArkCoreHoverData({ core: parsedTooltip, gems: slot.Gems });
                }}
                onMouseLeave={() => {
                  setArkCoreHoverIdx(null);
                  setArkCoreHoverData(null);
                }}
                onClick={() => {
                  if (window.innerWidth < 640) {
                    setSelectedArkGrid({
                      core: parsedTooltip,
                      gems: slot.Gems,
                      point: slot.Point,
                    });
                  }
                }}
              >
                <div className="relative shrink-0">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl p-[2px] transition-all flex items-center justify-center ${theme.bg} overflow-hidden
                            border border-[#e9d2a6]/10 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]`}
                  >
                    <img
                      src={slot.Icon}
                      className="w-full h-full object-contain filter drop-shadow-md"
                      alt=""
                    />
                    {slot.Gems?.length > 0 && (
                      <div
                        className={`absolute bottom-0.5 right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-black/60 flex items-center justify-center shadow-md ${theme.accent}`}
                      >
                        <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_2px_#fff]" />
                      </div>
                    )}
                  </div>

                  {arkCoreHoverIdx === i && arkCoreHoverData && (
                    <div className="absolute left-full top-0 z-[100] pl-3 pointer-events-auto hidden sm:flex">
                      <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                        <ArkCoreTooltip
                          data={arkCoreHoverData.core}
                          Gems={arkCoreHoverData.gems}
                          currentPoint={slot.Point}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`text-[9.5px] sm:text-[10.5px] font-bold leading-tight opacity-70 ${theme.text}`}
                  >
                    {category}
                  </div>
                  <div className={`text-[12px] sm:text-[13px] font-extrabold mt-0.5 truncate ${theme.text}`}>
                    {subName}
                  </div>
                </div>

                <div className="shrink-0 text-right pr-1">
                  <span className={`text-[13px] sm:text-[14px] font-extrabold mt-0.5 truncate ${theme.text}`}>
                    {slot.Point}P
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedArkGrid && (
            <ArkCoreTooltip
              data={selectedArkGrid.core}
              Gems={selectedArkGrid.gems}
              currentPoint={selectedArkGrid.point}
              onClose={() => setSelectedArkGrid(null)}
            />
          )}
        </AnimatePresence>
      </section>

      {/* [Right box] Gem Effects */}
      <section className="bg-[#121213] p-4 sm:p-6 rounded-none sm:rounded-2xl border-y sm:border border-white/5 shadow-2xl flex flex-col h-full">
        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
          <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
          <h1 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight uppercase">
            젬 효과
          </h1>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">
          {arkGrid?.Effects?.map((effect: any, i: number) => {
            const cleaned = String(effect.Tooltip || "")
              .replace(/<[^>]*>?/gm, "")
              .replace(/\s*\+\s*$/, "");

            const splitPos = cleaned.lastIndexOf(" +");
            const desc = splitPos >= 0 ? cleaned.substring(0, splitPos) : cleaned;
            const val = splitPos >= 0 ? cleaned.substring(splitPos + 1) : "";

            return (
              <div key={i} className="flex flex-col gap-1 px-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-zinc-100 font-bold text-[12px] sm:text-[13px] break-keep">
                    {effect.Name}
                  </span>
                  <span className="bg-zinc-800/50 px-2 py-0.5 rounded text-zinc-400 text-[9px] font-black tracking-widest uppercase shrink-0">
                    Lv.{effect.Level}
                  </span>
                </div>
                <div className="text-[11px] sm:text-[12px] text-zinc-400 font-medium leading-relaxed break-keep">
                  {desc}{" "}
                  {val ? <span className="text-[#ffd200] font-bold ml-1">{val}</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

