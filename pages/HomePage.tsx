import React, { useState, useEffect, useRef } from "react";
import {
    Search,
    Clock,
    X,
    BarChart as BarChartIcon,
    RotateCcw,
    History,
    Book,
    Box,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    BarChart,
    Bar,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    LabelList
} from 'recharts'
import loakong1 from "@/assets/로콩1.png";
import loakong2 from "@/assets/로콩2.png";
import loakong3 from "@/assets/로콩3.png";
import loakong4 from "@/assets/로콩4.png";
import loakong5 from "@/assets/로콩5.png";
import loakong6 from "@/assets/로콩6.png";

interface MarketItem {
    Id: number;
    Name: string;
    Grade: string;
    Icon: string;
    CurrentMinPrice: number;
    RecentPrice: number;
    YDayAvgPrice: number;
    BundleCount: number;
}

const HomePage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();
    const historyRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [history, setHistory] = useState<string[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [marketData, setMarketData] = useState<MarketItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [realTimeHistory, setRealTimeHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'material' | 'engraving'>('material');
    const [listSearchTerm, setListSearchTerm] = useState("");

    // --- [추가] 초기 로드시 로컬 스토리지에서 검색 기록 불러오기 ---
    useEffect(() => {
        const syncHistory = () => {
            const saved = localStorage.getItem('searchHistory');
            if (saved) {
                setHistory(JSON.parse(saved));
            } else {
                setHistory([]);
            }
        };

        syncHistory(); // 초기 로드

        window.addEventListener("searchHistoryUpdated", syncHistory);
        window.addEventListener("storage", syncHistory); // 다른 탭 대응

        const handleClickOutside = (event: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
                setIsHistoryOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            window.removeEventListener("searchHistoryUpdated", syncHistory);
            window.removeEventListener("storage", syncHistory);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchAndSaveData = async () => {
        setIsRefreshing(true);
        try {
            const requests = [
                axios.get("/markets", { params: { name: "융화 재료", category: 50010 } }),
                axios.get("/markets", { params: { name: "각인서", category: 40000, grade: "유물" } }),
            ];
            const responses = await Promise.all(requests);
            const combined: MarketItem[] = responses.flatMap(res => {
                const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                if (Array.isArray(data)) return data.flatMap(page => page.Items || []);
                return data.Items || [];
            });

            const uniqueItems = Array.from(new Map(combined.map(item => [item.Id, item])).values());
            setMarketData(uniqueItems);
            if (uniqueItems.length > 0 && !selectedItem) setSelectedItem(uniqueItems[0]);
        } catch (error) {
            console.error("데이터 로드 실패:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 600);
        }
    };

    const updateLocalStorage = (item: MarketItem) => {
        const storageKey = `realtime_price_${item.Id}`;
        const savedData = localStorage.getItem(storageKey);
        let historyArr = savedData ? JSON.parse(savedData) : [];
        const newPoint = {
            time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
            price: item.CurrentMinPrice,
            timestamp: Date.now()
        };
        if (historyArr.length === 0 || historyArr[historyArr.length - 1].time !== newPoint.time) {
            historyArr.push(newPoint);
        } else {
            historyArr[historyArr.length - 1] = newPoint;
        }
        const updatedHistory = historyArr.slice(-60);
        localStorage.setItem(storageKey, JSON.stringify(updatedHistory));
        setRealTimeHistory(updatedHistory);
    };

    useEffect(() => {
        fetchAndSaveData();
        const interval = setInterval(fetchAndSaveData, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedItem) {
            updateLocalStorage(selectedItem);
            const savedData = localStorage.getItem(`realtime_price_${selectedItem.Id}`);
            setRealTimeHistory(savedData ? JSON.parse(savedData) : []);
        }
    }, [selectedItem?.Id]);

    // --- [수정] 검색 로직 보완 ---
// --- [수정] 검색 로직: API 호출 추가 ---
    const handleSearch = async (e: React.FormEvent | string) => {
        if (typeof e !== 'string') e.preventDefault();
        const q = typeof e === 'string' ? e : searchQuery.trim();
        if (!q) return;

        // 1. 로컬 스토리지 검색 기록 업데이트
        const saved = localStorage.getItem('searchHistory');
        const currentHistory = saved ? JSON.parse(saved) : [];
        const updated = [q, ...currentHistory.filter((item: string) => item !== q)].slice(0, 5);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
        setHistory(updated);
        window.dispatchEvent(new Event("searchHistoryUpdated"));

        // 2. [추가] 백엔드 API 호출 (랭킹/캐릭터 정보 업데이트)
        // 캐릭터 정보를 로스트아크 API에서 가져와 DB에 저장하는 과정입니다.
        try {
            // 전적 검색 페이지로 가기 전에 DB를 최신화합니다.
            // await를 사용하여 업데이트가 완료될 때까지 잠시 기다립니다.
            await axios.post(`/ranking/update/${encodeURIComponent(q)}`);
            console.log(`${q} 캐릭터 정보 업데이트 성공`);
        } catch (error) {
            // API 호출 실패 시에도 페이지 이동은 시키기 위해 에러 로그만 남깁니다.
            console.error("캐릭터 정보 업데이트 중 에러 발생:", error);
        }

        // 3. 페이지 이동 및 초기화
        setIsHistoryOpen(false);
        setSearchQuery("");
        navigate(`/profilePage?name=${encodeURIComponent(q)}`);
    };
    // deleteHistory 수정
    const deleteHistory = (e: React.MouseEvent, term: string) => {
        e.stopPropagation();
        const updated = history.filter(item => item !== term);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
        setHistory(updated);

        // Header에 알림
        window.dispatchEvent(new Event("searchHistoryUpdated"));
    };

    const filteredData = marketData.filter(item => {
        const matchesTab = activeTab === 'material' ? item.Name.includes("융화 재료") : item.Name.includes("각인서");
        const matchesSearch = item.Name.toLowerCase().includes(listSearchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    }).sort((a, b) => b.CurrentMinPrice - a.CurrentMinPrice);

    const priceDiff = selectedItem ? selectedItem.CurrentMinPrice - selectedItem.YDayAvgPrice : 0;
    const priceDiffPercent = selectedItem && selectedItem.YDayAvgPrice > 0
        ? ((priceDiff / selectedItem.YDayAvgPrice) * 100).toFixed(1)
        : "0.0";

    const isUp = priceDiff > 0;
    const isDown = priceDiff < 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center min-h-screen pt-6 lg:-mt-40 mx-auto max-w-7xl px-4 lg:px-6 pb-20"
        >
            {/* 로고 영역 */}
            {/* 로고 영역 */}
            <div className="flex flex-col items-center text-center mb-6 lg:mb-10">
                <motion.img
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    src={loakong3}
                    alt="LOAKONG"
                    /* h-120을 유지하되, -mb(음수 마진)로 아래 요소가 올라오게 함 */
                    className="h-120 object-contain -mb-8 lg:-mb-40 select-none pointer-events-none "
                />

                <p className="text-zinc-500 lg:text-zinc-400 text-[12px] lg:text-lg font-medium tracking-tight">
                    로스트아크 전적 검색 및 시뮬레이션
                </p>
            </div>
            {/* 메인 검색창 */}
            <div className="w-full max-w-2xl relative group mb-8 lg:mb-16" ref={historyRef}>
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-900 rounded-[1.5rem] lg:rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                <form onSubmit={handleSearch} className="relative z-20">
                    <input
                        type="text"
                        inputMode="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsHistoryOpen(true)}
                        placeholder="캐릭터명을 입력하세요"
                        className="w-full h-14 lg:h-20 px-6 lg:px-10 rounded-2xl lg:rounded-[1.5rem] bg-zinc-900/90 border-2 border-white/10 focus:border-indigo-500 outline-none text-lg lg:text-2xl font-bold text-white shadow-2xl transition-all"
                    />
                    <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 lg:w-14 lg:h-14 bg-white text-black rounded-xl lg:rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                        <Search strokeWidth={3} className="w-5 h-5 lg:w-7 lg:h-7" />
                    </button>
                </form>

                {/* 검색 기록 드롭다운 */}
                <AnimatePresence>
                    {isHistoryOpen && history.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-[110%] left-0 right-0 z-50 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-1 lg:py-2"
                        >
                            <div className="px-5 py-2 text-[11px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 flex justify-between items-center">
                                <span>최근 검색 기록</span>
                                <History size={12} />
                            </div>
                            {history.map((term, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSearch(term)}
                                    className="flex items-center justify-between px-5 py-3 lg:px-6 lg:py-3 hover:bg-white/5 cursor-pointer transition-colors group/item"
                                >
                                    <div className="flex items-center gap-3 text-zinc-300">
                                        <Clock size={14} className="text-zinc-600 group-hover/item:text-indigo-400 transition-colors" />
                                        <span className="text-sm lg:text-base font-medium">{term}</span>
                                    </div>
                                    <button
                                        onClick={(e) => deleteHistory(e, term)}
                                        className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 메인 콘텐츠 그리드 */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-stretch max-w-[1000px]">
                {/* 좌측: 아이템 목록 (모바일 컴팩트 레이아웃) */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[1.5rem] lg:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl backdrop-blur-sm h-[380px] lg:h-[500px]">
                    {/* 탭/검색 영역 (기존 유지하되 패딩 축소) */}
                    <div className="flex border-b border-white/5 bg-white/5 p-1.5 lg:p-2 gap-1 shrink-0">
                        <button onClick={() => { setActiveTab('material'); setListSearchTerm(""); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 lg:py-3 rounded-xl lg:rounded-2xl transition-all font-bold text-[12px] lg:text-base ${activeTab === 'material' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>
                            <Box size={13} /> 융화 재료
                        </button>
                        <button onClick={() => { setActiveTab('engraving'); setListSearchTerm(""); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 lg:py-3 rounded-xl lg:rounded-2xl transition-all font-bold text-[12px] lg:text-base ${activeTab === 'engraving' ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:bg-white/5'}`}>
                            <Book size={13} /> 각인서
                        </button>
                        <button onClick={fetchAndSaveData} className={`px-2 lg:px-4 ${isRefreshing ? 'animate-spin' : ''} text-zinc-500`}><RotateCcw size={14} /></button>
                    </div>

                    <div className="px-3 py-2 bg-white/[0.02] border-b border-white/5">
                        <div className="relative">
                            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input type="text" value={listSearchTerm} onChange={(e) => setListSearchTerm(e.target.value)} placeholder="검색..." className="w-full bg-zinc-800/50 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-[12px] text-white focus:outline-none" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                        {filteredData.map((item) => (
                            <div key={item.Id} onClick={() => { setSelectedItem(item); if(window.innerWidth < 1024) scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className={`flex items-center justify-between px-4 py-2.5 lg:px-6 lg:py-4 cursor-pointer transition-all ${selectedItem?.Id === item.Id ? 'bg-indigo-500/10 border-l-4 border-indigo-500' : 'hover:bg-white/[0.02] border-l-4 border-transparent'}`}>
                                <div className="flex items-center gap-3">
                                    <img src={item.Icon} className="w-8 h-8 lg:w-12 lg:h-12 bg-zinc-800 rounded-lg p-1" alt="" />
                                    <div className="min-w-0">
                                        <p className={`font-bold text-[12px] lg:text-base truncate ${item.Grade === '전설' ? 'text-orange-400' : 'text-zinc-200'}`}>
                                            {item.Name.replace(" 각인서", "").replace("유물 ", "").replace(" 융화 재료", "")}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-[13px] lg:text-lg font-black text-amber-400 shrink-0">{item.CurrentMinPrice.toLocaleString()}G</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 우측: 시세 상세 (그래프 보정값 유지형) */}
                <div ref={scrollRef} className="scroll-mt-20 bg-zinc-900/50 border border-white/5 rounded-[1.5rem] lg:rounded-[2.5rem] flex flex-col p-5 lg:p-10 shadow-2xl backdrop-blur-sm h-[320px] lg:h-[500px]">
                    {selectedItem ? (
                        <div className="flex flex-col h-full">
                            {/* 상단 헤더 컴팩트화 */}
                            <div className="flex justify-between items-start mb-4 lg:mb-6">
                                <div className="min-w-0">
                                    <h2 className="text-base lg:text-2xl font-black text-white truncate pr-2">{selectedItem.Name}</h2>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                                        <span className="text-indigo-500 text-[8px] lg:text-[10px] font-black uppercase">Live Price</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xl lg:text-3xl font-black text-amber-400 leading-none">{selectedItem.CurrentMinPrice.toLocaleString()}G</p>
                                    <div className={`inline-flex mt-1 text-[9px] lg:text-[11px] font-black px-1.5 py-0.5 rounded-md ${isUp ? 'bg-rose-500/10 text-rose-500' : isDown ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                                        {isUp ? '▲' : isDown ? '▼' : ''} {Math.abs(Number(priceDiffPercent))}%
                                    </div>
                                </div>
                            </div>

                            {/* 그래프: 보정 로직 유지 + 모바일 높이 최적화 */}
                            <div className="flex-1 min-h-0 bg-black/20 rounded-xl lg:rounded-[2rem] lg:p-6 border border-white/5 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            { name: '전날 평균', price: selectedItem.YDayAvgPrice },
                                            { name: '최근 거래', price: selectedItem.RecentPrice },
                                            { name: '현재 최저', price: selectedItem.CurrentMinPrice }
                                        ]}
                                        margin={{ top: 35, right: 5, left: 5, bottom: 0 }}
                                        barCategoryGap={window.innerWidth < 1024 ? "50%" : "25%"}
                                        /* 하얀 박스 방지를 위한 설정 */
                                        accessibilityLayer={false}
                                        style={{ outline: 'none' }}
                                    >
                                        <CartesianGrid vertical={false} stroke="#ffffff08" strokeDasharray="0" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#71717a', fontSize: 10, fontWeight: 'bold' }}
                                            interval={0}
                                        />
                                        <YAxis hide domain={[(dataMin: number) => dataMin * 0.95, (dataMax: number) => dataMax * 1.05]} />

                                        <Bar
                                            dataKey="price"
                                            radius={[6, 6, 0, 0]}
                                            isAnimationActive={true}
                                            /* 타입 에러가 났던 focusCaseless를 제거하고 style로 처리 */
                                            style={{ outline: 'none' }}
                                        >
                                            {/* 각 Cell 클릭 시 발생하는 테두리 방지 */}
                                            <Cell fill="#3f3f46" style={{ outline: 'none' }} />
                                            <Cell fill="#818cf8" style={{ outline: 'none' }} />
                                            <Cell fill="#fbbf24" style={{ outline: 'none' }} />

                                            <LabelList
                                                dataKey="price"
                                                position="top"
                                                offset={10}
                                                content={(props: any) => {
                                                    const { x, y, width, value, index } = props;
                                                    const colors = ['#a1a1aa', '#818cf8', '#fbbf24'];
                                                    return (
                                                        <text
                                                            x={x + width / 2}
                                                            y={y - 10}
                                                            fill={colors[index]}
                                                            textAnchor="middle"
                                                            style={{
                                                                fontSize: window.innerWidth < 1024 ? '11px' : '14px',
                                                                fontWeight: '900',
                                                                filter: 'drop-shadow(0px 0px 2px rgba(0,0,0,0.5))',
                                                                pointerEvents: 'none'
                                                            }}
                                                        >
                                                            {value.toLocaleString()}G
                                                        </text>
                                                    );
                                                }}
                                            />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* 하단 지표 정보 그리드 */}
                            <div className="mt-4 lg:mt-6 grid grid-cols-3 gap-1 lg:gap-4 border-t border-white/5 pt-4 lg:pt-6">
                                {[
                                    { label: '전날 평균', val: selectedItem.YDayAvgPrice, color: 'text-zinc-300' },
                                    { label: '최근 거래', val: selectedItem.RecentPrice, color: 'text-indigo-400' },
                                    { label: '현재 최저', val: selectedItem.CurrentMinPrice, color: 'text-amber-400' }
                                ].map((info, idx) => (
                                    <div key={idx} className={`text-center ${idx === 1 ? 'border-x border-white/5' : ''}`}>
                                        <p className="text-[8px] lg:text-[10px] text-zinc-500 font-bold mb-0.5 uppercase tracking-tighter">{info.label}</p>
                                        <p className={`text-[11px] lg:text-sm font-bold ${info.color}`}>{info.val.toLocaleString()}G</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-zinc-600 font-bold border-2 border-dashed border-white/5 rounded-[1.5rem] text-sm">
                            아이템을 선택하세요.
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default HomePage;