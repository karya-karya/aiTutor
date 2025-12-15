// ------------------- SUPABASE AYARLARI -------------------
const SUPABASE_URL = 'BURAYA_SUPABASE_PROJECT_URL_GELECEK';
const SUPABASE_KEY = 'BURAYA_SUPABASE_ANON_KEY_GELECEK';

// Supabase İstemcisini Başlat
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

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

const btnGoogleLogin = document.getElementById('btn-google-login');

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

// ------------------- STORAGE & HELPERS -------------------
const USERS_KEY = 'linguaai_users';

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

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
  landingView.classList.add('hidden');
  authView.classList.add('hidden');
  dashboardView.classList.add('hidden');
  workspaceView.classList.add('hidden');
  viewEl.classList.remove('hidden');
}

// ------------------- VIEW CONTROL -------------------
function showLanding() {
  document.body.classList.add('public');
  clearAuthError();
  showOnly(landingView);
}

function showAuth(whichTab = 'login') {
  document.body.classList.add('public');
  clearAuthError();
  showOnly(authView);
  activateTab(whichTab);
}

function showDashboard() {
  if (!currentUser) return showLanding();
  document.body.classList.remove('public');
  showOnly(dashboardView);
}
window.showDashboard = showDashboard;

// ------------------- EVENT LISTENERS -------------------
if(btnGoLogin) btnGoLogin.addEventListener('click', () => showAuth('login'));
if(btnHeroLogin) btnHeroLogin.addEventListener('click', () => showAuth('login'));
if(btnGoRegister) btnGoRegister.addEventListener('click', () => showAuth('register'));
if(btnHeroStart) btnHeroStart.addEventListener('click', () => showAuth('register'));
if (btnFooterStart) btnFooterStart.addEventListener('click', () => showAuth('register'));
if(btnBackHome) btnBackHome.addEventListener('click', () => showLanding());
if(btnBackHome2) btnBackHome2.addEventListener('click', () => showLanding());

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

// ------------------- MANUAL LOGIN / REGISTER -------------------
// (Bu kısım local storage kullanmaya devam ediyor, istersen burayı da Supabase'e bağlayabiliriz)
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return showAuthError('Invalid email or password.');
  loginSuccess(user);
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  if (password !== confirm) return showAuthError('Passwords do not match.');
  
  const users = loadUsers();
  if (users.some(u => u.email === email)) return showAuthError('Email already registered.');
  
  const newUser = { name, email, password, role: 'student' };
  users.push(newUser);
  saveUsers(users);
  loginSuccess(newUser);
});

// ------------------- SUPABASE GOOGLE LOGIN -------------------

// 1. Google Butonuna Tıklanınca
if (btnGoogleLogin) {
  btnGoogleLogin.addEventListener('click', async () => {
    if (!supabase) return alert("Supabase bağlantısı yapılmadı! Kodun başındaki URL ve KEY'i kontrol et.");

    // Supabase ile Google Girişi Başlat
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Giriş yaptıktan sonra kullanıcıyı bu sayfaya geri gönder
        redirectTo: window.location.href 
      }
    });

    if (error) {
      console.error('Login Hatası:', error);
      showAuthError(error.message);
    }
    // Başarılı ise kullanıcı otomatik olarak Google'a yönlenir.
  });
}

// 2. Sayfa Yüklendiğinde Oturum Kontrolü (Geri dönüşü yakalamak için)
async function checkSupabaseSession() {
  if (!supabase) return;

  // Mevcut oturumu al
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // Eğer kullanıcı Google'dan dönmüşse ve oturum varsa:
    console.log("Supabase kullanıcısı bulundu:", session.user);

    const userMetadata = session.user.user_metadata;
    
    // Supabase kullanıcısını bizim sistem formatına çevir
    const adaptedUser = {
      name: userMetadata.full_name || session.user.email,
      email: session.user.email,
      role: 'student', // Varsayılan rol
      avatar: userMetadata.avatar_url
    };

    // Dashboard'u aç
    loginSuccess(adaptedUser);
  }
}

// ------------------- LOGIN SUCCESS -------------------
function loginSuccess(user) {
  currentUser = user;
  
  // Profil UI güncelle
  if (user.avatar) {
    // Google fotosu varsa onu göster (basit bir img etiketi eklemesi yapılabilir css ile, şimdilik text)
    profileAvatar.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;">`;
    profileAvatar.style.background = 'transparent';
  } else {
    profileAvatar.textContent = (user.name?.charAt(0) || 'U').toUpperCase();
  }
  
  profileName.textContent = user.name || 'User';
  profileRole.textContent = capitalize(user.role || 'student');

  showDashboard();
}

// ------------------- LOGOUT -------------------
window.logout = async function() {
  const ok = confirm('Log out?');
  if (!ok) return;

  // Supabase'den çıkış yap
  if (supabase) {
    await supabase.auth.signOut();
  }

  currentUser = null;
  showLanding();
  // Sayfayı yenile ki session temizlensin
  window.location.reload();
};

// ------------------- TOOL NAV & CHAT (Aynı Kalıyor) -------------------
function openTool(mode) {
  if (!currentUser) return showLanding();
  currentMode = mode;
  showOnly(workspaceView);
  chatWindow.innerHTML = '';
  toolTitle.innerText = mode === 'chat' ? "Free Conversation" : "AI Tool";
  addMessage("Hello! Ready to practice.", 'ai');
}
window.openTool = openTool;

const userInputElem = document.getElementById('user-input');
if(userInputElem) {
    userInputElem.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function sendMessage() {
  const input = document.getElementById('user-input');
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  input.value = '';
  setTimeout(() => addMessage("This is a demo AI response.", 'ai'), 800);
}
window.sendMessage = sendMessage;

function addMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender === 'user' ? 'user-msg' : 'ai-msg');
  const icon = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
  msgDiv.innerHTML = `<div class="msg-avatar">${icon}</div><div class="msg-bubble">${text}</div>`;
  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ------------------- INIT -------------------
(function init() {
  // Önce Supabase oturumunu kontrol et
  if (supabase) {
    checkSupabaseSession();
  } else {
    // Supabase yoksa standart akış
    const saved = JSON.parse(localStorage.getItem('linguaai_current_user')); // eski usul kontrol
    if (saved) loginSuccess(saved);
    else showLanding();
  }
  
  // Render role fields
  const rolePills = document.getElementById('role-pills');
  if(rolePills) {
      rolePills.addEventListener('change', (e) => {
         if (e.target.name === 'role') {
            const roleFields = document.getElementById('role-fields');
            roleFields.innerHTML = e.target.value === 'student' ? 
               '<div class="form-group"><label>Level</label><input type="text" placeholder="A1/A2..."></div>' : '';
         }
      });
  }
})();
