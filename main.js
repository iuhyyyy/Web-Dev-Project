/* =============================================
   Predikt — main.js
   Feature 1: Live search + category filter (markets.html)
   Feature 2: Contact form validation (contact.html)
   Feature 3: Stake calculator on all market cards
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Navbar active link highlight ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link-custom').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  /* ================================================
     FEATURE 1: Live search + filter (markets.html)
     ================================================ */
  const searchInput = document.getElementById('market-search');
  const categoryBtns = document.querySelectorAll('.filter-btn');
  const marketCards = document.querySelectorAll('.market-card-wrapper');
  const noResults = document.getElementById('no-results');

  if (searchInput) {
    let activeCategory = 'all';

    function filterMarkets() {
      const query = searchInput.value.toLowerCase().trim();
      let visibleCount = 0;

      marketCards.forEach(wrapper => {
        const title = wrapper.querySelector('h3')?.textContent.toLowerCase() || '';
        const category = wrapper.dataset.category || '';
        const matchesSearch = title.includes(query);
        const matchesCategory = activeCategory === 'all' || category === activeCategory;

        if (matchesSearch && matchesCategory) {
          wrapper.style.display = '';
          visibleCount++;
        } else {
          wrapper.style.display = 'none';
        }
      });

      if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    }

    searchInput.addEventListener('input', filterMarkets);

    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.filter;
        filterMarkets();
      });
    });
  }

  /* ================================================
     FEATURE 3: Stake calculator on all market cards
     Runs on any page that has .market-card elements
     ================================================ */

  function getMultiplier(btn) {
    const match = btn.textContent.match(/([0-9]+(?:\.[0-9]+)?)\s*×/);
    return match ? parseFloat(match[1]) : 1;
  }

  function buildSlip(card) {
    // Don't add twice
    if (card.querySelector('.bet-slip')) return;

    const slip = document.createElement('div');
    slip.className = 'bet-slip';
    slip.style.cssText = `
      display: none;
      margin-top: 0.75rem;
      background: rgba(10,19,32,0.9);
      border: 1px solid rgba(148,163,184,0.16);
      border-radius: 12px;
      padding: 0.9rem;
    `;
    slip.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
        <span style="font-size:0.82rem; font-weight:700; color:#f8fafc;">Stake calculator</span>
        <button class="slip-close" style="background:transparent; border:none; color:#94a3b8; font-size:1rem; cursor:pointer; line-height:1;">✕</button>
      </div>
      <input
        type="number"
        class="slip-stake"
        min="1"
        step="1"
        placeholder="Enter amount (KSh)"
        style="width:100%; background:rgba(15,27,43,0.9); border:1px solid rgba(148,163,184,0.16); border-radius:8px; color:#f8fafc; padding:0.5rem 0.75rem; font-size:0.9rem; outline:none; margin-bottom:0.6rem;"
      />
      <div style="font-size:0.85rem; color:#94a3b8; display:flex; flex-direction:column; gap:0.25rem;">
        <div>Potential payout: <strong class="slip-payout" style="color:#4ade80;">KSh 0.00</strong></div>
        <div>Potential profit: <strong class="slip-profit" style="color:#4ade80;">KSh 0.00</strong></div>
      </div>
    `;
    card.appendChild(slip);

    // Close button
    slip.querySelector('.slip-close').addEventListener('click', () => {
      slip.style.display = 'none';
      card.querySelectorAll('.odds-btn').forEach(b => b.classList.remove('active'));
    });
  }

  // Init calculator on every market card on this page
  document.querySelectorAll('.market-card').forEach(card => {
    buildSlip(card);

    card.querySelectorAll('.odds-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const slip = card.querySelector('.bet-slip');
        if (!slip) return;

        // Toggle: clicking same active button closes the slip
        const alreadyActive = btn.classList.contains('active');
        card.querySelectorAll('.odds-btn').forEach(b => b.classList.remove('active'));

        if (alreadyActive) {
          slip.style.display = 'none';
          return;
        }

        btn.classList.add('active');
        slip.style.display = 'block';

        const multiplier = getMultiplier(btn);
        const stakeInput = slip.querySelector('.slip-stake');
        const payoutEl = slip.querySelector('.slip-payout');
        const profitEl = slip.querySelector('.slip-profit');

        function calculate() {
          const stake = parseFloat(stakeInput.value);
          if (!stake || stake <= 0) {
            payoutEl.textContent = 'KSh 0.00';
            profitEl.textContent = 'KSh 0.00';
            return;
          }
          const payout = stake * multiplier;
          const profit = payout - stake;
          payoutEl.textContent = `KSh ${payout.toFixed(2)}`;
          profitEl.textContent = `KSh ${profit.toFixed(2)}`;
        }

        stakeInput.addEventListener('input', calculate);

        // If user already had a stake typed, recalculate for new odds
        calculate();
        stakeInput.focus();
      });
    });
  });

  /* ================================================
     FEATURE 2: Contact form validation (contact.html)
     ================================================ */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    function showError(fieldId, msg) {
      const el = document.getElementById(fieldId + '-error');
      if (el) { el.textContent = msg; el.classList.add('show'); }
      const input = document.getElementById(fieldId);
      if (input) input.style.borderColor = 'var(--clr-no)';
    }

    function clearError(fieldId) {
      const el = document.getElementById(fieldId + '-error');
      if (el) el.classList.remove('show');
      const input = document.getElementById(fieldId);
      if (input) input.style.borderColor = '';
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');

      clearError('name'); clearError('email'); clearError('message');

      if (!name.value.trim()) {
        showError('name', 'Please enter your name.');
        valid = false;
      } else if (name.value.trim().length < 2) {
        showError('name', 'Name must be at least 2 characters.');
        valid = false;
      }

      if (!email.value.trim()) {
        showError('email', 'Please enter your email address.');
        valid = false;
      } else if (!validateEmail(email.value.trim())) {
        showError('email', 'Please enter a valid email address.');
        valid = false;
      }

      if (!message.value.trim()) {
        showError('message', 'Please write a message.');
        valid = false;
      } else if (message.value.trim().length < 10) {
        showError('message', 'Message must be at least 10 characters.');
        valid = false;
      }

      if (valid) {
        const successMsg = document.getElementById('form-success');
        if (successMsg) successMsg.style.display = 'block';
        contactForm.reset();
        setTimeout(() => { if (successMsg) successMsg.style.display = 'none'; }, 5000);
      }
    });

    ['name', 'email', 'message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => clearError(id));
    });
  }

});