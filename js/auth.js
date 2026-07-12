(function () {
  'use strict';

  let currentType = 'user';

  // 数据存取
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem('agriCreditUsers')) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem('agriCreditUsers', JSON.stringify(users));
    } catch (e) {
      showToast('存储空间不足，请清理浏览器缓存', 'error');
    }
  }

  function getBankUsers() {
    try {
      let bankUsers = JSON.parse(localStorage.getItem('agriBankUsers'));
      if (!bankUsers || bankUsers.length === 0) {
        bankUsers = [
          { id: 1, username: 'admin', password: 'admin123', role: '审批员', limit: 100, status: 'active' },
          { id: 2, username: 'approver', password: 'approver123', role: '审批员', limit: 50, status: 'active' },
          { id: 3, username: 'manager', password: 'manager123', role: '产品经理', limit: 30, status: 'active' }
        ];
        localStorage.setItem('agriBankUsers', JSON.stringify(bankUsers));
      }
      return bankUsers;
    } catch (e) {
      return [{ id: 1, username: 'admin', password: 'admin123', role: '审批员', limit: 100, status: 'active' }];
    }
  }

  function safeSetItem(storage, key, value) {
    try {
      storage.setItem(key, value);
    } catch (e) {
      showToast('存储写入失败', 'error');
    }
  }

  // Toast
  function showToast(msg, type) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');
    const toastIcon = document.getElementById('toastIcon');

    toastText.textContent = msg;
    const bgClass = type === 'success' ? 'bg-agri-600' : 'bg-red-500';
    toast.className = `fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transform translate-y-0 opacity-100 transition-all duration-300 flex items-center gap-2 ${bgClass}`;

    const iconPath = type === 'success'
      ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
      : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';
    toastIcon.innerHTML = iconPath;

    setTimeout(() => {
      toast.style.transform = 'translateY(-80px)';
      toast.style.opacity = '0';
    }, 2800);
  }

  // 面板切换
  function switchPanel(panel) {
    const panelNames = ['Select', 'Login', 'Register'];
    panelNames.forEach(name => {
      const el = document.getElementById('panel' + name);
      el.classList.toggle('hidden-panel', name !== panel);
      el.classList.toggle('visible-panel', name === panel);
    });
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('registerError').classList.add('hidden');
  }

  // 选择登录类型
  function selectType(type) {
    currentType = type;
    const config = {
      user: { title: '用户登录', subtitle: '农户/企业用户登录', btnClass: 'from-agri-600 to-agri-700 hover:from-agri-700 hover:to-agri-800', tips: '默认账号：admin / 123456' },
      bank: { title: '银行工作人员登录', subtitle: '请输入银行系统账号', btnClass: 'from-fin-600 to-fin-700 hover:from-fin-700 hover:to-fin-800', tips: '默认账号：admin / admin123' },
      admin: { title: '系统管理员登录', subtitle: '请输入管理员账号', btnClass: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800', tips: '默认账号：system / system123' }
    };
    const c = config[type];
    document.getElementById('loginTitle').textContent = c.title;
    document.getElementById('loginSubtitle').textContent = c.subtitle;
    document.getElementById('loginBtn').className = `w-full py-3.5 bg-gradient-to-r ${c.btnClass} text-white font-semibold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2`;
    document.getElementById('loginTips').textContent = c.tips;
    document.getElementById('loginBtnText').textContent = '登录';
    document.getElementById('rememberRow').style.display = type === 'admin' ? 'none' : 'flex';
    switchPanel('Login');
  }

  function backToSelect() {
    switchPanel('Select');
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
  }

  function goRegister() {
    currentType = 'user';
    switchPanel('Register');
  }

  // 密码可见性切换（复用逻辑）
  function initPasswordToggle(toggleId, passwordId, eyeOffId, eyeOnId) {
    const toggle = document.getElementById(toggleId);
    const password = document.getElementById(passwordId);
    const eyeOff = document.getElementById(eyeOffId);
    const eyeOn = document.getElementById(eyeOnId);

    toggle.addEventListener('click', () => {
      const isPassword = password.type === 'password';
      password.type = isPassword ? 'text' : 'password';
      eyeOff.classList.toggle('hidden', isPassword);
      eyeOn.classList.toggle('hidden', !isPassword);
    });
  }

  initPasswordToggle('toggleLoginPwd', 'loginPassword', 'loginEyeOff', 'loginEyeOn');
  initPasswordToggle('toggleRegPwd', 'regPassword', 'regEyeOff', 'regEyeOn');

  // 确认密码校验
  const regConfirmPwd = document.getElementById('regConfirmPwd');
  const confirmHint = document.getElementById('confirmHint');
  const regPassword = document.getElementById('regPassword');

  function checkConfirmMatch() {
    const confirmVal = regConfirmPwd.value;
    const pwdVal = regPassword.value;
    if (confirmVal.length === 0) {
      confirmHint.classList.add('hidden');
      regConfirmPwd.classList.remove('border-red-300', 'border-green-400');
    } else if (confirmVal !== pwdVal) {
      confirmHint.classList.remove('hidden');
      regConfirmPwd.classList.add('border-red-300');
      regConfirmPwd.classList.remove('border-green-400');
    } else {
      confirmHint.classList.add('hidden');
      regConfirmPwd.classList.remove('border-red-300');
      regConfirmPwd.classList.add('border-green-400');
    }
  }

  regConfirmPwd.addEventListener('input', checkConfirmMatch);
  regPassword.addEventListener('input', checkConfirmMatch);

  // 手机号输入过滤
  document.getElementById('regPhone').addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '').slice(0, 11);
  });

  // 显示错误信息
  function showError(errorEl, textEl, message) {
    textEl.textContent = message;
    errorEl.classList.remove('hidden');
    errorEl.classList.add('flex');
  }

  // 登录提交
  document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const loginError = document.getElementById('loginError');
    const loginErrorText = document.getElementById('loginErrorText');
    loginError.classList.add('hidden');

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username) { showError(loginError, loginErrorText, '请输入用户名'); return; }
    if (!password) { showError(loginError, loginErrorText, '请输入密码'); return; }

    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');
    loginBtn.disabled = true;
    loginBtnText.textContent = '登录中...';
    loginSpinner.classList.remove('hidden');

    setTimeout(() => {
      let success = false;
      let redirectUrl = '';

      if (currentType === 'user') {
        const users = getUsers();
        const user = users.find(x => x.username === username && x.password === password);
        if (user) {
          success = true;
          redirectUrl = 'main.html';
          const storage = document.getElementById('remember').checked ? localStorage : sessionStorage;
          safeSetItem(storage, 'agriCreditLoggedInUser', JSON.stringify({ username: user.username, phone: user.phone || '' }));
        }
      } else if (currentType === 'bank') {
        const bankUsers = getBankUsers();
        const bankUser = bankUsers.find(x => x.username === username && x.password === password);
        if (bankUser) {
          success = true;
          redirectUrl = 'bank.html';
          safeSetItem(sessionStorage, 'agriAdminLoggedIn', 'true');
        }
      } else if (currentType === 'admin') {
        if (username === 'system' && password === 'system123') {
          success = true;
          redirectUrl = 'admin.html';
          safeSetItem(sessionStorage, 'agriSystemAdminLoggedIn', 'true');
        }
      }

      if (success) {
        showToast('登录成功，正在跳转...', 'success');
        setTimeout(() => { window.location.href = redirectUrl; }, 1200);
      } else {
        showError(loginError, loginErrorText, '用户名或密码错误，请重试');
        loginBtn.disabled = false;
        loginBtnText.textContent = '登录';
        loginSpinner.classList.add('hidden');
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginPassword').focus();
      }
    }, 1000);
  });

  // 注册提交
  document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const registerError = document.getElementById('registerError');
    const registerErrorText = document.getElementById('registerErrorText');
    registerError.classList.add('hidden');

    const username = document.getElementById('regUsername').value.trim();
    const password = regPassword.value.trim();
    const confirmPassword = regConfirmPwd.value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const agreed = document.getElementById('agree').checked;

    const users = getUsers();

    if (!username) { showError(registerError, registerErrorText, '请输入用户名'); return; }
    if (username.length < 4 || username.length > 20) { showError(registerError, registerErrorText, '用户名长度应为4-20个字符'); return; }
    if (!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(username)) { showError(registerError, registerErrorText, '用户名只能包含中文、英文、数字和下划线'); return; }
    if (users.some(x => x.username === username)) { showError(registerError, registerErrorText, '该用户名已被注册'); return; }
    if (!password) { showError(registerError, registerErrorText, '请设置密码'); return; }
    if (password.length < 6 || password.length > 20) { showError(registerError, registerErrorText, '密码长度应为6-20个字符'); return; }
    if (!confirmPassword) { showError(registerError, registerErrorText, '请再次输入密码'); return; }
    if (password !== confirmPassword) { showError(registerError, registerErrorText, '两次输入的密码不一致'); return; }
    if (!phone) { showError(registerError, registerErrorText, '请输入手机号'); return; }
    if (!/^1[3-9]\d{9}$/.test(phone)) { showError(registerError, registerErrorText, '请输入有效的11位手机号码'); return; }
    if (users.some(x => x.phone === phone)) { showError(registerError, registerErrorText, '该手机号已被注册'); return; }
    if (!agreed) { showError(registerError, registerErrorText, '请先阅读并同意用户服务协议和隐私政策'); return; }

    const registerBtn = document.getElementById('registerBtn');
    const registerBtnText = document.getElementById('registerBtnText');
    const registerSpinner = document.getElementById('registerSpinner');
    registerBtn.disabled = true;
    registerBtnText.textContent = '注册中...';
    registerSpinner.classList.remove('hidden');

    setTimeout(() => {
      users.push({ username, password, phone, registeredAt: new Date().toISOString() });
      saveUsers(users);
      showToast('注册成功！即将跳转登录...', 'success');
      document.getElementById('registerForm').reset();
      confirmHint.classList.add('hidden');
      registerBtn.disabled = false;
      registerBtnText.textContent = '注册';
      registerSpinner.classList.add('hidden');
      setTimeout(() => { selectType('user'); }, 1500);
    }, 1000);
  });

  // 输入时清空错误（事件委托）
  const formContainer = document.querySelector('main');
  formContainer.addEventListener('input', function (e) {
    if (e.target.tagName === 'INPUT') {
      document.getElementById('loginError').classList.add('hidden');
      document.getElementById('registerError').classList.add('hidden');
    }
  });

  // 回车提交
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && document.activeElement && document.activeElement.tagName === 'INPUT') {
      e.preventDefault();
      const panelSelect = document.getElementById('panelSelect');
      const panelLogin = document.getElementById('panelLogin');
      if (!panelSelect.classList.contains('hidden-panel')) return;
      if (!panelLogin.classList.contains('hidden-panel')) {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
      } else {
        document.getElementById('registerForm').dispatchEvent(new Event('submit'));
      }
    }
  });

  // 暴露给HTML内联事件处理器的接口
  window.selectType = selectType;
  window.backToSelect = backToSelect;
  window.goRegister = goRegister;
})();
