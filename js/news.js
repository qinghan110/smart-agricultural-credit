(function() {
    'use strict';

    function filterNews(category) {
        const cards = document.querySelectorAll('.news-card[data-category]');
        const buttons = document.querySelectorAll('.filter-btn');

        buttons.forEach((btn) => {
            btn.classList.remove('active', 'bg-agri-600', 'text-white');
            btn.classList.add('bg-white', 'text-gray-600');
        });

        const target = event.target;
        target.classList.add('active');
        target.classList.remove('bg-white', 'text-gray-600');
        target.classList.add('bg-agri-600', 'text-white');

        cards.forEach((card) => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease-out';
            } else {
                card.style.display = 'none';
            }
        });
    }

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
        alert('已安全退出');
        window.location.href = 'auth.html';
    }

    window.filterNews = filterNews;
    window.logout = logout;

    document.addEventListener('DOMContentLoaded', updateNavLoginState);
})();
