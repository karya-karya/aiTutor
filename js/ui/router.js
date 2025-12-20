// js/ui/router.js
import { loginUser, registerUser, loginWithGoogle, logoutUser, getSession, onAuthChange } from "../services/authService.js";
import { initChatUI, setTool } from "./chatUI.js";

let views = {};
let components = {};
let currentUser = null;

function showView(viewName) {
  Object.values(views).forEach((el) => el && el.classList.add("hidden"));
  views[viewName]?.classList.remove("hidden");

  // sidebar görünürlüğü için body class
  if (viewName === "dashboard" || viewName === "workspace") {
    document.body.classList.remove("public");
  } else {
    document.body.classList.add("public");
  }
}

function showAuthError(msg) {
  if (!components.authError) return;
  if (!msg) {
    components.authError.classList.add("hidden");
    components.authError.textContent = "";
    return;
  }
  components.authError.textContent = msg;
  components.authError.classList.remove("hidden");
}

function setAuthTab(mode) {
  const isLogin = mode === "login";
  components.tabLogin?.classList.toggle("active", isLogin);
  components.tabRegister?.classList.toggle("active", !isLogin);
  components.loginForm?.classList.toggle("hidden", !isLogin);
  components.registerForm?.classList.toggle("hidden", isLogin);
  showAuthError("");
}

function setProfileUI(session) {
  // session.user.user_metadata: { full_name, role } (supabase signUp options.data)
  const user = session?.user ?? null;
  const meta = user?.user_metadata ?? {};
  const name = meta.full_name || user?.email || "User";
  const role = meta.role || "Student";

  const initial = String(name).trim().slice(0, 1).toUpperCase();
  if (components.profileAvatar) components.profileAvatar.textContent = initial || "U";
  if (components.profileName) components.profileName.textContent = name;
  if (components.profileRole) components.profileRole.textContent = role;

  currentUser = user;
}

export function showLanding() {
  showView("landing");
}

export function showAuth(mode = "login") {
  showView("auth");
  setAuthTab(mode);
}

export function showDashboard() {
  if (!currentUser) return showLanding();
  showView("dashboard");
}

export function openTool(mode) {
  if (!currentUser) return showLanding();
  showView("workspace");
  setTool(mode);
}

export async function logout() {
  await logoutUser();
}

async function bootAuth() {
  const session = await getSession();
  if (session) {
    setProfileUI(session);
    showDashboard();
  } else {
    showLanding();
  }

  // realtime auth updates
  onAuthChange((newSession) => {
    if (newSession) {
      setProfileUI(newSession);
      showDashboard();
    } else {
      currentUser = null;
      showLanding();
    }
  });
}

function bindLandingButtons() {
  document.getElementById("btn-go-login")?.addEventListener("click", () => showAuth("login"));
  document.getElementById("btn-go-register")?.addEventListener("click", () => showAuth("register"));
  document.getElementById("btn-hero-start")?.addEventListener("click", () => showAuth("register"));
  document.getElementById("btn-hero-login")?.addEventListener("click", () => showAuth("login"));
}

function bindAuthButtons() {
  components.tabLogin?.addEventListener("click", () => showAuth("login"));
  components.tabRegister?.addEventListener("click", () => showAuth("register"));

  document.getElementById("btn-back-home")?.addEventListener("click", () => showLanding());
  document.getElementById("btn-back-home-2")?.addEventListener("click", () => showLanding());

  document.getElementById("btn-google-login")?.addEventListener("click", async () => {
    const { error } = await loginWithGoogle();
    if (error) showAuthError(error.message);
  });

  components.loginForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email")?.value?.trim();
    const pass = document.getElementById("login-password")?.value;

    const { error } = await loginUser(email, pass);
    if (error) showAuthError(error.message);
    else showDashboard();
  });

  components.registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("reg-name")?.value?.trim();
    const email = document.getElementById("reg-email")?.value?.trim();
    const password = document.getElementById("reg-password")?.value;
    const confirm = document.getElementById("reg-confirm")?.value;
    const role = document.querySelector("input[name='role']:checked")?.value || "student";

    if (password !== confirm) return showAuthError("Passwords do not match.");

    const { error } = await registerUser({ name, email, password, role });
    if (error) return showAuthError(error.message);

    showAuthError("✅ Account created. Now login (or check email confirmation).");
    showAuth("login");
  });
}

export function initRouter() {
  views = {
    landing: document.getElementById("landing-view"),
    auth: document.getElementById("auth-view"),
    dashboard: document.getElementById("dashboard-view"),
    workspace: document.getElementById("workspace-view"),
  };

  components = {
    loginForm: document.getElementById("login-form"),
    registerForm: document.getElementById("register-form"),
    tabLogin: document.getElementById("tab-login"),
    tabRegister: document.getElementById("tab-register"),
    authError: document.getElementById("auth-error"),
    profileAvatar: document.getElementById("profile-avatar"),
    profileName: document.getElementById("profile-name"),
    profileRole: document.getElementById("profile-role"),
  };

  // Chat UI
  initChatUI();

  // Inline onclick’ler için globals
  window.showLanding = showLanding;
  window.showAuth = showAuth;
  window.showDashboard = showDashboard;
  window.openTool = openTool;
  window.logout = logout;

  bindLandingButtons();
  bindAuthButtons();
  bootAuth();
}
