// ----- Difficulty settings -----
// Each mode tunes the goal, pace, and risk of the game
const difficulties = {
  easy:   { time: 40, winScore: 15, spawnRate: 1200, badDropChance: 0.15 },
  normal: { time: 30, winScore: 20, spawnRate: 1000, badDropChance: 0.20 },
  hard:   { time: 20, winScore: 25, spawnRate: 800,  badDropChance: 0.30 }
};
let currentDifficulty = "normal"; // default mode

// ----- Game state -----
let gameRunning = false;   // Whether the game is currently active
let dropMaker;             // Interval that spawns new drops
let timerInterval;         // Interval that ticks the countdown
let score = 0;             // Current score
let timeLeft = 30;         // Seconds remaining

// Cache elements we touch often
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const goalEl = document.getElementById("goal");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const gameContainer = document.getElementById("game-container");
const difficultyBtns = document.querySelectorAll(".difficulty-btn");

// Messages shown when the game ends
const winMessages = [
  "Amazing! You're a true water hero!",
  "Incredible work — that's clean water for a family!",
  "Fantastic! You caught enough to change a life!",
  "You did it! Every drop you caught matters."
];

const loseMessages = [
  "So close! Give it another go.",
  "Every drop counts — try again!",
  "Almost there — one more round?",
  "Keep going, clean water needs you!"
];

// Wait for button click to start the game
startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

// Handle difficulty selection
difficultyBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (gameRunning) return; // don't allow switching mid-round

    currentDifficulty = btn.dataset.level;

    difficultyBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    updateGoalAndTimeDisplay();
  });
});

function updateGoalAndTimeDisplay() {
  const settings = difficulties[currentDifficulty];
  goalEl.textContent = settings.winScore;
  timeEl.textContent = settings.time;
}

// Set initial display to match the default difficulty
updateGoalAndTimeDisplay();

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  const settings = difficulties[currentDifficulty];

  gameRunning = true;
  score = 0;
  timeLeft = settings.time;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  goalEl.textContent = settings.winScore;

  startBtn.disabled = true;
  startBtn.textContent = "Game in Progress...";
  setDifficultyButtonsDisabled(true);

  clearDrops();
  removeEndMessage();

  // Create new drops at a pace set by the current difficulty
  dropMaker = setInterval(createDrop, settings.spawnRate);

  // Tick the countdown timer every second
  timerInterval = setInterval(updateTimer, 1000);
}

function setDifficultyButtonsDisabled(disabled) {
  difficultyBtns.forEach((btn) => {
    btn.disabled = disabled;
  });
}

function updateTimer() {
  timeLeft--;
  timeEl.textContent = timeLeft;

  if (timeLeft <= 0) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  clearDrops();

  startBtn.disabled = false;
  startBtn.textContent = "Start Game";
  resetBtn.disabled = false;
  setDifficultyButtonsDisabled(false);

  showEndMessage();
}

function resetGame() {
  if (gameRunning) {
    clearInterval(dropMaker);
    clearInterval(timerInterval);
  }

  gameRunning = false;
  clearDrops();
  removeEndMessage();

  const settings = difficulties[currentDifficulty];
  score = 0;
  timeLeft = settings.time;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  goalEl.textContent = settings.winScore;

  startBtn.disabled = false;
  startBtn.textContent = "Start Game";
  resetBtn.disabled = false;
  setDifficultyButtonsDisabled(false);

  startGame();
}

function clearDrops() {
  document.querySelectorAll(".water-drop").forEach((drop) => drop.remove());
}

function showEndMessage() {
  const winScore = difficulties[currentDifficulty].winScore;
  const won = score >= winScore;
  const messages = won ? winMessages : loseMessages;
  const message = messages[Math.floor(Math.random() * messages.length)];

  const overlay = document.createElement("div");
  overlay.className = "end-message" + (won ? " win" : " lose");
  overlay.innerHTML = `
    <div class="end-message-card">
      <h2>${won ? "You Win!" : "Try Again"}</h2>
      <p>${message}</p>
      <p class="final-score">Final Score: ${score}</p>
    </div>
  `;
  gameContainer.appendChild(overlay);
}

function removeEndMessage() {
  const existing = gameContainer.querySelector(".end-message");
  if (existing) existing.remove();
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");

  // Chance of a "bad" drop depends on the current difficulty
  const isBad = Math.random() < difficulties[currentDifficulty].badDropChance;
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Handle scoring when a drop is clicked
  drop.addEventListener("click", () => {
    if (!gameRunning) return;

    if (isBad) {
      score = Math.max(0, score - 1);
    } else {
      score++;
    }
    scoreEl.textContent = score;
    drop.remove();
  });

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}