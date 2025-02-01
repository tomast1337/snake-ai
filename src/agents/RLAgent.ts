import { Agent } from "@/agents/Agent.inteface";
import { GameState } from "@/game/GameState.inteface";
import { Position } from "@/types";

export class RLAgent implements Agent {
  private qTable: Record<string, Record<string, number>> = {}; // Q-table: { state: { action: Q-value } }
  private learningRate: number = 0.1; // Learning rate (alpha)
  private discountFactor: number = 0.9; // Discount factor (gamma)
  private explorationRate: number = 1.0; // Exploration rate (epsilon)
  private explorationDecay: number = 0.995; // Decay rate for exploration
  private minExplorationRate: number = 0.01; // Minimum exploration rate

  constructor() {
    // Initialize the Q-table
    this.qTable = {};
  }

  getNextMove(gameState: GameState): Position {
    const state = this.getStateKey(gameState); // Convert game state to a string key
    const validMoves = gameState.getValidNextPositions();

    // Check if there are no valid moves
    if (validMoves.length === 0) {
      // Handle the case where there are no valid moves
      // You can return a default position or handle it as needed
      return { x: -1, y: -1 }; // Example default position
    }

    // Choose an action (explore or exploit)
    let action: Position;
    if (Math.random() < this.explorationRate) {
      // Explore: choose a random valid move
      action = validMoves[Math.floor(Math.random() * validMoves.length)];
    } else {
      // Exploit: choose the action with the highest Q-value
      action = this.getBestAction(state, validMoves);
    }

    return action;
  }

  private getStateKey(gameState: GameState): string {
    // Convert the game state to a unique string key
    const { snake, food } = gameState;
    const head = snake[0];
    const foodDirection = {
      x: food.x - head.x,
      y: food.y - head.y,
    };
    return `${head.x},${head.y},${foodDirection.x},${foodDirection.y}`;
  }

  private getBestAction(state: string, validMoves: Position[]): Position {
    // Get the Q-values for the current state
    const stateQValues = this.qTable[state] || {};

    // Find the action with the highest Q-value
    let bestAction = validMoves[0];
    let bestQValue = stateQValues[this.getActionKey(bestAction)] || 0;

    for (const move of validMoves) {
      const actionKey = this.getActionKey(move);
      const qValue = stateQValues[actionKey] || 0;
      if (qValue > bestQValue) {
        bestAction = move;
        bestQValue = qValue;
      }
    }

    return bestAction;
  }

  private getActionKey(action: Position): string {
    // Convert the action to a unique string key
    return `${action.x},${action.y}`;
  }

  public updateQTable(
    gameState: GameState,
    action: Position,
    reward: number,
    nextGameState: GameState
  ): void {
    const state = this.getStateKey(gameState);
    const nextState = this.getStateKey(nextGameState);
    const actionKey = this.getActionKey(action);

    // Initialize Q-values for the current state if they don't exist
    if (!this.qTable[state]) {
      this.qTable[state] = {};
    }

    // Get the current Q-value for the state-action pair
    const currentQValue = this.qTable[state][actionKey] || 0;

    // Get the maximum Q-value for the next state
    const nextStateQValues = this.qTable[nextState] || {};
    const maxNextQValue = Math.max(...Object.values(nextStateQValues), 0);

    // Update the Q-value using the Q-learning formula
    const newQValue =
      currentQValue +
      this.learningRate *
        (reward + this.discountFactor * maxNextQValue - currentQValue);

    // Update the Q-table
    this.qTable[state][actionKey] = newQValue;

    // Decay the exploration rate
    this.explorationRate = Math.max(
      this.explorationRate * this.explorationDecay,
      this.minExplorationRate
    );
  }

  public saveModel(): void {
    // Save the Q-table to a JSON file
    const data = JSON.stringify(this.qTable, null, 2);
    // local storage
    localStorage.setItem("qTable", data);
  }

  public loadModel(): void {
    // Load the Q-table from a JSON file
    const data = localStorage.getItem("qTable");
    if (!data) {
      throw new Error("Model not found");
    }
    this.qTable = JSON.parse(data);
  }
}
