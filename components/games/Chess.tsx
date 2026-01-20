
import React, { useState } from 'react';
import { Theme } from '../../types';
import { ArrowLeft, RotateCcw, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../../utils/soundEffects';
import GameHelp from './GameHelp';
import { useRipple } from '../../App';

type Piece = string;
type Board = Piece[][];

const Chess: React.FC<{ theme: Theme }> = ({ theme }) => {
  const ripple = useRipple();
  const initialBoard: Board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
  ];

  const pieceIcons: { [key: string]: string } = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
  };

  const [board, setBoard] = useState<Board>(initialBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [status, setStatus] = useState<{ type: 'none' | 'check' | 'mate' | 'draw', color?: string }>({ type: 'none' });

  const getPieceColor = (p: string) => (!p ? null : p === p.toUpperCase() ? 'white' : 'black');

  const getPseudoLegalMoves = (r: number, c: number, boardState: Board): [number, number][] => {
    const piece = boardState[r][c];
    if (!piece) return [];
    const color = getPieceColor(piece)!;
    const type = piece.toLowerCase();
    const moves: [number, number][] = [];

    const onBoard = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

    const addMove = (nr: number, nc: number) => {
      if (onBoard(nr, nc)) {
        const target = boardState[nr][nc];
        if (!target || getPieceColor(target) !== color) {
          moves.push([nr, nc]);
          return !target;
        }
      }
      return false;
    };

    if (type === 'p') {
      const dir = color === 'white' ? -1 : 1;
      const startRank = color === 'white' ? 6 : 1;
      if (onBoard(r + dir, c) && !boardState[r + dir][c]) {
        moves.push([r + dir, c]);
        if (r === startRank && !boardState[r + 2 * dir][c]) moves.push([r + 2 * dir, c]);
      }
      [[dir, 1], [dir, -1]].forEach(([dr, dc]) => {
        const nr = r + dr, nc = c + dc;
        if (onBoard(nr, nc) && boardState[nr][nc] && getPieceColor(boardState[nr][nc]) !== color) moves.push([nr, nc]);
      });
    } else if (type === 'n') {
      [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([dr, dc]) => addMove(r + dr, c + dc));
    } else if (type === 'b' || type === 'r' || type === 'q') {
      const dirs = type === 'b' ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : type === 'r' ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
      dirs.forEach(([dr, dc]) => {
        let nr = r + dr, nc = c + dc;
        while (addMove(nr, nc)) { nr += dr; nc += dc; }
      });
    } else if (type === 'k') {
      [[1, 1], [1, -1], [-1, 1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => addMove(r + dr, c + dc));
    }
    return moves;
  };

  const handleSquareClick = (event: React.MouseEvent<HTMLElement>, r: number, c: number) => {
    ripple(event);
    if (status.type === 'mate' || status.type === 'draw') return;
    const piece = board[r][c];
    if (getPieceColor(piece) === turn) {
      setSelected([r, c]);
      return;
    }
    if (selected) {
      const [sr, sc] = selected;
      const validMoves = getPseudoLegalMoves(sr, sc, board);
      const move = validMoves.find(([mr, mc]) => mr === r && mc === c);
      if (move) {
        const newBoard = board.map(row => [...row]);
        const movingPiece = board[sr][sc];
        if (board[r][c] !== '') sounds.playCapture(); else sounds.playMove();
        newBoard[r][c] = movingPiece;
        newBoard[sr][sc] = '';
        setBoard(newBoard);
        setSelected(null);
        setTurn(turn === 'white' ? 'black' : 'white');
      } else setSelected(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-5xl mx-auto p-4 animate-in fade-in duration-700">
      <div className="w-full flex justify-between items-center bg-zinc-900/40 p-5 rounded-3xl border border-white/5">
        <Link to="/" onMouseDown={ripple} className="relative overflow-hidden flex items-center gap-2 hover:opacity-70 transition-all font-bold group p-2 rounded-xl">
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Início
        </Link>
        <h2 className="text-4xl font-black tracking-tighter text-blue-500 uppercase">Xadrez Real</h2>
        <button onMouseDown={ripple} onClick={() => setBoard(initialBoard)} className="relative overflow-hidden p-3 bg-zinc-500/10 hover:bg-zinc-500/20 rounded-xl transition-all">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-12 items-start justify-center w-full">
         <div className={`p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${theme === 'dark' ? 'bg-zinc-950 border border-white/5' : 'bg-gray-200 border border-gray-300'}`}>
            <div className="grid grid-cols-8 border-4 border-zinc-800 rounded-lg overflow-hidden">
            {board.map((row, r) => row.map((piece, c) => {
                const isDark = (r + c) % 2 === 1;
                const isSelected = selected && selected[0] === r && selected[1] === c;
                // Cores clássicas: Verde Floresta e Creme
                const squareColor = isDark ? '#769656' : '#eeeed2';
                
                return (
                    <div 
                      key={`${r}-${c}`} 
                      onMouseDown={(e) => handleSquareClick(e, r, c)} 
                      style={{ backgroundColor: isSelected ? '#bbc949' : squareColor }}
                      className={`relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center text-4xl sm:text-5xl cursor-pointer transition-all duration-300 overflow-hidden`}
                    >
                      <span className={`select-none drop-shadow-md z-10 ${getPieceColor(piece) === 'white' ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]' : 'text-zinc-900'}`}>{pieceIcons[piece] || ''}</span>
                    </div>
                );
            }))}
            </div>
         </div>
        <div className="flex flex-col gap-6 w-full xl:w-80">
          <div className={`p-8 rounded-[2rem] ${theme === 'dark' ? 'bg-[#111] border border-white/5' : 'bg-white border shadow-lg'} space-y-6`}>
            <p className="text-[10px] opacity-50 uppercase font-black tracking-[0.2em] text-center">Vez do Jogador</p>
            <div className={`py-4 px-8 rounded-2xl text-center font-black text-2xl transition-all duration-500 ${turn === 'white' ? 'bg-white text-zinc-900 shadow-xl' : 'bg-green-700 text-white shadow-green-900/50'}`}>
              {turn === 'white' ? 'BRANCAS' : 'PRETAS'}
            </div>
          </div>
        </div>
      </div>

      <GameHelp
        theme={theme}
        title="Xadrez Master"
        rules={["Mova suas peças estrategicamente para atacar o Rei adversário.", "Peões movem 1 casa à frente (2 no primeiro movimento).", "Bispos em diagonal, Torres em linha reta.", "Rainha combina movimentos de Bispo e Torre.", "O jogo termina quando um Rei é capturado ou não tem fuga."]}
        youtubeId="fKOqudr3DQU"
      />
    </div>
  );
};

export default Chess;
