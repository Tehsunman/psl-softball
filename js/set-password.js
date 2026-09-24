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

const passwordForm = document.querySelector("#password-form");
const newPasswordInput = document.querySelector("#new-password");
const confirmPasswordInput = document.querySelector("#confirm-password");
const passwordMessage = document.querySelector("#password-message");


// ======================================================
// SET PASSWORD
// ======================================================

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  passwordMessage.hidden = true;
  passwordMessage.textContent = "";

  const password = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (password !== confirmPassword) {
    passwordMessage.textContent = "The passwords do not match.";
    passwordMessage.hidden = false;
    return;
  }

  if (password.length < 8) {
    passwordMessage.textContent =
      "Your password must be at least 8 characters.";
    passwordMessage.hidden = false;
    return;
  }

  const { error } = await supabaseClient.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error(error);

    passwordMessage.textContent =
      "We couldn't save your password. Please request a new link and try again.";

    passwordMessage.hidden = false;
    return;
  }

  window.location.href = "admin.html";
});