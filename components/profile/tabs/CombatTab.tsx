import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { EquipmentAndAccessorySection } from "@/components/profile/tabs/combat/sections/EquipmentAndAccessorySection";
import { ArkGridAndGemEffectSection } from "@/components/profile/tabs/combat/sections/ArkGridAndGemEffectSection";
import { EngravingSection } from "@/components/profile/tabs/combat/sections/EngravingSection";
import { CardsSection } from "@/components/profile/tabs/combat/sections/CardsSection";
import { AvatarsSection } from "@/components/profile/tabs/combat/sections/AvatarsSection";

/* ================= 컴포넌트 ================= */
export const CombatTab = ({ character }: { character: any }) => {
    const [equipments, setEquipments] = useState<any[]>([]);
    const [arkGrid, setArkGrid] = useState<any | null>(null);
    const [engravings, setEngravings] = useState<any>(null);
    const [avatars, setAvatars] = useState<any[]>([]);
    const [cards, setCards] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    /* ================= 데이터 로딩 ================= */
    useEffect(() => {
        if (!character?.CharacterName) return;
        setLoading(true);

        Promise.all([
            fetch(`/equipment?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/arkgrid?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/engravings?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/avatars?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
            fetch(`/cards?name=${encodeURIComponent(character.CharacterName)}`).then(res => res.json()),
        ])
            .then(([eqData, arkData, engData, avatarData, cardData]) => {
                setEquipments(Array.isArray(eqData) ? eqData : []);
                setArkGrid(arkData);
                setEngravings(engData);
                setAvatars(Array.isArray(avatarData) ? avatarData : []);
                setCards(cardData);
            })
            .catch(err => console.error('데이터 로딩 실패:', err))
            .finally(() => setLoading(false));
    }, [character?.CharacterName]);

    /* ================= 로딩 ================= */
    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8 mb-3" />
                <span className="text-zinc-500 text-sm">정보를 불러오는 중...</span>
            </div>
        );
    }


    /* ================= Render ================= */
    return (
        <div className="flex flex-col gap-6 p-0 sm:p-4 text-zinc-300 min-h-screen max-w-[1200px] mx-auto">
            <div className="flex-1 min-w-0 space-y-6">
                <EquipmentAndAccessorySection equipments={equipments} />
                <ArkGridAndGemEffectSection arkGrid={arkGrid} />
                <EngravingSection engravings={engravings} />
                <CardsSection cards={cards} />
            </div>

            <div className="flex-1 min-w-0 flex flex-col space-y-4 sm:space-y-10 px-0 sm:px-0">
                <AvatarsSection avatars={avatars} />
            </div>
        </div>
    );
};