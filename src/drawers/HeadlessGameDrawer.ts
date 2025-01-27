import { SnakeGame } from "../SnakeGame";
import { GameDrawer } from "../types";

export class HeadlessGameDrawer implements GameDrawer {
  public clear(): void {
    // No-op
  }

  public drawGame(state: SnakeGame): void {
    // No-op
  }
}
