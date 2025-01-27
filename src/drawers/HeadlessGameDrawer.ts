import { SnakeGame } from "@/game/SnakeGame";
import { GameDrawer } from "@/drawers/GameDrawer.inteface";

export class HeadlessGameDrawer implements GameDrawer {
  public clear(): void {
    // No-op
    return;
  }

  public drawGame(_state: SnakeGame): void {
    // No-op
    return;
  }
}
