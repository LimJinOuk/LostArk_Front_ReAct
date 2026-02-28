// Ark Passive payload builder for simulator submission.

export type ArkTab = "진화" | "깨달음" | "도약";

export type ArkPassiveLevelsPayload = {
  characterName: string;
  title?: string;
  nodes: Record<ArkTab, Record<string, number>>;
  points?: any;
};

function stripHtml(s: any): string {
  return String(s ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseArkTabFromEffect(effect: any): ArkTab | null {
  const s = stripHtml(`${effect?.Name ?? ""} ${effect?.Description ?? ""}`);
  if (s.includes("진화")) return "진화";
  if (s.includes("깨달음")) return "깨달음";
  if (s.includes("도약")) return "도약";
  return null;
}

function parseLvFromDesc(desc: string): number {
  const clean = stripHtml(desc);
  const n = Number(clean.match(/Lv\.(\d+)/)?.[1] ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function parseNodeNameFromDesc(desc: string, tab: ArkTab): string {
  let s = stripHtml(desc);

  // Remove Lv.
  s = s.replace(/Lv\.\d+/g, "").trim();
  // Remove tab label.
  s = s.replace(tab, "").trim();
  // Remove "n티어".
  s = s.replace(/^\s*\d+\s*티어\s*/g, "").trim();
  // Normalize spaces.
  s = s.replace(/\s+/g, " ").trim();

  return s;
}

export function buildArkPassivePayload(
  characterName: string,
  arkData: any
): ArkPassiveLevelsPayload {
  const nodes: Record<ArkTab, Record<string, number>> = {
    진화: {},
    깨달음: {},
    도약: {},
  };

  const effects = Array.isArray(arkData?.Effects) ? arkData.Effects : [];
  for (const eff of effects) {
    const tab = parseArkTabFromEffect(eff);
    if (!tab) continue;

    const lv = parseLvFromDesc(String(eff?.Description ?? ""));
    if (lv <= 0) continue;

    const nodeName = parseNodeNameFromDesc(String(eff?.Description ?? eff?.Name ?? ""), tab);
    if (!nodeName) continue;

    nodes[tab][nodeName] = lv;
  }

  const title = typeof arkData?.Title === "string" ? arkData.Title : undefined;

  return {
    characterName,
    title,
    nodes,
    points: arkData?.Points,
  };
}

