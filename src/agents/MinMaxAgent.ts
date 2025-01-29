import { Position } from "@/types";
import { Agent } from "@/agents/Agent.inteface";
import { GameState } from "@/game/GameState.inteface";
import { AStar } from "./AStar";

export class MinMaxAgent implements Agent {
  private maxDepth: number;
  private pathCache: Map<string, Position[]> = new Map();

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

    // Get the A* path to the food
    const path = this.getCachedPath(
      gameState.snake,
      gameState.food,
      gameState.width,
      gameState.height
    );

    // If a path exists, prioritize moves along the path
    if (path.length > 0) {
      const nextPositionOnPath = path[1]; // The next step on the path
      for (const move of validMoves) {
        if (
          move.x === nextPositionOnPath.x &&
          move.y === nextPositionOnPath.y
        ) {
          return move;
        }
      }
    }

    // If no path exists, fall back to minimax
    const moveScores = validMoves
      .map((move) => {
        const nextState = gameState.getNextGameState(move);
        return {
          move,
          score: this.minimax(
            nextState,
            this.getDynamicDepth(gameState),
            false,
            Number.NEGATIVE_INFINITY,
            Number.POSITIVE_INFINITY
          ),
        };
      })
      .sort((a, b) => b.score - a.score);

    return moveScores[0].move;
  }

  private getDynamicDepth(gameState: GameState): number {
    // Increase depth as the snake grows
    return Math.min(this.maxDepth, Math.floor(gameState.getScore() / 5) + 3);
  }

  private evaluateState(gameState: GameState): number {
    const { snake, food, width } = gameState;
    //const head = snake[0];
    const snakeLength = snake.length;

    // If the game is over, return the worst possible score
    if (gameState.isGameOver()) return Number.NEGATIVE_INFINITY;

    // Food distance (Manhattan distance)
    //const foodDistance = this.calculateFoodDistance(head, food);

    // A* pathfinding to food
    const path = this.getCachedPath(
      snake,
      food,
      gameState.width,
      gameState.height
    );
    const pathDistance = path.length;

    // Exponential bonus for being closer to the food
    const foodBonus = Math.exp(-pathDistance) * ((width * width) / snakeLength);
    // Scale the bonus

    // Self-collision penalty
    const selfCollisionPenalty = this.calculateSelfCollisionRisk(snake);

    // Snake max side length
    const snakeMaxSideLength = this.getSnakeMaxSideLength(gameState);
    // if the snake is too long has a the same length of the board - 3 penalize
    const snakeTooLongSidePenalty =
      snakeMaxSideLength >= width * width - 3 ? 100 : 0;
    // Combine evaluation factors
    const foodWeight = 100; // Prioritize food
    const pathWeight = 10; // Penalize longer paths
    const collisionWeight = 50; // Penalize self-collision risks

    return (
      gameState.getScore() * foodWeight - // Reward higher scores
      pathDistance * foodWeight + // Penalize distance to food
      foodBonus + // Large bonus for eating food
      pathDistance * pathWeight - // Penalize longer paths
      selfCollisionPenalty * collisionWeight - // Penalize self-collision risks
      snakeTooLongSidePenalty
    );
  }

  private getSnakeMaxSideLength(gameState: GameState): number {
    const { snake } = gameState;

    // find the max side length of the snake
    let maxSideLength = 0;
    let sideLength = 1;
    let prev = snake[0];
    for (let i = 1; i < snake.length; i++) {
      const curr = snake[i];
      if (curr.x === prev.x || curr.y === prev.y) {
        sideLength++;
      } else {
        maxSideLength = Math.max(maxSideLength, sideLength);
        sideLength = 1;
      }
      prev = curr;
    }

    return Math.max(maxSideLength, sideLength);
  }

  private calculateFoodDistance(head: Position, food: Position): number {
    return Math.abs(head.x - food.x) + Math.abs(head.y - food.y); // Manhattan distance
  }

  private calculateSelfCollisionRisk(snake: Position[]): number {
    const head = snake[0];
    let risk = 0;

    // Check how close the head is to the body
    for (let i = 1; i < snake.length; i++) {
      const distance =
        Math.abs(head.x - snake[i].x) + Math.abs(head.y - snake[i].y);
      if (distance <= 2) {
        risk += 1 / distance; // Increase risk for closer body segments
      }
    }

    return risk;
  }

  private getCachedPath(
    snake: Position[],
    food: Position,
    width: number,
    height: number
  ): Position[] {
    const key = `${snake[0].x},${snake[0].y}-${food.x},${food.y}`;
    if (this.pathCache.has(key)) {
      return this.pathCache.get(key)!;
    }
    const aStar = new AStar(snake, food, width, height);
    const path = aStar.findPath();
    this.pathCache.set(key, path);
    return path;
  }
}
