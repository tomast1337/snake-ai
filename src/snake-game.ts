// snake-game.ts
export class SnakeGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridSize = 20;
  private tileCount: number;
  private snake!: { x: number; y: number }[];
  private food!: { x: number; y: number };
  private dx = 1;
  private dy = 0;
  private score = 0;
  private gameLoop!: number;
  private scoreElement: HTMLElement;
  private gameOverElement: HTMLElement;

  constructor(
    canvasId: string,
    scoreElementId: string,
    gameOverElementId: string
  ) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.tileCount = this.canvas.width / this.gridSize;
    this.scoreElement = document.getElementById(scoreElementId)!;
    this.gameOverElement = document.getElementById(gameOverElementId)!;

    this.initializeGame();
    this.setupEventListeners();
  }

  private initializeGame() {
    this.snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    this.food = this.generateFood();
    this.score = 0;
    this.dx = 1;
    this.dy = 0;
    this.scoreElement.textContent = `Score: ${this.score}`;
    this.gameOverElement.style.display = "none";
  }

  private setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowUp":
          if (this.dy !== 1) {
            this.dx = 0;
            this.dy = -1;
          }
          break;
        case "ArrowDown":
          if (this.dy !== -1) {
            this.dx = 0;
            this.dy = 1;
          }
          break;
        case "ArrowLeft":
          if (this.dx !== 1) {
            this.dx = -1;
            this.dy = 0;
          }
          break;
        case "ArrowRight":
          if (this.dx !== -1) {
            this.dx = 1;
            this.dy = 0;
          }
          break;
      }
    });
  }

  private clearCanvas() {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawSnake() {
    this.ctx.fillStyle = "green";
    this.snake.forEach((segment) => {
      this.ctx.fillRect(
        segment.x * this.gridSize,
        segment.y * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2
      );
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
      this.scoreElement.textContent = `Score: ${this.score}`;
      this.food = this.generateFood();
    } else {
      this.snake.pop();
    }
  }

  private drawFood() {
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(
      this.food.x * this.gridSize,
      this.food.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }

  private generateFood() {
    return {
      x: Math.floor(Math.random() * this.tileCount),
      y: Math.floor(Math.random() * this.tileCount),
    };
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
        return;
      }
    }
  }

  private drawGame() {
    this.clearCanvas();
    this.moveSnake();
    this.drawSnake();
    this.drawFood();
    this.checkCollision();
  }

  public startGame() {
    // Clear any existing game loop
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
    }

    // Start new game loop
    this.gameLoop = setInterval(
      () => this.drawGame(),
      100
    ) as unknown as number;
  }

  public endGame() {
    clearInterval(this.gameLoop);
    this.gameOverElement.style.display = "block";
  }

  public resetGame() {
    this.initializeGame();
    this.startGame();
  }
}
