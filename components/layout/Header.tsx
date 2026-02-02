import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Home, Shield, Calculator, Gavel, Search, X, Clock, Sparkles, Heart,Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import mokoko from "../../assets/모코코.png";

interface HeaderProps {
    setIsMenuOpen: (open: boolean) => void;
    isExploding: boolean;
    setIsExploding: (val: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsMenuOpen, isExploding, setIsExploding }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");

    const [history, setHistory] = useState<string[]>(() => {
        const saved = localStorage.getItem('searchHistory');
        return saved ? JSON.parse(saved) : [];
    });

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    const [clickCount, setClickCount] = useState(0);

    const THEME_PINK = "#FFC0CB";

    // 폭죽 애니메이션
    const fireConfetti = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const particles: any[] = [];
        const colors = [THEME_PINK, '#FFD1DC', '#FFF0F5', '#ffffff', '#FFB6C1'];
        const duration = 10000; // 10초 지속
        const startTime = Date.now();

        const createParticle = () => ({
            x: Math.random() * canvas.width,
            y: canvas.height + 20,
            radius: Math.random() * 3 + 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            velocity: {
                x: (Math.random() - 0.5) * 10,
                y: -(Math.random() * 15 + 10)
            },
            gravity: 0.2,
            friction: 0.99,
            opacity: 1
        });

        const animate = () => {
            const elapsed = Date.now() - startTime;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (elapsed < duration) {
                for (let i = 0; i < 3; i++) {
                    particles.push(createParticle());
                }
            }

            particles.forEach((p, i) => {
                p.velocity.y += p.gravity;
                p.velocity.x *= p.friction;
                p.x += p.velocity.x;
                p.y += p.velocity.y;
                p.opacity -= 0.007;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();

                if (p.opacity <= 0) particles.splice(i, 1);
            });

            if (particles.length > 0 || elapsed < duration) {
                requestRef.current = requestAnimationFrame(animate);
            }
        };

        requestRef.current = requestAnimationFrame(animate);
    }, [THEME_PINK]);

    useEffect(() => {
        if (isExploding) {
            fireConfetti();
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            ctx?.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
        }
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [isExploding, fireConfetti]);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);

        const handleClickOutside = (e: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
                setIsHistoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 클릭 핸들러 수정
    const handleMokokoClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);

        // 10번째 클릭일 때만 모드 전환
        if (newCount % 10 === 0) {
            const nextExplodingState = !isExploding;
            setIsExploding(nextExplodingState);

            if (nextExplodingState) {
                setIsExpanded(true);
                setTimeout(() => setIsExpanded(false), 2000);
            } else {
                setIsExpanded(false);
            }
        }
    };

    const handleSearch = (e: React.FormEvent | string) => {
        if (typeof e !== 'string') e.preventDefault();
        const query = typeof e === 'string' ? e : searchQuery;
        const trimmedQuery = query.trim();

        if (trimmedQuery) {
            const updatedHistory = [trimmedQuery, ...history.filter((item) => item !== trimmedQuery)].slice(0, 5);
            setHistory(updatedHistory);
            localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
            navigate(`/profilePage?name=${encodeURIComponent(trimmedQuery)}`);
            setSearchQuery("");
            setIsHistoryOpen(false);
        }
    };

    const deleteHistory = (e: React.MouseEvent, term: string) => {
        e.stopPropagation();
        const updatedHistory = history.filter((item) => item !== term);
        setHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    };

    return (
        <>
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />

            <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-700 
                ${isExploding
                ? 'bg-black/80 border-none shadow-[0_4px_25px_rgba(255,192,203,0.2)]'
                : 'bg-black/90 border-b border-white/5'}
                ${isExpanded ? 'py-8' : 'py-4'}`}
            >
                <div className="max-w-[1200px] mx-auto flex items-center justify-between px-4">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsMenuOpen(true)} className={`p-1 transition-colors ${isExploding ? 'text-[#FFC0CB] hover:text-white' : 'text-zinc-400 hover:text-white'}`}>
                                <Menu size={24} />
                            </button>

                            <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer select-none group">
                                <h1 className={`font-black tracking-tighter transition-all duration-500 
                                    ${isExpanded ? 'text-3xl' : 'text-2xl'} 
                                    ${isExploding ? 'text-[#FFC0CB]' : 'text-white'}`}
                                >
                                    {isExploding ? '로앙' : 'LOAPANG'}
                                </h1>
                                {isExploding && (
                                    <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}>
                                        <Heart size={18} className="fill-[#FFC0CB] text-[#FFC0CB]" />
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-7 ml-4">
                            {[
                                { id: 'home', label: '홈', icon: Home, path: '/' },
                                { id: 'raid', label: '군단장', icon: Shield, path: '/raidPage' },
                                { id: 'simulator', label: '시뮬레이터', icon: Calculator, path: '/simulatorPage' },
                                { id: 'auction', label: '경매', icon: Gavel, path: '/auctionPage' },
                                { id: 'rank', label: '랭킹', icon: Crown, path: '/rankingPage' },
                            ].map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => navigate(item.path)}
                                        className={`flex items-center gap-2 text-[15px] font-bold transition-all ${
                                            isActive
                                                ? (isExploding ? 'text-[#FFC0CB]' : 'text-white')
                                                : (isExploding ? 'text-zinc-500 hover:text-[#FFC0CB]' : 'text-zinc-400 hover:text-zinc-300')
                                        }`}
                                    >
                                        <item.icon size={18} strokeWidth={isActive ? 3 : 2} className={isActive && isExploding ? 'text-[#FFC0CB]' : ''} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block" ref={historyRef}>
                            <form onSubmit={handleSearch}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsHistoryOpen(true)}
                                    placeholder="캐릭터 검색"
                                    className={`w-48 lg:w-64 py-2 pl-10 pr-4 rounded-xl text-sm outline-none transition-all focus:w-72 
                                        ${isExploding
                                        ? 'bg-zinc-900 border-1 border-[#FFC0CB]/40 text-white focus:border-[#FFC0CB]'
                                        : 'bg-zinc-900 border-white/5 text-zinc-200 focus:border-white/20'}`}
                                />
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isExploding ? 'text-[#FFC0CB]' : 'text-zinc-500'}`} size={16} />
                            </form>

                            <AnimatePresence>
                                {isHistoryOpen && history.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className={`absolute top-full mt-2 left-0 right-0 z-[60] rounded-xl border overflow-hidden
                                            ${isExploding ? 'bg-zinc-900 border-[#FFC0CB]/30' : 'bg-zinc-900 border-white/10'}`}
                                    >
                                        <div className={`px-4 py-2 text-[10px] font-bold uppercase border-b border-white/5 ${isExploding ? 'text-[#FFC0CB]' : 'text-zinc-500'}`}>
                                            최근 검색어
                                        </div>
                                        {history.map((term, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSearch(term)}
                                                className={`flex items-center justify-between px-4 py-3 cursor-pointer group transition-colors ${isExploding ? 'hover:bg-[#FFC0CB]/10' : 'hover:bg-white/5'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Clock size={14} className={isExploding ? 'text-[#FFC0CB]' : 'text-zinc-500'} />
                                                    <span className={`text-sm font-medium ${isExploding ? 'text-zinc-200 group-hover:text-[#FFC0CB]' : 'text-zinc-300 group-hover:text-white'}`}>{term}</span>
                                                </div>
                                                <button onClick={(e) => deleteHistory(e, term)} className="p-1 text-zinc-600 hover:text-white">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="relative">
                            {isExploding && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1">
                                    <Sparkles size={14} className="text-[#FFC0CB] fill-[#FFC0CB]" />
                                    <span className="text-[10px] font-black text-[#FFC0CB] whitespace-nowrap tracking-widest">
                                        LO-ANG MODE
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={handleMokokoClick}
                                className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg shrink-0 transition-all duration-300 active:scale-90 relative
                                    ${isExploding
                                    ? 'bg-zinc-900 border-2 border-[#FFC0CB] shadow-[0_0_15px_rgba(255,192,203,0.3)]'
                                    : 'bg-zinc-800 border border-white/10 hover:border-[#FFC0CB]/50'}`}
                            >
                                <motion.img
                                    src={mokoko}
                                    alt="Mokoko"
                                    animate={{ rotate: clickCount * 360 }}
                                    transition={{
                                        duration: 0.25, // 회전 속도를 0.4초에서 0.25초로 더 빠르게 수정
                                        ease: "circOut" // 끝이 더 절도 있게 멈추는 효과
                                    }}
                                    className={`w-8 h-8 object-contain transition-all duration-500 ${isExploding ? 'scale-110' : ''}`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Header;