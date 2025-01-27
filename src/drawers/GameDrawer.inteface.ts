import { SnakeGame } from "./SnakeGame";

export interface GameDrawer {
  drawGame(state: SnakeGame): void;
  clear(): void;
}
