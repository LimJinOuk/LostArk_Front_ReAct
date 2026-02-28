import React from "react";

type Props = {
  icon: React.ReactNode;
  color: string;
  label: string;
  count: number;
};

// Small stat badge row (counter/stagger/destruction).
export function Badge({ icon, color, label, count }: Props) {
  return (
    <div
      className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}
    >
      <span className={`text-${color}-400`}>{icon}</span>
      <span className={`text-[10px] sm:text-[11px] font-black text-${color}-200 whitespace-nowrap`}>
        {label} {count}
      </span>
    </div>
  );
}

