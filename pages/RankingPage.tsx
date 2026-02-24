import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RankingSidebar from '@/components/rank/rankingSidebar';
import RankingList from '@/components/rank/rankingList';

const CLASS_LIST = [
    "전체", "워로드", "버서커", "디스트로이어", "홀리나이트", "발키리", "슬레이어", "배틀마스터", "인파이터", "기공사", "창술사",
    "스트라이커", "브레이커", "데빌헌터", "블래스터", "호크아이", "스카우터", "건슬링어", "바드", "서머너", "아르카나",
    "소서리스", "블레이드", "데모닉", "리퍼", "소울이터", "도화가", "기상술사", "환수사", "가디언나이트"
];

const ARKPASSIVE_BY_CLASS: Record<string, string[]> = {
    "워로드": ["고독한 기사", "전투 태세"],
    "버서커": ["광기", "광전사의 비기"],
    "디스트로이어": ["분노의 망치", "중력 수련"],
    "홀리나이트": ["축복의 오라", "심판자"],
    "발키리":["빛의 기사","해방자"],
    "슬레이어": ["포식자", "처단자"],
    "배틀마스터": ["초심", "오의 강화"],
    "인파이터": ["극의: 체술", "충격 단련"],
    "기공사": ["세맥타통", "역천지체"],
    "창술사": ["절제", "절정"],
    "스트라이커": ["오의난무", "일격필살"],
    "브레이커": ["권왕파천무", "수라의 길"],
    "데빌헌터": ["전술 탄환", "핸드거너"],
    "블래스터": ["포격 강화", "화력 강화"],
    "호크아이": ["죽음의 습격", "두 번째 동료"],
    "스카우터": ["진화의 유산", "아르데타인의 기술"],
    "건슬링어": ["피스메이커", "사냥의 시간"],
    "바드": ["절실한 구원", "진실된 용맹"],
    "서머너": ["넘치는 교감", "상급 소환사"],
    "아르카나": ["황후의 은총", "황제의 칙령"],
    "소서리스": ["점화", "환류"],
    "블레이드": ["버스트", "잔재된 기운"],
    "데모닉": ["멈출 수 없는 충동", "완벽한 억제"],
    "리퍼": ["달의 소리", "갈증"],
    "소울이터": ["그믐의 경계", "만월의 집행자"],
    "도화가": ["회귀", "만개"],
    "기상술사": ["질풍노도", "이슬비"],
    "환수사": ["야성", "환수 각성"],
    "가디언나이트": ["업화의 계승자", "드레드 로어"]
};

const RankingPage: React.FC = () => {
    const navigate = useNavigate();
    const [rankings, setRankings] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [rankingType, setRankingType] = useState<'combat-power' | 'item-level'>('combat-power');

    const [selectedClass, setSelectedClass] = useState("전체");
    const [selectedArkPassive, setSelectedArkPassive] = useState("전체");

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    const currentArkPassives = selectedClass !== "전체"
        ? ["전체", ...(ARKPASSIVE_BY_CLASS[selectedClass] || [])]
        : ["전체"];

    const fetchRankings = useCallback(async (isInitial: boolean = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const targetPage = isInitial ? 1 : page;
            let url = "";

            if (selectedClass !== "전체" && selectedArkPassive !== "전체") {
                url = `/ranking/arkpassive?className=${encodeURIComponent(selectedClass)}&arkPassive=${encodeURIComponent(selectedArkPassive)}&page=${targetPage}&size=25`;
            } else if (selectedClass !== "전체") {
                url = `/ranking/class?className=${encodeURIComponent(selectedClass)}&page=${targetPage}&size=25`;
            } else {
                url = `/ranking/${rankingType}?page=${targetPage}&size=25`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.length < 25) setHasMore(false);
            setRankings(prev => isInitial ? data : [...prev, ...data]);
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        } finally {
            setLoading(false);
        }
    }, [page, rankingType, selectedClass, selectedArkPassive, loading]);

    useEffect(() => {
        setHasMore(true);
        setPage(1);
        fetchRankings(true);
    }, [rankingType, selectedClass, selectedArkPassive]);

    useEffect(() => {
        setSelectedArkPassive("전체");
    }, [selectedClass]);

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
        <div className="w-full min-h-screen bg-[#0a0a0b] text-zinc-300 font-sans tracking-tight">
            {/* 컨테이너 구조 수정 */}
            <div className="max-w-[1120px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-10 py-6 lg:py-10">

                {/* 사이드바 영역: lg 이상에서 sticky 고정 */}
                <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-24 h-fit z-30">
                    <RankingSidebar
                        rankingType={rankingType}
                        setRankingType={setRankingType}
                        selectedClass={selectedClass}
                        setSelectedClass={setSelectedClass}
                        selectedArkPassive={selectedArkPassive}
                        setSelectedArkPassive={setSelectedArkPassive}
                        arkPassiveList={currentArkPassives}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        classList={CLASS_LIST}
                    />
                </div>

                {/* 리스트 영역: 스크롤 발생 구역 */}
                <div className="flex-1 min-w-0">
                    <RankingList
                        rankings={rankings.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))}
                        loading={loading}
                        hasMore={hasMore}
                        rankingType={rankingType}
                        lastElementRef={lastElementRef}
                        navigate={navigate}
                    />
                </div>
            </div>
        </div>
    );
};

export default RankingPage;