let runs = 0;
let wickets = 0;
let currentBall = 0;

const teamDisplay = document.getElementById("teamDisplay");
const playerDisplay = document.getElementById("playerDisplay");
const scoreDisplay = document.getElementById("score");
const wicketDisplay = document.getElementById("wickets");
const overDisplay = document.getElementById("overCount");
const ballDisplay = document.getElementById("ballCount");

function updateUI() {
  const overs = Math.floor(currentBall / 6);
  const balls = currentBall % 6;

  overDisplay.textContent = overs;
  ballDisplay.textContent = balls;
  scoreDisplay.textContent = runs;
  wicketDisplay.textContent = wickets;
}

function addRun(run) {
  runs += run;
  currentBall++;
  updateUI();
  checkInningsEnd();
}

function addWicket() {
  wickets++;
  currentBall++;
  updateUI();
  checkInningsEnd();
}

function nextBall() {
  currentBall++;
  updateUI();
  checkInningsEnd();
}

function checkInningsEnd() {
  const totalOvers = parseInt(document.getElementById("oversCount").value) || 0;
  const maxBalls = totalOvers * 6;

  if (currentBall >= maxBalls || wickets >= 10) {
    alert("Innings Over!");
    disableButtons();
  }
}

function disableButtons() {
  document.querySelectorAll(".button-section button").forEach(btn => {
    btn.disabled = true;
  });
}

function enableButtons() {
  document.querySelectorAll(".button-section button").forEach(btn => {
    btn.disabled = false;
  });
}

function reset() {
  runs = 0;
  wickets = 0;
  currentBall = 0;

  const team = document.getElementById("teamName").value || "-";
  const player1 = document.getElementById("player1").value || "-";
  const player2 = document.getElementById("player2").value || "-";

  teamDisplay.textContent = `Team: ${team}`;
  playerDisplay.textContent = `${player1} & ${player2}`;
  
  updateUI();
  enableButtons();
}