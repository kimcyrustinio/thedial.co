// shop.js — universal version (supports all product card types)
document.addEventListener('DOMContentLoaded', () => {
  // this selector now catches watch-card, collections-card, series-item, etc.
  const itemSelector = '.watch-card, .series-item, .collections-card, [class*="card"]';
  const wishlistSelector = '.wishlist-btn';

  // create modal if missing (optional fallback)
  function ensureModal() {
    if (document.getElementById('productModal')) return;
    const modalHtml = `
      <div id="productModal" class="modal" style="display:none;position:fixed;inset:0;z-index:1200;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);">
        <div class="modal-content" style="width:520px;max-width:94%;background:#fff;border-radius:14px;padding:28px;position:relative;box-shadow:0 20px 50px rgba(0,0,0,0.25);">
          <button class="close-btn" aria-label="Close" style="position:absolute;right:14px;top:12px;background:none;border:none;font-size:26px;cursor:pointer;">&times;</button>
          <div style="display:flex;gap:20px;flex-direction:column;align-items:center;">
            <img id="modalImage" src="" alt="" style="width:78%;height:auto;object-fit:contain;margin-bottom:12px;">
            <h3 id="modalTitle" style="font-family:Inter, sans-serif;margin:6px 0 4px 0;"></h3>
            <div id="modalPrice" style="font-family:Inter, sans-serif;font-weight:500;font-size:13px;color:#333;margin-bottom:14px;"></div>
            <div style="display:flex;gap:12px;width:100%;justify-content:center;">
              <button id="modalAdd" class="modal-add" style="padding:10px 18px;border-radius:8px;border:1px solid #ddd;background:#f5f5f5;cursor:pointer;font-weight:600;">Add to Cart</button>
              <button id="modalBuy" class="modal-buy" style="padding:10px 18px;border-radius:8px;border:none;background:#000;color:#fff;cursor:pointer;font-weight:700;">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  // prevent wishlist clicks from bubbling to item click handler
  function setupWishlistStops(root = document) {
    root.querySelectorAll(wishlistSelector).forEach(btn => {
      if (btn._wishlistBound) return;
      btn.addEventListener('click', ev => {
        ev.stopPropagation();
        btn.classList.toggle('active');
      });
      btn._wishlistBound = true;
    });
  }

  function openModalFromItem(item) {
    if (!item) return;
    ensureModal();

    const modal = document.getElementById('productModal');
    if (!modal) return;

    // try to extract image, title, and price from any product card layout
    const imgEl = item.querySelector('img');
    const titleEl = item.querySelector('.watch-name, .product-name, .title, h4, p');
    const priceEl = item.querySelector('.watch-price, .price, span');

    const imgSrc = imgEl ? (imgEl.dataset.large || imgEl.src) : '';
    const title = titleEl ? titleEl.innerText.trim() : '';
    const price = priceEl ? priceEl.innerText.trim() : '';

    modal.querySelector('#modalImage').src = imgSrc;
    modal.querySelector('#modalTitle').textContent = title;
    modal.querySelector('#modalPrice').textContent = price;

    // enable/disable buttons based on sold-out state
    const addBtn = modal.querySelector('#modalAdd');
    const buyBtn = modal.querySelector('#modalBuy');
    if (item.classList.contains('sold-out')) {
      addBtn.disabled = true; addBtn.style.opacity = 0.6;
      buyBtn.disabled = true; buyBtn.style.opacity = 0.6;
    } else {
      addBtn.disabled = false; addBtn.style.opacity = 1;
      buyBtn.disabled = false; buyBtn.style.opacity = 1;
    }

    modal.style.display = 'flex';
  }

  function closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
  }

  function incrementCartCount(by = 1) {
    const el = document.getElementById('cart-count') || document.querySelector('#cart-count');
    if (!el) return;
    const n = parseInt(el.innerText || '0', 10) || 0;
    el.innerText = n + by;
  }

  // initialize everything
  ensureModal();
  setupWishlistStops();

  // open modal on item click (ignore wishlist)
  document.addEventListener('click', e => {
    if (e.target.closest(wishlistSelector)) return;
    const item = e.target.closest(itemSelector);
    if (!item) return;
    openModalFromItem(item);
  });

  // close modal on backdrop or button click
  document.body.addEventListener('click', e => {
    if (e.target.matches('.close-btn') || e.target.id === 'productModal') closeModal();
  });

  // modal add & buy buttons
  document.body.addEventListener('click', e => {
    if (e.target.matches('#modalAdd')) {
      incrementCartCount(1);
      e.target.textContent = 'Added ✓';
      setTimeout(() => e.target.textContent = 'Add to Cart', 1200);
    } else if (e.target.matches('#modalBuy')) {
      incrementCartCount(1);
      window.location.href = 'cart.html';
    }
  });

  // ESC key closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // ensure wishlist stays bound even after DOM changes (load more, etc.)
  const mo = new MutationObserver(() => setupWishlistStops());
  mo.observe(document.body, { childList: true, subtree: true });

  console.log('✅ shop.js ready — supports all card types:', itemSelector);
});
