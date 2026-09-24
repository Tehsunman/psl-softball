// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL = "https://naalbruprafetbxwglof.supabase.co/rest/v1/";
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

initializeAdmin();