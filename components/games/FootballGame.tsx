
import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../../types';
import { ArrowLeft, Trophy, Play, Users, Timer, Target, Sun, CloudRain, Snowflake, Smartphone, Cpu, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../../utils/soundEffects';
import GameHelp from './GameHelp';

type Team = 'A' | 'B'; 
type Weather = 'sunny' | 'rainy' | 'snowy';
type GameMode = '1P' | '2P';
type BallState = 'play' | 'goal' | 'throwin' | 'corner' | 'goalkick' | 'foul';

interface Player {
  x: number;
  y: number;
  team: Team;
  id: number;
  isControllable: boolean;
  angle: number;
  vx: number;
  vy: number;
  isGoalkeeper?: boolean;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ownerId: number | null; // Quem está com a posse
}

const FootballGame: React.FC<{ theme: Theme }> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'selection' | 'playing' | 'halftime' | 'finished'>('selection');
  const [ballState, setBallState] = useState<BallState>('play');
  const [gameMode, setGameMode] = useState<GameMode>('1P');
  const [score, setScore] = useState({ A: 0, B: 0 });
  const [matchTime, setMatchTime] = useState(0); 
  const [period, setPeriod] = useState<1 | 2>(1);
  const [weather, setWeather] = useState<Weather>('sunny');

  const requestRef = useRef<number>(0);
  const players = useRef<Player[]>([]);
  const ball = useRef<Ball>({ x: 500, y: 350, vx: 0, vy: 0, ownerId: null });
  const keys = useRef<{ [key: string]: boolean }>({});

  const STADIUM_WIDTH = 1000;
  const STADIUM_HEIGHT = 700;
  const PITCH_WIDTH = 850;
  const PITCH_HEIGHT = 550;
  const PITCH_X = (STADIUM_WIDTH - PITCH_WIDTH) / 2;
  const PITCH_Y = (STADIUM_HEIGHT - PITCH_HEIGHT) / 2;

  const GOAL_SIZE = 140;
  const PLAYER_RADIUS = 14;
  const BALL_RADIUS = 7;
  const FRICTION = 0.985;
  const PLAYER_SPEED = 3.2;
  const KICK_POWER = 16;
  const DRIBBLING_RADIUS = 22;

  const initGame = (mode: GameMode) => {
    setGameMode(mode);
    setGameState('playing');
    setMatchTime(0);
    setPeriod(1);
    setScore({ A: 0, B: 0 });
    setWeather(['sunny', 'rainy', 'snowy'][Math.floor(Math.random() * 3)] as Weather);
    resetPositions();
    sounds.playWhistle();
    sounds.playCrowd(true);
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const resetPositions = () => {
    players.current = [
      // TIME A (Azul - Esquerda)
      { x: PITCH_X + 40, y: STADIUM_HEIGHT / 2, team: 'A', id: 1, isControllable: true, angle: 0, vx: 0, vy: 0, isGoalkeeper: true },
      { x: PITCH_X + 200, y: PITCH_Y + 150, team: 'A', id: 2, isControllable: false, angle: 0, vx: 0, vy: 0 },
      { x: PITCH_X + 200, y: PITCH_Y + 400, team: 'A', id: 3, isControllable: false, angle: 0, vx: 0, vy: 0 },
      { x: PITCH_X + 400, y: STADIUM_HEIGHT / 2 - 100, team: 'A', id: 4, isControllable: false, angle: 0, vx: 0, vy: 0 },
      { x: PITCH_X + 400, y: STADIUM_HEIGHT / 2 + 100, team: 'A', id: 5, isControllable: false, angle: 0, vx: 0, vy: 0 },
      
      // TIME B (Preto - Direita)
      { x: PITCH_X + PITCH_WIDTH - 40, y: STADIUM_HEIGHT / 2, team: 'B', id: 6, isControllable: true, angle: Math.PI, vx: 0, vy: 0, isGoalkeeper: true },
      { x: PITCH_X + PITCH_WIDTH - 200, y: PITCH_Y + 150, team: 'B', id: 7, isControllable: false, angle: Math.PI, vx: 0, vy: 0 },
      { x: PITCH_X + PITCH_WIDTH - 200, y: PITCH_Y + 400, team: 'B', id: 8, isControllable: false, angle: Math.PI, vx: 0, vy: 0 },
      { x: PITCH_X + PITCH_WIDTH - 400, y: STADIUM_HEIGHT / 2 - 100, team: 'B', id: 9, isControllable: false, angle: Math.PI, vx: 0, vy: 0 },
      { x: PITCH_X + PITCH_WIDTH - 400, y: STADIUM_HEIGHT / 2 + 100, team: 'B', id: 10, isControllable: false, angle: Math.PI, vx: 0, vy: 0 },
    ];
    ball.current = { x: STADIUM_WIDTH / 2, y: STADIUM_HEIGHT / 2, vx: 0, vy: 0, ownerId: null };
    setBallState('play');
  };

  const gameLoop = () => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setMatchTime(prev => {
      const next = prev + 0.15; 
      if (next >= 1200) {
        if (period === 1) { setGameState('halftime'); return 1200; }
        else { setGameState('finished'); return 1200; }
      }
      return next;
    });

    // 1. LÓGICA DE JOGADORES
    players.current.forEach(p => {
      const isUser1 = p.team === 'A' && p.isControllable;
      const isUser2 = gameMode === '2P' && p.team === 'B' && p.isControllable;
      const isAI = !isUser1 && !isUser2;

      if (isUser1) {
        if (keys.current['w']) p.y -= PLAYER_SPEED; if (keys.current['s']) p.y += PLAYER_SPEED;
        if (keys.current['a']) p.x -= PLAYER_SPEED; if (keys.current['d']) p.x += PLAYER_SPEED;
      } else if (isUser2) {
        if (keys.current['ArrowUp']) p.y -= PLAYER_SPEED; if (keys.current['ArrowDown']) p.y += PLAYER_SPEED;
        if (keys.current['ArrowLeft']) p.x -= PLAYER_SPEED; if (keys.current['ArrowRight']) p.x += PLAYER_SPEED;
      } else if (isAI) {
        // IA FIFA Style: Se aproxima da bola se estiver perto, caso contrário volta pra posição base
        const dx = ball.current.x - p.x; const dy = ball.current.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 350) {
          p.x += (dx / dist) * (PLAYER_SPEED * 0.85);
          p.y += (dy / dist) * (PLAYER_SPEED * 0.85);
        }
      }
      p.x = Math.max(PITCH_X, Math.min(PITCH_X + PITCH_WIDTH, p.x));
      p.y = Math.max(PITCH_Y, Math.min(PITCH_Y + PITCH_HEIGHT, p.y));
    });

    // 2. LÓGICA DA BOLA E DRIBLE
    if (ball.current.ownerId) {
      const owner = players.current.find(p => p.id === ball.current.ownerId)!;
      ball.current.x = owner.x + Math.cos(owner.angle) * 15;
      ball.current.y = owner.y + Math.sin(owner.angle) * 15;
      ball.current.vx = 0; ball.current.vy = 0;

      // Chutar (Espaço para P1, Enter para P2)
      if ((owner.team === 'A' && keys.current[' ']) || (owner.team === 'B' && keys.current['Enter'])) {
        const goalX = owner.team === 'A' ? PITCH_X + PITCH_WIDTH : PITCH_X;
        const gdx = goalX - owner.x; const gdy = (STADIUM_HEIGHT/2) - owner.y;
        const gdist = Math.sqrt(gdx*gdx + gdy*gdy);
        ball.current.vx = (gdx / gdist) * KICK_POWER;
        ball.current.vy = (gdy / gdist) * KICK_POWER;
        ball.current.ownerId = null;
        sounds.playMove();
      }
      // Passar (K para P1, L para P2)
      if ((owner.team === 'A' && keys.current['k']) || (owner.team === 'B' && keys.current['l'])) {
        ball.current.vx = (owner.team === 'A' ? 1 : -1) * 12;
        ball.current.ownerId = null;
        sounds.playMove();
      }
    } else {
      ball.current.x += ball.current.vx; ball.current.y += ball.current.vy;
      ball.current.vx *= FRICTION; ball.current.vy *= FRICTION;

      // Detecção de Posse
      players.current.forEach(p => {
        const dx = ball.current.x - p.x; const dy = ball.current.y - p.y;
        if (Math.sqrt(dx*dx + dy*dy) < DRIBBLING_RADIUS) ball.current.ownerId = p.id;
      });
    }

    // 3. REGRAS E LIMITES (Out of Bounds)
    if (ball.current.x < PITCH_X || ball.current.x > PITCH_X + PITCH_WIDTH) {
      if (ball.current.y > (STADIUM_HEIGHT - GOAL_SIZE)/2 && ball.current.y < (STADIUM_HEIGHT + GOAL_SIZE)/2) {
        if (ball.current.x < STADIUM_WIDTH/2) setScore(s => ({...s, B: s.B+1})); else setScore(s => ({...s, A: s.A+1}));
        sounds.playWin(); resetPositions();
      } else {
        ball.current.vx *= -0.8; ball.current.x = Math.max(PITCH_X, Math.min(PITCH_X + PITCH_WIDTH, ball.current.x));
      }
    }
    if (ball.current.y < PITCH_Y || ball.current.y > PITCH_Y + PITCH_HEIGHT) {
      ball.current.vy *= -0.8; ball.current.y = Math.max(PITCH_Y, Math.min(PITCH_Y + PITCH_HEIGHT, ball.current.y));
    }

    // 4. SELEÇÃO AUTOMÁTICA DE JOGADOR
    const autoSelect = (team: Team) => {
      let nearest = players.current.filter(p => p.team === team).reduce((prev, curr) => {
        const d1 = Math.sqrt((prev.x - ball.current.x)**2 + (prev.y - ball.current.y)**2);
        const d2 = Math.sqrt((curr.x - ball.current.x)**2 + (curr.y - ball.current.y)**2);
        return d1 < d2 ? prev : curr;
      });
      players.current.forEach(p => { if(p.team === team) p.isControllable = p.id === nearest.id; });
    };
    autoSelect('A'); if (gameMode === '2P') autoSelect('B');

    // 5. RENDERIZAÇÃO
    ctx.clearRect(0, 0, STADIUM_WIDTH, STADIUM_HEIGHT);
    ctx.fillStyle = '#1e293b'; ctx.fillRect(0,0, STADIUM_WIDTH, STADIUM_HEIGHT); // Fora do estádio
    ctx.fillStyle = weather === 'snowy' ? '#e2e8f0' : '#14532d';
    ctx.fillRect(PITCH_X - 20, PITCH_Y - 20, PITCH_WIDTH + 40, PITCH_HEIGHT + 40); // Borda campo
    
    // Gramado
    ctx.fillStyle = weather === 'snowy' ? '#f1f5f9' : '#166534';
    for(let i=0; i<PITCH_WIDTH; i+=100) ctx.fillRect(PITCH_X + i, PITCH_Y, 50, PITCH_HEIGHT);
    
    // Linhas
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
    ctx.strokeRect(PITCH_X, PITCH_Y, PITCH_WIDTH, PITCH_HEIGHT);
    ctx.beginPath(); ctx.moveTo(STADIUM_WIDTH/2, PITCH_Y); ctx.lineTo(STADIUM_WIDTH/2, PITCH_Y+PITCH_HEIGHT); ctx.stroke();
    ctx.beginPath(); ctx.arc(STADIUM_WIDTH/2, STADIUM_HEIGHT/2, 80, 0, Math.PI*2); ctx.stroke();
    ctx.strokeRect(PITCH_X, STADIUM_HEIGHT/2-150, 150, 300); ctx.strokeRect(PITCH_X+PITCH_WIDTH-150, STADIUM_HEIGHT/2-150, 150, 300);

    // Traves
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillRect(PITCH_X-15, STADIUM_HEIGHT/2-GOAL_SIZE/2, 15, GOAL_SIZE);
    ctx.fillRect(PITCH_X+PITCH_WIDTH, STADIUM_HEIGHT/2-GOAL_SIZE/2, 15, GOAL_SIZE);

    // Jogadores
    players.current.forEach(p => {
      ctx.save();
      ctx.beginPath(); ctx.arc(p.x, p.y, PLAYER_RADIUS, 0, Math.PI*2);
      ctx.fillStyle = p.team === 'A' ? '#1e40af' : '#000'; ctx.fill();
      ctx.strokeStyle = p.team === 'A' ? '#ef4444' : '#fff'; ctx.lineWidth = 3; ctx.stroke();
      if (p.isControllable) {
        ctx.beginPath(); ctx.arc(p.x, p.y, PLAYER_RADIUS + 6, 0, Math.PI*2);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.stroke();
      }
      ctx.restore();
    });

    // Bola
    ctx.beginPath(); ctx.arc(ball.current.x, ball.current.y, BALL_RADIUS, 0, Math.PI*2);
    ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.stroke();

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keys.current[e.key] = true;
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.key] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(requestRef.current); sounds.playCrowd(false);
    };
  }, [gameState]);

  return (
    <div className="flex flex-col items-center gap-4 max-w-[1100px] mx-auto p-2 select-none">
      <div className="w-full flex justify-between items-center bg-zinc-900/90 p-4 rounded-3xl border border-white/10 shadow-2xl">
        <Link to="/" className="text-white/60 hover:text-white transition-all"><ArrowLeft size={24} /></Link>
        <div className="flex items-center gap-6">
          <div className="text-center"><p className="text-[10px] font-black text-blue-500 uppercase">AZUL</p><p className="text-3xl font-black">{score.A}</p></div>
          <p className="text-xl font-black opacity-20">VS</p>
          <div className="text-center"><p className="text-[10px] font-black text-white uppercase">PRETO</p><p className="text-3xl font-black">{score.B}</p></div>
        </div>
        <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
          <Timer size={20} className="text-red-500" /><p className="font-mono font-black text-xl">{(Math.floor(matchTime/60)).toString().padStart(2, '0')}:{(Math.floor(matchTime%60)).toString().padStart(2, '0')}</p>
        </div>
      </div>

      <div className="relative w-full aspect-[16/10] rounded-[2rem] overflow-hidden border-4 border-zinc-800 bg-zinc-950 shadow-2xl">
        {gameState === 'selection' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
            <Trophy size={64} className="text-yellow-500 mb-4" />
            <h2 className="text-3xl font-black italic text-white uppercase mb-8">FIFA 20 MOBILE</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
              <button onClick={() => initGame('1P')} className="p-6 bg-zinc-800 rounded-2xl border-2 border-white/10 hover:border-blue-500 transition-all flex items-center gap-4"><Cpu className="text-blue-500" /> <div className="text-left"><p className="font-black">CARREIRA</p><p className="text-[10px] opacity-50">VS CPU</p></div></button>
              <button onClick={() => initGame('2P')} className="p-6 bg-zinc-800 rounded-2xl border-2 border-white/10 hover:border-red-500 transition-all flex items-center gap-4"><Users className="text-red-500" /> <div className="text-left"><p className="font-black">VERSUS</p><p className="text-[10px] opacity-50">LOCAL</p></div></button>
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-10 text-center">
            <Trophy size={100} className="text-yellow-500 mb-6" />
            <h2 className="text-5xl font-black italic text-white mb-8">FIM DE JOGO</h2>
            <button onClick={() => setGameState('selection')} className="px-10 py-4 bg-white text-black rounded-full font-black">VOLTAR AO HUB</button>
          </div>
        )}

        <canvas ref={canvasRef} width={STADIUM_WIDTH} height={STADIUM_HEIGHT} className="w-full h-full object-contain" />

        {/* HUD MOBILE SIMULADO */}
        <div className="absolute bottom-6 right-6 flex gap-3 pointer-events-none opacity-40">
          <div className="w-14 h-14 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center font-black text-[10px]">PASSE</div>
          <div className="w-14 h-14 rounded-full bg-red-600 border-2 border-white flex items-center justify-center font-black text-[10px]">CHUTE</div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5"><h4 className="text-[9px] font-black opacity-30 uppercase">TIME A (WASD)</h4><p className="text-xs font-bold">K: Passe | ESPAÇO: Chute</p></div>
        <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5"><h4 className="text-[9px] font-black opacity-30 uppercase">TIME B (SETAS)</h4><p className="text-xs font-bold">L: Passe | ENTER: Chute</p></div>
        <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20"><h4 className="text-[9px] font-black text-blue-500 uppercase">DICA FIFA</h4><p className="text-xs font-medium">Conduza a bola apenas andando sobre ela!</p></div>
      </div>

      <GameHelp
        theme={theme}
        title="Regras FIFA 20 - Copa ZRI"
        rules={[
          "POSSE: Encoste na bola para começar a driblar. Ela ficará 'presa' ao seu pé.",
          "PASSE: Use as teclas K (P1) ou L (P2) para passes curtos.",
          "CHUTE: Use ESPAÇO (P1) ou ENTER (P2) para disparar contra o gol.",
          "FALTA: Colisões entre jogadores podem resultar em perda de bola.",
          "LIMITE: Se a bola sair pelas laterais, o jogo reinicia em posse do oponente.",
          "GOAL: Acerte dentro da rede branca para pontuar.",
          "MODO SOLO: O computador controlará o time adversário com inteligência tática."
        ]}
        youtubeId="S3Uu49vY560"
      />
    </div>
  );
};

export default FootballGame;
