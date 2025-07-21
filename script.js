// Data
let teamA = { name: "", players: [], runs: 0, wickets: 0, balls: 0, overs: 0, perOverRuns: [], bowlerStats: {} };
let teamB = { name: "", players: [], runs: 0, wickets: 0, balls: 0, overs: 0, perOverRuns: [], bowlerStats: {} };

let battingTeam = null;
let bowlingTeam = null;
let striker = null;
let nonStriker = null;
let currentBowler = null;

let currentBallInOver = 0;
let totalOvers = 0;
let innings = 1; // 1 or 2

// DOM elements
const startMatchBtn = document.getElementById("startMatchBtn");
const teamANameInput = document.getElementById("teamAName");
const teamBNameInput = document.getElementById("teamBName");
const teamAPlayersInput = document.getElementById("teamAPlayers");
const teamBPlayersInput = document.getElementById("teamBPlayers");
const oversCountInput = document.getElementById("oversCount");

const matchSection = document.querySelector(".match-section");
const inputSection = document.querySelector(".input-section");
const finalScoreSection = document.querySelector(".final-score");

const currentInningsDisplay = document.getElementById("currentInnings");
const battingTeamNameDisplay = document.getElementById("battingTeamName");
const bowlingTeamNameDisplay = document.getElementById("bowlingTeamName");

const strikerNameDisplay = document.getElementById("strikerName");
const nonStrikerNameDisplay = document.getElementById("nonStrikerName");

const strikerRunsDisplay = document.getElementById("strikerRuns");
const strikerBallsDisplay = document.getElementById("strikerBalls");

const nonStrikerRunsDisplay = document.getElementById("nonStrikerRuns");
const nonStrikerBallsDisplay = document.getElementById("nonStrikerBalls");

const bowlerSelect = document.getElementById("bowlerSelect");
const bowlerRunsDisplay = document.getElementById("bowlerRuns");
const bowlerWicketsDisplay = document.getElementById("bowlerWickets");

const scoreDisplay = document.getElementById("scoreDisplay");
const oversDisplay = document.getElementById("oversDisplay");

const historyBody = document.getElementById("historyBody");

const endInningsBtn = document.getElementById("endInningsBtn");
const resetBtn = document.getElementById("resetBtn");
const resetMatchBtn = document.getElementById("resetMatchBtn");
const finalScoresDiv = document.getElementById("finalScores");

// Match state
let batsmenStats = {};
let bowlerStats = {};
let history = [];

// Helper to parse player list input
function parsePlayers(input) {
  return input.split(",").map(p => p.trim()).filter(Boolean);
}

// Initialize match
startMatchBtn.addEventListener("click", () => {
  // Validate inputs
  const teamAName = teamANameInput.value.trim();
  const teamBName = teamBNameInput.value.trim();
  const teamAPlayers = parsePlayers(teamAPlayersInput.value);
  const teamBPlayers = parsePlayers(teamBPlayersInput.value);
  const overs = parseInt(oversCountInput.value);

  if (!teamAName || !teamBName || overs < 1 || overs > 50) {
    alert("Please enter valid team names and overs (1-50).");
    return;
  }
  if (teamAPlayers.length < 2 || teamBPlayers.length < 2) {
    alert("Please enter at least 2 players for each team.");
    return;
  }

  // Setup teams
  teamA = {
    name: teamAName,
    players: teamAPlayers,
    runs: 0,
    wickets: 0,
    balls: 0,
    overs: 0,
    perOverRuns: [],
    bowlerStats: {}
  };
  teamB = {
    name: teamBName,
    players: teamBPlayers,
    runs: 0,
    wickets: 0,
    balls: 0,
    overs: 0,
    perOverRuns: [],
    bowlerStats: {}
  };

  totalOvers = overs;
  innings = 1;

  // Batting team is team A initially, bowling is B
  battingTeam = teamA;
  bowlingTeam = teamB;

  // Initialize batsmen stats and bowler stats
  batsmenStats = {};
  bowlerStats = {};
  history = [];

  // First two players as striker and non-striker
  striker = battingTeam.players[0];
  nonStriker = battingTeam.players[1];

  // Init batsmen data
  battingTeam.players.forEach(p => {
    batsmenStats[p] = { runs: 0, balls: 0, out: false };
  });

  // Init bowler data with empty runs/wickets for all bowling team players
  bowlingTeam.players.forEach(p => {
    bowlingTeam.bowlerStats[p] = { runsConceded: 0, wickets: 0 };
  });

  currentBowler = bowlingTeam.players[0];

  // Update UI
  inputSection.classList.add("hidden");
  matchSection.classList.remove("hidden");
  finalScoreSection.classList.add("hidden");

  updateBowlerSelect();
  updateUI();
});

// Update bowler dropdown
function updateBowlerSelect() {
  bowlerSelect.innerHTML = "";
  bowlingTeam.players.forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    bowlerSelect.appendChild(option);
  });
  currentBowler = bowlerSelect.value;
  updateBowlerStatsUI();
}

// When bowler changes from dropdown
bowlerSelect.addEventListener("change", () => {
  currentBowler = bowlerSelect.value;
  updateBowlerStatsUI();
});

// Add runs for a ball
function addRuns(run) {
  if (inningsEnded()) return;

  // Add runs
  battingTeam.runs += run;
  battingTeam.balls++;
  currentBallInOver++;

  batsmenStats[striker].runs += run;
  batsmenStats[striker].balls++;

  // Add runs to bowler conceded
  bowlingTeam.bowlerStats[currentBowler].runsConceded += run;

  // Add runs to current over total
  if (!battingTeam.perOverRuns[battingTeam.overs]) battingTeam.perOverRuns[battingTeam.overs] = 0;
  battingTeam.perOverRuns[battingTeam.overs] += run;

  // Check strike rotation for odd runs
  if (run % 2 !== 0) {
    swapStrikers();
  }

  // Check if over completed
  checkOverCompletion();

  // Record ball in history
  recordBall(run.toString(), false);

  updateUI();
  checkMatchEnd();
}

// Add extras: wide or no-ball (1 extra run, ball does NOT count)
function addExtra(type) {
  if (inningsEnded()) return;

  let extraRun = 1;
  battingTeam.runs += extraRun;

  // Bowler runs conceded increase for extras
  bowlingTeam.bowlerStats[currentBowler].runsConceded += extraRun;

  // Extras do not count as legal delivery, so ball count not incremented, but record ball with extra
  recordBall(type === "wide" ? "Wd" : "Nb", true);

  // Extras added to current over runs
  if (!battingTeam.perOverRuns[battingTeam.overs]) battingTeam.perOverRuns[battingTeam.overs] = 0;
  battingTeam.perOverRuns[battingTeam.overs] += extraRun;

  updateUI();
}

// Wicket falls
function addWicket() {
  if (inningsEnded()) return;

  battingTeam.wickets++;
  battingTeam.balls++;
  currentBallInOver++;

  batsmenStats[striker].out = true;
  batsmenStats[striker].balls++;

  bowlingTeam.bowlerStats[currentBowler].wickets++;

  // Record ball in history
  recordBall("W", false);

  // Check over completion
  checkOverCompletion();

  // New batsman comes in if wickets < 10
  if (battingTeam.wickets < 10) {
    const nextBatsmanIndex = battingTeam.wickets + 1; // because first two are striker/non-striker at 0 and 1
    if (battingTeam.players[nextBatsmanIndex]) {
      striker = battingTeam.players[nextBatsmanIndex];
      batsmenStats[striker] = batsmenStats[striker] || { runs: 0, balls: 0, out: false };
    }
  }

  updateUI();
  checkMatchEnd();
}

// Swap striker and non-striker
function swapStrikers() {
  [striker, nonStriker] = [nonStriker, striker];
}

// Check if over is completed and update overs count
function checkOverCompletion() {
  if (currentBallInOver === 6) {
    battingTeam.overs++;
    currentBallInOver = 0;

    // Swap striker at end of over
    swapStrikers();
  }
}

// Record ball event in history
function recordBall(event, extra) {
  const overNum = battingTeam.overs + (currentBallInOver === 0 ? 0 : 1);
  const ballNum = currentBallInOver === 0 ? 6 : currentBallInOver;
  history.push({
    innings,
    over: overNum,
    ball: ballNum,
    event: event + (extra ? "*" : ""),
    score: `${battingTeam.runs}/${battingTeam.wickets}`
  });
  renderHistory();
}

// Render ball-by-ball history table
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

// Update all UI elements
function updateUI() {
  currentInningsDisplay.textContent = innings;
  battingTeamNameDisplay.textContent = battingTeam.name;
  bowlingTeamNameDisplay.textContent = bowlingTeam.name;

  strikerNameDisplay.textContent = striker;
  nonStrikerNameDisplay.textContent = nonStriker;

  strikerRunsDisplay.textContent = batsmenStats[striker].runs;
  strikerBallsDisplay.textContent = batsmenStats[striker].balls;

  nonStrikerRunsDisplay.textContent = batsmenStats[nonStriker].runs;
  nonStrikerBallsDisplay.textContent = batsmenStats[nonStriker].balls;

  bowlerRunsDisplay.textContent = bowlingTeam.bowlerStats[currentBowler].runsConceded;
  bowlerWicketsDisplay.textContent = bowlingTeam.bowlerStats[currentBowler].wickets;

  scoreDisplay.textContent = `${battingTeam.runs} / ${battingTeam.wickets}`;

  const completedOvers = battingTeam.overs;
  const ballsInCurrentOver = currentBallInOver;
  oversDisplay.textContent = `${completedOvers}.${ballsInCurrentOver}`;
}

// Check if innings ended by overs or wickets
function inningsEnded() {
  if (battingTeam.overs === totalOvers) return true;
  if (battingTeam.wickets === 10) return true;
  return false;
}

// Check if match ended or innings should switch
function checkMatchEnd() {
  if (inningsEnded()) {
    alert(`Innings ${innings} over!`);

    if (innings === 1) {
      // Switch innings
      innings = 2;

      // Swap batting and bowling teams
      [battingTeam, bowlingTeam] = [bowlingTeam, battingTeam];

      // Reset batsmen stats for new innings
      batsmenStats = {};
      bowlingTeam.bowlerStats = bowlingTeam.bowlerStats || {};
      battingTeam.players.forEach(p => {
        batsmenStats[p] = { runs: 0, balls: 0, out: false };
      });

      // Set first two batsmen for new innings
      striker = battingTeam.players[0];
      nonStriker = battingTeam.players[1];
      currentBallInOver = 0;

      // Reset overs and balls for batting team
      battingTeam.overs = 0;
      battingTeam.balls = 0;
      battingTeam.wickets = 0;
      battingTeam.runs = 0;
      battingTeam.perOverRuns = [];

      // Reset bowler stats for bowling team
      bowlingTeam.players.forEach(p => {
        bowlingTeam.bowlerStats[p] = { runsConceded: 0, wickets: 0 };
      });

      // Reset bowler select dropdown to first player
      updateBowlerSelect();

      history = [];
      renderHistory();
      updateUI();

      alert(`Innings 2 started! ${battingTeam.name} is batting now.`);
    } else {
      // Match is complete
      showFinalScores();
    }
  }
}

// Show final scores and hide match section
function showFinalScores() {
  matchSection.classList.add("hidden");
  finalScoreSection.classList.remove("hidden");

  let resultText = `${teamA.name}: ${teamA.runs} / ${teamA.wickets} in ${teamA.overs} overs\n`;
  resultText += `${teamB.name}: ${teamB.runs} / ${teamB.wickets} in ${teamB.overs} overs\n\n`;

  if (teamA.runs > teamB.runs) {
    resultText += `${teamA.name} won the match!`;
  } else if (teamB.runs > teamA.runs) {
    resultText += `${teamB.name} won the match!`;
  } else {
    resultText += `The match is a tie!`;
  }

  finalScoresDiv.textContent = resultText;
}

// Reset entire match
resetBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset the match?")) {
    resetMatch();
  }
});

resetMatchBtn.addEventListener("click", () => {
  resetMatch();
});

function resetMatch() {
  inputSection.classList.remove("hidden");
  matchSection.classList.add("hidden");
  finalScoreSection.classList.add("hidden");

  teamA = { name: "", players: [], runs: 0, wickets: 0, balls: 0, overs: 0, perOverRuns: [], bowlerStats: {} };
  teamB = { name: "", players: [], runs: 0, wickets: 0, balls: 0, overs: 0, perOverRuns: [], bowlerStats: {} };

  battingTeam = null;
  bowlingTeam = null;
  striker = null;
  nonStriker = null;
  currentBowler = null;
  currentBallInOver = 0;
  totalOvers = 0;
  innings = 1;

  batsmenStats = {};
  bowlerStats = {};
  history = [];

  // Clear inputs
  teamANameInput.value = "";
  teamBNameInput.value = "";
  teamAPlayersInput.value = "";
  teamBPlayersInput.value = "";
  oversCountInput.value = "";
}

// Initialize UI on page load
function init() {
  updateUI();
  updateBowlerStatsUI();
}

// Update bowler stats display
function updateBowlerStatsUI() {
  if (!currentBowler) return;
  bowlerRunsDisplay.textContent = bowlingTeam.bowlerStats[currentBowler].runsConceded;
  bowlerWicketsDisplay.textContent = bowlingTeam.bowlerStats[currentBowler].wickets;
}

init();