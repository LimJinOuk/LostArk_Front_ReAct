import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RankingSidebar from '@/components/rank/RankingSidebar';
import RankingList from '@/components/rank/RankingList';

const CLASS_LIST = ["전체", "워로드", "버서커", "디스트로이어", "홀리나이트", "슬레이어", "배틀마스터", "인파이터", "기공사", "창술사", "스트라이커", "브레이커", "데빌헌터", "블래스터", "호크아이", "스카우터", "건슬링어", "바드", "서머너", "아르카나", "소서리스", "블레이드", "데모닉", "리퍼", "소울이터", "도화가", "기상술사"];

const RankingPage: React.FC = () => {
    const navigate = useNavigate();
    const [rankings, setRankings] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [rankingType, setRankingType] = useState<'combat-power' | 'item-level'>('combat-power');
    const [selectedClass, setSelectedClass] = useState("전체");
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    const fetchRankings = useCallback(async (isInitial: boolean = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const targetPage = isInitial ? 1 : page;
            const url = selectedClass !== "전체"
                ? `/ranking/class?className=${encodeURIComponent(selectedClass)}&page=${targetPage}&size=25`
                : `/ranking/${rankingType}?page=${targetPage}&size=25`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.length < 25) setHasMore(false);
            setRankings(prev => isInitial ? data : [...prev, ...data]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, rankingType, selectedClass, loading]);

    useEffect(() => {
        setHasMore(true); setPage(1); fetchRankings(true);
    }, [rankingType, selectedClass]);

    useEffect(() => {
        if (page > 1) fetchRankings(false);
    }, [page]);

    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) setPage(prev => prev + 1);
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-zinc-300 font-sans tracking-tight">
            <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-start relative px-4 lg:px-10 py-10 gap-0">
                <RankingSidebar
                    rankingType={rankingType} setRankingType={setRankingType}
                    selectedClass={selectedClass} setSelectedClass={setSelectedClass}
                    searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                    classList={CLASS_LIST}
                />
                <RankingList
                    rankings={rankings.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))}
                    loading={loading} hasMore={hasMore} rankingType={rankingType}
                    lastElementRef={lastElementRef} navigate={navigate}
                />
            </div>
        </div>
    );
};

export default RankingPage;