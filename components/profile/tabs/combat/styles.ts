// Shared styles for Combat tab sections.
// Keep this file UI-only: no business logic here.

export const gradeStyles: Record<
  string,
  {
    bg: string;
    border: string;
    text: string;
    glow?: string;
    accent: string;
  }
> = {
  일반: {
    bg: "bg-[linear-gradient(135deg,#232323_0%,#3a3a3a_100%)]",
    border: "border-white/10",
    text: "text-zinc-400",
    glow: "",
    accent: "bg-zinc-500",
  },
  고급: {
    bg: "bg-[linear-gradient(135deg,#18220b_0%,#33411a_100%)]",
    border: "border-[#48c948]/30",
    text: "text-[#4edb4e]",
    glow: "shadow-[#48c948]/5",
    accent: "bg-[#48c948]",
  },
  희귀: {
    bg: "bg-[linear-gradient(135deg,#111d2d_0%,#243d5c_100%)]",
    border: "border-[#00b0fa]/30",
    text: "text-[#33c2ff]",
    glow: "shadow-[#00b0fa]/10",
    accent: "bg-[#00b0fa]",
  },
  영웅: {
    bg: "bg-[linear-gradient(135deg,#201334_0%,#462b6d_100%)]",
    border: "border-[#ce43fb]/30",
    text: "text-[#d966ff]",
    glow: "shadow-[#ce43fb]/10",
    accent: "bg-[#ce43fb]",
  },
  전설: {
    bg: "bg-[linear-gradient(135deg,#362003_0%,#9e5f04_100%)]",
    border: "border-[#f99200]/40",
    text: "text-[#ffaa33]",
    glow: "shadow-[#f99200]/15",
    accent: "bg-[#f99200]",
  },
  유물: {
    bg: "bg-[linear-gradient(135deg,#341a09_0%,#a24407_100%)]",
    border: "border-[#fa5d00]/50",
    text: "text-[#ff7526]",
    glow: "shadow-[#fa5d00]/25 drop-shadow-[0_0_15px_rgba(250,93,0,0.35)]",
    accent: "bg-[#fa5d00]",
  },
  고대: {
    bg: "bg-[linear-gradient(135deg,#3d3325_0%,#dcc99e_100%)]",
    border: "border-[#e9d2a6]/40",
    text: "text-[#e9d2a6]",
    glow: "shadow-[#e9d2a6]/25 drop-shadow-[0_0_15px_rgba(233,210,166,0.3)]",
    accent: "bg-[#e9d2a6]",
  },
  에스더: {
    bg: "bg-[linear-gradient(135deg,#0c2e2c_0%,#2faba8_100%)]",
    border: "border-[#2edbd3]/60",
    text: "text-[#45f3ec]",
    glow: "shadow-[#2edbd3]/30 drop-shadow-[0_0_18px_rgba(46,219,211,0.4)]",
    accent: "bg-[#2edbd3]",
  },
};

export function getQualityColor(q: number) {
  if (q === 100) return "text-[#FF8000] border-[#FF8000]";
  if (q >= 90) return "text-[#CE43FB] border-[#CE43FB]";
  if (q >= 70) return "text-[#00B0FA] border-[#00B0FA]";
  if (q >= 30) return "text-[#00D100] border-[#00D100]";
  return "text-[#FF4040] border-[#FF4040]";
}

