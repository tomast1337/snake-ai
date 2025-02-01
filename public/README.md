# Exploring AI-Powered Snake Game in TypeScript

---

## **Project Overview**

The goal of this project is to create a Snake game where the snake can be controlled either by a human player or an AI agent. The AI agent uses the **MinMax algorithm** with **alpha-beta pruning** to make decisions, simulating future game states to choose the best possible move. The game is built using TypeScript, ensuring type safety and modularity.

---

## **Project Architecture**

The project is designed with a modular architecture, separating the game logic, rendering, and AI decision-making. Here’s a breakdown of the core components:

### **1. Game State Interface**

The foundation of the game is the `GameState` interface, which defines the contract for the game state. This interface provides all the necessary information for both rendering the game and making AI decisions.

```typescript
export interface GameState {
  // Direction of the snake
  dx: number;
  dy: number;
  // Grid size
  width: number;
  height: number;
  // Snake position
  snake: Position[];
  // Food position
  food: Position;
  // Game state methods, mostly used by the AI agent
  getValidNextPositions: () => Position[];
  getNextGameState: (nextMove: Position) => GameState;
  getScore: () => number;
  isGameOver: () => boolean;
}
```

This interface ensures that the game logic is decoupled from the rendering logic, making it easier to test and extend.

---

### **2. Position and GameDrawer Interfaces**

The `Position` interface defines a point in a 2D Cartesian plane, while the `GameDrawer` interface abstracts the rendering logic. This separation allows us to implement different renderers, such as a canvas-based renderer for the browser or a console-based renderer for debugging.

```typescript
export interface Position {
  x: number;
  y: number;
}

export interface GameDrawer {
  drawGame(state: SnakeGame): void;
  clear(): void;
}
```

---

### **3. Core Game Implementation**

The `SnakeGame` class implements the game logic, including:

- **Canvas-based rendering**: The game can be rendered in a browser using HTML5 Canvas.
- **Keyboard controls**: Players can control the snake using arrow keys or WASD.
- **Collision detection**: The game detects collisions with walls and the snake’s own body.
- **Score tracking**: The score increases as the snake eats food.
- **Support for AI players**: The game can be played by an AI agent that implements the `Agent` interface.

---

### **4. AI Agent Implementation**

The AI player uses the **MinMax algorithm** with **alpha-beta pruning** to evaluate future game states and choose the best move. The agent considers several factors when evaluating a move:

- **Distance to food**: The closer the snake is to the food, the higher the score.
- **Self-collision risk**: Moves that bring the snake closer to its own body are penalized.
- **Wall proximity**: Moves that bring the snake closer to the walls are penalized.
- **Future game states**: The agent simulates future moves to anticipate the consequences of its actions.

All AI agents implement the `Agent` interface, which defines a single method: `getNextMove`.

```typescript
interface Agent {
  getNextMove: (gameState: GameState) => Position;
}
```

---

### **5. Example: Random Agent**

To demonstrate the flexibility of the architecture, we can implement a simple `RandomAgent` that chooses a random valid move. This agent is useful for testing and benchmarking.

```typescript
export class RandomAgent implements Agent {
  getNextMove(gameState: GameState): Position {
    const validMoves = gameState.getValidNextPositions();
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
}
```

---
