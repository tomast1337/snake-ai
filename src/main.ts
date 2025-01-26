import "./style.css";
import { SnakeGame } from "./snake-game";
import { MinMaxAgent } from "./min-max-agent";

// Update the HTML to include Snake game elements
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<main>
  <h1>Min Max Snake Game</h1>
  <button class="start-button" id="start-btn">Start Game</button>
  <div class="flex">
    <div>
      <h2>Player Snake</h2>
      <div class="score" id="score">Score: 0</div>
      <canvas class="game-board" id="game-board" width="400" height="400" style="border: 2px solid black;"></canvas>
    </div>
    <div>
      <h2>AI Snake</h2>
      <div class="score" id="score-ia">Score: 0</div>
      <canvas class="game-board" id="game-board-ai" width="400" height="400" style="border: 2px solid black;"></canvas>
    </div>
  </div>
</main>
<footer>
    <p>Created by <a href="https://www.linkedin.com/in/nicolas-vycas/">Nicolas Vycas Nery</a></p>
</footer>
`;

const gamePlayer = new SnakeGame("game-board", "score");
const gameIA = new SnakeGame("game-board-ai", "score-ia");

const startButton = document.getElementById("start-btn")! as HTMLButtonElement;
const resetButton = document.getElementById(
  "restart-btn"
)! as HTMLButtonElement;

const resetGame = () => {
  gamePlayer.resetGame();
  gameIA.resetGame();
};
const startGame = () => {
  startButton.textContent = "Game in progress, click to stop";
  startButton.style.cursor = "not-allowed";
  startButton.style.backgroundColor = "red";

  gamePlayer.startGame();
  gameIA.startAIGame(new MinMaxAgent());
};
const stopGame = () => {
  startButton.textContent = "Start Game";
  startButton.style.cursor = "pointer";
  startButton.style.backgroundColor = "green";

  gamePlayer.stop();
  gameIA.stop();
};

startButton.addEventListener("click", () => {
  if (startButton.textContent === "Start Game") {
    startGame();
  } else {
    stopGame();
  }
});

resetButton.addEventListener("click", () => {
  resetGame();
  stopGame();
});
