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
  const rows = leagueData.games
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

    tr.innerHTML = `
  <td class="schedule-date">${formatScheduleDate(game.date)}</td>
  <td class="schedule-time">${game.time}</td>
  <td class="schedule-home">
  <div class="mobile-matchup">${game.home} <span>vs</span> ${game.away}</div>
  <div class="desktop-home">${game.home}</div>
</td>
  <td class="schedule-away">${game.away}</td>
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
