import React, { useMemo, useState } from "react";
import { Gavel, Copy, CheckCircle2 } from "lucide-react";

const GoldCalculator = () => { // 컴포넌트명을 역할에 맞게 변경 (RaidPage 내에서 호출되므로)
    const [priceInput, setPriceInput] = useState<string>("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const price = useMemo(() => {
        const n = Number(priceInput);
        return Number.isFinite(n) ? Math.max(0, n) : 0;
    }, [priceInput]);

    const formatGold = (n: number) =>
        `${Math.max(0, Math.floor(n)).toLocaleString("ko-KR")} G`;

    const plainInt = (n: number) => String(Math.max(0, Math.floor(n)));

    // ✅ 계산 로직
    const { bid4, bid8, bid16 } = useMemo(() => {
        const net = price * 0.95;
        const calc = (k: number) => net * ((k - 1) / k);
        return { bid4: calc(4), bid8: calc(8), bid16: calc(16) };
    }, [price]);

    const { sellBid4, sellBid8, sellBid16, targetProfit } = useMemo(() => {
        const net = price * 0.95;
        const target = Math.min(price * 0.10, 3000);
        const calc = (k: number) => {
            const base = net - target;
            return base <= 0 ? 0 : base * ((k - 1) / k);
        };
        return {
            sellBid4: calc(4),
            sellBid8: calc(8),
            sellBid16: calc(16),
            targetProfit: target,
        };
    }, [price]);

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1000);
        } catch (err) { console.error(err); }
    };

    const BidButton = ({ label, value, id, colorClass }: any) => (
        <button
            type="button"
            onClick={() => copyToClipboard(plainInt(value), id)}
            className={`group relative text-left p-3 md:p-4 bg-zinc-900/80 rounded-2xl border border-white/5 hover:border-${colorClass}-500/50 active:scale-95 transition-all duration-200`}
        >
            <div className="flex justify-between items-start mb-1">
                <p className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase">{label}</p>
                {copiedId === id ? (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                ) : (
                    <Copy size={10} className="text-zinc-700 group-hover:text-zinc-400" />
                )}
            </div>
            <p className={`text-sm md:text-lg font-black mt-1 break-all ${copiedId === id ? 'text-white' : `text-${colorClass}-400`}`}>
                {formatGold(value)}
            </p>
        </button>
    );

    return (
        <div className="w-full max-w-5xl mx-auto py-4 md:py-10 px-4">
            {/* 헤더 섹션: 조금 더 슬림하게 조정 */}
            <div className="flex flex-col mb-8 space-y-1">
                <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                    경매 계산기
                </h1>
                <p className="text-[11px] md:text-sm text-zinc-500 font-medium ml-4">레이드 전리품 분배를 위한 최적의 입찰가 가이드</p>
            </div>

            {/* 메인 컨테이너: 좌우 분할 레이아웃 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

                {/* [좌측 카드] - 시세 입력 (40% 비중) */}
                <div className="md:col-span-5 lg:col-span-4 flex">
                    <div className="w-full bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
                        {/* 은은한 배경 효과 */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500" />

                        <div className="relative z-10">
                            <p className="text-[10px] md:text-[11px] font-black text-indigo-400 uppercase mb-4 tracking-[0.2em]">
                                Current Market Price
                            </p>
                            <div className="space-y-1">
                                <div className="relative">
                                    <input
                                        type="text" // number에서 text로 변경
                                        inputMode="numeric"
                                        pattern="[0-9]*" // 숫자만 허용하는 패턴
                                        className="bg-transparent w-full text-3xl md:text-4xl font-black text-white outline-none placeholder:text-zinc-800 transition-all focus:scale-[1.02] origin-left"
                                        placeholder="0"
                                        value={priceInput}
                                        onChange={(e) => {
                                            // 숫자만 입력받도록 필터링 로직 추가
                                            const value = e.target.value.replace(/[^0-9]/g, '');
                                            setPriceInput(value);
                                        }}
                                    />
                                    <span className="absolute right-0 bottom-1.5 text-lg font-bold text-zinc-600">G</span>
                                </div>
                                <div className="h-1 w-20 bg-indigo-500 rounded-full" />
                            </div>
                        </div>

                        <div className="mt-12 pt-6 border-t border-white/5 relative z-10">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-tight">Net Income</span>
                                <span className="text-sm text-indigo-300 font-black">{(price * 0.95).toLocaleString()} G</span>
                            </div>
                            <p className="text-[10px] text-zinc-600">거래소 수수료 5% 제외 실수령액</p>
                        </div>
                    </div>
                </div>

                {/* [우측 카드] - 결과 출력 (60% 비중) */}
                <div className="md:col-span-7 lg:col-span-8">
                    <div className="h-full bg-zinc-900/30 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/5 flex flex-col gap-8">

                        {/* 본인 사용 섹션 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <p className="text-[11px] md:text-[12px] font-black text-zinc-400 uppercase tracking-widest">
                                    본인 사용 <span className="text-zinc-600 ml-2 font-medium">(손익분기점)</span>
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <BidButton label="4인" value={bid4} id="b4" colorClass="emerald" />
                                <BidButton label="8인" value={bid8} id="b8" colorClass="sky" />
                                <BidButton label="16인" value={bid16} id="b16" colorClass="purple" />
                            </div>
                        </section>

                        {/* 판매 목적 섹션 */}
                        <section className="space-y-4">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <p className="text-[11px] md:text-[12px] font-black text-zinc-400 uppercase tracking-widest">
                                        판매 목적 <span className="text-zinc-600 ml-2 font-medium">(수익 확보)</span>
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <BidButton label="4인" value={sellBid4} id="sb4" colorClass="emerald" />
                                <BidButton label="8인" value={sellBid8} id="sb8" colorClass="sky" />
                                <BidButton label="16인" value={sellBid16} id="sb16" colorClass="purple" />
                            </div>
                        </section>

                        <div className="mt-auto pt-4 flex items-center justify-center gap-2 opacity-30">
                            <div className="w-8 h-[1px] bg-zinc-700" />
                            <p className="text-[9px] md:text-[10px] text-zinc-500 font-medium">
                                금액 클릭 시 복사
                            </p>
                            <div className="w-8 h-[1px] bg-zinc-700" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoldCalculator;