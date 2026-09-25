// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL = "https://naalbruprafetbxwglof.supabase.co";
const SUPABASE_KEY = "sb_publishable_waUfYbsRuEAT80JqUmjQ9w_wARPo47p";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ======================================================
// TEAMS PAGE
// ======================================================

const teamLeagueFilters = document.querySelector("#team-league-filters");
const teamDivisionFilters = document.querySelector("#team-division-filters");
const teamList = document.querySelector("#team-list");
const teamTitle = document.querySelector("#team-title");
const teamsEmpty = document.querySelector("#teams-empty");

// ======================================================
// DIVISIONS
// ======================================================

const teamDivisions = {
  mens: ["Lower", "Middle", "Upper"],
  coed: ["Social", "Lower", "Middle/Upper"],
};

// ======================================================
// CURRENT SELECTION
// ======================================================

let activeTeamLeague = "mens";
let activeTeamDivision = "Upper";

let allTeams = [];

// ======================================================
// CREATE DIVISION BUTTONS
// ======================================================

function renderTeamDivisionButtons() {
  teamDivisionFilters.innerHTML = "";

  teamDivisions[activeTeamLeague].forEach((division) => {
    const button = document.createElement("button");

    button.className =
      "filter-btn" + (division === activeTeamDivision ? " active" : "");

    button.textContent = division;

    button.addEventListener("click", () => {
      activeTeamDivision = division;
      renderTeams();
    });

    teamDivisionFilters.appendChild(button);
  });
}

// ======================================================
// GET TEAM ARRAY
// ======================================================

function getSelectedTeams() {
  return allTeams
    .filter(
      (team) =>
        team.league === activeTeamLeague &&
        team.division === activeTeamDivision,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ======================================================
// RENDER TEAMS
// ======================================================

function renderTeams() {
  renderTeamDivisionButtons();

  document.querySelectorAll("[data-team-league]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.teamLeague === activeTeamLeague,
    );
  });

  const leagueName = activeTeamLeague === "mens" ? "Men's" : "Coed";

  teamTitle.textContent = `${leagueName} ${activeTeamDivision} Division`;

  const teams = getSelectedTeams();

  teamList.innerHTML = "";

  teams.forEach((team) => {
  const teamCard = document.createElement("a");

  teamCard.className = "team-item";

  teamCard.href =
    `team.html?team=${encodeURIComponent(team.name)}` +
    `&league=${encodeURIComponent(team.league)}` +
    `&division=${encodeURIComponent(team.division)}`;

  teamCard.textContent = team.name;

  teamList.appendChild(teamCard);
  });

  const hasTeams = teams.length > 0;

  teamList.hidden = !hasTeams;
  teamsEmpty.hidden = hasTeams;
}


// ======================================================
// CHANGE LEAGUE
// ======================================================

teamLeagueFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-team-league]");

  if (!button) {
    return;
  }

  activeTeamLeague = button.dataset.teamLeague;

  // Select a division that already has real data
  // when switching between leagues.

  activeTeamDivision = activeTeamLeague === "mens" ? "Upper" : "Social";

  renderTeams();
});

// ======================================================
// LOAD TEAMS
// ======================================================

async function loadTeams() {
  const { data, error } = await supabaseClient
    .from("teams")
    .select("id, name, league, division")
    .order("name", { ascending: true });

  if (error) {
    console.error("Could not load teams:", error);
    allTeams = [];
    renderTeams();
    return;
  }

  allTeams = data || [];

  renderTeams();
}

// ======================================================
// INITIAL PAGE LOAD
// ======================================================

loadTeams();
