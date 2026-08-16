/* ==========================================================================
   VELOURE — Cart engine + drawer (vanilla JS, localStorage-backed demo).
   No payment processing happens here; checkout.html reads this same store
   and simulates an order. Loaded on every page, before main.js.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'veloure:cart:v1';
  var listeners = [];

  function readStore() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      var items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items : [];
    } catch (err) {
      return [];
    }
  }

  function writeStore(items) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) { /* private mode / storage full — cart just won't persist */ }
    listeners.forEach(function (fn) { fn(items); });
    window.dispatchEvent(new CustomEvent('veloure:cart-change', { detail: { items: items } }));
  }

  function lineId(item) {
    return [item.productId, item.colour, item.size].filter(Boolean).join('__');
  }

  var Cart = {
    getItems: readStore,
    onChange: function (fn) { listeners.push(fn); },
    getCount: function () {
      return readStore().reduce(function (sum, it) { return sum + it.qty; }, 0);
    },
    getSubtotal: function () {
      return readStore().reduce(function (sum, it) { return sum + it.qty * it.price; }, 0);
    },
    add: function (item) {
      var items = readStore();
      var id = lineId(item);
      var existing = items.find(function (it) { return lineId(it) === id; });
      if (existing) {
        existing.qty += item.qty || 1;
      } else {
        items.push({
          productId: item.productId,
          name: item.name,
          colour: item.colour || '',
          size: item.size || '',
          price: Number(item.price) || 0,
          image: item.image || '',
          url: item.url || '',
          qty: item.qty || 1
        });
      }
      writeStore(items);
      return id;
    },
    setQty: function (id, qty) {
      var items = readStore();
      var line = items.find(function (it) { return lineId(it) === id; });
      if (!line) return;
      if (qty <= 0) {
        items = items.filter(function (it) { return lineId(it) !== id; });
      } else {
        line.qty = qty;
      }
      writeStore(items);
    },
    remove: function (id) {
      writeStore(readStore().filter(function (it) { return lineId(it) !== id; }));
    },
    clear: function () {
      writeStore([]);
    }
  };

  window.Veloure = window.Veloure || {};
  window.Veloure.cart = Cart;
  window.Veloure.formatPrice = function (n) {
    return '€' + Number(n).toFixed(0);
  };

  /* ------------------------------------------------------------------------
     Drawer UI — injected once per page so every HTML file only needs the
     header trigger button; markup here stays in one place.
     ------------------------------------------------------------------------ */
  function buildDrawer() {
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="cart-scrim" id="cart-scrim" hidden></div>' +
      '<aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" hidden>' +
        '<div class="cart-drawer__head">' +
          '<h2 class="cart-drawer__title">Your Bag</h2>' +
          '<button type="button" class="cart-drawer__close" id="cart-close" aria-label="Close cart">' +
            '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M1 1L17 17M17 1L1 17" stroke="currentColor" stroke-width="1.4"/></svg>' +
          '</button>' +
        '</div>' +
        '<div class="cart-drawer__body" id="cart-drawer-body"></div>' +
        '<div class="cart-drawer__foot" id="cart-drawer-foot"></div>' +
      '</aside>';
    document.body.appendChild(wrap);
  }

  function itemImgAlt(item) {
    return item.name + (item.colour ? ', ' + item.colour : '') + (item.size ? ', size ' + item.size : '');
  }

  function renderDrawer() {
    var body = document.getElementById('cart-drawer-body');
    var foot = document.getElementById('cart-drawer-foot');
    if (!body || !foot) return;
    var items = Cart.getItems();

    if (!items.length) {
      body.innerHTML =
        '<div class="cart-empty">' +
          '<p>Your bag is empty.</p>' +
          '<a href="index.html#collection" class="btn btn--outline btn--sm">Browse the Collection</a>' +
        '</div>';
      foot.innerHTML = '';
      return;
    }

    body.innerHTML = items.map(function (item) {
      var id = lineId(item);
      return (
        '<div class="cart-line" data-line="' + id + '">' +
          '<div class="cart-line__media"><img src="' + item.image + '" alt="" loading="lazy" width="88" height="104"></div>' +
          '<div class="cart-line__meta">' +
            '<p class="cart-line__name">' + item.name + '</p>' +
            '<p class="cart-line__opts">' + [item.colour, item.size ? 'Size ' + item.size : ''].filter(Boolean).join(' · ') + '</p>' +
            '<div class="cart-line__row">' +
              '<div class="qty-stepper" role="group" aria-label="Quantity for ' + itemImgAlt(item) + '">' +
                '<button type="button" class="qty-stepper__btn" data-qty-down="' + id + '" aria-label="Decrease quantity">−</button>' +
                '<span class="qty-stepper__val">' + item.qty + '</span>' +
                '<button type="button" class="qty-stepper__btn" data-qty-up="' + id + '" aria-label="Increase quantity">+</button>' +
              '</div>' +
              '<span class="cart-line__price">' + Veloure.formatPrice(item.price * item.qty) + '</span>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="cart-line__remove" data-remove="' + id + '" aria-label="Remove ' + itemImgAlt(item) + ' from cart">' +
            '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.3"/></svg>' +
          '</button>' +
        '</div>'
      );
    }).join('');

    var subtotal = Cart.getSubtotal();
    foot.innerHTML =
      '<div class="cart-drawer__subtotal"><span>Subtotal</span><span>' + Veloure.formatPrice(subtotal) + '</span></div>' +
      '<p class="cart-drawer__note">Shipping, taxes and any duties are calculated at checkout.</p>' +
      '<a href="checkout.html" class="btn btn--primary cart-drawer__checkout"><span>Checkout</span></a>';
  }

  function updateBadges() {
    var count = Cart.getCount();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = String(count);
      el.classList.toggle('is-visible', count > 0);
    });
    document.querySelectorAll('[data-cart-trigger]').forEach(function (el) {
      el.setAttribute('aria-label', count > 0 ? 'Open cart, ' + count + ' item' + (count === 1 ? '' : 's') : 'Open cart, empty');
    });
  }

  var lastFocused = null;
  function openDrawer() {
    var scrim = document.getElementById('cart-scrim');
    var drawer = document.getElementById('cart-drawer');
    if (!scrim || !drawer) return;
    lastFocused = document.activeElement;
    renderDrawer();
    scrim.hidden = false;
    drawer.hidden = false;
    requestAnimationFrame(function () {
      scrim.classList.add('is-open');
      drawer.classList.add('is-open');
    });
    document.body.classList.add('cart-open');
    var closeBtn = document.getElementById('cart-close');
    if (closeBtn) closeBtn.focus();
    document.addEventListener('keydown', onDrawerKeydown);
  }

  function closeDrawer() {
    var scrim = document.getElementById('cart-scrim');
    var drawer = document.getElementById('cart-drawer');
    if (!scrim || !drawer) return;
    scrim.classList.remove('is-open');
    drawer.classList.remove('is-open');
    document.body.classList.remove('cart-open');
    document.removeEventListener('keydown', onDrawerKeydown);
    window.setTimeout(function () {
      scrim.hidden = true;
      drawer.hidden = true;
    }, 380);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function onDrawerKeydown(e) {
    var drawer = document.getElementById('cart-drawer');
    if (e.key === 'Escape') { closeDrawer(); return; }
    if (e.key !== 'Tab' || !drawer) return;
    var focusable = drawer.querySelectorAll('button, a[href]');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function wireDrawerEvents() {
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-cart-trigger]');
      if (trigger) { e.preventDefault(); openDrawer(); return; }

      if (e.target.closest('#cart-close') || e.target.closest('#cart-scrim')) {
        closeDrawer(); return;
      }

      var up = e.target.closest('[data-qty-up]');
      if (up) {
        var idUp = up.getAttribute('data-qty-up');
        var itemUp = Cart.getItems().find(function (it) { return lineId(it) === idUp; });
        if (itemUp) Cart.setQty(idUp, itemUp.qty + 1);
        return;
      }
      var down = e.target.closest('[data-qty-down]');
      if (down) {
        var idDown = down.getAttribute('data-qty-down');
        var itemDown = Cart.getItems().find(function (it) { return lineId(it) === idDown; });
        if (itemDown) Cart.setQty(idDown, itemDown.qty - 1);
        return;
      }
      var remove = e.target.closest('[data-remove]');
      if (remove) {
        Cart.remove(remove.getAttribute('data-remove'));
        return;
      }

      var addBtn = e.target.closest('[data-add-to-cart]');
      if (addBtn) {
        e.preventDefault();
        handleAddToCart(addBtn);
      }
    });
  }

  function handleAddToCart(btn) {
    var card = btn.closest('[data-product]') || document;
    var sizeInput = card.querySelector('input[name="size"]:checked');
    var qtyInput = card.querySelector('[data-qty-input]');
    var activeSwatch = card.querySelector('.swatch.is-active');

    var item = {
      productId: btn.getAttribute('data-product-id') || card.getAttribute('data-product-id'),
      name: btn.getAttribute('data-name') || card.getAttribute('data-name'),
      price: btn.getAttribute('data-price') || card.getAttribute('data-price'),
      image: btn.getAttribute('data-image') || card.getAttribute('data-image'),
      colour: (activeSwatch && activeSwatch.getAttribute('data-colour')) || btn.getAttribute('data-colour') || card.getAttribute('data-colour') || '',
      size: sizeInput ? sizeInput.value : (btn.getAttribute('data-size') || ''),
      qty: qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1,
      url: btn.getAttribute('data-url') || ''
    };

    if (card.hasAttribute('data-requires-size') && !item.size) {
      var sizeError = card.querySelector('[data-size-error]');
      if (sizeError) {
        sizeError.hidden = false;
        sizeError.focus && sizeError.setAttribute('tabindex', '-1');
      }
      return;
    }

    Cart.add(item);
    flashButton(btn);
    openDrawer();
  }

  function flashButton(btn) {
    var original = btn.querySelector('span') ? btn.querySelector('span').textContent : btn.textContent;
    var span = btn.querySelector('span');
    if (span) span.textContent = 'Added ✓';
    btn.classList.add('is-added');
    window.setTimeout(function () {
      if (span) span.textContent = original;
      btn.classList.remove('is-added');
    }, 1600);
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildDrawer();
    wireDrawerEvents();
    updateBadges();
    Cart.onChange(updateBadges);
    window.addEventListener('storage', function (e) {
      if (e.key === STORAGE_KEY) { updateBadges(); renderDrawer(); }
    });
  });
})();
