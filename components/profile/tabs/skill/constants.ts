// Shared constants for Skill tab.

export type GradeStyle = { bg: string; border: string; text: string };

export const gradeStyles: Record<string, GradeStyle> = {
  일반: { bg: "from-zinc-800 to-zinc-950", border: "border-white/10", text: "text-white" },
  고급: { bg: "from-[#1a2e1a] to-[#0a0f0a]", border: "border-[#48c948]/30", text: "text-[#48c948]" },
  희귀: { bg: "from-[#1a2a3e] to-[#0a0d12]", border: "border-[#00b0fa]/30", text: "text-[#00b0fa]" },
  영웅: { bg: "from-[#2e1a3e] to-[#120a1a]", border: "border-[#ce43fb]/30", text: "text-[#ce43fb]" },
  전설: { bg: "from-[#41321a] to-[#1a120a]", border: "border-[#f99200]/40", text: "text-[#f99200]" },
  유물: { bg: "from-[#351a0a] to-[#0a0a0a]", border: "border-[#fa5d00]/50", text: "text-[#fa5d00]" },
  고대: { bg: "from-[#3d3325] to-[#0f0f10]", border: "border-[#e9d2a6]/40", text: "text-[#e3c279]" },
  에스더: { bg: "from-[#0d2e2e] to-[#050505]", border: "border-[#2edbd3]/60", text: "text-[#2edbd3]" },
};

export const TRANSFORMATION_KEYWORDS: Record<string, string> = {
  블래스터: "[포격 모드]",
  데모닉: "[악마 스킬]",
  스카우터: "[싱크 스킬]",
  환수사: "[둔갑 스킬]",
  가디언나이트: "[화신 스킬]",
};

// Grid layout by breakpoint.
export const SKILL_GRID =
  "grid-cols-[1.5fr_100px_40px_1fr] " +
  "sm:grid-cols-[2fr_120px_100px_120px] " +
  "lg:grid-cols-[minmax(200px,1.5fr)_240px_100px_minmax(120px,1fr)]";

