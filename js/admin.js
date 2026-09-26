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
const gameEditor = document.querySelector("#game-editor");
const gameEditorTitle = document.querySelector("#game-editor-title");
const gameForm = document.querySelector("#game-form");
const gameDateInput = document.querySelector("#game-date-input");
const gameTimeInput = document.querySelector("#game-time-input");
const gameAwayTeam = document.querySelector("#game-away-team");
const gameHomeTeam = document.querySelector("#game-home-team");
const gameLocationInput =
  document.querySelector("#game-location-input");
const cancelGameEdit =
  document.querySelector("#cancel-game-edit");
const deleteGameButton =
  document.querySelector("#delete-game-btn");
const gameFormMessage =
  document.querySelector("#game-form-message");
let editingGameId = null;
const scheduleManager =
  document.querySelector("#schedule-manager");
const adminScheduleLeague =
  document.querySelector("#admin-schedule-league");
const adminScheduleDivision =
  document.querySelector("#admin-schedule-division");
const adminScheduleList =
  document.querySelector("#admin-schedule-list");
const adminScheduleEmpty =
  document.querySelector("#admin-schedule-empty");
const addGameButton =
  document.querySelector("#add-game-btn");
const teamEditor = document.querySelector("#team-editor");
const teamEditorTitle = document.querySelector("#team-editor-title");
const teamForm = document.querySelector("#team-form");
const teamNameInput = document.querySelector("#team-name-input");
const teamEditLeague = document.querySelector("#team-edit-league");
const teamEditDivision = document.querySelector("#team-edit-division");
const cancelTeamEdit = document.querySelector("#cancel-team-edit");
const deleteTeamButton = document.querySelector("#delete-team-btn");
const teamFormMessage = document.querySelector("#team-form-message");
let editingTeamId = null;
const teamsManager = document.querySelector("#teams-manager");
const adminTeamLeague =
  document.querySelector("#admin-team-league");
const adminTeamDivision =
  document.querySelector("#admin-team-division");
const adminTeamList =
  document.querySelector("#admin-team-list");
const adminTeamsEmpty =
  document.querySelector("#admin-teams-empty");
const addTeamButton =
  document.querySelector("#add-team-btn");
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
// ======================================================
// SAVE GAME SCORE
// ======================================================

scoreGames.addEventListener("click", async (event) => {
  const saveButton = event.target.closest(".admin-save-score");

  if (!saveButton) {
    return;
  }

  const card = saveButton.closest(".admin-game-card");
  const gameId = saveButton.dataset.gameId;

  const homeScoreInput = card.querySelector("[data-home-score]");
  const awayScoreInput = card.querySelector("[data-away-score]");
  const message = card.querySelector(".admin-save-message");

  const homeScore = homeScoreInput.value;
  const awayScore = awayScoreInput.value;

  message.hidden = true;
  message.textContent = "";

  // If both scores are blank, clear the final score
if (homeScore === "" && awayScore === "") {
  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  const { error } = await supabaseClient
    .from("games")
    .update({
      home_score: null,
      away_score: null,
      status: "scheduled",
    })
    .eq("id", gameId);

  if (error) {
    console.error("Could not clear score:", error);

    message.textContent = "Score could not be cleared. Please try again.";
    message.hidden = false;

    saveButton.disabled = false;
    saveButton.textContent = "Update Score";
    return;
  }

  await loadScoreGames();
  return;
}

// If only one score is entered, don't save it
if (homeScore === "" || awayScore === "") {
  message.textContent = "Enter both scores, or clear both boxes to remove the score.";
  message.hidden = false;
  return;
}

  const homeScoreNumber = Number(homeScore);
  const awayScoreNumber = Number(awayScore);

  // Prevent negative scores or invalid values
  if (
    !Number.isInteger(homeScoreNumber) ||
    !Number.isInteger(awayScoreNumber) ||
    homeScoreNumber < 0 ||
    awayScoreNumber < 0
  ) {
    message.textContent = "Scores must be whole numbers of 0 or higher.";
    message.hidden = false;
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  const { error } = await supabaseClient
    .from("games")
    .update({
      home_score: homeScoreNumber,
      away_score: awayScoreNumber,
      status: "final",
    })
    .eq("id", gameId);

  if (error) {
    console.error("Could not save score:", error);

    message.textContent = "Score could not be saved. Please try again.";
    message.hidden = false;

    saveButton.disabled = false;
    saveButton.textContent = "Save Score";

    return;
  }

  message.textContent = "Score saved.";
  message.hidden = false;
  setTimeout(() => {
  message.hidden = true;
}, 2500);

  saveButton.textContent = "Update Score";
  saveButton.disabled = false;

  // Add FINAL label if this game was previously scheduled
  if (!card.querySelector(".admin-game-status")) {
    const status = document.createElement("div");

    status.className = "admin-game-status";
    status.textContent = "Final";

    const firstScoreRow = card.querySelector(".admin-score-team");

    firstScoreRow.before(status);
  }
});

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
    .order("game_date", { ascending: true })
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

// ======================================================
// TEAM MANAGER FILTERS
// ======================================================

const adminTeamDivisions = {
  mens: ["Lower", "Middle", "Upper"],
  coed: ["Social", "Lower", "Middle/Upper"],
};

function renderAdminTeamDivisions() {
  const league = adminTeamLeague.value;

  adminTeamDivision.innerHTML = "";

  adminTeamDivisions[league].forEach((division) => {
    const option = document.createElement("option");

    option.value = division;
    option.textContent = division;

    adminTeamDivision.appendChild(option);
  });
}

// ======================================================
// TEAM EDITOR
// ======================================================

function renderTeamEditorDivisions(selectedDivision = null) {
  const league = teamEditLeague.value;

  teamEditDivision.innerHTML = "";

  adminTeamDivisions[league].forEach((division) => {
    const option = document.createElement("option");

    option.value = division;
    option.textContent = division;

    if (division === selectedDivision) {
      option.selected = true;
    }

    teamEditDivision.appendChild(option);
  });
}

function openAddTeamEditor() {
  editingTeamId = null;
  // Move the editor back to its normal position for Add Team
adminTeamList.insertAdjacentElement("afterend", teamEditor);

  teamEditorTitle.textContent = "Add Team";
  teamNameInput.value = "";

  teamEditLeague.value = adminTeamLeague.value;

  renderTeamEditorDivisions(adminTeamDivision.value);

  deleteTeamButton.hidden = true;
  teamFormMessage.hidden = true;

  teamEditor.hidden = false;
  addTeamButton.hidden = true;
}

function closeTeamEditor() {
  editingTeamId = null;

  teamEditor.hidden = true;
   addTeamButton.hidden = false;

  teamForm.reset();
  teamFormMessage.hidden = true;
}

addTeamButton.addEventListener("click", () => {
  openAddTeamEditor();
});

cancelTeamEdit.addEventListener("click", () => {
  closeTeamEditor();
});

teamEditLeague.addEventListener("change", () => {
  renderTeamEditorDivisions();
});

// ======================================================
// EDIT TEAM
// ======================================================

adminTeamList.addEventListener("click", (event) => {
  const editButton = event.target.closest(".admin-edit-team");

  if (!editButton) {
    return;
  }

  editingTeamId = editButton.dataset.teamId;

  const teamName = editButton.dataset.teamName;

  teamEditorTitle.textContent = "Edit Team";
  teamNameInput.value = teamName;

  teamEditLeague.value = adminTeamLeague.value;

  renderTeamEditorDivisions(adminTeamDivision.value);

  deleteTeamButton.hidden = false;
  teamFormMessage.hidden = true;

  teamEditor.hidden = false;
addTeamButton.hidden = true;

// Move the editor directly below the team being edited
const teamRow = editButton.closest(".admin-team-row");

teamRow.insertAdjacentElement("afterend", teamEditor);
});

// ======================================================
// SAVE TEAM
// ======================================================

teamForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = teamNameInput.value.trim();
  const league = teamEditLeague.value;
  const division = teamEditDivision.value;

  teamFormMessage.hidden = true;
  teamFormMessage.textContent = "";

  if (!name) {
    teamFormMessage.textContent = "Enter a team name.";
    teamFormMessage.hidden = false;
    return;
  }

  const saveButton = teamForm.querySelector('button[type="submit"]');

  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  let error;

  // Edit existing team
  if (editingTeamId) {
    const result = await supabaseClient
      .from("teams")
      .update({
        name,
        league,
        division,
      })
      .eq("id", editingTeamId);

    error = result.error;
  }

  // Add new team
  else {
    const result = await supabaseClient
      .from("teams")
      .insert({
        name,
        league,
        division,
      });

    error = result.error;
  }

  saveButton.disabled = false;
  saveButton.textContent = "Save Team";

  if (error) {
    console.error("Could not save team:", error);

    teamFormMessage.textContent =
      "Team could not be saved. Please try again.";

    teamFormMessage.hidden = false;
    return;
  }

  // Switch the main filters to wherever this team now belongs.
  adminTeamLeague.value = league;

  renderAdminTeamDivisions();

  adminTeamDivision.value = division;

  closeTeamEditor();
  await loadAdminTeams();
});

// ======================================================
// DELETE TEAM
// ======================================================

deleteTeamButton.addEventListener("click", async () => {
  if (!editingTeamId) {
    return;
  }

  const teamName = teamNameInput.value.trim();

  const confirmed = window.confirm(
    `Delete ${teamName}?\n\nThis should only be done when setting up a new season.`
  );

  if (!confirmed) {
    return;
  }

  teamFormMessage.hidden = true;
  teamFormMessage.textContent = "";

  deleteTeamButton.disabled = true;
  deleteTeamButton.textContent = "Checking...";

  // Check whether this team is still used in any games.
  const { count: homeGameCount, error: homeError } =
    await supabaseClient
      .from("games")
      .select("id", { count: "exact", head: true })
      .eq("home_team_id", editingTeamId);

  const { count: awayGameCount, error: awayError } =
    await supabaseClient
      .from("games")
      .select("id", { count: "exact", head: true })
      .eq("away_team_id", editingTeamId);

  if (homeError || awayError) {
    console.error(
      "Could not check team games:",
      homeError || awayError
    );

    teamFormMessage.textContent =
      "We couldn't check this team's schedule. Nothing was deleted.";

    teamFormMessage.hidden = false;

    deleteTeamButton.disabled = false;
    deleteTeamButton.textContent = "Delete Team";

    return;
  }

  const gameCount =
    (homeGameCount || 0) + (awayGameCount || 0);

  // Don't allow deletion while games still reference the team.
  if (gameCount > 0) {
    teamFormMessage.textContent =
      `This team is still connected to ${gameCount} game${gameCount === 1 ? "" : "s"}. Clear the season schedule before deleting the team.`;

    teamFormMessage.hidden = false;

    deleteTeamButton.disabled = false;
    deleteTeamButton.textContent = "Delete Team";

    return;
  }

  // Safe to delete.
  const { error } = await supabaseClient
    .from("teams")
    .delete()
    .eq("id", editingTeamId);

  deleteTeamButton.disabled = false;
  deleteTeamButton.textContent = "Delete Team";

  if (error) {
    console.error("Could not delete team:", error);

    teamFormMessage.textContent =
      "Team could not be deleted. Please try again.";

    teamFormMessage.hidden = false;

    return;
  }

  closeTeamEditor();
  await loadAdminTeams();
});

// ======================================================
// LOAD TEAMS
// ======================================================

async function loadAdminTeams() {
  const league = adminTeamLeague.value;
  const division = adminTeamDivision.value;

  adminTeamList.innerHTML = "";
  adminTeamList.hidden = false;
  adminTeamsEmpty.hidden = true;

  const { data: teams, error } = await supabaseClient
    .from("teams")
    .select("id, name, league, division")
    .eq("league", league)
    .eq("division", division)
    .order("name", { ascending: true });

  if (error) {
    console.error("Could not load teams:", error);

    adminTeamList.innerHTML = `
      <p class="admin-error">
        We couldn't load the teams.
      </p>
    `;

    return;
  }

  if (!teams || teams.length === 0) {
    adminTeamsEmpty.hidden = false;
    return;
  }

  renderAdminTeams(teams);
}


// ======================================================
// RENDER TEAMS
// ======================================================

function renderAdminTeams(teams) {
  adminTeamList.innerHTML = "";

  teams.forEach((team) => {
    const row = document.createElement("div");

    row.className = "admin-team-row";

    row.innerHTML = `
      <strong>${team.name}</strong>

      <button
        type="button"
        class="filter-btn admin-edit-team"
        data-team-id="${team.id}"
        data-team-name="${team.name}"
      >
        Edit
      </button>
    `;

    adminTeamList.appendChild(row);
  });
}


// ======================================================
// TEAM FILTER CHANGES
// ======================================================

adminTeamLeague.addEventListener("change", () => {
  renderAdminTeamDivisions();
  loadAdminTeams();
});

adminTeamDivision.addEventListener("change", () => {
  loadAdminTeams();
});

renderAdminTeamDivisions();

// ======================================================
// SCHEDULE MANAGER FILTERS
// ======================================================

const adminScheduleDivisions = {
  mens: ["Lower", "Middle", "Upper"],
  coed: ["Social", "Lower", "Middle/Upper"],
};

function renderAdminScheduleDivisions() {
  const league = adminScheduleLeague.value;

  adminScheduleDivision.innerHTML = "";

  adminScheduleDivisions[league].forEach((division) => {
    const option = document.createElement("option");

    option.value = division;
    option.textContent = division;

    adminScheduleDivision.appendChild(option);
  });
}


// ======================================================
// GAME EDITOR
// ======================================================

async function loadGameEditorTeams(
  selectedHomeTeamId = null,
  selectedAwayTeamId = null
) {
  const league = adminScheduleLeague.value;
  const division = adminScheduleDivision.value;

  gameHomeTeam.innerHTML = "";
  gameAwayTeam.innerHTML = "";

  const { data: teams, error } = await supabaseClient
    .from("teams")
    .select("id, name")
    .eq("league", league)
    .eq("division", division)
    .order("name", { ascending: true });

  if (error) {
    console.error("Could not load teams for game editor:", error);

    gameFormMessage.textContent =
      "We couldn't load the teams. Please try again.";

    gameFormMessage.hidden = false;
    return;
  }

  teams.forEach((team) => {
    const homeOption = document.createElement("option");
    homeOption.value = team.id;
    homeOption.textContent = team.name;

    if (String(team.id) === String(selectedHomeTeamId)) {
      homeOption.selected = true;
    }

    gameHomeTeam.appendChild(homeOption);

    const awayOption = document.createElement("option");
    awayOption.value = team.id;
    awayOption.textContent = team.name;

    if (String(team.id) === String(selectedAwayTeamId)) {
      awayOption.selected = true;
    }

    gameAwayTeam.appendChild(awayOption);
  });
}


async function openAddGameEditor() {
  editingGameId = null;
  // Move the editor back to its normal position for Add Game
  adminScheduleList.insertAdjacentElement("afterend", gameEditor);

  gameEditorTitle.textContent = "Add Game";

  gameForm.reset();
  gameFormMessage.hidden = true;
  deleteGameButton.hidden = true;

  await loadGameEditorTeams();

  gameEditor.hidden = false;
adminScheduleEmpty.hidden = true;
addGameButton.hidden = true;

gameEditor.scrollIntoView({
  behavior: "smooth",
  block: "start"
});
}

function closeGameEditor() {
  editingGameId = null;

  gameEditor.hidden = true;
  addGameButton.hidden = false;

  gameForm.reset();
  gameFormMessage.hidden = true;
}


addGameButton.addEventListener("click", () => {
  openAddGameEditor();
});


cancelGameEdit.addEventListener("click", () => {
  closeGameEditor();
});

// ======================================================
// EDIT GAME
// ======================================================

adminScheduleList.addEventListener("click", async (event) => {
  const editButton = event.target.closest(".admin-edit-game");

  if (!editButton) {
    return;
  }

  const gameId = editButton.dataset.gameId;

  gameFormMessage.hidden = true;
  gameFormMessage.textContent = "";

  // Get the complete game record from Supabase
  const { data: game, error } = await supabaseClient
    .from("games")
    .select(`
      id,
      game_date,
      game_time,
      location,
      home_team_id,
      away_team_id
    `)
    .eq("id", gameId)
    .single();

  if (error) {
    console.error("Could not load game:", error);
    window.alert("We couldn't load this game. Please try again.");
    return;
  }

  editingGameId = game.id;

  gameEditorTitle.textContent = "Edit Game";

  gameDateInput.value = game.game_date;

  // HTML time inputs want HH:MM instead of HH:MM:SS
  gameTimeInput.value = game.game_time
    ? game.game_time.slice(0, 5)
    : "";

  gameLocationInput.value = game.location || "";

  await loadGameEditorTeams(
    game.home_team_id,
    game.away_team_id
  );

  deleteGameButton.hidden = false;

  gameEditor.hidden = false;
adminScheduleEmpty.hidden = true;
addGameButton.hidden = true;

// Move the editor directly below the game being edited
const gameCard = editButton.closest(".admin-game-card");

gameCard.insertAdjacentElement("afterend", gameEditor);
});

// ======================================================
// SAVE GAME
// ======================================================

gameForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const gameDate = gameDateInput.value;
  const gameTime = gameTimeInput.value;
  const awayTeamId = gameAwayTeam.value;
  const homeTeamId = gameHomeTeam.value;
  const location = gameLocationInput.value.trim();

  gameFormMessage.hidden = true;
  gameFormMessage.textContent = "";

  // Make sure two different teams are selected
  if (homeTeamId === awayTeamId) {
    gameFormMessage.textContent =
      "Home and away teams must be different.";

    gameFormMessage.hidden = false;
    return;
  }

  const saveButton =
    gameForm.querySelector('button[type="submit"]');

  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  const gameData = {
    league: adminScheduleLeague.value,
    division: adminScheduleDivision.value,
    game_date: gameDate,
    game_time: gameTime,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    location: location,
  };

  let error;

  // Update an existing game
  if (editingGameId) {
    const result = await supabaseClient
      .from("games")
      .update(gameData)
      .eq("id", editingGameId);

    error = result.error;
  }

  // Create a new game
  else {
    const result = await supabaseClient
      .from("games")
      .insert(gameData);

    error = result.error;
  }

  saveButton.disabled = false;
  saveButton.textContent = "Save Game";

  if (error) {
    console.error("Could not save game:", error);

    // Our database already has duplicate-game protection.
    if (error.code === "23505") {
      gameFormMessage.textContent =
        "This game is already on the schedule.";
    } else {
      gameFormMessage.textContent =
        "Game could not be saved. Please try again.";
    }

    gameFormMessage.hidden = false;
    return;
  }

  closeGameEditor();
  await loadAdminSchedule();
});

// ======================================================
// DELETE GAME
// ======================================================

deleteGameButton.addEventListener("click", async () => {
  if (!editingGameId) {
    return;
  }

  const confirmed = window.confirm(
    "Delete this game?\n\nThis will permanently remove it from the schedule."
  );

  if (!confirmed) {
    return;
  }

  gameFormMessage.hidden = true;
  gameFormMessage.textContent = "";

  deleteGameButton.disabled = true;
  deleteGameButton.textContent = "Deleting...";

  const { error } = await supabaseClient
    .from("games")
    .delete()
    .eq("id", editingGameId);

  deleteGameButton.disabled = false;
  deleteGameButton.textContent = "Delete Game";

  if (error) {
    console.error("Could not delete game:", error);

    gameFormMessage.textContent =
      "Game could not be deleted. Please try again.";

    gameFormMessage.hidden = false;
    return;
  }

  closeGameEditor();
  await loadAdminSchedule();
});

// ======================================================
// LOAD ADMIN SCHEDULE
// ======================================================

async function loadAdminSchedule() {
  const league = adminScheduleLeague.value;
  const division = adminScheduleDivision.value;

  adminScheduleList.innerHTML = "";
  adminScheduleEmpty.hidden = true;

  const { data: games, error } = await supabaseClient
    .from("games")
    .select(`
      id,
      game_date,
      game_time,
      location,
      status,
      home_score,
      away_score,
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
    .order("game_date", { ascending: true })
    .order("game_time", { ascending: true });

  if (error) {
    console.error("Could not load schedule:", error);

    adminScheduleList.innerHTML = `
      <p class="admin-error">
        We couldn't load the schedule.
      </p>
    `;

    return;
  }

  if (!games || games.length === 0) {
    adminScheduleEmpty.hidden = false;
    return;
  }

  renderAdminSchedule(games);
}


// ======================================================
// RENDER ADMIN SCHEDULE
// ======================================================

function renderAdminSchedule(games) {
  adminScheduleList.innerHTML = "";

  games.forEach((game) => {
    const card = document.createElement("div");
    card.className = "admin-game-card";

    const date = new Date(`${game.game_date}T00:00:00`);

    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const formattedTime = formatAdminGameTime(game.game_time);
    const isFinal = game.status === "final";

const awayScoreDisplay = isFinal
  ? `<span class="admin-schedule-score">${game.away_score}</span>`
  : "";

const homeScoreDisplay = isFinal
  ? `<span class="admin-schedule-score">${game.home_score}</span>`
  : "";

const statusDisplay = isFinal
  ? `<div class="admin-game-status">Final</div>`
  : "";    

    card.innerHTML = `
      <div class="admin-game-meta">
        <div>
          <strong>${formattedDate}</strong>
          <span>${formattedTime}</span>
        </div>

        <span>${game.location || ""}</span>
      </div>

      <div class="admin-schedule-matchup">
        <div>
          <span class="admin-team-label">Away</span>
          <strong>${game.away_team?.name || "Away Team"}
          ${awayScoreDisplay}
          </strong>
        </div>
        

        <div>
          <span class="admin-team-label">Home</span>
          <strong>${game.home_team?.name || "Home Team"}
          ${homeScoreDisplay}
          </strong>
        </div>
      </div>
      ${statusDisplay}

      <button
        type="button"
        class="filter-btn admin-edit-game"
        data-game-id="${game.id}"
      >
        Edit Game
      </button>
    `;

    adminScheduleList.appendChild(card);
  });
}


// ======================================================
// SCHEDULE FILTER CHANGES
// ======================================================

adminScheduleLeague.addEventListener("change", () => {
  renderAdminScheduleDivisions();
  loadAdminSchedule();
});

adminScheduleDivision.addEventListener("change", () => {
  loadAdminSchedule();
});

renderAdminScheduleDivisions();

// ======================================================
// ADMIN DASHBOARD NAVIGATION
// ======================================================

function showAdminMenu() {
  adminMenu.hidden = false;

  scoresManager.hidden = true;
  teamsManager.hidden = true;
  scheduleManager.hidden = true;
}
adminMenuCards.forEach((button) => {
  button.classList.remove("active");
});

function showAdminManager(manager) {
  adminMenu.hidden = false;

  scoresManager.hidden = manager !== "scores";
  teamsManager.hidden = manager !== "teams";
  scheduleManager.hidden = manager !== "schedule";

  adminMenuCards.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.adminPage === manager
    );
  });
}

adminMenuCards.forEach((button) => {
  button.addEventListener("click", () => {
    const page = button.dataset.adminPage;

    if (page === "scores") {
  showAdminManager("scores");
  loadScoreGames();
}
if (page === "teams") {
   showAdminManager("teams");
  loadAdminTeams();
}
if (page === "schedule") {
  showAdminManager("schedule");
  loadAdminSchedule();
}
  });
});

initializeAdmin();