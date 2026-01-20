
import React, { useState } from 'react';
import { Theme } from '../../types';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../../utils/soundEffects';
import GameHelp from './GameHelp';
import GameOverModal from './GameOverModal';
import { useRipple } from '../../App';

interface Piece {
  player: 1 | 2;
  isKing: boolean;
}

type Board = (Piece | null)[][];

const Checkers: React.FC<{ theme: Theme }> = ({ theme }) => {
  const ripple = useRipple();
  const initializeBoard = (): Board => {
    const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) board[r][c] = { player: 2, isKing: false };
    }
    for (let r = 5; r < 8; r++) {
      for (let c = 0; c < 8; c++) if ((r + c) % 2 === 1) board[r][c] = { player: 1, isKing: false };
    }
    return board;
  };

  const [board, setBoard] = useState<Board>(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  const handleSquareClick = (event: React.MouseEvent<HTMLElement>, r: number, c: number) => {
    ripple(event);
    if (winner) return;
    const piece = board[r][c];
    if (piece && piece.player === currentPlayer) {
      setSelected([r, c]);
      return;
    }
    if (selected) {
      const [sr, sc] = selected;
      const dr = r - sr;
      const dc = c - sc;
      const adr = Math.abs(dr);
      const adc = Math.abs(dc);

      if (adr === 1 && adc === 1 && !board[r][c]) {
        if ((currentPlayer === 1 && dr < 0) || (currentPlayer === 2 && dr > 0) || board[sr][sc]?.isKing) {
          movePiece(sr, sc, r, c);
        }
      } else if (adr === 2 && adc === 2 && !board[r][c]) {
        const mr = sr + dr / 2;
        const mc = sc + dc / 2;
        const midPiece = board[mr][mc];
        if (midPiece && midPiece.player !== currentPlayer) {
          movePiece(sr, sc, r, c, [mr, mc]);
        }
      }
    }
  };

  const movePiece = (sr: number, sc: number, dr: number, dc: number, capture?: [number, number]) => {
    const newBoard = board.map(row => [...row]);
    let piece = { ...newBoard[sr][sc]! };
    if ((currentPlayer === 1 && dr === 0) || (currentPlayer === 2 && dr === 7)) piece.isKing = true;
    newBoard[dr][dc] = piece;
    newBoard[sr][sc] = null;
    if (capture) {
      newBoard[capture[0]][capture[1]] = null;
      sounds.playCapture();
    } else sounds.playMove();
    setBoard(newBoard);
    setSelected(null);
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    checkWinner(newBoard);
  };

  const checkWinner = (b: Board) => {
    const p1 = b.flat().filter(p => p?.player === 1).length;
    const p2 = b.flat().filter(p => p?.player === 2).length;
    if (p1 === 0) setWinner(2); else if (p2 === 0) setWinner(1);
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="w-full flex justify-between items-center bg-zinc-900/40 p-5 rounded-3xl border border-white/5">
        <Link to="/" onMouseDown={ripple} className="relative overflow-hidden flex items-center gap-2 hover:opacity-70 transition-all font-bold group p-2 rounded-xl">
          <ArrowLeft size={20} /> Início
        </Link>
        <h2 className="text-2xl font-black italic tracking-tighter text-red-500 uppercase">Damas Clássicas</h2>
        <button onMouseDown={ripple} onClick={() => setBoard(initializeBoard())} className="relative overflow-hidden p-3 bg-zinc-500/10 hover:bg-zinc-500/20 rounded-2xl transition-all">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start w-full justify-center">
        <div className={`relative p-3 rounded-[2.5rem] ${theme === 'dark' ? 'bg-[#2a1b15] border-zinc-900' : 'bg-[#3d2b1f] border-slate-300'} border-8 shadow-2xl overflow-hidden`}>
          <div className="grid grid-cols-8 rounded-xl overflow-hidden border-4 border-black/20">
            {board.map((row, r) =>
              row.map((piece, c) => {
                const isDark = (r + c) % 2 === 1;
                const isSelected = selected && selected[0] === r && selected[1] === c;
                return (
                  <div
                    key={`${r}-${c}`}
                    onMouseDown={(e) => handleSquareClick(e, r, c)}
                    className={`relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center cursor-pointer transition-all ${
                      isDark ? 'bg-[#5c4033]' : 'bg-[#c19a6b]'
                    } ${isSelected ? 'ring-4 ring-yellow-400/50 ring-inset' : ''}`}
                  >
                    {piece && (
                      <div
                        className={`w-[80%] h-[80%] rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border-b-4 ${
                          piece.player === 1 ? 'bg-zinc-100 border-zinc-300 text-zinc-400' : 'bg-red-700 border-red-900 text-red-300'
                        } ${isSelected ? 'scale-110 -translate-y-1' : ''}`}
                      >
                        {piece.isKing && <span className="font-black text-xl">♔</span>}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={`flex flex-col gap-6 p-8 rounded-[2.5rem] w-full lg:w-72 shadow-2xl border ${theme === 'dark' ? 'bg-[#111] border-white/5' : 'bg-white border-black/5'}`}>
            <h3 className="text-center font-black uppercase tracking-[0.2em] opacity-30 text-[10px]">Turno Atual</h3>
            <div className={`p-6 rounded-3xl text-center font-black text-xl transition-all shadow-xl ${currentPlayer === 1 ? 'bg-zinc-100 text-zinc-900' : 'bg-red-700 text-white shadow-red-700/20'}`}>
              {currentPlayer === 1 ? 'BRANCAS' : 'VERMELHAS'}
            </div>
        </div>
      </div>

      {winner && <GameOverModal status="won" onRestart={() => setBoard(initializeBoard())} title={`VITÓRIA!`} message={`O Jogador ${winner === 1 ? 'das Brancas' : 'das Vermelhas'} venceu a partida!`} />}
    </div>
  );
};

export default Checkers;
