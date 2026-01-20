
export type Theme = 'light' | 'dark';

export interface GameState {
  currentPlayer: 1 | 2;
  winner: 1 | 2 | null;
  board: any;
}

export enum GameType {
  CHECKERS = 'checkers',
  CHESS = 'chess',
  PUZZLE = 'puzzle',
  UNO = 'uno',
  LUDO = 'ludo'
}
