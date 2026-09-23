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
  const rows = (leagueData.standings || []).filter(
    (team) => team.league === activeLeague && team.division === activeDivision,
  );

  standingsBody.innerHTML = "";

  rows.forEach((team) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="standings-team">${team.team}</td>
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

renderStandings();
