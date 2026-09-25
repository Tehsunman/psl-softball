// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL = "https://naalbruprqafetbxwglof.supabase.co";
const SUPABASE_KEY = "PASTE_THE_SAME_PUBLISHABLE_KEY_FROM_ADMIN_JS_HERE";

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

const timeDisplay = isFinal ? "FINAL" : game.time;

const homeDisplay = isFinal
  ? `${game.home} ${game.home_score}`
  : game.home;

const awayDisplay = isFinal
  ? `${game.away} ${game.away_score}`
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
// INITIAL PAGE LOAD
// ======================================================

renderSchedule();
