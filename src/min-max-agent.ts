import { Agent, GameState, Position } from "./types";

// MinMax Agent Implementation with Alpha-Beta Pruning
export class MinMaxAgent implements Agent {
  private maxDepth: number;

  constructor(maxDepth: number = 7) {
    this.maxDepth = maxDepth;
  }

  getNextMove(gameState: GameState): Position {
    const validMoves = gameState.getValidNextPositions();

    // If only one valid move, return it
    if (validMoves.length === 1) return validMoves[0];

    // Evaluate each move using minimax with alpha-beta pruning
    const moveScores = validMoves.map((move) => {
      const nextState = gameState.getNextGameState(move);
      return {
        move,
        score: this.minimax(
          nextState,
          this.maxDepth,
          false,
          Number.NEGATIVE_INFINITY,
          Number.POSITIVE_INFINITY
        ),
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
    isMaximizing: boolean,
    alpha: number,
    beta: number
  ): number {
    // Base cases
    if (depth === 0 || gameState.isGameOver()) {
      return this.evaluateState(gameState);
    }

    const validMoves = gameState.getValidNextPositions();

    if (isMaximizing) {
      let maxEval = Number.NEGATIVE_INFINITY;

      for (const move of validMoves) {
        const nextState = gameState.getNextGameState(move);
        const evalScore = this.minimax(
          nextState,
          depth - 1,
          false,
          alpha,
          beta
        );
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) {
          break; // Beta cut-off
        }
      }
      return maxEval;
    } else {
      let minEval = Number.POSITIVE_INFINITY;

      for (const move of validMoves) {
        const nextState = gameState.getNextGameState(move);
        const evalScore = this.minimax(nextState, depth - 1, true, alpha, beta);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) {
          break; // Alpha cut-off
        }
      }
      return minEval;
    }
  }

  private evaluateState(gameState: GameState): number {
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
        ? -100
        : 0;

    // Penalize being close to itself
    const selfPenalty = snake
      .slice(1)
      .some((segment) => segment.x === head.x && segment.y === head.y)
      ? -100
      : 0;

    // Reward for being closer to food
    const foodReward = -foodDistance * 20;

    // Direct reward for eating the food
    const eatFoodReward = head.x === food.x && head.y === food.y ? 100 : 0;

    // Combine the factors
    return score * 10 + foodReward + eatFoodReward + wallPenalty + selfPenalty;
  }
}
