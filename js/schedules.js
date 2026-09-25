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
// SCHEDULE PAGE
// ======================================================

const divisionFilters = document.querySelector("#division-filters");
const scheduleBody = document.querySelector("#schedule-body");
const scheduleTitle = document.querySelector("#schedule-title");
const scheduleNote = document.querySelector("#schedule-note");
const scheduleEmpty = document.querySelector("#schedule-empty");

// ======================================================
// DIVISIONS
// ======================================================

const divisions = {
  mens: ["All", "Lower", "Middle", "Upper"],
  coed: ["All", "Social", "Lower", "Middle/Upper"],
};

// ======================================================
// DETERMINE LEAGUE FROM URL
// ======================================================
//
// Men's:
// schedules.html?league=mens
//
// Coed:
// schedules.html?league=coed
//

const params = new URLSearchParams(window.location.search);

const activeLeague = params.get("league") === "coed" ? "coed" : "mens";

let activeDivision = "All";
let scheduleGames = [];

// ======================================================
// CREATE DIVISION BUTTONS
// ======================================================

function renderDivisionButtons() {
  divisionFilters.innerHTML = "";

  divisions[activeLeague].forEach((division) => {
    const button = document.createElement("button");

    button.className =
      "filter-btn" + (division === activeDivision ? " active" : "");

    button.textContent = division;

    button.addEventListener("click", () => {
      activeDivision = division;
      renderSchedule();
    });

    divisionFilters.appendChild(button);
  });
}

// ======================================================
// FORMAT DATE
// ======================================================
//
// Converts:
// 2026-09-23
//
// Into:
// Sep 23
//

function formatScheduleDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ======================================================
// CONVERT GAME TIME FOR SORTING
// ======================================================

function convertScheduleTimeToMinutes(timeString) {
  if (!timeString) return 0;

  const [hours, minutes] = timeString.split(":").map(Number);

  return hours * 60 + minutes;
}

// ======================================================
// FORMAT GAME TIME FOR DISPLAY
// ======================================================

function formatScheduleTime(timeString) {
  if (!timeString) return "";

  const [hoursString, minutes] = timeString.split(":");
  let hours = Number(hoursString);

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${period}`;
}


// ======================================================
// RENDER SCHEDULE
// ======================================================

function renderSchedule() {
  renderDivisionButtons();

  // Page heading
  scheduleTitle.textContent =
    activeLeague === "mens" ? "Men's Schedule" : "Coed Schedule";

  // League play days
  scheduleNote.textContent =
    activeLeague === "mens" ? "Monday & Wednesday" : "Friday";

  // Get games for selected league/division
  const rows = scheduleGames
    .filter(
      (game) =>
        game.league === activeLeague &&
        (activeDivision === "All" || game.division === activeDivision),
    )
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }

      return (
        convertScheduleTimeToMinutes(a.time) -
        convertScheduleTimeToMinutes(b.time)
      );
    });

  scheduleBody.innerHTML = "";

  // Create schedule rows
  rows.forEach((game) => {
    const tr = document.createElement("tr");

    const isFinal = game.status === "final";

const homeWon =
  isFinal && Number(game.home_score) > Number(game.away_score);

const awayWon =
  isFinal && Number(game.away_score) > Number(game.home_score);

const homeDisplay = isFinal
  ? `<span class="${homeWon ? "schedule-winner" : ""}">
      ${game.home} <span class="schedule-score">${game.home_score}</span>
    </span>`
  : game.home;

const awayDisplay = isFinal
  ? `<span class="${awayWon ? "schedule-winner" : ""}">
      ${game.away} <span class="schedule-score">${game.away_score}</span>
    </span>`
  : game.away;

tr.innerHTML = `
  <td class="schedule-date">${formatScheduleDate(game.date)}</td>
  <td class="schedule-time">${timeDisplay}</td>
  <td class="schedule-home">
    <div class="mobile-matchup">
      ${homeDisplay} <span>vs</span> ${awayDisplay}
    </div>
    <div class="desktop-home">${homeDisplay}</div>
  </td>
  <td class="schedule-away">${awayDisplay}</td>
  <td class="schedule-location">${game.location}</td>
`;

    scheduleBody.appendChild(tr);
  });

  // Show empty message when a division has no games yet
  const hasGames = rows.length > 0;

  scheduleEmpty.hidden = hasGames;
  scheduleBody.closest(".table-scroll").hidden = !hasGames;
}
// ======================================================
// LOAD SCHEDULE FROM SUPABASE
// ======================================================

async function loadScheduleGames() {
  const { data, error } = await supabaseClient
    .from("games")
    .select(`
      id,
      league,
      division,
      game_date,
      game_time,
      location,
      home_score,
      away_score,
      status,
      home_team:teams!games_home_team_id_fkey(name),
      away_team:teams!games_away_team_id_fkey(name)
    `)
    .order("game_date", { ascending: true })
    .order("game_time", { ascending: true });

  if (error) {
    console.error("Could not load public schedule:", error);
    scheduleGames = [];
    renderSchedule();
    return;
  }

  scheduleGames = data.map((game) => ({
    id: game.id,
    date: game.game_date,
    time: game.game_time,
    league: game.league,
    division: game.division,
    home: game.home_team?.name || "TBD",
    away: game.away_team?.name || "TBD",
    location: game.location,
    home_score: game.home_score,
    away_score: game.away_score,
    status: game.status,
  }));

  renderSchedule();
}
// ======================================================
// INITIAL PAGE LOAD
// ======================================================

loadScheduleGames();
