
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sword, Grid3X3, Layers, Dice6, Map, Coins, ImageIcon, Puzzle, MessageCircle, Music, Play } from 'lucide-react';
import { Theme } from '../types';
import { sounds } from '../utils/soundEffects';
import { useRipple } from '../App';

interface LandingPageProps {
  theme: Theme;
}

const LandingPage: React.FC<LandingPageProps> = ({ theme }) => {
  const navigate = useNavigate();
  const ripple = useRipple();
  
  const games = [
    { id: 'chess', name: 'Xadrez Real', icon: <Sword size={40} />, desc: 'O duelo supremo de intelecto.', color: 'from-purple-600 to-indigo-700' },
    { id: 'checkers', name: 'Damas 8x8', icon: <Grid3X3 size={40} />, desc: 'O clássico tabuleiro de damas.', color: 'from-red-500 to-rose-700' },
    { id: 'uno', name: 'Uno Classic', icon: <Layers size={40} />, desc: 'Cartas coloridas e diversão.', color: 'from-yellow-400 to-orange-500' },
    { id: 'ludo', name: 'Ludo Master', icon: <Dice6 size={40} />, desc: 'A clássica corrida de dados.', color: 'from-blue-600 to-cyan-600' },
    { id: 'puzzle', name: 'Quebra-Cabeça', icon: <ImageIcon size={40} />, desc: 'Monte belas imagens.', color: 'from-teal-500 to-emerald-600' },
    { id: 'maze', name: 'O Labirinto', icon: <Map size={40} />, desc: 'Escape do jardim misterioso.', color: 'from-emerald-500 to-teal-600' },
    { id: 'slots', name: 'Nations Slots', icon: <Coins size={40} />, desc: 'Caça-níquel das nações.', color: 'from-orange-500 to-red-600' },
    { id: 'sliding', name: '8-Puzzle', icon: <Puzzle size={40} />, desc: 'Organize os blocos numéricos.', color: 'from-indigo-500 to-blue-700' },
  ];

  const handleGameClick = (event: React.MouseEvent<HTMLElement>, gameId: string) => {
    ripple(event);
    sounds.playMove(); 
    setTimeout(() => navigate(`/game/${gameId}`), 200);
  };

  const handleShare = (event: React.MouseEvent<HTMLElement>) => {
    ripple(event);
    sounds.playDice();
    const text = encodeURIComponent("🎮 Jogue os melhores clássicos no MultiGame Hub! Acesse agora: " + window.location.origin);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const cardBg = theme === 'dark' ? 'bg-[#111] hover:bg-zinc-800' : 'bg-white hover:bg-slate-50';

  return (
    <div className="space-y-12 md:space-y-16 pb-20 animate-in fade-in duration-300">
      <header className="text-center space-y-4 md:space-y-6 max-w-4xl mx-auto py-8 md:py-12 px-2">
        <h1 className="text-4xl xs:text-5xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
          <span className="text-blue-500">Multi</span>Game <span className="text-indigo-500">Hub</span>
        </h1>
        <p className="text-base md:text-xl opacity-60 font-medium max-w-xl mx-auto leading-relaxed px-4">
          Sua arena completa de jogos clássicos com rádio integrada. Escolha seu desafio!
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <button 
            onMouseDown={handleShare}
            className="relative overflow-hidden flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 bg-green-600 text-white rounded-[2rem] font-black italic text-base md:text-lg hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            <MessageCircle size={20} /> WHATSAPP
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 px-2 sm:px-4">
        {games.map((game) => (
          <button 
            key={game.id} 
            onMouseDown={(e) => handleGameClick(e, game.id)}
            className={`group relative p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] transition-all duration-300 shadow-2xl ${cardBg} border border-transparent hover:border-white/10 flex flex-col items-center text-center overflow-hidden h-full active:scale-95 hover:-translate-y-2 w-full appearance-none outline-none focus:ring-4 focus:ring-blue-500/20`}
          >
            <div className={`p-4 md:p-5 rounded-2xl md:rounded-3xl mb-4 md:mb-6 text-white bg-gradient-to-br ${game.color} shadow-xl group-hover:scale-110 transition-all duration-300`}>
              {game.icon}
            </div>
            <h3 className="text-xl md:text-2xl font-black italic tracking-tight mb-2 uppercase text-inherit leading-none">{game.name}</h3>
            <p className="text-xs md:text-sm opacity-50 font-medium mb-4 md:mb-6 line-clamp-2 text-inherit">{game.desc}</p>
            <div className={`mt-auto px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center gap-2 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
              <Play size={10} fill="currentColor" /> Jogar
            </div>
          </button>
        ))}
      </div>

      <section className={`mx-2 sm:mx-4 p-6 md:p-16 rounded-[3rem] md:rounded-[4rem] ${theme === 'dark' ? 'bg-[#0a0a0a] border border-white/5' : 'bg-white border shadow-2xl'} flex flex-col md:flex-row items-center gap-8 md:gap-12`}>
        <div className="flex-1 space-y-4 md:space-y-6 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-black italic uppercase leading-tight">Música <span className="text-orange-500">Imersiva</span></h2>
          <p className="text-sm md:text-base opacity-60 font-medium leading-relaxed">Conecte-se com as melhores rádios enquanto domina o tabuleiro.</p>
          <button 
            onMouseDown={(e) => { ripple(e); sounds.playMove(); setTimeout(() => navigate('/music'), 200); }}
            className="relative overflow-hidden inline-flex items-center gap-2 px-7 py-3 md:px-8 md:py-4 bg-orange-600 text-white rounded-2xl md:rounded-3xl font-black italic transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            ABRIR PLAYER <Music size={18} />
          </button>
        </div>
        <div className="flex-1 w-full max-w-[200px] md:max-w-xs aspect-square bg-orange-600/10 rounded-[2.5rem] md:rounded-[3rem] border-4 border-dashed border-orange-600/20 flex items-center justify-center p-6 md:p-8 animate-pulse">
           <Music size={48} className="text-orange-600" />
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
