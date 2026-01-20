
import React, { useState, useEffect } from 'react';
import { Theme } from '../../types';
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../../utils/soundEffects';
import { useRipple } from '../../App';

const LudoGame: React.FC<{ theme: Theme }> = ({ theme }) => {
  const ripple = useRipple();
  const [pos1, setPos1] = useState(0);
  const [pos2, setPos2] = useState(0);
  const [dice, setDice] = useState<number>(1);
  const [turn, setTurn] = useState<1 | 2>(1);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  const diceIcons = [
    <Dice1 size={64} />, <Dice2 size={64} />, <Dice3 size={64} />,
    <Dice4 size={64} />, <Dice5 size={64} />, <Dice6 size={64} />
  ];

  // Fix: Explicitly type MouseEvent to HTMLElement
  const rollDice = (event: React.MouseEvent<HTMLElement>) => {
    ripple(event);
    if (isRolling || winner) return;
    setIsRolling(true);
    sounds.playDice();
    
    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setDice(val);
      setIsRolling(false);
      
      if (turn === 1) {
        const next = pos1 + val;
        setPos1(next >= 30 ? 30 : next);
        if (next >= 30) setWinner(1);
      } else {
        const next = pos2 + val;
        setPos2(next >= 30 ? 30 : next);
        if (next >= 30) setWinner(2);
      }
      setTurn(turn === 1 ? 2 : 1);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-5xl mx-auto p-4 animate-in fade-in duration-700">
      <div className="w-full flex justify-between items-center bg-zinc-900/40 p-5 rounded-3xl border border-white/5">
        <Link to="/" onMouseDown={ripple} className="relative overflow-hidden flex items-center gap-2 font-bold p-2 rounded-xl"><ArrowLeft size={24} /> Menu</Link>
        <h2 className="text-4xl font-black text-blue-500 uppercase">Ludo Master</h2>
        <button onMouseDown={ripple} onClick={() => {setPos1(0); setPos2(0); setWinner(null);}} className="relative overflow-hidden p-3 bg-zinc-500/10 rounded-xl"><RotateCcw size={20} /></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
         <div className={`p-8 rounded-[3rem] ${theme === 'dark' ? 'bg-[#111]' : 'bg-white border shadow-xl'}`}>
            <div className="flex items-center gap-4 mb-8">
               <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/20">P1</div>
               <div className="flex-1 bg-zinc-200 h-4 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${(pos1/30)*100}%` }} />
               </div>
               <span className="font-black opacity-40">{pos1}/30</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/20">P2</div>
               <div className="flex-1 bg-zinc-200 h-4 rounded-full overflow-hidden">
                  <div className="bg-red-600 h-full transition-all duration-500" style={{ width: `${(pos2/30)*100}%` }} />
               </div>
               <span className="font-black opacity-40">{pos2}/30</span>
            </div>
         </div>

         <div className="flex flex-col items-center justify-center gap-6">
            <button 
              onMouseDown={rollDice} 
              className={`relative overflow-hidden p-12 rounded-[3rem] transition-all transform ${isRolling ? 'scale-110 rotate-12' : 'hover:scale-105'} ${turn === 1 ? 'bg-blue-600' : 'bg-red-600'} text-white shadow-2xl`}
            >
              <div className={isRolling ? 'animate-spin' : ''}>{diceIcons[dice - 1]}</div>
            </button>
            <p className="font-black uppercase tracking-widest opacity-40">Turno do Jogador {turn}</p>
         </div>
      </div>
    </div>
  );
};

export default LudoGame;
