
import React, { useState } from 'react';
import { Theme } from '../../types';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../../utils/soundEffects';
import GameHelp from './GameHelp';
import GameOverModal from './GameOverModal';
import { useRipple } from '../../App';

interface Card {
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string;
}

const UnoGame: React.FC<{ theme: Theme }> = ({ theme }) => {
  const ripple = useRipple();
  const COLORS = ['red', 'blue', 'green', 'yellow'] as const;
  const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'SKIP', 'REV', '+2'];

  const createDeck = () => {
    const deck: Card[] = [];
    COLORS.forEach(color => {
      VALUES.forEach(value => {
        deck.push({ color, value });
        if (value !== '0') deck.push({ color, value });
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  const [deck, setDeck] = useState<Card[]>(createDeck());
  const [p1Hand, setP1Hand] = useState<Card[]>([]);
  const [p2Hand, setP2Hand] = useState<Card[]>([]);
  const [discard, setDiscard] = useState<Card[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);

  // Fix: Use React.MouseEvent<HTMLElement> to prevent generic Element type mismatch
  const startNewGame = (event?: React.MouseEvent<HTMLElement>) => {
    if (event) ripple(event);
    const newDeck = createDeck();
    const p1 = newDeck.splice(0, 7);
    const p2 = newDeck.splice(0, 7);
    const firstDiscard = newDeck.splice(0, 1);
    setDeck(newDeck);
    setP1Hand(p1);
    setP2Hand(p2);
    setDiscard(firstDiscard);
    setCurrentPlayer(1);
    setGameStarted(true);
    setWinner(null);
    sounds.playDice();
  };

  // Fix: Use React.MouseEvent<HTMLElement> to prevent generic Element type mismatch
  const playCard = (event: React.MouseEvent<HTMLElement>, player: 1 | 2, cardIndex: number) => {
    ripple(event);
    if (player !== currentPlayer) return;
    const hand = player === 1 ? p1Hand : p2Hand;
    const setHand = player === 1 ? setP1Hand : setP2Hand;
    const card = hand[cardIndex];
    const topCard = discard[discard.length - 1];

    if (card.color === topCard.color || card.value === topCard.value) {
      const newHand = [...hand];
      newHand.splice(cardIndex, 1);
      setHand(newHand);
      setDiscard([...discard, card]);
      
      if (newHand.length === 0) {
        setWinner(player);
        setGameStarted(false);
      } else {
        setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      }
      sounds.playCard();
    }
  };

  // Fix: Use React.MouseEvent<HTMLElement> to prevent generic Element type mismatch
  const drawCard = (event: React.MouseEvent<HTMLElement>) => {
    ripple(event);
    if (deck.length === 0) return;
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const setHand = currentPlayer === 1 ? setP1Hand : setP2Hand;
    const hand = currentPlayer === 1 ? p1Hand : p2Hand;
    setHand([...hand, card]);
    setDeck(newDeck);
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    sounds.playCard();
  };

  const CardUI: React.FC<{ card: Card, onMouseDown?: (e: React.MouseEvent) => void, hidden?: boolean }> = ({ card, onMouseDown, hidden }) => {
    const colorClasses = { red: 'bg-[#ff5555]', blue: 'bg-[#5555ff]', green: 'bg-[#55aa55]', yellow: 'bg-[#ffaa00] text-zinc-900', wild: 'bg-zinc-900' };
    return (
      <div 
        onMouseDown={onMouseDown} 
        className={`relative overflow-hidden w-16 h-24 sm:w-20 sm:h-32 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-4 border-white flex flex-col items-center justify-center font-black transition-all hover:-translate-y-4 active:scale-90 select-none ${hidden ? 'bg-[#222]' : colorClasses[card.color as keyof typeof colorClasses]}`}
      >
        <span className="text-[10px] absolute top-2 left-2">{hidden ? '' : card.value}</span>
        <div className="w-[80%] h-[60%] bg-white/20 rounded-[50%] flex items-center justify-center rotate-[-45deg] scale-110">
          <span className="rotate-[45deg] text-2xl sm:text-3xl">{hidden ? 'UNO' : card.value}</span>
        </div>
        <span className="text-[10px] absolute bottom-2 right-2 rotate-180">{hidden ? '' : card.value}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-8 max-w-6xl mx-auto min-h-[600px] p-4 animate-in fade-in duration-500">
      <div className={`w-full flex justify-between items-center p-5 rounded-3xl border shadow-xl ${theme === 'dark' ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/5'}`}>
        <Link to="/" onMouseDown={ripple} className="relative overflow-hidden flex items-center gap-2 hover:opacity-70 transition-all font-bold uppercase text-xs p-2 rounded-xl">
          <ArrowLeft size={20} /> Menu
        </Link>
        <h2 className="text-3xl font-black text-yellow-500 uppercase italic">Uno Classic</h2>
        <button onMouseDown={startNewGame} className="relative overflow-hidden p-3 bg-zinc-500/10 hover:bg-zinc-500/20 rounded-2xl transition-all">
          <RotateCcw size={20} />
        </button>
      </div>

      {!gameStarted ? (
        <button onMouseDown={startNewGame} className="relative overflow-hidden px-16 py-8 bg-[#ff5555] rounded-[3rem] font-black text-3xl text-white hover:scale-105 active:scale-95 transition-all shadow-2xl">
          COMEÇAR JOGO
        </button>
      ) : (
        <div className="flex flex-col items-center gap-12 w-full animate-in zoom-in-95">
          <div className="flex flex-col items-center gap-6 w-full opacity-60">
            <div className="flex flex-wrap justify-center gap-3">
              {p2Hand.map((card, i) => (<CardUI key={i} card={card} hidden={currentPlayer !== 2} onMouseDown={(e) => playCard(e, 2, i)} />))}
            </div>
            <p className="text-xs font-black uppercase opacity-50 tracking-widest">Oponente ({p2Hand.length})</p>
          </div>

          <div className="flex items-center gap-12 py-10 px-16 bg-white/5 rounded-[4rem] border border-white/5 shadow-inner relative">
            <div onMouseDown={drawCard} className="relative overflow-hidden text-center cursor-pointer group flex flex-col items-center p-2 rounded-2xl">
              <div className="w-20 h-32 bg-zinc-900 border-4 border-dashed border-white/20 rounded-xl flex items-center justify-center font-black text-white/20 group-hover:border-white group-hover:text-white transition-all shadow-xl">
                COMPRAR
              </div>
            </div>
            <CardUI card={discard[discard.length - 1]} />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase">Mesa Central</div>
          </div>

          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex flex-wrap justify-center gap-3">
              {p1Hand.map((card, i) => (<CardUI key={i} card={card} hidden={currentPlayer !== 1} onMouseDown={(e) => playCard(e, 1, i)} />))}
            </div>
            <h3 className={`font-black uppercase tracking-[0.3em] transition-all duration-500 ${currentPlayer === 1 ? 'text-blue-500 scale-125' : 'opacity-20'}`}>
               Seu Turno • {p1Hand.length} cartas
            </h3>
          </div>
        </div>
      )}

      {winner && <GameOverModal status="won" onRestart={() => startNewGame()} title="VENCEU O UNO!" message={`Parabéns Jogador ${winner}! Você dominou a mesa.`} />}
    </div>
  );
};

export default UnoGame;
