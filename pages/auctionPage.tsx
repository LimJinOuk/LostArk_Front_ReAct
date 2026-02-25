import React, { useMemo, useState, useRef } from "react";
import { Copy, CheckCircle2, Delete, RotateCcw, Gavel } from "lucide-react";

const GoldCalculator = () => {
    const [priceInput, setPriceInput] = useState<string>("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const price = useMemo(() => {
        const n = Number(priceInput.replace(/[^0-9]/g, ''));
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

    const { sellBid4, sellBid8, sellBid16 } = useMemo(() => {
        const net = price * 0.95;
        const target = Math.min(price * 0.10, 3000);
        const calc = (k: number) => {
            const base = net - target;
            return base <= 0 ? 0 : base * ((k - 1) / k);
        };
        return { sellBid4: calc(4), sellBid8: calc(8), sellBid16: calc(16) };
    }, [price]);

    // ✅ 키패드 & 키보드 통합 핸들러
    const handleKeyClick = (key: string) => {
        if (key === "clear") {
            setPriceInput("");
        } else if (key === "backspace") {
            setPriceInput(prev => prev.slice(0, -1));
        } else {
            if (priceInput.length < 9) {
                setPriceInput(prev => (prev === "0" ? key : prev + key));
            }
        }
        inputRef.current?.focus();
    };

    const copyToClipboard = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1000);
        } catch (err) { console.error(err); }
    };

    const KeyButton = ({ value, label, icon: Icon, colorClass = "zinc" }: any) => (
        <button
            type="button"
            onClick={() => handleKeyClick(value)}
            className={`flex items-center justify-center h-12 md:h-14 rounded-xl border border-white/5 font-bold transition-all active:scale-90 
            ${colorClass === "red" ? "bg-red-500/10 text-red-400" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}
        >
            {Icon ? <Icon size={18} /> : <span className="text-lg">{label || value}</span>}
        </button>
    );

    // ✅ 등급별 색상 정의 (텍스트/그라데이션 강조용)
    const gradeColors: any = {
        artifact: "from-[#E67E22] to-[#FF9130] text-[#FF9130]", // 유물 (4인)
        ancient: "from-[#E5D2A0] to-[#F5E1AD] text-[#F5E1AD]",  // 고대 (8인)
        esther: "from-[#00E5FF] to-[#70F5FF] text-[#70F5FF]"    // 에스더 (16인)
    };

    const BidButton = ({ label, value, id, grade }: any) => (
        <button
            type="button"
            onClick={() => copyToClipboard(plainInt(value), id)}
            className="group relative text-left p-3 md:p-4 bg-zinc-900/80 rounded-2xl border border-white/5 hover:border-white/20 active:scale-95 transition-all duration-200 overflow-hidden"
        >
            <div className="flex justify-between items-start mb-1 relative z-10">
                <p className="text-[11px] md:text-[12px] font-bold text-zinc-500 uppercase">{label}</p>
                {copiedId === id ? (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                ) : (
                    <Copy size={10} className="text-zinc-700 group-hover:text-zinc-400" />
                )}
            </div>
            {/* 금액 텍스트에만 등급 색상 적용 */}
            <p className={`text-sm md:text-xl font-black mt-1 break-all relative z-10 ${copiedId === id ? 'text-white' : gradeColors[grade].split(' ').pop()}`}>
                {formatGold(value)}
            </p>
            {/* 하단에 살짝 깔리는 등급 색상 그라데이션 바 */}
            <div className={`absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r ${gradeColors[grade].split(' ').slice(0,2).join(' ')} opacity-30`} />
        </button>
    );

    return (
        <div className="w-full max-w-5xl mx-auto py-4 md:py-10 px-4">
            <div className="flex flex-col items-center justify-center mb-16 text-center pt-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-indigo-500 to-transparent opacity-50" />
                    <Gavel className="text-indigo-400 w-10 h-10" />
                    <h1 className="text-3xl md:text-5xl font-black text-zinc tracking-tighter uppercase px-4">
                        경매 계산기
                    </h1>
                    <Gavel className="text-indigo-400 w-10 h-10" />
                    <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-indigo-500 to-transparent opacity-50" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-20">
                {/* [좌측] 입력 섹션 */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="bg-zinc-900/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/10 shadow-2xl relative">
                        <div className="relative z-10 mb-6">
                            <p className="text-[14px] font-black text-indigo-400 uppercase mb-2 tracking-[0.2em]">Aucton Calc</p>
                            <div className="flex items-end gap-1 border-b-2 border-indigo-500/30 pb-2 focus-within:border-indigo-400 transition-all">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    inputMode="numeric"
                                    value={priceInput === "" ? "" : Number(priceInput).toLocaleString()}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        if (val.length < 10) setPriceInput(val);
                                    }}
                                    className="bg-transparent w-full text-3xl md:text-4xl font-black text-white outline-none placeholder:text-zinc-800"
                                    placeholder="0"
                                />
                                <span className="text-lg font-bold text-zinc-600 mb-1.5">G</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(num => (
                                <KeyButton key={num} value={num} />
                            ))}
                            <KeyButton value="clear" icon={RotateCcw} colorClass="red" />
                            <KeyButton value="0" />
                            <KeyButton value="backspace" icon={Delete} />
                        </div>
                    </div>
                </div>

                {/* [우측] 결과 섹션 */}
                <div className="lg:col-span-7">
                    <div className="h-full bg-zinc-900/30 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/5 flex flex-col gap-8">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-1.5 h-5 bg-blue-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                                <p className="text-[14px] font-black text-zinc-300 uppercase tracking-widest">본인 사용 (손익분기)</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <BidButton label="4인" value={bid4} id="b4" grade="artifact" />
                                <BidButton label="8인" value={bid8} id="b8" grade="ancient" />
                                <BidButton label="16인" value={bid16} id="b16" grade="esther" />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-1.5 h-5 bg-purple-950 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"></div>
                                <p className="text-[14px] font-black text-zinc-300 uppercase tracking-widest">판매 목적 (수익 확보)</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <BidButton label="4인" value={sellBid4} id="sb4" grade="artifact" />
                                <BidButton label="8인" value={sellBid8} id="sb8" grade="ancient" />
                                <BidButton label="16인" value={sellBid16} id="sb16" grade="esther" />
                            </div>
                        </section>

                        <div className="mt-auto pt-4 text-center opacity-20">
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Tap the amount to copy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoldCalculator;