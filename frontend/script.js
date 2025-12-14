// ------------------- SELECTORS -------------------
const landingView = document.getElementById('landing-view');
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const workspaceView = document.getElementById('workspace-view');

const toolTitle = document.getElementById('tool-title');
const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const correctionBox = document.getElementById('correction-box');
const correctionText = document.getElementById('correction-text');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const authError = document.getElementById('auth-error');
const roleFields = document.getElementById('role-fields');

const profileAvatar = document.getElementById('profile-avatar');
const profileName = document.getElementById('profile-name');
const profileRole = document.getElementById('profile-role');

let currentMode = 'chat';
let currentUser = null;

// Landing buttons
const btnGoLogin = document.getElementById('btn-go-login');
const btnGoRegister = document.getElementById('btn-go-register');
const btnHeroStart = document.getElementById('btn-hero-start');
const btnHeroLogin = document.getElementById('btn-hero-login');
const btnFooterStart = document.getElementById('btn-footer-start');

const btnBackHome = document.getElementById('btn-back-home');
const btnBackHome2 = document.getElementById('btn-back-home-2');

// ------------------- STORAGE -------------------
const USERS_KEY = 'linguaai_users';
const CURRENT_KEY = 'linguaai_current_user';

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(user));
}

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY)); }
  catch { return null; }
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_KEY);
}

// ------------------- HELPERS -------------------
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

function showAuthError(msg) {
  authError.textContent = msg;
  authError.classList.remove('hidden');
}
function clearAuthError() {
  authError.textContent = '';
  authError.classList.add('hidden');
}

function showOnly(viewEl) {
  // hide all
  landingView.classList.add('hidden');
  authView.classList.add('hidden');
  dashboardView.classList.add('hidden');
  workspaceView.classList.add('hidden');

  // show chosen
  viewEl.classList.remove('hidden');
}

// ------------------- VIEW CONTROL -------------------
function showLanding() {
  document.body.classList.add('public'); // sidebar gizli
  clearAuthError();
  showOnly(landingView);
}

function showAuth(whichTab = 'login') {
  document.body.classList.add('public'); // sidebar gizli
  clearAuthError();
  showOnly(authView);
  activateTab(whichTab);
}

function showDashboard() {
  if (!currentUser) {
    showLanding();
    return;
  }
  document.body.classList.remove('public'); // sidebar göster
  showOnly(dashboardView);
}
window.showDashboard = showDashboard;

// ------------------- LANDING EVENTS -------------------
btnGoLogin.addEventListener('click', () => showAuth('login'));
btnHeroLogin.addEventListener('click', () => showAuth('login'));

btnGoRegister.addEventListener('click', () => showAuth('register'));
btnHeroStart.addEventListener('click', () => showAuth('register'));
if (btnFooterStart) btnFooterStart.addEventListener('click', () => showAuth('register'));


btnBackHome.addEventListener('click', () => showLanding());
btnBackHome2.addEventListener('click', () => showLanding());

// ------------------- AUTH TABS -------------------
function activateTab(which) {
  clearAuthError();

  if (which === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  } else {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }
}

tabLogin.addEventListener('click', () => activateTab('login'));
tabRegister.addEventListener('click', () => activateTab('register'));

// ------------------- ROLE FIELDS -------------------
function renderRoleFields(role) {
  if (role === 'student') {
    roleFields.innerHTML = `
      <div class="form-group">
        <label>Level (optional)</label>
        <input type="text" id="reg-level" placeholder="A1 / A2 / B1 / B2 / C1..." />
      </div>
    `;
  } else if (role === 'teacher') {
    roleFields.innerHTML = `
      <div class="form-group">
        <label>Department (optional)</label>
        <input type="text" id="reg-dept" placeholder="e.g., Speaking, IELTS, Grammar..." />
      </div>
    `;
  } else {
    roleFields.innerHTML = `
      <div class="form-group">
        <label>Admin Key (demo)</label>
        <input type="password" id="reg-adminkey" placeholder="Enter admin key" />
      </div>
    `;
  }
}

document.getElementById('role-pills').addEventListener('change', (e) => {
  if (e.target && e.target.name === 'role') renderRoleFields(e.target.value);
});

// ------------------- LOGIN / REGISTER -------------------
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearAuthError();

  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return showAuthError('Invalid email or password.');

  loginSuccess(user);
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  clearAuthError();

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;

  const role = document.querySelector('input[name="role"]:checked')?.value || 'student';

  if (!name || !email || !password) return showAuthError('Please fill in all required fields.');
  if (password !== confirm) return showAuthError('Passwords do not match.');

  // Admin key demo (istersen kaldır)
  if (role === 'admin') {
    const adminKey = document.getElementById('reg-adminkey')?.value || '';
    if (adminKey !== 'ADMIN123') return showAuthError('Invalid Admin Key. (Demo key: ADMIN123)');
  }

  const users = loadUsers();
  if (users.some(u => u.email === email)) return showAuthError('This email is already registered.');

  const level = document.getElementById('reg-level')?.value?.trim() || '';
  const dept = document.getElementById('reg-dept')?.value?.trim() || '';

  const newUser = { name, email, password, role, level, dept };
  users.push(newUser);
  saveUsers(users);

  loginSuccess(newUser);
});

function loginSuccess(user) {
  currentUser = user;
  setCurrentUser(user);

  // profile ui
  profileAvatar.textContent = (user.name?.charAt(0) || 'U').toUpperCase();
  profileName.textContent = user.name || 'User';
  profileRole.textContent = capitalize(user.role || 'student');

  showDashboard();
}

// ------------------- LOGOUT -------------------
function logout() {
  if (!currentUser) return showLanding();
  const ok = confirm('Log out?');
  if (!ok) return;

  currentUser = null;
  clearCurrentUser();
  showLanding();
}
window.logout = logout;

// ------------------- TOOL NAV -------------------
function openTool(mode) {
  if (!currentUser) return showLanding();

  currentMode = mode;
  showOnly(workspaceView);

  chatWindow.innerHTML = '';

  if (mode === 'chat') {
    toolTitle.innerText = "Free Conversation";
    addMessage("Hello! I'm ready to chat about anything. How was your day?", 'ai');
  } else if (mode === 'interview') {
    toolTitle.innerText = "Mock Interview Simulation";
    addMessage("Welcome to the interview session. Could you please introduce yourself briefly?", 'ai');
  } else if (mode === 'grammar') {
    toolTitle.innerText = "Grammar Fixer";
    addMessage("Paste your text here, and I will correct your grammar mistakes.", 'ai');
  } else if (mode === 'tutor') {
    toolTitle.innerText = "Topic Explainer";
    addMessage("Which topic or grammar rule would you like me to explain?", 'ai');
  }
}
window.openTool = openTool;

// ------------------- CHAT -------------------
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const text = userInput.value.trim();
  if (text === "") return;

  addMessage(text, 'user');
  userInput.value = '';

  showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();
    generateAIResponse(text);
  }, 900);
}
window.sendMessage = sendMessage;

function addMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender === 'user' ? 'user-msg' : 'ai-msg');

  const icon = sender === 'user'
    ? '<i class="fa-solid fa-user"></i>'
    : '<i class="fa-solid fa-robot"></i>';

  msgDiv.innerHTML = `
    <div class="msg-avatar">${icon}</div>
    <div class="msg-bubble">${text}</div>
  `;

  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function generateAIResponse(text) {
  const lowerText = text.toLowerCase();
  let response = "";
  let correction = null;

  if (lowerText.includes("i goes")) {
    correction = "Correction: Use 'I go' instead of 'I goes'.";
  }

  if (currentMode === 'interview') {
    response = "That's a good start. Can you tell me about a challenge you faced in your previous projects?";
  } else if (currentMode === 'grammar') {
    response = correction
      ? "I found a mistake. See the correction above. Would you like more examples?"
      : "Your sentence looks correct! Good job. Send me another one.";
  } else if (currentMode === 'tutor') {
    response = "Tell me the exact grammar topic, and I’ll explain it with examples.";
  } else {
    response = lowerText.includes("hello")
      ? "Hi there! What's on your mind?"
      : "That is interesting! Tell me more about it.";
  }

  if (correction) {
    correctionText.innerText = correction;
    correctionBox.classList.remove('hidden');
    setTimeout(() => correctionBox.classList.add('hidden'), 5000);
  }

  addMessage(response, 'ai');
}

function showTypingIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.classList.add('message', 'ai-msg');
  indicator.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
    <div class="msg-bubble" style="font-style:italic; color:#999;">Thinking...</div>
  `;
  chatWindow.appendChild(indicator);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

// ------------------- EXPORT (demo) -------------------
function exportChat() {
  const bubbles = [...document.querySelectorAll('.msg-bubble')].map(b => b.innerText);
  const text = bubbles.join('\n\n');

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'chat_export.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}
window.exportChat = exportChat;

// ------------------- INIT -------------------
(function init() {
  renderRoleFields('student');

  const saved = getCurrentUser();
  if (saved) {
    loginSuccess(saved);  // direkt dashboard
  } else {
    showLanding();        // ilk giriş: public ana sayfa
  }
})();
