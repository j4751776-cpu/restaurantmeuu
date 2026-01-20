
import React, { useState } from 'react';
import { HelpCircle, X, Play, BookOpen } from 'lucide-react';
import { Theme } from '../../types';

interface GameHelpProps {
  theme: Theme;
  title: string;
  rules: string[];
  youtubeId: string;
}

const GameHelp: React.FC<GameHelpProps> = ({ theme, title, rules, youtubeId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const modalBg = theme === 'dark' ? 'bg-[#0a0a0a] text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200';

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-2xl hover:scale-110 transition-all z-40 group"
        title="Regras e Tutorial"
      >
        <HelpCircle size={24} className="group-hover:rotate-12 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border shadow-2xl p-8 ${modalBg}`}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase">{title}</h2>
                <p className="opacity-50 text-sm font-bold">REGRAS E TUTORIAL</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-500/10 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-4 text-blue-500">
                  <BookOpen size={20} />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Como Jogar</h3>
                </div>
                <ul className="space-y-3">
                  {rules.map((rule, idx) => (
                    <li key={idx} className="flex gap-3 text-sm leading-relaxed opacity-80">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4 text-red-500">
                  <Play size={20} />
                  <h3 className="font-bold uppercase tracking-wider text-sm">Tutorial em Vídeo</h3>
                </div>
                <div className="relative pt-[56.25%] rounded-2xl overflow-hidden bg-black shadow-lg">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              </section>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full mt-8 py-4 bg-zinc-500/10 hover:bg-zinc-500/20 rounded-2xl font-bold transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GameHelp;
