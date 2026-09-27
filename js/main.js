const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
}

// ======================================================
// HOMEPAGE UPCOMING GAMES
// ======================================================

const games = document.querySelector("#upcoming-games");

if (games) {
  loadUpcomingGames();
}

async function loadUpcomingGames() {
  const SUPABASE_URL = "https://naalbruprafetbxwglof.supabase.co";
  const SUPABASE_KEY =
    "sb_publishable_waUfYbsRuEAT80JqUmjQ9w_wARPo47p";

  const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const { data, error } = await supabaseClient
    .from("games")
    .select(`
      id,
      game_date,
      game_time,
      location,
      home_team:teams!games_home_team_id_fkey(name),
      away_team:teams!games_away_team_id_fkey(name)
    `)
    .gte("game_date", todayString)
    .order("game_date", { ascending: true })
    .order("game_time", { ascending: true });

  games.innerHTML = "";

  if (error) {
    console.error("Could not load upcoming games:", error);
    showNoUpcomingGames();
    return;
  }

  if (!data || data.length === 0) {
    showNoUpcomingGames();
    return;
  }

  // Show every game on the next scheduled game date.
  const nextGameDate = data[0].game_date;

  const upcomingGames = data.filter(
    (game) => game.game_date === nextGameDate
  );

  upcomingGames.forEach((game) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="game-date">${formatGameDate(game.game_date)}</td>
      <td class="game-time">${formatGameTime(game.game_time)}</td>
      <td class="game-home">${game.home_team?.name || "TBD"}</td>
      <td class="game-away">${game.away_team?.name || "TBD"}</td>
      <td class="game-location">${game.location || ""}</td>
    `;

    games.appendChild(tr);
  });
}

function showNoUpcomingGames() {
  const tr = document.createElement("tr");

  tr.innerHTML = `
    <td colspan="5" class="no-games">
      No upcoming games scheduled.
    </td>
  `;

  games.appendChild(tr);
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

function formatGameTime(timeString) {
  if (!timeString) {
    return "";
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