(function () {
    'use strict';

    /* ---- 轮播图 ---- */
    let currentSlide = 0;
    const slides = document.querySelectorAll('.news-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const totalSlides = slides.length;

    function updateSlides() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            slide.style.opacity = '0';
            slide.style.transform = 'translateX(100%)';
            slide.style.position = 'absolute';

            if (index === currentSlide) {
                slide.classList.add('active');
                slide.style.opacity = '1';
                slide.style.transform = 'translateX(0)';
                slide.style.position = 'relative';
            } else if (index === (currentSlide - 1 + totalSlides) % totalSlides) {
                slide.classList.add('prev');
                slide.style.transform = 'translateX(-100%)';
            } else {
                slide.classList.add('next');
            }
        });

        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.remove('w-2', 'bg-gray-300');
                dot.classList.add('w-8', 'bg-agri-500');
            } else {
                dot.classList.remove('w-8', 'bg-agri-500');
                dot.classList.add('w-2', 'bg-gray-300');
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSlides();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSlides();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateSlides();
    }

    // 轮播事件委托
    const carouselDots = document.getElementById('carouselDots');
    if (carouselDots) {
        carouselDots.addEventListener('click', (e) => {
            const dot = e.target.closest('.carousel-dot');
            if (dot) goToSlide(Number(dot.dataset.index));
        });
    }

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // 自动轮播
    setInterval(nextSlide, 6000);

    /* ---- FAQ 折叠 ---- */
    const faqList = document.getElementById('faqList');
    if (faqList) {
        faqList.addEventListener('click', (e) => {
            const btn = e.target.closest('.faq-btn');
            if (!btn) return;

            const content = btn.nextElementSibling;
            const arrow = btn.querySelector('svg');
            const isOpen = content.classList.contains('open');

            // 关闭所有
            document.querySelectorAll('.faq-content').forEach((c) => {
                c.classList.remove('open');
                c.style.maxHeight = '0';
                c.style.paddingBottom = '0';
                const siblingBtn = c.previousElementSibling;
                const siblingArrow = siblingBtn.querySelector('svg');
                siblingArrow.style.transform = 'rotate(0deg)';
                siblingBtn.parentElement.classList.remove('bg-earth-50');
                siblingBtn.parentElement.classList.add('bg-white');
            });

            // 打开当前
            if (!isOpen) {
                content.classList.add('open');
                content.style.maxHeight = '500px';
                content.style.paddingBottom = '20px';
                arrow.style.transform = 'rotate(180deg)';
                btn.parentElement.classList.remove('bg-white');
                btn.parentElement.classList.add('bg-earth-50');
            }
        });
    }

    /* ---- 贷款计算器 ---- */
    const calcAmount = document.getElementById('calcAmount');
    const calcTerm = document.getElementById('calcTerm');
    const calcRate = document.getElementById('calcRate');
    const rangeAmount = document.getElementById('rangeAmount');

    function calculateLoan() {
        const amount = parseFloat(calcAmount.value) * 10000 || 0;
        const term = parseInt(calcTerm.value) || 12;
        const rate = parseFloat(calcRate.value) || 4.35;

        const monthlyRate = rate / 100 / 12;
        const denominator = Math.pow(1 + monthlyRate, term) - 1;
        const monthlyPayment = denominator > 0
            ? amount * monthlyRate * Math.pow(1 + monthlyRate, term) / denominator
            : 0;
        const totalPayment = monthlyPayment * term;
        const totalInterest = totalPayment - amount;

        const fmt = (n) => '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        document.getElementById('resultMonthly').textContent = fmt(monthlyPayment);
        document.getElementById('resultInterest').textContent = fmt(totalInterest);
        document.getElementById('resultTotal').textContent = fmt(totalPayment);
        document.getElementById('displayPrincipal').textContent = fmt(amount);
        document.getElementById('displayTerm').textContent = term + ' 期';

        const principalPercent = amount > 0 ? ((amount / totalPayment) * 100).toFixed(1) : '0.0';
        const interestPercent = totalPayment > 0 ? ((totalInterest / totalPayment) * 100).toFixed(1) : '0.0';
        document.getElementById('principalPercent').textContent = principalPercent + '%';
        document.getElementById('interestPercent').textContent = interestPercent + '%';
    }

    // 计算器输入事件
    [calcAmount, calcTerm, calcRate].forEach((input) => {
        if (input) input.addEventListener('input', calculateLoan);
    });

    if (rangeAmount) {
        rangeAmount.addEventListener('input', () => {
            calcAmount.value = rangeAmount.value;
            calculateLoan();
        });
    }

    // 期限按钮事件委托
    const termBtns = document.getElementById('termBtns');
    if (termBtns) {
        termBtns.addEventListener('click', (e) => {
            const btn = e.target.closest('.term-btn');
            if (!btn) return;
            const months = Number(btn.dataset.term);
            calcTerm.value = months;
            termBtns.querySelectorAll('.term-btn').forEach((b) => {
                b.classList.remove('border-agri-400', 'bg-agri-50', 'text-agri-700', 'font-medium');
                b.classList.add('border-gray-200', 'bg-white', 'text-gray-600');
            });
            btn.classList.remove('border-gray-200', 'bg-white', 'text-gray-600');
            btn.classList.add('border-agri-400', 'bg-agri-50', 'text-agri-700', 'font-medium');
            calculateLoan();
        });
    }

    // 利率按钮事件委托
    const rateBtns = document.getElementById('rateBtns');
    if (rateBtns) {
        rateBtns.addEventListener('click', (e) => {
            const btn = e.target.closest('.rate-btn');
            if (!btn) return;
            const rate = Number(btn.dataset.rate);
            calcRate.value = rate;
            rateBtns.querySelectorAll('.rate-btn').forEach((b) => {
                b.classList.remove('border-fin-400', 'bg-fin-50', 'text-fin-700', 'font-medium');
                b.classList.add('border-gray-200', 'bg-white', 'text-gray-600');
            });
            btn.classList.remove('border-gray-200', 'bg-white', 'text-gray-600');
            btn.classList.add('border-fin-400', 'bg-fin-50', 'text-fin-700', 'font-medium');
            calculateLoan();
        });
    }

    // 初始化计算
    calculateLoan();

    /* ---- 登录状态 ---- */
    function getLoggedInUser() {
        try {
            const s = localStorage.getItem('agriCreditLoggedInUser') || sessionStorage.getItem('agriCreditLoggedInUser');
            return s ? JSON.parse(s) : null;
        } catch (e) {
            return null;
        }
    }

    function updateNavLoginState() {
        const user = getLoggedInUser();
        const notLoggedIn = document.getElementById('notLoggedIn');
        const loggedIn = document.getElementById('loggedIn');
        const navAvatar = document.getElementById('navAvatar');
        const navUsername = document.getElementById('navUsername');

        if (user) {
            notLoggedIn.classList.add('hidden');
            loggedIn.classList.remove('hidden');
            loggedIn.classList.add('flex');
            navAvatar.textContent = (user.username || 'U').charAt(0).toUpperCase();
            navUsername.textContent = user.username || '用户';
        } else {
            notLoggedIn.classList.remove('hidden');
            loggedIn.classList.add('hidden');
            loggedIn.classList.remove('flex');
        }
    }

    function logout() {
        try {
            localStorage.removeItem('agriCreditLoggedInUser');
            sessionStorage.removeItem('agriCreditLoggedInUser');
        } catch (e) {
            // 静默处理存储异常
        }
        updateNavLoginState();
        alert('已安全退出');
        window.location.href = 'auth.html';
    }

    // 注册按钮：设置注册标记
    const registerLink = document.getElementById('registerLink');
    if (registerLink) {
        registerLink.addEventListener('click', () => {
            try {
                localStorage.setItem('goRegister', 'true');
            } catch (e) {
                // 静默处理存储异常
            }
        });
    }

    // 退出按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // 页面加载时检测登录状态
    document.addEventListener('DOMContentLoaded', updateNavLoginState);
})();
