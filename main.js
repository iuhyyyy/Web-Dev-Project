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

  /* ================================================
     FEATURE 1: Live search + filter on markets.html
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

    function parseMultiplier(button) {
      const match = button.textContent.match(/([0-9]+(?:\.[0-9]+)?)×/);
      return match ? Number(match[1]) : 1;
    }

    function formatCurrency(value) {
      return `KSh ${value.toFixed(2)}`;
    }

    function ensureBetSlip(card) {
      let slip = card.querySelector('.bet-slip');

      if (!slip) {
        slip = document.createElement('div');
        slip.className = 'bet-slip';
        slip.innerHTML = `
          <div class="bet-slip-header">
            <span>Stake calculator</span>
            <button type="button" class="btn btn-sm btn-outline-secondary bet-close" style="border-radius:999px; font-size:0.75rem; padding:0.2rem 0.65rem;">Close</button>
          </div>
          <label class="form-label" style="font-size:0.8rem; color:var(--clr-muted); margin-bottom:0.35rem;">Stake amount</label>
          <input type="number" min="1" step="1" class="bet-stake" placeholder="Enter amount" />
          <div class="bet-summary">
            <div><span>Potential payout:</span> <strong class="bet-payout">KSh 0.00</strong></div>
            <div><span>Potential profit:</span> <strong class="bet-profit">KSh 0.00</strong></div>
          </div>
          <div class="bet-note">Payout updates from the odds shown on the button you clicked.</div>
        `;
        card.appendChild(slip);

        slip.querySelector('.bet-close').addEventListener('click', () => {
          slip.remove();
          card.querySelectorAll('.odds-btn').forEach(btn => btn.classList.remove('active'));
        });
      }

      return slip;
    }

    document.querySelectorAll('.market-card').forEach(card => {
      const oddsButtons = card.querySelectorAll('.odds-btn');

      oddsButtons.forEach(button => {
        button.addEventListener('click', () => {
          const slip = ensureBetSlip(card);
          const stakeInput = slip.querySelector('.bet-stake');
          const payoutText = slip.querySelector('.bet-payout');
          const profitText = slip.querySelector('.bet-profit');
          const multiplier = parseMultiplier(button);

          oddsButtons.forEach(btn => btn.classList.remove('active'));
          button.classList.add('active');

          const updateTotals = () => {
            const stake = Number(stakeInput.value);
            if (!Number.isFinite(stake) || stake <= 0) {
              payoutText.textContent = 'KSh 0.00';
              profitText.textContent = 'KSh 0.00';
              return;
            }

            const payout = stake * multiplier;
            const profit = payout - stake;
            payoutText.textContent = formatCurrency(payout);
            profitText.textContent = formatCurrency(profit);
          };

          stakeInput.value = stakeInput.value || '100';
          stakeInput.oninput = updateTotals;
          updateTotals();
          stakeInput.focus();
          stakeInput.select();
        });
      });
    });
  }

  /* ================================================
     FEATURE 2: Contact form validation
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

    /* Clear errors on input */
    ['name', 'email', 'message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => clearError(id));
    });
  }

});
