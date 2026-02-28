import type { GemKind } from "@/components/simulator/gems/constants";

// Extract skill name and effect type from a gem tooltip string.
export function extractGemEffect(tooltipStr: string) {
  try {
    const tooltipData = JSON.parse(tooltipStr);
    const elements = Object.values(tooltipData) as any[];
    const effectSection = elements.find(
      (el) =>
        el?.type === "ItemPartBox" &&
        (el?.value?.Element_000?.includes("효과") || el?.value?.Element_000?.includes("보석 효과"))
    );

    if (!effectSection) return { name: "", type: "" };

    const rawEffect = effectSection?.value?.Element_001 || "";
    const cleaned = String(rawEffect)
      .replace(/<[^>]*>?/gm, "")
      .replace(/<BR>/gi, " ")
      .trim();

    // Extract skill name.
    const skillMatch = cleaned.match(/\]\s*(.*?)\s*(피해|재사용)/);
    const name = skillMatch ? skillMatch[1].trim() : "";

    // 피해 증가 => damage, 재사용 감소 => cdr
    const type = cleaned.includes("피해") ? "damage" : "cdr";

    return { name, type };
  } catch {
    return { name: "", type: "" };
  }
}

// Infer gem kind from equipped gem payload (Name/Tooltip heuristics).
export function inferGemKindFromEquippedGem(gem: any): GemKind | null {
  if (!gem) return null;

  const directText = String(gem?.Name || "");

  let tooltipText = "";
  try {
    const t = typeof gem?.Tooltip === "string" ? JSON.parse(gem.Tooltip) : gem?.Tooltip;
    tooltipText = typeof t === "string" ? t : JSON.stringify(t);
  } catch {
    tooltipText = String(gem?.Tooltip || "");
  }

  const hay = (directText + " " + tooltipText).toLowerCase();

  // Order matters.
  if (hay.includes("광휘")) return "광휘";
  if (hay.includes("겁화")) return "겁화";
  if (hay.includes("작열")) return "작열";
  if (hay.includes("멸화")) return "멸화";
  if (hay.includes("홍염")) return "홍염";

  return null;
}

