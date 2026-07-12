// 轮播图逻辑
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

// 自动轮播
setInterval(nextSlide, 6000);

// FAQ 折叠逻辑
function toggleFaq(button) {
    const content = button.nextElementSibling;
    const arrow = button.querySelector('svg');
    const isOpen = content.classList.contains('open');

    // 关闭所有
    document.querySelectorAll('.faq-content').forEach(c => {
        c.classList.remove('open');
        c.style.maxHeight = '0';
        c.style.paddingBottom = '0';
    });
    document.querySelectorAll('.faq-content').forEach(c => {
        const btn = c.previousElementSibling;
        const arr = btn.querySelector('svg');
        arr.style.transform = 'rotate(0deg)';
        btn.parentElement.classList.remove('bg-earth-50');
        btn.parentElement.classList.add('bg-white');
    });

    // 打开当前
    if (!isOpen) {
        content.classList.add('open');
        content.style.maxHeight = '500px';
        content.style.paddingBottom = '20px';
        arrow.style.transform = 'rotate(180deg)';
        button.parentElement.classList.remove('bg-white');
        button.parentElement.classList.add('bg-earth-50');
    }
}

// 贷款计算器逻辑
function calculateLoan() {
    const amount = parseFloat(document.getElementById('calcAmount').value) * 10000 || 0;
    const term = parseInt(document.getElementById('calcTerm').value) || 12;
    const rate = parseFloat(document.getElementById('calcRate').value) || 4.35;

    const monthlyRate = rate / 100 / 12;
    const monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, term) / (Math.pow(1 + monthlyRate, term) - 1);
    const totalPayment = monthlyPayment * term;
    const totalInterest = totalPayment - amount;

    document.getElementById('resultMonthly').textContent = '¥' + monthlyPayment.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('resultInterest').textContent = '¥' + totalInterest.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('resultTotal').textContent = '¥' + totalPayment.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('displayPrincipal').textContent = '¥' + amount.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('displayTerm').textContent = term + ' 期';

    const principalPercent = ((amount / totalPayment) * 100).toFixed(1);
    const interestPercent = ((totalInterest / totalPayment) * 100).toFixed(1);
    document.getElementById('principalPercent').textContent = principalPercent + '%';
    document.getElementById('interestPercent').textContent = interestPercent + '%';
}

function syncAmount(val) {
    document.getElementById('calcAmount').value = val;
    calculateLoan();
}

function setTerm(months) {
    document.getElementById('calcTerm').value = months;
    // 更新按钮样式
    document.querySelectorAll('.term-btn').forEach(btn => {
        btn.classList.remove('border-agri-400', 'bg-agri-50', 'text-agri-700', 'font-medium');
        btn.classList.add('border-gray-200', 'bg-white', 'text-gray-600');
    });
    event.target.classList.remove('border-gray-200', 'bg-white', 'text-gray-600');
    event.target.classList.add('border-agri-400', 'bg-agri-50', 'text-agri-700', 'font-medium');
    calculateLoan();
}

function setRate(rate) {
    document.getElementById('calcRate').value = rate;
    // 更新按钮样式
    document.querySelectorAll('.rate-btn').forEach(btn => {
        btn.classList.remove('border-fin-400', 'bg-fin-50', 'text-fin-700', 'font-medium');
        btn.classList.add('border-gray-200', 'bg-white', 'text-gray-600');
    });
    event.target.classList.remove('border-gray-200', 'bg-white', 'text-gray-600');
    event.target.classList.add('border-fin-400', 'bg-fin-50', 'text-fin-700', 'font-medium');
    calculateLoan();
}

// 初始化计算
calculateLoan();

// 登录状态检测
function getLoggedInUser() {
    try {
        var s = localStorage.getItem('agriCreditLoggedInUser') || sessionStorage.getItem('agriCreditLoggedInUser');
        return s ? JSON.parse(s) : null;
    } catch(e) { return null; }
}

function updateNavLoginState() {
    var user = getLoggedInUser();
    var notLoggedIn = document.getElementById('notLoggedIn');
    var loggedIn = document.getElementById('loggedIn');
    var navAvatar = document.getElementById('navAvatar');
    var navUsername = document.getElementById('navUsername');

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
    localStorage.removeItem('agriCreditLoggedInUser');
    sessionStorage.removeItem('agriCreditLoggedInUser');
    updateNavLoginState();
    alert('已安全退出');
    window.location.href = 'auth.html';
}

// 页面加载时检测登录状态
document.addEventListener('DOMContentLoaded', updateNavLoginState);
