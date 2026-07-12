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

    function logout() {
        App.logout();
    }

    window.filterNews = filterNews;
    window.logout = logout;

    document.addEventListener('DOMContentLoaded', function() {
        App.updateNavLoginState();
    });
})();
