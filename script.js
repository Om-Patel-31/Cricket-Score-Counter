let batsman1 = "";
let batsman2 = ""; // optional

let batsman1Runs = 0;
let batsman1Balls = 0;

let batsman2Runs = 0;
let batsman2Balls = 0;

let bowler = "";

let bowlerRuns = 0;
let bowlerWickets = 0;

let totalRuns = 0;
let totalWickets = 0;

let ballsInCurrentOver = 0;
let completedOvers = 0;

let history = [];

const scoreSection = document.getElementById("scoreSection");
const historyBody = document.getElementById("historyBody");
const inputSection = document.getElementById("inputSection");
const coinFlipSection = document.getElementById("coinFlipSection");
const coinElem = document.getElementById("coin");
const coinResultElem = document.getElementById("coinResult");
const flipCoinBtn = document.getElementById("flipCoinBtn");

flipCoinBtn.addEventListener("click", () => {
  coinResultElem.textContent = "";
  coinElem.classList.remove("hidden");
  coinElem.classList.add("flip");
  flipCoinBtn.disabled = true;

  setTimeout(() => {
    coinElem.classList.remove("flip");
    const result = Math.random() < 0.5 ? "Heads" : "Tails";
    coinResultElem.textContent = `Result: ${result}`;
    inputSection.classList.remove("hidden");
  }, 2000);
});

document.getElementById("setPlayersBtn").addEventListener("click", () => {
  const b1Input = document.getElementById("batsman1Name").value.trim();
  const b2Input = document.getElementById("batsman2Name").value.trim();
  const bowlerInput = document.getElementById("bowlerName").value.trim();

  if (!b1Input) {
    alert("Striker name is required.");
    return;
  }
  if (!bowlerInput) {
    alert("Bowler name is required.");
    return;
  }

  batsman1 = b1Input;
  batsman2 = b2Input || "";
  bowler = bowlerInput;

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

  updateUI();

  if (batsman2) {
    document.getElementById("nonStrikerStatsDiv").style.display = "block";
  } else {
    document.getElementById("nonStrikerStatsDiv").style.display = "none";
  }

  scoreSection.classList.remove("hidden");
});

function addRuns(runs) {
  totalRuns += runs;
  ballsInCurrentOver++;

  bowlerRuns += runs;

  if (batsman2) {
    // Two batsmen mode
    // Add runs & balls to striker (batsman1)
    batsman1Runs += runs;
    batsman1Balls++;

    // Swap strike if runs odd
    if (runs % 2 === 1) swapStrike();

  } else {
    // One batsman mode
    batsman1Runs += runs;
    batsman1Balls++;
  }

  checkOverCompletion();
  addHistoryEvent(`${runs} run${runs !== 1 ? "s" : ""}`);
  updateUI();
}

function addExtra(type) {
  totalRuns++;
  addHistoryEvent(type.charAt(0).toUpperCase() + type.slice(1) + " (Extra)", true);

  bowlerRuns++;
  // No ball count increment on extras

  updateUI();
}

function addWicket() {
  totalWickets++;
  ballsInCurrentOver++;

  bowlerWickets++;

  addHistoryEvent("Wicket");

  if (batsman2) {
    // If two batsmen, out striker (batsman1)
    batsman1Runs = batsman1Runs; // runs unchanged
    batsman1Balls++; // ball faced

    // For simplicity, no next batsman, just reset striker's runs
    batsman1Runs = 0;
    batsman1Balls = 0;
  } else {
    // One batsman mode - out batsman1, end innings? For now just reset runs
    batsman1Runs = 0;
    batsman1Balls = 0;
  }

  checkOverCompletion();
  updateUI();
}

function swapStrike() {
  // Swap batsman1 and batsman2 stats and names
  [batsman1, batsman2] = [batsman2, batsman1];
  [batsman1Runs, batsman2Runs] = [batsman2Runs, batsman1Runs];
  [batsman1Balls, batsman2Balls] = [batsman2Balls, batsman1Balls];
}

function checkOverCompletion() {
  if (ballsInCurrentOver === 6) {
    completedOvers++;
    ballsInCurrentOver = 0;
    // Swap strike at end of over if two batsmen
    if (batsman2) swapStrike();
  }
}

function addHistoryEvent(event, isExtra = false) {
  let ballNum = ballsInCurrentOver === 0 ? 6 : ballsInCurrentOver;
  let overNum = ballsInCurrentOver === 0 ? completedOvers : completedOvers + 1;
  history.push({
    over: overNum,
    ball: ballNum,
    event: event + (isExtra ? "*" : ""),
    score: `${totalRuns} / ${totalWickets}`
  });
  renderHistory();
}

function renderHistory() {
  historyBody.innerHTML = "";
  history.forEach(h => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${h.over}</td>
      <td>${h.ball}</td>
      <td>${h.event}</td>
      <td>${h.score}</td>
    `;
    historyBody.appendChild(tr);
  });
}

function updateUI() {
  document.getElementById("liveBatsman1Name").textContent = batsman1 || "-";
  document.getElementById("liveBatsman2Name").textContent = batsman2 || "-";
  document.getElementById("liveBowlerName").textContent = bowler || "-";

  document.getElementById("batsman1Runs").textContent = batsman1Runs;
  document.getElementById("batsman1Balls").textContent = batsman1Balls;

  document.getElementById("batsman2Runs").textContent = batsman2Runs;
  document.getElementById("batsman2Balls").textContent = batsman2Balls;

  document.getElementById("bowlerRuns").textContent = bowlerRuns;
  document.getElementById("bowlerWickets").textContent = bowlerWickets;

  document.getElementById("scoreDisplay").textContent = `${totalRuns} / ${totalWickets}`;
  document.getElementById("oversDisplay").textContent = `${completedOvers}.${ballsInCurrentOver}`;
}

document.getElementById("resetBtn").addEventListener("click", () => {
  batsman1 = "";
  batsman2 = "";
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

  document.getElementById("batsman1Name").value = "";
  document.getElementById("batsman2Name").value = "";
  document.getElementById("bowlerName").value = "";
  scoreSection.classList.add("hidden");
  inputSection.classList.add("hidden");
  coinFlipSection.classList.remove("hidden");
  coinResultElem.textContent = "";
  flipCoinBtn.disabled = false;
  historyBody.innerHTML = "";
  updateUI();
});