import React, { useState } from 'react';
import { CharacterInfo } from '../../types.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { CharacterHeader } from './CharacterHeader';
import { TabNavigation } from './TabNavigation';
import { CombatTab } from './tabs/CombatTab';
import { SkillTab } from "@/components/profile/tabs/SkillTab.tsx";
import { ArkPassiveTab } from "@/components/profile/tabs/ArkPassiveTab.tsx";
import { CharacterDetailTab } from "@/components/profile/tabs/CharacterDetailTab.tsx";
import {Jewely} from "@/components/profile/Jewerly.tsx";


export const CharacterCard: React.FC<{
    character: CharacterInfo;
    characterName: string;
    onUpdate: () => void; // ✅ ProfilePage의 handleUpdateClick
    isCooldown: boolean;
    timeLeft: number;
}> = ({ character, characterName, onUpdate, isCooldown, timeLeft }) => {
    const [activeTab, setActiveTab] = useState('전투');
    const navigate = useNavigate();

    const goToSimulator = () => {
        const name = (characterName || '').trim();
        if (!name) {
            navigate('/simulatorPage');
            return;
        }
        navigate(`/simulatorPage?name=${encodeURIComponent(name)}`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case '전투': return <CombatTab character={character} />;
            case '스킬': return <SkillTab character={character} />;
            case '아크 패시브': return <ArkPassiveTab character={character} />;
            case '캐릭터': return <CharacterDetailTab character={character}/>;
            default: return <CombatTab character={character} />;
        }
    };

    return (
        /* 전체 컨테이너 gap을 8(32px)로 늘려 좌우 구분을 더 명확히 함 */
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">

            {/* [좌측 구역]: 너비를 420px로 확장 */}
            <aside className="w-full lg:w-[420px] shrink-0 lg:sticky lg:top-24 h-fit space-y-5">
                {/* 1. 캐릭터 아이콘/헤더 */}
                <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800/50 overflow-hidden shadow-2xl">
                    <CharacterHeader character={character} />
                </div>

                {/* 2. 탭 네비게이션 */}
                <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800/50 p-3 shadow-xl">
                    <TabNavigation
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onUpdate={onUpdate}
                        onSimulator={goToSimulator}
                        isCooldown={isCooldown}
                        timeLeft={timeLeft}
                    />
                </div>

                {/* 3. 보석 정보: 패딩(p-3) 제거 및 테두리 정렬 */}
                <div className="bg-zinc-900/60 rounded-3xl border border-zinc-800/50 overflow-hidden shadow-2xl">
                    <Jewely character={character} />
                </div>
            </aside>

            {/* [우측 구역]: 정보들이 나열되는 곳 (flex-1로 남은 공간 전체 활용) */}
            <main className="flex-1 min-w-0 space-y-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }} // 좌우 구조이므로 옆에서 나타나는 효과가 더 세련됨
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="min-h-[600px]"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>


            </main>
        </div>
    );
};
