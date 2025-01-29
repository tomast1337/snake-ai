import { Position } from "@/types";

export class AStar {
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
    const euclidian = Math.sqrt(
      Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2)
    );
    const manhattan = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);

    // if more than 1/4 of the board away, use manhattan distance else use euclidian distance
    const factor = 1 + (this.snake.length / this.width) * 3;

    if (manhattan > this.width / factor) {
      return manhattan;
    } else {
      return euclidian;
    }
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
    const snakeBodySet = new Set(this.snake.map((pos) => `${pos.x},${pos.y}`));

    const possibleMoves = [
      { x: current.x - 1, y: current.y },
      { x: current.x + 1, y: current.y },
      { x: current.x, y: current.y - 1 },
      { x: current.x, y: current.y + 1 },
    ];

    for (const move of possibleMoves) {
      if (
        move.x >= 0 &&
        move.x < this.width &&
        move.y >= 0 &&
        move.y < this.height &&
        !snakeBodySet.has(`${move.x},${move.y}`)
      ) {
        neighbors.push(move);
      }
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
