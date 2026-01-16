// tooltipGetter.tsx
import { TOOLTIP_DB } from "./ArkPassiveTooltipData";
import type { ArkCategory, ArkTooltipEntry, TooltipLine } from "./ArkPassiveTooltipData";
import { makeTooltipKey } from "./tooltipKey";

function renderLine(line: TooltipLine, lv: number): string {
    let out = line.base;

    if (!line.values) return out;

    // {x}, {y} 같은 플레이스홀더 치환
    for (const [varName, table] of Object.entries(line.values)) {
        const v = table[lv] ?? table[Math.max(...Object.keys(table).map(Number))] ?? ""; // fallback
        out = out.replaceAll(`{${varName}}`, String(v));
    }

    return out;
}

export function getTooltip(category: ArkCategory, name: string, level: number, className?: string) {
    const key = makeTooltipKey(category, name, className);
    const entry: ArkTooltipEntry | undefined = TOOLTIP_DB[key];
    if (!entry) return null;

    const lv = Math.max(1, Math.min(level, entry.max));
    return entry.lines.map((line) => renderLine(line, lv));
}
