// ==================== 工具函数 ====================
function getUsers() { try { return JSON.parse(localStorage.getItem('agriCreditUsers')) || []; } catch(e) { return []; } }
function getApplications() {
    var all = {};
    try { all = JSON.parse(localStorage.getItem('agriLoanApplications')) || {}; } catch(e) {}
    return all;
}
function saveApplications(apps) { localStorage.setItem('agriLoanApplications', JSON.stringify(apps)); }
function getDemands() {
    try { return JSON.parse(localStorage.getItem('agriLoanDemands')) || []; } catch(e) { return []; }
}
function maskPhone(p) { return p ? p.substring(0,3) + '****' + p.substring(7) : '-'; }
function formatDate(d) {
    var date = new Date(d);
    var pad = function(n) { return n < 10 ? '0' + n : n; };
    return date.getFullYear() + '-' + pad(date.getMonth()+1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}
function showToast(msg, type) {
    var t = document.getElementById('toast'), tx = document.getElementById('toastText'), ic = document.getElementById('toastIcon');
    tx.textContent = msg;
    t.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transform translate-y-0 opacity-100 transition-all duration-300 flex items-center gap-2 ' + (type==='success'?'bg-agri-600':'bg-red-500');
    ic.innerHTML = type==='success'?'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>':'<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';
    setTimeout(function(){t.style.transform='translateY(-80px)';t.style.opacity='0';},2800);
}
function getCreditData(username) {
    var users = getUsers();
    var u = users.find(function(user) { return user.username === username; });
    if (u && u.creditScore) return u.creditScore;
    var hash = 0;
    for (var i = 0; i < username.length; i++) hash = ((hash << 5) - hash) + username.charCodeAt(i);
    return 400 + Math.abs(hash % 400);
}
function getRiskLevel(days) {
    if (days > 30) return { text: '高风险', class: 'bg-red-100 text-red-700', color: '#ef4444' };
    if (days > 15) return { text: '中风险', class: 'bg-warn-100 text-warn-700', color: '#f59e0b' };
    return { text: '低风险', class: 'bg-amber-100 text-amber-700', color: '#d97706' };
}

// ==================== 登录管理 ====================
var isAdminLoggedIn = false;
var currentApprovalFilter = 'all';
var currentOverdueFilter = 'all';
var currentAppId = null;
var currentAppUsername = null;
var currentDisburseId = null;
var currentDisburseUsername = null;

function checkAdminLogin() {
    var loggedIn = sessionStorage.getItem('agriAdminLoggedIn');
    if (loggedIn) {
        isAdminLoggedIn = true;
        document.getElementById('notLoggedIn').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        return true;
    }
    document.getElementById('notLoggedIn').classList.remove('hidden');
    document.getElementById('adminPanel').classList.add('hidden');
    return false;
}

function adminLogout() {
    sessionStorage.removeItem('agriAdminLoggedIn');
    isAdminLoggedIn = false;
    showToast('已安全退出', 'success');
    setTimeout(function() { window.location.href = 'auth.html'; }, 500);
}

// ==================== 模块切换 ====================
function switchModule(module) {
    var modules = ['workbench', 'overview', 'approval', 'disbursement', 'overdue', 'followup', 'performance', 'demands', 'farmers'];
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

    if (module === 'approval') renderApproval();
    if (module === 'disbursement') renderDisbursement();
    if (module === 'overdue') renderOverdue();
    if (module === 'followup') renderFollowup();
    if (module === 'performance') renderPerformance();
    if (module === 'demands') renderDemands();
    if (module === 'farmers') renderFarmers();
}

// ==================== 业务概览 ====================
function initDashboard() {
    var apps = getApplications();
    var users = getUsers();

    // 计算统计数据
    var pendingCount = 0, paidAmount = 0, todayApproval = 0, overdueCount = 0;
    Object.keys(apps).forEach(function(username) {
        apps[username].forEach(function(app) {
            if (app.status === 'pending') pendingCount++;
            if (app.status === 'approved') pendingCount++; // 待放款也算待处理
            if (app.status === 'paid') {
                paidAmount += app.amount;
                // 模拟逾期计算
                var paidDate = new Date(app.paidAt || app.createdAt);
                var now = new Date();
                var daysDiff = Math.floor((now - paidDate) / (1000 * 60 * 60 * 24));
                if (daysDiff > 60 && Math.random() > 0.7) overdueCount++; // 模拟部分逾期
            }
            // 模拟今日审批
            var appDate = new Date(app.createdAt);
            var today = new Date();
            if (appDate.toDateString() === today.toDateString() && (app.status === 'approved' || app.status === 'rejected')) {
                todayApproval++;
            }
        });
    });

    document.getElementById('statTodayApproval').textContent = todayApproval;
    document.getElementById('statPending').textContent = pendingCount;
    document.getElementById('statPaidAmount').textContent = paidAmount;
    document.getElementById('statOverdue').textContent = overdueCount;

    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('disburseCount').textContent = Object.keys(apps).reduce(function(c, u) {
        return c + apps[u].filter(function(a) { return a.status === 'approved'; }).length;
    }, 0);
    document.getElementById('overdueCount').textContent = overdueCount;

    // 最近申请
    var recentApps = [];
    Object.keys(apps).forEach(function(username) {
        apps[username].forEach(function(app) {
            recentApps.push({ username: username, ...app });
        });
    });
    recentApps.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    recentApps = recentApps.slice(0, 5);

    if (recentApps.length > 0) {
        var html = recentApps.map(function(app) {
            var statusConfig = {
                pending: { text: '待审批', class: 'bg-warn-100 text-warn-700' },
                approved: { text: '已通过', class: 'bg-agri-100 text-agri-700' },
                rejected: { text: '已拒绝', class: 'bg-red-100 text-red-700' },
                paid: { text: '已放款', class: 'bg-fin-100 text-fin-700' }
            };
            var s = statusConfig[app.status] || statusConfig.pending;
            return '<div class="px-6 py-3 flex items-center justify-between">' +
                '<div class="flex items-center gap-3">' +
                    '<div class="w-8 h-8 rounded-full bg-fin-100 flex items-center justify-center text-fin-700 font-semibold text-sm">' + app.username.charAt(0).toUpperCase() + '</div>' +
                    '<div><span class="font-medium text-gray-900">' + app.username + '</span><span class="text-xs text-gray-400 ml-2">' + app.product + '</span></div>' +
                '</div>' +
                '<div class="flex items-center gap-4">' +
                    '<span class="font-semibold text-gray-900">' + app.amount + '万</span>' +
                    '<span class="status-badge ' + s.class + '">' + s.text + '</span>' +
                    '<span class="text-xs text-gray-400">' + formatDate(app.createdAt) + '</span>' +
                '</div>' +
            '</div>';
        }).join('');
        document.getElementById('recentApps').innerHTML = html;
        document.getElementById('recentAppsEmpty').classList.add('hidden');
    } else {
        document.getElementById('recentApps').innerHTML = '';
        document.getElementById('recentAppsEmpty').classList.remove('hidden');
    }

    renderApproval();
}

// ==================== 贷款审批 ====================
function filterApproval(status) {
    currentApprovalFilter = status;
    document.querySelectorAll('.approval-filter').forEach(function(btn) {
        btn.classList.remove('bg-fin-600', 'text-white');
        btn.classList.add('bg-white', 'text-gray-600');
    });
    event.target.classList.add('bg-fin-600', 'text-white');
    event.target.classList.remove('bg-white', 'text-gray-600');
    renderApproval();
}

function renderApproval() {
    var apps = getApplications();
    var list = [];

    Object.keys(apps).forEach(function(username) {
        apps[username].forEach(function(app, idx) {
            if (currentApprovalFilter === 'all' || app.status === currentApprovalFilter) {
                list.push({ username: username, idx: idx, ...app });
            }
        });
    });

    list.sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    if (list.length > 0) {
        var html = list.map(function(app) {
            var statusConfig = {
                pending: { text: '待审批', class: 'bg-warn-100 text-warn-700' },
                approved: { text: '已通过', class: 'bg-agri-100 text-agri-700' },
                rejected: { text: '已拒绝', class: 'bg-red-100 text-red-700' },
                paid: { text: '已放款', class: 'bg-fin-100 text-fin-700' }
            };
            var s = statusConfig[app.status] || statusConfig.pending;
            var actionBtn = app.status === 'pending' ?
                '<button onclick="openApprovalModal(\'' + app.username + '\', ' + app.idx + ')" class="px-3 py-1.5 text-xs font-medium text-fin-700 bg-fin-50 border border-fin-200 rounded-lg hover:bg-fin-100 transition-all">审批</button>' :
                '<span class="text-xs text-gray-400">已处理</span>';
            return '<tr class="hover:bg-gray-50">' +
                '<td class="px-6 py-4 text-sm font-medium text-gray-900">' + app.username + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + app.product + '</td>' +
                '<td class="px-6 py-4 text-sm font-semibold text-gray-900">' + app.amount + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + app.term + '个月</td>' +
                '<td class="px-6 py-4 text-sm text-gray-500">' + (app.purpose || '-') + '</td>' +
                '<td class="px-6 py-4"><span class="status-badge ' + s.class + '">' + s.text + '</span></td>' +
                '<td class="px-6 py-4 text-xs text-gray-400">' + formatDate(app.createdAt) + '</td>' +
                '<td class="px-6 py-4">' + actionBtn + '</td>' +
            '</tr>';
        }).join('');
        document.getElementById('approvalList').innerHTML = html;
        document.getElementById('approvalEmpty').classList.add('hidden');
    } else {
        document.getElementById('approvalList').innerHTML = '';
        document.getElementById('approvalEmpty').classList.remove('hidden');
    }
}

function openApprovalModal(username, idx) {
    var apps = getApplications();
    var app = apps[username][idx];
    currentAppId = idx;
    currentAppUsername = username;
    document.getElementById('approvalUser').textContent = username;
    document.getElementById('approvalProduct').textContent = app.product;
    document.getElementById('approvalAmount').textContent = app.amount + '万元';
    document.getElementById('approvalTerm').textContent = app.term + '个月';
    document.getElementById('approvalPurpose').textContent = app.purpose || '-';
    document.getElementById('approvalComment').value = '';
    document.getElementById('approvalModal').classList.remove('hidden');
}

function closeApprovalModal() { document.getElementById('approvalModal').classList.add('hidden'); }

function approveApplication() {
    var comment = document.getElementById('approvalComment').value.trim();
    if (!comment) { showToast('请填写审批意见', 'error'); return; }
    var apps = getApplications();
    apps[currentAppUsername][currentAppId].status = 'approved';
    apps[currentAppUsername][currentAppId].approvedAt = new Date().toISOString();
    apps[currentAppUsername][currentAppId].approvalComment = comment;
    saveApplications(apps);
    closeApprovalModal();
    initDashboard();
    showToast('审批通过', 'success');
}

function rejectApplication() {
    var comment = document.getElementById('approvalComment').value.trim();
    if (!comment) { showToast('请填写拒绝原因', 'error'); return; }
    var apps = getApplications();
    apps[currentAppUsername][currentAppId].status = 'rejected';
    apps[currentAppUsername][currentAppId].rejectedAt = new Date().toISOString();
    apps[currentAppUsername][currentAppId].approvalComment = comment;
    saveApplications(apps);
    closeApprovalModal();
    initDashboard();
    showToast('申请已拒绝', 'success');
}

// ==================== 放款管理 ====================
function renderDisbursement() {
    var apps = getApplications();
    var pendingList = [], doneList = [];

    Object.keys(apps).forEach(function(username) {
        apps[username].forEach(function(app, idx) {
            if (app.status === 'approved') pendingList.push({ username: username, idx: idx, ...app });
            if (app.status === 'paid') doneList.push({ username: username, idx: idx, ...app });
        });
    });

    document.getElementById('disbursePending').textContent = pendingList.length;
    document.getElementById('disburseDone').textContent = doneList.length;

    if (pendingList.length > 0) {
        var html = pendingList.map(function(app) {
            return '<tr class="hover:bg-gray-50">' +
                '<td class="px-6 py-4 text-sm font-medium text-gray-900">' + app.username + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + app.product + '</td>' +
                '<td class="px-6 py-4 text-sm font-semibold text-agri-600">' + app.amount + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + app.term + '个月</td>' +
                '<td class="px-6 py-4 text-xs text-gray-400">' + formatDate(app.approvedAt || app.createdAt) + '</td>' +
                '<td class="px-6 py-4"><span class="status-badge bg-agri-100 text-agri-700">待放款</span></td>' +
                '<td class="px-6 py-4"><button onclick="openDisburseModal(\'' + app.username + '\', ' + app.idx + ')" class="px-3 py-1.5 text-xs font-medium text-agri-700 bg-agri-50 border border-agri-200 rounded-lg hover:bg-agri-100 transition-all">放款</button></td>' +
            '</tr>';
        }).join('');
        document.getElementById('disburseList').innerHTML = html;
        document.getElementById('disburseEmpty').classList.add('hidden');
    } else {
        document.getElementById('disburseList').innerHTML = '';
        document.getElementById('disburseEmpty').classList.remove('hidden');
    }
}

function openDisburseModal(username, idx) {
    var apps = getApplications();
    var app = apps[username][idx];
    currentDisburseId = idx;
    currentDisburseUsername = username;
    document.getElementById('disburseUser').textContent = username;
    document.getElementById('disburseProduct').textContent = app.product;
    document.getElementById('disburseAmount').textContent = app.amount + '万元';
    document.getElementById('disburseTerm').textContent = app.term + '个月';
    document.getElementById('disburseModal').classList.remove('hidden');
}

function closeDisburseModal() { document.getElementById('disburseModal').classList.add('hidden'); }

function confirmDisburse() {
    var apps = getApplications();
    apps[currentDisburseUsername][currentDisburseId].status = 'paid';
    apps[currentDisburseUsername][currentDisburseId].paidAt = new Date().toISOString();
    saveApplications(apps);
    closeDisburseModal();
    initDashboard();
    renderDisbursement();
    showToast('放款成功', 'success');
}

// ==================== 逾期预警 ====================
function filterOverdue(level) {
    currentOverdueFilter = level;
    document.querySelectorAll('.overdue-filter').forEach(function(btn) {
        btn.classList.remove('bg-red-600', 'text-white');
        btn.classList.add('bg-white', 'text-gray-600');
    });
    event.target.classList.add('bg-red-600', 'text-white');
    event.target.classList.remove('bg-white', 'text-gray-600');
    renderOverdue();
}

function renderOverdue() {
    // 模拟逾期数据
    var overdueData = [
        { username: 'user001', amount: 15, days: 45, unpaid: 12, phone: '138****1234', risk: 'high' },
        { username: 'farmer_zhang', amount: 30, days: 28, unpaid: 25, phone: '139****5678', risk: 'medium' },
        { username: 'wang_farm', amount: 8, days: 10, unpaid: 7, phone: '137****9012', risk: 'low' }
    ];

    // 筛选
    var filtered = currentOverdueFilter === 'all' ? overdueData : overdueData.filter(function(d) { return d.risk === currentOverdueFilter; });

    // 统计
    document.getElementById('highRisk').textContent = overdueData.filter(function(d) { return d.risk === 'high'; }).length;
    document.getElementById('mediumRisk').textContent = overdueData.filter(function(d) { return d.risk === 'medium'; }).length;
    document.getElementById('lowRisk').textContent = overdueData.filter(function(d) { return d.risk === 'low'; }).length;

    if (filtered.length > 0) {
        var html = filtered.map(function(d) {
            var r = getRiskLevel(d.days);
            return '<tr class="hover:bg-gray-50">' +
                '<td class="px-6 py-4 text-sm font-medium text-gray-900">' + d.username + '</td>' +
                '<td class="px-6 py-4 text-sm font-semibold text-gray-900">' + d.amount + '万</td>' +
                '<td class="px-6 py-4 text-sm text-red-600 font-medium">' + d.days + '天</td>' +
                '<td class="px-6 py-4"><span class="status-badge ' + r.class + '">' + r.text + '</span></td>' +
                '<td class="px-6 py-4 text-sm font-semibold text-red-600">' + d.unpaid + '万</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + d.phone + '</td>' +
                '<td class="px-6 py-4">' +
                    '<button onclick="alert(\'催收记录已更新\')" class="px-3 py-1.5 text-xs font-medium text-fin-700 bg-fin-50 border border-fin-200 rounded-lg hover:bg-fin-100 transition-all">记录催收</button>' +
                '</td>' +
            '</tr>';
        }).join('');
        document.getElementById('overdueList').innerHTML = html;
        document.getElementById('overdueEmpty').classList.add('hidden');
    } else {
        document.getElementById('overdueList').innerHTML = '';
        document.getElementById('overdueEmpty').classList.remove('hidden');
    }
}

// ==================== 贷款需求 ====================
function renderDemands() {
    var demands = getDemands();
    if (demands.length > 0) {
        var html = demands.map(function(d) {
            return '<tr class="hover:bg-gray-50">' +
                '<td class="px-6 py-4 text-sm font-medium text-gray-900">' + d.username + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + d.type + '</td>' +
                '<td class="px-6 py-4 text-sm font-semibold text-gray-900">' + d.amount + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + d.term + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-500">' + (d.purpose || '-') + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-500">' + (d.note || '-') + '</td>' +
                '<td class="px-6 py-4 text-xs text-gray-400">' + formatDate(d.createdAt) + '</td>' +
            '</tr>';
        }).join('');
        document.getElementById('demandList').innerHTML = html;
        document.getElementById('demandEmpty').classList.add('hidden');
    } else {
        document.getElementById('demandList').innerHTML = '';
        document.getElementById('demandEmpty').classList.remove('hidden');
    }
}

// ==================== 农户信息 ====================
function searchFarmers() {
    var term = document.getElementById('farmerSearch').value.trim().toLowerCase();
    renderFarmers(term);
}

function renderFarmers(searchTerm) {
    var users = getUsers();
    var apps = getApplications();
    var filtered = searchTerm ? users.filter(function(u) {
        return u.username.toLowerCase().indexOf(searchTerm) >= 0 || (u.realName && u.realName.toLowerCase().indexOf(searchTerm) >= 0);
    }) : users;

    if (filtered.length > 0) {
        var html = filtered.map(function(u) {
            var userApps = apps[u.username] || [];
            var credit = getCreditData(u.username);
            return '<tr class="hover:bg-gray-50">' +
                '<td class="px-6 py-4 text-sm font-medium text-gray-900">' + u.username + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + (u.realName || '-') + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + maskPhone(u.phone) + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + (u.businessType || '-') + '</td>' +
                '<td class="px-6 py-4"><span class="font-semibold ' + (credit >= 600 ? 'text-agri-600' : credit >= 500 ? 'text-warn-600' : 'text-red-600') + '">' + credit + '</span></td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + userApps.length + '</td>' +
                '<td class="px-6 py-4 text-xs text-gray-400">' + formatDate(u.registeredAt || new Date()) + '</td>' +
            '</tr>';
        }).join('');
        document.getElementById('farmerList').innerHTML = html;
        document.getElementById('farmerEmpty').classList.add('hidden');
    } else {
        document.getElementById('farmerList').innerHTML = '';
        document.getElementById('farmerEmpty').classList.remove('hidden');
    }
}

// ==================== 工作台 ====================
function initWorkbench() {
    var apps = getApplications();
    var followups = getFollowups();
    var overdueData = getSimulatedOverdue();

    // 计算待审批数
    var pendingCount = 0;
    Object.keys(apps).forEach(function(username) {
        apps[username].forEach(function(app) {
            if (app.status === 'pending') pendingCount++;
        });
    });

    // 计算待放款数
    var disburseCount = 0;
    Object.keys(apps).forEach(function(username) {
        apps[username].forEach(function(app) {
            if (app.status === 'approved') disburseCount++;
        });
    });

    // 计算待跟进数
    var followupPending = followups.filter(function(f) { return f.status === 'pending'; }).length;

    document.getElementById('myPending').textContent = pendingCount;
    document.getElementById('myDisburse').textContent = disburseCount;
    document.getElementById('myOverdue').textContent = overdueData.length;
    document.getElementById('myFollowup').textContent = followupPending;

    // 最近处理记录
    var workLogs = [];
    Object.keys(apps).forEach(function(username) {
        apps[username].forEach(function(app) {
            if (app.status !== 'pending') {
                workLogs.push({
                    type: app.status === 'approved' ? '审批通过' : app.status === 'rejected' ? '审批拒绝' : '已放款',
                    username: username,
                    product: app.product,
                    amount: app.amount,
                    time: app.approvedAt || app.paidAt || app.createdAt
                });
            }
        });
    });
    workLogs.sort(function(a, b) { return new Date(b.time) - new Date(a.time); });
    workLogs = workLogs.slice(0, 5);

    if (workLogs.length > 0) {
        var html = workLogs.map(function(log) {
            var typeColor = log.type === '审批通过' ? 'bg-agri-50 text-agri-700' : log.type === '审批拒绝' ? 'bg-red-50 text-red-700' : 'bg-fin-50 text-fin-700';
            return '<div class="px-6 py-3 flex items-center gap-3">' +
                '<span class="px-2 py-0.5 text-xs rounded ' + typeColor + '">' + log.type + '</span>' +
                '<span class="text-sm text-gray-700 flex-1">' + log.username + ' - ' + log.product + ' (' + log.amount + '万)</span>' +
                '<span class="text-xs text-gray-400">' + formatDate(log.time) + '</span>' +
            '</div>';
        }).join('');
        document.getElementById('recentWorkLog').innerHTML = html;
        document.getElementById('workLogEmpty').classList.add('hidden');
    } else {
        document.getElementById('recentWorkLog').innerHTML = '';
        document.getElementById('workLogEmpty').classList.remove('hidden');
    }
}

// ==================== 客户跟进 ====================
function getFollowups() {
    try { return JSON.parse(localStorage.getItem('agriFollowups')) || []; } catch(e) { return []; }
}
function saveFollowups(f) { localStorage.setItem('agriFollowups', JSON.stringify(f)); }

function renderFollowup() {
    var followups = getFollowups();

    // 统计
    document.getElementById('followupTotal').textContent = followups.length;
    document.getElementById('followupCompleted').textContent = followups.filter(function(f) { return f.status === 'completed'; }).length;
    document.getElementById('followupPending').textContent = followups.filter(function(f) { return f.status === 'pending'; }).length;
    document.getElementById('followupConverted').textContent = followups.filter(function(f) { return f.status === 'converted'; }).length;

    if (followups.length > 0) {
        var html = followups.map(function(f) {
            var statusConfig = {
                pending: { text: '待跟进', class: 'bg-warn-100 text-warn-700' },
                completed: { text: '已完成', class: 'bg-agri-100 text-agri-700' },
                converted: { text: '已转化', class: 'bg-purple-100 text-purple-700' }
            };
            var s = statusConfig[f.status] || statusConfig.pending;
            return '<tr class="hover:bg-gray-50">' +
                '<td class="px-6 py-4 text-sm font-medium text-gray-900">' + f.name + '</td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + f.phone + '</td>' +
                '<td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-lg bg-fin-50 text-fin-700">' + f.type + '</span></td>' +
                '<td class="px-6 py-4 text-sm text-gray-600">' + f.content + '</td>' +
                '<td class="px-6 py-4"><span class="status-badge ' + s.class + '">' + s.text + '</span></td>' +
                '<td class="px-6 py-4 text-xs text-gray-500">' + (f.nextDate || '-') + '</td>' +
                '<td class="px-6 py-4 text-xs text-gray-400">' + formatDate(f.createdAt) + '</td>' +
            '</tr>';
        }).join('');
        document.getElementById('followupList').innerHTML = html;
        document.getElementById('followupEmpty').classList.add('hidden');
    } else {
        document.getElementById('followupList').innerHTML = '';
        document.getElementById('followupEmpty').classList.remove('hidden');
    }
}

function openFollowupModal() {
    document.getElementById('followupForm').reset();
    document.getElementById('followupModal').classList.remove('hidden');
}
function closeFollowupModal() { document.getElementById('followupModal').classList.add('hidden'); }

document.getElementById('followupForm').onsubmit = function(e) {
    e.preventDefault();
    var followups = getFollowups();
    followups.unshift({
        name: document.getElementById('followupName').value.trim(),
        phone: document.getElementById('followupPhone').value.trim(),
        type: document.getElementById('followupType').value,
        content: document.getElementById('followupContent').value.trim(),
        status: document.getElementById('followupStatus').value,
        nextDate: document.getElementById('followupNext').value,
        createdAt: new Date().toISOString()
    });
    saveFollowups(followups);
    closeFollowupModal();
    renderFollowup();
    initWorkbench();
    showToast('跟进记录已保存', 'success');
};

// ==================== 业绩统计 ====================
function getSimulatedOverdue() {
    return [
        { username: 'user001', amount: 15, days: 45 },
        { username: 'farmer_zhang', amount: 30, days: 28 },
        { username: 'wang_farm', amount: 8, days: 10 }
    ];
}

function renderPerformance() {
    var apps = getApplications();
    var totalApproval = 0, totalAmount = 0, passCount = 0;

    Object.keys(apps).forEach(function(username) {
        apps[username].forEach(function(app) {
            totalApproval++;
            if (app.status === 'approved' || app.status === 'paid') passCount++;
            if (app.status === 'paid') totalAmount += app.amount;
        });
    });

    document.getElementById('perfApproval').textContent = totalApproval;
    document.getElementById('perfAmount').textContent = totalAmount;
    document.getElementById('perfPassRate').textContent = totalApproval > 0 ? Math.round(passCount / totalApproval * 100) : 0;
    document.getElementById('perfSatisfaction').textContent = '4.8';
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    if (checkAdminLogin()) {
        initWorkbench();
        initDashboard();
    }
});
