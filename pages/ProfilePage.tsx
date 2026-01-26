import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CharacterCard } from '../components/profile/CharacterCard';
import { Loader2, AlertCircle } from 'lucide-react';

const COOLDOWN_TIME = 60;
const STORAGE_KEY = "lastUpdateTime";

const ProfilePage = () => {
    const [searchParams] = useSearchParams();
    const characterName = searchParams.get('name') ?? '';

    const [character, setCharacter] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isCooldown, setIsCooldown] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    // [1] 마운트 시 localStorage 체크 (새로고침 시 제한 유지의 핵심)
    useEffect(() => {
        const lastUpdate = localStorage.getItem(STORAGE_KEY);
        if (lastUpdate) {
            const diff = Math.floor((Date.now() - parseInt(lastUpdate)) / 1000);
            if (diff < COOLDOWN_TIME) {
                setIsCooldown(true);
                setTimeLeft(COOLDOWN_TIME - diff);
            }
        }
    }, []);

    // [2] 카운트다운 타이머
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isCooldown && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft <= 0) {
            setIsCooldown(false);
        }
        return () => clearInterval(timer);
    }, [isCooldown, timeLeft]);

    const fetchCharacterData = useCallback(async () => {
        if (!characterName) return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/stat?name=${encodeURIComponent(characterName)}`);
            if (!response.ok) throw new Error('캐릭터 정보를 불러올 수 없습니다.');
            const data = await response.json();
            setCharacter(data);
        } catch (err: any) {
            setError(err?.message ?? '에러 발생');
            setCharacter(null);
        } finally {
            setLoading(false);
        }
    }, [characterName]);

    // [3] 업데이트 핸들러 (시간 저장 로직 포함)
    const handleUpdateClick = useCallback(() => {
        if (isCooldown) return;

        localStorage.setItem(STORAGE_KEY, Date.now().toString()); // 시간 기록
        fetchCharacterData();

        setIsCooldown(true);
        setTimeLeft(COOLDOWN_TIME);
    }, [isCooldown, fetchCharacterData]);

    useEffect(() => {
        if (!characterName) {
            setLoading(false);
            return;
        }
        fetchCharacterData();
    }, [characterName, fetchCharacterData]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
            <p className="text-zinc-500 font-bold tracking-widest uppercase animate-pulse">Synchronizing Data...</p>
        </div>
    );

    if (error || !character) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 gap-4">
            <AlertCircle size={48} className="text-red-500/50" />
            <p className="font-bold">{error || '캐릭터를 찾을 수 없습니다.'}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CharacterCard
                character={character}
                characterName={characterName}
                onUpdate={handleUpdateClick}
                isCooldown={isCooldown} // CharacterCard 내부에서 TabNavigation으로 전달해야 함
                timeLeft={timeLeft}     // CharacterCard 내부에서 TabNavigation으로 전달해야 함
            />
        </div>
    );
};

export default ProfilePage;