import React, { useMemo, useState } from "react";
import { Diamond } from "lucide-react";

import engravingIconMap from "@/constants/engravingData/engravingsIdTable.json";
import { engravingDescToHtml } from "@/components/profile/tabs/combat/text";

type Props = {
  engravings: any;
};

const FALLBACK_ABILITY_STONE_ICON =
  "https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/game/ico_ability_stone_symbol.png";

function normalizeEngravingName(name: string) {
  return (name || "")
    .replace(/\[[^\]]*]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getEngravingIconUrl(name: string) {
  const key = normalizeEngravingName(name);
  return (engravingIconMap as Record<string, string>)[key] || "";
}

// Engraving section (list + details panel).
export function EngravingSection({ engravings }: Props) {
  const [engrHoverIdx, setEngrHoverIdx] = useState<number | null>(null);
  const [engrHoverName, setEngrHoverName] = useState<string | null>(null);
  const [engrHoverDesc, setEngrHoverDesc] = useState<string>("");

  const hoveredIconUrl = useMemo(
    () => (engrHoverName ? getEngravingIconUrl(engrHoverName) : ""),
    [engrHoverName]
  );

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-[#121213] sm:rounded-2xl border-y sm:border border-white/5 shadow-2xl p-0 sm:p-4">
      <div
        className="flex flex-col lg:flex-row gap-0 sm:gap-4 h-full w-full"
        onMouseLeave={() => {
          setEngrHoverIdx(null);
          setEngrHoverName(null);
          setEngrHoverDesc("");
        }}
      >
        <section className="w-full lg:basis-1/2 flex-1 bg-[#1c1c1e]/50 sm:rounded-xl border-b sm:border border-white/5 p-4 shadow-inner min-w-0">
          <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-4">
            <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
            <h1 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight uppercase">
              활성 각인
            </h1>
          </div>

          <div className="flex flex-col gap-1.5">
            {(engravings?.ArkPassiveEffects ?? []).map((eng: any, i: number) => {
              const n = typeof eng.Level === "number" ? eng.Level : 0;
              const m = typeof eng.AbilityStoneLevel === "number" ? eng.AbilityStoneLevel : 0;
              const iconUrl = getEngravingIconUrl(eng.Name);
              const stoneIcon = eng.AbilityStoneIcon || FALLBACK_ABILITY_STONE_ICON;

              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer border
                            ${
                              engrHoverIdx === i
                                ? "bg-white/10 border-white/10 shadow-md"
                                : "bg-transparent border-transparent hover:bg-white/[0.03]"
                            }`}
                  onMouseEnter={() => {
                    setEngrHoverIdx(i);
                    setEngrHoverName(eng.Name || null);
                    setEngrHoverDesc(eng.Description || "");
                  }}
                  onClick={() => {
                    setEngrHoverIdx(i);
                    setEngrHoverName(eng.Name || null);
                    setEngrHoverDesc(eng.Description || "");
                  }}
                >
                  <div className="flex items-center min-w-0 gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full overflow-hidden bg-black/60 border border-zinc-700">
                      <img src={iconUrl} alt={eng.Name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center gap-1 px-1 py-1 rounded-md shrink-0">
                      <Diamond size={12} className="text-[#f16022] fill-[#f16022]" />
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-zinc-500 text-[9px] font-bold uppercase">X</span>
                        <span className="text-white text-[14px] sm:text-[15px] font-black tabular-nums">
                          {n}
                        </span>
                      </div>
                    </div>
                    <span className="text-[#efeff0] font-bold text-[13px] sm:text-[14px] truncate">
                      {eng.Name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {m > 0 && (
                      <div className="flex items-center gap-1">
                        <img
                          src={stoneIcon}
                          alt="Stone"
                          className="w-3.5 h-4.5 brightness-125"
                        />
                        <span className="text-zinc-400 text-[8px] font-bold uppercase">Lv.</span>
                        <span className="text-[#00ccff] text-[13px] sm:text-[14px] font-black">
                          {m}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          className={`w-full lg:basis-1/2 flex-1 bg-[#1c1c1e]/50 sm:rounded-xl border-b sm:border border-white/5 p-4 min-h-[120px] lg:min-h-[400px] flex flex-col min-w-0 ${
            !engrHoverName && "hidden lg:flex"
          }`}
        >
          {engrHoverName ? (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl shrink-0">
                  <img src={hoveredIconUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-blue-400 text-[9px] font-black uppercase tracking-widest mb-0.5">
                    각인 효과
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                    {engrHoverName}
                  </h2>
                </div>
              </div>

              <div
                className="text-[13px] sm:text-[14px] leading-snug text-zinc-300 bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner"
                dangerouslySetInnerHTML={{ __html: engravingDescToHtml(engrHoverDesc) }}
              />
            </div>
          ) : (
            <div className="my-auto flex flex-col items-center justify-center space-y-2 opacity-20">
              <div className="w-10 h-10 rounded-full border border-dashed border-white flex items-center justify-center text-lg font-bold text-white">
                ?
              </div>
              <p className="text-xs font-medium text-white tracking-tight text-center">
                각인을 선택하여 상세 내용을 확인하세요
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

