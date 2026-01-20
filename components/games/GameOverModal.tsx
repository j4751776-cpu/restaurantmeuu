
import React, { useEffect } from 'react';
import { RotateCcw, Home, Trophy, Frown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';

interface GameOverModalProps {
  status: 'won' | 'lost';
  onRestart: () => void;
  title?: string;
  message?: string;
  difficulty?: number;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ status, onRestart, title, message, difficulty }) => {
  useEffect(() => {
    if (status === 'won') {
      sounds.playWin();
      // Efeito de fogos de artifício
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      
      return () => clearInterval(interval);
    } else {
      sounds.playLoss();
    }
  }, [status]);

  const isWin = status === 'won';
  const bgColor = isWin ? 'bg-emerald-600' : 'bg-red-700';
  const emoji = isWin ? '😃' : '😢';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-300">
      <div className={`w-full max-w-sm p-12 rounded-[3.5rem] text-center shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-white/10 ${bgColor} text-white`}>
        <div className="relative flex justify-center mb-6">
          <div className="text-8xl animate-bounce drop-shadow-2xl">{emoji}</div>
          {isWin && (
            <div className="absolute -top-4 -right-4 text-yellow-300 animate-pulse">
              <Sparkles size={48} />
            </div>
          )}
        </div>

        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2 leading-none">
          {isWin ? (title || 'VITÓRIA!') : (title || 'GAME OVER')}
        </h2>
        
        <p className="text-sm font-bold opacity-90 italic mb-8 px-4">
          {message || (isWin ? 'Excelente performance! Você dominou o desafio.' : 'Não foi dessa vez. Tente novamente para vencer!')}
        </p>

        {isWin && difficulty && (
          <div className="bg-white/20 p-3 rounded-2xl mb-8 flex items-center justify-between px-6">
            <span className="text-[10px] font-black uppercase tracking-widest">Novo Nível</span>
            <span className="text-2xl font-black italic">LV {difficulty}</span>
          </div>
        )}

        <div className="space-y-3">
          <button 
            onClick={onRestart}
            className="w-full py-5 bg-white text-zinc-900 rounded-[2rem] font-black text-lg uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} /> RECOMECAR
          </button>
          
          <Link 
            to="/"
            className="w-full py-4 bg-black/20 hover:bg-black/30 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
          >
            <Home size={14} /> Menu Principal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
