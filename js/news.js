// 分类筛选逻辑
function filterNews(category) {
    var cards = document.querySelectorAll('.news-card[data-category]');
    var buttons = document.querySelectorAll('.filter-btn');

    // 更新按钮状态
    buttons.forEach(function(btn) {
        btn.classList.remove('active', 'bg-agri-600', 'text-white');
        btn.classList.add('bg-white', 'text-gray-600');
    });
    event.target.classList.add('active');
    event.target.classList.remove('bg-white', 'text-gray-600');
    event.target.classList.add('bg-agri-600', 'text-white');

    // 筛选卡片
    cards.forEach(function(card) {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.5s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
}

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
    alert('已安全退出');
    window.location.href = 'auth.html';
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    var cards = document.querySelectorAll('.news-card[data-category]');
    cards.forEach(function(card) {
        card.style.display = 'block';
    });
    updateNavLoginState();
});
