import { SnakeGame } from "@/game/SnakeGame";
import { Agent } from "./agents/Agent.inteface";

export const displayGameComponents = (agentClass: Agent, name: string) => {
  const nomalizedName = name.replace(/\s/g, "-").toLowerCase();
  const uuid = `-${Math.random().toString(36).substring(2, 15)}`;
  const startButtonName = `start-button-${nomalizedName + uuid}`;
  const scoreElementName = `score-${nomalizedName + uuid}`;
  const canvasId = `game-board-${nomalizedName + uuid}`;

  const render = `
<div class="flex">
    <div>
        <h2 style="color: #f44336;">${name}</h2>
        <button id="${startButtonName}" class="start-button">Start Game</button>
        <div class="score" id="${scoreElementName}">Score: 0</div>
        <canvas class="game-board" id="${canvasId}" style="width: 600px; height: 600px;"/>
    </div>
</div>
`;

  // finde the games section
  const gameSection = document.querySelector("#game")! as HTMLDivElement;
  gameSection.innerHTML += render;

  // create the game
  const game = new SnakeGame({
    canvasId: canvasId,
    scoreElementId: scoreElementName,
    seed: "42",
    boardsize: 20 * 20,
  });

  const startButton = document.getElementById(
    startButtonName
  )! as HTMLButtonElement;

  if (!startButton) {
    throw new Error("Start button not found");
  }

  const startGame = () => {
    startButton.textContent = "Game in progress, click to stop";
    startButton.style.cursor = "not-allowed";
    startButton.style.backgroundColor = "red";

    game.startAIGame(agentClass);
  };
  const stopGame = () => {
    startButton.textContent = "Start Game";
    startButton.style.cursor = "pointer";
    startButton.style.backgroundColor = "green";

    game.stop();
  };

  startButton.addEventListener("click", () => {
    if (startButton.textContent === "Start Game") {
      startGame();
    } else {
      stopGame();
    }
  });
};
