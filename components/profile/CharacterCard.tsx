import React, { useState } from 'react';
import { CharacterInfo } from '../../types.ts';
import { motion, AnimatePresence } from 'framer-motion';

import { CharacterHeader } from './CharacterHeader';
import { TabNavigation } from './TabNavigation';
import { CombatTab } from './tabs/CombatTab';
import {SkillTab} from "@/components/profile/tabs/SkillTab.tsx";
import {ArkPassiveTab} from "@/components/profile/tabs/ArkPassiveTab.tsx";
import {CollectionTab} from "@/components/profile/tabs/CollectionTab.tsx";
import {AvatarTab} from "@/components/profile/tabs/AvatarTab.tsx";
import {StatsTab} from "@/components/profile/tabs/StatsTab.tsx";
import {CharacterDetailTab} from "@/components/profile/tabs/CharacterDetailTab.tsx";
import {GuildTab} from "@/components/profile/tabs/GuildTab.tsx";

// 임시로 컴포넌트가 없는 탭은 빈 div 처리
const PlaceholderTab = ({ name }: { name: string }) => (
    <div className="bg-surface rounded-[2.5rem] border border-white/5 p-10 text-center text-zinc-500 font-black uppercase tracking-widest">
      {name} Tab Content Loading...
    </div>
);

export const CharacterCard: React.FC<{ character: CharacterInfo }> = ({ character }) => {
  const [activeTab, setActiveTab] = useState('전투');
    const renderContent = () => {
        switch (activeTab) {
            case '전투': return <CombatTab character={character} />;
            case '스킬': return <SkillTab skills={character.skills} />;
            case '아크 패시브': return <ArkPassiveTab character={character} />;
            case '내실': return <CollectionTab character={character} />;
            case '아바타': return <AvatarTab />;
            case '통계': return <StatsTab character={character} />;
            case '캐릭터': return <CharacterDetailTab />;
            case '길드': return <GuildTab character={character} />;
            default: return <CombatTab character={character} />;
        }
    };

  return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CharacterHeader character={character} />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

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