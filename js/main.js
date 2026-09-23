const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
}

const games = document.querySelector("#upcoming-games");

if (games) {
  // Get today's date in YYYY-MM-DD format using the visitor's local time.
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  // Find all games scheduled for today or later.
  const futureGames = leagueData.games
    .filter((game) => game.date >= todayString)
    .sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }

      return convertTimeToMinutes(a.time) - convertTimeToMinutes(b.time);
    });

  if (futureGames.length > 0) {
    // Find the next date on which games are scheduled.
    const nextGameDate = futureGames[0].date;

    // Show every game scheduled for that date.
    const upcomingGames = futureGames.filter(
      (game) => game.date === nextGameDate,
    );

    upcomingGames.forEach((g) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
  <td class="game-date">${formatGameDate(g.date)}</td>
  <td class="game-time">${g.time}</td>
  <td class="game-home">${g.home}</td>
  <td class="game-away">${g.away}</td>
  <td class="game-location">${g.location}</td>
`;

      games.appendChild(tr);
    });
  } else {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td colspan="5" class="no-games">
        No upcoming games scheduled.
      </td>
    `;

    games.appendChild(tr);
  }
}

// ======================================================
// GAME DATE & TIME HELPERS
// ======================================================

function formatGameDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function convertTimeToMinutes(timeString) {
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
