import "@/style.css";
import "@/markdown.css";
import { SnakeGame } from "@/game/SnakeGame";
import { MinMaxAgent } from "@/agents/MinMaxAgent";
import { marked } from "marked";

// Update the HTML to include Snake game elements
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<header>
    <h1 style="font-family: 'Permanent Marker', cursive; color: #8c1aff;">Min Max Snake Game</h1>
</header>
<main>
<section id="game">
  <button class="start-button" id="start-btn">Start Game</button>
  <div class="flex">
    <div>
      <h2 style="color: #4CAF50;">Player Snake</h2>
      <div class="score" id="score">Score: 0</div>
      <canvas class="game-board" id="game-board" style="width: 400px; height: 400px;"></canvas>
    </div>
    <div>
      <h2 style="color: #f44336;">AI Snake</h2>
      <div class="score" id="score-ia">Score: 0</div>
      <canvas class="game-board" id="game-board-ai" style="width: 400px; height: 400px;"></canvas>
    </div>
  </div>
  </section>
  <section id="article" class="markdown">
  </section>
</main>
<footer>
  <p style="font-family: 'Permanent Marker', cursive; color: #8c1aff;">Created by <a href="https://www.linkedin.com/in/nicolas-vycas/" style="color: #4CAF50;">Nicolas Vycas Nery</a></p>
</footer>
`;

const explanation = document.getElementById("article")! as HTMLDivElement;
fetch("/README.md")
  .then((response) => response.text())
  .then((text) => {
    explanation.innerHTML = marked(text, {
      gfm: true,
      breaks: true,
      async: false,
    });
  })
  .catch((error) => {
    console.error("Error fetching README.md", error);
  });

const now = new Date().toISOString();

const gamePlayer = new SnakeGame({
  canvasId: "game-board",
  scoreElementId: "score",
  seed: now,
  boardsize: 20 * 25,
});
const gameIA = new SnakeGame({
  canvasId: "game-board-ai",
  scoreElementId: "score-ia",
  seed: now,
  boardsize: 20 * 25,
});

const startButton = document.getElementById("start-btn")! as HTMLButtonElement;

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
