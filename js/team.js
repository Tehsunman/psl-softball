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

document.title = selectedTeam || "Team";

teamStandingsTitle.textContent =
  `${leagueName} ${selectedDivision || ""} Standings`;

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
// TIME HELPERS
// ======================================================

function convertTeamTimeToMinutes(timeString) {
  if (!timeString) return 0;

  // Supabase time, for example 18:30:00
  if (!timeString.includes(" ")) {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  }

  // Existing display time, for example 6:30 PM
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

function formatTeamTime(timeString) {
  if (!timeString) return "";

  if (timeString.includes(" ")) {
    return timeString;
  }

  const [hoursString, minutesString] = timeString.split(":");

  let hours = Number(hoursString);
  const minutes = Number(minutesString);

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
}

// ======================================================
// LOAD TEAM PAGE
// ======================================================

async function loadTeamPage() {
  // Load all teams in this division
  const { data: teams, error: teamsError } = await supabaseClient
    .from("teams")
    .select("id, name, league, division")
    .eq("league", selectedLeague)
    .eq("division", selectedDivision)
    .order("name", { ascending: true });

  if (teamsError) {
    console.error("Could not load division teams:", teamsError);
    return;
  }

  const currentTeam = teams.find((team) => team.name === selectedTeam);

  if (!currentTeam) {
    console.error("Selected team could not be found.");
    teamScheduleEmpty.hidden = false;
    teamStandingsEmpty.hidden = false;
    return;
  }

  // Load every game in this division.
  // We need all division games because they also build the standings.
  const { data: games, error: gamesError } = await supabaseClient
  .from("games")
  .select(`
    id,
    league,
    division,
    game_date,
    game_time,
    location,
    home_team_id,
    away_team_id,
    home_score,
    away_score,
    status
  `)
  .eq("league", selectedLeague)
  .eq("division", selectedDivision)
  .order("game_date", { ascending: true })
  .order("game_time", { ascending: true });

  if (gamesError) {
    console.error("Could not load division games:", gamesError);
    return;
  }

  const teamMap = {};

  teams.forEach((team) => {
    teamMap[team.id] = team;
  });

  renderTeamSchedule(currentTeam, games, teamMap);
  renderDivisionStandings(teams, games);
}

// ======================================================
// RENDER TEAM SCHEDULE
// ======================================================

function renderTeamSchedule(currentTeam, games, teamMap) {
  const teamGames = games
    .filter(
      (game) =>
        game.home_team_id === currentTeam.id ||
        game.away_team_id === currentTeam.id
    )
    .sort((a, b) => {
      if (a.game_date !== b.game_date) {
        return a.game_date.localeCompare(b.game_date);
      }

      return (
        convertTeamTimeToMinutes(a.game_time) -
        convertTeamTimeToMinutes(b.game_time)
      );
    });

  teamScheduleBody.innerHTML = "";

  teamGames.forEach((game) => {
    const isHome = game.home_team_id === currentTeam.id;

    const opponentId = isHome
      ? game.away_team_id
      : game.home_team_id;

    const opponent = teamMap[opponentId]?.name || "Unknown Team";
    const homeAway = isHome ? "Home" : "Away";

    const isFinal = game.status === "final";

    let timeDisplay = formatTeamTime(game.game_time);

    if (isFinal) {
      const teamScore = isHome
        ? Number(game.home_score)
        : Number(game.away_score);

      const opponentScore = isHome
        ? Number(game.away_score)
        : Number(game.home_score);

      let result = "T";

      if (teamScore > opponentScore) {
        result = "W";
      } else if (teamScore < opponentScore) {
        result = "L";
      }

      timeDisplay =
        `FINAL ${result} ${teamScore}-${opponentScore}`;
    }

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${formatTeamDate(game.game_date)}</td>
      <td>${timeDisplay}</td>
      <td>${opponent}</td>
      <td>${homeAway}</td>
      <td>${game.location}</td>
    `;

    teamScheduleBody.appendChild(tr);
  });

  const hasGames = teamGames.length > 0;

  teamScheduleEmpty.hidden = hasGames;
  teamScheduleBody.closest(".table-scroll").hidden = !hasGames;
}

// ======================================================
// CALCULATE AND RENDER DIVISION STANDINGS
// ======================================================

function renderDivisionStandings(teams, games) {
  const standingsMap = {};

  teams.forEach((team) => {
    standingsMap[team.id] = {
      id: team.id,
      team: team.name,
      w: 0,
      l: 0,
      t: 0,
      rf: 0,
      ra: 0,
    };
  });

  games
    .filter((game) => game.status === "final")
    .forEach((game) => {
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

  const divisionStandings = Object.values(standingsMap).sort((a, b) => {
    const aGames = a.w + a.l + a.t;
    const bGames = b.w + b.l + b.t;

    // Teams that have played rank above teams with 0 GP
    if (aGames === 0 && bGames > 0) return 1;
    if (bGames === 0 && aGames > 0) return -1;

    // Keep teams with no completed games together
    if (aGames === 0 && bGames === 0) return 0;

    const aWinPct = (a.w + a.t * 0.5) / aGames;
    const bWinPct = (b.w + b.t * 0.5) / bGames;

    // Better W/L record first
    if (bWinPct !== aWinPct) {
      return bWinPct - aWinPct;
    }

    // Same record: higher RF first
    if (b.rf !== a.rf) {
      return b.rf - a.rf;
    }

    return 0;
  });

  teamStandingsBody.innerHTML = "";

  divisionStandings.forEach((team) => {
    const tr = document.createElement("tr");

    if (team.team === selectedTeam) {
      tr.classList.add("current-team");
    }

    const gamesPlayed = team.w + team.l + team.t;

    tr.innerHTML = `
      <td class="standings-team">${team.team}</td>
      <td>${gamesPlayed}</td>
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
}

// ======================================================
// INITIAL PAGE LOAD
// ======================================================

loadTeamPage();