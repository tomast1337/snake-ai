import { SnakeGame } from "./SnakeGame";

export interface GameState {
  dx: number;
  dy: number;
  width: number;
  height: number;
  snake: Position[];
  food: Position;
  getValidNextPositions: () => Position[];
  getNextGameState: (nextMove: Position) => GameState;
  getScore: () => number;
  isGameOver: () => boolean;
}

export interface GameDrawer {
  drawGame(state: SnakeGame): void;
  clear(): void;
}

export interface Agent {
  getNextMove: (gameState: GameState) => Position;
}
export interface Position {
  x: number;
  y: number;
}
