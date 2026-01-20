
import React, { useState } from 'react';
import { Theme } from '../../types';
import { ArrowLeft, RotateCcw, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../../utils/soundEffects';
import { useRipple } from '../../App';

const SlidingPuzzle: React.FC<{ theme: Theme }> = ({ theme }) => {
  const ripple = useRipple();
  const generateTiles = () => Array.from({ length: 9 }, (_, i) => i);
  const [tiles, setTiles] = useState<number[]>(generateTiles());
  const [won, setWon] = useState(false);

  // Fix: Explicitly type MouseEvent to HTMLElement for compatibility with useRipple
  const shuffle = (event: React.MouseEvent<HTMLElement>) => {
    ripple(event);
    const shuffled = [...generateTiles()].sort(() => Math.random() - 0.5);
    setTiles(shuffled);
    setWon(false);
    sounds.playDice();
  };

  // Fix: Explicitly type MouseEvent to HTMLElement for compatibility with useRipple
  const moveTile = (event: React.MouseEvent<HTMLElement>, index: number) => {
    ripple(event);
    const emptyIdx = tiles.indexOf(0);
    const isAdjacent = Math.abs(Math.floor(index/3) - Math.floor(emptyIdx/3)) + Math.abs(index%3 - emptyIdx%3) === 1;
    
    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
      setTiles(newTiles);
      sounds.playMove();
      if (newTiles.every((t, i) => t === (i === 8 ? 0 : i + 1))) {
        setWon(true);
        sounds.playWin();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto p-4 animate-in fade-in duration-700">
      <div className="w-full flex justify-between items-center bg-zinc-900/40 p-5 rounded-3xl border border-white/5">
        <Link to="/" onMouseDown={ripple} className="relative overflow-hidden flex items-center gap-2 font-bold p-2 rounded-xl"><ArrowLeft size={24} /> Menu</Link>
        <h2 className="text-3xl font-black text-indigo-500 uppercase">8-Puzzle Clássico</h2>
        <button onMouseDown={shuffle} className="relative overflow-hidden p-3 bg-zinc-500/10 rounded-xl"><RotateCcw size={20} /></button>
      </div>

      <div className={`grid grid-cols-3 gap-3 p-4 rounded-[2.5rem] ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gray-200'} shadow-2xl`}>
        {tiles.map((tile, i) => (
          <button 
            key={i} 
            onMouseDown={(e) => moveTile(e, i)} 
            className={`relative overflow-hidden w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center text-4xl font-black rounded-3xl transition-all ${tile === 0 ? 'bg-transparent' : 'bg-blue-600 text-white shadow-xl hover:scale-105 active:scale-95'}`}
          >
            {tile !== 0 && tile}
          </button>
        ))}
      </div>
      {won && <p className="text-2xl font-black text-emerald-500 animate-bounce">ORGANIZADO COM SUCESSO! 🏆</p>}
    </div>
  );
};

export default SlidingPuzzle;
