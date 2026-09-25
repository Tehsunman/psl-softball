// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL = "https://naalbruprafetbxwglof.supabase.co";
const SUPABASE_KEY = "sb_publishable_waUfYbsRuEAT80JqUmjQ9w_wARPo47p";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const leagueFilters = document.querySelector("#standings-league-filters");
const divisionFilters = document.querySelector("#standings-division-filters");
const standingsBody = document.querySelector("#standings-body");
const standingsTitle = document.querySelector("#standings-title");
const standingsEmpty = document.querySelector("#standings-empty");

const standingsDivisions = {
  mens: ["Lower", "Middle", "Upper"],
  coed: ["Social", "Lower", "Middle/Upper"],
};

// Read league from URL.
// Example: standings.html?league=coed
const params = new URLSearchParams(location.search);

let activeLeague = params.get("league") === "coed" ? "coed" : "mens";

// Default division
let activeDivision = activeLeague === "mens" ? "Upper" : "Social";
let calculatedStandings = [];

// ======================================================
// DIVISION BUTTONS
// ======================================================

function renderStandingsDivisionButtons() {
  divisionFilters.innerHTML = "";

  standingsDivisions[activeLeague].forEach((division) => {
    const button = document.createElement("button");

    button.className =
      "filter-btn" + (division === activeDivision ? " active" : "");

    button.textContent = division;

    button.addEventListener("click", () => {
      activeDivision = division;
      renderStandings();
    });

    divisionFilters.appendChild(button);
  });
}

// ======================================================
// RENDER STANDINGS
// ======================================================

function renderStandings() {
  renderStandingsDivisionButtons();

  // Active league button
  document
    .querySelectorAll("#standings-league-filters [data-league]")
    .forEach((button) => {
      button.classList.toggle("active", button.dataset.league === activeLeague);
    });

  // Page heading
  const leagueName = activeLeague === "mens" ? "Men's" : "Coed";

  standingsTitle.textContent = `${leagueName} ${activeDivision} Division`;

  // Get standings data
  const rows = calculatedStandings.filter(
  (team) => team.league === activeLeague && team.division === activeDivision,
);

  standingsBody.innerHTML = "";

  rows.forEach((team) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
  <td class="standings-team">${team.team}</td>
  <td>${team.w + team.l + team.t}</td>
  <td>${team.w}</td>
  <td>${team.l}</td>
  <td>${team.t}</td>
  <td>${team.rf}</td>
  <td>${team.ra}</td>
`;

    standingsBody.appendChild(tr);
  });

  const hasStandings = rows.length > 0;

  standingsEmpty.hidden = hasStandings;
  standingsBody.closest(".table-scroll").hidden = !hasStandings;
}

// ======================================================
// LOAD AND CALCULATE STANDINGS
// ======================================================

async function loadStandings() {
  const { data: teams, error: teamsError } = await supabaseClient
    .from("teams")
    .select("id, name, league, division");

  if (teamsError) {
    console.error("Could not load teams:", teamsError);
    calculatedStandings = [];
    renderStandings();
    return;
  }

  const { data: games, error: gamesError } = await supabaseClient
    .from("games")
    .select(`
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      status
    `)
    .eq("status", "final");

  if (gamesError) {
    console.error("Could not load final games:", gamesError);
    calculatedStandings = [];
    renderStandings();
    return;
  }

  const standingsMap = {};

  // Start every team at 0-0-0
  teams.forEach((team) => {
    standingsMap[team.id] = {
      team: team.name,
      league: team.league,
      division: team.division,
      w: 0,
      l: 0,
      t: 0,
      rf: 0,
      ra: 0,
    };
  });

  // Apply every final game to the standings
  games.forEach((game) => {
    const home = standingsMap[game.home_team_id];
    const away = standingsMap[game.away_team_id];

    if (!home || !away) return;

    const homeScore = Number(game.home_score);
    const awayScore = Number(game.away_score);

    home.rf += homeScore;
    home.ra += awayScore;

    away.rf += awayScore;
    away.ra += homeScore;

    if (homeScore > awayScore) {
      home.w += 1;
      away.l += 1;
    } else if (awayScore > homeScore) {
      away.w += 1;
      home.l += 1;
    } else {
      home.t += 1;
      away.t += 1;
    }
  });

  calculatedStandings = Object.values(standingsMap).sort((a, b) => {
  const aGames = a.w + a.l + a.t;
  const bGames = b.w + b.l + b.t;

  // Teams that have played rank above teams with 0 GP
  if (aGames === 0 && bGames > 0) return 1;
  if (bGames === 0 && aGames > 0) return -1;

  // Keep 0 GP teams together
  if (aGames === 0 && bGames === 0) return 0;

  const aWinPct = (a.w + a.t * 0.5) / aGames;
  const bWinPct = (b.w + b.t * 0.5) / bGames;

  // Better W/L record first
  if (bWinPct !== aWinPct) {
    return bWinPct - aWinPct;
  }

  // Same record: more Runs For ranks higher
  if (b.rf !== a.rf) {
    return b.rf - a.rf;
  }

  return 0;
});

renderStandings();
}

// ======================================================
// LEAGUE BUTTONS
// ======================================================

leagueFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-league]");

  if (!button) return;

  activeLeague = button.dataset.league;

  activeDivision = activeLeague === "mens" ? "Upper" : "Social";

  history.replaceState(null, "", "?league=" + activeLeague);

  renderStandings();
});

// ======================================================
// INITIAL PAGE LOAD
// ======================================================

loadStandings();
