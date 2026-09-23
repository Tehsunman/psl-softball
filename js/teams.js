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
  if (activeTeamLeague === "mens") {
    if (activeTeamDivision === "Lower") {
      return leagueData.teams.mens.lower;
    }

    if (activeTeamDivision === "Middle") {
      return leagueData.teams.mens.middle;
    }

    return leagueData.teams.mens.upper;
  }

  if (activeTeamDivision === "Social") {
    return leagueData.teams.coed.social;
  }

  if (activeTeamDivision === "Lower") {
    return leagueData.teams.coed.lower;
  }

  return leagueData.teams.coed.middleUpper;
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
    const teamCard = document.createElement("div");

    teamCard.className = "team-item";
    teamCard.textContent = team;

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
// INITIAL PAGE LOAD
// ======================================================

renderTeams();
