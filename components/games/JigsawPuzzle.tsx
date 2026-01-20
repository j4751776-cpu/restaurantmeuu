
import React, { useState, useEffect } from 'react';
import { Theme } from '../../types';
import { ArrowLeft, RotateCcw, Star, Grid3X3, ArrowRight, Play, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import GameHelp from './GameHelp';

const CATEGORIES = [
  { 
    id: 'beaches', 
    name: 'Praias', 
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
      'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80',
      'https://images.unsplash.com/photo-1506929199175-6090a78713d3?w=800&q=80',
      'https://images.unsplash.com/photo-1520483601560-389dff434f1c?w=800&q=80'
    ]
  },
  { 
    id: 'landscapes', 
    name: 'Paisagens', 
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'
    ]
  },
  { 
    id: 'countries', 
    name: 'Países', 
    images: [
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
      'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80'
    ]
  },
  { 
    id: 'cars', 
    name: 'Carros', 
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf048?w=800&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80'
    ]
  },
  { 
    id: 'pets', 
    name: 'Pets', 
    images: [
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80',
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&q=80',
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&q=80',
      'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80'
    ]
  }
];

const JigsawPuzzle: React.FC<{ theme: Theme }> = ({ theme }) => {
  const [level, setLevel] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [tiles, setTiles] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'selection' | 'image-selection' | 'playing' | 'won'>('selection');

  const gridSize = 2 + Math.min(level, 3);

  const initGame = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    const totalTiles = gridSize * gridSize;
    let newTiles = Array.from({ length: totalTiles }, (_, i) => i);
    
    // Garantir solvabilidade: partir do resolvido e fazer N movimentos válidos
    const shuffleMoves = 100 + level * 50;
    let emptyIdx = 0; // O zero é o buraco

    for (let i = 0; i < shuffleMoves; i++) {
      const row = Math.floor(emptyIdx / gridSize);
      const col = emptyIdx % gridSize;
      const neighbors = [];
      
      if (row > 0) neighbors.push(emptyIdx - gridSize);
      if (row < gridSize - 1) neighbors.push(emptyIdx + gridSize);
      if (col > 0) neighbors.push(emptyIdx - 1);
      if (col < gridSize - 1) neighbors.push(emptyIdx + 1);
      
      const move = neighbors[Math.floor(Math.random() * neighbors.length)];
      [newTiles[emptyIdx], newTiles[move]] = [newTiles[move], newTiles[emptyIdx]];
      emptyIdx = move;
    }

    setTiles(newTiles);
    setGameState('playing');
    sounds.playDice();
  };

  const swapTiles = (index: number) => {
    if (gameState !== 'playing') return;
    
    const emptyIdx = tiles.indexOf(0);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIdx / gridSize);
    const emptyCol = emptyIdx % gridSize;
    
    const isAdjacent = (Math.abs(row - emptyRow) === 1 && col === emptyCol) || 
                       (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[index]];
      setTiles(newTiles);
      sounds.playMove();

      if (newTiles.every((t, i) => t === i)) {
        setGameState('won');
        sounds.playWin();
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const panelBg = theme === 'dark' ? 'bg-[#111] border-white/5' : 'bg-white border-black/5';

  return (
    <div className="flex flex-col items-center gap-8 max-w-6xl mx-auto p-4 animate-in fade-in duration-500">
      <div className={`w-full flex justify-between items-center p-5 rounded-3xl border shadow-xl ${panelBg}`}>
        <Link to="/" className="flex items-center gap-2 hover:opacity-70 transition-all font-semibold uppercase text-xs tracking-widest">
          <ArrowLeft size={20} /> Menu
        </Link>
        <div className="text-center">
          <h2 className="text-2xl font-black text-teal-500 uppercase italic tracking-tighter leading-none">Quebra-Cabeça</h2>
          <span className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">Dificuldade {gridSize}x{gridSize}</span>
        </div>
        <button onClick={() => setGameState('selection')} className="p-3 bg-zinc-500/10 hover:bg-zinc-500/20 rounded-2xl transition-all">
          <RotateCcw size={20} />
        </button>
      </div>

      {gameState === 'selection' && (
        <div className="w-full space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
             <h3 className="text-3xl font-black italic uppercase text-teal-500 mb-2">ESCOLHA O TEMA</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {CATEGORIES.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => { setSelectedCategory(cat); setGameState('image-selection'); }}
                className="group relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden shadow-2xl hover:scale-[1.02] transition-all border-4 border-transparent hover:border-teal-500"
              >
                <img src={cat.images[0]} className="absolute inset-0 w-full h-full object-cover" alt={cat.name} />
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-white text-2xl font-black uppercase italic leading-none">{cat.name}</h3>
                  <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest mt-2">5 Fotos</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState === 'image-selection' && selectedCategory && (
        <div className="w-full space-y-8 animate-in slide-in-from-right-4 duration-500">
           <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <button onClick={() => setGameState('selection')} className="flex items-center gap-2 font-black text-xs uppercase opacity-50 hover:opacity-100">
                 <ArrowLeft size={16} /> Voltar
              </button>
              <h3 className="text-xl font-black italic uppercase text-teal-500">{selectedCategory.name}</h3>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategory.images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => initGame(img)}
                  className="group relative h-56 rounded-[2.5rem] overflow-hidden shadow-2xl hover:scale-105 transition-all border-4 border-white/5 hover:border-teal-500"
                >
                  <img src={img} className="absolute inset-0 w-full h-full object-cover" alt="Image" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                     <Play className="text-white" size={48} fill="currentColor" />
                  </div>
                </button>
              ))}
           </div>
        </div>
      )}

      {gameState === 'playing' && selectedImageUrl && (
        <div className="flex flex-col items-center gap-10 animate-in zoom-in-95 duration-500">
          <div 
            className="grid gap-1 bg-zinc-950 p-2 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] border-4 border-white/5"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              width: 'min(90vw, 500px)',
              aspectRatio: '1/1'
            }}
          >
            {tiles.map((tile, i) => {
              const row = Math.floor(tile / gridSize);
              const col = tile % gridSize;
              return (
                <div 
                  key={i} 
                  onClick={() => swapTiles(i)}
                  className={`relative cursor-pointer transition-all duration-300 rounded-xl ${tile === 0 ? 'bg-zinc-900/40' : 'hover:brightness-110'}`}
                  style={{
                    backgroundImage: tile === 0 ? 'none' : `url(${selectedImageUrl})`,
                    backgroundSize: `${gridSize * 100}%`,
                    backgroundPosition: `${(col / (gridSize - 1)) * 100}% ${(row / (gridSize - 1)) * 100}%`,
                  }}
                >
                  {tile === 0 && <div className="absolute inset-0 flex items-center justify-center opacity-10"><Grid3X3 size={40} /></div>}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 px-8 py-4 bg-zinc-500/10 rounded-2xl border border-white/5">
             <Star size={20} className="text-yellow-500" />
             <p className="text-xs font-bold opacity-60 italic">Clique nas peças vizinhas ao espaço vazio para movê-las.</p>
          </div>
        </div>
      )}

      {gameState === 'won' && selectedImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
           <div className={`p-12 rounded-[4rem] text-center shadow-2xl max-w-sm w-full bg-teal-600 text-white border-4 border-white/10`}>
              <Trophy size={80} className="mx-auto mb-6 animate-bounce" />
              <h5 className="font-black text-4xl uppercase italic mb-2 tracking-tighter">PARABÉNS!</h5>
              <div className="w-full aspect-square rounded-3xl overflow-hidden mb-8">
                 <img src={selectedImageUrl} className="w-full h-full object-cover" alt="Won" />
              </div>
              <button onClick={() => { setLevel(l => l + 1); setGameState('selection'); }} className="w-full py-5 bg-white text-teal-700 rounded-full font-black text-lg uppercase">PRÓXIMO NÍVEL</button>
           </div>
        </div>
      )}

      <GameHelp
        theme={theme}
        title="Quebra-Cabeça"
        rules={[
          "Escolha uma categoria e uma imagem das 5 disponíveis.",
          "As peças são embaralhadas mas sempre têm solução.",
          "O objetivo é reorganizar a imagem deslizando as peças.",
          "Ao vencer, você desbloqueia grades maiores e mais complexas."
        ]}
        youtubeId="z7F0S12Rndw"
      />
    </div>
  );
};

export default JigsawPuzzle;
