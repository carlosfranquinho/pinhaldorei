// Mobile menu toggle
const toggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (toggle && mobileMenu) {
  toggle.addEventListener('click', () => {
    const hidden = mobileMenu.hasAttribute('hidden');
    mobileMenu.toggleAttribute('hidden', !hidden);
  });
}

// Scroll to top
const scrollBtn = document.getElementById('scroll-top');
if (scrollBtn) {
  window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('visible', window.scrollY > 400);
  });
  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
