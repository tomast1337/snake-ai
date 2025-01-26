import Perlin from "./Perlin";
import { SnakeGame } from "./SnakeGame";
import { GameDrawer, Position } from "./types";

export class CanvasGameDrawer implements GameDrawer {
  private ctx: CanvasRenderingContext2D;
  private gridSize: number;
  private tileCount: number;
  private perlin: Perlin;

  constructor(
    ctx: CanvasRenderingContext2D,
    gridSize: number,
    tileCount: number,
    perlin: Perlin
  ) {
    this.ctx = ctx;
    this.gridSize = gridSize;
    this.tileCount = tileCount;
    this.perlin = perlin;
    this.renderTextureBackground();
  }

  public clear(): void {
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(
      0,
      0,
      this.tileCount * this.gridSize,
      this.tileCount * this.gridSize
    );
    this.renderTextureBackground();
  }

  public drawGame(state: SnakeGame): void {
    this.clear();
    this.drawSnake(state.snake);
    this.drawFood(state.food);
  }

  private drawSnake(snake: Position[]): void {
    const len = snake.length;
    snake.forEach((segment, i) => {
      if (i === 0) {
        this.ctx.fillStyle = "black";
      } else {
        const color = 255 - (255 / len) * i;
        this.ctx.fillStyle = `hsl(${color}, 100%, 50%)`;
      }
      this.ctx.fillRect(
        segment.x * this.gridSize,
        segment.y * this.gridSize,
        this.gridSize,
        this.gridSize
      );
    });
  }

  private drawFood(food: Position): void {
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(
      food.x * this.gridSize,
      food.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );
  }

  private renderTextureBackground(): void {
    const scale = 1;
    for (let x = 0; x < this.tileCount * scale; x++) {
      for (let y = 0; y < this.tileCount * scale; y++) {
        const noise = this.perlin.get(x / 2.5, y / 2.5);
        const min = 200;
        const max = 255;
        const color = Math.floor(min + noise * (max - min));
        this.ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
        this.ctx.fillRect(
          x * (this.gridSize / scale),
          y * (this.gridSize / scale),
          this.gridSize / scale,
          this.gridSize / scale
        );
      }
    }
  }
}
