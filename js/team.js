// ======================================================
// TEAM PAGE
// ======================================================

const params = new URLSearchParams(window.location.search);

const selectedTeam = params.get("team");
const selectedLeague = params.get("league");
const selectedDivision = params.get("division");

const teamName = document.querySelector("#team-name");
const teamLeagueLabel = document.querySelector("#team-league-label");
const teamDivisionLabel = document.querySelector("#team-division-label");

const teamScheduleBody = document.querySelector("#team-schedule-body");
const teamScheduleEmpty = document.querySelector("#team-schedule-empty");

const teamStandingsBody = document.querySelector("#team-standings-body");
const teamStandingsEmpty = document.querySelector("#team-standings-empty");
const teamStandingsTitle = document.querySelector("#team-standings-title");

// ======================================================
// PAGE HEADER
// ======================================================

const leagueName = selectedLeague === "coed" ? "Coed" : "Men's";

teamName.textContent = selectedTeam || "Team";

teamLeagueLabel.textContent = `${leagueName} Softball`;

teamDivisionLabel.textContent = `${selectedDivision || ""} Division`;

document.title = `${selectedTeam || "Team"} Softball League`;

// ======================================================
// TEAM SCHEDULE
// ======================================================

const teamGames = leagueData.games
  .filter((game) => {
    return (
      game.league === selectedLeague &&
      game.division === selectedDivision &&
      (game.home === selectedTeam || game.away === selectedTeam)
    );
  })
  .sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    return convertTeamTimeToMinutes(a.time) - convertTeamTimeToMinutes(b.time);
  });

teamScheduleBody.innerHTML = "";

teamGames.forEach((game) => {
  const isHome = game.home === selectedTeam;

  const opponent = isHome ? game.away : game.home;
  const homeAway = isHome ? "Home" : "Away";

  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td>${formatTeamDate(game.date)}</td>
    <td>${game.time}</td>
    <td>${opponent}</td>
    <td>${homeAway}</td>
    <td>${game.location}</td>
  `;

  teamScheduleBody.appendChild(tr);
});

const hasGames = teamGames.length > 0;

teamScheduleEmpty.hidden = hasGames;
teamScheduleBody.closest(".table-scroll").hidden = !hasGames;

// ======================================================
// DIVISION STANDINGS
// ======================================================

teamStandingsTitle.textContent = `${leagueName} ${selectedDivision || ""} Standings`;

const divisionStandings = (leagueData.standings || []).filter((team) => {
  return team.league === selectedLeague && team.division === selectedDivision;
});

teamStandingsBody.innerHTML = "";

divisionStandings.forEach((team) => {
  const tr = document.createElement("tr");

  if (team.team === selectedTeam) {
    tr.classList.add("current-team");
  }

  tr.innerHTML = `
    <td class="standings-team">${team.team}</td>
    <td>${team.w}</td>
    <td>${team.l}</td>
    <td>${team.t}</td>
    <td>${team.rf}</td>
    <td>${team.ra}</td>
  `;

  teamStandingsBody.appendChild(tr);
});

const hasStandings = divisionStandings.length > 0;

teamStandingsEmpty.hidden = hasStandings;
teamStandingsBody.closest(".table-scroll").hidden = !hasStandings;

// ======================================================
// DATE HELPER
// ======================================================

function formatTeamDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ======================================================
// TIME HELPER
// ======================================================

function convertTeamTimeToMinutes(timeString) {
  const [time, period] = timeString.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}
