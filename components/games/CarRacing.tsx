
import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../../types';
import { ArrowLeft, Trophy, Coins, ShoppingCart, Play, Eye, Timer, Gauge, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CloudRain, Snowflake, Sun, Moon, Sunrise, Settings, Keyboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sounds } from '../../utils/soundEffects';
import GameHelp from './GameHelp';

interface CarModel {
  name: string;
  color: string;
  price: number;
  maxSpeed: number;
  accel: number;
  id: number;
  type: 'compact' | 'van' | 'f1' | 'sport' | 'classic';
}

interface SceneryObject {
  id: number;
  x: number;
  y: number;
  type: 'building' | 'house' | 'gas_station' | 'diner' | 'apartment' | 'cow' | 'horse';
  height: number;
  width: number;
  color: string;
}

interface SkidMark {
  x: number;
  y: number;
  opacity: number;
}

type Weather = 'sunny' | 'rainy' | 'snowy' | 'night' | 'dawn';

const CAR_MODELS: CarModel[] = [
  { id: 0, name: "Fusca Amarelo", color: "#fbbf24", price: 0, maxSpeed: 10, accel: 0.12, type: 'compact' },
  { id: 1, name: "Kombi Vermelha", color: "#dc2626", price: 300, maxSpeed: 9, accel: 0.08, type: 'van' },
  { id: 2, name: "Chevette Azul", color: "#2563eb", price: 800, maxSpeed: 13, accel: 0.15, type: 'classic' },
  { id: 3, name: "Golf Preto", color: "#171717", price: 2000, maxSpeed: 16, accel: 0.20, type: 'compact' },
  { id: 4, name: "Turbo Azul", color: "#0ea5e9", price: 5000, maxSpeed: 20, accel: 0.28, type: 'sport' },
  { id: 5, name: "F1 Vermelho", color: "#ff0000", price: 15000, maxSpeed: 30, accel: 0.55, type: 'f1' },
  { id: 6, name: "Sport Silver", color: "#94a3b8", price: 7500, maxSpeed: 22, accel: 0.32, type: 'sport' },
  { id: 7, name: "Hyper Green", color: "#22c55e", price: 10000, maxSpeed: 24, accel: 0.38, type: 'sport' },
  { id: 8, name: "Classic White", color: "#f8fafc", price: 1200, maxSpeed: 12, accel: 0.14, type: 'classic' },
  { id: 9, name: "Concept Orange", color: "#f97316", price: 25000, maxSpeed: 32, accel: 0.65, type: 'f1' },
];

const RACE_DURATION_MS = 180000;

const CarRacing: React.FC<{ theme: Theme }> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'playing' | 'garage' | 'result' | 'settings'>('menu');
  const [coins, setCoins] = useState<number>(() => Number(localStorage.getItem('racing_coins')) || 0);
  const [ownedCars, setOwnedCars] = useState<number[]>(() => JSON.parse(localStorage.getItem('racing_owned') || '[0]'));
  const [selectedCar, setSelectedCar] = useState<number>(() => Number(localStorage.getItem('racing_selected')) || 0);
  const [raceResult, setRaceResult] = useState<{ win: boolean; reward: number; distance: number } | null>(null);
  const [countdown, setCountdown] = useState<number | string>(3);
  const [weather, setWeather] = useState<Weather>('sunny');
  
  const [keybinds] = useState(() => JSON.parse(localStorage.getItem('racing_keys') || JSON.stringify({
    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight'
  })));

  const requestRef = useRef<number>(0);
  const playerPos = useRef({ x: 200, y: 500, speed: 0 });
  const enemies = useRef<any[]>([]);
  const trackOffset = useRef(0);
  const startTime = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    localStorage.setItem('racing_coins', coins.toString());
    localStorage.setItem('racing_owned', JSON.stringify(ownedCars));
    localStorage.setItem('racing_selected', selectedCar.toString());
  }, [coins, ownedCars, selectedCar]);

  const startCountdown = () => {
    setGameState('countdown');
    setCountdown(3);
    setWeather(['sunny', 'rainy', 'snowy', 'night', 'dawn'][Math.floor(Math.random()*5)] as Weather);
    sounds.playDice();
    let count = 3;
    const timer = setInterval(() => {
      count--;
      if (count > 0) { setCountdown(count); sounds.playDice(); }
      else if (count === 0) { setCountdown("VAI!"); sounds.playMove(); }
      else { clearInterval(timer); startRace(); }
    }, 1000);
  };

  const startRace = () => {
    setGameState('playing');
    playerPos.current = { x: 200, y: 500, speed: 0 };
    enemies.current = [];
    trackOffset.current = 0;
    startTime.current = Date.now();
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const car = CAR_MODELS[selectedCar];
    const elapsed = Date.now() - startTime.current;

    // Movimentação
    if (playerPos.current.speed > 0.5) {
      if (keys.current[keybinds.left]) playerPos.current.x -= 6;
      if (keys.current[keybinds.right]) playerPos.current.x += 6;
    }
    if (keys.current[keybinds.up]) playerPos.current.speed = Math.min(playerPos.current.speed + car.accel, car.maxSpeed);
    else if (keys.current[keybinds.down]) playerPos.current.speed = Math.max(playerPos.current.speed - car.accel * 4, 0);
    else playerPos.current.speed = Math.max(playerPos.current.speed - 0.1, 0);

    playerPos.current.x = Math.max(90, Math.min(310, playerPos.current.x));
    trackOffset.current += playerPos.current.speed;
    if (elapsed >= RACE_DURATION_MS) { endRace(true); return; }

    // Spawn Inimigos
    if (Math.random() < 0.02 && enemies.current.length < 5) {
      enemies.current.push({ x: 100 + Math.random() * 200, y: -100, speed: 5 + Math.random() * 10, color: CAR_MODELS[Math.floor(Math.random()*CAR_MODELS.length)].color });
    }

    // Colisões
    enemies.current.forEach((e, idx) => {
      e.y += playerPos.current.speed - e.speed;
      if (Math.abs(playerPos.current.x - e.x) < 28 && Math.abs(playerPos.current.y - e.y) < 50) { endRace(false); return; }
      if (e.y > 700 || e.y < -500) enemies.current.splice(idx, 1);
    });

    // Render
    ctx.clearRect(0,0,400,600);
    ctx.fillStyle = weather === 'snowy' ? '#e2e8f0' : '#15803d'; ctx.fillRect(0,0,400,600); 
    ctx.fillStyle = '#262626'; ctx.fillRect(80,0,240,600); // Estrada
    
    ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4; ctx.setLineDash([40,40]); ctx.lineDashOffset = -trackOffset.current;
    ctx.beginPath(); ctx.moveTo(200,0); ctx.lineTo(200,600); ctx.stroke();

    drawCar(ctx, playerPos.current.x, playerPos.current.y, car.color);
    enemies.current.forEach(e => drawCar(ctx, e.x, e.y, e.color));

    if (gameState === 'playing') requestRef.current = requestAnimationFrame(gameLoop);
  };

  const drawCar = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    // Retângulo padrão para maior compatibilidade
    ctx.fillRect(x-15, y-25, 30, 50);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; 
    ctx.fillRect(x-12, y-15, 24, 15); // Vidro
    // Rodas
    ctx.fillStyle = '#000';
    ctx.fillRect(x-18, y-20, 5, 10);
    ctx.fillRect(x+13, y-20, 5, 10);
    ctx.fillRect(x-18, y+10, 5, 10);
    ctx.fillRect(x+13, y+10, 5, 10);
  };

  const endRace = (finished: boolean) => {
    cancelAnimationFrame(requestRef.current);
    const dist = Math.floor(trackOffset.current / 100);
    const reward = finished ? 2500 : Math.floor(dist / 2);
    setCoins(c => c + reward);
    setRaceResult({ win: finished, reward, distance: dist });
    setGameState('result');
    if (finished) sounds.playWin(); else sounds.playCapture();
  };

  const buyCar = (car: CarModel) => {
    if (coins >= car.price && !ownedCars.includes(car.id)) {
      setCoins(c => c - car.price);
      setOwnedCars(prev => [...prev, car.id]);
      setSelectedCar(car.id);
      sounds.playDice();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keys.current[e.key] = true;
    const handleKeyUp = (e: KeyboardEvent) => keys.current[e.key] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 max-w-6xl mx-auto p-4 select-none">
      <div className="w-full flex justify-between items-center bg-zinc-900/60 p-5 rounded-3xl border border-white/10 shadow-2xl">
        <Link to="/" className="text-white/60 hover:text-white flex items-center gap-2 font-bold"><ArrowLeft size={24} /> Voltar</Link>
        <div className="flex items-center gap-4 text-yellow-500 font-black text-xl">
           <Coins size={24} /> {coins}
        </div>
      </div>

      <div className="relative w-full max-w-[400px] aspect-[2/3] rounded-[3rem] overflow-hidden border-8 border-zinc-800 bg-zinc-950 shadow-2xl">
        {gameState === 'menu' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 gap-6 bg-black/60 backdrop-blur-md">
            <h3 className="text-4xl font-black italic text-white text-center">CITY RACER</h3>
            <button onClick={startCountdown} className="w-full py-5 bg-red-600 rounded-2xl font-black text-white text-xl hover:scale-105 transition-all">INICIAR CORRIDA</button>
            <div className="grid grid-cols-1 gap-4 w-full">
               <button onClick={() => setGameState('garage')} className="py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20">GARAGEM DE CARROS</button>
            </div>
          </div>
        )}

        {gameState === 'garage' && (
          <div className="absolute inset-0 z-20 bg-zinc-900 flex flex-col p-6 overflow-y-auto">
             <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-black">GARAGEM</h3><button onClick={() => setGameState('menu')} className="p-2 bg-white/10 rounded-full"><ArrowLeft/></button></div>
             {CAR_MODELS.map(car => (
               <div key={car.id} className={`p-4 mb-3 rounded-2xl flex justify-between items-center ${ownedCars.includes(car.id) ? 'bg-zinc-800' : 'bg-zinc-950 border border-white/5'}`}>
                  <div className="flex items-center gap-3"><div className="w-8 h-12 rounded-md" style={{backgroundColor: car.color}}/><span className="font-bold">{car.name}</span></div>
                  {ownedCars.includes(car.id) ? (
                    <button onClick={() => setSelectedCar(car.id)} className={`px-4 py-2 rounded-lg font-black text-xs ${selectedCar === car.id ? 'bg-red-600 text-white' : 'bg-white/10 text-white/60'}`}>{selectedCar === car.id ? 'ATIVO' : 'USAR'}</button>
                  ) : (
                    <button onClick={() => buyCar(car)} disabled={coins < car.price} className={`px-4 py-2 rounded-lg text-xs font-black ${coins >= car.price ? 'bg-yellow-600 text-white' : 'bg-zinc-700 text-zinc-500'}`}>${car.price}</button>
                  )}
               </div>
             ))}
          </div>
        )}

        {(gameState === 'playing' || gameState === 'countdown') && (
           <>
             <canvas ref={canvasRef} width={400} height={600} className="w-full h-full" />
             {gameState === 'countdown' && <div className="absolute inset-0 flex items-center justify-center text-8xl font-black italic text-white animate-ping">{countdown}</div>}
           </>
        )}

        {gameState === 'result' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-10 text-center gap-6">
             <h2 className="text-4xl font-black text-white">{raceResult?.win ? 'MISSÃO CUMPRIDA' : 'FIM DA LINHA'}</h2>
             <p className="text-2xl text-yellow-500 font-bold">+ {raceResult?.reward} MOEDAS</p>
             <button onClick={() => setGameState('menu')} className="w-full py-4 bg-white text-black rounded-2xl font-black shadow-xl hover:scale-105 transition-all">VOLTAR AO MENU</button>
          </div>
        )}
      </div>
      <GameHelp theme={theme} title="Dicas de Direção" rules={["Evite os outros carros a todo custo.", "Quanto mais rápido você for, mais moedas ganha.", "Freie (Baixo/Down) antes de bater para tentar manobrar.", "Compre carros melhores na garagem para atingir velocidades insanas."]} youtubeId="S3Uu49vY560"/>
    </div>
  );
};

export default CarRacing;
