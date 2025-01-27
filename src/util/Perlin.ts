import seedrandom, { PRNG } from "seedrandom";
import { Position } from "@/types";

class Perlin {
  private rng: PRNG;
  private gradients: { [key: string]: Position } = {};
  private memory: { [key: string]: number } = {};

  constructor(seed: string = new Date().toISOString()) {
    this.rng = seedrandom(seed);
  }

  private generateRandomPosition(): Position {
    const theta = this.rng() * 2 * Math.PI;
    return { x: Math.cos(theta), y: Math.sin(theta) };
  }

  private dotProdGrid(x: number, y: number, vx: number, vy: number): number {
    const d_vect = { x: x - vx, y: y - vy };
    const key = `${vx},${vy}`;
    let g_vect = this.gradients[key];

    if (!g_vect) {
      g_vect = this.generateRandomPosition();
      this.gradients[key] = g_vect;
    }

    return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
  }

  private Interpolation(x: number): number {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  }

  private interp(x: number, a: number, b: number): number {
    return a + this.Interpolation(x) * (b - a);
  }

  public seed(): void {
    this.gradients = {};
    this.memory = {};
  }

  public get(x: number, y: number): number {
    const key = `${x},${y}`;
    if (this.memory.hasOwnProperty(key)) {
      return this.memory[key];
    }

    const xf = Math.floor(x);
    const yf = Math.floor(y);

    // Interpolate
    const tl = this.dotProdGrid(x, y, xf, yf);
    const tr = this.dotProdGrid(x, y, xf + 1, yf);
    const bl = this.dotProdGrid(x, y, xf, yf + 1);
    const br = this.dotProdGrid(x, y, xf + 1, yf + 1);
    const xt = this.interp(x - xf, tl, tr);
    const xb = this.interp(x - xf, bl, br);
    const v = this.interp(y - yf, xt, xb);

    this.memory[key] = v;
    return v;
  }
}

export default Perlin;
