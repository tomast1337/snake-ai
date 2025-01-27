import { GameState } from "@/game/GameState.inteface";
import { Position } from "@/types";

export interface Agent {
  getNextMove: (gameState: GameState) => Position;
}
