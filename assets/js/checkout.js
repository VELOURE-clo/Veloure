/* ==========================================================================
   VELOURE — Demo checkout flow: Shipping -> Payment -> Review -> Confirmation.
   Nothing here talks to a payment processor; card details are validated for
   shape only (Luhn + expiry) and never stored or transmitted. It exists to
   demonstrate the full purchase flow end to end.
   ========================================================================== */
(function () {
  'use strict';

  var Cart = window.Veloure && window.Veloure.cart;
  if (!Cart) return;

  var app = document.querySelector('[data-checkout]');
  if (!app) return;

  var shippingData = {};
  var paymentData = {};

  /* ------------------------------------------------------------------------
     Order summary
     ------------------------------------------------------------------------ */
  function renderSummary() {
    var summary = document.querySelector('[data-order-summary]');
    if (!summary) return;
    var items = Cart.getItems();
    var subtotal = Cart.getSubtotal();

    var lines = items.map(function (item) {
      return (
        '<div class="summary-line">' +
          '<div class="summary-line__media"><img src="' + item.image + '" alt="" loading="lazy" width="56" height="68"></div>' +
          '<div>' +
            '<p class="summary-line__name">' + item.name + ' &times; ' + item.qty + '</p>' +
            '<p class="summary-line__opts">' + [item.colour, item.size ? 'Size ' + item.size : ''].filter(Boolean).join(' · ') + '</p>' +
          '</div>' +
          '<span class="summary-line__price">' + Veloure.formatPrice(item.price * item.qty) + '</span>' +
        '</div>'
      );
    }).join('');

    summary.innerHTML =
      '<h2>Order Summary</h2>' +
      lines +
      '<div class="summary-totals">' +
        '<div class="summary-totals__row"><span>Subtotal</span><span>' + Veloure.formatPrice(subtotal) + '</span></div>' +
        '<div class="summary-totals__row"><span>Shipping</span><span>Free</span></div>' +
        '<div class="summary-totals__row summary-totals__row--total"><span>Total</span><span data-summary-total>' + Veloure.formatPrice(subtotal) + '</span></div>' +
      '</div>';
  }

  function checkEmpty() {
    var empty = Cart.getItems().length === 0;
    var stepsBar = document.querySelector('.checkout__steps');
    var layout = document.querySelector('.checkout__layout');
    var emptyPanel = document.querySelector('[data-step="empty"]');
    var confirmed = app.getAttribute('data-order-placed') === 'true';
    if (empty && !confirmed) {
      if (stepsBar) stepsBar.hidden = true;
      if (layout) layout.hidden = true;
      if (emptyPanel) emptyPanel.hidden = false;
    } else {
      if (emptyPanel) emptyPanel.hidden = true;
      if (!confirmed) {
        if (stepsBar) stepsBar.hidden = false;
        if (layout) layout.hidden = false;
      }
    }
  }

  /* ------------------------------------------------------------------------
     Step navigation
     ------------------------------------------------------------------------ */
  function goToStep(step) {
    document.querySelectorAll('.checkout-panel[data-step]').forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-step') !== String(step);
    });
    document.querySelectorAll('.checkout__step[data-step-indicator]').forEach(function (el) {
      var n = Number(el.getAttribute('data-step-indicator'));
      el.classList.toggle('is-active', n === step);
      el.classList.toggle('is-done', n < step);
    });
    var activePanel = document.querySelector('.checkout-panel[data-step="' + step + '"]');
    if (activePanel) {
      activePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var heading = activePanel.querySelector('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
  }

  /* ------------------------------------------------------------------------
     Field validation helpers
     ------------------------------------------------------------------------ */
  function setError(field, message) {
    var wrap = field.closest('.field');
    var err = wrap && wrap.querySelector('.field__error');
    if (!wrap || !err) return;
    wrap.classList.toggle('has-error', !!message);
    err.textContent = message || '';
  }

  function validateRequired(form) {
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      if (!field.value.trim()) {
        setError(field, 'This field is required.');
        valid = false;
      } else {
        setError(field, '');
      }
    });
    return valid;
  }

  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ------------------------------------------------------------------------
     Shipping form
     ------------------------------------------------------------------------ */
  var shippingForm = document.querySelector('[data-shipping-form]');
  if (shippingForm) {
    shippingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = validateRequired(shippingForm);
      var email = shippingForm.querySelector('[name="email"]');
      if (email && email.value && !emailPattern.test(email.value)) {
        setError(email, 'Enter a valid email address.');
        valid = false;
      }
      if (!valid) return;

      shippingData = {
        firstName: shippingForm.firstName.value.trim(),
        lastName: shippingForm.lastName.value.trim(),
        email: shippingForm.email.value.trim(),
        address: shippingForm.address.value.trim(),
        address2: shippingForm.address2.value.trim(),
        city: shippingForm.city.value.trim(),
        postal: shippingForm.postal.value.trim(),
        country: shippingForm.country.options[shippingForm.country.selectedIndex].text,
        phone: shippingForm.phone.value.trim()
      };
      goToStep(2);
    });
  }

  /* ------------------------------------------------------------------------
     Payment form — formatting + Luhn/expiry validation, demo only
     ------------------------------------------------------------------------ */
  var paymentForm = document.querySelector('[data-payment-form]');
  var cardNumberInput = document.querySelector('[name="cardNumber"]');
  var expiryInput = document.querySelector('[name="expiry"]');
  var cvcInput = document.querySelector('[name="cvc"]');

  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function () {
      var digits = cardNumberInput.value.replace(/\D/g, '').slice(0, 19);
      cardNumberInput.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });
  }
  if (expiryInput) {
    expiryInput.addEventListener('input', function () {
      var digits = expiryInput.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length >= 3) digits = digits.slice(0, 2) + '/' + digits.slice(2);
      expiryInput.value = digits;
    });
  }
  if (cvcInput) {
    cvcInput.addEventListener('input', function () {
      cvcInput.value = cvcInput.value.replace(/\D/g, '').slice(0, 4);
    });
  }

  function luhnValid(number) {
    var sum = 0, alt = false;
    for (var i = number.length - 1; i >= 0; i--) {
      var n = parseInt(number.charAt(i), 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function expiryValid(value) {
    var m = value.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return false;
    var month = parseInt(m[1], 10);
    var year = 2000 + parseInt(m[2], 10);
    if (month < 1 || month > 12) return false;
    var now = new Date();
    var expiry = new Date(year, month);
    return expiry > now;
  }

  if (paymentForm) {
    paymentForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = validateRequired(paymentForm);

      var digits = cardNumberInput.value.replace(/\D/g, '');
      if (cardNumberInput.value && (digits.length < 13 || !luhnValid(digits))) {
        setError(cardNumberInput, 'Enter a valid card number.');
        valid = false;
      }
      if (expiryInput.value && !expiryValid(expiryInput.value)) {
        setError(expiryInput, 'Enter a valid, non-expired date (MM/YY).');
        valid = false;
      }
      if (cvcInput.value && cvcInput.value.length < 3) {
        setError(cvcInput, 'Enter a valid security code.');
        valid = false;
      }
      if (!valid) return;

      paymentData = {
        nameOnCard: paymentForm.nameOnCard.value.trim(),
        last4: digits.slice(-4)
      };
      populateReview();
      goToStep(3);
    });
  }

  /* ------------------------------------------------------------------------
     Review + place order
     ------------------------------------------------------------------------ */
  function populateReview() {
    var shipEl = document.querySelector('[data-review-shipping]');
    var payEl = document.querySelector('[data-review-payment]');
    if (shipEl) {
      shipEl.innerHTML =
        shippingData.firstName + ' ' + shippingData.lastName + '<br>' +
        shippingData.address + (shippingData.address2 ? ', ' + shippingData.address2 : '') + '<br>' +
        shippingData.city + ' ' + shippingData.postal + '<br>' +
        shippingData.country + '<br>' + shippingData.email;
    }
    if (payEl) {
      payEl.innerHTML = 'Card ending in •••• ' + paymentData.last4 + '<br>' + paymentData.nameOnCard;
    }
    var totalEl = document.querySelector('[data-review-total]');
    if (totalEl) totalEl.textContent = Veloure.formatPrice(Cart.getSubtotal());
  }

  document.querySelectorAll('[data-edit-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      goToStep(Number(btn.getAttribute('data-edit-step')));
    });
  });
  document.querySelectorAll('[data-step-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var current = btn.closest('.checkout-panel');
      var step = Number(current.getAttribute('data-step'));
      goToStep(step - 1);
    });
  });

  var placeOrderBtn = document.querySelector('[data-place-order]');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', function () {
      placeOrderBtn.classList.add('btn--loading');
      var span = placeOrderBtn.querySelector('span');
      var originalText = span ? span.textContent : '';
      if (span) span.innerHTML = '<span class="btn__spinner" aria-hidden="true"></span>Placing Order…';

      window.setTimeout(function () {
        var orderNumber = 'VLR-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 89999);
        var nameEl = document.querySelector('[data-confirm-name]');
        var orderEl = document.querySelector('[data-confirm-order]');
        var totalEl = document.querySelector('[data-confirm-total]');
        var emailEl = document.querySelector('[data-confirm-email]');
        if (nameEl) nameEl.textContent = shippingData.firstName || 'there';
        if (orderEl) orderEl.textContent = orderNumber;
        if (totalEl) totalEl.textContent = Veloure.formatPrice(Cart.getSubtotal());
        if (emailEl) emailEl.textContent = shippingData.email || '';

        app.setAttribute('data-order-placed', 'true');
        Cart.clear();
        document.querySelector('.checkout__steps').hidden = true;
        document.querySelector('.checkout__layout').hidden = true;
        goToStep('confirmation');

        if (span) span.textContent = originalText;
        placeOrderBtn.classList.remove('btn--loading');
      }, 1400);
    });
  }

  renderSummary();
  checkEmpty();
  Cart.onChange(function () {
    if (app.getAttribute('data-order-placed') !== 'true') {
      renderSummary();
      checkEmpty();
    }
  });
})();
