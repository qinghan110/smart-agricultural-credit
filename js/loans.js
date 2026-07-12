(function() {
    'use strict';

    // ==================== 产品数据 ====================
    const defaultProducts = [
        {
            id: 'p1', name: '惠农贷', category: '信用贷',
            desc: '面向农户的综合信用贷款，无需抵押，纯信用授信，手续简便快速放款',
            amountMin: 1, amountMax: 30, rate: '3.85%', termMax: 36,
            color: 'agri', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            img: 'img/product-huinong.jpg',
            fallback: ''
        },
        {
            id: 'p2', name: '农机贷', category: '设备贷',
            desc: '专项用于购置拖拉机、收割机等农业机械设备，支持分期还款减轻压力',
            amountMin: 5, amountMax: 100, rate: '4.35%', termMax: 60,
            color: 'fin', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
            img: 'img/product-nongji.jpg',
            fallback: ''
        },
        {
            id: 'p3', name: '种植贷', category: '经营贷',
            desc: '支持粮食、蔬菜、经济作物等种植生产的流动资金需求，覆盖种子化肥成本',
            amountMin: 2, amountMax: 50, rate: '3.65%', termMax: 24,
            color: 'amber', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
            img: 'img/product-zhongzhi.jpg',
            fallback: ''
        },
        {
            id: 'p4', name: '养殖贷', category: '经营贷',
            desc: '覆盖畜禽、水产等养殖产业的资金周转需求，支持规模化养殖发展',
            amountMin: 5, amountMax: 80, rate: '4.15%', termMax: 36,
            color: 'rose', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
            img: 'img/product-yangzhi.jpg',
            fallback: ''
        },
        {
            id: 'p5', name: '农担贷', category: '信用贷',
            desc: '由省级农业担保公司提供担保，额度高、利率低，适合规模化农业经营主体',
            amountMin: 10, amountMax: 200, rate: '4.05%', termMax: 60,
            color: 'fin', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            img: 'img/product-nongdan.jpg',
            fallback: ''
        },
        {
            id: 'p6', name: '春耕贷', category: '特色贷',
            desc: '春耕备耕专项贷款，用于购买种子、化肥、农药等生产资料，助力丰收年景',
            amountMin: 1, amountMax: 20, rate: '3.45%', termMax: 12,
            color: 'agri', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
            img: 'img/product-chungeng.jpg',
            fallback: ''
        },
        {
            id: 'p7', name: '农副产品加工贷', category: '设备贷',
            desc: '支持农副产品加工厂建设、设备购置及流水线升级，提升农产品附加值',
            amountMin: 20, amountMax: 300, rate: '4.25%', termMax: 60,
            color: 'amber', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H4m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5',
            img: 'img/product-jiagong.jpg',
            fallback: ''
        },
        {
            id: 'p8', name: '农旅融合贷', category: '特色贷',
            desc: '支持休闲农业、乡村旅游、农家乐等项目开发，助力一二三产业融合发展',
            amountMin: 10, amountMax: 150, rate: '4.55%', termMax: 60,
            color: 'rose', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            img: 'img/product-xiangcun.jpg',
            fallback: ''
        },
        {
            id: 'p9', name: '茶园经营贷', category: '经营贷',
            desc: '专为茶叶种植户和茶企设计，覆盖茶园管护、采摘、加工全产业链资金需求',
            amountMin: 5, amountMax: 100, rate: '3.95%', termMax: 48,
            color: 'agri', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13',
            img: 'img/product-chaye.jpg',
            fallback: ''
        }
    ];

    const colorMap = {
        agri:  { grad: 'from-agri-400 to-agri-600',   text: 'text-agri-600',  bg: 'bg-agri-50',  border: 'border-agri-200',  hoverBorder: 'hover:border-agri-300',  shadow: 'shadow-agri-200',  btnBg: 'bg-agri-50',  btnText: 'text-agri-700',  btnHover: 'group-hover:bg-agri-600 group-hover:text-white group-hover:border-agri-600',  dot: 'bg-agri-500' },
        fin:   { grad: 'from-fin-400 to-fin-600',     text: 'text-fin-600',   bg: 'bg-fin-50',   border: 'border-fin-200',   hoverBorder: 'hover:border-fin-300',   shadow: 'shadow-fin-200',   btnBg: 'bg-fin-50',   btnText: 'text-fin-700',   btnHover: 'group-hover:bg-fin-600 group-hover:text-white group-hover:border-fin-600',    dot: 'bg-fin-500' },
        amber: { grad: 'from-amber-400 to-amber-600', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', hoverBorder: 'hover:border-amber-300', shadow: 'shadow-amber-200', btnBg: 'bg-amber-50', btnText: 'text-amber-700', btnHover: 'group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600', dot: 'bg-amber-500' },
        rose:  { grad: 'from-rose-400 to-rose-600',   text: 'text-rose-600',  bg: 'bg-rose-50',  border: 'border-rose-200',  hoverBorder: 'hover:border-rose-300',  shadow: 'shadow-rose-200',  btnBg: 'bg-rose-50',  btnText: 'text-rose-700',  btnHover: 'group-hover:bg-rose-600 group-hover:text-white group-hover:border-rose-600',  dot: 'bg-rose-500' }
    };

    let currentProductFilter = 'all';

    // 获取所有产品（默认 + 管理员添加的）
    function getAllProducts() {
        const products = defaultProducts.slice();
        const existingNames = new Set(defaultProducts.map(p => p.name));
        const custom = App.getProducts();

        for (const p of custom) {
            if ((p.status === 'active' || !p.status) && p.name && !existingNames.has(p.name)) {
                const colorKey = resolveColorKey(p.color);
                const termMax = parseTermMax(p.term);
                products.push({
                    id: 'custom_' + (p.id || Date.now()),
                    name: p.name,
                    category: p.category || '特色贷',
                    desc: p.description || p.desc || '平台推出的特色贷款产品',
                    amountMin: parseFloat(p.amountMin || p.minAmount) || 1,
                    amountMax: parseFloat(p.amountMax || p.maxAmount) || 50,
                    rate: p.rate || '4.00%',
                    termMax,
                    color: colorKey,
                    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                    img: p.image || 'img/product-default.jpg',
                    fallback: '',
                    isCustom: true
                });
                existingNames.add(p.name);
            }
        }
        return products;
    }

    function resolveColorKey(color) {
        if (!color) return 'fin';
        if (color.includes('agri')) return 'agri';
        if (color.includes('amber')) return 'amber';
        if (color.includes('rose')) return 'rose';
        return 'fin';
    }

    function parseTermMax(term) {
        if (!term) return 36;
        const m = String(term).match(/(\d+)/);
        return m ? parseInt(m[1]) : 36;
    }

    // 渲染产品卡片
    function renderProducts() {
        const products = getAllProducts();
        const filtered = currentProductFilter === 'all'
            ? products
            : products.filter(p => p.category === currentProductFilter);
        const grid = document.getElementById('productGrid');

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-16 text-gray-400"><svg class="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg><p>暂无该分类的产品</p></div>';
            updateCustomTip(products);
            return;
        }

        grid.innerHTML = filtered.map(p => buildProductCard(p)).join('');
        updateCustomTip(products);
    }

    function buildProductCard(p) {
        const c = colorMap[p.color] || colorMap.agri;
        const badge = p.isCustom ? '<span class="absolute top-3 right-3 z-10 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-200">新品</span>' : '';
        return '<div class="product-card group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:' + c.hoverBorder + ' transition-all duration-300 cursor-pointer flex flex-col">' +
            '<div class="relative h-44 overflow-hidden bg-gray-100">' +
                '<img loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="' + p.img + '" alt="' + p.name + '" onerror="this.src=\'' + p.fallback + '\'">' +
                '<div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>' +
                '<div class="absolute bottom-3 left-3 flex items-center gap-2">' +
                    '<div class="w-9 h-9 rounded-xl bg-gradient-to-br ' + c.grad + ' flex items-center justify-center shadow-lg ' + c.shadow + '">' +
                        '<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="' + p.icon + '"/></svg>' +
                    '</div>' +
                    '<span class="px-2 py-0.5 text-[11px] font-medium rounded-full bg-white/90 text-gray-700">' + p.category + '</span>' +
                '</div>' +
                badge +
            '</div>' +
            '<div class="p-5 flex-1 flex flex-col">' +
                '<h3 class="font-display font-bold text-lg text-gray-900 mb-1.5">' + p.name + '</h3>' +
                '<p class="text-xs text-gray-500 leading-relaxed mb-4 flex-1">' + p.desc + '</p>' +
                '<div class="space-y-2 mb-4">' +
                    '<div class="flex justify-between text-sm"><span class="text-gray-400">额度范围</span><span class="font-semibold text-gray-700">' + p.amountMin + '-' + p.amountMax + '万元</span></div>' +
                    '<div class="flex justify-between text-sm"><span class="text-gray-400">年化利率</span><span class="font-semibold ' + c.text + '">' + p.rate + '起</span></div>' +
                    '<div class="flex justify-between text-sm"><span class="text-gray-400">最长期限</span><span class="font-semibold text-gray-700">' + p.termMax + '个月</span></div>' +
                '</div>' +
                '<button class="w-full py-2.5 ' + c.btnBg + ' ' + c.btnText + ' font-semibold text-sm rounded-xl border ' + c.border + ' ' + c.btnHover + ' transition-all" onclick="window._loans.selectProduct(\'' + p.name.replace(/'/g, "\\'") + '\')">' +
                    '立即申请' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    function updateCustomTip(products) {
        const customCount = products.filter(p => p.isCustom).length;
        const tip = document.getElementById('customProductTip');
        if (customCount > 0) {
            tip.classList.remove('hidden');
            tip.textContent = '已展示 ' + customCount + ' 个平台新增产品';
        } else {
            tip.classList.add('hidden');
        }
    }

    // 选择产品并滚动到申请表单
    function selectProduct(name) {
        const select = document.getElementById('applyProduct');
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === name || select.options[i].text === name) {
                select.selectedIndex = i;
                break;
            }
        }
        document.getElementById('apply').scrollIntoView({ behavior: 'smooth' });
    }

    // 筛选产品
    function filterProducts(category, btn) {
        currentProductFilter = category;
        document.querySelectorAll('.product-filter').forEach(b => {
            b.classList.remove('active', 'bg-agri-600', 'text-white', 'border-agri-600');
            b.classList.add('bg-white', 'text-gray-600', 'border-gray-200');
        });
        btn.classList.add('active', 'bg-agri-600', 'text-white', 'border-agri-600');
        btn.classList.remove('bg-white', 'text-gray-600', 'border-gray-200');
        renderProducts();
    }

    // 填充产品下拉框
    function fillProductSelects() {
        const products = getAllProducts();
        const applySelect = document.getElementById('applyProduct');
        applySelect.innerHTML = '<option value="">请选择</option>';
        for (const p of products) {
            applySelect.insertAdjacentHTML('beforeend', '<option value="' + p.name + '">' + p.name + '（' + p.rate + '起，' + p.amountMin + '-' + p.amountMax + '万）</option>');
        }
    }

    // 显示结果提示
    function showResult(elementId, textId, message, duration) {
        const r = document.getElementById(elementId);
        const t = document.getElementById(textId);
        t.textContent = message;
        r.classList.remove('hidden');
        r.classList.add('flex');
        setTimeout(() => {
            r.classList.add('hidden');
            r.classList.remove('flex');
        }, duration);
    }

    // 智能匹配
    function doMatch() {
        const typeMap = { crop: ['种植贷', '惠农贷'], machine: ['农机贷', '惠农贷'], breed: ['养殖贷', '惠农贷'], mixed: ['惠农贷', '农担贷'] };
        const income = parseFloat(document.getElementById('matchIncome').value) || 10;
        const credit = document.getElementById('matchCredit').value;
        const years = parseInt(document.getElementById('matchYears').value) || 1;
        const requestedAmount = parseFloat(document.getElementById('matchAmount').value) || 0;
        const requestedTerm = parseInt(document.getElementById('matchTerm').value) || 12;
        const purpose = document.getElementById('matchPurpose').value.trim();

        const allProducts = getAllProducts();

        // 对每个产品计算匹配分数
        const scored = allProducts.map(function(p) {
            let score = 50; // 基础分

            // 1. 经营类型匹配（+0~25）
            const preferredTypes = typeMap[document.getElementById('matchType').value] || ['惠农贷'];
            if (preferredTypes[0] === p.name) score += 25;
            else if (preferredTypes.indexOf(p.name) >= 0) score += 15;
            else if (p.category === '信用贷') score += 5;

            // 2. 额度匹配（+0~20）
            if (requestedAmount > 0) {
                if (requestedAmount >= p.amountMin && requestedAmount <= p.amountMax) {
                    score += 20; // 额度完全匹配
                } else if (requestedAmount < p.amountMin) {
                    score += 5; // 需求低于最低额度
                } else {
                    score += Math.max(0, 10 - (requestedAmount - p.amountMax) / p.amountMax * 10); // 超额但接近
                }
            } else {
                // 没有指定金额，按收入倍数推荐
                const creditMultiplier = credit === 'A' ? 2.5 : credit === 'B' ? 1.5 : 0.8;
                const suggestedAmount = Math.round(income * creditMultiplier);
                if (suggestedAmount >= p.amountMin && suggestedAmount <= p.amountMax) score += 15;
            }

            // 3. 期限匹配（+0~15）
            if (requestedTerm <= p.termMax) {
                score += 15;
                // 期限刚好用满或接近
                if (requestedTerm >= p.termMax * 0.7) score += 5;
            } else {
                score += Math.max(0, 10 - (requestedTerm - p.termMax) * 2);
            }

            // 4. 信用评级匹配（+0~10）
            const rateNum = parseFloat(p.rate);
            if (credit === 'A') {
                score += rateNum <= 3.8 ? 10 : rateNum <= 4.0 ? 7 : 3;
            } else if (credit === 'B') {
                score += rateNum <= 4.2 ? 10 : rateNum <= 4.5 ? 5 : 2;
            } else {
                score += rateNum <= 4.5 ? 8 : 5;
            }

            // 5. 经营年限加分（+0~5）
            if (years >= 5 && p.amountMax >= 50) score += 5;
            else if (years >= 3 && p.amountMax >= 20) score += 3;

            // 6. 利率越低越加分（+0~5）
            score += Math.max(0, Math.round((5 - rateNum) * 3));

            // 计算推荐金额和期限
            const creditMultiplier = credit === 'A' ? 2.5 : credit === 'B' ? 1.5 : 0.8;
            const maxByCredit = Math.round(income * creditMultiplier);
            let recAmount = requestedAmount > 0
                ? Math.min(requestedAmount, p.amountMax, maxByCredit)
                : Math.min(Math.round(maxByCredit * 0.8), p.amountMax);
            recAmount = Math.max(recAmount, p.amountMin);
            let recTerm = requestedTerm <= p.termMax ? requestedTerm : p.termMax;

            return {
                product: p.name,
                rate: p.rate,
                amount: recAmount,
                term: recTerm,
                score: Math.min(99, Math.round(score)),
                productId: p.id
            };
        });

        // 排序取前3
        scored.sort(function(a, b) { return b.score - a.score; });
        const results = scored.slice(0, 3);

        // 渲染结果
        const container = document.getElementById('matchResults');
        const colors = ['border-agri-400 bg-agri-50', 'border-fin-200 bg-fin-50/30', 'border-amber-200 bg-amber-50/30'];
        const tagLabels = ['强烈推荐', '推荐', '备选'];
        const tagColors = ['bg-agri-100 text-agri-700', 'bg-fin-100 text-fin-700', 'bg-amber-100 text-amber-700'];

        container.innerHTML = results.map(function(r, i) {
            return '<div class="match-card flex items-center justify-between p-4 rounded-2xl border ' + colors[i] + ' cursor-pointer hover:shadow-md transition-all" ' +
                'onclick="window._loans.applyMatch(' + r.amount + ',\'' + r.product.replace(/'/g, "\\'") + '\',' + r.term + ')">' +
                '<div class="flex items-center gap-4"><div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-display font-bold text-base text-gray-800">' + (i + 1) + '</div>' +
                '<div class="text-left"><h4 class="font-semibold text-gray-900 text-sm">' + r.product + '</h4><p class="text-xs text-gray-500">推荐额度 ' + r.amount + '万 · 利率 ' + r.rate + ' · ' + r.term + '个月</p></div></div>' +
                '<div class="text-right"><span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ' + tagColors[i] + '">' + tagLabels[i] + '</span>' +
                '<p class="text-xl font-display font-bold text-agri-600 mt-0.5">' + r.score + '<span class="text-[10px] text-gray-400 font-normal">分</span></p></div></div>';
        }).join('');

        // 添加底部提示
        container.innerHTML += '<p class="text-xs text-gray-400 text-center mt-3">点击匹配结果可直接跳转申请并自动填充信息</p>';

        document.getElementById('matchEmpty').classList.add('hidden');
        container.classList.remove('hidden');
    }

    // 点击匹配结果 → 自动填充申请表单
    function applyMatch(amount, product, term) {
        // 填充产品
        const select = document.getElementById('applyProduct');
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === product || select.options[i].text.indexOf(product) >= 0) {
                select.selectedIndex = i;
                break;
            }
        }
        // 填充金额
        document.getElementById('applyAmount').value = amount;
        // 填充期限
        const termSelect = document.getElementById('applyTerm');
        for (let i = 0; i < termSelect.options.length; i++) {
            if (parseInt(termSelect.options[i].value) === term || parseInt(termSelect.options[i].text) === term) {
                termSelect.selectedIndex = i;
                break;
            }
        }
        // 填充资金用途
        const purpose = document.getElementById('matchPurpose').value.trim();
        if (purpose) {
            document.getElementById('applyRemark').value = purpose;
        }
        // 如果已登录，自动填充用户信息
        const user = App.getLoggedInUser();
        if (user) {
            if (document.getElementById('applyName').value === '' && user.realName) {
                document.getElementById('applyName').value = user.realName;
            }
            if (document.getElementById('applyPhone').value === '' && user.phone) {
                document.getElementById('applyPhone').value = user.phone;
            }
        }
        // 高亮申请表单
        const applySection = document.getElementById('apply');
        applySection.scrollIntoView({ behavior: 'smooth' });
        const form = document.getElementById('applyForm');
        form.classList.add('ring-2', 'ring-agri-400', 'ring-offset-2', 'rounded-2xl');
        setTimeout(function() {
            form.classList.remove('ring-2', 'ring-agri-400', 'ring-offset-2');
        }, 2000);
    }

    // 处理贷款申请表单提交
    function handleApplySubmit(e) {
        e.preventDefault();
        const name = document.getElementById('applyName').value.trim();
        const idCard = document.getElementById('applyIdCard').value.trim();
        const phone = document.getElementById('applyPhone').value.trim();
        const product = document.getElementById('applyProduct').value;
        const amount = document.getElementById('applyAmount').value.trim();
        const term = document.getElementById('applyTerm').value;
        const address = document.getElementById('applyAddress').value.trim();
        const remark = document.getElementById('applyRemark').value.trim();
        const agree = document.getElementById('applyAgree').checked;

        if (!name) { alert('请输入申请人姓名'); return; }
        if (!phone || !/^1[3-9]\d{9}$/.test(phone)) { alert('请输入有效的手机号码'); return; }
        if (!product) { alert('请选择申请产品'); return; }
        if (!amount || parseFloat(amount) <= 0) { alert('请输入有效的申请金额'); return; }
        if (!agree) { alert('请先阅读并同意贷款申请协议'); return; }

        const user = App.getLoggedInUser();
        const username = user ? user.username : name;
        const allApps = App.getApplications();
        const userApps = allApps[username] || [];

        userApps.unshift({
            id: Date.now(),
            applicant: name,
            idCard,
            phone,
            product,
            amount: parseFloat(amount),
            term: parseInt(term) || 12,
            address,
            remark,
            status: 'pending',
            createdAt: new Date().toISOString(),
            source: 'loans_page'
        });
        allApps[username] = userApps;
        App.saveApplications(allApps);

        const message = user
            ? '贷款申请已提交！您可在"个人中心"查看审批进度，客户经理将尽快联系您（' + phone + '）。'
            : '贷款申请已提交！客户经理将在24小时内与您联系（' + phone + '），请保持电话畅通。';

        showResult('applyResult', 'applyResultText', message, 4000);
        setTimeout(() => { document.getElementById('applyForm').reset(); }, 4000);
    }

    // 手机号过滤
    function handlePhoneInput() {
        this.value = this.value.replace(/\D/g, '').slice(0, 11);
    }

    // 初始化图表
    function initCharts() {
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
                datasets: [
                    { label: '惠农贷', data: [120,135,155,140,170,185,195,210,225,240,255,270], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#22c55e' },
                    { label: '农机贷', data: [80,90,105,95,115,125,130,140,150,160,175,190], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.06)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#3b82f6' },
                    { label: '种植贷', data: [60,70,80,90,100,110,120,130,145,155,165,180], borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.06)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#f59e0b' },
                    { label: '养殖贷', data: [45,50,58,65,72,80,88,95,105,115,125,135], borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,0.06)', fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#f43f5e' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 24, font: { size: 12 } } } },
                scales: {
                    y: { beginAtZero: false, min: 30, grid: { color: '#f3f4f6' }, ticks: { callback: v => v + '万' } },
                    x: { grid: { display: false } }
                }
            }
        });

        const typeCtx = document.getElementById('typeChart').getContext('2d');
        new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: ['惠农贷', '农机贷', '种植贷', '养殖贷'],
                datasets: [{
                    data: [270, 190, 180, 135],
                    backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#f43f5e'],
                    borderColor: '#ffffff', borderWidth: 3, hoverBorderWidth: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 24, font: { size: 12 } } },
                    tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.raw + '万元 (' + Math.round(ctx.raw / 775 * 100) + '%)' } }
                },
                cutout: '55%'
            }
        });
    }

    // 暴露给 HTML 内联事件调用的接口
    window._loans = {
        selectProduct,
        filterProducts,
        doMatch,
        applyMatch,
        logout: function() { App.logout(); }
    };

    // 初始化
    document.addEventListener('DOMContentLoaded', () => {
        renderProducts();
        fillProductSelects();
        initCharts();
        App.updateNavLoginState();

        // 事件委托：产品筛选按钮
        document.getElementById('productFilters').addEventListener('click', (e) => {
            const btn = e.target.closest('.product-filter');
            if (!btn) return;
            filterProducts(btn.dataset.filter, btn);
        });

        // 表单事件
        document.getElementById('applyForm').addEventListener('submit', handleApplySubmit);
        document.getElementById('applyPhone').addEventListener('input', handlePhoneInput);
    });
})();
