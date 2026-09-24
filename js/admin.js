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
// ELEMENTS
// ======================================================

const adminLogin = document.querySelector("#admin-login");
const adminDashboard = document.querySelector("#admin-dashboard");

const loginForm = document.querySelector("#login-form");
const emailInput = document.querySelector("#admin-email");
const passwordInput = document.querySelector("#admin-password");
const loginError = document.querySelector("#login-error");

const logoutButton = document.querySelector("#logout-btn");
const adminMenu = document.querySelector(".admin-menu");
const adminMenuCards = document.querySelectorAll(".admin-menu-card");

const scoresManager = document.querySelector("#scores-manager");
const scoreLeague = document.querySelector("#score-league");
const scoreDivision = document.querySelector("#score-division");
const scoreGames = document.querySelector("#score-games");
const scoresEmpty = document.querySelector("#scores-empty");

const adminBackButtons = document.querySelectorAll("[data-admin-back]");
const forgotPasswordButton =
  document.querySelector("#forgot-password-btn");


// ======================================================
// CHECK ADMIN STATUS
// ======================================================

async function checkAdmin(user) {
  if (!user) {
    return false;
  }

  const { data, error } = await supabaseClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Admin check failed:", error);
    return false;
  }

  return Boolean(data);
}


// ======================================================
// SHOW LOGIN
// ======================================================

function showLogin() {
  adminLogin.hidden = false;
  adminDashboard.hidden = true;
}


// ======================================================
// SHOW DASHBOARD
// ======================================================

function showDashboard() {
  adminLogin.hidden = true;
  adminDashboard.hidden = false;
  showAdminMenu();
}


// ======================================================
// LOGIN
// ======================================================

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginError.hidden = true;
  loginError.textContent = "";

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    loginError.textContent = "Email or password is incorrect.";
    loginError.hidden = false;
    return;
  }

  const isAdmin = await checkAdmin(data.user);

  if (!isAdmin) {
    await supabaseClient.auth.signOut();

    loginError.textContent =
      "This account does not have administrator access.";

    loginError.hidden = false;
    return;
  }

  passwordInput.value = "";
  showDashboard();
});

// ======================================================
// FORGOT PASSWORD
// ======================================================

forgotPasswordButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  loginError.hidden = true;
  loginError.textContent = "";

  if (!email) {
    loginError.textContent =
      "Enter your email address first.";

    loginError.hidden = false;
    return;
  }

  const redirectUrl =
    "https://tehsunman.github.io/psl-softball/set-password.html";

  const { error } =
    await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

  if (error) {
    console.error(error);

    loginError.textContent =
      "We couldn't send the password reset email.";

    loginError.hidden = false;
    return;
  }

  loginError.textContent =
    "Check your email for a password reset link.";

  loginError.hidden = false;
});

// ======================================================
// LOGOUT
// ======================================================

logoutButton.addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showLogin();
});


// ======================================================
// CHECK EXISTING LOGIN
// ======================================================

async function initializeAdmin() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    showLogin();
    return;
  }

  const isAdmin = await checkAdmin(session.user);

  if (isAdmin) {
    showDashboard();
  } else {
    await supabaseClient.auth.signOut();
    showLogin();
  }
}
// ======================================================
// SCORE FILTERS
// ======================================================

const scoreDivisions = {
  mens: ["Lower", "Middle", "Upper"],
  coed: ["Social", "Lower", "Middle/Upper"],
};

function renderScoreDivisions() {
  const league = scoreLeague.value;

  scoreDivision.innerHTML = "";

  scoreDivisions[league].forEach((division) => {
    const option = document.createElement("option");

    option.value = division;
    option.textContent = division;

    scoreDivision.appendChild(option);
  });
}

scoreLeague.addEventListener("change", () => {
  renderScoreDivisions();
  loadScoreGames();
});

scoreDivision.addEventListener("change", () => {
  loadScoreGames();
});
// ======================================================
// RENDER SCORE GAMES
// ======================================================

function renderScoreGames(games) {
  scoreGames.innerHTML = "";

  games.forEach((game) => {
    const card = document.createElement("div");
    card.className = "admin-game-card";

    const date = new Date(`${game.game_date}T00:00:00`);

    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const formattedTime = formatAdminGameTime(game.game_time);

    const homeScore =
      game.home_score === null ? "" : game.home_score;

    const awayScore =
      game.away_score === null ? "" : game.away_score;

    const isFinal = game.status === "final";

    card.innerHTML = `
      <div class="admin-game-meta">
        <div>
          <strong>${formattedDate}</strong>
          <span>${formattedTime}</span>
        </div>

        <span>${game.location || ""}</span>
      </div>

      ${
        isFinal
          ? `<div class="admin-game-status">Final</div>`
          : ""
      }

      <div class="admin-score-team">
        <label for="home-score-${game.id}">
          ${game.home_team?.name || "Home Team"}
        </label>

        <input
          id="home-score-${game.id}"
          type="number"
          min="0"
          inputmode="numeric"
          value="${homeScore}"
          data-home-score
        />
      </div>

      <div class="admin-score-team">
        <label for="away-score-${game.id}">
          ${game.away_team?.name || "Away Team"}
        </label>

        <input
          id="away-score-${game.id}"
          type="number"
          min="0"
          inputmode="numeric"
          value="${awayScore}"
          data-away-score
        />
      </div>

      <button
        type="button"
        class="filter-btn active admin-save-score"
        data-game-id="${game.id}"
      >
        ${isFinal ? "Update Score" : "Save Score"}
      </button>

      <p class="admin-save-message" hidden></p>
    `;

    scoreGames.appendChild(card);
  });
}


// ======================================================
// FORMAT GAME TIME
// ======================================================

function formatAdminGameTime(time) {
  if (!time) {
    return "";
  }

  const [hourString, minute] = time.split(":");
  let hour = Number(hourString);

  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${period}`;
}

renderScoreDivisions();
// ======================================================
// LOAD GAMES FOR SCORES
// ======================================================

async function loadScoreGames() {
  const league = scoreLeague.value;
  const division = scoreDivision.value;

  scoreGames.innerHTML = "";
  scoresEmpty.hidden = true;

  const { data: games, error } = await supabaseClient
    .from("games")
    .select(`
      id,
      game_date,
      game_time,
      location,
      home_score,
      away_score,
      status,
      home_team:teams!games_home_team_id_fkey (
        id,
        name
      ),
      away_team:teams!games_away_team_id_fkey (
        id,
        name
      )
    `)
    .eq("league", league)
    .eq("division", division)
    .order("game_date", { ascending: false })
    .order("game_time", { ascending: true });

  if (error) {
    console.error("Could not load games:", error);

    scoreGames.innerHTML = `
      <p class="admin-error">
        We couldn't load the games.
      </p>
    `;

    return;
  }

  if (!games || games.length === 0) {
    scoresEmpty.hidden = false;
    return;
  }

  renderScoreGames(games);
}

initializeAdmin();
// ======================================================
// ADMIN DASHBOARD NAVIGATION
// ======================================================

function showAdminMenu() {
  adminMenu.hidden = false;
  scoresManager.hidden = true;
}

function showAdminManager(manager) {
  adminMenu.hidden = true;

  scoresManager.hidden = manager !== "scores";
}

adminMenuCards.forEach((button) => {
  button.addEventListener("click", () => {
    const page = button.dataset.adminPage;

    if (page === "scores") {
  showAdminManager("scores");
  loadScoreGames();
}
  });
});

adminBackButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showAdminMenu();
  });
});