/**
 * 智能惠农信贷系统 - 公共工具模块
 */
(function() {
    'use strict';

    var App = {};

    // ===== 存储 Key 常量 =====
    App.KEYS = {
        LOGGED_IN_USER: 'agriCreditLoggedInUser',
        USERS: 'agriCreditUsers',
        APPLICATIONS: 'agriLoanApplications',
        PRODUCTS: 'agriLoanProducts',
        DEMANDS: 'agriLoanDemands',
        BANK_LOGGED_IN: 'agriAdminLoggedIn',
        ADMIN_LOGGED_IN: 'agriSystemAdminLoggedIn',
        ACTIVITIES: 'agriActivities',
        BANK_USERS: 'agriBankUsers',
        ANNOUNCEMENTS: 'agriAnnouncements'
    };

    // ===== 安全存储操作 =====
    App.safeGetJSON = function(key, fallback) {
        try {
            var data = JSON.parse(localStorage.getItem(key));
            return data !== null && data !== undefined ? data : (fallback || null);
        } catch (e) {
            return fallback !== undefined ? fallback : null;
        }
    };

    App.safeSetJSON = function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('localStorage写入失败:', e.message);
            return false;
        }
    };

    App.safeRemoveItem = function(key) {
        try { localStorage.removeItem(key); } catch (e) {}
    };

    App.safeGetSession = function(key) {
        try { return sessionStorage.getItem(key); } catch (e) { return null; }
    };

    App.safeSetSession = function(key, value) {
        try { sessionStorage.setItem(key, value); } catch (e) {}
    };

    App.safeRemoveSession = function(key) {
        try { sessionStorage.removeItem(key); } catch (e) {}
    };

    // ===== 用户数据 =====
    App.getUsers = function() {
        return App.safeGetJSON(App.KEYS.USERS, []);
    };

    App.saveUsers = function(users) {
        App.safeSetJSON(App.KEYS.USERS, users);
    };

    // ===== 登录用户 =====
    App.getLoggedInUser = function() {
        try {
            var s = localStorage.getItem(App.KEYS.LOGGED_IN_USER) || sessionStorage.getItem(App.KEYS.LOGGED_IN_USER);
            return s ? JSON.parse(s) : null;
        } catch (e) {
            return null;
        }
    };

    App.setLoggedInUser = function(user, remember) {
        var data = JSON.stringify(user);
        if (remember) {
            App.safeSetJSON(App.KEYS.LOGGED_IN_USER, user);
        } else {
            App.safeRemoveItem(App.KEYS.LOGGED_IN_USER);
            App.safeSetSession(App.KEYS.LOGGED_IN_USER, data);
        }
    };

    // ===== 导航栏登录状态更新 =====
    App.updateNavLoginState = function() {
        var user = App.getLoggedInUser();
        var notLoggedIn = document.getElementById('notLoggedIn');
        var loggedIn = document.getElementById('loggedIn');
        var navAvatar = document.getElementById('navAvatar');
        var navUsername = document.getElementById('navUsername');

        if (user && notLoggedIn && loggedIn) {
            notLoggedIn.classList.add('hidden');
            loggedIn.classList.remove('hidden');
            loggedIn.classList.add('flex');
            if (navAvatar) navAvatar.textContent = (user.username || 'U').charAt(0).toUpperCase();
            if (navUsername) navUsername.textContent = user.username || '用户';
        } else if (notLoggedIn && loggedIn) {
            notLoggedIn.classList.remove('hidden');
            loggedIn.classList.add('hidden');
            loggedIn.classList.remove('flex');
        }
    };

    // ===== 退出登录 =====
    App.logout = function(opts) {
        opts = opts || {};
        App.safeRemoveItem(App.KEYS.LOGGED_IN_USER);
        App.safeRemoveSession(App.KEYS.LOGGED_IN_USER);
        if (opts.beforeRedirect) opts.beforeRedirect();
        if (opts.showToast && typeof App.showToast === 'function') {
            App.showToast('已安全退出', 'success');
            setTimeout(function() { window.location.href = 'auth.html'; }, opts.delay || 800);
        } else {
            alert('已安全退出');
            window.location.href = 'auth.html';
        }
    };

    // ===== 管理员登录校验 =====
    App.checkAdminLogin = function(key) {
        key = key || App.KEYS.BANK_LOGGED_IN;
        var loggedIn = App.safeGetSession(key);
        var notLoggedInEl = document.getElementById('notLoggedIn');
        var adminPanelEl = document.getElementById('adminPanel');

        if (loggedIn) {
            if (notLoggedInEl) notLoggedInEl.classList.add('hidden');
            if (adminPanelEl) adminPanelEl.classList.remove('hidden');
            return true;
        }
        if (notLoggedInEl) notLoggedInEl.classList.remove('hidden');
        if (adminPanelEl) adminPanelEl.classList.add('hidden');
        return false;
    };

    App.adminLogout = function(key) {
        App.safeRemoveSession(key || App.KEYS.BANK_LOGGED_IN);
        App.showToast('已安全退出', 'success');
        setTimeout(function() { window.location.href = 'auth.html'; }, 500);
    };

    // ===== Toast 提示 =====
    App.showToast = function(msg, type) {
        var toast = document.getElementById('toast');
        var toastText = document.getElementById('toastText');
        var toastIcon = document.getElementById('toastIcon');
        if (!toast || !toastText) return;

        toastText.textContent = msg;

        var bgClass = 'bg-agri-600';
        if (type === 'error') bgClass = 'bg-red-500';
        else if (type === 'info') bgClass = 'bg-fin-600';
        else if (type === 'warning') bgClass = 'bg-amber-500';

        toast.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 transition-all duration-300 ' + bgClass;

        if (toastIcon) {
            var iconPath = type === 'success'
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';
            toastIcon.innerHTML = iconPath;
        }

        toast.style.transform = '';
        toast.style.opacity = '1';

        setTimeout(function() {
            toast.style.transform = 'translateY(-80px)';
            toast.style.opacity = '0';
        }, 2800);
    };

    // ===== 日期格式化 =====
    App.formatDate = function(d) {
        if (!d) return '-';
        var date = new Date(d);
        var pad = function(n) { return n < 10 ? '0' + n : n; };
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
    };

    App.formatDateShort = function(d) {
        if (!d) return '-';
        var date = new Date(d);
        var pad = function(n) { return n < 10 ? '0' + n : n; };
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    };

    // ===== 贷款申请数据 =====
    App.getApplications = function(username) {
        var all = App.safeGetJSON(App.KEYS.APPLICATIONS, {});
        if (username) return all[username] || [];
        return all;
    };

    App.saveApplications = function(usernameOrApps, apps) {
        if (typeof usernameOrApps === 'string') {
            var all = App.safeGetJSON(App.KEYS.APPLICATIONS, {});
            all[usernameOrApps] = apps;
            App.safeSetJSON(App.KEYS.APPLICATIONS, all);
        } else {
            App.safeSetJSON(App.KEYS.APPLICATIONS, usernameOrApps);
        }
    };

    // ===== 贷款产品 =====
    App.getProducts = function() {
        return App.safeGetJSON(App.KEYS.PRODUCTS, []);
    };

    App.saveProducts = function(products) {
        App.safeSetJSON(App.KEYS.PRODUCTS, products);
    };

    // ===== 贷款需求 =====
    App.getDemands = function() {
        return App.safeGetJSON(App.KEYS.DEMANDS, []);
    };

    App.saveDemands = function(demands) {
        App.safeSetJSON(App.KEYS.DEMANDS, demands);
    };

    // ===== 操作日志 =====
    App.getActivities = function() {
        return App.safeGetJSON(App.KEYS.ACTIVITIES, []);
    };

    App.addActivity = function(type, detail) {
        var logs = App.getActivities();
        logs.unshift({ type: type, detail: detail, time: new Date().toISOString() });
        if (logs.length > 200) logs.length = 200;
        App.safeSetJSON(App.KEYS.ACTIVITIES, logs);
    };

    // ===== 信用积分 =====
    App.getDefaultCredit = function(username) {
        if (!username) return 500;
        var hash = 0;
        for (var i = 0; i < username.length; i++) {
            hash = ((hash << 5) - hash) + username.charCodeAt(i);
        }
        return 400 + Math.abs(hash % 400);
    };

    App.getCreditScore = function(username) {
        var users = App.getUsers();
        var u = users.find(function(user) { return user.username === username; });
        if (u && u.creditScore) return u.creditScore;
        return App.getDefaultCredit(username);
    };

    App.getCreditLevel = function(score) {
        if (score >= 750) return { text: '优秀', class: 'bg-agri-100 text-agri-700' };
        if (score >= 650) return { text: '良好', class: 'bg-fin-100 text-fin-700' };
        if (score >= 550) return { text: '中等', class: 'bg-amber-100 text-amber-700' };
        if (score >= 450) return { text: '一般', class: 'bg-orange-100 text-orange-700' };
        return { text: '较差', class: 'bg-red-100 text-red-700' };
    };

    // ===== 手机号脱敏 =====
    App.maskPhone = function(p) {
        return p ? p.substring(0, 3) + '****' + p.substring(7) : '-';
    };

    // ===== 模块切换（管理后台通用） =====
    App.switchModule = function(module, modules, renderMap) {
        modules.forEach(function(m) {
            var capM = App.capitalize(m);
            var el = document.getElementById('module' + capM);
            var nav = document.getElementById('nav' + capM);
            if (el) el.classList.add('hidden');
            if (nav) { nav.classList.remove('active'); nav.classList.add('text-gray-700'); }
        });
        var capModule = App.capitalize(module);
        var targetEl = document.getElementById('module' + capModule);
        var targetNav = document.getElementById('nav' + capModule);
        if (targetEl) {
            targetEl.classList.remove('hidden');
            targetEl.classList.remove('animate-fadeInUp');
            void targetEl.offsetWidth;
            targetEl.classList.add('animate-fadeInUp');
        }
        if (targetNav) { targetNav.classList.add('active'); targetNav.classList.remove('text-gray-700'); }
        if (renderMap && renderMap[module]) renderMap[module]();
    };

    // ===== 工具函数 =====
    App.capitalize = function(str) {
        return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    };

    App.formatMoney = function(n) {
        if (n >= 10000) return (n / 10000).toFixed(1) + '万';
        return n.toLocaleString();
    };

    // ===== 信用积分进度条颜色 =====
    App.getCreditColor = function(score) {
        if (score >= 750) return '#22c55e';
        if (score >= 650) return '#3b82f6';
        if (score >= 550) return '#f59e0b';
        if (score >= 450) return '#f97316';
        return '#ef4444';
    };

    // 暴露到全局
    window.App = App;
})();
