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


export const CharacterCard: React.FC<{
    character: CharacterInfo;
    characterName: string;
    onUpdate: () => void; // ✅ ProfilePage의 handleUpdateClick
}> = ({ character, characterName, onUpdate }) => {
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
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* ✅ 카드 위 버튼 바 (원복) */}

            <CharacterHeader character={character} />
            <TabNavigation
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onUpdate={onUpdate}
                onSimulator={goToSimulator}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="min-h-[400px]"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
