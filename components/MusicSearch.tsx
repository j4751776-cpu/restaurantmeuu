
import React, { useState } from 'react';
import { Theme } from '../types';
import { Search, Music, Sparkles, Radio, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRipple } from '../App';
import { sounds } from '../utils/soundEffects';

interface MusicSearchProps {
  theme: Theme;
  setGlobalMusic: (url: string) => void;
}

const QUICK_TAGS = [
  { label: 'Piseiro', url: 'https://www.suamusica.com.br/player/piseiro', color: 'bg-orange-600' },
  { label: 'Sertanejo', url: 'https://www.suamusica.com.br/player/sertanejo', color: 'bg-blue-600' },
  { label: 'Paredão', url: 'https://www.suamusica.com.br/player/paredao', color: 'bg-red-600' },
  { label: 'Forró', url: 'https://www.suamusica.com.br/player/forro', color: 'bg-emerald-600' },
  { label: 'Pop', url: 'https://www.suamusica.com.br/player/popular', color: 'bg-purple-600' }
];

const MusicSearch: React.FC<MusicSearchProps> = ({ theme, setGlobalMusic }) => {
  const [query, setQuery] = useState('');
  const ripple = useRipple();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const newUrl = `https://www.suamusica.com.br/busca/${encodeURIComponent(query)}`;
    setGlobalMusic(newUrl);
    sounds.playMove();
  };

  const selectTag = (url: string) => {
    setGlobalMusic(url);
    sounds.playDice();
  };

  const panelBg = theme === 'dark' ? 'bg-[#111] border-white/5' : 'bg-white border-black/5';

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-16 py-6 px-2 sm:px-4 animate-in fade-in slide-in-from-top-4 duration-500 pb-24">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 text-orange-500 text-[10px] font-black tracking-widest uppercase">
          <Sparkles size={12} className="animate-pulse" /> SISTEMA DE ÁUDIO GLOBAL
        </div>
        <h1 className="text-4xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
          MÚSICA <span className="text-orange-600">PLAY</span>
        </h1>
        <p className="opacity-40 font-bold uppercase text-[10px] tracking-[0.2em] max-w-xl">
          Sua trilha sonora não para, mesmo mudando de jogo.
        </p>
      </div>

      <div className={`p-6 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] border shadow-2xl ${panelBg}`}>
        <form onSubmit={handleSearch} className="relative mb-10 max-w-3xl mx-auto group">
          <input 
            type="text" 
            placeholder="Buscar artista ou álbum no Sua Música..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full p-5 pl-14 pr-10 sm:pr-44 rounded-full text-lg font-bold border-4 transition-all outline-none shadow-xl ${
              theme === 'dark' ? 'bg-black border-white/5 focus:border-orange-600 text-white' : 'bg-slate-50 border-black/5 focus:border-orange-600 text-black'
            }`}
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-600" size={20} />
          <button type="submit" onMouseDown={ripple} className="hidden sm:block absolute right-2 top-1/2 -translate-y-1/2 bg-orange-600 text-white px-8 py-3 rounded-full font-black italic hover:scale-105 transition-all">
            CARREGAR
          </button>
        </form>

        <div className="flex overflow-x-auto gap-3 mb-10 pb-2 no-scrollbar">
          {QUICK_TAGS.map((tag, i) => (
            <button key={i} onMouseDown={(e) => { ripple(e); selectTag(tag.url); }} className={`flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-wider text-white transition-all active:scale-95 shadow-lg ${tag.color}`}>
              <Zap size={14} fill="currentColor" /> {tag.label}
            </button>
          ))}
        </div>

        <div className="p-8 bg-orange-600/5 rounded-3xl border border-orange-500/10 flex flex-col md:flex-row items-center gap-8">
           <div className="p-5 bg-orange-600 rounded-2xl text-white shadow-xl">
              <Radio size={40} />
           </div>
           <div className="flex-1 text-center md:text-left">
              <h4 className="font-black uppercase italic text-xl mb-1">Áudio Inteligente</h4>
              <p className="text-xs opacity-60 font-medium leading-relaxed">
                 Escolha uma rádio ou busque um CD. O player global será atualizado e você pode minimizá-lo para jogar com música em segundo plano.
              </p>
           </div>
           <Link to="/" className="px-10 py-4 bg-zinc-800 text-white rounded-2xl font-black text-xs uppercase hover:bg-zinc-700 transition-all shadow-lg">
              IR JOGAR
           </Link>
        </div>
      </div>
    </div>
  );
};

export default MusicSearch;
