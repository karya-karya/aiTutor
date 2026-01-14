// js/ui/router.js
import {
  loginUser,
  registerUser,
  logoutUser,
  loginWithGoogle,
  getSession,
} from "../services/authService.js";

import { initChatUI, setTool } from "./chatUI.js";

const $ = (id) => document.getElementById(id);

function hideAllViews() {
  ["landing-view", "auth-view", "dashboard-view", "workspace-view", "admin-view"].forEach(
    (id) => $(id)?.classList.add("hidden")
  );
}

function showView(id) {
  hideAllViews();
  $(id)?.classList.remove("hidden");
}

function setAuthTab(tab) {
  const loginForm = $("login-form");
  const regForm = $("register-form");
  const tabLogin = $("tab-login");
  const tabReg = $("tab-register");

  if (tab === "register") {
    loginForm?.classList.add("hidden");
    regForm?.classList.remove("hidden");
    tabLogin?.classList.remove("active");
    tabReg?.classList.add("active");
  } else {
    regForm?.classList.add("hidden");
    loginForm?.classList.remove("hidden");
    tabReg?.classList.remove("active");
    tabLogin?.classList.add("active");
  }
}

export function initRouter() {
  // Initialize chat UI
  initChatUI();

  // ---------------------------
  // Global functions (onclick)
  // ---------------------------
  window.showLanding = () => {
    document.body.classList.add("public");
    showView("landing-view");
  };

  window.showAuth = (tab = "login") => {
    showView("auth-view");
    setAuthTab(tab);
  };

  window.switchAuthTab = (tab) => setAuthTab(tab);

  // Backend olmadan UI görmek için (Preview)
  window.previewUI = (role) => {
    document.body.classList.remove("public");

    // Sidebar davranışı
    if (role === "admin") document.body.classList.add("no-sidebar");
    else document.body.classList.remove("no-sidebar");

    // Sahte profil
    const name =
      role === "teacher" ? "Teacher Demo" : role === "admin" ? "Admin Demo" : "Student Demo";
    const avatar = (name?.[0] || "U").toUpperCase();

    document.getElementById("profile-name") &&
      (document.getElementById("profile-name").textContent = name);
    document.getElementById("profile-role") &&
      (document.getElementById("profile-role").textContent = role);
    document.getElementById("profile-avatar") &&
      (document.getElementById("profile-avatar").textContent = avatar);

    // Hangi ekran
    if (role === "admin") {
      showView("admin-view");
    } else {
      showView("workspace-view");
      setTool("chat");
    }

    // Teacher area sadece teacher'da görünsün
    const rightPanel = document.getElementById("ws-right-panel");
    if (rightPanel) rightPanel.style.display = role === "teacher" ? "block" : "none";
  };

  // Role-aware dashboard
  window.showDashboard = async () => {
    document.body.classList.remove("public");

    const session = await getSession();
    const role = session?.user?.user_metadata?.role || "student";
    const name = session?.user?.user_metadata?.full_name || "User";

    // Profil kutusu (sidebar)
    const avatar = (name?.[0] || "U").toUpperCase();
    document.getElementById("profile-name") &&
      (document.getElementById("profile-name").textContent = name);
    document.getElementById("profile-role") &&
      (document.getElementById("profile-role").textContent = role);
    document.getElementById("profile-avatar") &&
      (document.getElementById("profile-avatar").textContent = avatar);

    // Admin: sidebar kapalı
    if (role === "admin") {
      document.body.classList.add("no-sidebar");
      showView("admin-view");
      return;
    }

    // Teacher/Student: sidebar açık
    document.body.classList.remove("no-sidebar");
    showView("dashboard-view");
  };

  window.openTool = (tool) => {
    showView("workspace-view");
    setTool(tool);
  };

  window.logout = async () => {
    await logoutUser();
    document.body.classList.add("public");
    window.showLanding();
  };

  // ---------------------------
  // Auth form bindings
  // ---------------------------
  $("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = $("login-email")?.value?.trim();
    const pass = $("login-password")?.value;

    const errorEl = $("auth-error");
    errorEl?.classList.add("hidden");

    try {
      const { error } = await loginUser(email, pass);
      if (error) {
        errorEl.textContent = error.message;
        errorEl?.classList.remove("hidden");
        return;
      }
      window.showDashboard();
    } catch (err) {
      errorEl.textContent = "Login failed: " + err.message;
      errorEl?.classList.remove("hidden");
    }
  });

  $("register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = $("reg-name")?.value?.trim();
    const email = $("reg-email")?.value?.trim();
    const pass = $("reg-password")?.value;
    const confirm = $("reg-confirm")?.value;
    const role = document.querySelector('input[name="role"]:checked')?.value || "student";

    const errorEl = $("auth-error");
    errorEl?.classList.add("hidden");

    if (pass !== confirm) {
      errorEl.textContent = "Passwords do not match.";
      errorEl?.classList.remove("hidden");
      return;
    }

    try {
      const { error } = await registerUser({ name, email, password: pass, role });
      if (error) {
        errorEl.textContent = error.message;
        errorEl?.classList.remove("hidden");
        return;
      }

      alert("Registration successful! Please check your email to verify your account, then login.");
      window.showAuth("login");
    } catch (err) {
      errorEl.textContent = "Registration failed: " + err.message;
      errorEl?.classList.remove("hidden");
    }
  });

  // Google login button
  $("btn-google-login")?.addEventListener("click", async () => {
    try {
      const { error } = await loginWithGoogle();
      if (error) alert("Google login failed: " + error.message);
    } catch (err) {
      alert("Google login error: " + err.message);
    }
  });

  // Landing page buttons
  $("btn-go-login")?.addEventListener("click", () => window.showAuth("login"));
  $("btn-go-register")?.addEventListener("click", () => window.showAuth("register"));
  $("btn-hero-start")?.addEventListener("click", () => window.showAuth("register"));
  $("btn-hero-login")?.addEventListener("click", () => window.showAuth("login"));

  // Back to home buttons
  $("btn-back-home")?.addEventListener("click", () => window.showLanding());
  $("btn-back-home-2")?.addEventListener("click", () => window.showLanding());

  // Auth tab switching
  $("tab-login")?.addEventListener("click", () => setAuthTab("login"));
  $("tab-register")?.addEventListener("click", () => setAuthTab("register"));

  // Start on landing page
  window.showLanding();
}
