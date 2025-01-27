import { Position } from "@/types";
import { Agent } from "@/agents/Agent.inteface";
import { GameState } from "@/game/GameState.inteface";

class AStar {
  private width: number;
  private height: number;
  private snake: Position[];
  private food: Position;
  constructor(
    snake: Position[],
    food: Position,
    width: number,
    height: number
  ) {
    this.snake = snake;
    this.food = food;
    this.width = width;
    this.height = height;
  }

  private heuristic(start: Position, end: Position): number {
    return Math.abs(start.x - end.x) + Math.abs(start.y - end.y); // Manhattan distance
  }

  private reconstructPath(
    cameFrom: Position[][],
    current: Position
  ): Position[] {
    const totalPath = [current];
    while (cameFrom[current.x][current.y] !== null) {
      current = cameFrom[current.x][current.y];
      totalPath.unshift(current);
    }
    return totalPath;
  }

  private getNeighbors(current: Position): Position[] {
    const neighbors: Position[] = [];
    if (current.x > 0) {
      neighbors.push({ x: current.x - 1, y: current.y });
    }
    if (current.x < this.width - 1) {
      neighbors.push({ x: current.x + 1, y: current.y });
    }
    if (current.y > 0) {
      neighbors.push({ x: current.x, y: current.y - 1 });
    }
    if (current.y < this.height - 1) {
      neighbors.push({ x: current.x, y: current.y + 1 });
    }
    return neighbors;
  }

  public findPath(): Position[] {
    const start = this.snake[0];
    const end = this.food;
    const openList = [start];
    const closedList: Position[] = [];
    const gScore = new Array(this.width)
      .fill(null)
      .map(() => new Array(this.height).fill(Infinity));
    const fScore = new Array(this.width)
      .fill(null)
      .map(() => new Array(this.height).fill(Infinity));
    const cameFrom = new Array(this.width)
      .fill(null)
      .map(() => new Array(this.height).fill(null));
    gScore[start.x][start.y] = 0;
    fScore[start.x][start.y] = this.heuristic(start, end);

    while (openList.length > 0) {
      let current = openList.reduce(
        (acc, val) => (fScore[val.x][val.y] < fScore[acc.x][acc.y] ? val : acc),
        openList[0]
      );

      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(cameFrom, current);
      }

      openList.splice(openList.indexOf(current), 1);
      closedList.push(current);

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (
          closedList.some((pos) => pos.x === neighbor.x && pos.y === neighbor.y)
        ) {
          continue;
        }

        const tentativeGScore = gScore[current.x][current.y] + 1;
        if (
          !openList.some((pos) => pos.x === neighbor.x && pos.y === neighbor.y)
        ) {
          openList.push(neighbor);
        } else if (tentativeGScore >= gScore[neighbor.x][neighbor.y]) {
          continue;
        }

        cameFrom[neighbor.x][neighbor.y] = current;
        gScore[neighbor.x][neighbor.y] = tentativeGScore;
        fScore[neighbor.x][neighbor.y] =
          gScore[neighbor.x][neighbor.y] + this.heuristic(neighbor, end);
      }
    }

    return [];
  }
}

export class MinMaxAgent implements Agent {
  private maxDepth: number;
  private recentMoves: Position[] = [];
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
            this.getDynamicDepth(gameState),
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

  private getDynamicDepth(gameState: GameState): number {
    // Increase depth as the snake grows
    return Math.min(this.maxDepth, Math.floor(gameState.getScore() / 5) + 3);
  }

  private evaluateState(gameState: GameState): number {
    const { snake, food } = gameState;
    const head = snake[0];

    // If the game is over, return the worst possible score
    if (gameState.isGameOver()) return Number.NEGATIVE_INFINITY;

    // Food distance (Manhattan distance)
    const foodDistance = this.calculateFoodDistance(head, food);

    // A* pathfinding to food
    const path = this.getCachedPath(
      snake,
      food,
      gameState.width,
      gameState.height
    );
    const pathDistance = path.length;

    // Directional bonus (encourage moving towards food)
    const directionalBonus = this.getDirectionalBonus(snake, food);

    // Available space (penalize moves that reduce available space)
    const availableSpace = this.calculateAvailableSpace(gameState);

    // Snake length (reward longer snakes)
    const snakeLength = snake.length;

    // Combine evaluation factors with dynamic weights
    const foodWeight = 200; // Strongly prioritize food
    const pathWeight = 10; // Penalize longer paths
    const spaceWeight = 1; // Minimal penalty for reduced space in early stages
    const lengthWeight = 5; // Reward longer snakes

    const factors = [
      gameState.getScore() * foodWeight, // Reward higher scores
      -(foodDistance * foodWeight), // Penalize distance to food
      directionalBonus * foodWeight, // Reward moving towards food
      -(pathDistance * pathWeight), // Penalize longer paths
      -((gameState.width * gameState.height - availableSpace) * spaceWeight), // Penalize reduced space
      snakeLength * lengthWeight, // Reward longer snakes
    ];

    return factors.reduce((acc, val) => acc + val, 0);
  }

  private calculateFoodDistance(head: Position, food: Position): number {
    return Math.abs(head.x - food.x) + Math.abs(head.y - food.y); // Manhattan distance
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

  private calculateAvailableSpace(gameState: GameState): number {
    const { snake, width, height } = gameState;
    const head = snake[0];

    // Create a grid to track visited cells
    const visited = new Array(width)
      .fill(null)
      .map(() => new Array(height).fill(false));

    // Mark the snake's body as visited
    for (const segment of snake) {
      visited[segment.x][segment.y] = true;
    }

    // Initialize a queue for BFS
    const queue: Position[] = [head];
    let availableSpace = 0;

    // Perform BFS
    while (queue.length > 0) {
      const current = queue.shift()!;

      // Skip if already visited
      if (visited[current.x][current.y]) continue;

      // Mark as visited
      visited[current.x][current.y] = true;
      availableSpace++;

      // Explore neighbors
      const neighbors = this.getNeighbors(current, width, height);
      for (const neighbor of neighbors) {
        if (!visited[neighbor.x][neighbor.y]) {
          queue.push(neighbor);
        }
      }
    }

    return availableSpace;
  }

  private getNeighbors(
    position: Position,
    width: number,
    height: number
  ): Position[] {
    const neighbors: Position[] = [];
    if (position.x > 0) neighbors.push({ x: position.x - 1, y: position.y });
    if (position.x < width - 1)
      neighbors.push({ x: position.x + 1, y: position.y });
    if (position.y > 0) neighbors.push({ x: position.x, y: position.y - 1 });
    if (position.y < height - 1)
      neighbors.push({ x: position.x, y: position.y + 1 });
    return neighbors;
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
