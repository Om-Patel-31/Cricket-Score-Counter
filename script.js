// Elements
const flipCoinBtn = document.getElementById("flipCoinBtn");
const coinElem = document.getElementById("coin");
const coinResultElem = document.getElementById("coinResult");

const inputSection = document.getElementById("inputSection");
const scoreSection = document.getElementById("scoreSection");

const batsman1NameInput = document.getElementById("batsman1Name");
const batsman2NameInput = document.getElementById("batsman2Name");
const bowlerNameInput = document.getElementById("bowlerName");

const batsman1Display = document.getElementById("batsman1Display");
const batsman2Display = document.getElementById("batsman2Display");
const bowlerDisplay = document.getElementById("bowlerDisplay");

const batsman1RunsElem = document.getElementById("batsman1Runs");
const batsman1BallsElem = document.getElementById("batsman1Balls");
const batsman2RunsElem = document.getElementById("batsman2Runs");
const batsman2BallsElem = document.getElementById("batsman2Balls");

const bowlerRunsElem = document.getElementById("bowlerRuns");
const bowlerWicketsElem = document.getElementById("bowlerWickets");

const scoreDisplay = document.getElementById("scoreDisplay");
const oversDisplay = document.getElementById("oversDisplay");

const historyBody = document.getElementById("historyBody");

const startMatchBtn = document.getElementById("startMatchBtn");
const resetBtn = document.getElementById("resetBtn");

// Match state
let batsman1 = "";
let batsman2 = "";
let bowler = "";

let batsman1Runs = 0;
let batsman1Balls = 0;

let batsman2Runs = 0;
let batsman2Balls = 0;

let bowlerRuns = 0;
let bowlerWickets = 0;

let totalRuns = 0;
let totalWickets = 0;

let ballsInCurrentOver = 0; // 0 to 5 (0 = ball 1)
let completedOvers = 0;

let history = [];

// Coin flip logic
flipCoinBtn.addEventListener("click", () => {
  coinResultElem.textContent = "";
  coinElem.style.transform = "rotateY(0deg)";
  coinElem.classList.remove("flip-animation");

  // Trigger reflow for animation restart
  void coinElem.offsetWidth;

  // Start flip animation
  coinElem.classList.add("flip-animation");
  flipCoinBtn.disabled = true;

  setTimeout(() => {
    coinElem.classList.remove("flip-animation");

    const result = Math.random() < 0.5 ? "Heads" : "Tails";

    // Show correct side after flip
    if (result === "Heads") {
      coinElem.style.transform = "rotateY(0deg)";
    } else {
      coinElem.style.transform = "rotateY(180deg)";
    }

    coinResultElem.textContent = `Result: ${result}`;
    inputSection.classList.remove("hidden");
  }, 2000);
});

// Start match button
startMatchBtn.addEventListener("click", () => {
  const b1 = batsman1NameInput.value.trim();
  const b2 = batsman2NameInput.value.trim();
  const bw = bowlerNameInput.value.trim();

  if (!b1) {
    alert("Please enter the name of Batsman 1 (Striker).");
    return;
  }
  if (!bw) {
    alert("Please enter the Bowler's name.");
    return;
  }

  batsman1 = b1;
  batsman2 = b2 || null;
  bowler = bw;

  resetMatchData();
  updateUI();

  inputSection.classList.add("hidden");
  scoreSection.classList.remove("hidden");
});

// Reset match data and UI
function resetMatchData() {
  batsman1Runs = 0;
  batsman1Balls = 0;
  batsman2Runs = 0;
  batsman2Balls = 0;
  bowlerRuns = 0;
  bowlerWickets = 0;
  totalRuns = 0;
  totalWickets = 0;
  ballsInCurrentOver = 0;
  completedOvers = 0;
  history = [];

  batsman2Display.textContent = batsman2 || "-";

  // Clear inputs but keep names in UI
  batsman1Display.textContent = batsman1;
  bowlerDisplay.textContent = bowler;

  historyBody.innerHTML = "";
}

// Add runs
function addRuns(runs) {
  if (!scoreSection.classList.contains("hidden")) {
    // Increase total runs
    totalRuns += runs;

    // Add to batsman1 stats
    batsman1Runs += runs;
    batsman1Balls++;

    // Add to bowler runs (extras do not count as bowler runs)
    bowlerRuns += runs;

    // Increase ball count (legal delivery)
    incrementBall();

    // Add event to history
    addHistoryEvent(`${runs} run${runs !== 1 ? "s" : ""}`);

    // Swap strike on odd runs if second batsman exists
    if (runs % 2 === 1 && batsman2) {
      swapStrike();
    }

    updateUI();
  }
}

// Add extras (wide or no-ball)
function addExtra(type) {
  if (!scoreSection.classList.contains("hidden")) {
    totalRuns += 1; // Extra run

    // Extras do NOT count as ball delivered or batsman balls
    // Extras add to bowler runs (since wide or no-ball)
    bowlerRuns += 1;

    addHistoryEvent(type.charAt(0).toUpperCase() + type.slice(1));

    updateUI();
  }
}

// Add wicket
function addWicket() {
  if (!scoreSection.classList.contains("hidden")) {
    totalWickets++;
    bowlerWickets++;

    // Legal ball delivered
    incrementBall();

    addHistoryEvent("Wicket");

    // If second batsman exists, striker replaced by new batsman
    if (batsman2) {
      batsman1Runs = 0;
      batsman1Balls = 0;
      // We do not prompt for new batsman name, just reset stats for now
    } else {
      // No second batsman, match over scenario?
      alert("Wicket! No non-striker. You may want to reset or add a new batsman manually.");
    }

    updateUI();
  }
}

// Increase ball count and handle over completion
function incrementBall() {
  ballsInCurrentOver++;
  if (ballsInCurrentOver > 5) {
    ballsInCurrentOver = 0;
    completedOvers++;

    // Swap strike at over end if two batsmen exist
    if (batsman2) swapStrike();
  }
}

// Swap striker and non-striker
function swapStrike() {
  if (!batsman2) return;
  // Swap batsman names
  [batsman1, batsman2] = [batsman2, batsman1];
  // Swap runs
  [batsman1Runs, batsman2Runs] = [batsman2Runs, batsman1Runs];
  // Swap balls faced
  [batsman1Balls, batsman2Balls] = [batsman2Balls, batsman1Balls];

  batsman1Display.textContent = batsman1;
  batsman2Display.textContent = batsman2;
}

// Add event to history table
function addHistoryEvent(event) {
  const over = completedOvers;
  const ball = ballsInCurrentOver + 1; // ball count 1 to 6

  history.push({
    over,
    ball,
    event,
    score: `${totalRuns} / ${totalWickets}`,
  });

  renderHistory();
}

// Render history table rows
function renderHistory() {
  historyBody.innerHTML = "";
  history.forEach(({ over, ball, event, score }) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${over}</td><td>${ball}</td><td>${event}</td><td>${score}</td>`;
    historyBody.appendChild(tr);
  });
}

// Update all UI displays
function updateUI() {
  scoreDisplay.textContent = `${totalRuns} / ${totalWickets}`;
  oversDisplay.textContent = `${completedOvers}.${ballsInCurrentOver}`;

  batsman1Display.textContent = batsman1;
  batsman2Display.textContent = batsman2 || "-";
  bowlerDisplay.textContent = bowler;

  batsman1RunsElem.textContent = batsman1Runs;
  batsman1BallsElem.textContent = batsman1Balls;

  batsman2RunsElem.textContent = batsman2Runs;
  batsman2BallsElem.textContent = batsman2Balls;

  bowlerRunsElem.textContent = bowlerRuns;
  bowlerWicketsElem.textContent = bowlerWickets;
}

// Reset button
resetBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset the match?")) {
    // Reset all
    batsman1NameInput.value = "";
    batsman2NameInput.value = "";
    bowlerNameInput.value = "";

    inputSection.classList.add("hidden");
    scoreSection.classList.add("hidden");
    coinResultElem.textContent = "";
    coinElem.style.transform = "rotateY(0deg)";
    flipCoinBtn.disabled = false;
  }
});