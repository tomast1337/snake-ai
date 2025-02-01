import "@/markdown.css";
import "@/style.css";
import "highlight.js/styles/base16/classic-light.css";
import { AStarPathfinderAgent } from "./agents/AStarPathfinderAgent";
import { displayMarkdownContent } from "./RenderText";
import { displayGameComponents } from "./RenderGame";
import { RLAgent } from "./agents/RLAgent";
import { GameState } from "./game/GameState.inteface";
import { SnakeGame } from "./game/SnakeGame";
// Update the HTML to include Snake game elements
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<header>
    <h1 style="font-family: 'Permanent Marker', cursive; color: #8c1aff;">AI Snake Game</h1>
</header>

<main>
    <section id="game"></section>
    <section id="article" class="markdown"></section>
</main>

<footer>
  <p style="font-family: 'Permanent Marker', cursive; color: #8c1aff;">Created by <a href="https://www.linkedin.com/in/nicolas-vycas/" style="color: #4CAF50;">Nicolas Vycas Nery</a></p>
</footer>
`;

displayMarkdownContent();
/*
const calculateReward = (
  currentState: GameState,
  nextState: GameState
): number => {
  if (nextState.isGameOver()) {
    return -100; // Penalty for losing the game
  }

  const currentHead = currentState.snake[0];
  const nextHead = nextState.snake[0];
  const food = currentState.food;

  // Reward for moving closer to the food
  const currentDistance =
    Math.abs(currentHead.x - food.x) + Math.abs(currentHead.y - food.y);
  const nextDistance =
    Math.abs(nextHead.x - food.x) + Math.abs(nextHead.y - food.y);

  if (nextDistance < currentDistance) {
    return 10; // Reward for moving closer to the food
  } else if (nextDistance > currentDistance) {
    return -10; // Penalty for moving away from the food
  }

  return 0; // No reward for neutral moves
};

const agent = new RLAgent();

const episodeCount = 1000;
console.log(`Training the agent for ${episodeCount} episodes...`);
for (let episode = 0; episode < episodeCount; episode++) {
  let isGameOver = false;
  const gameState = new SnakeGame({
    boardsize: 20 * 20,
    seed: new Date().getTime().toString(),
  });
  console.log(`Episode ${episode + 1}`);
  while (!isGameOver) {
    const action = agent.getNextMove(gameState); // Get the next move
    const nextGameState = gameState.applyAction(action); // Get the next game state
    const reward = calculateReward(gameState, nextGameState); // Calculate the reward

    agent.updateQTable(gameState, action, reward, nextGameState); // Update the Q-table

    isGameOver = gameState.isGameOver();
  }
}

agent.saveModel();
*/
displayGameComponents(new AStarPathfinderAgent(), "A* Pathfinder");
//displayGameComponents(new RLAgent(), "Reinforcement Learning");
