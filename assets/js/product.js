/* ==========================================================================
   VELOURE — Product detail page interactions: thumbnail/colour swap, qty
   stepper, size-guide toggle. Cart wiring itself lives in cart.js (this
   file only keeps the add-to-cart button's data attributes in sync with
   whatever the shopper currently has selected).
   ========================================================================== */
(function () {
  'use strict';

  var addBtn = document.querySelector('[data-add-to-cart]');
  var mainImg = document.getElementById('product-main-img');
  var mainSource = document.getElementById('product-main-source');
  var selectedColourEl = document.querySelector('[data-selected-colour]');

  document.querySelectorAll('.thumb').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      document.querySelectorAll('.thumb').forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-pressed', 'false');
      });
      thumb.classList.add('is-active');
      thumb.setAttribute('aria-pressed', 'true');

      var jpg = thumb.getAttribute('data-jpg');
      var webp = thumb.getAttribute('data-webp');
      if (mainImg && jpg) mainImg.src = jpg;
      if (mainSource && webp) mainSource.srcset = webp;

      var colour = thumb.getAttribute('data-colour');
      if (colour) {
        if (selectedColourEl) selectedColourEl.textContent = colour;
        if (addBtn) {
          addBtn.setAttribute('data-colour', colour);
          if (jpg) addBtn.setAttribute('data-image', jpg);
        }
      } else if (addBtn && jpg) {
        addBtn.setAttribute('data-image', jpg);
      }
    });
  });

  var qtyInput = document.querySelector('[data-qty-input]');
  var qtyMinus = document.querySelector('[data-qty-minus]');
  var qtyPlus = document.querySelector('[data-qty-plus]');
  function clampQty(val) { return Math.min(10, Math.max(1, val)); }
  if (qtyInput && qtyMinus && qtyPlus) {
    qtyMinus.addEventListener('click', function () {
      qtyInput.value = clampQty(parseInt(qtyInput.value, 10) - 1);
    });
    qtyPlus.addEventListener('click', function () {
      qtyInput.value = clampQty(parseInt(qtyInput.value, 10) + 1);
    });
  }

  document.querySelectorAll('input[name="size"]').forEach(function (input) {
    input.addEventListener('change', function () {
      var err = document.querySelector('[data-size-error]');
      if (err) err.hidden = true;
    });
  });

  var sizeGuideToggle = document.querySelector('[data-size-guide-toggle]');
  var sizeGuide = document.querySelector('[data-size-guide]');
  if (sizeGuideToggle && sizeGuide) {
    sizeGuideToggle.addEventListener('click', function () {
      var isHidden = sizeGuide.hidden;
      sizeGuide.hidden = !isHidden;
      sizeGuideToggle.setAttribute('aria-expanded', String(isHidden));
    });
  }
})();
