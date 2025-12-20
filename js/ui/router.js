import { loginUser, registerUser, logoutUser } from '../services/authService.js';

const $ = (id) => document.getElementById(id);

function hideAllViews() {
  ['landing-view','auth-view','dashboard-view','workspace-view'].forEach(id => $(id)?.classList.add('hidden'));
}

function showView(id) {
  hideAllViews();
  $(id)?.classList.remove('hidden');
}

function setAuthTab(tab) {
  const loginForm = $('login-form');
  const regForm = $('register-form');
  const tabLogin = $('tab-login');
  const tabReg = $('tab-register');

  if (tab === 'register') {
    loginForm?.classList.add('hidden');
    regForm?.classList.remove('hidden');
    tabLogin?.classList.remove('active');
    tabReg?.classList.add('active');
  } else {
    regForm?.classList.add('hidden');
    loginForm?.classList.remove('hidden');
    tabReg?.classList.remove('active');
    tabLogin?.classList.add('active');
  }
}

export function initRouter() {
  // onclick’lerin çağırması için global fonksiyonlar:
  window.showLanding = () => showView('landing-view');

  window.showAuth = (tab='login') => {
    showView('auth-view');
    setAuthTab(tab);
  };

  window.switchAuthTab = (tab) => setAuthTab(tab);

  window.showDashboard = () => showView('dashboard-view');

  window.openTool = (tool) => {
    showView('workspace-view');
    const title = $('tool-title');
    if (title) title.textContent = tool;
  };

  window.logout = async () => {
    await logoutUser();
    window.showLanding();
  };

  // Form submit handler’lar (onsubmit için)
  window.loginSubmit = async (e) => {
    e.preventDefault();
    const email = $('login-email')?.value?.trim();
    const pass = $('login-password')?.value;

    const { error } = await loginUser(email, pass);
    if (error) return alert(error.message);
    window.showDashboard();
  };

  window.registerSubmit = async (e) => {
    e.preventDefault();
    const name = $('reg-name')?.value?.trim();
    const email = $('reg-email')?.value?.trim();
    const pass = $('reg-password')?.value;
    const confirm = $('reg-confirm')?.value;
    const role = document.querySelector('input[name="role"]:checked')?.value || 'student';

    if (pass !== confirm) return alert('Passwords do not match.');

    const { error } = await registerUser(name, email, pass, role);
    if (error) return alert(error.message);

    // kayıt oldu -> login ekranına dön
    window.showAuth('login');
  };

  // ilk açılış
  window.showLanding();
}
