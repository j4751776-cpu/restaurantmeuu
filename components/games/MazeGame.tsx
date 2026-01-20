
import React, { useState, useEffect, useCallback } from 'react';
import { Theme } from '../../types';
import { ArrowLeft, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../../utils/soundEffects';
import { useRipple } from '../../App';

const MazeGame: React.FC<{ theme: Theme }> = ({ theme }) => {
  const ripple = useRipple();
  const mazeSize = 17;
  const [maze, setMaze] = useState<number[][]>([]);
  const [pos, setPos] = useState({ x: 1, y: 1 });
  const [won, setWon] = useState(false);

  const generateMaze = useCallback(() => {
    const newMaze = Array(mazeSize).fill(null).map(() => Array(mazeSize).fill(1));
    const stack: [number, number][] = [[1, 1]];
    newMaze[1][1] = 0;
    const directions = [[0, 2], [0, -2], [2, 0], [-2, 0]];

    while (stack.length > 0) {
      const [currX, currY] = stack[stack.length - 1];
      const neighbors: [number, number][] = [];
      directions.forEach(([dx, dy]) => {
        const nx = currX + dx;
        const ny = currY + dy;
        if (nx > 0 && nx < mazeSize - 1 && ny > 0 && ny < mazeSize - 1 && newMaze[ny][nx] === 1) neighbors.push([nx, ny]);
      });

      if (neighbors.length > 0) {
        const [nextX, nextY] = neighbors[Math.floor(Math.random() * neighbors.length)];
        newMaze[currY + (nextY - currY) / 2][currX + (nextX - currX) / 2] = 0;
        newMaze[nextY][nextX] = 0;
        stack.push([nextX, nextY]);
      } else stack.pop();
    }
    newMaze[mazeSize - 2][mazeSize - 2] = 0; // Saída
    return newMaze;
  }, []);

  useEffect(() => { setMaze(generateMaze()); }, [generateMaze]);

  const move = (dx: number, dy: number) => {
    if (won) return;
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx > 0 && nx < mazeSize && ny > 0 && ny < mazeSize && maze[ny][nx] === 0) {
      setPos({ x: nx, y: ny });
      sounds.playMove();
      if (nx === mazeSize - 2 && ny === mazeSize - 2) {
        setWon(true);
        sounds.playWin();
      }
    }
  };

  // Fix: Explicitly type MouseEvent to HTMLElement
  const handleControl = (event: React.MouseEvent<HTMLElement>, dx: number, dy: number) => {
    ripple(event);
    move(dx, dy);
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto p-4 animate-in fade-in duration-700">
      <div className="w-full flex justify-between items-center bg-zinc-900/40 p-4 rounded-2xl border border-white/5">
        <Link to="/" onMouseDown={ripple} className="relative overflow-hidden flex items-center gap-2 font-bold p-2 rounded-xl"><ArrowLeft size={24} /> Menu</Link>
        <h2 className="text-2xl font-black text-emerald-500 uppercase">Labirinto Verde</h2>
        <button onMouseDown={ripple} onClick={() => {setMaze(generateMaze()); setPos({x:1,y:1}); setWon(false);}} className="relative overflow-hidden p-3 bg-zinc-500/10 rounded-xl"><RotateCcw size={20} /></button>
      </div>

      <div className="flex flex-col md:flex-row gap-12 items-center">
         <div className="relative p-2 rounded-[2rem] bg-grass shadow-2xl border-4 border-emerald-900/20">
            <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${mazeSize}, 1fr)`, width: 'min(85vw, 450px)', aspectRatio: '1/1' }}>
              {maze.map((row, y) => row.map((cell, x) => (
                <div key={`${x}-${y}`} className={`w-full h-full flex items-center justify-center ${cell === 1 ? 'bg-[#1b3d16] shadow-inner' : 'bg-transparent'}`}>
                  {pos.x === x && pos.y === y && <div className="w-[80%] h-[80%] bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse" />}
                  {x === mazeSize-2 && y === mazeSize-2 && <span className="text-xs">🚩</span>}
                </div>
              )))}
            </div>
         </div>

         <div className="flex flex-col items-center gap-4 bg-zinc-900/20 p-8 rounded-[3rem] shadow-xl">
            <button onMouseDown={(e) => handleControl(e, 0, -1)} className="relative overflow-hidden w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center shadow-lg"><ChevronUp /></button>
            <div className="flex gap-4">
              <button onMouseDown={(e) => handleControl(e, -1, 0)} className="relative overflow-hidden w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center shadow-lg"><ChevronLeft /></button>
              <button onMouseDown={(e) => handleControl(e, 0, 1)} className="relative overflow-hidden w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center shadow-lg"><ChevronDown /></button>
              <button onMouseDown={(e) => handleControl(e, 1, 0)} className="relative overflow-hidden w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center shadow-lg"><ChevronRight /></button>
            </div>
            <p className="text-[10px] font-black uppercase opacity-30 mt-4 tracking-widest">Controle Virtual</p>
         </div>
      </div>
    </div>
  );
};

export default MazeGame;
