
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Gamepad2, Volume2, VolumeX, Maximize, Minimize, Music, Search, ChevronDown, ChevronUp, Expand, Shrink } from 'lucide-react';
import LandingPage from './components/LandingPage';
import Checkers from './components/games/Checkers';
import Chess from './components/games/Chess';
import SlidingPuzzle from './components/games/SlidingPuzzle';
import UnoGame from './components/games/UnoGame';
import LudoGame from './components/games/LudoGame';
import MazeGame from './components/games/MazeGame';
import SlotMachine from './components/games/SlotMachine';
import JigsawPuzzle from './components/games/JigsawPuzzle';
import MusicSearch from './components/MusicSearch';
import { Theme } from './types';
import { sounds } from './utils/soundEffects';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
};

export const useRipple = () => {
  const createRipple = (event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    const rect = button.getBoundingClientRect();

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple-effect");

    const ripple = button.getElementsByClassName("ripple-effect")[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);
  };
  return createRipple;
};

const AppContent: React.FC<{ 
  theme: Theme, 
  toggleTheme: () => void, 
  isMuted: boolean, 
  toggleMute: () => void, 
  isFullscreen: boolean, 
  toggleFullscreen: () => void 
}> = ({ theme, toggleTheme, isMuted, toggleMute, isFullscreen, toggleFullscreen }) => {
  const [currentMusicUrl, setCurrentMusicUrl] = useState<string>("https://www.suamusica.com.br/player/radio/popular");
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isPlayerMaximized, setIsPlayerMaximized] = useState(false);
  const silentAudioRef = useRef<HTMLAudioElement>(null);
  const location = useLocation();
  const ripple = useRipple();

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'MultiGame Hub Radio',
        artist: 'Sua Música Play',
        artwork: [{ src: 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png', sizes: '512x512', type: 'image/png' }]
      });
      navigator.mediaSession.setActionHandler('play', () => silentAudioRef.current?.play().catch(() => {}));
      navigator.mediaSession.setActionHandler('pause', () => silentAudioRef.current?.pause());
    }
  }, []);

  const themeClasses = theme === 'dark' ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900';
  const navColor = theme === 'dark' ? 'bg-[#111111]/95' : 'bg-white/95';

  return (
    <div className={`min-h-[100svh] transition-colors duration-300 ${themeClasses} flex flex-col font-sans relative overflow-x-hidden`}>
      <ScrollToTop />
      
      <audio ref={silentAudioRef} loop preload="auto" className="hidden">
        <source src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=" type="audio/wav" />
      </audio>

      <style>{`
        .ripple-effect { position: absolute; border-radius: 50%; transform: scale(0); animation: ripple 600ms linear; background-color: rgba(255, 255, 255, 0.4); pointer-events: none; }
        @keyframes ripple { to { transform: scale(4); opacity: 0; } }
        .music-drawer {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), height 0.4s ease;
          height: ${isPlayerMaximized ? '92svh' : '450px'};
          transform: translateY(${isPlayerOpen ? '0' : '-115%'});
        }
        @media (max-width: 640px) {
           .music-drawer { height: ${isPlayerMaximized ? '94svh' : '400px'}; }
        }
      `}</style>

      {/* PLAYER GLOBAL PERSISTENTE - Sempre no DOM para não recarregar */}
      <div className={`fixed top-[64px] left-0 w-full z-40 music-drawer shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] ${theme === 'dark' ? 'bg-black' : 'bg-white'} overflow-hidden border-b border-orange-600/30`}>
         <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-3 bg-orange-600/10">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Rádio Ao Vivo</span>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => setIsPlayerMaximized(!isPlayerMaximized)} className="p-2 bg-zinc-500/10 rounded-lg flex items-center gap-2 hover:bg-orange-600 hover:text-white transition-all">
                     {isPlayerMaximized ? <Shrink size={16} /> : <Expand size={16} />}
                     <span className="text-[9px] font-black uppercase hidden sm:inline">{isPlayerMaximized ? 'Reduzir' : 'Ampliar'}</span>
                   </button>
                   <button onClick={() => setIsPlayerOpen(false)} className="p-2 bg-zinc-500/10 rounded-lg font-black text-[9px] uppercase hover:bg-red-600 hover:text-white transition-all px-4">Fechar</button>
                </div>
            </div>
            <div className="flex-1 bg-black">
               <iframe src={currentMusicUrl} className="w-full h-full border-none" title="Musica" allow="autoplay; encrypted-media" />
            </div>
         </div>
      </div>

      <nav className={`sticky top-0 z-50 h-[64px] px-2 sm:px-4 flex justify-between items-center backdrop-blur-md shadow-xl border-b ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} ${navColor}`}>
        <Link to="/" onMouseDown={ripple} onClick={() => { sounds.playMove(); setIsPlayerOpen(false); }} className="flex items-center gap-2 sm:gap-3 text-lg font-black tracking-tighter uppercase group">
          <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
            <Gamepad2 className="w-4 h-4 sm:w-6 h-6 text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">MULTI<span className="hidden xs:inline">GAME</span></span>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button onMouseDown={ripple} onClick={() => { sounds.playDice(); setIsPlayerOpen(!isPlayerOpen); silentAudioRef.current?.play().catch(()=>{}); }} className={`px-3 py-2 rounded-xl transition-all flex items-center gap-2 ${isPlayerOpen ? 'bg-orange-600 text-white shadow-lg' : 'bg-zinc-500/10'}`}>
            <Music size={16} className={isPlayerOpen ? 'animate-bounce' : ''} />
            <span className="hidden sm:inline text-[10px] font-black uppercase italic tracking-wider">MÚSICA</span>
            {isPlayerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <Link to="/music" onMouseDown={ripple} onClick={() => { sounds.playMove(); setIsPlayerOpen(false); }} className={`p-2.5 rounded-xl transition-all ${location.pathname === '/music' ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-500/10'}`}>
            <Search size={16} />
          </Link>

          <button onMouseDown={ripple} onClick={toggleFullscreen} className={`p-2.5 rounded-xl transition-all ${isFullscreen ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-500/10 text-blue-500'}`}>
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          <button onMouseDown={ripple} onClick={toggleTheme} className={`p-2.5 rounded-xl transition-all ${theme === 'dark' ? 'bg-yellow-500 text-black shadow-lg' : 'bg-slate-800 text-white shadow-lg'}`}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </nav>

      <main className={`flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10 transition-all duration-700 ${isPlayerOpen ? 'opacity-20 blur-xl pointer-events-none scale-95' : 'opacity-100 blur-0 scale-100'}`}>
        <Routes>
          <Route path="/" element={<LandingPage theme={theme} />} />
          <Route path="/music" element={<MusicSearch theme={theme} setGlobalMusic={setCurrentMusicUrl} />} />
          <Route path="/game/checkers" element={<Checkers theme={theme} />} />
          <Route path="/game/chess" element={<Chess theme={theme} />} />
          <Route path="/game/puzzle" element={<JigsawPuzzle theme={theme} />} />
          <Route path="/game/sliding" element={<SlidingPuzzle theme={theme} />} />
          <Route path="/game/uno" element={<UnoGame theme={theme} />} />
          <Route path="/game/ludo" element={<LudoGame theme={theme} />} />
          <Route path="/game/maze" element={<MazeGame theme={theme} />} />
          <Route path="/game/slots" element={<SlotMachine theme={theme} />} />
        </Routes>
      </main>

      <footer className="p-6 text-center opacity-30 text-[8px] font-black uppercase tracking-[0.4em]">MultiGame Hub Premium • 2024</footer>
    </div>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.toggleMusic(nextMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <Router>
      <AppContent theme={theme} toggleTheme={toggleTheme} isMuted={isMuted} toggleMute={toggleMute} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
    </Router>
  );
};

export default App;
