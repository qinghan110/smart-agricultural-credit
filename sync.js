// 智能惠农信贷系统 - 数据同步共享文件
// 统一管理 localStorage 数据，支持多页面数据同步

(function() {
    'use strict';

    // ==================== 默认产品数据 ====================
    var DEFAULT_PRODUCTS = [
        {
            id: 'p001',
            name: '惠农贷',
            description: '面向农户的综合信用贷款，无需抵押，纯信用授信',
            minAmount: 1,
            maxAmount: 30,
            rate: '3.85%起',
            term: '1-36个月',
            category: '综合',
            color: 'agri',
            badge: '热销',
            icon: 'globe',
            status: 'active',
            createdAt: '2024-01-15T00:00:00.000Z'
        },
        {
            id: 'p002',
            name: '农机贷',
            description: '专项用于购置农业机械设备，支持分期还款',
            minAmount: 5,
            maxAmount: 100,
            rate: '4.35%起',
            term: '6-60个月',
            category: '机械',
            color: 'fin',
            badge: '推荐',
            icon: 'cog',
            status: 'active',
            createdAt: '2024-01-15T00:00:00.000Z'
        },
        {
            id: 'p003',
            name: '种植贷',
            description: '支持粮食、经济作物等种植生产的流动资金需求',
            minAmount: 2,
            maxAmount: 50,
            rate: '3.65%起',
            term: '3-24个月',
            category: '种植',
            color: 'amber',
            badge: '春耕特惠',
            icon: 'plant',
            status: 'active',
            createdAt: '2024-01-15T00:00:00.000Z'
        },
        {
            id: 'p004',
            name: '养殖贷',
            description: '覆盖畜禽、水产等养殖产业的资金周转需求',
            minAmount: 5,
            maxAmount: 80,
            rate: '4.15%起',
            term: '6-36个月',
            category: '养殖',
            color: 'rose',
            badge: '热门',
            icon: 'livestock',
            status: 'active',
            createdAt: '2024-01-15T00:00:00.000Z'
        },
        {
            id: 'p005',
            name: '惠农快贷',
            description: '依托大数据风控，最快30分钟放款，纯信用无抵押',
            minAmount: 0.5,
            maxAmount: 50,
            rate: '4.05%起',
            term: '1-24个月',
            category: '综合',
            color: 'emerald',
            badge: '极速',
            icon: 'flash',
            status: 'active',
            createdAt: '2024-03-12T00:00:00.000Z'
        },
        {
            id: 'p006',
            name: '土地流转贷',
            description: '支持土地经营权流转及规模化经营的资金需求',
            minAmount: 10,
            maxAmount: 200,
            rate: '4.50%起',
            term: '12-60个月',
            category: '规模经营',
            color: 'lime',
            badge: '新上线',
            icon: 'field',
            status: 'active',
            createdAt: '2024-03-15T00:00:00.000Z'
        },
        {
            id: 'p007',
            name: '农产品加工贷',
            description: '支持农产品深加工产业链发展的专项贷款',
            minAmount: 20,
            maxAmount: 300,
            rate: '4.65%起',
            term: '12-60个月',
            category: '加工',
            color: 'orange',
            badge: '产业',
            icon: 'factory',
            status: 'active',
            createdAt: '2024-03-15T00:00:00.000Z'
        },
        {
            id: 'p008',
            name: '小额创业贷',
            description: '面向农村创业者的小额启动资金贷款',
            minAmount: 0.3,
            maxAmount: 10,
            rate: '3.45%起',
            term: '1-12个月',
            category: '创业',
            color: 'sky',
            badge: '低门槛',
            icon: 'rocket',
            status: 'active',
            createdAt: '2024-03-15T00:00:00.000Z'
        }
    ];

    // ==================== 颜色映射 ====================
    var COLOR_MAP = {
        agri: { from: '#4ade80', to: '#16a34a', text: '#15803d', bg: '#dcfce7' },
        fin: { from: '#60a5fa', to: '#2563eb', text: '#1d4ed8', bg: '#dbeafe' },
        amber: { from: '#fbbf24', to: '#d97706', text: '#b45309', bg: '#fef3c7' },
        rose: { from: '#fb7185', to: '#e11d48', text: '#be123c', bg: '#ffe4e6' },
        emerald: { from: '#34d399', to: '#059669', text: '#047857', bg: '#d1fae5' },
        lime: { from: '#a3e635', to: '#65a30d', text: '#4d7c0f', bg: '#ecfccb' },
        orange: { from: '#fb923c', to: '#ea580c', text: '#c2410c', bg: '#ffedd5' },
        sky: { from: '#38bdf8', to: '#0284c7', text: '#0369a1', bg: '#e0f2fe' },
        purple: { from: '#c084fc', to: '#9333ea', text: '#7e22ce', bg: '#f3e8ff' }
    };

    var ICON_MAP = {
        globe: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        cog: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        plant: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        livestock: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        flash: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z',
        field: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2z',
        factory: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
        rocket: 'M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z'
    };

    // ==================== 初始化默认产品数据 ====================
    function initDefaultProducts() {
        var existing;
        try {
            existing = JSON.parse(localStorage.getItem('agriLoanProducts'));
        } catch(e) {
            existing = null;
        }
        if (!existing || !Array.isArray(existing) || existing.length === 0) {
            localStorage.setItem('agriLoanProducts', JSON.stringify(DEFAULT_PRODUCTS));
        }
    }

    // ==================== 获取产品列表 ====================
    function getProducts() {
        initDefaultProducts();
        try {
            var products = JSON.parse(localStorage.getItem('agriLoanProducts')) || [];
            return products.filter(function(p) { return p.status === 'active' || p.status === undefined; });
        } catch(e) {
            return DEFAULT_PRODUCTS;
        }
    }

    function getAllProducts() {
        initDefaultProducts();
        try {
            return JSON.parse(localStorage.getItem('agriLoanProducts')) || DEFAULT_PRODUCTS;
        } catch(e) {
            return DEFAULT_PRODUCTS;
        }
    }

    function saveProducts(products) {
        localStorage.setItem('agriLoanProducts', JSON.stringify(products));
        // 触发数据更新事件
        window.dispatchEvent(new CustomEvent('agriDataUpdated', { detail: { type: 'products' } }));
    }

    // ==================== 渲染产品卡片 ====================
    function renderProductCard(product) {
        var colorKey = product.color || 'agri';
        var iconPath = ICON_MAP[product.icon || 'globe'] || ICON_MAP.globe;

        return '<div class="product-card group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-' + colorKey + '-200 transition-all duration-300 cursor-pointer">' +
            '<div class="relative h-36 bg-gradient-to-br from-' + colorKey + '-400 to-' + colorKey + '-600 overflow-hidden">' +
                '<div class="absolute inset-0 flex items-center justify-center">' +
                    '<svg class="w-20 h-20 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                        '<path stroke-linecap="round" stroke-linejoin="round" d="' + iconPath + '"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="absolute top-3 right-3 px-2 py-1 bg-white/95 text-' + colorKey + '-700 text-xs font-semibold rounded-lg">' + (product.badge || '推荐') + '</div>' +
            '</div>' +
            '<div class="p-6">' +
                '<div class="product-icon w-12 h-12 rounded-xl bg-gradient-to-br from-' + colorKey + '-400 to-' + colorKey + '-600 flex items-center justify-center mb-3 shadow-lg shadow-' + colorKey + '-200 -mt-12 relative z-10 border-4 border-white">' +
                    '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="' + iconPath + '"/>' +
                    '</svg>' +
                '</div>' +
                '<h3 class="font-display font-bold text-lg text-gray-900 mb-2">' + product.name + '</h3>' +
                '<p class="text-sm text-gray-500 leading-relaxed mb-4">' + product.description + '</p>' +
                '<div class="space-y-2 mb-5">' +
                    '<div class="flex justify-between text-sm"><span class="text-gray-400">额度范围</span><span class="font-semibold text-gray-700">' + product.minAmount + '-' + product.maxAmount + '万元</span></div>' +
                    '<div class="flex justify-between text-sm"><span class="text-gray-400">年化利率</span><span class="font-semibold text-' + colorKey + '-600">' + product.rate + '</span></div>' +
                    '<div class="flex justify-between text-sm"><span class="text-gray-400">贷款期限</span><span class="font-semibold text-gray-700">' + product.term + '</span></div>' +
                '</div>' +
                '<button class="w-full py-2.5 bg-' + colorKey + '-50 text-' + colorKey + '-700 font-semibold text-sm rounded-xl border border-' + colorKey + '-200 group-hover:bg-' + colorKey + '-600 group-hover:text-white group-hover:border-' + colorKey + '-600 transition-all" onclick="window.location.href=\'loans.html#products\'">' +
                    '立即申请' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    // ==================== 渲染首页产品列表 ====================
    function renderHomeProducts(targetId) {
        var container = document.getElementById(targetId || 'productsGrid');
        if (!container) return;
        var products = getProducts().slice(0, 8);
        var html = products.map(renderProductCard).join('');
        container.innerHTML = html;
    }

    // ==================== 初始化 ====================
    function init() {
        initDefaultProducts();

        // 监听 storage 事件（跨页面同步）
        window.addEventListener('storage', function(e) {
            if (e.key === 'agriLoanProducts') {
                renderHomeProducts('productsGrid');
                renderLoansPageProducts();
            }
        });

        // 监听自定义事件（同页面同步）
        window.addEventListener('agriDataUpdated', function(e) {
            if (e.detail && e.detail.type === 'products') {
                renderHomeProducts('productsGrid');
                renderLoansPageProducts();
            }
        });

        // 页面加载完成后渲染产品
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                renderHomeProducts('productsGrid');
                renderLoansPageProducts();
            });
        } else {
            renderHomeProducts('productsGrid');
            renderLoansPageProducts();
        }
    }

    // 渲染loans.html的产品列表
    function renderLoansPageProducts() {
        var container = document.getElementById('loansProductsGrid');
        if (!container) return;
        var products = getProducts();
        var html = products.map(function(p) {
            var colorKey = p.color || 'agri';
            var iconPath = ICON_MAP[p.icon || 'globe'] || ICON_MAP.globe;
            return '<div class="product-card group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-' + colorKey + '-200 transition-all duration-300 cursor-pointer" data-category="' + (p.category || '综合') + '">' +
                '<div class="relative h-36 bg-gradient-to-br from-' + colorKey + '-400 to-' + colorKey + '-600 overflow-hidden">' +
                    '<div class="absolute inset-0 flex items-center justify-center">' +
                        '<svg class="w-20 h-20 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                            '<path stroke-linecap="round" stroke-linejoin="round" d="' + iconPath + '"/>' +
                        '</svg>' +
                    '</div>' +
                    '<div class="absolute top-3 right-3 px-2 py-1 bg-white/95 text-' + colorKey + '-700 text-xs font-semibold rounded-lg">' + (p.badge || '推荐') + '</div>' +
                '</div>' +
                '<div class="p-6">' +
                    '<div class="product-icon w-12 h-12 rounded-xl bg-gradient-to-br from-' + colorKey + '-400 to-' + colorKey + '-600 flex items-center justify-center mb-3 shadow-lg shadow-' + colorKey + '-200 -mt-12 relative z-10 border-4 border-white">' +
                        '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="' + iconPath + '"/>' +
                        '</svg>' +
                    '</div>' +
                    '<h3 class="font-display font-bold text-lg text-gray-900 mb-2">' + p.name + '</h3>' +
                    '<p class="text-sm text-gray-500 leading-relaxed mb-4">' + p.description + '</p>' +
                    '<div class="space-y-2 mb-5">' +
                        '<div class="flex justify-between text-sm"><span class="text-gray-400">额度范围</span><span class="font-semibold text-gray-700">' + p.minAmount + '-' + p.maxAmount + '万元</span></div>' +
                        '<div class="flex justify-between text-sm"><span class="text-gray-400">年化利率</span><span class="font-semibold text-' + colorKey + '-600">' + p.rate + '</span></div>' +
                        '<div class="flex justify-between text-sm"><span class="text-gray-400">贷款期限</span><span class="font-semibold text-gray-700">' + p.term + '</span></div>' +
                    '</div>' +
                    '<button class="w-full py-2.5 bg-' + colorKey + '-50 text-' + colorKey + '-700 font-semibold text-sm rounded-xl border border-' + colorKey + '-200 group-hover:bg-' + colorKey + '-600 group-hover:text-white group-hover:border-' + colorKey + '-600 transition-all" onclick="document.getElementById(\'apply\').scrollIntoView({behavior:\'smooth\'})">' +
                        '立即申请' +
                    '</button>' +
                '</div>' +
            '</div>';
        }).join('');
        container.innerHTML = html;
    }

    // 暴露到全局
    window.AgriData = {
        init: init,
        getProducts: getProducts,
        getAllProducts: getAllProducts,
        saveProducts: saveProducts,
        renderHomeProducts: renderHomeProducts,
        renderProductCard: renderProductCard,
        DEFAULT_PRODUCTS: DEFAULT_PRODUCTS,
        COLOR_MAP: COLOR_MAP,
        ICON_MAP: ICON_MAP,
        initDefaultProducts: initDefaultProducts
    };

    // 自动初始化
    init();
})();
