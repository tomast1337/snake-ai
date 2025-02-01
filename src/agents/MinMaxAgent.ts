import { Position } from "@/types";
import { Agent } from "@/agents/Agent.inteface";
import { GameState } from "@/game/GameState.inteface";
import { AStar } from "./AStar";

export class MinMaxAgent implements Agent {
  private maxDepth: number;
  private pathCache: Map<string, Position[]> = new Map();

  width: number = 0;
  height: number = 0;

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
    this.width = gameState.width;
    this.height = gameState.height;
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

    // Use Minimax to evaluate all valid moves
    const moveScores = validMoves
      .map((move) => {
        const nextState = gameState.getNextGameState(move);
        return {
          move,
          score: this.minimax(
            nextState,
            this.getDynamicDepth(gameState),
            false, // Minimize for the opponent
            Number.NEGATIVE_INFINITY,
            Number.POSITIVE_INFINITY
          ),
        };
      })
      .sort((a, b) => b.score - a.score); // Sort moves by score (highest first)

    // Choose the best move that is safe
    for (const moveScore of moveScores) {
      if (this.isMoveSafe(gameState, moveScore.move)) {
        return moveScore.move;
      }
    }

    // If no safe move is found, return the best move (even if risky)
    return moveScores[0].move;
  }

  private getDynamicDepth(gameState: GameState): number {
    // Increase depth as the snake grows
    return Math.min(this.maxDepth, Math.floor(gameState.getScore() / 5) + 3);
  }

  private evaluateState(gameState: GameState): number {
    const { snake, food, width } = gameState;
    const snakeLength = snake.length;

    // If the game is over, return the worst possible score
    if (gameState.isGameOver()) return Number.NEGATIVE_INFINITY;

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

    // U shape penalty
    const hasU = this.doesHaveU(snake);
    const uShapePenalty = hasU ? -100 : 0;

    // Self-collision penalty
    const selfCollisionPenalty = this.calculateSelfCollisionRisk(snake);

    // Snake max side length
    const snakeMaxSideLength = this.getSnakeMaxSideLength(gameState);

    // Penalize if the snake is too long
    const snakeTooLongSidePenalty = snakeMaxSideLength >= width - 3 ? 100 : 0;

    // Penalize if the space is split
    const spaceSplitPenalty = this.SplitsSpace(gameState) ? -width * width : 0;

    // Combine evaluation factors
    const foodWeight = 100; // Prioritize food
    const pathWeight = 10; // Penalize longer paths
    const collisionWeight = 50; // Penalize self-collision risks
    const spaceWeight = 20; // Penalize space splits

    return (
      gameState.getScore() * foodWeight - // Reward higher scores
      pathDistance * foodWeight + // Penalize distance to food
      foodBonus + // Large bonus for eating food
      pathDistance * pathWeight - // Penalize longer paths
      selfCollisionPenalty * collisionWeight - // Penalize self-collision risks
      snakeTooLongSidePenalty + // Penalize excessive length
      uShapePenalty + // Penalize U-shaped bends
      spaceSplitPenalty * spaceWeight // Penalize space splits
    );
  }

  private calculateSafeSpace(gameState: GameState): number {
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

  private bfs(start: Position, end: Position): Position[] {
    const { width, height } = this; // Assuming width and height are available in the class
    const queue: { position: Position; path: Position[] }[] = [
      { position: start, path: [] },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { position, path } = queue.shift()!;
      const key = `${position.x},${position.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      const newPath = [...path, position];

      if (position.x === end.x && position.y === end.y) {
        return newPath;
      }

      const neighbors = this.getNeighbors(position, width, height);
      for (const neighbor of neighbors) {
        queue.push({ position: neighbor, path: newPath });
      }
    }

    return []; // No path found
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

  private isMoveSafe(gameState: GameState, move: Position): boolean {
    const nextState = gameState.getNextGameState(move);
    const safeSpace = this.calculateSafeSpace(nextState);
    return safeSpace >= gameState.snake.length; // Ensure enough space to maneuver
  }

  private doesHaveU(snake: Position[]): boolean {
    // Check if the snake head and 4th segment are in a U shape
    if (snake.length < 4) return false;
    if (snake[0].x === snake[3].x && snake[0].y === snake[3].y) return true;
    return false;
  }

  private getSnakeMaxSideLength(gameState: GameState): number {
    const { snake } = gameState;

    // Find the max side length of the snake
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

  private calculateSelfCollisionRisk(snake: Position[]): number {
    const head = snake[0];
    let risk = 0;

    // Check how close the head is to the body
    for (let i = 1; i < snake.length; i++) {
      const distance =
        Math.abs(head.x - snake[i].x) + Math.abs(head.y - snake[i].y);
      if (distance <= 2) {
        risk += 5 / distance; // Increase risk for closer body segments
      }
    }

    return risk;
  }

  private SplitsSpace(gameState: GameState): boolean {
    // BFS Flood Fill Algorithm to find if the space is split from the point of the head
    const head: Position = gameState.snake[0];
    const snake: Position[] = [...gameState.snake].slice(1); // Remove the head
    const { width, height } = gameState;

    const totalTiles = width * height;
    const visited = new Set<string>();
    const queue: { position: Position; depth: number }[] = [
      { position: head, depth: 0 },
    ];
    let visitedCount = 0;
    const maxDepth = snake.length / 5 + 1;

    const getNeighbors = (current: Position): Position[] => {
      const neighbors: Position[] = [];
      const possibleMoves = [
        { x: current.x - 1, y: current.y },
        { x: current.x + 1, y: current.y },
        { x: current.x, y: current.y - 1 },
        { x: current.x, y: current.y + 1 },
      ];
      for (const move of possibleMoves) {
        if (
          move.x >= 0 &&
          move.x < width &&
          move.y >= 0 &&
          move.y < height &&
          !snake.some((segment) => segment.x === move.x && segment.y === move.y)
        ) {
          neighbors.push(move);
        }
      }
      return neighbors;
    };

    while (queue.length > 0) {
      const { position: current, depth } = queue.shift()!;
      if (depth > maxDepth) continue; // Skip if the current depth exceeds the maximum depth
      const key = `${current.x},${current.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      visitedCount++;
      const neighbors = getNeighbors(current);
      for (const neighbor of neighbors) {
        queue.push({ position: neighbor, depth: depth + 1 });
      }
    }

    const spaceRatio = visitedCount / totalTiles;

    return spaceRatio < 0.5;
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
