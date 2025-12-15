// ================================================================
const SUPABASE_URL = 'https://haowbfhlmhgwjgpgbtyn.supabase.co; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhhb3diZmhsbWhnd2pncGdidHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTk0MDgsImV4cCI6MjA4MTM3NTQwOH0.oc2LfHXXTRo8YPXrgpbxV6Ts6jvKNOFaaDR15ay9H0A'; 

// ================================================================
// 2. SUPABASE BAĞLANTISI (Hata Korumalı)
// ================================================================
let supabase = null;

try {
  if (SUPABASE_URL && SUPABASE_KEY && window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase bağlantısı hazır.");
  } else {
    console.warn("Supabase anahtarları eksik! Site Demo modunda çalışacak.");
  }
} catch (err) {
  console.error("Supabase başlatılamadı:", err);
}

// ================================================================
// 3. SEÇİCİLER (HTML Elemanlarını Seçiyoruz)
// ================================================================
const views = {
  landing: document.getElementById('landing-view'),
  auth: document.getElementById('auth-view'),
  dashboard: document.getElementById('dashboard-view'),
  workspace: document.getElementById('workspace-view')
};

const components = {
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  tabLogin: document.getElementById('tab-login'),
  tabRegister: document.getElementById('tab-register'),
  authError: document.getElementById('auth-error'),
  roleFields: document.getElementById('role-fields'),
  profileAvatar: document.getElementById('profile-avatar'),
  profileName: document.getElementById('profile-name'),
  profileRole: document.getElementById('profile-role'),
  chatWindow: document.getElementById('chat-window'),
  userInput: document.getElementById('user-input'),
  toolTitle: document.getElementById('tool-title'),
  correctionBox: document.getElementById('correction-box'),
  correctionText: document.getElementById('correction-text'),
  btnGoogle: document.getElementById('btn-google-login')
};

// ================================================================
// 4. YARDIMCI FONKSİYONLAR
// ================================================================
function showView(viewName) {
  // Tüm ekranları gizle
  Object.values(views).forEach(el => el && el.classList.add('hidden'));
  
  // İstenen ekranı göster
  if (views[viewName]) {
    views[viewName].classList.remove('hidden');
  }

  // Sidebar kontrolü
  if (viewName === 'dashboard' || viewName === 'workspace') {
    document.body.classList.remove('public');
  } else {
    document.body.classList.add('public');
  }
}

function showAuthError(msg) {
  if (components.authError) {
    components.authError.textContent = msg;
    components.authError.classList.remove('hidden');
  }
}

function clearAuthError() {
  if (components.authError) {
    components.authError.textContent = '';
    components.authError.classList.add('hidden');
  }
}

// Kullanıcıyı LocalStorage'dan çekme (Demo modu için)
function getLocalUsers() {
  return JSON.parse(localStorage.getItem('linguaai_users')) || [];
}

function saveLocalUser(user) {
  const users = getLocalUsers();
  users.push(user);
  localStorage.setItem('linguaai_users', JSON.stringify(users));
}

let currentUser = null; // Aktif kullanıcı

// ================================================================
// 5. GLOBAL FONKSİYONLAR (HTML'deki onclick="..." için gerekli)
// ================================================================

// 5.1. Dashboard'a Geçiş
window.showDashboard = function() {
  if (!currentUser) {
    window.showLanding();
    return;
  }
  showView('dashboard');
};

// 5.2. Landing Sayfasına Dönüş
window.showLanding = function() {
  showView('landing');
};

// 5.3. Auth Sayfasını Aç (Login/Register Tabları)
window.showAuth = function(tab) {
  clearAuthError();
  showView('auth');
  
  if (tab === 'login') {
    components.tabLogin.classList.add('active');
    components.tabRegister.classList.remove('active');
    components.loginForm.classList.remove('hidden');
    components.registerForm.classList.add('hidden');
  } else {
    components.tabRegister.classList.add('active');
    components.tabLogin.classList.remove('active');
    components.registerForm.classList.remove('hidden');
    components.loginForm.classList.add('hidden');
  }
};

// 5.4. Çıkış Yap
window.logout = async function() {
  if (confirm('Çıkış yapmak istiyor musunuz?')) {
    if (supabase) await supabase.auth.signOut();
    currentUser = null;
    window.location.reload(); // Sayfayı yenile
  }
};

// 5.5. Araçları Aç (Chat, Grammar vb.)
window.openTool = function(mode) {
  if (!currentUser) return window.showLanding();
  
  showView('workspace');
  components.chatWindow.innerHTML = ''; // Sohbeti temizle
  
  let title = "Tool";
  let welcomeMsg = "Hello!";
  
  if (mode === 'chat') { title = "Free Conversation"; welcomeMsg = "Let's chat about anything!"; }
  else if (mode === 'interview') { title = "Mock Interview"; welcomeMsg = "Tell me about yourself."; }
  else if (mode === 'grammar') { title = "Grammar Fixer"; welcomeMsg = "Paste your text here."; }
  else if (mode === 'tutor') { title = "Topic Explainer"; welcomeMsg = "Ask me a grammar rule."; }
  
  components.toolTitle.innerText = title;
  addMessage(welcomeMsg, 'ai');
};

// 5.6. Mesaj Gönderme
window.sendMessage = function() {
  const text = components.userInput.value.trim();
  if (!text) return;
  
  addMessage(text, 'user');
  components.userInput.value = '';
  
  // Yapay Zeka Cevap Simülasyonu
  setTimeout(() => {
    addMessage("This is a demo AI response (Backend not connected).", 'ai');
  }, 1000);
};

// 5.7. Export
window.exportChat = function() {
  alert("Export feature is coming soon!");
};

// Yardımcı: Mesaj Ekleme
function addMessage(text, sender) {
  const div = document.createElement('div');
  div.className = `message ${sender === 'user' ? 'user-msg' : 'ai-msg'}`;
  
  const icon = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
  
  div.innerHTML = `
    <div class="msg-avatar">${icon}</div>
    <div class="msg-bubble">${text}</div>
  `;
  
  components.chatWindow.appendChild(div);
  components.chatWindow.scrollTop = components.chatWindow.scrollHeight;
}

// ================================================================
// 6. EVENT LISTENERS (Buton Tıklamaları)
// ================================================================
document.addEventListener('DOMContentLoaded', () => {
  
  // Landing Butonları
  document.getElementById('btn-go-login')?.addEventListener('click', () => window.showAuth('login'));
  document.getElementById('btn-go-register')?.addEventListener('click', () => window.showAuth('register'));
  document.getElementById('btn-hero-start')?.addEventListener('click', () => window.showAuth('register'));
  document.getElementById('btn-hero-login')?.addEventListener('click', () => window.showAuth('login'));
  
  document.getElementById('btn-back-home')?.addEventListener('click', () => window.showLanding());
  document.getElementById('btn-back-home-2')?.addEventListener('click', () => window.showLanding());

  // Tab Geçişleri
  components.tabLogin?.addEventListener('click', () => window.showAuth('login'));
  components.tabRegister?.addEventListener('click', () => window.showAuth('register'));

  // Rol Değişimi (Öğrenci/Öğretmen inputları)
  document.getElementById('role-pills')?.addEventListener('change', (e) => {
    if (e.target.name === 'role' && components.roleFields) {
       components.roleFields.innerHTML = e.target.value === 'student' 
        ? '<div class="form-group"><label>Level</label><input type="text" placeholder="A1, B2..."></div>' 
        : '';
    }
  });

  // ---------------------------------------------
  // GOOGLE LOGIN (SUPABASE)
  // ---------------------------------------------
  if (components.btnGoogle) {
    components.btnGoogle.addEventListener('click', async () => {
      // 1. Supabase varsa gerçek giriş yap
      if (supabase) {
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.href }
          });
          if (error) throw error;
        } catch (err) {
          alert("Google girişi hatası: " + err.message);
        }
      } 
      // 2. Supabase yoksa Demo girişi yap
      else {
        alert("Supabase anahtarları girilmediği için DEMO girişi yapılıyor.");
        loginSuccess({
          email: "demo@google.com",
          name: "Demo Google User",
          role: "student"
        });
      }
    });
  }

  // ---------------------------------------------
  // NORMAL LOGIN (Form Submit)
  // ---------------------------------------------
  components.loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    
    // Local kontrol
    const users = getLocalUsers();
    const user = users.find(u => u.email === email && u.password === pass);
    
    if (user) loginSuccess(user);
    else showAuthError("Invalid email or password (Try Registering first in Demo mode).");
  });

  // ---------------------------------------------
  // REGISTER (Form Submit)
  // ---------------------------------------------
  components.registerForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (pass !== confirm) return showAuthError("Passwords do not match");

    const newUser = { name, email, password: pass, role: 'student' };
    saveLocalUser(newUser);
    loginSuccess(newUser);
  });

  // Enter tuşu ile mesaj gönderme
  components.userInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') window.sendMessage();
  });

  // Başlangıç Kontrolü (Sayfa yenilenince)
  initSession();
});

// ================================================================
// 7. OTURUM YÖNETİMİ
// ================================================================
async function initSession() {
  // A. Önce Supabase kontrolü
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const user = {
        name: session.user.user_metadata.full_name || session.user.email,
        email: session.user.email,
        role: 'student',
        avatar: session.user.user_metadata.avatar_url
      };
      loginSuccess(user);
      return;
    }
  }

  // B. Yoksa Landing sayfasını göster
  window.showLanding();
}

function loginSuccess(user) {
  currentUser = user;
  
  // Profil Güncelle
  if (components.profileName) components.profileName.textContent = user.name;
  if (components.profileRole) components.profileRole.textContent = user.role.toUpperCase();
  if (components.profileAvatar) {
    if (user.avatar) {
      components.profileAvatar.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%">`;
      components.profileAvatar.style.background = 'transparent';
    } else {
      components.profileAvatar.textContent = user.name.charAt(0).toUpperCase();
    }
  }

  window.showDashboard();
}
