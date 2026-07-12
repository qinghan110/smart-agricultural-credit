// ==================== 工具函数 ====================
function getUsers() { try { return JSON.parse(localStorage.getItem('agriCreditUsers')) || []; } catch(e) { return []; } }
function saveUsers(u) { localStorage.setItem('agriCreditUsers', JSON.stringify(u)); }
function getApplications() {
    var all = {};
    try { all = JSON.parse(localStorage.getItem('agriLoanApplications')) || {}; } catch(e) {}
    return all;
}
function getProducts() {
    try { return JSON.parse(localStorage.getItem('agriLoanProducts')) || getDefaultProducts(); } catch(e) { return getDefaultProducts(); }
}
function saveProducts(p) { localStorage.setItem('agriLoanProducts', JSON.stringify(p)); }
function getDefaultProducts() {
    return [
        { id: 1, name: '惠农贷', minAmount: 1, maxAmount: 30, rate: '3.85%起', term: '1-36个月', desc: '面向农户的综合信用贷款，无需抵押，纯信用授信', status: 'active', color: 'from-agri-400 to-agri-600' },
        { id: 2, name: '农机贷', minAmount: 5, maxAmount: 100, rate: '4.35%起', term: '6-60个月', desc: '专项用于购置农业机械设备，支持分期还款', status: 'active', color: 'from-fin-400 to-fin-600' },
        { id: 3, name: '种植贷', minAmount: 2, maxAmount: 50, rate: '3.65%起', term: '3-24个月', desc: '支持粮食、经济作物等种植生产的流动资金需求', status: 'active', color: 'from-amber-400 to-amber-600' },
        { id: 4, name: '养殖贷', minAmount: 5, maxAmount: 80, rate: '4.15%起', term: '6-36个月', desc: '覆盖畜禽、水产等养殖产业的资金周转需求', status: 'active', color: 'from-rose-400 to-rose-600' }
    ];
}
function getBankUsers() {
    try { return JSON.parse(localStorage.getItem('agriBankUsers')) || getDefaultBankUsers(); } catch(e) { return getDefaultBankUsers(); }
}
function saveBankUsers(b) { localStorage.setItem('agriBankUsers', JSON.stringify(b)); }
function getDefaultBankUsers() {
    return [
        { id: 1, username: 'approver1', password: 'approver123', role: '审批员', limit: 50, status: 'active', createdAt: '2026-01-15' },
        { id: 2, username: 'manager1', password: 'manager123', role: '产品经理', limit: 100, status: 'active', createdAt: '2026-02-20' },
        { id: 3, username: 'risk1', password: 'risk123', role: '风控专员', limit: 30, status: 'active', createdAt: '2026-03-10' }
    ];
}
function getCreditData(username) {
    var users = getUsers();
    var u = users.find(function(user) { return user.username === username; });
    return u ? (u.creditScore || getDefaultCredit(username)) : getDefaultCredit(username);
}
function getDefaultCredit(username) {
    var hash = 0;
    for (var i = 0; i < username.length; i++) hash = ((hash << 5) - hash) + username.charCodeAt(i);
    return 400 + Math.abs(hash % 400);
}
function saveCreditData(username, score, reason) {
    var users = getUsers();
    var idx = users.findIndex(function(u) { return u.username === username; });
    if (idx >= 0) {
        users[idx].creditScore = score;
        users[idx].creditUpdatedAt = new Date().toISOString();
        users[idx].creditReason = reason;
        saveUsers(users);
    }
    addActivity('积分调整', username + ' 信用积分调整为 ' + score + '（' + reason + '）');
}
function getActivities() {
    try { return JSON.parse(localStorage.getItem('agriSystemActivities')) || []; } catch(e) { return []; }
}
function addActivity(type, desc) {
    var activities = getActivities();
    activities.unshift({ type: type, desc: desc, time: new Date().toISOString() });
    if (activities.length > 50) activities = activities.slice(0, 50);
    localStorage.setItem('agriSystemActivities', JSON.stringify(activities));
}

function showToast(msg, type) {
    var t = document.getElementById('toast'), tx = document.getElementById('toastText'), ic = document.getElementById('toastIcon');
    tx.textContent = msg;
    t.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transform translate-y-0 opacity-100 transition-all duration-300 flex items-center gap-2 ' + (type==='success'?'bg-agri-600':type==='error'?'bg-red-500':'bg-purple-600');
    ic.innerHTML = type==='success'?'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>':'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';
    setTimeout(function(){ t.style.transform='translateY(-80px)'; t.style.opacity='0'; }, 2800);
}

function formatDate(d) {
    var date = new Date(d);
    var pad = function(n) { return n < 10 ? '0' + n : n; };
    return date.getFullYear() + '-' + pad(date.getMonth()+1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function getCreditLevel(score) {
    if (score >= 700) return { text: '优秀', class: 'bg-agri-100 text-agri-700', color: '#22c55e' };
    if (score >= 600) return { text: '良好', class: 'bg-fin-100 text-fin-700', color: '#3b82f6' };
    if (score >= 500) return { text: '中等', class: 'bg-amber-100 text-amber-700', color: '#f59e0b' };
    if (score >= 400) return { text: '一般', class: 'bg-gray-100 text-gray-700', color: '#6b7280' };
    return { text: '较差', class: 'bg-red-100 text-red-700', color: '#ef4444' };
}

// ==================== 登录管理 ====================
function checkAdminLogin() {
    var loggedIn = sessionStorage.getItem('agriSystemAdminLoggedIn');
    if (loggedIn) {
        document.getElementById('notLoggedIn').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        return true;
    }
    document.getElementById('notLoggedIn').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
    return false;
}

function adminLogout() {
    sessionStorage.removeItem('agriSystemAdminLoggedIn');
    showToast('已安全退出', 'success');
    setTimeout(function() { window.location.href = 'auth.html'; }, 500);
}

// ==================== 模块切换 ====================
function switchModule(module) {
    var modules = ['monitor', 'credit', 'products', 'bankusers', 'permissions', 'logs', 'reports', 'announcements', 'config', 'analysis'];
    modules.forEach(function(m) {
        document.getElementById('module' + m.charAt(0).toUpperCase() + m.slice(1)).classList.add('hidden');
        document.getElementById('nav' + m.charAt(0).toUpperCase() + m.slice(1)).classList.remove('active');
        document.getElementById('nav' + m.charAt(0).toUpperCase() + m.slice(1)).classList.add('text-gray-700');
    });
    document.getElementById('module' + module.charAt(0).toUpperCase() + module.slice(1)).classList.remove('hidden');
    document.getElementById('nav' + module.charAt(0).toUpperCase() + module.slice(1)).classList.add('active');
    document.getElementById('nav' + module.charAt(0).toUpperCase() + module.slice(1)).classList.remove('text-gray-700');

    var el = document.getElementById('module' + module.charAt(0).toUpperCase() + module.slice(1));
    el.classList.remove('animate-fadeInUp');
    void el.offsetWidth;
    el.classList.add('animate-fadeInUp');

    if (module === 'credit') renderCredit();
    if (module === 'products') renderProducts();
    if (module === 'bankusers') renderBankUsers();
    if (module === 'logs') renderLogs();
    if (module === 'reports') renderReports();
    if (module === 'announcements') renderAnnouncements();
    if (module === 'analysis') renderAnalysis();
}

// ==================== 系统监测 ====================
function initDashboard() {
    renderMonitor();
    renderProducts();
}

function renderMonitor() {
    var users = getUsers();
    var products = getProducts();
    var bankUsers = getBankUsers();
    var apps = getApplications();

    var totalCredit = 0;
    users.forEach(function(u) { totalCredit += getCreditData(u.username); });
    var avgCredit = users.length > 0 ? Math.round(totalCredit / users.length) : 0;

    document.getElementById('statUsers').textContent = users.length;
    document.getElementById('statAvgCredit').textContent = avgCredit;
    document.getElementById('statProducts').textContent = products.filter(function(p) { return p.status === 'active'; }).length;
    document.getElementById('statBankUsers').textContent = bankUsers.filter(function(b) { return b.status === 'active'; }).length;
    document.getElementById('totalUsers').textContent = users.length + '人';

    // 今日数据
    var todayApps = 0, todayPaid = 0;
    Object.keys(apps).forEach(function(u) {
        apps[u].forEach(function(a) {
            var d = new Date(a.createdAt);
            if (d.toDateString() === new Date().toDateString()) todayApps++;
            if (a.status === 'paid') todayPaid += a.amount;
        });
    });
    document.getElementById('todayActive').textContent = Math.floor(users.length * 0.3);
    document.getElementById('todayApps').textContent = todayApps;
    document.getElementById('todayPaid').textContent = todayPaid + '万';

    // 活动列表
    var activities = getActivities();
    if (activities.length > 0) {
        var actHtml = activities.slice(0, 8).map(function(a) {
            return '<div class="px-6 py-3 flex items-center gap-3">' +
                '<span class="px-2 py-0.5 text-xs rounded bg-purple-50 text-purple-700">' + a.type + '</span>' +
                '<span class="text-sm text-gray-700 flex-1">' + a.desc + '</span>' +
                '<span class="text-xs text-gray-400">' + formatDate(a.time) + '</span>' +
            '</div>';
        }).join('');
        document.getElementById('activityList').innerHTML = actHtml;
        document.getElementById('activityEmpty').classList.add('hidden');
    } else {
        document.getElementById('activityList').innerHTML = '';
        document.getElementById('activityEmpty').classList.remove('hidden');
    }
}

// ==================== 信用积分管理 =======
function renderCredit(searchTerm) {
    var users = getUsers();
    var filtered = searchTerm ? users.filter(function(u) { return u.username.indexOf(searchTerm) >= 0; }) : users;

    var html = filtered.map(function(u) {
        var score = getCreditData(u.username);
        var level = getCreditLevel(score);
        return '<tr class="hover:bg-gray-50">' +
            '<td class="px-6 py-4 text-sm font-medium text-gray-900">' + u.username + '</td>' +
            '<td class="px-6 py-4 text-sm text-gray-600">' + (u.realName || '-') + '</td>' +
            '<td class="px-6 py-4">' +
                '<div class="flex items-center gap-2">' +
                    '<span class="font-display font-bold text-lg" style="color:' + level.color + '">' + score + '</span>' +
                    '<div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">' +
                        '<div class="h-full rounded-full transition-all" style="width:' + Math.min(score/10, 100) + '%;background:' + level.color + '"></div>' +
                    '</div>' +
                '</div>' +
            '</td>' +
            '<td class="px-6 py-4"><span class="status-badge ' + level.class + '">' + level.text + '</span></td>' +
            '<td class="px-6 py-4 text-xs text-gray-500">' + (u.creditUpdatedAt ? formatDate(u.creditUpdatedAt) : '-') + '</td>' +
            '<td class="px-6 py-4">' +
                '<button onclick="openCreditModal(\'' + u.username + '\')" class="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all">调整</button>' +
            '</td>' +
        '</tr>';
    }).join('');

    if (filtered.length > 0) {
        document.getElementById('creditList').innerHTML = html;
        document.getElementById('creditEmpty').classList.add('hidden');
    } else {
        document.getElementById('creditList').innerHTML = '';
        document.getElementById('creditEmpty').classList.remove('hidden');
    }
}

function searchCredit() {
    var term = document.getElementById('creditSearch').value.trim();
    renderCredit(term);
}

function openCreditModal(username) {
    var users = getUsers();
    var u = users.find(function(user) { return user.username === username; });
    if (!u) return;
    var score = getCreditData(username);

    document.getElementById('creditUsername').value = username;
    document.getElementById('creditModalUser').textContent = username;
    document.getElementById('creditModalCurrent').textContent = score;
    document.getElementById('creditType').value = 'add';
    document.getElementById('creditValue').value = '';
    document.getElementById('creditReason').value = '';
    document.getElementById('creditModal').classList.remove('hidden');
}

function closeCreditModal() { document.getElementById('creditModal').classList.add('hidden'); }

document.getElementById('creditForm').onsubmit = function(e) {
    e.preventDefault();
    var username = document.getElementById('creditUsername').value;
    var type = document.getElementById('creditType').value;
    var value = parseInt(document.getElementById('creditValue').value) || 0;
    var reason = document.getElementById('creditReason').value.trim();

    if (!reason) { showToast('请填写调整原因', 'error'); return; }

    var currentScore = getCreditData(username);
    var newScore = 0;
    if (type === 'add') newScore = Math.min(currentScore + value, 1000);
    else if (type === 'subtract') newScore = Math.max(currentScore - value, 0);
    else newScore = Math.min(Math.max(value, 0), 1000);

    saveCreditData(username, newScore, reason);
    closeCreditModal();
    renderCredit();
    renderMonitor();
    showToast('积分已调整', 'success');
};

// ==================== 贷款产品管理 =======
function renderProducts() {
    var products = getProducts();
    var html = products.map(function(p) {
        return '<div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">' +
            '<div class="flex items-start justify-between mb-4">' +
                '<div class="w-12 h-12 rounded-xl bg-gradient-to-br ' + p.color + ' flex items-center justify-center shadow-md">' +
                    '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
                '</div>' +
                '<span class="px-2 py-1 text-xs rounded-lg ' + (p.status === 'active' ? 'bg-agri-100 text-agri-700' : 'bg-gray-100 text-gray-500') + '">' + (p.status === 'active' ? '上架' : '下架') + '</span>' +
            '</div>' +
            '<h3 class="font-display font-bold text-lg text-gray-900 mb-2">' + p.name + '</h3>' +
            '<p class="text-xs text-gray-500 mb-4 line-clamp-2">' + p.desc + '</p>' +
            '<div class="space-y-2 text-xs text-gray-600 mb-4">' +
                '<div class="flex justify-between"><span>额度范围</span><span class="font-semibold text-gray-900">' + p.minAmount + '-' + p.maxAmount + '万元</span></div>' +
                '<div class="flex justify-between"><span>年化利率</span><span class="font-semibold text-fin-600">' + p.rate + '</span></div>' +
                '<div class="flex justify-between"><span>贷款期限</span><span class="font-semibold text-gray-900">' + p.term + '</span></div>' +
            '</div>' +
            '<div class="flex gap-2">' +
                '<button onclick="editProduct(' + p.id + ')" class="flex-1 py-2 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all">编辑</button>' +
                '<button onclick="toggleProductStatus(' + p.id + ')" class="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all">' + (p.status === 'active' ? '下架' : '上架') + '</button>' +
            '</div>' +
        '</div>';
    }).join('');
    document.getElementById('productList').innerHTML = html || '<div class="col-span-full text-center py-12 text-sm text-gray-400">暂无产品</div>';
}

function openProductModal() {
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModalTitle').textContent = '新增贷款产品';
}

function closeProductModal() { document.getElementById('productModal').classList.add('hidden'); }

function editProduct(id) {
    var products = getProducts();
    var p = products.find(function(item) { return item.id === id; });
    if (!p) return;
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productModalTitle').textContent = '编辑贷款产品';
    document.getElementById('productId').value = p.id;
    document.getElementById('productName').value = p.name;
    document.getElementById('productMinAmount').value = p.minAmount;
    document.getElementById('productMaxAmount').value = p.maxAmount;
    document.getElementById('productRate').value = p.rate;
    document.getElementById('productTerm').value = p.term;
    document.getElementById('productDesc').value = p.desc;
    document.getElementById('productStatus').value = p.status;
}

function toggleProductStatus(id) {
    var products = getProducts();
    var idx = products.findIndex(function(p) { return p.id === id; });
    if (idx >= 0) {
        products[idx].status = products[idx].status === 'active' ? 'inactive' : 'active';
        saveProducts(products);
        renderProducts();
        renderMonitor();
        showToast('状态已更新', 'success');
    }
}

document.getElementById('productForm').onsubmit = function(e) {
    e.preventDefault();
    var id = document.getElementById('productId').value;
    var name = document.getElementById('productName').value.trim();
    var minAmount = parseInt(document.getElementById('productMinAmount').value) || 0;
    var maxAmount = parseInt(document.getElementById('productMaxAmount').value) || 0;
    var rate = document.getElementById('productRate').value.trim();
    var term = document.getElementById('productTerm').value.trim();
    var desc = document.getElementById('productDesc').value.trim();
    var status = document.getElementById('productStatus').value;

    if (!name) { showToast('请输入产品名称', 'error'); return; }

    var products = getProducts();
    var colors = ['from-agri-400 to-agri-600', 'from-fin-400 to-fin-600', 'from-amber-400 to-amber-600', 'from-rose-400 to-rose-600', 'from-purple-400 to-purple-600'];

    if (id) {
        var idx = products.findIndex(function(p) { return p.id === parseInt(id); });
        if (idx >= 0) {
            products[idx].name = name;
            products[idx].minAmount = minAmount;
            products[idx].maxAmount = maxAmount;
            products[idx].rate = rate;
            products[idx].term = term;
            products[idx].desc = desc;
            products[idx].status = status;
        }
        addActivity('产品修改', '修改产品：' + name);
    } else {
        var newId = Math.max.apply(null, products.map(function(p) { return p.id; })) + 1;
        products.push({
            id: newId,
            name: name,
            minAmount: minAmount,
            maxAmount: maxAmount,
            rate: rate,
            term: term,
            desc: desc,
            status: status,
            color: colors[products.length % colors.length]
        });
        addActivity('新增产品', '新增产品：' + name);
    }
    saveProducts(products);
    closeProductModal();
    renderProducts();
    renderMonitor();
    showToast('保存成功', 'success');
};

// ==================== 银行用户管理 =======
function renderBankUsers() {
    var bankUsers = getBankUsers();
    var html = bankUsers.map(function(b) {
        return '<tr class="hover:bg-gray-50">' +
            '<td class="px-6 py-4 text-sm font-medium text-gray-900">' + b.username + '</td>' +
            '<td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-lg bg-purple-50 text-purple-700">' + b.role + '</span></td>' +
            '<td class="px-6 py-4 text-sm font-semibold text-gray-900">' + b.limit + '万元</td>' +
            '<td class="px-6 py-4"><span class="status-badge ' + (b.status === 'active' ? 'bg-agri-100 text-agri-700' : 'bg-gray-100 text-gray-600') + '">' + (b.status === 'active' ? '启用' : '禁用') + '</span></td>' +
            '<td class="px-6 py-4 text-xs text-gray-500">' + (b.createdAt || '-') + '</td>' +
            '<td class="px-6 py-4">' +
                '<button onclick="editBankUser(' + b.id + ')" class="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all">编辑</button>' +
                '<button onclick="toggleBankUserStatus(' + b.id + ')" class="ml-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all">' + (b.status === 'active' ? '禁用' : '启用') + '</button>' +
            '</td>' +
        '</tr>';
    }).join('');

    if (bankUsers.length > 0) {
        document.getElementById('bankUserList').innerHTML = html;
        document.getElementById('bankUserEmpty').classList.add('hidden');
    } else {
        document.getElementById('bankUserList').innerHTML = '';
        document.getElementById('bankUserEmpty').classList.remove('hidden');
    }
}

function openBankUserModal() {
    document.getElementById('bankUserModal').classList.remove('hidden');
    document.getElementById('bankUserForm').reset();
    document.getElementById('bankUserId').value = '';
    document.getElementById('bankUserModalTitle').textContent = '新增银行用户';
}

function closeBankUserModal() { document.getElementById('bankUserModal').classList.add('hidden'); }

function editBankUser(id) {
    var bankUsers = getBankUsers();
    var b = bankUsers.find(function(item) { return item.id === id; });
    if (!b) return;
    document.getElementById('bankUserModal').classList.remove('hidden');
    document.getElementById('bankUserModalTitle').textContent = '编辑银行用户';
    document.getElementById('bankUserId').value = b.id;
    document.getElementById('bankUserName').value = b.username;
    document.getElementById('bankUserPwd').value = b.password;
    document.getElementById('bankUserRole').value = b.role;
    document.getElementById('bankUserLimit').value = b.limit;
    document.getElementById('bankUserStatus').value = b.status;
}

function toggleBankUserStatus(id) {
    var bankUsers = getBankUsers();
    var idx = bankUsers.findIndex(function(b) { return b.id === id; });
    if (idx >= 0) {
        bankUsers[idx].status = bankUsers[idx].status === 'active' ? 'inactive' : 'active';
        saveBankUsers(bankUsers);
        renderBankUsers();
        renderMonitor();
        showToast('状态已更新', 'success');
    }
}

document.getElementById('bankUserForm').onsubmit = function(e) {
    e.preventDefault();
    var id = document.getElementById('bankUserId').value;
    var username = document.getElementById('bankUserName').value.trim();
    var password = document.getElementById('bankUserPwd').value.trim();
    var role = document.getElementById('bankUserRole').value;
    var limit = parseInt(document.getElementById('bankUserLimit').value) || 0;
    var status = document.getElementById('bankUserStatus').value;

    if (!username) { showToast('请输入用户名', 'error'); return; }
    if (!password) { showToast('请输入密码', 'error'); return; }

    var bankUsers = getBankUsers();

    if (id) {
        var idx = bankUsers.findIndex(function(b) { return b.id === parseInt(id); });
        if (idx >= 0) {
            bankUsers[idx].username = username;
            bankUsers[idx].password = password;
            bankUsers[idx].role = role;
            bankUsers[idx].limit = limit;
            bankUsers[idx].status = status;
        }
        addActivity('用户修改', '修改银行用户：' + username);
    } else {
        var newId = Math.max.apply(null, bankUsers.map(function(b) { return b.id; })) + 1;
        bankUsers.push({
            id: newId,
            username: username,
            password: password,
            role: role,
            limit: limit,
            status: status,
            createdAt: new Date().toISOString().substring(0, 10)
        });
        addActivity('新增用户', '新增银行用户：' + username);
    }
    saveBankUsers(bankUsers);
    closeBankUserModal();
    renderBankUsers();
    renderMonitor();
    showToast('保存成功', 'success');
};

// ==================== 数据分析 =======
function renderAnalysis() {
    var users = getUsers();
    var apps = getApplications();

    // 信用积分分布
    var distribution = { excellent: 0, good: 0, medium: 0, normal: 0, poor: 0 };
    users.forEach(function(u) {
        var score = getCreditData(u.username);
        if (score >= 700) distribution.excellent++;
        else if (score >= 600) distribution.good++;
        else if (score >= 500) distribution.medium++;
        else if (score >= 400) distribution.normal++;
        else distribution.poor++;
    });

    var maxDist = Math.max(distribution.excellent, distribution.good, distribution.medium, distribution.normal, distribution.poor, 1);
    var distHtml = [
        { label: '优秀(≥700)', count: distribution.excellent, color: '#22c55e' },
        { label: '良好(600-699)', count: distribution.good, color: '#3b82f6' },
        { label: '中等(500-599)', count: distribution.medium, color: '#f59e0b' },
        { label: '一般(400-499)', count: distribution.normal, color: '#6b7280' },
        { label: '较差(<400)', count: distribution.poor, color: '#ef4444' }
    ].map(function(d) {
        var width = Math.round((d.count / maxDist) * 100);
        return '<div class="flex items-center gap-3">' +
            '<span class="text-xs text-gray-600 w-28">' + d.label + '</span>' +
            '<div class="credit-bar flex-1"><div class="credit-fill" style="width:' + width + '%;background:' + d.color + '"></div></div>' +
            '<span class="text-xs font-semibold text-gray-900">' + d.count + '人</span>' +
        '</div>';
    }).join('');
    document.getElementById('creditDistribution').innerHTML = distHtml || '<div class="text-center text-gray-400 py-8">暂无数据</div>';

    // 贷款统计
    var totalApps = 0, totalPaid = 0, totalAmount = 0, passCount = 0;
    Object.keys(apps).forEach(function(u) {
        apps[u].forEach(function(a) {
            totalApps++;
            if (a.status === 'approved' || a.status === 'paid') passCount++;
            if (a.status === 'paid') totalPaid += a.amount;
            totalAmount += a.amount;
        });
    });

    document.getElementById('totalApps').textContent = totalApps;
    document.getElementById('passRate').textContent = totalApps > 0 ? Math.round(passCount / totalApps * 100) + '%' : '0%';
    document.getElementById('totalPaid').textContent = totalPaid;
    document.getElementById('avgAmount').textContent = totalApps > 0 ? Math.round(totalAmount / totalApps) : 0;
}

// ==================== 操作日志 =======
function getLogs() { return getActivities(); }

function renderLogs() {
    var activities = getLogs();
    var filterType = document.getElementById('logTypeFilter').value;
    var filtered = filterType === 'all' ? activities : activities.filter(function(a) { return a.type.indexOf(filterType) >= 0; });

    if (filtered.length > 0) {
        var html = filtered.slice(0, 20).map(function(a) {
            return '<tr class="hover:bg-gray-50">' +
                '<td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-lg bg-purple-50 text-purple-700">' + a.type + '</span></td>' +
                '<td class="px-6 py-4 text-sm text-gray-900">系统管理员</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + a.desc + '</td>' +
                '<td class="px-6 py-4 text-xs text-gray-500">192.168.1.100</td>' +
                '<td class="px-6 py-4 text-xs text-gray-400">' + formatDate(a.time) + '</td>' +
            '</tr>';
        }).join('');
        document.getElementById('logList').innerHTML = html;
        document.getElementById('logEmpty').classList.add('hidden');
    } else {
        document.getElementById('logList').innerHTML = '';
        document.getElementById('logEmpty').classList.remove('hidden');
    }
}

function filterLogs() { renderLogs(); }

function exportLogs() {
    var activities = getLogs();
    if (activities.length === 0) {
        showToast('暂无日志数据', 'error');
        return;
    }
    var csv = '操作类型,操作内容,操作时间\n';
    activities.forEach(function(a) {
        csv += a.type + ',' + a.desc + ',' + formatDate(a.time) + '\n';
    });
    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '操作日志_' + new Date().toISOString().substring(0, 10) + '.csv';
    link.click();
    showToast('日志导出成功', 'success');
}

// ==================== 报表导出 =======
function getExportRecords() {
    try { return JSON.parse(localStorage.getItem('agriExportRecords')) || []; } catch(e) { return []; }
}
function saveExportRecord(r) {
    var records = getExportRecords();
    records.unshift(r);
    if (records.length > 20) records = records.slice(0, 20);
    localStorage.setItem('agriExportRecords', JSON.stringify(records));
}

function renderReports() {
    var records = getExportRecords();
    if (records.length > 0) {
        var html = records.map(function(r) {
            return '<div class="px-6 py-3 flex items-center justify-between">' +
                '<div class="flex items-center gap-3">' +
                    '<span class="px-2 py-1 text-xs rounded bg-purple-50 text-purple-700">' + r.type + '</span>' +
                    '<span class="text-sm text-gray-700">' + r.name + '</span>' +
                '</div>' +
                '<div class="flex items-center gap-4">' +
                    '<span class="text-xs text-gray-400">' + formatDate(r.time) + '</span>' +
                    '<span class="text-xs text-agri-600">已完成</span>' +
                '</div>' +
            '</div>';
        }).join('');
        document.getElementById('exportList').innerHTML = html;
        document.getElementById('exportEmpty').classList.add('hidden');
    } else {
        document.getElementById('exportList').innerHTML = '';
        document.getElementById('exportEmpty').classList.remove('hidden');
    }
}

function exportReport(type) {
    var typeNames = { users: '用户数据报表', loans: '贷款数据报表', products: '产品统计报表' };
    var users = getUsers();
    var apps = getApplications();
    var csv = '';

    if (type === 'users') {
        csv = '用户名,真实姓名,手机号,信用积分,注册时间\n';
        users.forEach(function(u) {
            csv += u.username + ',' + (u.realName || '') + ',' + (u.phone || '') + ',' + getCreditData(u.username) + ',' + formatDate(u.registeredAt || new Date()) + '\n';
        });
    } else if (type === 'loans') {
        csv = '申请人,产品,金额(万),期限,状态,申请时间\n';
        Object.keys(apps).forEach(function(username) {
            apps[username].forEach(function(a) {
                csv += username + ',' + a.product + ',' + a.amount + ',' + a.term + '个月,' + a.status + ',' + formatDate(a.createdAt) + '\n';
            });
        });
    } else if (type === 'products') {
        var products = getProducts();
        csv = '产品名称,额度范围,年化利率,期限,状态\n';
        products.forEach(function(p) {
            csv += p.name + ',' + p.minAmount + '-' + p.maxAmount + '万,' + p.rate + ',' + p.term + ',' + (p.status === 'active' ? '上架' : '下架') + '\n';
        });
    }

    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = typeNames[type] + '_' + new Date().toISOString().substring(0, 10) + '.csv';
    link.click();

    saveExportRecord({ type: typeNames[type], name: link.download, time: new Date().toISOString() });
    renderReports();
    showToast('报表导出成功', 'success');
}

// ==================== 公告管理 =======
function getAnnouncements() {
    try { return JSON.parse(localStorage.getItem('agriAnnouncements')) || []; } catch(e) { return []; }
}
function saveAnnouncements(a) { localStorage.setItem('agriAnnouncements', JSON.stringify(a)); }

function renderAnnouncements() {
    var announcements = getAnnouncements();
    if (announcements.length > 0) {
        var html = announcements.map(function(a, idx) {
            var typeColors = {
                '系统通知': 'bg-purple-50 text-purple-700',
                '政策公告': 'bg-fin-50 text-fin-700',
                '产品更新': 'bg-agri-50 text-agri-700',
                '维护通知': 'bg-warn-50 text-warn-700'
            };
            var statusConfig = {
                published: { text: '已发布', class: 'bg-agri-100 text-agri-700' },
                draft: { text: '草稿', class: 'bg-gray-100 text-gray-600' }
            };
            var s = statusConfig[a.status] || statusConfig.draft;
            return '<tr class="hover:bg-gray-50">' +
                '<td class="px-6 py-4 text-sm font-medium text-gray-900">' + a.title + '</td>' +
                '<td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-lg ' + (typeColors[a.type] || typeColors['系统通知']) + '">' + a.type + '</span></td>' +
                '<td class="px-6 py-4"><span class="status-badge ' + s.class + '">' + s.text + '</span></td>' +
                '<td class="px-6 py-4 text-xs text-gray-400">' + formatDate(a.createdAt) + '</td>' +
                '<td class="px-6 py-4">' +
                    '<button onclick="toggleAnnouncement(' + idx + ')" class="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all">' + (a.status === 'published' ? '下架' : '发布') + '</button>' +
                    '<button onclick="deleteAnnouncement(' + idx + ')" class="ml-2 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all">删除</button>' +
                '</td>' +
            '</tr>';
        }).join('');
        document.getElementById('announcementList').innerHTML = html;
        document.getElementById('announcementEmpty').classList.add('hidden');
    } else {
        document.getElementById('announcementList').innerHTML = '';
        document.getElementById('announcementEmpty').classList.remove('hidden');
    }
}

function openAnnouncementModal() { document.getElementById('announcementForm').reset(); document.getElementById('announcementModal').classList.remove('hidden'); }
function closeAnnouncementModal() { document.getElementById('announcementModal').classList.add('hidden'); }

document.getElementById('announcementForm').onsubmit = function(e) {
    e.preventDefault();
    var announcements = getAnnouncements();
    announcements.unshift({
        title: document.getElementById('announcementTitle').value.trim(),
        type: document.getElementById('announcementType').value,
        content: document.getElementById('announcementContent').value.trim(),
        status: document.getElementById('announcementStatus').value,
        createdAt: new Date().toISOString()
    });
    saveAnnouncements(announcements);
    closeAnnouncementModal();
    renderAnnouncements();
    addActivity('发布公告', '发布系统公告：' + document.getElementById('announcementTitle').value.trim());
    showToast('公告已发布', 'success');
};

function toggleAnnouncement(idx) {
    var announcements = getAnnouncements();
    if (announcements[idx]) {
        announcements[idx].status = announcements[idx].status === 'published' ? 'draft' : 'published';
        saveAnnouncements(announcements);
        renderAnnouncements();
        showToast('状态已更新', 'success');
    }
}

function deleteAnnouncement(idx) {
    var announcements = getAnnouncements();
    if (announcements[idx]) {
        announcements.splice(idx, 1);
        saveAnnouncements(announcements);
        renderAnnouncements();
        showToast('公告已删除', 'success');
    }
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    if (checkAdminLogin()) {
        initDashboard();
    }
});
