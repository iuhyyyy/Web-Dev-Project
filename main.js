/* =============================================
   Predikt — main.js
   Feature 1: Live search + category filter (markets.html)
   Feature 2: Contact form validation (contact.html)
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar active link highlight ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link-custom').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

});
