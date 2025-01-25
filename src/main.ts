import "./style.css";
import { SnakeGame } from "./snake-game";

// Update the HTML to include Snake game elements
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>Snake Game</h1>
    <div id="score">Score: 0</div>
    <canvas id="game-board" width="400" height="400" style="border: 2px solid black;"></canvas>
    <div id="game-over" style="display: none; text-align: center; margin-top: 10px;">
      <h2>Game Over!</h2>
      <button id="restart-btn">Restart</button>
    </div>
  </div>
`;

// Initialize and start the game
const game = new SnakeGame("game-board", "score", "game-over");
game.startGame();

// Add restart button functionality
document.getElementById("restart-btn")!.addEventListener("click", () => {
  game.resetGame();
});
