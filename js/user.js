// ==================== 工具函数 ====================
function getUsers() { try { return JSON.parse(localStorage.getItem('agriCreditUsers')) || []; } catch(e) { return []; } }
function saveUsers(u) { localStorage.setItem('agriCreditUsers', JSON.stringify(u)); }
function getLoggedInUser() {
    try {
        var s = localStorage.getItem('agriCreditLoggedInUser') || sessionStorage.getItem('agriCreditLoggedInUser');
        return s ? JSON.parse(s) : null;
    } catch(e) { return null; }
}
function setLoggedInUser(u) {
    if (localStorage.getItem('agriCreditLoggedInUser')) localStorage.setItem('agriCreditLoggedInUser', JSON.stringify(u));
    else sessionStorage.setItem('agriCreditLoggedInUser', JSON.stringify(u));
}
function getApplications(username) {
    try { var all = JSON.parse(localStorage.getItem('agriLoanApplications')) || {}; return all[username] || []; } catch(e) { return []; }
}
function saveApplications(username, apps) {
    var all = {};
    try { all = JSON.parse(localStorage.getItem('agriLoanApplications')) || {}; } catch(e) {}
    all[username] = apps;
    localStorage.setItem('agriLoanApplications', JSON.stringify(all));
}

function showToast(msg, type) {
    var t = document.getElementById('toast'), tx = document.getElementById('toastText'), ic = document.getElementById('toastIcon');
    tx.textContent = msg;
    t.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transform translate-y-0 opacity-100 transition-all duration-300 flex items-center gap-2 ' + (type==='success'?'bg-agri-600':type==='error'?'bg-red-500':'bg-fin-600');
    ic.innerHTML = type==='success'?'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>':'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';
    setTimeout(function(){ t.style.transform='translateY(-80px)'; t.style.opacity='0'; }, 2800);
}

function maskPhone(p) { return p ? p.substring(0,3) + '****' + p.substring(7) : ''; }
function maskIdCard(id) { return id ? id.substring(0,6) + '********' + id.substring(14) : ''; }
function formatDate(d) {
    var date = new Date(d);
    var pad = function(n) { return n < 10 ? '0' + n : n; };
    return date.getFullYear() + '-' + pad(date.getMonth()+1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}

// ==================== 登录校验 ====================
var currentUser = null;
var currentFilter = 'all';

function checkLogin() {
    currentUser = getLoggedInUser();
    if (!currentUser) {
        document.getElementById('notLoggedIn').classList.remove('hidden');
        document.getElementById('userCenter').classList.add('hidden');
        return false;
    }
    // 从用户列表中获取完整信息
    var users = getUsers();
    var fullUser = users.find(function(u) { return u.username === currentUser.username; });
    if (fullUser) {
        currentUser = Object.assign({}, fullUser);
        setLoggedInUser({ username: currentUser.username, phone: currentUser.phone || '' });
    }
    document.getElementById('notLoggedIn').classList.add('hidden');
    document.getElementById('userCenter').classList.remove('hidden');
    return true;
}

function logout() {
    localStorage.removeItem('agriCreditLoggedInUser');
    sessionStorage.removeItem('agriCreditLoggedInUser');
    showToast('已安全退出', 'success');
    setTimeout(function() { window.location.href = 'auth.html'; }, 1000);
}

// ==================== 侧边栏切换 ====================
function switchSection(section) {
    var sections = ['profile', 'applications', 'security'];
    sections.forEach(function(s) {
        document.getElementById('section' + s.charAt(0).toUpperCase() + s.slice(1)).classList.add('hidden');
        document.getElementById('nav' + s.charAt(0).toUpperCase() + s.slice(1)).classList.remove('active');
        document.getElementById('nav' + s.charAt(0).toUpperCase() + s.slice(1)).classList.add('text-gray-700');
    });
    document.getElementById('section' + section.charAt(0).toUpperCase() + section.slice(1)).classList.remove('hidden');
    document.getElementById('nav' + section.charAt(0).toUpperCase() + section.slice(1)).classList.add('active');
    document.getElementById('nav' + section.charAt(0).toUpperCase() + section.slice(1)).classList.remove('text-gray-700');

    // 重新触发动画
    var el = document.getElementById('section' + section.charAt(0).toUpperCase() + section.slice(1));
    el.classList.remove('animate-fadeInUp');
    void el.offsetWidth;
    el.classList.add('animate-fadeInUp');

    if (section === 'applications') renderApplications();
}

// ==================== 个人信息 ====================
function renderProfile() {
    document.getElementById('viewUsername').textContent = currentUser.username || '-';
    document.getElementById('viewRealName').textContent = currentUser.realName || '未填写';
    document.getElementById('viewPhone').textContent = currentUser.phone ? maskPhone(currentUser.phone) : '-';
    document.getElementById('viewIdCard').textContent = currentUser.idCard ? maskIdCard(currentUser.idCard) : '未填写';
    document.getElementById('viewBusinessType').textContent = currentUser.businessType || '未填写';
    document.getElementById('viewRegisterTime').textContent = currentUser.registeredAt ? formatDate(currentUser.registeredAt) : '-';

    // 信用积分（由管理员评定，存于 agriCreditUsers）
    var score = currentUser.creditScore;
    if (!score) {
        // 生成默认积分
        var hash = 0;
        var u = currentUser.username || '';
        for (var i = 0; i < u.length; i++) hash = ((hash << 5) - hash) + u.charCodeAt(i);
        score = 400 + Math.abs(hash % 400);
    }
    var level = '', levelClass = '', barWidth = Math.min(100, (score / 800) * 100);
    if (score >= 750) { level = '优秀'; levelClass = 'bg-agri-100 text-agri-700'; }
    else if (score >= 650) { level = '良好'; levelClass = 'bg-fin-100 text-fin-700'; }
    else if (score >= 550) { level = '中等'; levelClass = 'bg-amber-100 text-amber-700'; }
    else if (score >= 450) { level = '一般'; levelClass = 'bg-orange-100 text-orange-700'; }
    else { level = '较差'; levelClass = 'bg-red-100 text-red-700'; }
    document.getElementById('viewCreditScore').textContent = score;
    var levelEl = document.getElementById('viewCreditLevel');
    levelEl.textContent = level;
    levelEl.className = 'px-2 py-0.5 text-xs font-semibold rounded-full ' + levelClass;
    document.getElementById('creditBar').style.width = barWidth + '%';
    // 显示最近调整原因
    if (currentUser.creditReason && currentUser.creditUpdatedAt) {
        document.getElementById('creditReasonBox').classList.remove('hidden');
        document.getElementById('viewCreditReason').textContent = currentUser.creditReason;
        document.getElementById('viewCreditTime').textContent = formatDate(currentUser.creditUpdatedAt);
    }

    // 侧边栏
    document.getElementById('sidebarUsername').textContent = currentUser.username;
    document.getElementById('sidebarPhone').textContent = currentUser.phone ? maskPhone(currentUser.phone) : '未绑定';
    var avatar = document.getElementById('userAvatar');
    avatar.textContent = (currentUser.username || 'U').charAt(0).toUpperCase();
}

function enterEditProfile() {
    document.getElementById('profileView').classList.add('hidden');
    document.getElementById('profileEdit').classList.remove('hidden');
    document.getElementById('editUsername').value = currentUser.username || '';
    document.getElementById('editRealName').value = currentUser.realName || '';
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editIdCard').value = currentUser.idCard || '';
    document.getElementById('editBusinessType').value = currentUser.businessType || '';
    document.getElementById('editAddress').value = currentUser.address || '';
    document.getElementById('editDescription').value = currentUser.description || '';
}

function cancelEditProfile() {
    document.getElementById('profileView').classList.remove('hidden');
    document.getElementById('profileEdit').classList.add('hidden');
}

document.getElementById('profileForm').onsubmit = function(e) {
    e.preventDefault();
    var realName = document.getElementById('editRealName').value.trim();
    var phone = document.getElementById('editPhone').value.trim();
    var idCard = document.getElementById('editIdCard').value.trim();
    var businessType = document.getElementById('editBusinessType').value;
    var address = document.getElementById('editAddress').value.trim();
    var description = document.getElementById('editDescription').value.trim();

    if (phone && !/^1[3-9]\d{9}$/.test(phone)) { showToast('请输入有效的11位手机号码', 'error'); return; }
    if (idCard && !/^\d{17}[\dXx]$/.test(idCard)) { showToast('请输入有效的18位身份证号码', 'error'); return; }

    // 更新用户数据
    var users = getUsers();
    var idx = users.findIndex(function(u) { return u.username === currentUser.username; });
    if (idx >= 0) {
        users[idx].realName = realName;
        users[idx].phone = phone;
        users[idx].idCard = idCard;
        users[idx].businessType = businessType;
        users[idx].address = address;
        users[idx].description = description;
        saveUsers(users);
        currentUser = Object.assign({}, users[idx]);
        setLoggedInUser({ username: currentUser.username, phone: currentUser.phone || '' });
    }
    renderProfile();
    cancelEditProfile();
    showToast('个人信息保存成功', 'success');
};

// 手机号过滤
document.getElementById('editPhone').oninput = function() { this.value = this.value.replace(/\D/g, '').slice(0, 11); };
// 身份证号过滤
document.getElementById('editIdCard').oninput = function() { this.value = this.value.replace(/[^\dXx]/g, '').slice(0, 18); };

// ==================== 账户安全 ====================
var confirmPwdInput = document.getElementById('confirmPwd'), pwdHint = document.getElementById('pwdHint'), newPwdInput = document.getElementById('newPwd');
confirmPwdInput.oninput = function() {
    if (this.value.length > 0 && this.value !== newPwdInput.value) { pwdHint.classList.remove('hidden'); }
    else { pwdHint.classList.add('hidden'); }
};

document.getElementById('passwordForm').onsubmit = function(e) {
    e.preventDefault();
    var cur = document.getElementById('currentPwd').value.trim();
    var np = newPwdInput.value.trim();
    var cp = confirmPwdInput.value.trim();
    if (!cur) { showToast('请输入当前密码', 'error'); return; }
    if (cur !== currentUser.password) { showToast('当前密码错误', 'error'); return; }
    if (!np || np.length < 6 || np.length > 20) { showToast('新密码长度应为6-20个字符', 'error'); return; }
    if (np !== cp) { showToast('两次输入的新密码不一致', 'error'); return; }
    if (np === cur) { showToast('新密码不能与当前密码相同', 'error'); return; }

    var users = getUsers();
    var idx = users.findIndex(function(u) { return u.username === currentUser.username; });
    if (idx >= 0) { users[idx].password = np; saveUsers(users); currentUser.password = np; }
    document.getElementById('passwordForm').reset();
    showToast('密码修改成功', 'success');
};

// ==================== 贷款申请管理 ====================
function renderApplications() {
    var apps = getApplications(currentUser.username);
    var filtered = currentFilter === 'all' ? apps : apps.filter(function(a) { return a.status === currentFilter; });

    // 统计
    document.getElementById('statTotal').textContent = apps.length;
    document.getElementById('statPending').textContent = apps.filter(function(a) { return a.status === 'pending'; }).length;
    document.getElementById('statApproved').textContent = apps.filter(function(a) { return a.status === 'approved'; }).length;
    document.getElementById('statPaid').textContent = apps.filter(function(a) { return a.status === 'paid'; }).length;
    document.getElementById('appCount').textContent = apps.length;

    var list = document.getElementById('appList');
    var empty = document.getElementById('appEmpty');

    if (filtered.length === 0) {
        list.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    var statusMap = {
        pending: { text: '审批中', class: 'status-pending' },
        approved: { text: '已通过', class: 'status-approved' },
        rejected: { text: '已拒绝', class: 'status-rejected' },
        paid: { text: '已放款', class: 'status-paid' },
        closed: { text: '已结清', class: 'status-closed' }
    };
    var productColors = {
        '惠农贷': 'from-agri-400 to-agri-600',
        '农机贷': 'from-fin-400 to-fin-600',
        '种植贷': 'from-amber-400 to-amber-600',
        '养殖贷': 'from-rose-400 to-rose-600'
    };

    list.innerHTML = filtered.map(function(a, i) {
        var s = statusMap[a.status] || statusMap.pending;
        var color = productColors[a.product] || 'from-gray-400 to-gray-600';
        return '<div class="p-6 hover:bg-gray-50/50 transition-colors">' +
            '<div class="flex items-start justify-between gap-4 flex-wrap">' +
                '<div class="flex items-start gap-4 flex-1 min-w-0">' +
                    '<div class="w-12 h-12 rounded-xl bg-gradient-to-br ' + color + ' flex items-center justify-center flex-shrink-0 shadow-md">' +
                        '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
                    '</div>' +
                    '<div class="min-w-0">' +
                        '<div class="flex items-center gap-2 mb-1 flex-wrap">' +
                            '<h4 class="font-display font-bold text-base text-gray-900">' + a.product + '</h4>' +
                            '<span class="status-badge ' + s.class + '">' + s.text + '</span>' +
                        '</div>' +
                        '<div class="flex items-center gap-4 text-xs text-gray-500 flex-wrap">' +
                            '<span>申请金额：<span class="font-semibold text-gray-700">' + a.amount + '万元</span></span>' +
                            '<span>期限：<span class="font-semibold text-gray-700">' + a.term + '个月</span></span>' +
                            '<span>申请时间：' + formatDate(a.createdAt) + '</span>' +
                        '</div>' +
                        (a.purpose ? '<p class="text-xs text-gray-400 mt-1.5">用途：' + a.purpose + '</p>' : '') +
                    '</div>' +
                '</div>' +
                '<div class="flex items-center gap-2 flex-shrink-0">' +
                    '<button onclick="viewDetail(' + a.id + ')" class="px-3 py-1.5 text-xs font-medium text-agri-700 bg-agri-50 border border-agri-200 rounded-lg hover:bg-agri-100 transition-all">查看详情</button>' +
                    (a.status === 'pending' ? '<button onclick="cancelApp(' + a.id + ')" class="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all">撤销</button>' : '') +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function filterApps(status) {
    currentFilter = status;
    document.querySelectorAll('.app-filter').forEach(function(btn) {
        btn.classList.remove('active', 'bg-agri-600', 'text-white', 'font-medium');
        btn.classList.add('bg-white', 'border', 'border-gray-200', 'text-gray-600');
    });
    event.target.classList.add('active', 'bg-agri-600', 'text-white', 'font-medium');
    event.target.classList.remove('bg-white', 'border', 'border-gray-200', 'text-gray-600');
    renderApplications();
}

function openNewAppModal() {
    document.getElementById('newAppModal').classList.remove('hidden');
    document.getElementById('newAppForm').reset();
}

function closeNewAppModal() {
    document.getElementById('newAppModal').classList.add('hidden');
}

document.getElementById('newAppForm').onsubmit = function(e) {
    e.preventDefault();
    var product = document.getElementById('appProduct').value;
    var amount = document.getElementById('appAmount').value.trim();
    var term = document.getElementById('appTerm').value;
    var purpose = document.getElementById('appPurpose').value.trim();
    var remark = document.getElementById('appRemark').value.trim();

    if (!product) { showToast('请选择申请产品', 'error'); return; }
    if (!amount || parseFloat(amount) <= 0) { showToast('请输入有效的申请金额', 'error'); return; }
    if (!term) { showToast('请选择期望期限', 'error'); return; }
    if (!purpose) { showToast('请填写资金用途', 'error'); return; }

    var apps = getApplications(currentUser.username);
    var newApp = {
        id: Date.now(),
        product: product,
        amount: parseFloat(amount),
        term: parseInt(term),
        purpose: purpose,
        remark: remark,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    apps.unshift(newApp);
    saveApplications(currentUser.username, apps);
    closeNewAppModal();
    renderApplications();
    showToast('贷款申请已提交，等待审批', 'success');

    // 模拟审批流程：3秒后自动更新状态
    setTimeout(function() {
        var allApps = getApplications(currentUser.username);
        var idx = allApps.findIndex(function(a) { return a.id === newApp.id; });
        if (idx >= 0 && allApps[idx].status === 'pending') {
            // 90%概率通过
            allApps[idx].status = Math.random() < 0.9 ? 'approved' : 'rejected';
            allApps[idx].reviewedAt = new Date().toISOString();
            allApps[idx].reviewNote = allApps[idx].status === 'approved' ? '您的信用评分良好，申请已通过审批' : '综合评估未通过，建议完善个人信息后重新申请';
            saveApplications(currentUser.username, allApps);
            // 如果当前在申请页面则刷新
            if (!document.getElementById('sectionApplications').classList.contains('hidden')) {
                renderApplications();
            }
            // 通过后再模拟放款
            if (allApps[idx].status === 'approved') {
                setTimeout(function() {
                    var latest = getApplications(currentUser.username);
                    var i2 = latest.findIndex(function(a) { return a.id === newApp.id; });
                    if (i2 >= 0 && latest[i2].status === 'approved') {
                        latest[i2].status = 'paid';
                        latest[i2].paidAt = new Date().toISOString();
                        saveApplications(currentUser.username, latest);
                        if (!document.getElementById('sectionApplications').classList.contains('hidden')) {
                            renderApplications();
                        }
                    }
                }, 4000);
            }
        }
    }, 3000);
};

function viewDetail(id) {
    var apps = getApplications(currentUser.username);
    var app = apps.find(function(a) { return a.id === id; });
    if (!app) return;

    var statusMap = {
        pending: { text: '审批中', class: 'status-pending' },
        approved: { text: '已通过', class: 'status-approved' },
        rejected: { text: '已拒绝', class: 'status-rejected' },
        paid: { text: '已放款', class: 'status-paid' },
        closed: { text: '已结清', class: 'status-closed' }
    };
    var s = statusMap[app.status] || statusMap.pending;

    // 兼容银行审批保存的字段（approvalComment / approvedAt / rejectedAt）
    var reviewTime = app.reviewedAt || app.approvedAt || app.rejectedAt;
    var reviewNote = app.reviewNote || app.approvalComment;
    if (!reviewNote && reviewTime) {
        reviewNote = app.status === 'approved' ? '您的信用评分良好，申请已通过审批' :
                     app.status === 'rejected' ? '综合评估未通过，建议完善个人信息后重新申请' : '等待审批中';
    }

    // 时间线
    var timeline = [
        { title: '提交申请', time: app.createdAt, done: true, desc: '申请已提交，等待系统审批' },
        { title: '审批结果', time: reviewTime, done: !!reviewTime, desc: reviewNote || '等待审批中' },
        { title: '放款到账', time: app.paidAt, done: !!app.paidAt, desc: app.paidAt ? '资金已发放至您的账户' : '等待放款' }
    ];

    var timelineHtml = timeline.map(function(t, i) {
        return '<div class="flex gap-3">' +
            '<div class="flex flex-col items-center">' +
                '<div class="w-3 h-3 rounded-full ' + (t.done ? 'bg-agri-500' : 'bg-gray-200') + '"></div>' +
                (i < timeline.length - 1 ? '<div class="w-0.5 h-10 bg-gray-100"></div>' : '') +
            '</div>' +
            '<div class="pb-2">' +
                '<p class="text-sm font-medium ' + (t.done ? 'text-gray-900' : 'text-gray-400') + '">' + t.title + '</p>' +
                '<p class="text-xs text-gray-400 mt-0.5">' + (t.done ? formatDate(t.time) : '待处理') + '</p>' +
                '<p class="text-xs text-gray-500 mt-1">' + t.desc + '</p>' +
            '</div>' +
        '</div>';
    }).join('');

    document.getElementById('detailContent').innerHTML =
        '<div class="flex items-center justify-between mb-2">' +
            '<h4 class="font-display font-bold text-xl text-gray-900">' + app.product + '</h4>' +
            '<span class="status-badge ' + s.class + '">' + s.text + '</span>' +
        '</div>' +
        '<div class="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">' +
            '<div><p class="text-xs text-gray-500 mb-1">申请金额</p><p class="font-display font-bold text-lg text-gray-900">' + app.amount + ' 万元</p></div>' +
            '<div><p class="text-xs text-gray-500 mb-1">申请期限</p><p class="font-display font-bold text-lg text-gray-900">' + app.term + ' 个月</p></div>' +
        '</div>' +
        '<div class="space-y-3 py-2">' +
            '<div class="flex justify-between text-sm"><span class="text-gray-500">资金用途</span><span class="text-gray-900">' + app.purpose + '</span></div>' +
            (app.remark ? '<div class="flex justify-between text-sm"><span class="text-gray-500">补充说明</span><span class="text-gray-900 text-right">' + app.remark + '</span></div>' : '') +
            '<div class="flex justify-between text-sm"><span class="text-gray-500">申请编号</span><span class="text-gray-900 font-mono">' + app.id + '</span></div>' +
        '</div>' +
        '<div class="pt-4 border-t border-gray-100">' +
            '<h5 class="text-sm font-semibold text-gray-900 mb-4">申请进度</h5>' +
            '<div class="space-y-1">' + timelineHtml + '</div>' +
        '</div>';

    document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

function cancelApp(id) {
    if (!confirm('确定要撤销此贷款申请吗？')) return;
    var apps = getApplications(currentUser.username);
    apps = apps.filter(function(a) { return a.id !== id; });
    saveApplications(currentUser.username, apps);
    renderApplications();
    showToast('申请已撤销', 'success');
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    if (checkLogin()) {
        renderProfile();
        renderApplications();
    }
});
