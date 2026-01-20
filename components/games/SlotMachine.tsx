
import React, { useState, useRef } from 'react';
import { Theme } from '../../types';
import { ArrowLeft, Coins, RotateCcw, Sparkles, Trophy, Frown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../../utils/soundEffects';
import { useRipple } from '../../App';

const SYMBOL_DATA = [
  { char: '🇧🇷', value: 200, name: 'Brasil' },
  { char: '🇺🇸', value: 100, name: 'EUA' },
  { char: '🇯🇵', value: 100, name: 'Japão' },
  { char: '🇩🇪', value: 50, name: 'Alemanha' },
  { char: '🇨🇳', value: 50, name: 'China' },
  { char: '🇬🇧', value: 20, name: 'Reino Unido' },
  { char: '🇫🇷', value: 20, name: 'França' },
  { char: '🇮🇹', value: 10, name: 'Itália' },
  { char: '🇦🇷', value: 10, name: 'Argentina' },
  { char: '🇪🇸', value: 0, name: 'Espanha' },
  { char: '🇨🇦', value: 0, name: 'Canadá' },
  { char: '🇰🇷', value: 0, name: 'Coreia do Sul' },
];

const SlotMachine: React.FC<{ theme: Theme }> = ({ theme }) => {
  const ripple = useRipple();
  const [activeIndex, setActiveIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [balance, setBalance] = useState(500); // Saldo inicial $500
  const [lastWin, setLastWin] = useState<number | null>(null);
  const spinRef = useRef<any>(null);

  const startSpin = (event: React.MouseEvent) => {
    ripple(event);
    if (spinning || balance < 5) return; // Custa $5 por jogada
    
    setBalance(b => b - 5);
    setSpinning(true);
    setLastWin(null);
    
    let currentIdx = activeIndex;
    let speed = 50;
    let steps = 40 + Math.floor(Math.random() * 30);

    const run = () => {
      currentIdx = (currentIdx + 1) % SYMBOL_DATA.length;
      setActiveIndex(currentIdx);
      sounds.playDice();
      steps--;

      if (steps < 12) speed += 60;
      if (steps > 0) {
        spinRef.current = setTimeout(run, speed);
      } else {
        setSpinning(false);
        const wonAmount = SYMBOL_DATA[currentIdx].value;
        setLastWin(wonAmount);
        setBalance(b => b + wonAmount);
        
        if (wonAmount > 0) {
          sounds.playWin();
        } else {
          sounds.playLoss();
        }
      }
    };
    run();
  };

  const panelBg = theme === 'dark' ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-black/10';

  return (
    <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto p-4 animate-in fade-in duration-500 pb-24">
      <div className={`w-full flex justify-between items-center p-4 rounded-3xl border shadow-2xl ${panelBg}`}>
        <Link to="/" onMouseDown={ripple} className="relative overflow-hidden flex items-center gap-2 font-black text-[10px] uppercase p-3 rounded-xl hover:bg-zinc-500/10 transition-all">
          <ArrowLeft size={18} /> Menu
        </Link>
        <div className="flex items-center gap-3 bg-yellow-500 text-black px-6 py-2.5 rounded-2xl font-black shadow-lg transform hover:scale-105 transition-transform">
          <Coins size={22} className="animate-pulse" /> 
          <span className="text-xl tracking-tighter">${balance}</span>
        </div>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Tabuleiro da Roleta */}
        <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-3 p-6 bg-black rounded-[3rem] border-[10px] border-zinc-900 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none"></div>
          {SYMBOL_DATA.map((s, i) => (
            <div 
              key={i} 
              className={`relative flex flex-col items-center justify-center rounded-2xl aspect-square border-4 transition-all duration-150 ${
                activeIndex === i 
                ? 'bg-orange-600 border-white scale-110 shadow-[0_0_40px_rgba(234,88,12,0.8)] z-10' 
                : 'bg-zinc-900 border-white/5 opacity-30 grayscale-[0.5]'
              }`}
            >
              <span className="text-3xl sm:text-5xl">{s.char}</span>
              <span className={`text-[8px] font-black mt-1 ${activeIndex === i ? 'text-white' : 'text-zinc-500'}`}>
                {s.value > 0 ? `$${s.value}` : 'NADA'}
              </span>
            </div>
          ))}
        </div>

        {/* Controles e Status */}
        <div className={`w-full lg:w-80 p-8 rounded-[2.5rem] border shadow-2xl flex flex-col items-center text-center gap-6 ${panelBg}`}>
          <div className="space-y-1">
            <h3 className="font-black italic text-2xl uppercase tracking-tighter">NATIONS <span className="text-orange-600">SLOTS</span></h3>
            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Aposta: $5</p>
          </div>

          <div className="w-full aspect-square max-w-[180px] flex flex-col items-center justify-center border-4 border-dashed border-zinc-500/20 rounded-full p-6 bg-zinc-500/5">
             {spinning && (
               <div className="animate-spin text-orange-600">
                  <RotateCcw size={64} />
               </div>
             )}
             {!spinning && lastWin !== null && (
               <div className="animate-in zoom-in duration-300 flex flex-col items-center">
                  {lastWin > 0 ? (
                    <>
                      <Trophy size={64} className="text-yellow-500 mb-2 animate-bounce" />
                      <p className="text-emerald-500 font-black text-4xl italic leading-none">+${lastWin}</p>
                      <p className="text-[10px] font-black uppercase opacity-60 mt-1">VENCEDOR!</p>
                    </>
                  ) : (
                    <>
                      <Frown size={64} className="text-red-600 mb-2 animate-pulse" />
                      <p className="text-red-500 font-black text-lg italic uppercase leading-none">TENTE NOVAMENTE</p>
                      <span className="text-4xl mt-1">😢</span>
                    </>
                  )}
               </div>
             )}
             {!spinning && lastWin === null && <Sparkles size={48} className="opacity-10" />}
          </div>

          <button 
            onMouseDown={startSpin} 
            disabled={spinning || balance < 5} 
            className="w-full py-6 bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-[2rem] font-black text-2xl italic hover:scale-105 active:scale-95 shadow-2xl disabled:opacity-30 disabled:grayscale transition-all"
          >
            {spinning ? 'SORTEANDO...' : 'JOGAR AGORA'}
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
             <div className="p-3 bg-zinc-500/5 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black opacity-30 uppercase">Jackpot</p>
                <p className="font-black text-emerald-500">$200</p>
             </div>
             <div className="p-3 bg-zinc-500/5 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black opacity-30 uppercase">Jogada</p>
                <p className="font-black text-zinc-400">$5</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotMachine;
