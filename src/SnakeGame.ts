import { CanvasGameDrawer } from "./drawers/CanvasGameDrawer";
import { HeadlessGameDrawer } from "./drawers/HeadlessGameDrawer";
import Perlin from "./Perlin";
import { Agent, GameDrawer, GameState, Position } from "./types";
import seedrandom, { PRNG } from "seedrandom";

type SnakeGameConfig = {
  canvasId?: string;
  scoreElementId?: string;
  boardsize?: number;
  seed?: string;
};

// snake-game.ts
export class SnakeGame implements GameState {
  private readonly frameTime = 100;
  private canvas?: HTMLCanvasElement;
  private scoreElement?: HTMLElement;
  private ctx!: CanvasRenderingContext2D;
  private headlessMode: boolean = false;
  private gridSize = 20;
  private tileCount: number;
  public dx = 1;
  public dy = 0;
  private score = 0;
  private gameLoop!: number;
  public snake!: Position[];
  public food!: Position;
  public width: number;
  public height: number;
  private drawer: GameDrawer;
  private rng: PRNG;

  private perlin: Perlin;
  constructor({
    canvasId,
    scoreElementId,
    boardsize = 20 * 15,
    seed = "42",
  }: SnakeGameConfig = {}) {
    this.rng = seedrandom(seed);
    this.perlin = new Perlin(seed);

    if (!canvasId || !scoreElementId) {
      this.headlessMode = true;
      this.tileCount = boardsize / this.gridSize;
      this.drawer = new HeadlessGameDrawer();
    } else {
      this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
      this.canvas.width = boardsize;
      this.canvas.height = boardsize;
      this.scoreElement = document.getElementById(scoreElementId)!;
      this.ctx = this.canvas.getContext("2d")!;
      this.tileCount = this.canvas.width / this.gridSize;
      this.drawer = new CanvasGameDrawer(
        this.ctx,
        this.gridSize,
        this.tileCount,
        this.perlin
      );
    }

    this.width = this.tileCount;
    this.height = this.tileCount;

    this.initializeGame();
    this.setupEventListeners();
  }

  private initializeGame() {
    this.snake = [];
    // get center of the board
    const center = Math.floor(this.tileCount / 2);
    for (let i = 0; i < 3; i++) {
      this.snake.push({ x: center - i, y: center });
    }

    this.food = this.generateFood();
    this.score = 0;
    this.dx = 1;
    this.dy = 0;
    if (this.scoreElement)
      this.scoreElement.textContent = `Score: ${this.score}`;
  }

  private setupEventListeners() {
    if (this.headlessMode) return;
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
          if (this.dy !== 1) {
            this.dx = 0;
            this.dy = -1;
          }
          break;
        case "ArrowDown":
        case "s":
          if (this.dy !== -1) {
            this.dx = 0;
            this.dy = 1;
          }
          break;
        case "ArrowLeft":
        case "a":
          if (this.dx !== 1) {
            this.dx = -1;
            this.dy = 0;
          }
          break;
        case "ArrowRight":
        case "d":
          if (this.dx !== -1) {
            this.dx = 1;
            this.dy = 0;
          }
          break;
      }
    });
  }

  private moveSnake() {
    const head = {
      x: this.snake[0].x + this.dx,
      y: this.snake[0].y + this.dy,
    };

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.food = this.generateFood();
      if (!this.headlessMode)
        this.scoreElement!.textContent = `Score: ${this.score}`;
    } else {
      this.snake.pop();
    }
  }

  private generateFood(): Position {
    const x = Math.floor(this.rng() * this.tileCount);
    const y = Math.floor(this.rng() * this.tileCount);
    const pos = { x, y };
    if (this.snake.some((segment) => segment.x === x && segment.y === y)) {
      // Check if food is generated on the snake
      return this.generateFood();
    }
    return pos;
  }

  private checkCollision() {
    const head = this.snake[0];

    // Wall collision
    if (
      head.x < 0 ||
      head.x >= this.tileCount ||
      head.y < 0 ||
      head.y >= this.tileCount
    ) {
      this.endGame();
      return;
    }

    // Self collision
    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        this.endGame();
        this.drawer.drawGame(this);
        return;
      }
    }
  }

  private updateGame(): void {
    this.drawer.drawGame(this);
    this.moveSnake();
    this.checkCollision();
  }

  public async startGame() {
    // Clear any existing game loop
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    // Start new game loop
    this.gameLoop = window.setInterval(() => {
      this.updateGame();
    }, this.frameTime) as unknown as number;
  }

  public endGame() {
    clearInterval(this.gameLoop);
  }

  public resetGame() {
    this.initializeGame();
    //this.startGame();
  }

  public startAIGame(agent: Agent) {
    // Clear any existing game loop
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    this.gameLoop = window.setInterval(() => {
      const nextMove = agent.getNextMove(this);
      this.dx = nextMove.x - this.snake[0].x;
      this.dy = nextMove.y - this.snake[0].y;
      this.updateGame();
    }, this.frameTime) as unknown as number;
  }

  public stop() {
    clearInterval(this.gameLoop);
    this.initializeGame();
  }

  // Implement GameState interface

  public getValidNextPositions(): Position[] {
    const head = this.snake[0];
    const possibleMoves = [
      { x: head.x + 1, y: head.y }, // Right
      { x: head.x - 1, y: head.y }, // Left
      { x: head.x, y: head.y + 1 }, // Down
      { x: head.x, y: head.y - 1 }, // Up
    ];

    return possibleMoves.filter(
      (move) => this.isValidMove(move) && !this.isSnakeCollision(move)
    );
  }

  public getNextGameState(nextMove: Position): GameState {
    const newGame = new SnakeGame();
    newGame.snake = JSON.parse(JSON.stringify(this.snake));
    newGame.food = { ...this.food };
    newGame.dx = nextMove.x - this.snake[0].x;
    newGame.dy = nextMove.y - this.snake[0].y;
    newGame.score = this.score;
    newGame.width = this.width;
    newGame.height = this.height;

    newGame.moveSnake();

    return newGame;
  }

  public getScore(): number {
    return this.score;
  }

  public isGameOver(): boolean {
    const head = this.snake[0];
    if (
      head.x < 0 ||
      head.x >= this.tileCount ||
      head.y < 0 ||
      head.y >= this.tileCount
    ) {
      return true;
    }

    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        return true;
      }
    }

    return false;
  }

  private isValidMove(move: Position): boolean {
    return (
      move.x >= 0 &&
      move.x < this.tileCount &&
      move.y >= 0 &&
      move.y < this.tileCount
    );
  }

  private isSnakeCollision(move: Position): boolean {
    return this.snake.some(
      (segment) => segment.x === move.x && segment.y === move.y
    );
  }
}
