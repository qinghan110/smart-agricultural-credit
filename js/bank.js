(function () {
    'use strict';

    // ==================== 配置常量 ====================
    const STATUS_CONFIG = {
        pending: { text: '待审批', class: 'bg-warn-100 text-warn-700' },
        approved: { text: '已通过', class: 'bg-agri-100 text-agri-700' },
        rejected: { text: '已拒绝', class: 'bg-red-100 text-red-700' },
        paid: { text: '已放款', class: 'bg-fin-100 text-fin-700' }
    };

    const FOLLOWUP_STATUS_CONFIG = {
        pending: { text: '待跟进', class: 'bg-warn-100 text-warn-700' },
        completed: { text: '已完成', class: 'bg-agri-100 text-agri-700' },
        converted: { text: '已转化', class: 'bg-purple-100 text-purple-700' }
    };

    function getStatusConfig(status, config) {
        return (config || STATUS_CONFIG)[status] || STATUS_CONFIG.pending;
    }

    function getFollowups() { return App.safeGetJSON('agriFollowups') || []; }

    function saveFollowups(f) { App.safeSetJSON('agriFollowups', f); }

    function getRiskLevel(days) {
        if (days > 30) return { text: '高风险', class: 'bg-red-100 text-red-700', color: '#ef4444' };
        if (days > 15) return { text: '中风险', class: 'bg-warn-100 text-warn-700', color: '#f59e0b' };
        return { text: '低风险', class: 'bg-amber-100 text-amber-700', color: '#d97706' };
    }

    function getAllApps() {
        const apps = App.getApplications();
        const list = [];
        Object.keys(apps).forEach(username => {
            apps[username].forEach((app, idx) => {
                list.push({ username, idx, ...app });
            });
        });
        return list;
    }

    // ==================== 登录管理 ====================
    let currentApprovalFilter = 'all';
    let currentOverdueFilter = 'all';
    let currentAppId = null;
    let currentAppUsername = null;
    let currentDisburseId = null;
    let currentDisburseUsername = null;

    // ==================== 模块切换 ====================
    const MODULES = ['workbench', 'overview', 'approval', 'disbursement', 'overdue', 'followup', 'performance', 'demands', 'farmers'];

    const MODULE_RENDER_MAP = {
        approval: renderApproval,
        disbursement: renderDisbursement,
        overdue: renderOverdue,
        followup: renderFollowup,
        performance: renderPerformance,
        demands: renderDemands,
        farmers: renderFarmers
    };

    // ==================== 业务概览 ====================
    function initDashboard() {
        const apps = App.getApplications();

        let pendingCount = 0, paidAmount = 0, todayApproval = 0, overdueCount = 0;
        let disburseCount = 0;

        Object.keys(apps).forEach(username => {
            apps[username].forEach(app => {
                if (app.status === 'pending' || app.status === 'approved') pendingCount++;
                if (app.status === 'approved') disburseCount++;
                if (app.status === 'paid') {
                    paidAmount += app.amount;
                    const paidDate = new Date(app.paidAt || app.createdAt);
                    const daysDiff = Math.floor((new Date() - paidDate) / (1000 * 60 * 60 * 24));
                    if (daysDiff > 60 && Math.random() > 0.7) overdueCount++;
                }
                const appDate = new Date(app.createdAt);
                if (appDate.toDateString() === new Date().toDateString() && (app.status === 'approved' || app.status === 'rejected')) {
                    todayApproval++;
                }
            });
        });

        document.getElementById('statTodayApproval').textContent = todayApproval;
        document.getElementById('statPending').textContent = pendingCount;
        document.getElementById('statPaidAmount').textContent = paidAmount;
        document.getElementById('statOverdue').textContent = overdueCount;
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('disburseCount').textContent = disburseCount;
        document.getElementById('overdueCount').textContent = overdueCount;

        const recentApps = getAllApps()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        if (recentApps.length > 0) {
            document.getElementById('recentApps').innerHTML = recentApps.map(app => {
                const s = getStatusConfig(app.status);
                return `<div class="px-6 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-fin-100 flex items-center justify-center text-fin-700 font-semibold text-sm">${app.username.charAt(0).toUpperCase()}</div>
                        <div><span class="font-medium text-gray-900">${app.username}</span><span class="text-xs text-gray-400 ml-2">${app.product}</span></div>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="font-semibold text-gray-900">${app.amount}万</span>
                        <span class="status-badge ${s.class}">${s.text}</span>
                        <span class="text-xs text-gray-400">${App.formatDate(app.createdAt)}</span>
                    </div>
                </div>`;
            }).join('');
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
        document.querySelectorAll('.approval-filter').forEach(btn => {
            btn.classList.remove('bg-fin-600', 'text-white');
            btn.classList.add('bg-white', 'text-gray-600');
        });
        event.target.classList.add('bg-fin-600', 'text-white');
        event.target.classList.remove('bg-white', 'text-gray-600');
        renderApproval();
    }

    function renderApproval() {
        const list = getAllApps()
            .filter(app => currentApprovalFilter === 'all' || app.status === currentApprovalFilter)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (list.length > 0) {
            document.getElementById('approvalList').innerHTML = list.map(app => {
                const s = getStatusConfig(app.status);
                const actionBtn = app.status === 'pending'
                    ? `<button data-action="approve" data-username="${app.username}" data-idx="${app.idx}" class="action-btn px-3 py-1.5 text-xs font-medium text-fin-700 bg-fin-50 border border-fin-200 rounded-lg hover:bg-fin-100 transition-all">审批</button>`
                    : '<span class="text-xs text-gray-400">已处理</span>';
                return `<tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">${app.username}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${app.product}</td>
                    <td class="px-6 py-4 text-sm font-semibold text-gray-900">${app.amount}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${app.term}个月</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${app.purpose || '-'}</td>
                    <td class="px-6 py-4"><span class="status-badge ${s.class}">${s.text}</span></td>
                    <td class="px-6 py-4 text-xs text-gray-400">${App.formatDate(app.createdAt)}</td>
                    <td class="px-6 py-4">${actionBtn}</td>
                </tr>`;
            }).join('');
            document.getElementById('approvalEmpty').classList.add('hidden');
        } else {
            document.getElementById('approvalList').innerHTML = '';
            document.getElementById('approvalEmpty').classList.remove('hidden');
        }
    }

    function openApprovalModal(username, idx) {
        const apps = App.getApplications();
        const app = apps[username][idx];
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
        const comment = document.getElementById('approvalComment').value.trim();
        if (!comment) { App.showToast('请填写审批意见', 'error'); return; }
        const apps = App.getApplications();
        if (!apps[currentAppUsername] || !apps[currentAppUsername][currentAppId]) {
            App.showToast('数据异常，请刷新重试', 'error'); return;
        }
        apps[currentAppUsername][currentAppId].status = 'approved';
        apps[currentAppUsername][currentAppId].approvedAt = new Date().toISOString();
        apps[currentAppUsername][currentAppId].approvalComment = comment;
        App.saveApplications(apps);
        closeApprovalModal();
        initDashboard();
        App.showToast('审批通过', 'success');
    }

    function rejectApplication() {
        const comment = document.getElementById('approvalComment').value.trim();
        if (!comment) { App.showToast('请填写拒绝原因', 'error'); return; }
        const apps = App.getApplications();
        if (!apps[currentAppUsername] || !apps[currentAppUsername][currentAppId]) {
            App.showToast('数据异常，请刷新重试', 'error'); return;
        }
        apps[currentAppUsername][currentAppId].status = 'rejected';
        apps[currentAppUsername][currentAppId].rejectedAt = new Date().toISOString();
        apps[currentAppUsername][currentAppId].approvalComment = comment;
        App.saveApplications(apps);
        closeApprovalModal();
        initDashboard();
        App.showToast('申请已拒绝', 'success');
    }

    // ==================== 放款管理 ====================
    function renderDisbursement() {
        const allApps = getAllApps();
        const pendingList = allApps.filter(app => app.status === 'approved');
        const doneList = allApps.filter(app => app.status === 'paid');

        document.getElementById('disbursePending').textContent = pendingList.length;
        document.getElementById('disburseDone').textContent = doneList.length;

        if (pendingList.length > 0) {
            document.getElementById('disburseList').innerHTML = pendingList.map(app => {
                return `<tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">${app.username}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${app.product}</td>
                    <td class="px-6 py-4 text-sm font-semibold text-agri-600">${app.amount}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${app.term}个月</td>
                    <td class="px-6 py-4 text-xs text-gray-400">${App.formatDate(app.approvedAt || app.createdAt)}</td>
                    <td class="px-6 py-4"><span class="status-badge bg-agri-100 text-agri-700">待放款</span></td>
                    <td class="px-6 py-4"><button data-action="disburse" data-username="${app.username}" data-idx="${app.idx}" class="action-btn px-3 py-1.5 text-xs font-medium text-agri-700 bg-agri-50 border border-agri-200 rounded-lg hover:bg-agri-100 transition-all">放款</button></td>
                </tr>`;
            }).join('');
            document.getElementById('disburseEmpty').classList.add('hidden');
        } else {
            document.getElementById('disburseList').innerHTML = '';
            document.getElementById('disburseEmpty').classList.remove('hidden');
        }
    }

    function openDisburseModal(username, idx) {
        const apps = App.getApplications();
        const app = apps[username][idx];
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
        const apps = App.getApplications();
        if (!apps[currentDisburseUsername] || !apps[currentDisburseUsername][currentDisburseId]) {
            App.showToast('数据异常，请刷新重试', 'error'); return;
        }
        apps[currentDisburseUsername][currentDisburseId].status = 'paid';
        apps[currentDisburseUsername][currentDisburseId].paidAt = new Date().toISOString();
        App.saveApplications(apps);
        closeDisburseModal();
        initDashboard();
        renderDisbursement();
        App.showToast('放款成功', 'success');
    }

    // ==================== 逾期预警 ====================
    function filterOverdue(level) {
        currentOverdueFilter = level;
        document.querySelectorAll('.overdue-filter').forEach(btn => {
            btn.classList.remove('bg-red-600', 'text-white');
            btn.classList.add('bg-white', 'text-gray-600');
        });
        event.target.classList.add('bg-red-600', 'text-white');
        event.target.classList.remove('bg-white', 'text-gray-600');
        renderOverdue();
    }

    const OVERDUE_DATA = [
        { username: 'user001', amount: 15, days: 45, unpaid: 12, phone: '138****1234', risk: 'high' },
        { username: 'farmer_zhang', amount: 30, days: 28, unpaid: 25, phone: '139****5678', risk: 'medium' },
        { username: 'wang_farm', amount: 8, days: 10, unpaid: 7, phone: '137****9012', risk: 'low' }
    ];

    function renderOverdue() {
        const filtered = currentOverdueFilter === 'all'
            ? OVERDUE_DATA
            : OVERDUE_DATA.filter(d => d.risk === currentOverdueFilter);

        document.getElementById('highRisk').textContent = OVERDUE_DATA.filter(d => d.risk === 'high').length;
        document.getElementById('mediumRisk').textContent = OVERDUE_DATA.filter(d => d.risk === 'medium').length;
        document.getElementById('lowRisk').textContent = OVERDUE_DATA.filter(d => d.risk === 'low').length;

        if (filtered.length > 0) {
            document.getElementById('overdueList').innerHTML = filtered.map(d => {
                const r = getRiskLevel(d.days);
                return `<tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">${d.username}</td>
                    <td class="px-6 py-4 text-sm font-semibold text-gray-900">${d.amount}万</td>
                    <td class="px-6 py-4 text-sm text-red-600 font-medium">${d.days}天</td>
                    <td class="px-6 py-4"><span class="status-badge ${r.class}">${r.text}</span></td>
                    <td class="px-6 py-4 text-sm font-semibold text-red-600">${d.unpaid}万</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${d.phone}</td>
                    <td class="px-6 py-4">
                        <button data-action="collect" class="action-btn px-3 py-1.5 text-xs font-medium text-fin-700 bg-fin-50 border border-fin-200 rounded-lg hover:bg-fin-100 transition-all">记录催收</button>
                    </td>
                </tr>`;
            }).join('');
            document.getElementById('overdueEmpty').classList.add('hidden');
        } else {
            document.getElementById('overdueList').innerHTML = '';
            document.getElementById('overdueEmpty').classList.remove('hidden');
        }
    }

    // ==================== 贷款需求 ====================
    function renderDemands() {
        const demands = App.getDemands();
        if (demands.length > 0) {
            document.getElementById('demandList').innerHTML = demands.map(d => {
                return `<tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">${d.username}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${d.type}</td>
                    <td class="px-6 py-4 text-sm font-semibold text-gray-900">${d.amount}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${d.term}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${d.purpose || '-'}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">${d.note || '-'}</td>
                    <td class="px-6 py-4 text-xs text-gray-400">${App.formatDate(d.createdAt)}</td>
                </tr>`;
            }).join('');
            document.getElementById('demandEmpty').classList.add('hidden');
        } else {
            document.getElementById('demandList').innerHTML = '';
            document.getElementById('demandEmpty').classList.remove('hidden');
        }
    }

    // ==================== 农户信息 ====================
    function searchFarmers() {
        const term = document.getElementById('farmerSearch').value.trim().toLowerCase();
        renderFarmers(term);
    }

    function renderFarmers(searchTerm) {
        const users = App.getUsers();
        const apps = App.getApplications();
        const filtered = searchTerm
            ? users.filter(u => u.username.toLowerCase().includes(searchTerm) || (u.realName && u.realName.toLowerCase().includes(searchTerm)))
            : users;

        if (filtered.length > 0) {
            document.getElementById('farmerList').innerHTML = filtered.map(u => {
                const userApps = apps[u.username] || [];
                const credit = App.getCreditScore(u.username);
                const creditClass = credit >= 600 ? 'text-agri-600' : credit >= 500 ? 'text-warn-600' : 'text-red-600';
                return `<tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">${u.username}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${u.realName || '-'}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${App.maskPhone(u.phone)}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${u.businessType || '-'}</td>
                    <td class="px-6 py-4"><span class="font-semibold ${creditClass}">${credit}</span></td>
                    <td class="px-6 py-4 text-sm text-gray-600">${userApps.length}</td>
                    <td class="px-6 py-4 text-xs text-gray-400">${App.formatDate(u.registeredAt || new Date())}</td>
                </tr>`;
            }).join('');
            document.getElementById('farmerEmpty').classList.add('hidden');
        } else {
            document.getElementById('farmerList').innerHTML = '';
            document.getElementById('farmerEmpty').classList.remove('hidden');
        }
    }

    // ==================== 工作台 ====================
    function getSimulatedOverdue() {
        return OVERDUE_DATA;
    }

    function initWorkbench() {
        const apps = App.getApplications();
        const followups = getFollowups();

        let pendingCount = 0, disburseCount = 0;
        Object.keys(apps).forEach(username => {
            apps[username].forEach(app => {
                if (app.status === 'pending') pendingCount++;
                if (app.status === 'approved') disburseCount++;
            });
        });

        const followupPending = followups.filter(f => f.status === 'pending').length;
        const overdueData = getSimulatedOverdue();

        document.getElementById('myPending').textContent = pendingCount;
        document.getElementById('myDisburse').textContent = disburseCount;
        document.getElementById('myOverdue').textContent = overdueData.length;
        document.getElementById('myFollowup').textContent = followupPending;

        const workLogs = getAllApps()
            .filter(app => app.status !== 'pending')
            .map(app => ({
                type: app.status === 'approved' ? '审批通过' : app.status === 'rejected' ? '审批拒绝' : '已放款',
                username: app.username,
                product: app.product,
                amount: app.amount,
                time: app.approvedAt || app.paidAt || app.createdAt
            }))
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 5);

        if (workLogs.length > 0) {
            document.getElementById('recentWorkLog').innerHTML = workLogs.map(log => {
                const typeColor = log.type === '审批通过' ? 'bg-agri-50 text-agri-700' : log.type === '审批拒绝' ? 'bg-red-50 text-red-700' : 'bg-fin-50 text-fin-700';
                return `<div class="px-6 py-3 flex items-center gap-3">
                    <span class="px-2 py-0.5 text-xs rounded ${typeColor}">${log.type}</span>
                    <span class="text-sm text-gray-700 flex-1">${log.username} - ${log.product} (${log.amount}万)</span>
                    <span class="text-xs text-gray-400">${App.formatDate(log.time)}</span>
                </div>`;
            }).join('');
            document.getElementById('workLogEmpty').classList.add('hidden');
        } else {
            document.getElementById('recentWorkLog').innerHTML = '';
            document.getElementById('workLogEmpty').classList.remove('hidden');
        }
    }

    // ==================== 客户跟进 ====================
    function renderFollowup() {
        const followups = getFollowups();

        document.getElementById('followupTotal').textContent = followups.length;
        document.getElementById('followupCompleted').textContent = followups.filter(f => f.status === 'completed').length;
        document.getElementById('followupPending').textContent = followups.filter(f => f.status === 'pending').length;
        document.getElementById('followupConverted').textContent = followups.filter(f => f.status === 'converted').length;

        if (followups.length > 0) {
            document.getElementById('followupList').innerHTML = followups.map(f => {
                const s = getStatusConfig(f.status, FOLLOWUP_STATUS_CONFIG);
                return `<tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">${f.name}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">${f.phone}</td>
                    <td class="px-6 py-4"><span class="px-2 py-1 text-xs rounded-lg bg-fin-50 text-fin-700">${f.type}</span></td>
                    <td class="px-6 py-4 text-sm text-gray-600">${f.content}</td>
                    <td class="px-6 py-4"><span class="status-badge ${s.class}">${s.text}</span></td>
                    <td class="px-6 py-4 text-xs text-gray-500">${f.nextDate || '-'}</td>
                    <td class="px-6 py-4 text-xs text-gray-400">${App.formatDate(f.createdAt)}</td>
                </tr>`;
            }).join('');
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

    // ==================== 业绩统计 ====================
    function renderPerformance() {
        const allApps = getAllApps();
        let totalApproval = 0, totalAmount = 0, passCount = 0;

        allApps.forEach(app => {
            totalApproval++;
            if (app.status === 'approved' || app.status === 'paid') passCount++;
            if (app.status === 'paid') totalAmount += app.amount;
        });

        document.getElementById('perfApproval').textContent = totalApproval;
        document.getElementById('perfAmount').textContent = totalAmount;
        document.getElementById('perfPassRate').textContent = totalApproval > 0 ? Math.round(passCount / totalApproval * 100) : 0;
        document.getElementById('perfSatisfaction').textContent = '4.8';
    }

    // ==================== 事件委托 ====================
    function setupEventDelegation() {
        // 侧边栏导航事件委托
        document.getElementById('sidebarNav').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-module]');
            if (btn) App.switchModule(btn.dataset.module, MODULES, MODULE_RENDER_MAP);
        });

        // 快捷操作事件委托
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => App.switchModule(btn.dataset.module, MODULES, MODULE_RENDER_MAP));
        });

        // 概览页"查看全部"按钮
        document.querySelectorAll('[data-module="approval"]').forEach(btn => {
            if (!btn.classList.contains('sidebar-item')) {
                btn.addEventListener('click', () => App.switchModule('approval', MODULES, MODULE_RENDER_MAP));
            }
        });

        // 表格操作按钮事件委托（审批、放款、催收）
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn');
            if (!btn) return;

            const action = btn.dataset.action;
            const username = btn.dataset.username;
            const idx = btn.dataset.idx !== undefined ? parseInt(btn.dataset.idx, 10) : undefined;

            if (action === 'approve' && username && idx !== undefined) {
                openApprovalModal(username, idx);
            } else if (action === 'disburse' && username && idx !== undefined) {
                openDisburseModal(username, idx);
            } else if (action === 'collect') {
                App.showToast('催收记录已更新', 'success');
            }
        });

        // 弹窗内按钮
        document.getElementById('approveAppBtn')?.addEventListener('click', approveApplication);
        document.getElementById('rejectAppBtn')?.addEventListener('click', rejectApplication);
        document.getElementById('confirmDisburseBtn')?.addEventListener('click', confirmDisburse);

        // 跟进表单
        document.getElementById('followupForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const followups = getFollowups();
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
            App.showToast('跟进记录已保存', 'success');
        });

        // 农户搜索
        document.getElementById('farmerSearchBtn')?.addEventListener('click', searchFarmers);
        document.getElementById('farmerSearch')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchFarmers();
        });
    }

    // ==================== 初始化 ====================
    document.addEventListener('DOMContentLoaded', () => {
        if (App.checkAdminLogin(App.KEYS.BANK_LOGGED_IN)) {
            initWorkbench();
            initDashboard();
        }
        setupEventDelegation();
    });

    // 暴露必要函数给 HTML 内联事件（逐步移除中的过渡方案）
    window.adminLogout = function() { App.adminLogout(App.KEYS.BANK_LOGGED_IN); };
    window.switchModule = function(module) { App.switchModule(module, MODULES, MODULE_RENDER_MAP); };
    window.filterApproval = filterApproval;
    window.filterOverdue = filterOverdue;
    window.openApprovalModal = openApprovalModal;
    window.closeApprovalModal = closeApprovalModal;
    window.approveApplication = approveApplication;
    window.rejectApplication = rejectApplication;
    window.openDisburseModal = openDisburseModal;
    window.closeDisburseModal = closeDisburseModal;
    window.confirmDisburse = confirmDisburse;
    window.openFollowupModal = openFollowupModal;
    window.closeFollowupModal = closeFollowupModal;
    window.searchFarmers = searchFarmers;
})();
