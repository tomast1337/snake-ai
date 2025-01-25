import { Agent, GameState, Position } from "./agent";

// MinMax Agent Implementation
export class MinMaxAgent implements Agent {
  private maxDepth: number;

  constructor(maxDepth: number = 3) {
    this.maxDepth = maxDepth;
  }

  getNextMove(gameState: GameState): Position {
    const validMoves = gameState.getValidNextPositions();

    // If only one valid move, return it
    if (validMoves.length === 1) return validMoves[0];

    // Evaluate each move using minimax
    const moveScores = validMoves.map((move) => {
      const nextState = gameState.getNextGameState(move);
      return {
        move,
        score: this.minimax(nextState, this.maxDepth, false),
      };
    });

    // Choose move with highest score
    return moveScores.reduce((best, current) =>
      current.score > best.score ? current : best
    ).move;
  }

  private minimax(
    gameState: GameState,
    depth: number,
    isMaximizing: boolean
  ): number {
    // Base cases
    if (depth === 0 || gameState.isGameOver()) {
      return this.evaluateState(gameState);
    }

    if (isMaximizing) {
      let maxEval = Number.NEGATIVE_INFINITY;
      const validMoves = gameState.getValidNextPositions();

      for (const move of validMoves) {
        const nextState = gameState.getNextGameState(move);
        const evalScore = this.minimax(nextState, depth - 1, false);
        maxEval = Math.max(maxEval, evalScore);
      }
      return maxEval;
    } else {
      let minEval = Number.POSITIVE_INFINITY;
      const validMoves = gameState.getValidNextPositions();

      for (const move of validMoves) {
        const nextState = gameState.getNextGameState(move);
        const evalScore = this.minimax(nextState, depth - 1, true);
        minEval = Math.min(minEval, evalScore);
      }
      return minEval;
    }
  }

  private evaluateState(gameState: GameState): number {
    // Evaluation function considers:
    // 1. Current score
    // 2. Distance to food
    // 3. Avoiding walls and self
    const score = gameState.getScore();
    const snake = gameState.snake;
    const head = snake[0];
    const food = gameState.food;

    // Calculate Manhattan distance to food
    const foodDistance = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);

    // Penalize being close to walls
    const wallPenalty =
      head.x <= 1 ||
      head.x >= gameState.width - 2 ||
      head.y <= 1 ||
      head.y >= gameState.height - 2
        ? -10
        : 0;

    // Reward for being closer to food
    return score * 10 - foodDistance + wallPenalty;
  }
}
