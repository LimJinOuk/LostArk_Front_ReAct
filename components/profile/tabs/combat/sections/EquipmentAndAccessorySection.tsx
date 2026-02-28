import React, { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";

import EquipmentTooltip from "@/components/profile/Tooltip/EquipmentTooltip.tsx";
import AccessoryTooltip from "@/components/profile/Tooltip/AccessoryTooltip.tsx";
import { cleanText } from "@/components/profile/tabs/combat/text";
import { getQualityColor, gradeStyles } from "@/components/profile/tabs/combat/styles";

type EquipmentLike = {
  Type: string;
  Name: string;
  Icon: string;
  Grade: string;
  Tooltip: string;
};

type Props = {
  equipments: EquipmentLike[];
};

// Top section of Combat tab: equipments & accessories lists.
export function EquipmentAndAccessorySection({ equipments }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredData, setHoveredData] = useState<any>(null);

  const [accHoverIdx, setAccHoverIdx] = useState<number | null>(null);
  const [accHoverData, setAccHoverData] = useState<any>(null);

  // Mobile modal states.
  const [selectedEquip, setSelectedEquip] = useState<any>(null);
  const [selectedAcc, setSelectedAcc] = useState<any>(null);

  const itemsByType = useMemo(() => {
    const map = new Map<string, EquipmentLike[]>();
    for (const item of equipments) {
      const arr = map.get(item.Type) ?? [];
      arr.push(item);
      map.set(item.Type, arr);
    }
    return map;
  }, [equipments]);

  const getItemsByType = (types: string[]) =>
    types.flatMap((t) => itemsByType.get(t) ?? []);

  return (
    <section className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 items-stretch bg-[#121213] p-3 sm:p-5 rounded-none sm:rounded-2xl border-y sm:border border-white/5">
      {/* [Left: Equipments] */}
      <div className="w-full lg:w-[38%] flex flex-col shrink-0">
        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-1 mx-1">
          <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
          <h1 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight uppercase">
            전투 장비 & 스톤
          </h1>
        </div>

        <div className="flex flex-col">
          {getItemsByType([
            "무기",
            "투구",
            "상의",
            "하의",
            "장갑",
            "어깨",
            "어빌리티 스톤",
          ])
            .sort((a, b) => {
              if (a.Type === "어빌리티 스톤") return 1;
              if (b.Type === "어빌리티 스톤") return -1;
              return a.Type === "무기" ? -1 : b.Type === "무기" ? 1 : 0;
            })
            .map((item, i) => {
              let tooltip: any;
              try {
                tooltip = JSON.parse(item.Tooltip);
              } catch {
                return null;
              }

              const isStone = item.Type === "어빌리티 스톤";
              const isEsther = item.Grade === "에스더";
              const quality = tooltip?.Element_001?.value?.qualityValue ?? -1;
              const reinforceLevel = item.Name.match(/\+(\d+)/)?.[0] || "";
              const itemName = cleanText(item.Name).replace(/\+\d+\s/, "");

              const rawGrade = (item.Grade || "").trim();
              let currentGrade = "일반";
              if (rawGrade.includes("에스더") || item.Name.includes("에스더"))
                currentGrade = "에스더";
              else if (rawGrade.includes("고대")) currentGrade = "고대";
              else if (rawGrade.includes("유물")) currentGrade = "유물";
              else if (rawGrade.includes("전설")) currentGrade = "전설";
              const isTremble = item.Name?.includes("전율");

              const theme = (gradeStyles as any)[currentGrade] || gradeStyles["일반"];
              let advancedReinforce = "0";
              const advMatch = cleanText(tooltip?.Element_005?.value || "").match(
                /\[상급\s*재련\]\s*(\d+)단계/
              );
              if (advMatch) advancedReinforce = advMatch[1];

              let stoneStats = "";
              if (isStone) {
                const stoneData = Object.values(
                  tooltip?.Element_007?.value?.Element_000?.contentStr || {}
                ) as any[];
                stoneStats = stoneData
                  .filter((el) => el.contentStr.includes("Lv."))
                  .map((el) => el.contentStr.match(/Lv\.(\d+)/)?.[1] || "0")
                  .join(" ");
              }

              return (
                <div
                  key={item.Name}
                  onMouseEnter={() => {
                    if (window.innerWidth >= 640) {
                      setHoveredIndex(i);
                      setHoveredData(tooltip);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setHoveredData(null);
                  }}
                  onClick={() => {
                    if (window.innerWidth < 640) {
                      setSelectedEquip(tooltip);
                    }
                  }}
                  className="relative group flex items-center gap-2 sm:gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors h-[60px] cursor-default sm:cursor-default"
                >
                  <div className="relative shrink-0">
                    <div
                      className={`p-0.5 rounded-lg border shadow-lg ${theme.bg} ${theme.border} ${
                        theme.glow || ""
                      }`}
                    >
                      <img
                        src={item.Icon}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-md object-cover bg-black/20"
                        alt={itemName}
                      />
                    </div>

                    {!isStone && !isTremble && !isEsther && (
                      <img
                        src="https://cdn-lostark.game.onstove.com/2018/obt/assets/images/m/profile/bg_equipment_arkpassive.png?7ec4e78756613ad562c4"
                        className="absolute inset-0 w-full h-full pointer-events-none z-10 scale-[1.15]"
                        alt="Ancient Frame"
                      />
                    )}

                    {isTremble && (
                      <img
                        src="https://cdn-lostark.game.onstove.com/2018/obt/assets/images/common/game/bg_equipment_petBorder.png?cf40f871847e238f7644"
                        className="absolute inset-0 w-full h-full pointer-events-none z-20 scale-[1.1]"
                        alt="Tremble Frame"
                      />
                    )}

                    {quality !== -1 && (
                      <div
                        className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(
                          quality
                        )} bg-zinc-900 text-[#e9d2a6] z-30`}
                      >
                        {quality}
                      </div>
                    )}

                    {hoveredIndex === i && hoveredData && (
                      <div
                        className="absolute left-full top-0 z-[9999] pointer-events-none hidden sm:flex"
                        style={{ paddingLeft: "10px" }}
                      >
                        <EquipmentTooltip data={hoveredData} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-bold text-[11px] sm:text-[13px] truncate ${theme.text}`}
                    >
                      {itemName}
                    </h3>
                    <div className="flex items-center gap-2">
                      {isStone ? (
                        <span className="text-blue-400 text-[11px] font-bold">
                          세공 {stoneStats}
                        </span>
                      ) : (
                        <>
                          <span
                            className={`text-[11px] font-bold ${
                              isEsther ? theme.text : "text-white/50"
                            }`}
                          >
                            {isEsther ? `진화 ${reinforceLevel}` : `재련 ${reinforceLevel}`}
                          </span>

                          {!isEsther && advancedReinforce !== "0" && (
                            <span className="text-sky-400 text-[11px] font-bold">
                              상재 +{advancedReinforce}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <AnimatePresence>
          {selectedEquip && (
            <EquipmentTooltip data={selectedEquip} onClose={() => setSelectedEquip(null)} />
          )}
        </AnimatePresence>
      </div>

      {/* [Right: Accessories] */}
      <div className="w-full lg:flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 border-b border-zinc-800/50 pb-4 mb-1 mx-1">
          <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
          <h1 className="text-[14px] sm:text-[15px] font-extrabold text-white tracking-tight uppercase">
            악세사리
          </h1>
        </div>

        <div className="flex flex-col">
          {getItemsByType(["목걸이", "귀걸이", "반지", "팔찌"])
            .filter((item) => {
              try {
                const tooltip = JSON.parse(item.Tooltip);
                if (item.Name?.includes("팔찌")) return true;
                return (tooltip.Element_001?.value?.qualityValue ?? 0) !== -1;
              } catch {
                return false;
              }
            })
            .map((item, i) => {
              const tooltip = JSON.parse(item.Tooltip);
              const isBracelet = item.Name?.includes("팔찌");
              const quality = tooltip.Element_001?.value?.qualityValue ?? 0;
              const itemName = item.Name || "아이템 이름";
              const rawGrade = (item.Grade || "").trim();

              let currentGrade = "일반";
              if (rawGrade.includes("고대")) currentGrade = "고대";
              else if (rawGrade.includes("유물")) currentGrade = "유물";
              else if (rawGrade.includes("전설")) currentGrade = "전설";

              const theme = (gradeStyles as any)[currentGrade] || gradeStyles["일반"];
              const passive =
                cleanText(tooltip.Element_007?.value?.Element_001 || "").match(/\d+/)?.[0] ||
                "0";
              const tier =
                (tooltip.Element_001?.value?.leftStr2 || "")
                  .replace(/[^0-9]/g, "")
                  .slice(-1) || "4";

              const rawContent = cleanText(
                isBracelet
                  ? tooltip.Element_005?.value?.Element_001
                  : tooltip.Element_006?.value?.Element_001 ||
                      tooltip.Element_005?.value?.Element_001 ||
                      ""
              );

              const allEffects = [...rawContent.matchAll(/([가-힣\s]+?)\s*\+([\d.]+%?)/g)].map(
                (m) => ({
                  name: m[1].trim(),
                  value: m[2],
                })
              );

              const displayEffects = isBracelet
                ? allEffects.filter((e) => e.name === "특화" || e.name === "치명")
                : allEffects;

              const shortNames: Record<string, string> = {
                "추가 피해": "추피",
                "적에게 주는 피해": "적주피",
                "치명타 적중률": "치적",
                "치명타 피해": "치피",
                공격력: "공격력",
                "무기 공격력": "무공",
                낙인력: "낙인력",
                "파티원 회복 효과": "파티회복",
                "파티원 보호막 효과": "파티보호",
                "아군 공격력 강화 효과": "아공강",
                "아군 피해량 강화 효과": "아피강",
                "최대 생명력": "최생",
                "최대 마나": "최마",
                "전투 중 생명력 회복량": "전투회복",
                "상태이상 공격 지속시간": "상태이상",
                "세레나데, 신앙, 조화 게이지 획득량": "서포터 아덴 획득량",
              };

              const getDynamicColor = (name: string, valueStr: string) => {
                if (valueStr === "-" || !valueStr) return "text-white/20";
                if (isBracelet && (name === "특화" || name === "치명"))
                  return "text-white-500 font-black";
                const num = parseFloat(valueStr.replace(/[^0-9.]/g, ""));
                const isPercent = valueStr.includes("%");

                const thresholds: Record<
                  string,
                  { 상: number; 중: number; 하: number }
                > = {
                  "추가 피해": { 상: 2.6, 중: 1.6, 하: 0.6 },
                  "적에게 주는 피해": { 상: 2.0, 중: 1.2, 하: 0.55 },
                  "치명타 적중률": { 상: 1.55, 중: 0.95, 하: 0.4 },
                  "치명타 피해": { 상: 4.0, 중: 2.4, 하: 1.1 },
                  "조화 게이지 획득량": { 상: 2.6, 중: 1.6, 하: 0.6 },
                  낙인력: { 상: 2.6, 중: 1.6, 하: 0.6 },
                  "파티원 회복 효과": { 상: 2.6, 중: 1.6, 하: 0.6 },
                  "파티원 보호막 효과": { 상: 2.6, 중: 1.6, 하: 0.6 },
                  "아군 공격력 강화 효과": { 상: 2.6, 중: 1.6, 하: 0.6 },
                  "아군 피해량 강화 효과": { 상: 2.6, 중: 1.6, 하: 0.6 },
                  "공격력_PCT": { 상: 1.55, 중: 0.95, 하: 0.4 },
                  "공격력_FIXED": { 상: 390, 중: 195, 하: 80 },
                  "무기 공격력_PCT": { 상: 3.0, 중: 1.8, 하: 0.8 },
                  "무기 공격력_FIXED": { 상: 960, 중: 480, 하: 195 },
                  "최대 생명력": { 상: 4000, 중: 2400, 하: 1100 },
                  "최대 마나": { 상: 45, 중: 27, 하: 12 },
                  "상태이상 공격 지속시간": { 상: 2.6, 중: 1.6, 하: 0.6 },
                  "전투 중 생명력 회복량": { 상: 125, 중: 75, 하: 34 },
                };

                let targetKey = name;
                if (name === "공격력") targetKey = isPercent ? "공격력_PCT" : "공격력_FIXED";
                else if (name === "무기 공격력")
                  targetKey = isPercent ? "무기 공격력_PCT" : "무기 공격력_FIXED";

                const criteria = thresholds[targetKey];
                if (!criteria) return "text-zinc-500";
                if (num >= criteria.상) return "text-yellow-400 font-black";
                if (num >= criteria.중) return "text-purple-400 font-bold";
                return "text-blue-400 font-medium";
              };

              return (
                <div
                  key={i}
                  onMouseEnter={() => {
                    if (window.innerWidth >= 640) {
                      setAccHoverIdx(i);
                      setAccHoverData(tooltip);
                    }
                  }}
                  onMouseLeave={() => {
                    setAccHoverIdx(null);
                    setAccHoverData(null);
                  }}
                  onClick={() => {
                    if (window.innerWidth < 640) {
                      setSelectedAcc(tooltip);
                    }
                  }}
                  className="relative group flex items-center gap-2 sm:gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors h-[60px] cursor-default sm:cursor-default min-w-0"
                >
                  <div className="relative shrink-0">
                    <div className={`p-0.5 rounded-lg border shadow-lg ${theme.bg} ${theme.border}`}>
                      <img
                        src={item.Icon}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-md object-cover bg-black/20"
                        alt=""
                      />
                    </div>

                    {!isBracelet && (
                      <img
                        src="https://cdn-lostark.game.onstove.com/2018/obt/assets/images/m/profile/bg_equipment_arkpassive2.png?92f5ec3202abd4dd371d"
                        className="absolute inset-0 w-full h-full pointer-events-none z-10 scale-[1.15]"
                        alt="Accessory Frame"
                      />
                    )}

                    {!isBracelet && (
                      <div
                        className={`absolute -bottom-1 -right-1 px-1 rounded-md text-[10px] font-black border ${getQualityColor(
                          quality
                        )} bg-zinc-900 ${theme.text} z-30`}
                      >
                        {quality}
                      </div>
                    )}

                    {accHoverIdx === i && accHoverData && (
                      <div
                        className="absolute left-full top-0 z-[9999] pointer-events-none hidden sm:flex"
                        style={{ paddingLeft: "10px" }}
                      >
                        <AccessoryTooltip
                          data={accHoverData}
                          className="!static !mt-0 !left-0 shadow-2xl"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-[11px] sm:text-[13px] truncate ${theme.text}`}>
                      {itemName}
                    </h3>
                    <div className="flex gap-1.5 text-[11px]">
                      <span className="text-orange-400 font-bold">깨달음 +{passive}</span>
                      <span className="text-white/80">{tier}T</span>
                    </div>
                  </div>

                  <div className="w-[85px] sm:w-[100px] flex flex-col justify-center items-end border-l border-white/5 pl-2 shrink-0 overflow-hidden">
                    {(isBracelet ? [0, 1] : [0, 1, 2]).map((idx) => {
                      const targetEffect = displayEffects[idx];
                      const rawName = targetEffect?.name || "";
                      const val = targetEffect?.value || "-";
                      const dispName = shortNames[rawName] || rawName || "-";

                      return (
                        <div
                          key={idx}
                          className="flex justify-between w-full text-[11px] font-semi-bold leading-tight items-center"
                        >
                          <span className="text-white/40 truncate shrink mr-1">{dispName}</span>
                          <span className={`${getDynamicColor(rawName, val)} whitespace-nowrap shrink-0`}>
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          <div className="flex items-center gap-4 p-2.5 rounded-xl border border-white/5 h-[60px] text-[10px] px-4 text-white/50">
            팔찌 효율 계산 행
          </div>
        </div>

        <AnimatePresence>
          {selectedAcc && <AccessoryTooltip data={selectedAcc} onClose={() => setSelectedAcc(null)} />}
        </AnimatePresence>
      </div>
    </section>
  );
}

