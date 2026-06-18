 /* ============================================================
   GOLDEN CRUST BAKERY — in.js
   Cart system + card payment modal
   Works with the existing product.html without changing HTML.
   Uses the same CSS variables from index.css.
   ============================================================ */

(function () {
  "use strict";

  /* ── product data (mirrors the HTML cards) ── */
  const PRODUCTS = [
    { id: "brown",   name: "Brown Bread",        price: 25 },
    { id: "white",   name: "White Bread",         price: 28 },
    { id: "sour",    name: "Sourdough Bread",     price: 45 },
    { id: "gluten",  name: "Gluten-Free Seed Loaf", price: 55 },
    { id: "rye",     name: "Low-GI Rye",          price: 38 },
    { id: "brioche", name: "Vegan Brioche",        price: 40 },
  ];

  let cart = []; /* [{ id, name, price, qty }] */

  /* ─────────────────────────────────────────
     INJECT CSS  (uses existing CSS variables)
  ───────────────────────────────────────── */
  const style = document.createElement("style");
  style.textContent = `
    /* ── cart badge button ── */
    #gcb-cart-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 500;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: var(--gold);
      border: none;
      box-shadow: 0 4px 18px rgba(139,106,30,0.45);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.25s, transform 0.2s;
      padding: 0;
    }
    #gcb-cart-btn:hover { background: var(--gold-dark); transform: translateY(-3px); }
    #gcb-cart-btn svg { width: 26px; height: 26px; fill: #fff; }
    #gcb-cart-count {
      position: absolute;
      top: -4px; right: -4px;
      min-width: 20px; height: 20px;
      background: var(--brown-dark);
      color: var(--cream);
      font-size: 11px; font-weight: 700;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 5px;
      border: 2px solid var(--cream);
      opacity: 0;
      transform: scale(0.7);
      transition: opacity 0.2s, transform 0.2s;
    }
    #gcb-cart-count.visible { opacity: 1; transform: scale(1); }

    /* ── cart panel ── */
    #gcb-cart-panel {
      position: fixed;
      top: 0; right: -420px;
      width: min(420px, 100vw);
      height: 100%;
      background: var(--cream);
      border-left: 3px solid var(--gold);
      box-shadow: -6px 0 32px rgba(28,18,9,0.25);
      z-index: 600;
      display: flex; flex-direction: column;
      transition: right 0.35s cubic-bezier(0.4,0,0.2,1);
      font-family: var(--font-body);
    }
    #gcb-cart-panel.open { right: 0; }
    .gcb-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 22px;
      background: var(--charcoal);
      border-bottom: 3px solid var(--gold);
    }
    .gcb-panel-header h2 {
      font-family: var(--font-heading);
      color: var(--cream); font-size: 1.2rem; margin: 0;
      border: none; background: none; padding: 0;
    }
    #gcb-panel-close {
      background: none; border: none; color: var(--cream);
      font-size: 1.7rem; cursor: pointer; line-height: 1;
      padding: 0 4px;
      transition: color 0.2s;
      box-shadow: none;
    }
    #gcb-panel-close:hover { color: var(--gold-light); transform: none; }
    #gcb-cart-items {
      flex: 1; overflow-y: auto; padding: 16px 20px;
    }
    .gcb-cart-empty {
      text-align: center; padding: 48px 0;
      color: var(--beige-mid); font-style: italic; font-size: 0.95rem;
    }
    .gcb-cart-row {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid var(--beige);
    }
    .gcb-cart-row:last-child { border-bottom: none; }
    .gcb-cart-name {
      flex: 1; font-size: 0.92rem; color: var(--brown-dark); font-weight: 600;
    }
    .gcb-cart-price {
      font-size: 0.9rem; color: var(--gold-dark); font-weight: 700; min-width: 46px; text-align: right;
    }
    .gcb-qty-wrap {
      display: flex; align-items: center; gap: 4px;
    }
    .gcb-qty-btn {
      width: 26px; height: 26px; border-radius: 50%;
      background: var(--cream-deep); border: 1px solid var(--beige);
      color: var(--brown-dark); font-size: 1rem; font-weight: 700;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      padding: 0; transition: background 0.2s; box-shadow: none;
    }
    .gcb-qty-btn:hover { background: var(--beige); transform: none; }
    .gcb-qty-num {
      min-width: 22px; text-align: center; font-size: 0.88rem;
      font-weight: 700; color: var(--charcoal-mid);
    }
    .gcb-remove-btn {
      background: none; border: none; color: var(--beige-mid);
      font-size: 1.2rem; cursor: pointer; padding: 0 2px; line-height: 1;
      box-shadow: none; transition: color 0.2s;
    }
    .gcb-remove-btn:hover { color: #c0392b; transform: none; background: none; }
    .gcb-panel-footer {
      padding: 18px 22px;
      border-top: 1px solid var(--beige);
      background: var(--cream-deep);
    }
    .gcb-total-row {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 14px;
    }
    .gcb-total-label { font-family: var(--font-heading); font-size: 1.05rem; color: var(--brown-dark); }
    .gcb-total-amount { font-size: 1.3rem; font-weight: 900; color: var(--gold-dark); }
    #gcb-checkout-btn {
      width: 100%; padding: 14px;
      background: var(--gold); border: none; border-radius: 6px;
      color: #fff; font-family: var(--font-body);
      font-size: 0.85rem; font-weight: 700;
      letter-spacing: 0.12em; text-transform: uppercase;
      cursor: pointer;
      transition: background 0.25s, transform 0.2s;
      box-shadow: 0 3px 12px rgba(139,106,30,0.35);
    }
    #gcb-checkout-btn:hover { background: var(--gold-dark); transform: translateY(-2px); }
    #gcb-checkout-btn:disabled { background: var(--beige); cursor: not-allowed; transform: none; }

    /* ── backdrop ── */
    #gcb-backdrop {
      display: none; position: fixed; inset: 0;
      background: rgba(28,18,9,0.55);
      z-index: 590;
      backdrop-filter: blur(2px);
    }
    #gcb-backdrop.visible { display: block; }

    /* ── payment modal ── */
    #gcb-payment-modal {
      display: none; position: fixed; inset: 0;
      z-index: 700;
      align-items: center; justify-content: center;
      background: rgba(28,18,9,0.72);
      backdrop-filter: blur(3px);
    }
    #gcb-payment-modal.open { display: flex; }
    .gcb-modal-box {
      background: var(--cream);
      border: 1px solid var(--gold);
      border-radius: 12px;
      width: min(460px, 94vw);
      padding: 32px 28px 28px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.45);
      position: relative;
      font-family: var(--font-body);
    }
    .gcb-modal-logo {
      font-family: var(--font-heading);
      font-size: 1.4rem; color: var(--brown-dark);
      text-align: center; margin-bottom: 4px; font-weight: 700;
    }
    .gcb-modal-sub {
      text-align: center; font-size: 0.82rem;
      color: var(--brown-light); margin-bottom: 22px;
      letter-spacing: 0.04em;
    }
    #gcb-modal-close {
      position: absolute; top: 14px; right: 16px;
      background: none; border: none; font-size: 1.5rem;
      color: var(--beige-mid); cursor: pointer; line-height: 1;
      padding: 0; box-shadow: none; transition: color 0.2s;
    }
    #gcb-modal-close:hover { color: var(--brown); transform: none; }
    .gcb-field-group { margin-bottom: 16px; }
    .gcb-field-group label {
      display: block; font-size: 0.78rem; font-weight: 700;
      letter-spacing: 0.07em; text-transform: uppercase;
      color: var(--brown); margin-bottom: 6px;
    }
    .gcb-field-group input {
      width: 100%; padding: 11px 14px;
      border: 1px solid var(--beige);
      border-radius: 6px;
      background: var(--white);
      font-family: var(--font-body); font-size: 0.95rem;
      color: var(--charcoal-mid);
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .gcb-field-group input:focus {
      border-color: var(--gold);
      box-shadow: 0 0 0 3px rgba(196,154,60,0.18);
    }
    .gcb-field-group input.gcb-error {
      border-color: #c0392b;
      box-shadow: 0 0 0 3px rgba(192,57,43,0.15);
    }
    .gcb-field-error {
      font-size: 0.76rem; color: #c0392b; margin-top: 4px; display: none;
    }
    .gcb-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .gcb-card-icons {
      display: flex; gap: 8px; margin-bottom: 18px;
      justify-content: center;
    }
    .gcb-card-icons span {
      padding: 4px 10px; border-radius: 4px;
      border: 1px solid var(--beige);
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.05em;
      color: var(--brown); background: var(--cream-deep);
    }
    .gcb-modal-total {
      background: linear-gradient(135deg, var(--cream-deep), var(--beige));
      border: 1px solid var(--beige);
      border-radius: 8px;
      padding: 12px 16px;
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px;
    }
    .gcb-modal-total span { font-size: 0.85rem; color: var(--brown); }
    .gcb-modal-total strong { font-size: 1.25rem; color: var(--gold-dark); font-weight: 900; }
    #gcb-pay-btn {
      width: 100%; padding: 15px;
      background: var(--gold); border: none; border-radius: 8px;
      color: #fff; font-family: var(--font-body);
      font-size: 0.88rem; font-weight: 700;
      letter-spacing: 0.13em; text-transform: uppercase;
      cursor: pointer; box-shadow: 0 4px 14px rgba(139,106,30,0.4);
      transition: background 0.25s, transform 0.2s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    #gcb-pay-btn:hover:not(:disabled) { background: var(--gold-dark); transform: translateY(-2px); }
    #gcb-pay-btn:disabled { background: var(--beige); cursor: not-allowed; transform: none; }
    .gcb-lock-icon { font-size: 0.9rem; }
    .gcb-secure-note {
      text-align: center; font-size: 0.72rem; color: var(--beige-mid);
      margin-top: 12px; letter-spacing: 0.03em;
    }

    /* ── success screen ── */
    #gcb-success-screen {
      display: none; text-align: center; padding: 8px 0;
    }
    #gcb-success-screen .gcb-tick {
      font-size: 3.2rem; display: block; margin-bottom: 10px;
    }
    #gcb-success-screen h3 {
      font-family: var(--font-heading); color: var(--brown-dark);
      font-size: 1.4rem; margin-bottom: 8px;
      border: none; background: none; padding: 0;
    }
    #gcb-success-screen p {
      color: var(--brown-light); font-size: 0.9rem; margin-bottom: 20px;
    }
    #gcb-success-done {
      padding: 12px 36px; background: var(--gold); border: none;
      border-radius: 6px; color: #fff; font-family: var(--font-body);
      font-size: 0.82rem; font-weight: 700; letter-spacing: 0.1em;
      text-transform: uppercase; cursor: pointer;
      transition: background 0.25s;
    }
    #gcb-success-done:hover { background: var(--gold-dark); }

    /* ── toast ── */
    #gcb-toast {
      position: fixed; bottom: 100px; right: 24px; z-index: 800;
      background: var(--brown-dark); color: var(--cream);
      padding: 11px 20px; border-radius: 8px;
      font-family: var(--font-body); font-size: 0.85rem;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      transform: translateY(20px); opacity: 0;
      transition: opacity 0.3s, transform 0.3s;
      pointer-events: none; border-left: 3px solid var(--gold);
    }
    #gcb-toast.show { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(style);

  /* ─────────────────────────────────────────
     BUILD DOM
  ───────────────────────────────────────── */
  document.body.insertAdjacentHTML("beforeend", `
    <!-- floating cart button -->
    <button id="gcb-cart-btn" aria-label="Open cart">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
      </svg>
      <span id="gcb-cart-count">0</span>
    </button>

    <!-- cart panel -->
    <aside id="gcb-cart-panel" role="dialog" aria-label="Shopping cart">
      <div class="gcb-panel-header">
        <h2>🛒 Your Order</h2>
        <button id="gcb-panel-close" aria-label="Close cart">&times;</button>
      </div>
      <div id="gcb-cart-items">
        <p class="gcb-cart-empty">Your cart is empty.</p>
      </div>
      <div class="gcb-panel-footer">
        <div class="gcb-total-row">
          <span class="gcb-total-label">Total</span>
          <span class="gcb-total-amount" id="gcb-total">R0</span>
        </div>
        <button id="gcb-checkout-btn" disabled>Proceed to Payment</button>
      </div>
    </aside>

    <!-- backdrop -->
    <div id="gcb-backdrop"></div>

    <!-- payment modal -->
    <div id="gcb-payment-modal" role="dialog" aria-modal="true" aria-label="Secure payment">
      <div class="gcb-modal-box">
        <button id="gcb-modal-close" aria-label="Close payment">&times;</button>

        <!-- payment form -->
        <div id="gcb-pay-form-wrap">
          <div class="gcb-modal-logo">🍞 Golden Crust Bakery</div>
          <div class="gcb-modal-sub">Secure card payment</div>

          <div class="gcb-card-icons">
            <span>VISA</span><span>MASTERCARD</span><span>AMEX</span>
          </div>

          <div class="gcb-modal-total">
            <span>Order total</span>
            <strong id="gcb-modal-total-amount">R0</strong>
          </div>

          <div class="gcb-field-group">
            <label for="gcb-name">Cardholder name</label>
            <input type="text" id="gcb-name" placeholder="Full name on card" maxlength="60" autocomplete="cc-name">
            <div class="gcb-field-error" id="gcb-name-err">Please enter the cardholder name.</div>
          </div>

          <div class="gcb-field-group">
            <label for="gcb-number">Card number</label>
            <input type="text" id="gcb-number" placeholder="•••• •••• •••• ••••" maxlength="19" inputmode="numeric" autocomplete="cc-number">
            <div class="gcb-field-error" id="gcb-number-err">Enter a valid 16-digit card number.</div>
          </div>

          <div class="gcb-row-2">
            <div class="gcb-field-group">
              <label for="gcb-expiry">Expiry</label>
              <input type="text" id="gcb-expiry" placeholder="MM / YY" maxlength="7" inputmode="numeric" autocomplete="cc-exp">
              <div class="gcb-field-error" id="gcb-expiry-err">Use MM / YY format.</div>
            </div>
            <div class="gcb-field-group">
              <label for="gcb-cvv">CVV</label>
              <input type="password" id="gcb-cvv" placeholder="•••" maxlength="4" inputmode="numeric" autocomplete="cc-csc">
              <div class="gcb-field-error" id="gcb-cvv-err">Enter 3 or 4 digit CVV.</div>
            </div>
          </div>

          <button id="gcb-pay-btn">
            <span class="gcb-lock-icon">🔒</span> Pay Now
          </button>
          <p class="gcb-secure-note">Your payment details are encrypted and secure.</p>
        </div>

        <!-- success screen -->
        <div id="gcb-success-screen">
          <span class="gcb-tick">✅</span>
          <h3>Payment Successful!</h3>
          <p>Thank you for your order.<br>Your fresh bread will be ready for pickup tomorrow.</p>
          <button id="gcb-success-done">Done</button>
        </div>
      </div>
    </div>

    <!-- toast notification -->
    <div id="gcb-toast" aria-live="polite"></div>
  `);

  /* ─────────────────────────────────────────
     ELEMENT REFERENCES
  ───────────────────────────────────────── */
  const cartBtn       = document.getElementById("gcb-cart-btn");
  const cartCount     = document.getElementById("gcb-cart-count");
  const cartPanel     = document.getElementById("gcb-cart-panel");
  const panelClose    = document.getElementById("gcb-panel-close");
  const cartItems     = document.getElementById("gcb-cart-items");
  const totalEl       = document.getElementById("gcb-total");
  const checkoutBtn   = document.getElementById("gcb-checkout-btn");
  const backdrop      = document.getElementById("gcb-backdrop");
  const payModal      = document.getElementById("gcb-payment-modal");
  const modalClose    = document.getElementById("gcb-modal-close");
  const modalTotal    = document.getElementById("gcb-modal-total-amount");
  const payFormWrap   = document.getElementById("gcb-pay-form-wrap");
  const successScreen = document.getElementById("gcb-success-screen");
  const payBtn        = document.getElementById("gcb-pay-btn");
  const successDone   = document.getElementById("gcb-success-done");
  const toastEl       = document.getElementById("gcb-toast");

  const nameInput     = document.getElementById("gcb-name");
  const numInput      = document.getElementById("gcb-number");
  const expInput      = document.getElementById("gcb-expiry");
  const cvvInput      = document.getElementById("gcb-cvv");

  /* ─────────────────────────────────────────
     CART LOGIC
  ───────────────────────────────────────── */
  function getProductFromCard(btn) {
    const card = btn.closest(".product-card");
    if (!card) return null;
    const headingEl = card.querySelector("h1,h2,h3,h4,h5,h6,h7");
    const priceEl   = card.querySelector(".price");
    if (!headingEl || !priceEl) return null;
    const name  = headingEl.textContent.trim();
    const price = parseFloat(priceEl.textContent.replace(/[^\d.]/g, ""));
    const id    = name.toLowerCase().replace(/\s+/g, "-");
    return { id, name, price };
  }

  function addToCart(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    renderCart();
    showToast(`${product.name} added to your order`);
    /* pulse the cart button */
    cartBtn.style.transform = "scale(1.25)";
    setTimeout(() => { cartBtn.style.transform = ""; }, 280);
  }

  function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    renderCart();
  }

  function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
  }

  function cartTotal() {
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function renderCart() {
    const total = cartTotal();
    const count = cart.reduce((s, i) => s + i.qty, 0);

    /* badge */
    cartCount.textContent = count;
    cartCount.classList.toggle("visible", count > 0);

    /* items */
    if (!cart.length) {
      cartItems.innerHTML = `<p class="gcb-cart-empty">Your cart is empty.</p>`;
    } else {
      cartItems.innerHTML = cart.map(item => `
        <div class="gcb-cart-row" data-id="${item.id}">
          <span class="gcb-cart-name">${item.name}</span>
          <div class="gcb-qty-wrap">
            <button class="gcb-qty-btn" data-action="dec" data-id="${item.id}" aria-label="Remove one">−</button>
            <span class="gcb-qty-num">${item.qty}</span>
            <button class="gcb-qty-btn" data-action="inc" data-id="${item.id}" aria-label="Add one">+</button>
          </div>
          <span class="gcb-cart-price">R${(item.price * item.qty).toFixed(2)}</span>
          <button class="gcb-remove-btn" data-remove="${item.id}" aria-label="Remove ${item.name}">✕</button>
        </div>
      `).join("");
    }

    totalEl.textContent = `R${total.toFixed(2)}`;
    checkoutBtn.disabled = !cart.length;
  }

  /* delegate qty + remove clicks inside the panel */
  cartItems.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action],[data-remove]");
    if (!btn) return;
    if (btn.dataset.action === "inc") updateQty(btn.dataset.id, 1);
    if (btn.dataset.action === "dec") updateQty(btn.dataset.id, -1);
    if (btn.dataset.remove) removeItem(btn.dataset.remove);
  });

  /* ─────────────────────────────────────────
     WIRE "BUY NOW" BUTTONS
  ───────────────────────────────────────── */
  $$(".product-card button").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = getProductFromCard(btn);
      if (product) addToCart(product);
    });
  });

  function $$(sel) { return Array.from(document.querySelectorAll(sel)); }

  /* ─────────────────────────────────────────
     PANEL OPEN / CLOSE
  ───────────────────────────────────────── */
  function openCart() {
    cartPanel.classList.add("open");
    backdrop.classList.add("visible");
    document.body.style.overflow = "hidden";
    panelClose.focus();
  }

  function closeCart() {
    cartPanel.classList.remove("open");
    backdrop.classList.remove("visible");
    document.body.style.overflow = "";
  }

  cartBtn.addEventListener("click", openCart);
  panelClose.addEventListener("click", closeCart);
  backdrop.addEventListener("click", closeCart);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeCart(); closePayModal(); }
  });

  /* ─────────────────────────────────────────
     PAYMENT MODAL
  ───────────────────────────────────────── */
  function openPayModal() {
    closeCart();
    payFormWrap.style.display = "block";
    successScreen.style.display = "none";
    resetForm();
    modalTotal.textContent = `R${cartTotal().toFixed(2)}`;
    payModal.classList.add("open");
    document.body.style.overflow = "hidden";
    nameInput.focus();
  }

  function closePayModal() {
    payModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  checkoutBtn.addEventListener("click", openPayModal);
  modalClose.addEventListener("click", closePayModal);

  /* ─────────────────────────────────────────
     FORM FORMATTING  (input masks)
  ───────────────────────────────────────── */
  numInput.addEventListener("input", () => {
    let v = numInput.value.replace(/\D/g, "").slice(0, 16);
    numInput.value = v.match(/.{1,4}/g)?.join(" ") ?? v;
  });

  expInput.addEventListener("input", () => {
    let v = expInput.value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + " / " + v.slice(2);
    expInput.value = v;
  });

  cvvInput.addEventListener("input", () => {
    cvvInput.value = cvvInput.value.replace(/\D/g, "").slice(0, 4);
  });

  /* clear errors on input */
  [nameInput, numInput, expInput, cvvInput].forEach(inp => {
    inp.addEventListener("input", () => clearError(inp));
  });

  /* ─────────────────────────────────────────
     VALIDATION
  ───────────────────────────────────────── */
  function showError(input, errId) {
    input.classList.add("gcb-error");
    document.getElementById(errId).style.display = "block";
  }
  function clearError(input) {
    input.classList.remove("gcb-error");
    const errId = input.id.replace("gcb-", "gcb-") + "-err";
    const el = document.getElementById(errId);
    if (el) el.style.display = "none";
  }
  function resetForm() {
    [nameInput, numInput, expInput, cvvInput].forEach(inp => {
      inp.value = "";
      clearError(inp);
    });
  }

  function validate() {
    let ok = true;

    if (!nameInput.value.trim()) {
      showError(nameInput, "gcb-name-err"); ok = false;
    }

    const rawNum = numInput.value.replace(/\s/g, "");
    if (!/^\d{16}$/.test(rawNum)) {
      showError(numInput, "gcb-number-err"); ok = false;
    }

    const rawExp = expInput.value.replace(/\s/g, "");
    const expMatch = rawExp.match(/^(\d{2})\/(\d{2})$/);
    if (!expMatch) {
      showError(expInput, "gcb-expiry-err"); ok = false;
    } else {
      const month = parseInt(expMatch[1], 10);
      const year  = 2000 + parseInt(expMatch[2], 10);
      const now   = new Date();
      const valid = month >= 1 && month <= 12 &&
        new Date(year, month - 1) >= new Date(now.getFullYear(), now.getMonth());
      if (!valid) { showError(expInput, "gcb-expiry-err"); ok = false; }
    }

    if (!/^\d{3,4}$/.test(cvvInput.value)) {
      showError(cvvInput, "gcb-cvv-err"); ok = false;
    }

    return ok;
  }

  /* ─────────────────────────────────────────
     PAY BUTTON
  ───────────────────────────────────────── */
  payBtn.addEventListener("click", () => {
    if (!validate()) return;

    payBtn.disabled = true;
    payBtn.innerHTML = `<span class="gcb-lock-icon">⏳</span> Processing…`;

    /* simulate a 1.8s processing delay then show success */
    setTimeout(() => {
      payFormWrap.style.display = "none";
      successScreen.style.display = "block";
      cart = [];
      renderCart();
      payBtn.disabled = false;
      payBtn.innerHTML = `<span class="gcb-lock-icon">🔒</span> Pay Now`;
    }, 1800);
  });

  successDone.addEventListener("click", () => {
    closePayModal();
    showToast("Order confirmed! Thank you for choosing Golden Crust. 🍞");
  });

  /* ─────────────────────────────────────────
     TOAST
  ───────────────────────────────────────── */
  let toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  /* ─────────────────────────────────────────
     DATE / TIME  (already in HTML — leave it;
     this block only runs if the element exists
     and the inline script hasn't already run)
  ───────────────────────────────────────── */
  /* (The inline <script> in the HTML already handles #datetime —
     no duplicate logic needed here.) */

  /* initial render */
  renderCart();

})();