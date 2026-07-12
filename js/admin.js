(function () {
    'use strict';

    // ==================== 工具函数 ====================
    function safeGetJSON(key, fallback) {
        try {
            return JSON.parse(localStorage.getItem(key)) || fallback;
        } catch (e) {
            return fallback;
        }
    }

    function safeSetJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            showToast('存储空间不足，操作失败', 'error');
        }
    }

    function getUsers() { return safeGetJSON('agriCreditUsers', []); }
    function saveUsers(u) { safeSetJSON('agriCreditUsers', u); }

    function getApplications() {
        return safeGetJSON('agriLoanApplications', {});
    }

    function getDefaultProducts() {
        return [
            { id: 1, name: '惠农贷', minAmount: 1, maxAmount: 30, rate: '3.85%起', term: '1-36个月', desc: '面向农户的综合信用贷款，无需抵押，纯信用授信', status: 'active', color: 'from-agri-400 to-agri-600' },
            { id: 2, name: '农机贷', minAmount: 5, maxAmount: 100, rate: '4.35%起', term: '6-60个月', desc: '专项用于购置农业机械设备，支持分期还款', status: 'active', color: 'from-fin-400 to-fin-600' },
            { id: 3, name: '种植贷', minAmount: 2, maxAmount: 50, rate: '3.65%起', term: '3-24个月', desc: '支持粮食、经济作物等种植生产的流动资金需求', status: 'active', color: 'from-amber-400 to-amber-600' },
            { id: 4, name: '养殖贷', minAmount: 5, maxAmount: 80, rate: '4.15%起', term: '6-36个月', desc: '覆盖畜禽、水产等养殖产业的资金周转需求', status: 'active', color: 'from-rose-400 to-rose-600' }
        ];
    }

    function getProducts() { return safeGetJSON('agriLoanProducts', null) || getDefaultProducts(); }
    function saveProducts(p) { safeSetJSON('agriLoanProducts', p); }

    function getDefaultBankUsers() {
        return [
            { id: 1, username: 'approver1', password: 'approver123', role: '审批员', limit: 50, status: 'active', createdAt: '2026-01-15' },
            { id: 2, username: 'manager1', password: 'manager123', role: '产品经理', limit: 100, status: 'active', createdAt: '2026-02-20' },
            { id: 3, username: 'risk1', password: 'risk123', role: '风控专员', limit: 30, status: 'active', createdAt: '2026-03-10' }
        ];
    }

    function getBankUsers() { return safeGetJSON('agriBankUsers', null) || getDefaultBankUsers(); }
    function saveBankUsers(b) { safeSetJSON('agriBankUsers', b); }

    function getCreditData(username) {
        const users = getUsers();
        const u = users.find(user => user.username === username);
        return u ? (u.creditScore || getDefaultCredit(username)) : getDefaultCredit(username);
    }

    function getDefaultCredit(username) {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = ((hash << 5) - hash) + username.charCodeAt(i);
        }
        return 400 + Math.abs(hash % 400);
    }

    function saveCreditData(username, score, reason) {
        const users = getUsers();
        const idx = users.findIndex(u => u.username === username);
        if (idx >= 0) {
            users[idx].creditScore = score;
            users[idx].creditUpdatedAt = new Date().toISOString();
            users[idx].creditReason = reason;
            saveUsers(users);
        }
        addActivity('积分调整', username + ' 信用积分调整为 ' + score + '（' + reason + '）');
    }

    function getActivities() { return safeGetJSON('agriSystemActivities', []); }

    function addActivity(type, desc) {
        const activities = getActivities();
        activities.unshift({ type, desc, time: new Date().toISOString() });
        if (activities.length > 50) activities.length = 50;
        safeSetJSON('agriSystemActivities', activities);
    }

    function showToast(msg, type) {
        const t = document.getElementById('toast');
        const tx = document.getElementById('toastText');
        const ic = document.getElementById('toastIcon');
        tx.textContent = msg;
        const bgClass = type === 'success' ? 'bg-agri-600' : type === 'error' ? 'bg-red-500' : 'bg-purple-600';
        t.className = `fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transform translate-y-0 opacity-100 transition-all duration-300 flex items-center gap-2 ${bgClass}`;
        ic.innerHTML = type === 'success'
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';
        setTimeout(() => {
            t.style.transform = 'translateY(-80px)';
            t.style.opacity = '0';
        }, 2800);
    }

    function formatDate(d) {
        const date = new Date(d);
        const pad = n => n < 10 ? '0' + n : n;
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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
        const loggedIn = sessionStorage.getItem('agriSystemAdminLoggedIn');
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
        setTimeout(() => { window.location.href = 'auth.html'; }, 500);
    }

    // ==================== 模块切换（事件委托） ====================
    const MODULES = ['monitor', 'credit', 'products', 'bankusers', 'permissions', 'logs', 'reports', 'announcements', 'config', 'analysis'];
    const MODULE_RENDER = {
        credit: renderCredit,
        products: renderProducts,
        bankusers: renderBankUsers,
        logs: renderLogs,
        reports: renderReports,
        announcements: renderAnnouncements,
        analysis: renderAnalysis
    };

    function capitalizeFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    function switchModule(module) {
        MODULES.forEach(m => {
            const key = capitalizeFirst(m);
            document.getElementById('module' + key).classList.add('hidden');
            const nav = document.getElementById('nav' + key);
            nav.classList.remove('active');
            nav.classList.add('text-gray-700');
        });

        const activeKey = capitalizeFirst(module);
        const el = document.getElementById('module' + activeKey);
        el.classList.remove('hidden');
        const activeNav = document.getElementById('nav' + activeKey);
        activeNav.classList.add('active');
        activeNav.classList.remove('text-gray-700');

        el.classList.remove('animate-fadeInUp');
        void el.offsetWidth;
        el.classList.add('animate-fadeInUp');

        const renderFn = MODULE_RENDER[module];
        if (renderFn) renderFn();
    }

    // ==================== 系统监测 ====================
    function initDashboard() {
        renderMonitor();
        renderProducts();
    }

    function renderMonitor() {
        const users = getUsers();
        const products = getProducts();
        const bankUsers = getBankUsers();
        const apps = getApplications();

        let totalCredit = 0;
        users.forEach(u => { totalCredit += getCreditData(u.username); });
        const avgCredit = users.length > 0 ? Math.round(totalCredit / users.length) : 0;

        document.getElementById('statUsers').textContent = users.length;
        document.getElementById('statAvgCredit').textContent = avgCredit;
        document.getElementById('statProducts').textContent = products.filter(p => p.status === 'active').length;
        document.getElementById('statBankUsers').textContent = bankUsers.filter(b => b.status === 'active').length;
        document.getElementById('totalUsers').textContent = users.length + '人';

        let todayApps = 0, todayPaid = 0;
        const today = new Date().toDateString();
        Object.values(apps).forEach(userApps => {
            userApps.forEach(a => {
                if (new Date(a.createdAt).toDateString() === today) todayApps++;
                if (a.status === 'paid') todayPaid += a.amount;
            });
        });
        document.getElementById('todayActive').textContent = Math.floor(users.length * 0.3);
        document.getElementById('todayApps').textContent = todayApps;
        document.getElementById('todayPaid').textContent = todayPaid + '万';

        const activities = getActivities();
        const actEl = document.getElementById('activityList');
        const actEmptyEl = document.getElementById('activityEmpty');
        if (activities.length > 0) {
            actEl.innerHTML = activities.slice(0, 8).map(a =>
                `<div class="px-6 py-3 flex items-center gap-3">
                    <span class="px-2 py-0.5 text-xs rounded bg-purple-50 text-purple-700">${a.type}</span>
                    <span class="text-sm text-gray-700 flex-1">${a.desc}</span>
                    <span class="text-xs text-gray-400">${formatDate(a.time)}</span>
                </div>`
            ).join('');
            actEmptyEl.classList.add('hidden');
        } else {
            actEl.innerHTML = '';
            actEmptyEl.classList.remove('hidden');
        }
    }

    // ==================== 信用积分管理 ====================
    function renderCredit(searchTerm) {
        const users = getUsers();
        const filtered = searchTerm ? users.filter(u => u.username.includes(searchTerm)) : users;

        const listEl = document.getElementById('creditList');
        const emptyEl = document.getElementById('creditEmpty');

        if (filtered.length > 0) {
            listEl.innerHTML = filtered.map(u => {
                const score = getCreditData(u.username);
                const level = getCreditLevel(score);
                return `<tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">${u.username}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${u.realName || '-'}</td>
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                            <span class="font-display font-bold text-lg" style="color:${level.color}">${score}</span>
                            <div class="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-all" style="width:${Math.min(score / 10, 100)}%;background:${level.color}"></div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4"><span class="status-badge ${level.class}">${level.text}</span></td>
                    <td class="px-6 py-4 text-xs text-gray-500">${u.creditUpdatedAt ? formatDate(u.creditUpdatedAt) : '-'}</td>
                    <td class="px-6 py-4">
                        <button data-action="openCreditModal" data-username="${u.username}" class="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all">调整</button>
                    </td>
                </tr>`;
            }).join('');
            emptyEl.classList.add('hidden');
        } else {
            listEl.innerHTML = '';
            emptyEl.classList.remove('hidden');
        }
    }

    function searchCredit() {
        const term = document.getElementById('creditSearch').value.trim();
        renderCredit(term);
    }

    function openCreditModal(username) {
        const users = getUsers();
        const u = users.find(user => user.username === username);
        if (!u) return;
        const score = getCreditData(username);

        document.getElementById('creditUsername').value = username;
        document.getElementById('creditModalUser').textContent = username;
        document.getElementById('creditModalCurrent').textContent = score;
        document.getElementById('creditType').value = 'add';
        document.getElementById('creditValue').value = '';
        document.getElementById('creditReason').value = '';
        document.getElementById('creditModal').classList.remove('hidden');
    }

    function closeCreditModal() { document.getElementById('creditModal').classList.add('hidden'); }

    function handleCreditSubmit(e) {
        e.preventDefault();
        const username = document.getElementById('creditUsername').value;
        const type = document.getElementById('creditType').value;
        const value = parseInt(document.getElementById('creditValue').value) || 0;
        const reason = document.getElementById('creditReason').value.trim();

        if (!reason) { showToast('请填写调整原因', 'error'); return; }

        const currentScore = getCreditData(username);
        let newScore;
        if (type === 'add') newScore = Math.min(currentScore + value, 1000);
        else if (type === 'subtract') newScore = Math.max(currentScore - value, 0);
        else newScore = Math.min(Math.max(value, 0), 1000);

        saveCreditData(username, newScore, reason);
        closeCreditModal();
        renderCredit();
        renderMonitor();
        showToast('积分已调整', 'success');
    }

    // ==================== 贷款产品管理 ====================
    function renderProducts() {
        const products = getProducts();
        document.getElementById('productList').innerHTML = products.map(p =>
            `<div class="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div class="flex items-start justify-between mb-4">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-md">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <span class="px-2 py-1 text-xs rounded-lg ${p.status === 'active' ? 'bg-agri-100 text-agri-700' : 'bg-gray-100 text-gray-500'}">${p.status === 'active' ? '上架' : '下架'}</span>
                </div>
                <h3 class="font-display font-bold text-lg text-gray-900 mb-2">${p.name}</h3>
                <p class="text-xs text-gray-500 mb-4 line-clamp-2">${p.desc}</p>
                <div class="space-y-2 text-xs text-gray-600 mb-4">
                    <div class="flex justify-between"><span>额度范围</span><span class="font-semibold text-gray-900">${p.minAmount}-${p.maxAmount}万元</span></div>
                    <div class="flex justify-between"><span>年化利率</span><span class="font-semibold text-fin-600">${p.rate}</span></div>
                    <div class="flex justify-between"><span>贷款期限</span><span class="font-semibold text-gray-900">${p.term}</span></div>
                </div>
                <div class="flex gap-2">
                    <button data-action="editProduct" data-id="${p.id}" class="flex-1 py-2 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all">编辑</button>
                    <button data-action="toggleProductStatus" data-id="${p.id}" class="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all">${p.status === 'active' ? '下架' : '上架'}</button>
                </div>
            </div>`
        ) || '<div class="col-span-full text-center py-12 text-sm text-gray-400">暂无产品</div>';
    }

    function openProductModal() {
        document.getElementById('productModal').classList.remove('hidden');
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        document.getElementById('productModalTitle').textContent = '新增贷款产品';
    }

    function closeProductModal() { document.getElementById('productModal').classList.add('hidden'); }

    function editProduct(id) {
        const products = getProducts();
        const p = products.find(item => item.id === id);
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
        const products = getProducts();
        const idx = products.findIndex(p => p.id === id);
        if (idx >= 0) {
            products[idx].status = products[idx].status === 'active' ? 'inactive' : 'active';
            saveProducts(products);
            renderProducts();
            renderMonitor();
            showToast('状态已更新', 'success');
        }
    }

    function handleProductSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        const name = document.getElementById('productName').value.trim();
        const minAmount = parseInt(document.getElementById('productMinAmount').value) || 0;
        const maxAmount = parseInt(document.getElementById('productMaxAmount').value) || 0;
        const rate = document.getElementById('productRate').value.trim();
        const term = document.getElementById('productTerm').value.trim();
        const desc = document.getElementById('productDesc').value.trim();
        const status = document.getElementById('productStatus').value;

        if (!name) { showToast('请输入产品名称', 'error'); return; }

        const products = getProducts();
        const colors = ['from-agri-400 to-agri-600', 'from-fin-400 to-fin-600', 'from-amber-400 to-amber-600', 'from-rose-400 to-rose-600', 'from-purple-400 to-purple-600'];

        if (id) {
            const idx = products.findIndex(p => p.id === parseInt(id));
            if (idx >= 0) {
                Object.assign(products[idx], { name, minAmount, maxAmount, rate, term, desc, status });
            }
            addActivity('产品修改', '修改产品：' + name);
        } else {
            const newId = Math.max(...products.map(p => p.id), 0) + 1;
            products.push({ id: newId, name, minAmount, maxAmount, rate, term, desc, status, color: colors[products.length % colors.length] });
            addActivity('新增产品', '新增产品：' + name);
        }
        saveProducts(products);
        closeProductModal();
        renderProducts();
        renderMonitor();
        showToast('保存成功', 'success');
    }

    // ==================== 银行用户管理 ====================
    function renderBankUsers() {
        const bankUsers = getBankUsers();
        const listEl = document.getElementById('bankUserList');
        const emptyEl = document.getElementById('bankUserEmpty');

        if (bankUsers.length > 0) {
            listEl.innerHTML = bankUsers.map(b =>
                `<tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">${b.username}</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-lg bg-purple-50 text-purple-700">${b.role}</span></td>
                    <td class="px-6 py-4 text-sm font-semibold text-gray-900">${b.limit}万元</td>
                    <td class="px-6 py-4"><span class="status-badge ${b.status === 'active' ? 'bg-agri-100 text-agri-700' : 'bg-gray-100 text-gray-600'}">${b.status === 'active' ? '启用' : '禁用'}</span></td>
                    <td class="px-6 py-4 text-xs text-gray-500">${b.createdAt || '-'}</td>
                    <td class="px-6 py-4">
                        <button data-action="editBankUser" data-id="${b.id}" class="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all">编辑</button>
                        <button data-action="toggleBankUserStatus" data-id="${b.id}" class="ml-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all">${b.status === 'active' ? '禁用' : '启用'}</button>
                    </td>
                </tr>`
            ).join('');
            emptyEl.classList.add('hidden');
        } else {
            listEl.innerHTML = '';
            emptyEl.classList.remove('hidden');
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
        const bankUsers = getBankUsers();
        const b = bankUsers.find(item => item.id === id);
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
        const bankUsers = getBankUsers();
        const idx = bankUsers.findIndex(b => b.id === id);
        if (idx >= 0) {
            bankUsers[idx].status = bankUsers[idx].status === 'active' ? 'inactive' : 'active';
            saveBankUsers(bankUsers);
            renderBankUsers();
            renderMonitor();
            showToast('状态已更新', 'success');
        }
    }

    function handleBankUserSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('bankUserId').value;
        const username = document.getElementById('bankUserName').value.trim();
        const password = document.getElementById('bankUserPwd').value.trim();
        const role = document.getElementById('bankUserRole').value;
        const limit = parseInt(document.getElementById('bankUserLimit').value) || 0;
        const status = document.getElementById('bankUserStatus').value;

        if (!username) { showToast('请输入用户名', 'error'); return; }
        if (!password) { showToast('请输入密码', 'error'); return; }

        const bankUsers = getBankUsers();

        if (id) {
            const idx = bankUsers.findIndex(b => b.id === parseInt(id));
            if (idx >= 0) {
                Object.assign(bankUsers[idx], { username, password, role, limit, status });
            }
            addActivity('用户修改', '修改银行用户：' + username);
        } else {
            const newId = Math.max(...bankUsers.map(b => b.id), 0) + 1;
            bankUsers.push({ id: newId, username, password, role, limit, status, createdAt: new Date().toISOString().substring(0, 10) });
            addActivity('新增用户', '新增银行用户：' + username);
        }
        saveBankUsers(bankUsers);
        closeBankUserModal();
        renderBankUsers();
        renderMonitor();
        showToast('保存成功', 'success');
    }

    // ==================== 数据分析 ====================
    function renderAnalysis() {
        const users = getUsers();
        const apps = getApplications();

        const distribution = { excellent: 0, good: 0, medium: 0, normal: 0, poor: 0 };
        users.forEach(u => {
            const score = getCreditData(u.username);
            if (score >= 700) distribution.excellent++;
            else if (score >= 600) distribution.good++;
            else if (score >= 500) distribution.medium++;
            else if (score >= 400) distribution.normal++;
            else distribution.poor++;
        });

        const maxDist = Math.max(distribution.excellent, distribution.good, distribution.medium, distribution.normal, distribution.poor, 1);
        const distItems = [
            { label: '优秀(≥700)', count: distribution.excellent, color: '#22c55e' },
            { label: '良好(600-699)', count: distribution.good, color: '#3b82f6' },
            { label: '中等(500-599)', count: distribution.medium, color: '#f59e0b' },
            { label: '一般(400-499)', count: distribution.normal, color: '#6b7280' },
            { label: '较差(<400)', count: distribution.poor, color: '#ef4444' }
        ];
        document.getElementById('creditDistribution').innerHTML = distItems.map(d => {
            const width = Math.round((d.count / maxDist) * 100);
            return `<div class="flex items-center gap-3">
                <span class="text-xs text-gray-600 w-28">${d.label}</span>
                <div class="credit-bar flex-1"><div class="credit-fill" style="width:${width}%;background:${d.color}"></div></div>
                <span class="text-xs font-semibold text-gray-900">${d.count}人</span>
            </div>`;
        }).join('') || '<div class="text-center text-gray-400 py-8">暂无数据</div>';

        let totalApps = 0, totalPaid = 0, totalAmount = 0, passCount = 0;
        Object.values(apps).forEach(userApps => {
            userApps.forEach(a => {
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

    // ==================== 操作日志 ====================
    function renderLogs() {
        const activities = getActivities();
        const filterType = document.getElementById('logTypeFilter').value;
        const filtered = filterType === 'all' ? activities : activities.filter(a => a.type.includes(filterType));

        const listEl = document.getElementById('logList');
        const emptyEl = document.getElementById('logEmpty');

        if (filtered.length > 0) {
            listEl.innerHTML = filtered.slice(0, 20).map(a =>
                `<tr class="hover:bg-gray-50">
                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-lg bg-purple-50 text-purple-700">${a.type}</span></td>
                    <td class="px-6 py-4 text-sm text-gray-900">系统管理员</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${a.desc}</td>
                    <td class="px-6 py-4 text-xs text-gray-500">192.168.1.100</td>
                    <td class="px-6 py-4 text-xs text-gray-400">${formatDate(a.time)}</td>
                </tr>`
            ).join('');
            emptyEl.classList.add('hidden');
        } else {
            listEl.innerHTML = '';
            emptyEl.classList.remove('hidden');
        }
    }

    function filterLogs() { renderLogs(); }

    function exportLogs() {
        const activities = getActivities();
        if (activities.length === 0) {
            showToast('暂无日志数据', 'error');
            return;
        }
        let csv = '操作类型,操作内容,操作时间\n';
        activities.forEach(a => {
            csv += a.type + ',' + a.desc + ',' + formatDate(a.time) + '\n';
        });
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = '操作日志_' + new Date().toISOString().substring(0, 10) + '.csv';
        link.click();
        showToast('日志导出成功', 'success');
    }

    // ==================== 报表导出 ====================
    function getExportRecords() { return safeGetJSON('agriExportRecords', []); }

    function saveExportRecord(r) {
        const records = getExportRecords();
        records.unshift(r);
        if (records.length > 20) records.length = 20;
        safeSetJSON('agriExportRecords', records);
    }

    function renderReports() {
        const records = getExportRecords();
        const listEl = document.getElementById('exportList');
        const emptyEl = document.getElementById('exportEmpty');

        if (records.length > 0) {
            listEl.innerHTML = records.map(r =>
                `<div class="px-6 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="px-2 py-1 text-xs rounded bg-purple-50 text-purple-700">${r.type}</span>
                        <span class="text-sm text-gray-700">${r.name}</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="text-xs text-gray-400">${formatDate(r.time)}</span>
                        <span class="text-xs text-agri-600">已完成</span>
                    </div>
                </div>`
            ).join('');
            emptyEl.classList.add('hidden');
        } else {
            listEl.innerHTML = '';
            emptyEl.classList.remove('hidden');
        }
    }

    function exportReport(type) {
        const typeNames = { users: '用户数据报表', loans: '贷款数据报表', products: '产品统计报表' };
        const users = getUsers();
        const apps = getApplications();
        let csv = '';

        if (type === 'users') {
            csv = '用户名,真实姓名,手机号,信用积分,注册时间\n';
            users.forEach(u => {
                csv += u.username + ',' + (u.realName || '') + ',' + (u.phone || '') + ',' + getCreditData(u.username) + ',' + formatDate(u.registeredAt || new Date()) + '\n';
            });
        } else if (type === 'loans') {
            csv = '申请人,产品,金额(万),期限,状态,申请时间\n';
            Object.entries(apps).forEach(([username, userApps]) => {
                userApps.forEach(a => {
                    csv += username + ',' + a.product + ',' + a.amount + ',' + a.term + '个月,' + a.status + ',' + formatDate(a.createdAt) + '\n';
                });
            });
        } else if (type === 'products') {
            const products = getProducts();
            csv = '产品名称,额度范围,年化利率,期限,状态\n';
            products.forEach(p => {
                csv += p.name + ',' + p.minAmount + '-' + p.maxAmount + '万,' + p.rate + ',' + p.term + ',' + (p.status === 'active' ? '上架' : '下架') + '\n';
            });
        }

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = typeNames[type] + '_' + new Date().toISOString().substring(0, 10) + '.csv';
        link.click();

        saveExportRecord({ type: typeNames[type], name: link.download, time: new Date().toISOString() });
        renderReports();
        showToast('报表导出成功', 'success');
    }

    // ==================== 公告管理 ====================
    function getAnnouncements() { return safeGetJSON('agriAnnouncements', []); }
    function saveAnnouncements(a) { safeSetJSON('agriAnnouncements', a); }

    function renderAnnouncements() {
        const announcements = getAnnouncements();
        const listEl = document.getElementById('announcementList');
        const emptyEl = document.getElementById('announcementEmpty');

        if (announcements.length > 0) {
            const typeColors = {
                '系统通知': 'bg-purple-50 text-purple-700',
                '政策公告': 'bg-fin-50 text-fin-700',
                '产品更新': 'bg-agri-50 text-agri-700',
                '维护通知': 'bg-warn-50 text-warn-700'
            };
            const statusConfig = {
                published: { text: '已发布', class: 'bg-agri-100 text-agri-700' },
                draft: { text: '草稿', class: 'bg-gray-100 text-gray-600' }
            };
            listEl.innerHTML = announcements.map((a, idx) => {
                const s = statusConfig[a.status] || statusConfig.draft;
                return `<tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">${a.title}</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-lg ${typeColors[a.type] || typeColors['系统通知']}">${a.type}</span></td>
                    <td class="px-6 py-4"><span class="status-badge ${s.class}">${s.text}</span></td>
                    <td class="px-6 py-4 text-xs text-gray-400">${formatDate(a.createdAt)}</td>
                    <td class="px-6 py-4">
                        <button data-action="toggleAnnouncement" data-idx="${idx}" class="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-all">${a.status === 'published' ? '下架' : '发布'}</button>
                        <button data-action="deleteAnnouncement" data-idx="${idx}" class="ml-2 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all">删除</button>
                    </td>
                </tr>`;
            }).join('');
            emptyEl.classList.add('hidden');
        } else {
            listEl.innerHTML = '';
            emptyEl.classList.remove('hidden');
        }
    }

    function openAnnouncementModal() {
        document.getElementById('announcementForm').reset();
        document.getElementById('announcementModal').classList.remove('hidden');
    }

    function closeAnnouncementModal() { document.getElementById('announcementModal').classList.add('hidden'); }

    function handleAnnouncementSubmit(e) {
        e.preventDefault();
        const announcements = getAnnouncements();
        const title = document.getElementById('announcementTitle').value.trim();
        announcements.unshift({
            title,
            type: document.getElementById('announcementType').value,
            content: document.getElementById('announcementContent').value.trim(),
            status: document.getElementById('announcementStatus').value,
            createdAt: new Date().toISOString()
        });
        saveAnnouncements(announcements);
        closeAnnouncementModal();
        renderAnnouncements();
        addActivity('发布公告', '发布系统公告：' + title);
        showToast('公告已发布', 'success');
    }

    function toggleAnnouncement(idx) {
        const announcements = getAnnouncements();
        if (announcements[idx]) {
            announcements[idx].status = announcements[idx].status === 'published' ? 'draft' : 'published';
            saveAnnouncements(announcements);
            renderAnnouncements();
            showToast('状态已更新', 'success');
        }
    }

    function deleteAnnouncement(idx) {
        const announcements = getAnnouncements();
        if (announcements[idx]) {
            announcements.splice(idx, 1);
            saveAnnouncements(announcements);
            renderAnnouncements();
            showToast('公告已删除', 'success');
        }
    }

    // ==================== 事件委托 ====================
    function handleDelegatedClick(e) {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        const id = btn.dataset.id ? parseInt(btn.dataset.id) : null;
        const idx = btn.dataset.idx !== undefined ? parseInt(btn.dataset.idx) : null;
        const username = btn.dataset.username;

        switch (action) {
            case 'openCreditModal': openCreditModal(username); break;
            case 'editProduct': editProduct(id); break;
            case 'toggleProductStatus': toggleProductStatus(id); break;
            case 'editBankUser': editBankUser(id); break;
            case 'toggleBankUserStatus': toggleBankUserStatus(id); break;
            case 'toggleAnnouncement': toggleAnnouncement(idx); break;
            case 'deleteAnnouncement': deleteAnnouncement(idx); break;
        }
    }

    // ==================== 初始化 ====================
    document.addEventListener('DOMContentLoaded', () => {
        if (checkAdminLogin()) {
            initDashboard();
        }

        // 事件委托：在主面板上统一监听动态按钮点击
        document.getElementById('adminPanel').addEventListener('click', handleDelegatedClick);

        // 表单提交
        document.getElementById('creditForm').addEventListener('submit', handleCreditSubmit);
        document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
        document.getElementById('bankUserForm').addEventListener('submit', handleBankUserSubmit);
        document.getElementById('announcementForm').addEventListener('submit', handleAnnouncementSubmit);

        // 暴露给HTML内联onclick的函数
        window.switchModule = switchModule;
        window.adminLogout = adminLogout;
        window.searchCredit = searchCredit;
        window.openProductModal = openProductModal;
        window.closeProductModal = closeProductModal;
        window.openBankUserModal = openBankUserModal;
        window.closeBankUserModal = closeBankUserModal;
        window.openAnnouncementModal = openAnnouncementModal;
        window.closeAnnouncementModal = closeAnnouncementModal;
        window.closeCreditModal = closeCreditModal;
        window.filterLogs = filterLogs;
        window.exportLogs = exportLogs;
        window.exportReport = exportReport;
        window.showToast = showToast;
    });
})();
