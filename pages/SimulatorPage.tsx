import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, Search } from "lucide-react";

// 컴포넌트 경로 확인 필요
import { Simulator } from "@/components/simulator/Simulator";
import { SimulatorCharacterHeader } from "@/components/simulator/SimulatorCharacterHeader";
import { SimulatorNav, SimTab } from "@/components/simulator/SimulatorNav";

type CharacterLike = any;

export const SimulatorPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // ✅ 로직 1: 탭 상태 관리 (Lifting State Up)
    const [tab, setTab] = useState<SimTab>("info");

    const nameParam = (searchParams.get("name") ?? "").trim();
    const [input, setInput] = useState<string>(nameParam);
    const [character, setCharacter] = useState<CharacterLike | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const shouldShowEmpty = useMemo(() => {
        if (loading) return false;
        if (!nameParam) return true;
        return !character;
    }, [loading, nameParam, character]);

    useEffect(() => {
        setInput(nameParam);
    }, [nameParam]);

    // ✅ 데이터 페칭
    useEffect(() => {
        let alive = true;
        const fetchCharacter = async () => {
            if (!nameParam) {
                setCharacter(null);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/stat?name=${encodeURIComponent(nameParam)}`);
                if (!res.ok) throw new Error("캐릭터 정보를 불러올 수 없습니다.");
                const data = await res.json();
                if (alive) {
                    setCharacter(data);
                    sessionStorage.setItem("last_sim_name", nameParam);
                }
            } catch (e: any) {
                if (alive) {
                    setCharacter(null);
                    setError(e?.message ?? "검색 실패");
                }
            } finally {
                if (alive) setLoading(false);
            }
        };
        fetchCharacter();
        return () => { alive = false; };
    }, [nameParam]);

    // ✅ 조작 함수들
    const submitSearch = () => {
        const n = input.trim();
        if (!n) return;
        navigate(`/simulatorPage?name=${encodeURIComponent(n)}`);
    };

    const goToProfilePage = () => {
        if (!character?.CharacterName) return;
        window.location.href = `/profilePage?name=${encodeURIComponent(character.CharacterName)}`;
    };

    // ---------------------- Render ----------------------

    if (loading && nameParam) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[420px] gap-4">
                <Loader2 className="animate-spin text-indigo-500" size={44} />
                <p className="text-zinc-500 font-bold tracking-widest uppercase animate-pulse">Synchronizing Data...</p>
            </div>
        );
    }

    if (shouldShowEmpty) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[520px] gap-5">
                <div className="text-zinc-400 font-black text-xl">캐릭터 정보가 없습니다.</div>
                <div className="w-full max-w-xl flex items-center gap-2 bg-zinc-950/40 border border-white/10 rounded-2xl px-4 py-3">
                    <Search size={18} className="text-zinc-500" />
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitSearch()}
                        placeholder="캐릭터 이름을 입력하세요"
                        className="flex-1 bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-bold"
                    />
                    <button onClick={submitSearch} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-500 transition-colors">검색</button>
                </div>
                {error && <div className="text-red-400/80 text-sm font-bold">{error}</div>}
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-[1600px] mx-auto px-4 lg:px-0">

            {/* [좌측 구역]: 컨트롤 타워 */}
            <aside className="w-full lg:w-[420px] shrink-0 lg:sticky lg:top-24 h-fit space-y-4">
                {/* 1. 캐릭터 기본 정보 헤더 */}
                <div className="bg-zinc-900/60 rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                    <SimulatorCharacterHeader character={character} />
                </div>

                {/* 2. 네비게이션 바 (좌측 고정) */}
                <div className="bg-zinc-900/40 rounded-3xl border border-white/5 p-3 backdrop-blur-md shadow-lg">
                    <SimulatorNav
                        currentTab={tab}
                        onTabChange={setTab}
                        onGoToProfile={goToProfilePage}
                        onRunSimulation={() => setTab("result")}
                    />
                </div>

                {/* 3. 안내 문구 */}
                <div className="p-5 bg-zinc-900/20 rounded-2xl border border-white/5 text-[11px] text-zinc-500 leading-relaxed">
                    <p>※ 현재 데이터는 로스트아크 API를 기반으로 동기화되었습니다.</p>
                    <p>※ 시뮬레이션 결과는 실제 수치와 약간의 오차가 발생할 수 있습니다.</p>
                </div>
            </aside>

            {/* [우측 구역]: 메인 콘텐츠 */}
            <main className="flex-1 min-w-0">
                <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800/30 p-1 min-h-[600px]">
                    {/* ✅ 탭 상태(tab)를 Simulator에 넘겨주어 해당 탭 내용만 렌더링하도록 설정 */}
                    <Simulator character={character} activeTab={tab} />
                </div>
            </main>
        </div>
    );
};