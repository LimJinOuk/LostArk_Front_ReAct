import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    Search,
    Server,
    Users,
    Zap,
    ChevronRight,
    TrendingUp
} from "lucide-react";

interface Ranker {
    id: number;
    name: string;
    class: string;
    server: string;
    level: string;
    combatPower: number;
    guild: string;
}

const RANKING_DATA: Ranker[] = [
    { id: 1, name: "천우희", class: "소울이터", server: "니나브", level: "1794.16", combatPower: 8636, guild: "호려울" },
    { id: 2, name: "마스터Asia", class: "버서커", server: "루페온", level: "1797.5", combatPower: 8567, guild: "" },
    { id: 3, name: "만배", class: "슬레이어", server: "카제로스", level: "1797.5", combatPower: 8479, guild: "캔디" },
    { id: 4, name: "Fuzzy", class: "리퍼", server: "카마인", level: "1797.5", combatPower: 8419, guild: "사심" },
    { id: 5, name: "형님", class: "스트라이커", server: "니나브", level: "1796.66", combatPower: 8322, guild: "OCN" },
    { id: 6, name: "환업", class: "실리안", server: "스트라이커", level: "1797.5", combatPower: 8307, guild: "렙업" },
    { id: 7, name: "해리소나", class: "블레이드", server: "아브렐슈드", level: "1795.83", combatPower: 8193, guild: "암전" },
    { id: 8, name: "드리워진날", class: "홀리나이트", server: "카제로스", level: "1791.66", combatPower: 8185, guild: "PRESSO" },
    { id: 9, name: "노말", class: "브레이커", server: "카마인", level: "1796.66", combatPower: 8149, guild: "체리" },
    { id: 10, name: "여우비는주르르", class: "서머너", server: "카제로스", level: "1788.33", combatPower: 8148, guild: "힌토끼" },
    { id: 11, name: "영무콩", class: "브레이커", server: "루페온", level: "1796.66", combatPower: 8127, guild: "지존" },
    { id: 12, name: "xnaki", class: "가디언나이트", server: "루페온", level: "1797.5", combatPower: 8076, guild: "" },
    { id: 13, name: "무라타Saber", class: "발키리", server: "루페온", level: "1797.5", combatPower: 8071, guild: "" },
    { id: 14, name: "무라타Himek0", class: "슬레이어", server: "루페온", level: "1797.5", combatPower: 8066, guild: "" },
    { id: 15, name: "써라결", class: "브레이커", server: "카단", level: "1796.66", combatPower: 8042, guild: "" },
    { id: 16, name: "포롱악마", class: "리퍼", server: "루페온", level: "1790", combatPower: 8036, guild: "낙원의문" },
    { id: 17, name: "천신비후", class: "인파이터", server: "실리안", level: "1796.66", combatPower: 8024, guild: "발큐리아" },
    { id: 18, name: "시범", class: "브레이커", server: "루페온", level: "1796.66", combatPower: 8022, guild: "플레체박물관" },
    { id: 19, name: "휘린", class: "블레이드", server: "니나브", level: "1797.5", combatPower: 8017, guild: "어썰트" },
    { id: 20, name: "이승건", class: "호크아이", server: "아만", level: "1800", combatPower: 7990, guild: "포도" },
    { id: 21, name: "흑인파워", class: "디스트로이어", server: "니나브", level: "1796.66", combatPower: 7985, guild: "우상" },
    { id: 22, name: "방울토마토라면", class: "소서리스", server: "루페온", level: "1797.5", combatPower: 7977, guild: "X0" },
    { id: 23, name: "코니참모총장", class: "슬레이어", server: "니나브", level: "1797.5", combatPower: 7976, guild: "어썰트" },
    { id: 24, name: "룩쌈", class: "브레이커", server: "카마인", level: "1796.66", combatPower: 7965, guild: "화려한" },
    { id: 25, name: "도브8", class: "소서리스", server: "니나브", level: "1796.66", combatPower: 7961, guild: "우상" },
    { id: 26, name: "pongpong1", class: "슬레이어", server: "카단", level: "1797.5", combatPower: 7942, guild: "" },
    { id: 27, name: "소희솔", class: "건슬링어", server: "니나브", level: "1791.66", combatPower: 7934, guild: "경미참" },
    { id: 28, name: "희영", class: "소울이터", server: "루페온", level: "1796.66", combatPower: 7902, guild: "속삭" },
    { id: 29, name: "슈룹룹룹룹", class: "기상술사", server: "카제로스", level: "1792.5", combatPower: 7908, guild: "해맑은아침" },
    { id: 30, name: "이카사란", class: "버서커", server: "루페온", level: "1797.5", combatPower: 7880, guild: "로팡단" },
    { id: 31, name: "Tii", class: "리퍼", server: "실리안", level: "1797.5", combatPower: 7883, guild: "피스하로" },
    { id: 32, name: "악운", class: "아르카나", server: "루페온", level: "1791.66", combatPower: 7872, guild: "뭐요뭐요" },
    { id: 33, name: "아컁", class: "건슬링어", server: "아브렐슈드", level: "1797.5", combatPower: 7869, guild: "슈밍" },
    { id: 34, name: "보라냥이집사8", class: "스트라이커", server: "카제로스", level: "1790", combatPower: 7869, guild: "쁘요" },
    { id: 35, name: "본창", class: "스트라이커", server: "카마인", level: "1796.66", combatPower: 7854, guild: "뮤즈" },
    { id: 36, name: "폭주전투사", class: "버서커", server: "실리안", level: "1788.33", combatPower: 7848, guild: "쌉숙련" },
    { id: 37, name: "차사", class: "아르카나", server: "아만", level: "1794.16", combatPower: 7831, guild: "차사단" },
    { id: 38, name: "유우시", class: "스트라이커", server: "카마인", level: "1800", combatPower: 7829, guild: "흑요" },
    { id: 39, name: "불포차", class: "인파이터", server: "실리안", level: "1796.66", combatPower: 7805, guild: "데헷" },
    { id: 40, name: "쉐도우", class: "리퍼", server: "루페온", level: "1783.33", combatPower: 7793, guild: "낙원의문" },
    { id: 41, name: "남산의도부장", class: "브레이커", server: "아만", level: "1796.66", combatPower: 7790, guild: "벚꽃" },
    { id: 42, name: "향귀다", class: "리퍼", server: "아만", level: "1792.5", combatPower: 7778, guild: "콩꽃" },
    { id: 43, name: "이다", class: "브레이커", server: "루페온", level: "1787.5", combatPower: 7772, guild: "모코코" },
    { id: 44, name: "간즈", class: "디스트로이어", server: "루페온", level: "1797.5", combatPower: 7759, guild: "EX" },
    { id: 45, name: "보라냥이집사16", class: "브레이커", server: "카제로스", level: "1796.66", combatPower: 7747, guild: "쁘요" },
    { id: 46, name: "쥐지잇", class: "인파이터", server: "카제로스", level: "1796.66", combatPower: 7742, guild: "은하별" },
    { id: 47, name: "꼬북", class: "서머너", server: "카마인", level: "1791.66", combatPower: 7742, guild: "멍멍" },
    { id: 48, name: "꺼억콩", class: "서머너", server: "카제로스", level: "1794.16", combatPower: 7736, guild: "마적단" },
    { id: 49, name: "펜리르", class: "호크아이", server: "루페온", level: "1800", combatPower: 7730, guild: "천재" },
    { id: 50, name: "킹하산", class: "데모닉", server: "아브렐슈드", level: "1785", combatPower: 7719, guild: "샨도라" },
    { id: 51, name: "세윳", class: "아르카나", server: "루페온", level: "1797.5", combatPower: 7718, guild: "원정대" },
    { id: 52, name: "팡갱이", class: "아르카나", server: "카제로스", level: "1789.16", combatPower: 7704, guild: "보송" },
    { id: 53, name: "구라가짱센데너무신중하다", class: "슬레이어", server: "카제로스", level: "1785.83", combatPower: 7703, guild: "은하수바다" },
    { id: 54, name: "방백려", class: "창술사", server: "실리안", level: "1791.66", combatPower: 7702, guild: "순간" },
    { id: 55, name: "쵸쵸쵸팡", class: "슬레이어", server: "루페온", level: "1785", combatPower: 7679, guild: "" },
    { id: 56, name: "성갬뽕", class: "기상술사", server: "루페온", level: "1788.33", combatPower: 7676, guild: "낙낙" },
    { id: 57, name: "필례", class: "배틀마스터", server: "루페온", level: "1775.83", combatPower: 7672, guild: "X0" },
    { id: 58, name: "랜스", class: "워로드", server: "카단", level: "1796.66", combatPower: 7670, guild: "카단양로원" },
    { id: 59, name: "츄델", class: "기상술사", server: "카마인", level: "1796.66", combatPower: 7656, guild: "매지컬" },
    { id: 60, name: "펀치", class: "브레이커", server: "루페온", level: "1785", combatPower: 7644, guild: "악마" },
    { id: 61, name: "브커나은", class: "브레이커", server: "카마인", level: "1797.5", combatPower: 7632, guild: "카마인의습격" },
    { id: 62, name: "사과잼민이", class: "창술사", server: "루페온", level: "1796.66", combatPower: 7629, guild: "과시" },
    { id: 63, name: "몽키", class: "블래스터", server: "카마인", level: "1797.5", combatPower: 7610, guild: "블루베리잼" },
    { id: 64, name: "꼬마완두", class: "스카우터", server: "카마인", level: "1800", combatPower: 7606, guild: "흑요" },
    { id: 65, name: "멱살잡고캐뤼", class: "건슬링어", server: "카단", level: "1792.5", combatPower: 7602, guild: "Playlist" },
    { id: 66, name: "짹키창", class: "창술사", server: "루페온", level: "1785", combatPower: 7584, guild: "로아사랑단" },
    { id: 67, name: "인끼", class: "소울이터", server: "루페온", level: "1784.16", combatPower: 7583, guild: "인기혈석" },
    { id: 68, name: "척아랑", class: "리퍼", server: "카마인", level: "1780.83", combatPower: 7582, guild: "Asul" },
    { id: 69, name: "반짝이는레몬버터", class: "데빌헌터", server: "카제로스", level: "1780", combatPower: 7580, guild: "로아에요" },
    { id: 70, name: "분신싸개", class: "리퍼", server: "아만", level: "1797.5", combatPower: 7577, guild: "월환" },
    { id: 71, name: "별의검", class: "리퍼", server: "아만", level: "1788.33", combatPower: 7564, guild: "빗길" },
    { id: 72, name: "아넷", class: "슬레이어", server: "루페온", level: "1791.66", combatPower: 7568, guild: "겨울" },
    { id: 73, name: "서초동리퍼", class: "리퍼", server: "카단", level: "1779.16", combatPower: 7555, guild: "템포" },
    { id: 74, name: "사과잼용기삽니다", class: "가디언나이트", server: "루페온", level: "1796.66", combatPower: 7547, guild: "과시" },
    { id: 75, name: "저징징", class: "데빌헌터", server: "니나브", level: "1780", combatPower: 7516, guild: "다봄" },
    { id: 76, name: "위안", class: "스트라이커", server: "루페온", level: "1780", combatPower: 7515, guild: "너는나에게빛이야" },
    { id: 77, name: "건슬붕", class: "건슬링어", server: "카제로스", level: "1793.33", combatPower: 7514, guild: "새치기" },
    { id: 78, name: "깃향", class: "스트라이커", server: "아브렐슈드", level: "1785.83", combatPower: 7511, guild: "연서랑" },
    { id: 79, name: "라랑님", class: "배틀마스터", server: "루페온", level: "1780", combatPower: 7510, guild: "로즈" },
    { id: 80, name: "쥬쥬", class: "바드", server: "루페온", level: "1797.5", combatPower: 7510, guild: "로즈" },
    { id: 81, name: "빙수", class: "발키리", server: "카마인", level: "1790.83", combatPower: 7504, guild: "쿠키" },
    { id: 82, name: "장화도둑훈이", class: "소울이터", server: "니나브", level: "1792.5", combatPower: 7506, guild: "별빛언덕" },
    { id: 83, name: "콕뽁", class: "리퍼", server: "카단", level: "1791.66", combatPower: 7500, guild: "백설" },
    { id: 84, name: "영루하", class: "블레이드", server: "카단", level: "1796.66", combatPower: 7497, guild: "월하" },
    { id: 85, name: "라랑놈", class: "스트라이커", server: "루페온", level: "1780", combatPower: 7489, guild: "로즈" },
    { id: 86, name: "짱수정", class: "바드", server: "카제로스", level: "1791.66", combatPower: 7485, guild: "캔디" },
    { id: 87, name: "사나이박춘팔", class: "스트라이커", server: "카마인", level: "1780", combatPower: 7475, guild: "" },
    { id: 88, name: "데니멀즈", class: "데빌헌터", server: "실리안", level: "1785.83", combatPower: 7471, guild: "치즈" },
    { id: 89, name: "Ghost", class: "리퍼", server: "아브렐슈드", level: "1790.83", combatPower: 7479, guild: "하늘" },
    { id: 90, name: "소녀양점순", class: "워로드", server: "카마인", level: "1784.16", combatPower: 7469, guild: "점순랜드" },
    { id: 91, name: "사신바라", class: "리퍼", server: "카제로스", level: "1796.66", combatPower: 7465, guild: "CtrlZ" },
    { id: 92, name: "lusale", class: "서머너", server: "카단", level: "1784.16", combatPower: 7464, guild: "저지불가" },
    { id: 93, name: "요정", class: "서머너", server: "루페온", level: "1779.16", combatPower: 7456, guild: "악마" },
    { id: 94, name: "잠푸리", class: "블레이드", server: "카마인", level: "1791.66", combatPower: 7456, guild: "노을" },
    { id: 95, name: "리계", class: "리퍼", server: "루페온", level: "1777.5", combatPower: 7446, guild: "" },
    { id: 96, name: "스커니오", class: "스트라이커", server: "카제로스", level: "1780", combatPower: 7446, guild: "알레시아" },
    { id: 97, name: "능야화", class: "블레이드", server: "루페온", level: "1785", combatPower: 7441, guild: "해피" },
    { id: 98, name: "림이", class: "도화가", server: "카단", level: "1783.33", combatPower: 7443, guild: "네임" },
    { id: 99, name: "김시끄", class: "기상술사", server: "아만", level: "1787.5", combatPower: 7437, guild: "음속돌파" }
].sort((a, b) => b.combatPower - a.combatPower);

const RankingPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredRankings = RANKING_DATA.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.class.includes(searchTerm)
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen bg-zinc-950 text-white pt-10 pb-20 px-4"
        >
            <div className="max-w-5xl mx-auto">
                {/* 헤더 섹션 */}

                {/* 검색 바 */}
                <div className="relative max-w-md mx-auto mb-10 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                    <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-2xl px-4">
                        <Search className="text-zinc-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="닉네임 또는 클래스 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 py-4 px-3 text-white font-bold"
                        />
                    </div>
                </div>

                {/* 랭킹 리스트 */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5 text-zinc-500 text-[11px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-5 text-center w-24">Rank</th>
                                <th className="px-6 py-5">Character</th>
                                <th className="px-6 py-5">Info</th>
                                <th className="px-6 py-5">Combat Power</th>
                                <th className="px-8 py-5 text-right">Details</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode='popLayout'>
                                {filteredRankings.map((ranker, index) => (
                                    <motion.tr
                                        key={ranker.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group hover:bg-white/[0.03] transition-colors"
                                    >
                                        {/* 순위 */}
                                        <td className="px-8 py-6 text-center">
                                            <div className={`
                                                    inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg
                                                    ${index === 0 ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)]' :
                                                index === 1 ? 'bg-zinc-300 text-black' :
                                                    index === 2 ? 'bg-orange-500 text-black' : 'text-zinc-500'}
                                                `}>
                                                {index + 1}
                                            </div>
                                        </td>

                                        {/* 캐릭터 정보 */}
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                    <span className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">
                                                        {ranker.name}
                                                    </span>
                                                <span className="text-xs font-bold text-indigo-500 uppercase tracking-tighter mt-0.5">
                                                        {ranker.class}
                                                    </span>
                                            </div>
                                        </td>

                                        {/* 서버 및 길드 */}
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-zinc-300 font-bold text-sm">
                                                    <Server size={14} className="text-zinc-600" />
                                                    {ranker.server}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-zinc-500 font-medium text-xs">
                                                    <Users size={14} className="text-zinc-600" />
                                                    {ranker.guild || '길드 없음'}
                                                </div>
                                            </div>
                                        </td>

                                        {/* 전투력 및 레벨 */}
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                        <span className="text-xl font-black text-amber-400 tracking-tight">
                                                            {ranker.combatPower.toLocaleString()}
                                                        </span>
                                                    <TrendingUp size={14} className="text-amber-500/50" />
                                                </div>
                                                <span className="text-xs font-mono text-zinc-500 font-bold">
                                                        Lv. {ranker.level}
                                                    </span>
                                            </div>
                                        </td>

                                        {/* 상세 정보 버튼 */}
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 rounded-xl bg-zinc-800 text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                                                <ChevronRight size={20} strokeWidth={3} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RankingPage;