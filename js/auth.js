var currentType = 'user';

// 数据存取
function getUsers() { try { return JSON.parse(localStorage.getItem('agriCreditUsers')) || []; } catch(e) { return []; } }
function saveUsers(u) { localStorage.setItem('agriCreditUsers', JSON.stringify(u)); }
function getBankUsers() {
  try {
    var b = JSON.parse(localStorage.getItem('agriBankUsers'));
    if (!b || b.length === 0) {
      b = [
        { id: 1, username: 'admin', password: 'admin123', role: '审批员', limit: 100, status: 'active' },
        { id: 2, username: 'approver', password: 'approver123', role: '审批员', limit: 50, status: 'active' },
        { id: 3, username: 'manager', password: 'manager123', role: '产品经理', limit: 30, status: 'active' }
      ];
      localStorage.setItem('agriBankUsers', JSON.stringify(b));
    }
    return b;
  } catch(e) {
    return [{ id: 1, username: 'admin', password: 'admin123', role: '审批员', limit: 100, status: 'active' }];
  }
}

function showToast(msg, type) {
  var t = document.getElementById('toast'), tx = document.getElementById('toastText'), ic = document.getElementById('toastIcon');
  tx.textContent = msg;
  t.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transform translate-y-0 opacity-100 transition-all duration-300 flex items-center gap-2 ' + (type==='success'?'bg-agri-600':'bg-red-500');
  ic.innerHTML = type==='success'?'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>':'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';
  setTimeout(function(){t.style.transform='translateY(-80px)';t.style.opacity='0';},2800);
}

function switchPanel(panel) {
  var panels = ['Select', 'Login', 'Register'];
  panels.forEach(function(p) {
    var el = document.getElementById('panel' + p);
    if (p === panel) {
      el.classList.remove('hidden-panel');
      el.classList.add('visible-panel');
    } else {
      el.classList.add('hidden-panel');
      el.classList.remove('visible-panel');
    }
  });
  document.getElementById('loginError').classList.add('hidden');
  document.getElementById('registerError').classList.add('hidden');
}

function selectType(type) {
  currentType = type;
  var config = {
    user: { title: '用户登录', subtitle: '农户/企业用户登录', btnClass: 'from-agri-600 to-agri-700 hover:from-agri-700 hover:to-agri-800', tips: '默认账号：admin / 123456' },
    bank: { title: '银行工作人员登录', subtitle: '请输入银行系统账号', btnClass: 'from-fin-600 to-fin-700 hover:from-fin-700 hover:to-fin-800', tips: '默认账号：admin / admin123' },
    admin: { title: '系统管理员登录', subtitle: '请输入管理员账号', btnClass: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800', tips: '默认账号：system / system123' }
  };
  var c = config[type];
  document.getElementById('loginTitle').textContent = c.title;
  document.getElementById('loginSubtitle').textContent = c.subtitle;
  document.getElementById('loginBtn').className = 'w-full py-3.5 bg-gradient-to-r ' + c.btnClass + ' text-white font-semibold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2';
  document.getElementById('loginTips').textContent = c.tips;
  document.getElementById('loginBtnText').textContent = '登录';

  // 管理员隐藏记住我
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

// 密码可见性
(function(){
  var b=document.getElementById('toggleLoginPwd'), p=document.getElementById('loginPassword'),
      off=document.getElementById('loginEyeOff'), on=document.getElementById('loginEyeOn');
  b.onclick=function(){
    var is=p.type==='password';p.type=is?'text':'password';
    is?(off.classList.add('hidden'),on.classList.remove('hidden')):(off.classList.remove('hidden'),on.classList.add('hidden'));
  };
})();
(function(){
  var b=document.getElementById('toggleRegPwd'), p=document.getElementById('regPassword'),
      off=document.getElementById('regEyeOff'), on=document.getElementById('regEyeOn');
  b.onclick=function(){
    var is=p.type==='password';p.type=is?'text':'password';
    is?(off.classList.add('hidden'),on.classList.remove('hidden')):(off.classList.remove('hidden'),on.classList.add('hidden'));
  };
})();

// 确认密码校验
var rcp=document.getElementById('regConfirmPwd'), ch=document.getElementById('confirmHint'), rpwd=document.getElementById('regPassword');
rcp.oninput=function(){
  if(this.value.length>0&&this.value!==rpwd.value){ch.classList.remove('hidden');this.classList.add('border-red-300');}
  else if(this.value.length>0&&this.value===rpwd.value){ch.classList.add('hidden');this.classList.remove('border-red-300');this.classList.add('border-green-400');}
  else{ch.classList.add('hidden');this.classList.remove('border-red-300','border-green-400');}
};
rpwd.oninput=function(){
  if(rcp.value.length>0&&this.value!==rcp.value){ch.classList.remove('hidden');rcp.classList.add('border-red-300');}
  else if(rcp.value.length>0&&this.value===rcp.value){ch.classList.add('hidden');rcp.classList.remove('border-red-300');rcp.classList.add('border-green-400');}
};
document.getElementById('regPhone').oninput=function(){this.value=this.value.replace(/\D/g,'').slice(0,11);};

// 登录提交
document.getElementById('loginForm').onsubmit=function(e){
  e.preventDefault();
  var err=document.getElementById('loginError'), et=document.getElementById('loginErrorText');
  err.classList.add('hidden');
  var u=document.getElementById('loginUsername').value.trim(), p=document.getElementById('loginPassword').value.trim();
  if(!u){et.textContent='请输入用户名';err.classList.remove('hidden');err.classList.add('flex');return;}
  if(!p){et.textContent='请输入密码';err.classList.remove('hidden');err.classList.add('flex');return;}

  var btn=document.getElementById('loginBtn'), bt=document.getElementById('loginBtnText'), sp=document.getElementById('loginSpinner');
  btn.disabled=true;bt.textContent='登录中...';sp.classList.remove('hidden');

  setTimeout(function(){
    var success = false, redirectUrl = '';

    if (currentType === 'user') {
      var users = getUsers();
      var user = users.find(function(x){return x.username===u&&x.password===p;});
      if (user) {
        success = true;
        redirectUrl = 'main.html';
        var storage = document.getElementById('remember').checked ? localStorage : sessionStorage;
        storage.setItem('agriCreditLoggedInUser', JSON.stringify({username:user.username, phone:user.phone||''}));
      }
    } else if (currentType === 'bank') {
      var bankUsers = getBankUsers();
      var bankUser = bankUsers.find(function(x){return x.username===u&&x.password===p;});
      if (bankUser) {
        success = true;
        redirectUrl = 'bank.html';
        sessionStorage.setItem('agriAdminLoggedIn', 'true');
      }
    } else if (currentType === 'admin') {
      if (u === 'system' && p === 'system123') {
        success = true;
        redirectUrl = 'admin.html';
        sessionStorage.setItem('agriSystemAdminLoggedIn', 'true');
      }
    }

    if (success) {
      showToast('登录成功，正在跳转...', 'success');
      setTimeout(function(){window.location.href=redirectUrl;},1200);
    } else {
      et.textContent='用户名或密码错误，请重试';
      err.classList.remove('hidden');err.classList.add('flex');
      btn.disabled=false;bt.textContent='登录';sp.classList.add('hidden');
      document.getElementById('loginPassword').value='';
      document.getElementById('loginPassword').focus();
    }
  }, 1000);
};

// 注册提交
document.getElementById('registerForm').onsubmit=function(e){
  e.preventDefault();
  var re=document.getElementById('registerError'), ret=document.getElementById('registerErrorText');re.classList.add('hidden');
  var un=document.getElementById('regUsername').value.trim(), pw=rpwd.value.trim(), cp=rcp.value.trim(),
      ph=document.getElementById('regPhone').value.trim(), ag=document.getElementById('agree').checked;

  if(!un){ret.textContent='请输入用户名';re.classList.remove('hidden');re.classList.add('flex');return;}
  if(un.length<4||un.length>20){ret.textContent='用户名长度应为4-20个字符';re.classList.remove('hidden');re.classList.add('flex');return;}
  if(!/^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(un)){ret.textContent='用户名只能包含中文、英文、数字和下划线';re.classList.remove('hidden');re.classList.add('flex');return;}
  if(getUsers().some(function(x){return x.username===un;})){ret.textContent='该用户名已被注册';re.classList.remove('hidden');re.classList.add('flex');return;}
  if(!pw){ret.textContent='请设置密码';re.classList.remove('hidden');re.classList.add('flex');return;}
  if(pw.length<6||pw.length>20){ret.textContent='密码长度应为6-20个字符';re.classList.remove('hidden');re.classList.add('flex');return;}
  if(!cp){ret.textContent='请再次输入密码';re.classList.remove('hidden');re.classList.add('flex');return;}
  if(pw!==cp){ret.textContent='两次输入的密码不一致';re.classList.remove('hidden');re.classList.add('flex');return;}
  if(!ph){ret.textContent='请输入手机号';re.classList.remove('hidden');re.classList.add('flex');return;}
  if(!/^1[3-9]\d{9}$/.test(ph)){ret.textContent='请输入有效的11位手机号码';re.classList.remove('hidden');re.classList.add('flex');return;}
  if(getUsers().some(function(x){return x.phone===ph;})){ret.textContent='该手机号已被注册';re.classList.remove('hidden');re.classList.add('flex');return;}
  if(!ag){ret.textContent='请先阅读并同意用户服务协议和隐私政策';re.classList.remove('hidden');re.classList.add('flex');return;}

  var rb=document.getElementById('registerBtn'),rbt=document.getElementById('registerBtnText'),rs=document.getElementById('registerSpinner');
  rb.disabled=true;rbt.textContent='注册中...';rs.classList.remove('hidden');
  setTimeout(function(){
    var users=getUsers();users.push({username:un,password:pw,phone:ph,registeredAt:new Date().toISOString()});saveUsers(users);
    showToast('注册成功！即将跳转登录...', 'success');
    document.getElementById('registerForm').reset();ch.classList.add('hidden');
    rb.disabled=false;rbt.textContent='注册';rs.classList.add('hidden');
    setTimeout(function(){selectType('user');},1500);
  },1000);
};

// 输入时清空错误
document.querySelectorAll('#registerForm input, #loginForm input').forEach(function(inp){
  inp.addEventListener('input',function(){
    document.getElementById('loginError').classList.add('hidden');
    document.getElementById('registerError').classList.add('hidden');
  });
});

// 回车提交
document.addEventListener('keydown',function(e){
  if(e.key==='Enter'&&document.activeElement&&document.activeElement.tagName==='INPUT'){
    e.preventDefault();
    var sel=document.getElementById('panelSelect'), log=document.getElementById('panelLogin');
    if(!sel.classList.contains('hidden-panel')) return;
    if(!log.classList.contains('hidden-panel')){document.getElementById('loginForm').dispatchEvent(new Event('submit'));}
    else{document.getElementById('registerForm').dispatchEvent(new Event('submit'));}
  }
});
