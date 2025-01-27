import { Position } from "@/types";

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
