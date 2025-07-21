let teamAName, teamBName, oversCount;
let teamAPlayers = [], teamBPlayers = [];
let tossWinner = "", battingTeam = "";

let striker = null, nonStriker = null, bowler = null;
let score = 0, wickets = 0, balls = 0;

let stats = {};
let history = [];

const steps = {
  step1: document.getElementById("step1"),
  step3: document.getElementById("step3"),
  step4: document.getElementById("step4"),
  step5: document.getElementById("step5"),
};

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

function showStep(step) {
  Object.values(steps).forEach(s => s.classList.remove("active"));
  steps[step].classList.add("active");
}

// Step 1 → Step 3
document.getElementById("toStep3").addEventListener("click", () => {
  teamAName = document.getElementById("teamAName").value.trim();
  teamBName = document.getElementById("teamBName").value.trim();
  oversCount = parseInt(document.getElementById("oversCount").value);

  if (!teamAName || !teamBName || !oversCount || oversCount < 1) {
    alert("Please enter valid team names and overs.");
    return;
  }

  // Default players
  teamAPlayers = ["Player A1", "Player A2", "Player A3"];
  teamBPlayers = ["Player B1", "Player B2", "Player B3"];

  tossWinnerSelect.innerHTML = `
    <option value="">Select team</option>
    <option value="${teamAName}">${teamAName}</option>
    <option value="${teamBName}">${teamBName}</option>`;
  battingTeamSelect.innerHTML = tossWinnerSelect.innerHTML;

  showStep("step3");
});

document.getElementById("backToStep1").addEventListener("click", () => showStep("step1"));

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

function populateSelect(selectElem, players) {
  selectElem.innerHTML = players.map(p => `<option value="${p}">${p}</option>`).join("");
}

document.getElementById("backToStep3").addEventListener("click", () => showStep("step3"));
document.getElementById("toStep5").addEventListener("click", () => {
  striker = strikerSelect.value;
  nonStriker = nonStrikerSelect.value;
  bowler = bowlerSelect.value;

  if (!striker || !nonStriker || !bowler || striker === nonStriker) {
    alert("Invalid player selections.");
    return;
  }

  resetMatchData();
  updateLiveUI();
  showStep("step5");
});

// Keep the rest of scoring functions as-is...