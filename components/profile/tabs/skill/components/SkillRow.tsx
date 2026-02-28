import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { cleanHtml } from "@/components/profile/tabs/skill/utils";
import { gradeStyles, SKILL_GRID } from "@/components/profile/tabs/skill/constants";
import { IconWithModal } from "@/components/profile/tabs/skill/components/IconWithModal";
import { GemItem } from "@/components/profile/tabs/skill/components/GemItem";

type Props = {
  skill: any;
  matchedGems: any[];
  isTrans?: boolean;
};

// A single row in the skill list.
export function SkillRow({ skill, matchedGems, isTrans }: Props) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const skillDetail = useMemo(() => {
    try {
      const sTooltip = JSON.parse(skill.Tooltip || "{}");
      let sType = "",
        sCooldown = "",
        sDesc = "",
        sMana = "";

      const specLines: string[] = [];
      const addedLines = new Set<string>();
      let tripods: any[] = [];

      Object.values(sTooltip).forEach((el: any) => {
        if (el?.type === "CommonSkillTitle") {
          sType = cleanHtml(el.value.name);
          sCooldown = cleanHtml(el.value.leftText);
        } else if (el?.type === "SingleTextBox" || el?.type === "MultiTextBox") {
          const rawText = typeof el.value === "string" ? el.value : el.value?.content || "";
          const text = cleanHtml(rawText);

          if (text.includes("마나") && text.includes("소모")) {
            const manaPart = text.split("|")[0].trim();
            if (manaPart && !sMana) sMana = manaPart;
          }

          text.split("\n").forEach((line) => {
            const l = line.trim();
            if (!l || l === "PvE" || l.includes("마나")) return;

            const keywords = ["공격 타입 :", "무력화 :", "부위 파괴 :", "슈퍼아머 :"];
            if (keywords.some((k) => l.includes(k)) && !addedLines.has(l)) {
              specLines.push(l);
              addedLines.add(l);
            } else if (l.includes("피해를") && l.length > 15 && !sDesc) {
              sDesc = l;
            }
          });
        } else if (el?.type === "TripodSkillCustom") {
          tripods = Object.values(el.value)
            .map((tp: any) => ({
              name: cleanHtml(tp.name),
              desc: cleanHtml(tp.desc),
              icon: tp.slotData?.iconPath,
            }))
            .filter((tp: any) => tp.name);
        }
      });

      return {
        skillName: skill.Name,
        skillType: sType,
        ManaCost: sMana,
        cooldown: sCooldown,
        specs: specLines,
        description: sDesc,
        tripods,
      };
    } catch {
      return {
        skillName: skill.Name,
        skillType: "",
        ManaCost: "",
        cooldown: "",
        specs: [],
        description: "",
        tripods: [],
      };
    }
  }, [skill]);

  const runeDetail = useMemo(() => {
    if (!skill.Rune) return null;
    try {
      const rTooltip = JSON.parse(skill.Rune.Tooltip || "{}");
      let rDesc = "";
      if (rTooltip.Element_003?.value?.Element_001) rDesc = cleanHtml(rTooltip.Element_003.value.Element_001);
      else if (rTooltip.Element_003?.value) rDesc = cleanHtml(rTooltip.Element_003.value);
      return {
        skillName: skill.Rune.Name,
        skillType: `${skill.Rune.Grade} 룬`,
        cooldown: "",
        specs: [],
        description: rDesc,
      };
    } catch {
      return {
        skillName: skill.Rune.Name,
        skillType: "스킬 룬",
        cooldown: "",
        specs: [],
        description: "",
      };
    }
  }, [skill.Rune]);

  const rStyle = gradeStyles[skill.Rune?.Grade] || gradeStyles["일반"];

  return (
    <motion.div
      layout
      className={`group relative grid ${SKILL_GRID} gap-1 sm:gap-4 px-3 sm:px-6 py-3 items-center border-b border-white/[0.03] transition-all hover:bg-white/[0.03] ${
        isTrans ? "bg-purple-500/[0.02]" : ""
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <IconWithModal
          active={hoverKey === "skill"}
          onToggle={(v: boolean) => setHoverKey(v ? "skill" : null)}
          modalData={skillDetail}
          isTripodOrRune={false}
        >
          <img
            src={skill.Icon}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border shadow-lg ${
              isTrans ? "border-purple-500/40" : "border-zinc-800"
            }`}
            alt=""
          />
        </IconWithModal>
        <div className="flex flex-col min-w-0">
          <h4 className={`text-[12px] sm:text-[14px] font-bold truncate ${isTrans ? "text-purple-200" : "text-zinc-100"}`}>
            {skill.Name}
          </h4>
          <span className="text-[9px] font-bold text-amber-500/80 sm:hidden">{skill.Level}레벨</span>
          <div className="hidden sm:block font-black text-[12px] sm:text-xs tracking-tighter text-amber-400">
            {skill.Level}레벨
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-1 sm:gap-2">
        {skillDetail.tripods.map((tp: any, i: number) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <IconWithModal
              active={hoverKey === `tp-${i}`}
              onToggle={(v: boolean) => setHoverKey(v ? `tp-${i}` : null)}
              modalData={{
                skillName: tp.name,
                description: tp.desc,
                skillType: "트라이포드",
                cooldown: "",
                specs: [],
              }}
              isTripodOrRune={true}
            >
              <img src={tp.icon} className="w-7 h-7 sm:w-9 sm:h-9 object-contain" alt="" />
            </IconWithModal>
            <span className="hidden sm:block text-[10px] sm:text-[11px] font-bold text-zinc-400 line-clamp-1 w-14 text-center">
              {tp.name}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        {skill.Rune ? (
          <div className="flex flex-col items-center gap-1">
            <IconWithModal
              active={hoverKey === "rune"}
              onToggle={(v) => setHoverKey(v ? "rune" : null)}
              modalData={runeDetail}
              isTripodOrRune={true}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg p-0.5 shadow-inner brightness-110 ${rStyle.bg}`}>
                <img src={skill.Rune.Icon} className="w-full h-full object-contain" alt="" />
              </div>
            </IconWithModal>
            <span className={`hidden sm:block text-[9px] sm:text-[11px] font-bold ${rStyle.text}`}>{skill.Rune.Name}</span>
          </div>
        ) : (
          <span className="text-zinc-800 text-xs">—</span>
        )}
      </div>

      <div className="flex justify-end gap-1 sm:gap-1.5">
        {matchedGems.map((gem, i) => (
          <GemItem key={i} gem={gem} />
        ))}
      </div>
    </motion.div>
  );
}

