// Variables to hold team info and match state
let teamAName = "";
let teamBName = "";

let battingTeam = null;
let bowlingTeam = null;

let totalOvers = 5;
let innings = 1;

let runs = 0;
let wickets = 0;
let ballsInCurrentOver = 0;
let completedOvers = 0;

let bowlerName = "";
let bowlerRuns = 0;
let bowlerWickets = 0;

let history = [];

// DOM Elements
const teamInputSection = document.getElementById("teamInputSection");
const tossSection = document.getElementById("tossSection");
const matchSection = document.getElementById("matchSection");
const finalScoreSection = document.getElementById("finalScoreSection");

const teamANameInput = document.getElementById("teamAName");
const teamBNameInput = document.getElementById("teamBName");
const toTossBtn = document.getElementById("toTossBtn");

const flipCoinBtn = document.getElementById("flipCoinBtn");
const tossResultP = document.getElementById("tossResult");
const chooseBatOrBowl = document.getElementById("chooseBatOrBowl");
const tossWinnerSpan = document.getElementById("tossWinner");
const startMatchBtn = document.getElementById("startMatchBtn");

const currentInningsDisplay = document.getElementById("currentInnings");
const battingTeamNameDisplay = document.getElementById("battingTeamName");
const bowlingTeamNameDisplay = document.getElementById("bowlingTeamName");

const bowlerNameInput = document.getElementById("bowlerNameInput");
const setBowlerBtn = document.getElementById("setBowlerBtn");
const bowlerRunsDisplay = document.getElementById("bowlerRuns");
const bowlerWicketsDisplay = document.getElementById("bowlerWickets");

const scoreDisplay = document.getElementById("scoreDisplay");
const oversDisplay = document.getElementById("oversDisplay");

const historyBody = document.getElementById("historyBody");

const endInningsBtn = document.getElementById("endInningsBtn");
const resetBtn = document.getElementById("resetBtn");
const resetMatchBtn = document.getElementById("resetMatchBtn");
const finalScoresDiv = document.getElementById("finalScores");

// Go to Toss section after entering team names
toTossBtn.addEventListener("click", () => {
  if (!teamANameInput.value.trim() || !teamBNameInput.value.trim()) {
    alert("Please enter both team names.");
    return;
  }
  teamAName = teamANameInput.value.trim();
  teamBName = teamBNameInput.value.trim();

  teamInputSection.classList.add("hidden");
  tossSection.classList.remove("hidden");
});

// Toss coin flip
flipCoinBtn.addEventListener("click", () => {
  const tossWinner = Math.random() < 0.5 ? teamAName : teamBName;
  tossResultP.textContent = `${tossWinner} won the toss!`;
  tossWinnerSpan.textContent = tossWinner;
  chooseBatOrBowl.classList.remove("hidden");
  startMatchBtn.disabled = false;
});

// Start match after toss decision
startMatchBtn.addEventListener("click", () => {
  const choice = document.querySelector('input[name="batOrBowl"]:checked').value;
  const tossWinner = tossWinnerSpan.textContent;

  if (choice === "bat") {
    battingTeam = tossWinner;
    bowlingTeam = tossWinner === teamAName ? teamBName : teamAName;
  } else {
    bowlingTeam = tossWinner;
    battingTeam = tossWinner === teamAName ? teamBName : teamAName;
  }

  innings = 1;
  runs = 0;
  wickets = 0;
  ballsInCurrentOver = 0;
  completedOvers = 0;

  bowlerName = "";
  bowlerRuns = 0;
  bowlerWickets = 0;
  history = [];

  updateBowlerStatsUI();

  tossSection.classList.add("hidden");
  matchSection.classList.remove("hidden");
  finalScoreSection.classList.add("hidden");

  updateUI();
});

// Set bowler name
setBowlerBtn.addEventListener("click", () => {
  if (!bowlerNameInput.value.trim()) {
    alert("Please enter bowler name");
    return;
  }
  bowlerName = bowlerNameInput.value.trim();
  bowlerRuns = 0;
  bowlerWickets = 0;
  updateBowlerStatsUI();
});

// Add runs function
function addRuns(run) {
  if (inningsEnded()) return alert("Innings ended");

  runs += run;
  ballsInCurrentOver++;
  if (ballsInCurrentOver > 6) {
    ballsInCurrentOver = 1;
    completedOvers++;
  }

  if (bowlerName) {
    bowlerRuns += run;
  }

  updateScore(run.toString());
  checkOverCompletion();
  updateUI();
}

// Add extras (wide, no ball)
function addExtra(type) {
  if (inningsEnded()) return alert("Innings ended");

  runs += 1;

  if (bowlerName) {
    bowlerRuns += 1;
  }

  updateScore(type === "wide" ? "Wd" : "Nb", true);
  updateUI();
}

// Add wicket
function addWicket() {
  if (inningsEnded()) return alert("Innings ended");

  wickets++;
  ballsInCurrentOver++;
  if (ballsInCurrentOver > 6) {
    ballsInCurrentOver = 1;
    completedOvers++;
  }

  if (bowlerName) {
    bowlerWickets++;
  }

  updateScore("W");
  checkOverCompletion();
  updateUI();
}

function updateScore(event, extra = false) {
  let overNum = completedOvers;
  let ballNum = ballsInCurrentOver;
  if (ballsInCurrentOver === 0) {
    overNum--;
    ballNum = 6;
  }

  history.push({
    innings,
    over: overNum + 1,
    ball: ballNum,
    event: event + (extra ? "*" : ""),
    score: `${runs} / ${wickets}`
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
  currentInningsDisplay.textContent = innings;
  battingTeamNameDisplay.textContent = battingTeam;
  bowlingTeamNameDisplay.textContent = bowlingTeam;

  scoreDisplay.textContent = `${runs} / ${wickets}`;
  oversDisplay.textContent = `${completedOvers}.${ballsInCurrentOver}`;

  updateBowlerStatsUI();
}

function updateBowlerStatsUI() {
  bowlerRunsDisplay.textContent = bowlerRuns;
  bowlerWicketsDisplay.textContent = bowlerWickets;
}

function inningsEnded() {
  if (completedOvers === totalOvers) return true;
  if (wickets === 10) return true;
  return false;
}

function checkOverCompletion() {
  if (ballsInCurrentOver === 6) {
    completedOvers++;
    ballsInCurrentOver = 0;
  }
}

endInningsBtn.addEventListener("click", () => {
  if (!inningsEnded()) {
    if (!confirm("Innings not complete. Do you want to end innings early?")) return;
  }
  if (innings === 1) {
    // Switch innings
    innings = 2;

    // Swap teams
    [battingTeam, bowlingTeam] = [bowlingTeam, battingTeam];

    // Reset stats
    runs = 0;
    wickets = 0;
    ballsInCurrentOver = 0;
    completedOvers = 0;

    bowlerName = "";
    bowlerRuns = 0;
    bowlerWickets = 0;
    history = [];

    updateBowlerStatsUI();
    renderHistory();
    updateUI();

    alert(`Innings 2 started! ${battingTeam} is batting.`);
  } else {
    // Match complete
    showFinalScores();
  }
});

resetBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset the match?")) {
    resetMatch();
  }
});

resetMatchBtn.addEventListener("click", () => {
  resetMatch();
});

function resetMatch() {
  teamAName = "";
  teamBName = "";
  battingTeam = null;
  bowlingTeam = null;
  innings = 1;

  runs = 0;
  wickets = 0;
  ballsInCurrentOver = 0;
  completedOvers = 0;

  bowlerName = "";
  bowlerRuns = 0;
  bowlerWickets = 0;
  history = [];

  teamInputSection.classList.remove("hidden");
  tossSection.classList.add("hidden");
  matchSection.classList.add("hidden");
  finalScoreSection.classList.add("hidden");

  teamANameInput.value = "";
  teamBNameInput.value = "";
  tossResultP.textContent = "";
  chooseBatOrBowl.classList.add("hidden");
  startMatchBtn.disabled = true;

  bowlerNameInput.value = "";
  bowlerRunsDisplay.textContent = "0";
  bowlerWicketsDisplay.textContent = "0";

  historyBody.innerHTML = "";
  scoreDisplay.textContent = "0 / 0";
  oversDisplay.textContent = "0.0";
}

function showFinalScores() {
  matchSection.classList.add("hidden");
  finalScoreSection.classList.remove("hidden");

  let resultText = `${teamAName} and ${teamBName} Match Summary:\n\n`;
  resultText += `Innings 1 - Batting: ${innings === 1 ? battingTeam : bowlingTeam}\nRuns: ${runs} / ${wickets} in ${completedOvers}.${ballsInCurrentOver} overs\n`;

  // You might want to save innings 1 & 2 separately if you want better summary,
  // but for now just basic message.

  finalScoresDiv.textContent = resultText + "\nMatch Over!";
}