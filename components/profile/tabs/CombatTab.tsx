import React, { useEffect, useState } from 'react';
import {Loader2, Hexagon, ShieldAlert, Zap} from 'lucide-react';

/* ================= 인터페이스 ================= */
// --장비 인터페이스
interface Equipment {
    Type: string;
    Name: string;
    Icon: string;
    Grade: string;
    Tooltip: string;
}

// --- 각인 인터페이스  ---
interface ArkGem {
    Icon: string;
    Grade: string;
    Tooltip: string;
}

interface ArkCore {
    Index: number;
    Name: string;
    Icon: string;
    Grade: string;
    Tooltip: string;
    Gems: ArkGem[] | null;
}

interface ArkGridData {
    Slots: ArkCore[];
    Effects: { Name: string; Level: number; Tooltip: string }[];
}

interface CardData {
    Cards: any[];
    Effects: any[];
}

/* ================= 컴포넌트 ================= */
export const CombatTab = ({ character }: { character: any }) => {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [arkGrid, setArkGrid] = useState<ArkGridData | null>(null); // 컴포넌트 내부로 이동
    const [engravings, setEngravings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [gems, setGems] = useState<any>(null);
    const [avatars, setAvatars] = useState<any[]>([]);
    const [cards, setCards] = useState<any[]>([]);
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [arkPassive, setArkPassive] = useState<any>(null);
    const [activePassiveTab, setActivePassiveTab] = useState('진화');


    const cleanText = (text: string) =>
        text ? text.replace(/<[^>]*>?/gm, '').trim() : '';

    /* ================= 데이터 로딩 ================= */
    useEffect(() => {
        if (!character?.CharacterName) return;
        setLoading(true);

        Promise.all([
            fetch(`/equipment?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/arkgrid?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/engravings?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/gems?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/avatars?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/cards?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/arkpassive?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json())
        ])
            .then(([eqData, arkData, engData, gemData, avatarData, cardData, passiveData]) => {
                setEquipments(Array.isArray(eqData) ? eqData : []);
                setArkGrid(arkData);
                setEngravings(engData);
                setGems(gemData); // 보석 데이터 저장
                setAvatars(Array.isArray(avatarData) ? avatarData : []);
                setCards(cardData);
                setArkPassive(passiveData);
            })
            .catch(err => console.error('데이터 로딩 실패:', err))
            .finally(() => setLoading(false));
    }, [character?.CharacterName]);

    /* ================= 유틸 ================= */
    const getItemsByType = (types: string[]) =>
        equipments.filter(i => types.includes(i.Type));

    const getQualityColor = (q: number) => {
        if (q === 100) return 'text-[#FF8000] border-[#FF8000]';
        if (q >= 90) return 'text-[#CE43FB] border-[#CE43FB]';
        if (q >= 70) return 'text-[#00B0FA] border-[#00B0FA]';
        if (q >= 30) return 'text-[#00D100] border-[#00D100]';
        return 'text-[#FF4040] border-[#FF4040]';
    };

    /* ================= 로딩 ================= */
    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8 mb-3" />
                <span className="text-zinc-500 text-sm">정보를 불러오는 중...</span>
            </div>
        );
    }

    /* 아크패시브 스타일 설정 */
    const passiveConfigs: any = {
        '진화': { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        '깨달음': { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        '도약': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    };

    /* ================= 렌더 ================= */
    return (
        <div className="flex flex-col lg:flex-row gap-10 p-6 bg-[#0f0f0f] text-zinc-300 min-h-screen max-w-[1800px] mx-auto">

            {/* 왼쪽 섹션: 장비 & 각인 & 아크패시브 */}
            <div className="flex-1 min-w-0 space-y-10">

                <section className="space-y-4">
                    <div className="flex justify-between items-end border-b border-zinc-800 pb-2">
                        <h2 className="text-xl font-bold text-white">전투 장비</h2>
                    </div>

                    <div className="grid gap-3">
                        {getItemsByType(['무기', '투구', '상의', '하의', '장갑', '어깨']).map((item, i) => {
                            let tooltip;
                            try {
                                tooltip = JSON.parse(item.Tooltip);
                            } catch (e) {
                                return null;
                            }

                            // 1. 기본 데이터 추출
                            const quality = tooltip?.Element_001?.value?.qualityValue ?? 0;
                            const reinforceLevel = item.Name.match(/\+(\d+)/)?.[0] || '';
                            const itemName = cleanText(item.Name).replace(/\+\d+\s/, '');
                            const itemLevel = cleanText(tooltip?.Element_001?.value?.leftStr2 || '').match(/레벨\s*([\d,]+)/)?.[1] || '';

                            // 2. 상급 재련 및 스탯 추출 (안전한 순회)
                            let advancedReinforce = "";
                            let weaponAtk = "";
                            let addDamage = "";

                            Object.values(tooltip).forEach((node: any) => {
                                if (!node?.value) return; // null 방지

                                const rawValue = typeof node.value === 'string' ? node.value : "";
                                const cleanedValue = cleanText(rawValue);

                                // 상급 재련 찾기
                                if (cleanedValue.includes("[상급 재련]")) {
                                    const match = cleanedValue.match(/\[상급\s*재련\]\s*(\d+)단계/);
                                    if (match) advancedReinforce = match[1];
                                }

                                // 무기 공격력 및 추가 피해
                                if (node.type === "ItemPartBox") {
                                    const title = cleanText(node.value?.Element_000 || "");
                                    const desc = cleanText(node.value?.Element_001 || "");
                                    if (title.includes("기본 효과")) weaponAtk = desc.match(/\d+/)?.[0] || "";
                                    if (title.includes("추가 효과")) addDamage = desc.match(/[\d.]+/)?.[0] || "";
                                }
                            });

                            return (
                                <div key={i} className="relative flex items-center gap-4 bg-[#1a1a1c] p-4 rounded-xl border border-white/5 hover:bg-[#222224] transition-all group shadow-lg overflow-hidden">

                                    {/* 아이콘 영역 */}
                                    <div className="relative shrink-0">
                                        <img src={item.Icon} className="w-16 h-16 rounded-lg border border-white/10 bg-zinc-900" alt="" />
                                    </div>

                                    {/* 정보 영역 */}
                                    <div className="flex-1 min-w-0">
                                        {/* 상단 라인: 강화/이름/상급재련 & LV */}
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-orange-500 font-black text-lg leading-none">{reinforceLevel}</span>
                                                    <h3 className="text-zinc-100 font-bold text-base truncate leading-none">
                                                        {itemName}
                                                    </h3>
                                                </div>

                                                {/* 품질 미니 게이지 바 (직관성 향상) */}
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                                                        <div
                                                            className={`h-full ${getQualityColor(quality)} shadow-[0_0_8px_rgba(0,0,0,0.3)]`}
                                                            style={{ width: `${quality}%`, backgroundColor: 'currentColor' }}
                                                        />
                                                    </div>
                                                    <span className={`text-[12px] font-black leading-none ${getQualityColor(quality)}`}>
                                                        {quality}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* 아이템 레벨 강조 (우측 상단) */}
                                            <div className="flex flex-col items-end">
                                                <span className="text-zinc-500 text-[9px] font-black uppercase tracking-tighter opacity-70">상급 재련</span>
                                                <span className="text-white font-black text-[18px] leading-none tracking-tight">
                                                    +{advancedReinforce}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 하단 데이터 요약 (무기 전용) */}
                                        {item.Type === "무기" && (
                                            <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/[0.03]">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-zinc-500 text-[11px]">공격력</span>
                                                    <span className="text-zinc-300 text-[12px] font-bold">+{Number(weaponAtk).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-auto">
                                                    <span className="text-sky-400/70 text-[11px]">추가 피해</span>
                                                    <span className="text-sky-400 text-[12px] font-black">{addDamage}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 2. 아크 그리드 (코어/젬) 섹션 추가 */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <h2 className="text-xl font-bold text-white">아크 패시브 코어</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {arkGrid?.Slots?.map((slot, i) => (
                            <div key={i} className="bg-[#181818] p-3 rounded border border-white/5 flex flex-col items-center text-center">
                                <img src={slot.Icon} className="w-12 h-12 mb-2" alt="" />
                                <span className="text-xs font-bold text-zinc-200">{slot.Name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. 활성 각인 섹션 */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <h2 className="text-xl font-bold text-white">활성 각인</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {arkGrid?.Effects?.map((engrave, i) => (
                            <div key={i} className="flex items-center gap-3 bg-[#181818] p-3 rounded border border-white/5">
                                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-yellow-500/20 text-yellow-500 font-bold text-xs">Lv.{engrave.Level}</div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[14px] text-zinc-100 font-bold truncate">{engrave.Name}</span>
                                    <div className="flex gap-1 mt-1">
                                        {[1, 2, 3].map((lv) => (
                                            <div key={lv} className={`h-1.5 w-6 rounded-full ${lv <= engrave.Level ? 'bg-yellow-500' : 'bg-zinc-700'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>


                <section className="w-full space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <h2 className="text-lg font-bold text-white">아바타</h2>
                        {/* 총 추가 능력치 계산 (본체 슬롯 기준) */}
                        {(() => {
                            // 각 부위별로 실제 적용되고 있는 능력치를 담을 변수
                            const slotTypes = ['무기 아바타', '머리 아바타', '상의 아바타', '하의 아바타'];

                            const totalStat = slotTypes.reduce((acc, type) => {
                                const parts = avatars.filter(a => a.Type === type);
                                // 1. 본체(IsInner: true)를 먼저 찾음
                                const main = parts.find(a => a.IsInner === true);
                                // 2. 본체가 없으면 덧입기(IsInner: false)를 찾음
                                const sub = parts.find(a => a.IsInner === false);

                                // 실제 적용 중인 아바타 선택
                                const activeAvatar = main || sub;

                                if (activeAvatar) {
                                    const match = activeAvatar.Tooltip.match(/(?:힘|민첩|지능)\s*\+([\d.]+)%/);
                                    return acc + (match ? parseFloat(match[1]) : 0);
                                }
                                return acc;
                            }, 0);

                            return (
                                <div className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                                    기본 특성 +{totalStat.toFixed(2)}%
                                </div>
                            );
                        })()}
                    </div>

                    {/* 세로 정렬을 위해 grid-cols-1로 설정하고 gap을 조절 */}
                    <div className="grid grid-cols-1 gap-2.5">
                        {['무기 아바타', '머리 아바타', '상의 아바타', '하의 아바타', '이동 효과'].map((type) => {
                            const parts = avatars.filter(a => a.Type === type);
                            const mainAvatar = parts.find(a => a.IsInner === true);  // 본체
                            const subAvatar = parts.find(a => a.IsInner === false); // 덧입기

                            // 본체나 덧입기 둘 중 하나라도 있으면 출력 (무기 아바타 누락 방지)
                            if (!mainAvatar && !subAvatar) return null;

                            // 이미지는 덧입기 우선, 없으면 본체
                            const displayAvatar = subAvatar || mainAvatar;
                            // 능력치는 본체 우선, 없으면 덧입기에서 추출
                            const statSource = mainAvatar || subAvatar;
                            const isLegendary = displayAvatar.Grade === "전설";

                            return (
                                <div key={type} className="group bg-[#181818] rounded-lg border border-white/5 p-3 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        {/* 아이콘 영역 */}
                                        <div className="relative shrink-0">
                                            <div className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center overflow-hidden ${
                                                isLegendary
                                                    ? 'border-orange-500/40 bg-gradient-to-br from-[#3e270a] to-zinc-900'
                                                    : 'border-purple-500/40 bg-gradient-to-br from-[#2a133d] to-zinc-900'
                                            }`}>
                                                <img src={displayAvatar.Icon} className="w-11 h-11 object-contain group-hover:scale-110 transition-transform" alt="" />
                                            </div>
                                            {/* 본체와 덧입기 둘 다 있을 때만 SKIN 뱃지 표시 */}
                                            {mainAvatar && subAvatar && (
                                                <div className="absolute -top-1 -right-1 bg-sky-500 text-[8px] font-black text-white px-1 rounded shadow-lg border border-sky-400/50">
                                                    SKIN
                                                </div>
                                            )}
                                        </div>

                                        {/* 정보 영역 */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{type}</span>
                                                <span className={`text-[10px] font-black ${isLegendary ? 'text-orange-400' : 'text-purple-400'}`}>
                                    {displayAvatar.Grade}
                                </span>
                                            </div>
                                            <p className="text-[14px] font-bold text-zinc-200 truncate mb-1">
                                                {displayAvatar.Name}
                                            </p>

                                            <div className="flex items-center justify-between">
                                <span className="text-[11px] text-emerald-400 font-bold">
                                    {statSource?.Tooltip.match(/(?:힘|민첩|지능)\s*\+[\d.]+%/)?.[0] || '효과 없음'}
                                </span>
                                                {/* 염색 정보 표시 */}
                                                {displayAvatar.Tooltip.includes("염색 정보") && (
                                                    <div className="flex gap-0.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 성향 요약 (세로 정렬일 때는 하단에 깔끔하게 배치) */}
                    <div className="mt-2 grid grid-cols-4 gap-1 p-2 bg-black/20 rounded-md border border-white/5">
                        {['지성', '담력', '매력', '친절'].map(stat => {
                            const total = avatars.reduce((acc, a) => {
                                const match = a.Tooltip.match(new RegExp(`&tdc_${stat === '지성' ? 'smart' : stat === '담력' ? 'courage' : stat === '매력' ? 'charm' : 'kind'}\\s${stat}\\s:\\s(\\d+)`));
                                return acc + (match ? parseInt(match[1]) : 0);
                            }, 0);
                            return (
                                <div key={stat} className="text-center py-1">
                                    <p className="text-[9px] text-zinc-500 uppercase">{stat}</p>
                                    <p className="text-[11px] font-bold text-zinc-300">+{total}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>
                    {/* [우측] 장착 카드 섹션 (가로 정렬) */}
                <section className="flex-1 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white">장착 카드</h2>
                            {selectedCard && (
                                <span className="text-[10px] text-orange-500 font-bold animate-pulse">
                    ● {selectedCard} 상세 보기 중
                </span>
                            )}
                        </div>
                        {cards?.Effects?.[0] && (
                            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-medium">
                    {cards.Effects[0].Items[cards.Effects[0].Items.length - 1].Name.split(' 6세트')[0]}
                </span>
                            </div>
                        )}
                    </div>

                    {/* 카드 6종 그리드 */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {cards?.Cards.map((card, idx) => {
                            const isSelected = selectedCard === card.Name;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedCard(isSelected ? null : card.Name)}
                                    className={`cursor-pointer rounded border transition-all duration-200 overflow-hidden group ${
                                        isSelected
                                            ? 'border-orange-500 ring-2 ring-orange-500/20 translate-y-[-4px]'
                                            : 'border-white/5 hover:border-white/20 hover:translate-y-[-2px]'
                                    }`}
                                >
                                    <div className="relative aspect-[3/4] bg-zinc-900 overflow-hidden">
                                        <img
                                            src={card.Icon}
                                            className={`w-full h-full object-cover transition-transform duration-500 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
                                            alt=""
                                        />
                                        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-1.5 h-1.5 rounded-full border-[1px] border-black/40 ${
                                                    i < card.AwakeCount ? 'bg-yellow-400 shadow-[0_0_4px_#fbbf24]' : 'bg-zinc-800'
                                                }`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`p-1.5 text-center transition-colors ${isSelected ? 'bg-orange-600 text-white' : 'bg-[#1c1c1c] text-zinc-400'}`}>
                                        <p className="text-[11px] font-bold truncate">{card.Name}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 카드 세트 효과 요약 배너 (조건부 렌더링) */}
                    <div className="min-h-[100px] transition-all duration-300">
                        {selectedCard ? (
                            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-zinc-900/50 rounded border border-orange-500/20 animate-in fade-in slide-in-from-top-2">
                                <h3 className="text-[12px] text-orange-400 font-black mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-3.5 bg-orange-500 rounded-sm"></span>
                                    {cards?.Effects[0]?.Items[0].Name.split(' 2세트')[0]} 세트 효과
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                                    {cards?.Effects[0]?.Items.map((item: any, i: number) => (
                                        <div key={i} className="flex flex-col py-1.5 border-b border-white/5">
                                            <span className="text-[11px] text-orange-300/80 font-bold mb-0.5">{item.Name}</span>
                                            <span className="text-[12px] text-zinc-200 leading-relaxed font-medium">{item.Description}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* 카드를 선택하지 않았을 때 보여줄 가이드 문구 */
                            <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                                <p className="text-zinc-500 text-sm font-medium">카드를 클릭하면 상세 세트 효과를 확인할 수 있습니다.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* ================= 2. 악세사리 섹션 ================= */}

            {/* 오른쪽 섹션: 장비 & 각인 & 아크패시브 */}
            <div className="flex-1 min-w-0 flex flex-col space-y-10">

                <section className="w-full">
                    <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
                        <h2 className="text-lg font-bold text-white">악세사리</h2>
                        <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            아크 패시브 ON
        </span>
                    </div>

                    <div className="space-y-3">
                        {getItemsByType(['목걸이', '귀걸이', '반지', '팔찌']).map((item, i) => {
                            const tooltip = JSON.parse(item.Tooltip);
                            const quality = tooltip.Element_001?.value?.qualityValue ?? 0;

                            // 데이터 파싱
                            const passive = cleanText(tooltip.Element_007?.value?.Element_001 || '').match(/\d+/)?.[0] || '0';
                            const statText = cleanText(tooltip.Element_004?.value?.Element_001 || '');
                            const mainStat = statText.match(/(?:힘|민첩|지능)\s*\+(\d+)/)?.[1] || '0';
                            const health = statText.match(/체력\s*\+(\d+)/)?.[1] || '0';

                            // 연마 효과 추출 (사진의 우측 3개 항목 대응)
                            const grindContent = cleanText(
                                tooltip.Element_006?.value?.Element_001 ||
                                tooltip.Element_005?.value?.Element_001 || ''
                            );
                            const effects = [...grindContent.matchAll(/([가-힣\s]+?)\s*\+([\d.]+%?)/g)]
                                .map(m => ({ name: m[1].trim(), value: m[2] }));

                            return (
                                <div key={i} className="bg-[#181818] border border-white/5 rounded-lg p-3 hover:border-white/10 transition-colors">
                                    <div className="flex gap-4">
                                        {/* 아이콘 영역 */}
                                        <div className="relative shrink-0">
                                            <img src={item.Icon} className="w-12 h-12 rounded bg-zinc-900 border border-white/10" alt="" />
                                            <div className={`absolute -bottom-1 -right-1 px-1 rounded text-[10px] font-black border ${getQualityColor(quality)} bg-zinc-900`}>
                                                {quality}
                                            </div>
                                        </div>

                                        {/* 3행 3열 그리드 영역 */}
                                        <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-x-4 gap-y-1">
                                            {/* 1열: 기본 스탯 (사진 좌측) */}
                                            <div className="flex justify-between items-center text-[12px]">
                                                <span className="text-zinc-500">깨달음</span>
                                                <span className="font-bold text-orange-400">+{passive}</span>
                                            </div>

                                            {/* 2열: 연마 효과 이름 (사진 중앙) */}
                                            <div className="text-[12px] text-zinc-300 truncate">
                                                {effects[0]?.name || '효과 없음'}
                                            </div>

                                            {/* 3열: 연마 효과 수치 (사진 우측) */}
                                            <div className="text-[12px] font-bold text-right text-orange-300">
                                                {effects[0] ? `${effects[0].value}` : '-'}
                                            </div>

                                            {/* 2행 */}
                                            <div className="flex justify-between items-center text-[12px]">
                                                <span className="text-zinc-500">주스탯</span>
                                                <span className="font-bold text-zinc-200">{mainStat}</span>
                                            </div>
                                            <div className="text-[12px] text-zinc-300 truncate">
                                                {effects[1]?.name || '-'}
                                            </div>
                                            <div className="text-[12px] font-bold text-right text-zinc-400">
                                                {effects[1] ? `+${effects[1].value}` : '0.00%'}
                                            </div>

                                            {/* 3행 */}
                                            <div className="flex justify-between items-center text-[12px]">
                                                <span className="text-zinc-500">생명력</span>
                                                <span className="font-bold text-sky-400">{health}</span>
                                            </div>
                                            <div className="text-[12px] text-zinc-300 truncate">
                                                {effects[2]?.name || '-'}
                                            </div>
                                            <div className="text-[12px] font-bold text-right text-orange-300">
                                                {effects[2] ? `${effects[2].value}` : '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 3. 활성 각인 (수치형 디자인) */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-white">
                        <h2 className="text-xl font-bold">활성 각인 (아크 패시브)</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {engravings?.ArkPassiveEffects?.map((eng: any, i: number) => {
                            const match = eng.Description.match(/[\d.]+%+/);
                            const percentValue = match ? match[0] : "";
                            return (
                                <div key={i} className="bg-[#181818] p-4 rounded border border-white/5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-zinc-100 font-bold">{eng.Name}</span>
                                                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1 rounded">Lv.{eng.AbilityStoneLevel}</span>
                                            </div>
                                            {eng.AbilityStoneLevel && <p className="text-[11px] text-zinc-500 mt-1 italic">스톤: {eng.Level}단계</p>}
                                        </div>
                                        <span className="text-lg font-black text-yellow-500">{percentValue}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* 4. 장착 보석 효과 섹션 (Description 태그 제거 로직 추가) */}
                <section className="space-y-4 mt-10">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-white">장착 보석 효과</h2>
                        </div>
                        {/* 수정 포인트: cleanText 유틸리티를 사용하여 HTML 태그 제거 */}
                        <div className="text-[12px] bg-sky-500/10 text-sky-400 px-3 py-1 rounded-full border border-sky-500/20 font-bold">
                            {gems?.Effects?.Description
                                ? gems.Effects.Description.replace(/<[^>]*>?/gm, '').trim()
                                : "기본 공격력 증가 정보 없음"}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(() => {
                            // 스킬 이름별로 그룹화
                            const groupedSkills = gems?.Effects?.Skills?.reduce((acc: any, current: any) => {
                                const existing = acc.find((item: any) => item.Name === current.Name);
                                if (existing) {
                                    existing.Gems.push(current);
                                } else {
                                    acc.push({
                                        Name: current.Name,
                                        Icon: current.Icon,
                                        Gems: [current]
                                    });
                                }
                                return acc;
                            }, []);

                            return groupedSkills?.map((skillGroup: any, i: number) => (
                                <div key={i} className="bg-[#181818] p-3 rounded border border-white/5 flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        {/* 보석 아이콘 나열 */}
                                        <div className="flex gap-1 shrink-0">
                                            {skillGroup.Gems.map((gem: any, idx: number) => (
                                                <div key={idx} className="relative">
                                                    <img src={gem.Icon} className="w-9 h-9 rounded border border-white/10" alt="" />
                                                    <div className="absolute -bottom-1 -right-1 bg-black/80 text-[9px] text-white px-1 rounded font-bold border border-zinc-700 leading-tight">
                                                        {gems.Gems.find((g: any) => g.Slot === gem.GemSlot)?.Level || '?'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[14px] text-zinc-100 font-bold truncate">{skillGroup.Name}</span>
                                        </div>
                                    </div>

                                    {/* 효과 정보 세로 나열 */}
                                    <div className="flex flex-col gap-1.5">
                                        {skillGroup.Gems.map((gem: any, gemIdx: number) => (
                                            <div key={gemIdx} className="space-y-1">
                                                {gem.Description.map((desc: string, descIdx: number) => {
                                                    const isDamage = desc.includes("피해");
                                                    return (
                                                        <div
                                                            key={descIdx}
                                                            className={`text-[11px] px-2 py-1.5 rounded border flex items-center gap-1.5 ${
                                                                isDamage
                                                                    ? 'bg-orange-500/5 text-orange-400 border-orange-500/10'
                                                                    : 'bg-sky-500/5 text-sky-400 border-sky-500/10'
                                                            }`}
                                                        >
                                                            <span className="text-[10px]">{isDamage ? '🔥' : '⏳'}</span>
                                                            <span className="flex-1 font-medium">{desc}</span>

                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </section>
                {/* 3. 아크 패시브 상세 섹션 */}
                <section className="space-y-4 pt-4">
                    {/* 헤더 및 탭 메뉴 */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-4 gap-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                            아크 패시브 상세
                        </h2>

                        <div className="flex bg-zinc-900 p-1 rounded-lg border border-white/5">
                            {['진화', '깨달음', '도약'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActivePassiveTab(tab)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                                        activePassiveTab === tab
                                            ? `${passiveConfigs[tab].bg} ${passiveConfigs[tab].color} shadow-sm`
                                            : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 포인트 요약 카드 */}
                    {arkPassive?.Points && (
                        <div className={`p-5 rounded-xl border ${passiveConfigs[activePassiveTab].border} ${passiveConfigs[activePassiveTab].bg} flex flex-col md:flex-row justify-between items-center gap-4`}>
                            {(() => {
                                const pointInfo = arkPassive.Points.find((p: any) => p.Name === activePassiveTab);
                                return (
                                    <>
                                        <div className="flex flex-col items-center md:items-start">
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">현재 단계</span>
                                            <span className="text-2xl font-black text-white">{pointInfo?.Description || '정보 없음'}</span>
                                        </div>
                                        <div className="h-px md:h-12 w-full md:w-px bg-white/10" />
                                        <div className="flex flex-col items-center md:items-end">
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">보유 포인트</span>
                                            <span className={`text-3xl font-black ${passiveConfigs[activePassiveTab].color}`}>
                                {pointInfo?.Value || 0} <span className="text-sm font-medium text-zinc-500">pts</span>
                            </span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    {/* 활성 효과 그리드 (텍스트 정제 로직 포함) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {arkPassive?.Effects?.filter((e: any) => e.Name === activePassiveTab).length > 0 ? (
                            arkPassive.Effects
                                .filter((e: any) => e.Name === activePassiveTab)
                                .map((effect: any, i: number) => {
                                    const tooltip = JSON.parse(effect.ToolTip);

                                    // 텍스트 정제 함수 (FONT 태그 및 줄바꿈 제거)
                                    const clean = (text: string) => {
                                        if (!text) return "";
                                        return text
                                            .replace(/<FONT color='#.{6}'>/gi, '')
                                            .replace(/<\/FONT>/gi, '')
                                            .replace(/<BR>/gi, '\n')
                                            .replace(/\|\|/g, '\n')
                                            .replace(/<[^>]*>?/gm, '') // 기타 남은 모든 태그 제거
                                            .trim();
                                    };

                                    const cleanName = clean(effect.Description);
                                    const cleanDesc = clean(tooltip.Element_002?.value || "");

                                    return (
                                        <div key={i} className="bg-[#181818] p-4 rounded-lg border border-white/5 hover:border-white/10 transition-colors flex gap-4 group">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={effect.Icon}
                                                    className="w-12 h-12 rounded-lg bg-zinc-900 border border-white/10 group-hover:scale-105 transition-transform"
                                                    alt=""
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-[14px] font-bold text-zinc-100 truncate">
                                                        {/* "진화 1티어 치명 Lv.10"에서 "치명 Lv.10"만 추출 */}
                                                        {cleanName.split(' ').slice(2).join(' ')}
                                                    </h4>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${passiveConfigs[activePassiveTab].border} ${passiveConfigs[activePassiveTab].color}`}>
                                        T{cleanName.split(' ')[1]?.replace('티어', '') || '-'}
                                    </span>
                                                </div>
                                                <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 whitespace-pre-wrap">
                                                    {cleanDesc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                        ) : (
                            <div className="col-span-full py-10 text-center bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800">
                                <p className="text-zinc-500 text-sm">활성화된 {activePassiveTab} 효과가 없습니다.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};