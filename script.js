// Variables
let teamAName, teamBName, oversCount;
let teamAPlayers = [];
let teamBPlayers = [];
let tossWinner = "";
let battingTeam = "";

let striker = null;
let nonStriker = null;
let bowler = null;

let score = 0;
let wickets = 0;
let balls = 0;

let stats = {};

let history = [];

// Elements
const steps = {
  step1: document.getElementById("step1"),
  step2: document.getElementById("step2"),
  step3: document.getElementById("step3"),
  step4: document.getElementById("step4"),
  step5: document.getElementById("step5"),
};

const teamALabel = document.getElementById("teamALabel");
const teamBLabel = document.getElementById("teamBLabel");
const teamAPlayerInput = document.getElementById("teamAPlayerInput");
const teamBPlayerInput = document.getElementById("teamBPlayerInput");
const teamAPlayersList = document.getElementById("teamAPlayersList");
const teamBPlayersList = document.getElementById("teamBPlayersList");

const tossWinnerSelect = document.getElementById("tossWinner");
const battingTeamSelect = document.getElementById("battingTeam");

const strikerSelect = document.getElementById("strikerSelect");
const nonStrikerSelect = document.getElementById("nonStrikerSelect");
const bowlerSelect = document.getElementById("bowlerSelect");

const liveBattingTeam = document.getElementById("liveBattingTeam");
const liveScore = document.getElementById("liveScore");
const liveOvers = document.getElementById("liveOvers");

const liveStrikerName = document.getElementById("liveStrikerName");
const liveNonStrikerName = document.getElementById("liveNonStrikerName");
const liveBowlerName = document.getElementById("liveBowlerName");

const strikerStats = document.getElementById("strikerStats");
const nonStrikerStats = document.getElementById("nonStrikerStats");
const bowlerStats = document.getElementById("bowlerStats");

const historyBody = document.getElementById("historyBody");

// Show step helper
function showStep(step) {
  Object.values(steps).forEach(s => s.classList.remove("active"));
  steps[step].classList.add("active");
}

// Step 1 → Step 2
document.getElementById("toStep2").addEventListener("click", () => {
  teamAName = document.getElementById("teamAName").value.trim();
  teamBName = document.getElementById("teamBName").value.trim();
  oversCount = parseInt(document.getElementById("oversCount").value);

  if (!teamAName || !teamBName || !oversCount || oversCount < 1) {
    alert("Please enter valid team names and overs.");
    return;
  }

  teamALabel.textContent = teamAName;
  teamBLabel.textContent = teamBName;

  teamAPlayers = [];
  teamBPlayers = [];
  renderPlayerList();

  showStep("step2");
});

// Add players
document.getElementById("addTeamAPlayer").addEventListener("click", () => {
  addPlayer(teamAPlayerInput, teamAPlayers, teamAPlayersList);
});
document.getElementById("addTeamBPlayer").addEventListener("click", () => {
  addPlayer(teamBPlayerInput, teamBPlayers, teamBPlayersList);
});

function addPlayer(inputElem, playersArray, listElem) {
  const name = inputElem.value.trim();
  if (!name) return alert("Please enter a player name.");
  if (playersArray.includes(name)) return alert("Player already added.");
  playersArray.push(name);
  inputElem.value = "";
  renderPlayerList();
}

function renderPlayerList() {
  teamAPlayersList.innerHTML = teamAPlayers.map(p => `<li>${p}</li>`).join("");
  teamBPlayersList.innerHTML = teamBPlayers.map(p => `<li>${p}</li>`).join("");
}

// Navigation buttons
document.getElementById("backToStep1").addEventListener("click", () => showStep("step1"));

document.getElementById("toStep3").addEventListener("click", () => {
  if (teamAPlayers.length < 1 || teamBPlayers.length < 1) {
    alert("Add at least one player to each team.");
    return;
  }
  tossWinnerSelect.innerHTML = `
    <option value="">Select team</option>
    <option value="${teamAName}">${teamAName}</option>
    <option value="${teamBName}">${teamBName}</option>`;
  battingTeamSelect.innerHTML = tossWinnerSelect.innerHTML;
  showStep("step3");
});

document.getElementById("backToStep2").addEventListener("click", () => showStep("step2"));

document.getElementById("toStep4").addEventListener("click", () => {
  tossWinner = tossWinnerSelect.value;
  battingTeam = battingTeamSelect.value;

  if (!tossWinner || !battingTeam) {
    alert("Please select toss winner and batting team.");
    return;
  }

  populateSelect(strikerSelect, battingTeam === teamAName ? teamAPlayers : teamBPlayers);
  populateSelect(nonStrikerSelect, battingTeam === teamAName ? teamAPlayers : teamBPlayers);
  populateSelect(bowlerSelect, battingTeam === teamAName ? teamBPlayers : teamAPlayers);

  showStep("step4");
});

document.getElementById("backToStep3").addEventListener("click", () => showStep("step3"));

function populateSelect(selectElem, players) {
  selectElem.innerHTML = players.map(p => `<option value="${p}">${p}</option>`).join("");
  const addOpt = document.createElement("option");
  addOpt.value = "__add__";
  addOpt.textContent = "➕ Add Player";
  selectElem.appendChild(addOpt);

  selectElem.onchange = () => {
    if (selectElem.value === "__add__") {
      const newName = prompt("Enter new player name:");
      if (newName && newName.trim() !== "") {
        players.push(newName.trim());
        populateSelect(selectElem, players);
        selectElem.value = newName.trim();
      } else {
        selectElem.selectedIndex = 0;
      }
    }
  };
}

// Step 4 → Step 5
document.getElementById("toStep5").addEventListener("click", () => {
  striker = strikerSelect.value;
  nonStriker = nonStrikerSelect.value;
  bowler = bowlerSelect.value;

  if (!striker || !nonStriker || !bowler) {
    alert("Please select striker, non-striker and bowler.");
    return;
  }
  if (striker === nonStriker) {
    alert("Striker and Non-Striker cannot be the same player.");
    return;
  }

  resetMatchData();
  updateLiveUI();
  showStep("step5");
});

document.getElementById("backToStep3").addEventListener("click", () => showStep("step3"));

function resetMatchData() {
  score = 0;
  wickets = 0;
  balls = 0;
  history = [];

  stats = {};
  stats[striker] = { runs: 0, balls: 0 };
  stats[nonStriker] = { runs: 0, balls: 0 };
  stats[bowler] = { runs: 0, wickets: 0 };

  liveStrikerName.textContent = striker;
  liveNonStrikerName.textContent = nonStriker;
  liveBowlerName.textContent = bowler;

  liveBattingTeam.textContent = battingTeam;

  updateScoreUI();
  renderHistory();
}

// Scoring functions
function addRuns(runs) {
  score += runs;
  balls++;

  stats[striker].runs += runs;
  stats[striker].balls++;
  stats[bowler].runs += runs;

  addHistoryEvent(runs + " run" + (runs === 1 ? "" : "s"));

  if (runs % 2 === 1) swapBatsmen();

  if (balls % 6 === 0) swapBatsmen();

  updateScoreUI();
}

function addExtra(type) {
  score++;
  addHistoryEvent(type.charAt(0).toUpperCase() + type.slice(1));

  stats[bowler].runs++;

  updateScoreUI();
}

function addWicket() {
  wickets++;
  balls++;

  stats[bowler].wickets++;

  addHistoryEvent("Wicket");

  const battingPlayers = battingTeam === teamAName ? teamAPlayers : teamBPlayers;
  let nextBatsman = battingPlayers.find(p => !(p in stats));
  if (!nextBatsman) {
    alert("All players out! Innings over.");
    return;
  }
  stats[nextBatsman] = { runs: 0, balls: 0 };

  striker = nextBatsman;

  updateScoreUI();
}

function swapBatsmen() {
  [striker, nonStriker] = [nonStriker, striker];
  [stats[striker], stats[nonStriker]] = [stats[nonStriker], stats[striker]];

  [liveStrikerName.textContent, liveNonStrikerName.textContent] = [liveNonStrikerName.textContent, liveStrikerName.textContent];
  [strikerStats.textContent, nonStrikerStats.textContent] = [nonStrikerStats.textContent, strikerStats.textContent];
}

function updateScoreUI() {
  liveScore.textContent = `${score} / ${wickets}`;
  liveOvers.textContent = `Overs: ${Math.floor(balls / 6)}.${balls % 6}`;

  strikerStats.textContent = `${stats[striker].runs} (${stats[striker].balls})`;
  nonStrikerStats.textContent = `${stats[nonStriker].runs} (${stats[nonStriker].balls})`;
  bowlerStats.textContent = `${stats[bowler].runs} / ${stats[bowler].wickets}`;
}

function addHistoryEvent(event) {
  const currentOver = Math.floor(balls / 6);
  const ballInOver = balls % 6 || 6;
  history.push({
    over: currentOver,
    ball: ballInOver,
    event,
    score: `${score}/${wickets}`,
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

// Reset match
document.getElementById("resetMatch").addEventListener("click", () => {
  if (confirm("Reset match and start over?")) location.reload();
});

function updateLiveUI() {
  liveStrikerName.textContent = striker;
  liveNonStrikerName.textContent = nonStriker;
  liveBowlerName.textContent = bowler;

  liveBattingTeam.textContent = battingTeam;

  updateScoreUI();
}