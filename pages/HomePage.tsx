import React, { useState, useEffect, useRef } from "react";
import { Search, Clock, X, TrendingUp, RotateCcw, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

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

    // 상태 관리
    const [history, setHistory] = useState<string[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [marketData, setMarketData] = useState<MarketItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [realTimeHistory, setRealTimeHistory] = useState<any[]>([]);

    // 1. API 데이터 호출 및 실시간 저장 로직
    const fetchAndSaveData = async () => {
        setIsRefreshing(true);
        try {
            const [abydosRes, engravingRes, orehaRes] = await Promise.all([
                axios.get("/markets", { params: { name: "아비도스", category: 50010 } }),
                axios.get("/markets", { params: { name: "원한 각인서", category: 40000, grade: "전설" } }),
                axios.get("/markets", { params: { name: "오레하", category: 50010 } })
            ]);

            // 2. 데이터 파싱 공통 함수
            const parseData = (res: any) => (typeof res.data === 'string' ? JSON.parse(res.data) : res.data);

            const abydosData = parseData(abydosRes);
            const engravingData = parseData(engravingRes);
            const orehaData = parseData(orehaRes);

            // 3. 데이터 결합
            const combined: MarketItem[] = [
                ...(abydosData.Items || []),
                ...(engravingData.Items || []),
                ...(orehaData.Items || [])
            ];

            setMarketData(combined);

            // 4. 선택된 아이템 동기화 및 로컬 스토리지 업데이트
            if (combined.length > 0) {
                const target = selectedItem
                    ? (combined.find(i => i.Id === selectedItem.Id) || combined[0])
                    : combined[0];

                if (!selectedItem || selectedItem.Id !== target.Id) {
                    setSelectedItem(target);
                }
                updateLocalStorage(target);
            }
        } catch (error) {
            console.error("데이터 로드 실패:", error);
        } finally {
            // 사용자 경험을 위한 최소 로딩 시간 부여
            setTimeout(() => setIsRefreshing(false), 600);
        }
    };

    // 2. 로컬 스토리지 데이터 관리 (최대 60개 = 1시간)
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

    // 3. 초기 로드 및 주기적 실행
    useEffect(() => {
        fetchAndSaveData();
        const interval = setInterval(fetchAndSaveData, 60000); // 1분마다 갱신

        const savedSearch = localStorage.getItem('searchHistory');
        if (savedSearch) setHistory(JSON.parse(savedSearch));

        const handleClickOutside = (e: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(e.target as Node)) setIsHistoryOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            clearInterval(interval);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedItem?.Id]);

    // 아이템 선택 시 해당 아이템의 로컬 기록 불러오기
    useEffect(() => {
        if (selectedItem) {
            const savedData = localStorage.getItem(`realtime_price_${selectedItem.Id}`);
            setRealTimeHistory(savedData ? JSON.parse(savedData) : []);
        }
    }, [selectedItem?.Id]);

    const handleSearch = (e: React.FormEvent | string) => {
        if (typeof e !== 'string') e.preventDefault();
        const q = typeof e === 'string' ? e : searchQuery.trim();
        if (!q) return;

        const updated = [q, ...history.filter(item => item !== q)].slice(0, 5);
        setHistory(updated);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
        navigate(`/profilePage?name=${encodeURIComponent(q)}`);
        setIsHistoryOpen(false);
    };

    const deleteHistory = (e: React.MouseEvent, term: string) => {
        e.stopPropagation();
        const updated = history.filter(item => item !== term);
        setHistory(updated);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
    };

    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center min-h-screen pt-10 mx-auto max-w-7xl px-6 pb-20">

            {/* 1. 로고 섹션 */}
            <div className="text-center mb-12">
                <h1 className="text-[80px] font-black tracking-tighter text-white mb-2 leading-none">LOAPANG</h1>
                <p className="text-zinc-400 text-lg font-medium tracking-tight">로스트아크 실시간 시세 및 전적 검색</p>
            </div>

            {/* 2. 검색창 섹션 */}
            <div className="w-full max-w-2xl relative group mb-16" ref={historyRef}>
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-900 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000" />
                <form onSubmit={handleSearch} className="relative z-20">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsHistoryOpen(true)}
                        placeholder="캐릭터명을 입력하세요"
                        className="w-full h-20 px-10 rounded-[1.5rem] bg-zinc-900/90 border-2 border-white/10 focus:border-indigo-500 outline-none text-2xl font-bold text-white shadow-2xl transition-all"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-white text-black rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                        <Search size={28} strokeWidth={3} />
                    </button>
                </form>

                <AnimatePresence>
                    {isHistoryOpen && history.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[110%] left-0 right-0 z-50 bg-zinc-900 border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden py-4">
                            {history.map((term, index) => (
                                <div key={index} onClick={() => handleSearch(term)} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 cursor-pointer transition-colors">
                                    <div className="flex items-center gap-4 text-zinc-300">
                                        <Clock size={18} className="text-zinc-600" />
                                        <span className="text-lg font-medium">{term}</span>
                                    </div>
                                    <button onClick={(e) => deleteHistory(e, term)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><X size={18} /></button>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* 3. 메인 콘텐츠: 좌(아이템 리스트) / 우(실시간 그래프) */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-[650px]">

                {/* ⬅️ 좌측: 아이템 목록 */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl backdrop-blur-sm">
                    <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-sm">
                            <TrendingUp size={18} /> 실시간 아이템 목록
                        </div>
                        <button onClick={fetchAndSaveData} className={`${isRefreshing ? 'animate-spin' : ''} text-zinc-500 hover:text-indigo-400 transition-colors`}>
                            <RotateCcw size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                        {marketData.map((item) => (
                            <div
                                key={item.Id}
                                onClick={() => setSelectedItem(item)}
                                className={`flex items-center justify-between px-8 py-6 cursor-pointer transition-all ${selectedItem?.Id === item.Id ? 'bg-indigo-500/10 border-l-4 border-indigo-500' : 'hover:bg-white/[0.02] border-l-4 border-transparent'}`}
                            >
                                <div className="flex items-center gap-5">
                                    <img src={item.Icon} className="w-12 h-12 bg-zinc-800 rounded-xl p-1" alt="" />
                                    <div>
                                        <p className={`font-black ${item.Grade === '전설' ? 'text-orange-400' : 'text-zinc-200'}`}>{item.Name}</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{item.Grade}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-amber-400 leading-none">{item.CurrentMinPrice.toLocaleString()}G</p>
                                    <p className="text-[10px] text-zinc-600 font-bold mt-1 uppercase tracking-tighter">Min Price</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ➡️ 우측: 실제 데이터 기반 실시간 1시간 그래프 */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] flex flex-col p-10 shadow-2xl backdrop-blur-sm relative">
                    {selectedItem ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tighter">{selectedItem.Name}</h2>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-emerald-500 text-[11px] font-black uppercase">Live Recording (1m)</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase mb-1">Current Price</p>
                                    <p className="text-4xl font-black text-amber-400 leading-none">{selectedItem.CurrentMinPrice.toLocaleString()}G</p>
                                </div>
                            </div>

                            {/* 그래프 영역 */}
                            <div className="flex-1 min-h-0 bg-black/20 rounded-[2rem] p-6 border border-white/5 relative">
                                {realTimeHistory.length < 2 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 rounded-[2rem] z-10 text-zinc-500 text-sm font-bold animate-pulse">
                                        데이터 수집 중... (최소 2분 소요)
                                    </div>
                                )}
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={realTimeHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis hide domain={['auto', 'auto']} />
                                        <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', color: '#fff' }} />
                                        <ReferenceLine y={selectedItem.YDayAvgPrice} stroke="#3f3f46" strokeDasharray="5 5" label={{ value: '전일 평균', position: 'right', fill: '#3f3f46', fontSize: 10 }} />
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#818cf8"
                                            strokeWidth={3}
                                            dot={{ r: 3, fill: '#818cf8', strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#818cf8' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-6 flex justify-between items-center text-zinc-500">
                                <div className="flex items-center gap-2 text-[11px] font-bold">
                                    <History size={14} className="text-indigo-500" />
                                    <span>수집된 포인트: {realTimeHistory.length} / 60</span>
                                </div>
                                <p className="text-[10px] font-bold text-zinc-600 italic">단위: {selectedItem.BundleCount}개 | 전일 평균: {selectedItem.YDayAvgPrice.toLocaleString()}G</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-zinc-600 font-bold border-2 border-dashed border-white/5 rounded-[2.5rem]">
                            마켓 데이터를 불러오는 중입니다...
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default HomePage;