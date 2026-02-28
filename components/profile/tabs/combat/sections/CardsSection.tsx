import React, { useState } from "react";

type Props = {
  cards: any | null;
};

// Cards section shown under engravings.
export function CardsSection({ cards }: Props) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <section className="flex-1 space-y-4 px-0 sm:px-0">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2 px-4 sm:px-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
          <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
            카드
          </h1>
        </div>

        {cards?.Effects?.[0] && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">
              {cards.Effects[0].Items[cards.Effects[0].Items.length - 1].Name.split(" 6세트")[0]}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 px-4 sm:px-0">
        {cards?.Cards?.map((card: any, idx: number) => {
          const isSelected = selectedCard === card.Name;
          return (
            <div
              key={idx}
              onClick={() => setSelectedCard(isSelected ? null : card.Name)}
              className={`cursor-pointer rounded border transition-all duration-200 overflow-hidden group ${
                isSelected
                  ? "border-orange-500 ring-2 ring-orange-500/20 translate-y-[-4px]"
                  : "border-white/5 hover:border-white/20 hover:translate-y-[-2px]"
              }`}
            >
              <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden">
                <img
                  src={card.Icon}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isSelected ? "scale-110" : "group-hover:scale-105"
                  }`}
                  alt=""
                />
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full border-[0.5px] border-black/40 ${
                        i < (card.AwakeCount ?? 0)
                          ? "bg-yellow-400 shadow-[0_0_4px_#fbbf24]"
                          : "bg-zinc-800"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div
                className={`p-1 sm:p-1.5 text-center transition-colors ${
                  isSelected ? "bg-orange-600 text-white" : "bg-[#1c1c1c] text-zinc-400"
                }`}
              >
                <p className="text-[9px] sm:text-[11px] font-bold truncate">{card.Name}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="min-h-[100px] mt-2 sm:mt-4">
        <div
          className={`p-4 sm:p-5 bg-gradient-to-br from-zinc-800/40 to-zinc-950/60 sm:rounded-xl border-y sm:border transition-all duration-300 ${
            selectedCard ? "border-orange-500/40 bg-orange-500/5" : "border-white/5"
          }`}
        >
          <h3 className="text-[11px] sm:text-[12px] text-orange-400 font-black mb-3 flex items-center gap-2">
            <span
              className={`w-1 h-3 sm:w-1.5 sm:h-3.5 rounded-sm transition-colors ${
                selectedCard ? "bg-orange-500" : "bg-zinc-600"
              }`}
            />
            {cards?.Effects?.[0]?.Items?.[0]?.Name?.split(" 2세트")[0] ?? ""} 세트 효과
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 sm:gap-y-2">
            {cards?.Effects?.[0]?.Items?.map((item: any, i: number) => (
              <div
                key={i}
                className="flex flex-col py-2 border-b border-white/5 last:border-0 md:last:border-b"
              >
                <span className="text-[10px] sm:text-[11px] text-orange-300/80 font-bold mb-0.5">
                  {item.Name}
                </span>
                <span className="text-[11px] sm:text-[11.5px] text-zinc-300 leading-relaxed font-medium break-keep">
                  {item.Description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

