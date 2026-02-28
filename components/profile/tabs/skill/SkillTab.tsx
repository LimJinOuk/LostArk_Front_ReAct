import React, { useEffect, useMemo, useState } from "react";
import { Check, Copy, Loader2, ShieldAlert, Target, Zap } from "lucide-react";

import { TRANSFORMATION_KEYWORDS, SKILL_GRID } from "@/components/profile/tabs/skill/constants";
import { SkillRow } from "@/components/profile/tabs/skill/components/SkillRow";
import { Badge } from "@/components/profile/tabs/skill/components/Badge";

// Main Skill tab component (thin orchestrator).
export const SkillTab = ({ character }: { character: any }) => {
  const [normalSkills, setNormalSkills] = useState<any[]>([]);
  const [gems, setGems] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!character?.CharacterName) return;
    setLoading(true);

    Promise.all([
      fetch(`/combat-skills?name=${encodeURIComponent(character.CharacterName)}`).then((res) =>
        res.json()
      ),
      fetch(`/gems?name=${encodeURIComponent(character.CharacterName)}`).then((res) => res.json()),
    ])
      .then(([skillJson, gemJson]) => {
        const className = character.CharacterClassName;
        const keyword = TRANSFORMATION_KEYWORDS[className];
        const filtered = skillJson.filter((s: any) => s.SkillType !== 100 && s.SkillType !== 1);
        const trans = filtered.filter((s: any) => keyword && s.Tooltip?.includes(keyword));
        const normal = filtered.filter(
          (s: any) => s.Level > 1 && !trans.some((ts: any) => ts.Name === s.Name)
        );
        setNormalSkills(normal.sort((a: any, b: any) => b.Level - a.Level));
        setGems(gemJson);
      })
      .finally(() => setLoading(false));
  }, [character]);

  const summary = useMemo(() => {
    let counter = 0,
      stagger = 0,
      destruction = 0;
    normalSkills.forEach((s) => {
      const tooltip = s.Tooltip || "";
      if (tooltip.includes("카운터 : 가능") || tooltip.includes("카운터 : Yes")) counter++;
      if (tooltip.includes("무력화 :")) stagger++;
      if (tooltip.includes("부위 파괴 :")) destruction++;
    });
    return { counter, stagger, destruction };
  }, [normalSkills]);

  const handleCopyCode = async () => {
    try {
      const res = await fetch(`/skillcode?name=${encodeURIComponent(character.CharacterName)}`);
      const code = await res.text();
      await navigator.clipboard.writeText(code.trim());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mb-4" />
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
          Loading...
        </span>
      </div>
    );

  return (
    <section className="mt-4 pb-20 px-0 sm:px-2">
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 mb-4 px-4 sm:px-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Badge icon={<Zap size={10} />} color="purple" label="카운터" count={summary.counter} />
          <Badge
            icon={<ShieldAlert size={10} />}
            color="amber"
            label="무력화"
            count={summary.stagger}
          />
          <Badge
            icon={<Target size={10} />}
            color="orange"
            label="파괴"
            count={summary.destruction}
          />
        </div>

        <button
          onClick={handleCopyCode}
          className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl border transition-all h-9 sm:h-10 shadow-lg ${
            copySuccess
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : "border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:text-white"
          }`}
        >
          {copySuccess ? <Check size={14} /> : <Copy size={14} />}
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
            {copySuccess ? "복사 완료!" : "스킬 코드"}
          </span>
        </button>
      </div>

      <div className="bg-[#0d0d0f] sm:rounded-2xl border-y sm:border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="min-w-full sm:min-w-[600px] flex flex-col">
            <div
              className={`grid ${SKILL_GRID} gap-1 sm:gap-4 px-4 sm:px-6 py-4 bg-[#111113] border-b border-white/5 text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase items-center`}
            >
              <div>스킬</div>
              <div className="text-center">트라이포드</div>
              <div className="text-center">룬</div>
              <div className="text-right">젬</div>
            </div>

            {normalSkills.map((s) => {
              const matched = gems?.Effects?.Skills?.filter((gs: any) => gs.Name === s.Name) || [];
              const enhanced = matched.map((mg: any) => {
                const original = gems.Gems.find((g: any) => g.Slot === mg.GemSlot);
                return { ...mg, Icon: original?.Icon, Level: original?.Level, originalData: original };
              });
              return <SkillRow key={s.Name} skill={s} matchedGems={enhanced} />;
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

