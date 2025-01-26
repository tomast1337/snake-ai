import { Agent, GameState, Position } from "./types";

// MinMax Agent Implementation with Alpha-Beta Pruning
export class MinMaxAgent implements Agent {
  private maxDepth: number;
  private recentMoves: Position[] = [];

  constructor(maxDepth: number = 10) {
    this.maxDepth = maxDepth;
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

  getNextMove(gameState: GameState): Position {
    const validMoves = gameState.getValidNextPositions();

    if (validMoves.length === 1) return validMoves[0];

    // Remove recently visited moves
    const filteredMoves = validMoves.filter(
      (move) =>
        !this.recentMoves.some(
          (recent) => recent.x === move.x && recent.y === move.y
        )
    );

    const moveToUse = filteredMoves.length > 0 ? filteredMoves : validMoves;

    const moveScores = moveToUse
      .map((move) => {
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
      })
      .sort((a, b) => b.score - a.score);

    const bestMove = moveScores[0].move;
    // Track recent moves to prevent immediate backtracking
    this.recentMoves.push(bestMove);
    if (this.recentMoves.length > 5) {
      this.recentMoves.shift();
    }

    return bestMove;
  }

  // Rest of the implementation remains the same...

  private evaluateState(gameState: GameState): number {
    const { snake, food } = gameState;
    const head = snake[0];

    if (gameState.isGameOver()) return Number.NEGATIVE_INFINITY;

    // More nuanced distance calculation
    const foodDistance = this.calculateFoodDistance(head, food);

    // Prefer direct paths
    const directionalBonus = this.getDirectionalBonus(snake, food);

    // Combine evaluation factors
    return gameState.getScore() * 100 - foodDistance * 10 + directionalBonus;
  }

  private calculateFoodDistance(head: Position, food: Position): number {
    // Euclidean distance for more natural movement
    //const dist = Math.sqrt(
    //  Math.pow(head.x - food.x, 2) + Math.pow(head.y - food.y, 2)
    //);
    // manhattan distance
    const manhattanDist = Math.abs(head.x - food.x) + Math.abs(head.y - food.y);
    // if the food is in the same row or column, return the distance
    if (head.x === food.x || head.y === food.y) return manhattanDist;
    // if the food is in a diagonal, return the distance + 2, because the snake has to move 2 cells to reach the food
    return manhattanDist + 2;
  }

  private getDirectionalBonus(snake: Position[], food: Position): number {
    const head = snake[0];
    const xDirection = Math.sign(food.x - head.x);
    const yDirection = Math.sign(food.y - head.y);

    // Bonus for moving towards food
    return (
      (xDirection === Math.sign(head.x) ? 10 : 0) +
      (yDirection === Math.sign(head.y) ? 10 : 0)
    );
  }
}
