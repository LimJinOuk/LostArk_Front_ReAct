import React, { useMemo, useState } from "react";

type Props = {
  avatars: any[];
};

// Right column section: Avatars (skin/inner toggle + tint info).
export function AvatarsSection({ avatars }: Props) {
  const [avatarViewMode, setAvatarViewMode] = useState<"skin" | "inner">("skin");

  const avatarTypes = useMemo(
    () => [
      "무기 아바타",
      "머리 아바타",
      "상의 아바타",
      "하의 아바타",
      "얼굴1 아바타",
      "얼굴2 아바타",
      "악기 아바타",
      "이동 효과",
    ],
    []
  );

  const displayAvatars = useMemo(() => {
    return avatarTypes
      .map((type) => {
        const parts = avatars.filter((a) => a.Type === type);
        const innerAvatar = parts.find((a) => a.IsInner === true);
        const skinAvatar = parts.find((a) => a.IsInner === false);
        const active =
          avatarViewMode === "skin"
            ? skinAvatar || innerAvatar
            : innerAvatar || skinAvatar;
        return { type, active };
      })
      .filter((item) => item.active);
  }, [avatars, avatarTypes, avatarViewMode]);

  const totalInnerStat = useMemo(() => {
    return avatarTypes.reduce((acc, type) => {
      const parts = avatars.filter((a) => a.Type === type);
      const target = parts.find((a) => a.IsInner === true) || parts[0];
      if (target) {
        const match = target.Tooltip.match(/(?:힘|민첩|지능)\s*\+([\d.]+)%/);
        return acc + (match ? parseFloat(match[1]) : 0);
      }
      return acc;
    }, 0);
  }, [avatars, avatarTypes]);

  return (
    <section className="bg-[#121213] sm:rounded-xl border-y sm:border border-white/5 p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
          <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase leading-none">
            아바타
          </h1>

          <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 shadow-inner scale-90 sm:scale-100 origin-left">
            <button
              onClick={() => setAvatarViewMode("skin")}
              className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-md transition-all ${
                avatarViewMode === "skin"
                  ? "bg-sky-500 text-white"
                  : "text-zinc-500"
              }`}
            >
              덧입기
            </button>
            <button
              onClick={() => setAvatarViewMode("inner")}
              className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-md transition-all ${
                avatarViewMode === "inner"
                  ? "bg-amber-500 text-white"
                  : "text-zinc-500"
              }`}
            >
              본체
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 px-1 sm:px-3">
          <div className="w-1 h-3 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]" />
          <span className="text-[11px] sm:text-[12px] text-zinc-500 font-bold leading-none">
            힘민지 총합
          </span>
          <span className="text-[13px] sm:text-[14px] text-white font-black tracking-tight tabular-nums leading-none">
            {totalInnerStat.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        {displayAvatars.map(({ type, active }) => {
          const isLegendary = active.Grade === "전설";
          const statMatch = active.Tooltip.match(/(?:힘|민첩|지능)\s*\+([\d.]+)%/);

          let tintInfo: any[] = [];
          try {
            const tooltipData = JSON.parse(active.Tooltip);
            const tintGroup = Object.values(tooltipData).find(
              (el: any) => el?.type === "ItemTintGroup"
            ) as any;
            if (tintGroup?.value?.itemData) {
              tintInfo = Object.values(tintGroup.value.itemData);
            }
          } catch {
            // Ignore malformed tooltip.
          }

          return (
            <div
              key={type}
              className="flex flex-nowrap items-center justify-between px-1 sm:px-4 py-2 sm:py-1 group hover:bg-white/[0.02] border-b border-white/[0.03] last:border-0 min-w-0"
            >
              <div className="flex items-center min-w-0 gap-3 sm:gap-4 flex-1">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-lg overflow-hidden border-2 flex items-center justify-center ${
                    isLegendary
                      ? "border-orange-500/40 bg-gradient-to-br from-[#3e270a] to-zinc-900 shadow-[inset_0_0_8px_rgba(249,146,0,0.2)]"
                      : "border-purple-500/40 bg-gradient-to-br from-[#2a133d] to-zinc-900 shadow-[inset_0_0_8px_rgba(206,67,251,0.2)]"
                  }`}
                >
                  <img
                    src={active.Icon}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform group-hover:scale-110"
                    alt=""
                  />
                </div>

                <div className="flex flex-col justify-center min-w-0 overflow-hidden">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                    <span className="text-[9px] sm:text-[10px] text-zinc-500 font-black uppercase tracking-wider leading-none truncate">
                      {type}
                    </span>
                    <span
                      className={`text-[9px] sm:text-[10px] font-black leading-none ${
                        isLegendary ? "text-orange-400" : "text-purple-400"
                      }`}
                    >
                      {active.Grade}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p className="text-[13px] sm:text-[14px] font-bold text-[#efeff0] truncate leading-tight">
                      {active.Name}
                    </p>
                    <span className="text-[10px] sm:text-[11px] text-emerald-400 font-bold whitespace-nowrap leading-none">
                      {statMatch ? statMatch[0] : ""}
                    </span>
                  </div>
                </div>
              </div>

              {tintInfo.length > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2 ml-2 sm:ml-4 shrink-0 self-center">
                  {tintInfo.map((tint, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-center min-w-[36px] sm:min-w-[42px]">
                      <div
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm border border-white/20 shadow-sm shrink-0 mb-1"
                        style={{ backgroundColor: tint.baseColor }}
                      />
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] sm:text-[11px] text-zinc-500 font-mono uppercase tracking-tighter leading-none">
                          {String(tint.baseColor || "").replace("#", "")}
                        </span>
                        <div className="h-[12px] sm:h-[14px] flex items-center justify-center">
                          {tint.glossValue && tint.glossValue !== "0%" ? (
                            <span className="text-[8px] sm:text-[10px] text-sky-400/70 font-bold leading-none">
                              {tint.glossValue}
                            </span>
                          ) : (
                            <span className="invisible text-[8px] sm:text-[10px]">0%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

