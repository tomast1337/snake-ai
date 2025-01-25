export interface GameState {
  width: number;
  height: number;
  snake: Position[];
  food: Position;
  getValidNextPositions: () => Position[];
  getNextGameState: (nextMove: Position) => GameState;
  getScore: () => number;
  isGameOver: () => boolean;
}

export interface Agent {
  getNextMove: (gameState: GameState) => Position;
}
export interface Position {
  x: number;
  y: number;
}
