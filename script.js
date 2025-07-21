// Elements
const flipCoinBtn = document.getElementById("flipCoinBtn");
const coinElem = document.getElementById("coin");
const coinResultElem = document.getElementById("coinResult");

const inputSection = document.getElementById("inputSection");
const scoreSection = document.getElementById("scoreSection");
const coinSection = document.getElementById("coinSection");

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

// Match state variables
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

let ballsInCurrentOver = 0; // legal balls in current over
let completedOvers = 0;

let history = [];

let strikerIsBatsman1 = true;

// Coin flip animation and result
flipCoinBtn.addEventListener("click", () => {
  coinResultElem.textContent = "";
  coinElem.style.transform = "rotateY(0deg)";
  coinElem.classList.remove("flip-animation");

  // Restart animation
  void coinElem.offsetWidth;

  coinElem.classList.add("flip-animation");

  setTimeout(() => {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    coinResultElem.textContent = `Result: ${result}`;
    inputSection.classList.remove("hidden");
    flipCoinBtn.disabled = true;
  }, 2000);
});

// Start match button logic
startMatchBtn.addEventListener("click", () => {
  batsman1 = batsman1NameInput.value.trim();
  batsman2 = batsman2NameInput.value.trim();
  bowler = bowlerNameInput.value.trim();

  if (!batsman1) {
    alert("Batsman 1 (Striker) is required.");
    return;
  }
  if (!bowler) {
    alert("Bowler name is required.");
    return;
  }
  if (batsman2 && batsman2.toLowerCase() === batsman1.toLowerCase()) {
    alert("Batsman 2 cannot be the same as Batsman 1.");
    return;
  }

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
  strikerIsBatsman1 = true;

  batsman1Display.textContent = batsman1;
  batsman2Display.textContent = batsman2 || "-";
  bowlerDisplay.textContent = bowler;

  updateScoreboard();
  renderHistory();

  inputSection.classList.add("hidden");
  scoreSection.classList.remove("hidden");
  coinSection.classList.add("hidden");
});

// Add runs
window.addRuns = function (runs) {
  totalRuns += runs;
  bowlerRuns += runs;

  if (strikerIsBatsman1) {
    batsman1Runs += runs;
    batsman1Balls++;
  } else {
    if (batsman2) {
      batsman2Runs += runs;
      batsman2Balls++;
    } else {
      batsman1Balls++;
    }
  }

  ballsInCurrentOver++;
  incrementBalls();

  addHistoryEvent(`${runs} run${runs === 1 ? "" : "s"}`);

  if (runs % 2 === 1) {
    swapStriker();
  }

  if (ballsInCurrentOver === 6) {
    completeOver();
  }

  updateScoreboard();
};

// Add extras (wide or no ball)
window.addExtra = function (type) {
  totalRuns++;
  bowlerRuns++;

  addHistoryEvent(type);

  // Extras do not count as legal balls

  updateScoreboard();
};

// Add wicket
window.addWicket = function () {
  totalWickets++;
  bowlerWickets++;

  ballsInCurrentOver++;
  incrementBalls();

  addHistoryEvent("Wicket");

  // Prompt new batsman
  const newBatsman = prompt("Enter new batsman name:");
  if (!newBatsman || newBatsman.trim() === "") {
    alert("Match ended: no new batsman entered.");
    disableScoringButtons();
    return;
  }

  if (strikerIsBatsman1) {
    batsman1 = newBatsman.trim();
    batsman1Runs = 0;
    batsman1Balls = 0;
    batsman1Display.textContent = batsman1;
    batsman1RunsElem.textContent = batsman1Runs;
    batsman1BallsElem.textContent = batsman1Balls;
  } else {
    batsman2 = newBatsman.trim();
    batsman2Runs = 0;
    batsman2Balls = 0;
    batsman2Display.textContent = batsman2;
    batsman2RunsElem.textContent = batsman2Runs;
    batsman2BallsElem.textContent = batsman2Balls;
  }

  if (ballsInCurrentOver === 6) {
    completeOver();
  }

  updateScoreboard();
};

// Swap striker
function swapStriker() {
  strikerIsBatsman1 = !strikerIsBatsman1;
  updateStrikerDisplay();
}

// Update striker highlight
function updateStrikerDisplay() {
  if (strikerIsBatsman1) {
    batsman1Display.style.fontWeight = "700";
    batsman2Display.style.fontWeight = "400";
  } else {
    batsman1Display.style.fontWeight = "400";
    batsman2Display.style.fontWeight = "700";
  }
}

// Increment balls and update overs display
function incrementBalls() {
  if (ballsInCurrentOver > 6) ballsInCurrentOver = 6;

  let ballsCount = ballsInCurrentOver === 6 ? 0 : ballsInCurrentOver;
  let displayOver = completedOvers + (ballsCount / 6);

  oversDisplay.textContent = displayOver.toFixed(1);
}

// Over complete logic
function completeOver() {
  completedOvers++;
  ballsInCurrentOver = 0;

  alert("Over complete! Please enter the new bowler's name.");
  const newBowler = prompt("New bowler name:");
  if (newBowler && newBowler.trim() !== "") {
    bowler = newBowler.trim();
    bowlerRuns = 0;
    bowlerWickets = 0;
    bowlerDisplay.textContent = bowler;
  } else {
    alert("No bowler entered. Keeping current bowler.");
  }

  swapStriker();

  incrementBalls();
  updateScoreboard();
}

// Update scoreboard UI
function updateScoreboard() {
  scoreDisplay.textContent = `${totalRuns} / ${totalWickets}`;
  incrementBalls();

  batsman1RunsElem.textContent = batsman1Runs;
  batsman1BallsElem.textContent = batsman1Balls;

  batsman2RunsElem.textContent = batsman2Runs;
  batsman2BallsElem.textContent = batsman2Balls;

  bowlerRunsElem.textContent = bowlerRuns;
  bowlerWicketsElem.textContent = bowlerWickets;

  updateStrikerDisplay();
}

// Add event to history and render
function addHistoryEvent(eventText) {
  let ballNum = ballsInCurrentOver === 0 ? 6 : ballsInCurrentOver;
  history.push({
    over: completedOvers,
    ball: ballNum,
    event: eventText,
    score: `${totalRuns} / ${totalWickets}`,
  });
  renderHistory();
}

function renderHistory() {
  historyBody.innerHTML = "";
  history.forEach(h => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${h.over}</td><td>${h.ball}</td><td>${h.event}</td><td>${h.score}</td>`;
    historyBody.appendChild(tr);
  });
}

// Disable all scoring buttons on innings end
function disableScoringButtons() {
  document.querySelectorAll(".scoreButtons button").forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = "not-allowed";
    btn.style.opacity = 0.6;
  });
}

// Reset match button
resetBtn.addEventListener("click", () => {
  if (confirm("Reset match and start over?")) {
    location.reload();
  }
});
