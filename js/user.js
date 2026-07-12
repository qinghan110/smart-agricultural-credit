(function() {
    'use strict';

    // ==================== 定时器管理 ====================
    const pendingTimers = [];

    function addTimer(id) {
        pendingTimers.push(id);
        return id;
    }

    function clearAllTimers() {
        pendingTimers.forEach(function(id) { clearTimeout(id); });
        pendingTimers.length = 0;
    }

    // ==================== 工具函数 ====================
    function getUsers() {
        try { return JSON.parse(localStorage.getItem('agriCreditUsers')) || []; }
        catch (e) { console.error('读取用户数据失败:', e); return []; }
    }

    function saveUsers(u) {
        try { localStorage.setItem('agriCreditUsers', JSON.stringify(u)); }
        catch (e) { console.error('保存用户数据失败:', e); }
    }

    function getLoggedInUser() {
        try {
            const s = localStorage.getItem('agriCreditLoggedInUser') || sessionStorage.getItem('agriCreditLoggedInUser');
            return s ? JSON.parse(s) : null;
        } catch (e) { console.error('读取登录状态失败:', e); return null; }
    }

    function setLoggedInUser(u) {
        try {
            if (localStorage.getItem('agriCreditLoggedInUser')) {
                localStorage.setItem('agriCreditLoggedInUser', JSON.stringify(u));
            } else {
                sessionStorage.setItem('agriCreditLoggedInUser', JSON.stringify(u));
            }
        } catch (e) { console.error('保存登录状态失败:', e); }
    }

    function getApplications(username) {
        try {
            const all = JSON.parse(localStorage.getItem('agriLoanApplications')) || {};
            return all[username] || [];
        } catch (e) { console.error('读取申请数据失败:', e); return []; }
    }

    function saveApplications(username, apps) {
        try {
            const all = JSON.parse(localStorage.getItem('agriLoanApplications')) || {};
            all[username] = apps;
            localStorage.setItem('agriLoanApplications', JSON.stringify(all));
        } catch (e) { console.error('保存申请数据失败:', e); }
    }

    let toastTimer = null;

    function showToast(msg, type) {
        const t = document.getElementById('toast');
        const tx = document.getElementById('toastText');
        const ic = document.getElementById('toastIcon');
        if (!t || !tx || !ic) return;

        tx.textContent = msg;
        const bgClass = type === 'success' ? 'bg-agri-600' : type === 'error' ? 'bg-red-500' : 'bg-fin-600';
        t.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transform translate-y-0 opacity-100 transition-all duration-300 flex items-center gap-2 ' + bgClass;
        ic.innerHTML = type === 'success'
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';

        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function() {
            t.style.transform = 'translateY(-80px)';
            t.style.opacity = '0';
            toastTimer = null;
        }, 2800);
    }

    function maskPhone(p) { return p ? p.substring(0, 3) + '****' + p.substring(7) : ''; }
    function maskIdCard(id) { return id ? id.substring(0, 6) + '********' + id.substring(14) : ''; }

    function formatDate(d) {
        const date = new Date(d);
        const pad = function(n) { return n < 10 ? '0' + n : n; };
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
    }

    // ==================== 登录校验 ====================
    let currentUser = null;
    let currentFilter = 'all';

    function checkLogin() {
        currentUser = getLoggedInUser();
        if (!currentUser) {
            document.getElementById('notLoggedIn').classList.remove('hidden');
            document.getElementById('userCenter').classList.add('hidden');
            return false;
        }
        const users = getUsers();
        const fullUser = users.find(function(u) { return u.username === currentUser.username; });
        if (fullUser) {
            currentUser = Object.assign({}, fullUser);
            setLoggedInUser({ username: currentUser.username, phone: currentUser.phone || '' });
        }
        document.getElementById('notLoggedIn').classList.add('hidden');
        document.getElementById('userCenter').classList.remove('hidden');
        return true;
    }

    function logout() {
        clearAllTimers();
        try {
            localStorage.removeItem('agriCreditLoggedInUser');
            sessionStorage.removeItem('agriCreditLoggedInUser');
        } catch (e) { /* 忽略 */ }
        showToast('已安全退出', 'success');
        setTimeout(function() { window.location.href = 'auth.html'; }, 1000);
    }

    // ==================== 侧边栏切换 ====================
    function switchSection(section) {
        const sections = ['profile', 'applications', 'security'];
        sections.forEach(function(s) {
            const key = s.charAt(0).toUpperCase() + s.slice(1);
            document.getElementById('section' + key).classList.add('hidden');
            const navBtn = document.getElementById('nav' + key);
            navBtn.classList.remove('active');
            navBtn.classList.add('text-gray-700');
        });
        const sectionKey = section.charAt(0).toUpperCase() + section.slice(1);
        const el = document.getElementById('section' + sectionKey);
        el.classList.remove('hidden');
        const activeNav = document.getElementById('nav' + sectionKey);
        activeNav.classList.add('active');
        activeNav.classList.remove('text-gray-700');

        // 重新触发动画
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

        // 信用积分
        let score = currentUser.creditScore;
        if (!score) {
            let hash = 0;
            const u = currentUser.username || '';
            for (let i = 0; i < u.length; i++) hash = ((hash << 5) - hash) + u.charCodeAt(i);
            score = 400 + Math.abs(hash % 400);
        }
        const barWidth = Math.min(100, (score / 800) * 100);
        let level = '', levelClass = '';
        if (score >= 750) { level = '优秀'; levelClass = 'bg-agri-100 text-agri-700'; }
        else if (score >= 650) { level = '良好'; levelClass = 'bg-fin-100 text-fin-700'; }
        else if (score >= 550) { level = '中等'; levelClass = 'bg-amber-100 text-amber-700'; }
        else if (score >= 450) { level = '一般'; levelClass = 'bg-orange-100 text-orange-700'; }
        else { level = '较差'; levelClass = 'bg-red-100 text-red-700'; }

        document.getElementById('viewCreditScore').textContent = score;
        const levelEl = document.getElementById('viewCreditLevel');
        levelEl.textContent = level;
        levelEl.className = 'px-2 py-0.5 text-xs font-semibold rounded-full ' + levelClass;
        document.getElementById('creditBar').style.width = barWidth + '%';

        if (currentUser.creditReason && currentUser.creditUpdatedAt) {
            document.getElementById('creditReasonBox').classList.remove('hidden');
            document.getElementById('viewCreditReason').textContent = currentUser.creditReason;
            document.getElementById('viewCreditTime').textContent = formatDate(currentUser.creditUpdatedAt);
        }

        // 侧边栏
        document.getElementById('sidebarUsername').textContent = currentUser.username;
        document.getElementById('sidebarPhone').textContent = currentUser.phone ? maskPhone(currentUser.phone) : '未绑定';
        const avatar = document.getElementById('userAvatar');
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

    // ==================== 贷款申请管理 ====================
    const statusMap = {
        pending: { text: '审批中', class: 'status-pending' },
        approved: { text: '已通过', class: 'status-approved' },
        rejected: { text: '已拒绝', class: 'status-rejected' },
        paid: { text: '已放款', class: 'status-paid' },
        closed: { text: '已结清', class: 'status-closed' }
    };
    const productColors = {
        '惠农贷': 'from-agri-400 to-agri-600',
        '农机贷': 'from-fin-400 to-fin-600',
        '种植贷': 'from-amber-400 to-amber-600',
        '养殖贷': 'from-rose-400 to-rose-600'
    };

    function renderApplications() {
        const apps = getApplications(currentUser.username);
        const filtered = currentFilter === 'all' ? apps : apps.filter(function(a) { return a.status === currentFilter; });

        // 统计
        document.getElementById('statTotal').textContent = apps.length;
        document.getElementById('statPending').textContent = apps.filter(function(a) { return a.status === 'pending'; }).length;
        document.getElementById('statApproved').textContent = apps.filter(function(a) { return a.status === 'approved'; }).length;
        document.getElementById('statPaid').textContent = apps.filter(function(a) { return a.status === 'paid'; }).length;
        document.getElementById('appCount').textContent = apps.length;

        const list = document.getElementById('appList');
        const empty = document.getElementById('appEmpty');

        if (filtered.length === 0) {
            list.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }
        empty.classList.add('hidden');

        list.innerHTML = filtered.map(function(a) {
            const s = statusMap[a.status] || statusMap.pending;
            const color = productColors[a.product] || 'from-gray-400 to-gray-600';
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
                        '<button data-action="view" data-id="' + a.id + '" class="px-3 py-1.5 text-xs font-medium text-agri-700 bg-agri-50 border border-agri-200 rounded-lg hover:bg-agri-100 transition-all">查看详情</button>' +
                        (a.status === 'pending' ? '<button data-action="cancel" data-id="' + a.id + '" class="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all">撤销</button>' : '') +
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
        const activeBtn = document.querySelector('.app-filter[data-status="' + status + '"]');
        if (activeBtn) {
            activeBtn.classList.add('active', 'bg-agri-600', 'text-white', 'font-medium');
            activeBtn.classList.remove('bg-white', 'border', 'border-gray-200', 'text-gray-600');
        }
        renderApplications();
    }

    function openNewAppModal() {
        document.getElementById('newAppModal').classList.remove('hidden');
        document.getElementById('newAppForm').reset();
    }

    function closeNewAppModal() {
        document.getElementById('newAppModal').classList.add('hidden');
    }

    function submitNewApp(e) {
        e.preventDefault();
        const product = document.getElementById('appProduct').value;
        const amount = document.getElementById('appAmount').value.trim();
        const term = document.getElementById('appTerm').value;
        const purpose = document.getElementById('appPurpose').value.trim();
        const remark = document.getElementById('appRemark').value.trim();

        if (!product) { showToast('请选择申请产品', 'error'); return; }
        if (!amount || parseFloat(amount) <= 0) { showToast('请输入有效的申请金额', 'error'); return; }
        if (!term) { showToast('请选择期望期限', 'error'); return; }
        if (!purpose) { showToast('请填写资金用途', 'error'); return; }

        const apps = getApplications(currentUser.username);
        const newApp = {
            id: Date.now(),
            product: product,
            amount: parseFloat(amount),
            term: parseInt(term, 10),
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

        // 模拟审批流程：3秒后自动更新状态，定时器受管理
        const appId = newApp.id;
        addTimer(setTimeout(function() {
            const allApps = getApplications(currentUser.username);
            const idx = allApps.findIndex(function(a) { return a.id === appId; });
            if (idx >= 0 && allApps[idx].status === 'pending') {
                allApps[idx].status = Math.random() < 0.9 ? 'approved' : 'rejected';
                allApps[idx].reviewedAt = new Date().toISOString();
                allApps[idx].reviewNote = allApps[idx].status === 'approved'
                    ? '您的信用评分良好，申请已通过审批'
                    : '综合评估未通过，建议完善个人信息后重新申请';
                saveApplications(currentUser.username, allApps);
                if (!document.getElementById('sectionApplications').classList.contains('hidden')) {
                    renderApplications();
                }
                // 通过后再模拟放款
                if (allApps[idx].status === 'approved') {
                    addTimer(setTimeout(function() {
                        const latest = getApplications(currentUser.username);
                        const i2 = latest.findIndex(function(a) { return a.id === appId; });
                        if (i2 >= 0 && latest[i2].status === 'approved') {
                            latest[i2].status = 'paid';
                            latest[i2].paidAt = new Date().toISOString();
                            saveApplications(currentUser.username, latest);
                            if (!document.getElementById('sectionApplications').classList.contains('hidden')) {
                                renderApplications();
                            }
                        }
                    }, 4000));
                }
            }
        }, 3000));
    }

    function viewDetail(id) {
        const apps = getApplications(currentUser.username);
        const app = apps.find(function(a) { return a.id === id; });
        if (!app) return;

        const s = statusMap[app.status] || statusMap.pending;
        const reviewTime = app.reviewedAt || app.approvedAt || app.rejectedAt;
        let reviewNote = app.reviewNote || app.approvalComment;
        if (!reviewNote && reviewTime) {
            reviewNote = app.status === 'approved' ? '您的信用评分良好，申请已通过审批' :
                         app.status === 'rejected' ? '综合评估未通过，建议完善个人信息后重新申请' : '等待审批中';
        }

        const timeline = [
            { title: '提交申请', time: app.createdAt, done: true, desc: '申请已提交，等待系统审批' },
            { title: '审批结果', time: reviewTime, done: !!reviewTime, desc: reviewNote || '等待审批中' },
            { title: '放款到账', time: app.paidAt, done: !!app.paidAt, desc: app.paidAt ? '资金已发放至您的账户' : '等待放款' }
        ];

        const timelineHtml = timeline.map(function(t, i) {
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
        let apps = getApplications(currentUser.username);
        apps = apps.filter(function(a) { return a.id !== id; });
        saveApplications(currentUser.username, apps);
        renderApplications();
        showToast('申请已撤销', 'success');
    }

    // ==================== 事件绑定（事件委托） ====================
    document.addEventListener('DOMContentLoaded', function() {
        if (checkLogin()) {
            renderProfile();
            renderApplications();
        }

        // 侧边栏导航 - 事件委托
        const sidebarNav = document.querySelector('aside nav');
        if (sidebarNav) {
            sidebarNav.addEventListener('click', function(e) {
                const btn = e.target.closest('[id^="nav"]');
                if (!btn) return;
                const sectionMap = {
                    navProfile: 'profile',
                    navApplications: 'applications',
                    navSecurity: 'security'
                };
                const section = sectionMap[btn.id];
                if (section) switchSection(section);
            });
        }

        // 申请列表操作 - 事件委托
        const appList = document.getElementById('appList');
        if (appList) {
            appList.addEventListener('click', function(e) {
                const btn = e.target.closest('button[data-action]');
                if (!btn) return;
                const id = parseInt(btn.dataset.id, 10);
                if (btn.dataset.action === 'view') viewDetail(id);
                else if (btn.dataset.action === 'cancel') cancelApp(id);
            });
        }

        // 筛选标签 - 事件委托
        const filterBar = document.querySelector('.flex.items-center.gap-2.flex-wrap');
        if (filterBar) {
            filterBar.addEventListener('click', function(e) {
                const btn = e.target.closest('.app-filter');
                if (!btn) return;
                filterApps(btn.dataset.status);
            });
        }

        // 个人信息表单
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const realName = document.getElementById('editRealName').value.trim();
                const phone = document.getElementById('editPhone').value.trim();
                const idCard = document.getElementById('editIdCard').value.trim();
                const businessType = document.getElementById('editBusinessType').value;
                const address = document.getElementById('editAddress').value.trim();
                const description = document.getElementById('editDescription').value.trim();

                if (phone && !/^1[3-9]\d{9}$/.test(phone)) { showToast('请输入有效的11位手机号码', 'error'); return; }
                if (idCard && !/^\d{17}[\dXx]$/.test(idCard)) { showToast('请输入有效的18位身份证号码', 'error'); return; }

                const users = getUsers();
                const idx = users.findIndex(function(u) { return u.username === currentUser.username; });
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
            });
        }

        // 手机号过滤
        const editPhone = document.getElementById('editPhone');
        if (editPhone) {
            editPhone.addEventListener('input', function() { this.value = this.value.replace(/\D/g, '').slice(0, 11); });
        }
        // 身份证号过滤
        const editIdCard = document.getElementById('editIdCard');
        if (editIdCard) {
            editIdCard.addEventListener('input', function() { this.value = this.value.replace(/[^\dXx]/g, '').slice(0, 18); });
        }

        // 密码表单
        const passwordForm = document.getElementById('passwordForm');
        const confirmPwdInput = document.getElementById('confirmPwd');
        const pwdHint = document.getElementById('pwdHint');
        const newPwdInput = document.getElementById('newPwd');

        if (confirmPwdInput && pwdHint && newPwdInput) {
            confirmPwdInput.addEventListener('input', function() {
                if (this.value.length > 0 && this.value !== newPwdInput.value) {
                    pwdHint.classList.remove('hidden');
                } else {
                    pwdHint.classList.add('hidden');
                }
            });
        }

        if (passwordForm) {
            passwordForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const cur = document.getElementById('currentPwd').value.trim();
                const np = newPwdInput.value.trim();
                const cp = confirmPwdInput.value.trim();
                if (!cur) { showToast('请输入当前密码', 'error'); return; }
                if (cur !== currentUser.password) { showToast('当前密码错误', 'error'); return; }
                if (!np || np.length < 6 || np.length > 20) { showToast('新密码长度应为6-20个字符', 'error'); return; }
                if (np !== cp) { showToast('两次输入的新密码不一致', 'error'); return; }
                if (np === cur) { showToast('新密码不能与当前密码相同', 'error'); return; }

                const users = getUsers();
                const idx = users.findIndex(function(u) { return u.username === currentUser.username; });
                if (idx >= 0) { users[idx].password = np; saveUsers(users); currentUser.password = np; }
                passwordForm.reset();
                showToast('密码修改成功', 'success');
            });
        }

        // 新增申请表单
        const newAppForm = document.getElementById('newAppForm');
        if (newAppForm) {
            newAppForm.addEventListener('submit', submitNewApp);
        }
    });

    // 页面卸载时清理定时器，避免内存泄漏
    window.addEventListener('beforeunload', clearAllTimers);

    // 暴露必要的全局函数（供HTML onclick调用）
    window.switchSection = switchSection;
    window.logout = logout;
    window.enterEditProfile = enterEditProfile;
    window.cancelEditProfile = cancelEditProfile;
    window.openNewAppModal = openNewAppModal;
    window.closeNewAppModal = closeNewAppModal;
    window.closeDetailModal = closeDetailModal;
    window.filterApps = filterApps;

})();
