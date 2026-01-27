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
import { Jewely } from "@/components/profile/Jewerly.tsx";

export const CharacterCard: React.FC<{
    character: CharacterInfo;
    characterName: string;
    onUpdate: () => void;
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
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full px-4 lg:px-0">

            {/* [좌측 구역]: 모바일에서는 상단에 위치 */}
            <aside className="w-full lg:w-[420px] shrink-0 lg:sticky lg:top-24 h-fit space-y-4 lg:space-y-5">

                {/* 1. 캐릭터 헤더: 모바일에서 너무 커지지 않도록 조정 */}
                <div className="bg-zinc-900/60 rounded-2xl lg:rounded-3xl border border-zinc-800/50 overflow-hidden shadow-2xl">
                    <CharacterHeader character={character} />
                </div>

                {/* 2. 탭 네비게이션: 모바일에서 스티키 처리 (선택 사항) */}
                {/* z-index를 주어 콘텐츠보다 위로 오게 설정 */}
                <div className="sticky top-16 lg:static z-30 bg-zinc-900/90 lg:bg-zinc-900/60 backdrop-blur-md lg:backdrop-blur-none rounded-2xl lg:rounded-3xl border border-zinc-800/50 p-2 lg:p-3 shadow-xl">
                    <TabNavigation
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        onUpdate={onUpdate}
                        onSimulator={goToSimulator}
                        isCooldown={isCooldown}
                        timeLeft={timeLeft}
                    />
                </div>

                {/* 3. 보석 정보: 모바일에서는 탭 아래 혹은 가장 하단에 배치 */}
                <div className="bg-zinc-900/60 rounded-2xl lg:rounded-3xl border border-zinc-800/50 overflow-hidden shadow-2xl">
                    <Jewely character={character} />
                </div>
            </aside>

            {/* [우측 구역]: 메인 콘텐츠 */}
            <main className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        /* 모바일에서는 위아래 전환(y), 데스크톱에서는 좌우 전환(x) */
                        initial={{ opacity: 0, y: 10, x: 0 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -10, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="min-h-[400px] lg:min-h-[600px]"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};