(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------------------
     Mobile nav toggle
     ---------------------------------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('is-open', !expanded);
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
      });
    });
  }

  /* ----------------------------------------------------------------------
     Product colour swatches — swap the card image (progressive enhancement;
     falls back to a static default image with no JS)
     ---------------------------------------------------------------------- */
  document.querySelectorAll('.product-card').forEach(function (card) {
    var swatches = card.querySelectorAll('.swatch[data-image]');
    var img = card.querySelector('.product-card__media img');
    var source = card.querySelector('.product-card__media source');
    if (!swatches.length || !img) return;

    swatches.forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        swatches.forEach(function (s) {
          s.classList.remove('is-active');
          s.setAttribute('aria-pressed', 'false');
        });
        swatch.classList.add('is-active');
        swatch.setAttribute('aria-pressed', 'true');

        var name = swatch.getAttribute('data-image');
        if (!name) return;
        img.src = 'assets/img/' + name + '.jpg';
        if (source) source.srcset = 'assets/img/' + name + '.webp';
        var colour = swatch.getAttribute('data-colour');
        if (colour) img.alt = 'VELOURE Signature Rib Tee, back view, ' + colour + ' colourway with gold Veloure embroidery';
      });
    });
  });

  /* ----------------------------------------------------------------------
     Access form — no backend wired up yet; shows a confirmation state
     locally so the flow can be demoed end to end.
     ---------------------------------------------------------------------- */
  var accessForm = document.getElementById('access-form');
  if (accessForm) {
    accessForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('access-form-note');
      var emailInput = document.getElementById('email');
      if (!emailInput.value || !emailInput.checkValidity()) {
        note.textContent = 'Please enter a valid email address.';
        note.className = 'access-form__note is-error';
        return;
      }
      note.textContent = 'You’re on the list. We’ll be in touch before Drop 01 opens.';
      note.className = 'access-form__note is-success';
      accessForm.reset();
    });
  }

  /* ----------------------------------------------------------------------
     Motion: GSAP entrance + scroll reveals + gentle hero parallax.
     Everything is visible by default (see CSS); JS only adds the
     .js-ready hook once GSAP has confirmed it's available, so a failed
     script load never hides content.
     ---------------------------------------------------------------------- */
  var hasGSAP = typeof window.gsap !== 'undefined';

  if (hasGSAP && !prefersReducedMotion) {
    document.documentElement.classList.add('js-ready');
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    var heroTl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    heroTl
      .to('.hero .eyebrow', { opacity: 1, y: 0, duration: 0.5 }, 0.1)
      .to('.hero__title [data-reveal], .hero__title', { opacity: 1, y: 0, duration: 0.7 }, 0.2)
      .to('.hero__tagline', { opacity: 1, y: 0, duration: 0.6 }, 0.4)
      .to('.hero__copy', { opacity: 1, y: 0, duration: 0.6 }, 0.5)
      .to('.hero__actions', { opacity: 1, y: 0, duration: 0.6 }, 0.6);

    // Generic scroll reveals, staggered per parent section
    var groups = {};
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el.closest('.hero')) return; // handled by heroTl above
      var section = el.closest('section') || document.body;
      if (!groups[section.id || 'root']) groups[section.id || 'root'] = [];
      groups[section.id || 'root'].push(el);
    });

    Object.keys(groups).forEach(function (key) {
      var els = groups[key];
      ScrollTrigger.batch(els, {
        start: 'top 88%',
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.08
          });
          batch.forEach(function (el) { el.classList.add('is-visible'); });
        },
        once: true
      });
    });

    // Subtle parallax on hero background media
    document.querySelectorAll('[data-parallax-layer]').forEach(function (layer) {
      var img = layer.querySelector('img');
      if (!img) return;
      gsap.to(img, {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: layer.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    });

    // Product & lookbook photography: a distinct scale-and-reveal as each
    // image enters view (separate from the text fade, so imagery reads as
    // the more dynamic element). clearProps hands the transform back to
    // CSS afterwards so the existing hover zoom keeps working normally.
    var shopImages = document.querySelectorAll('.product-card__media img, .lookbook__item img, .detail-gallery__item img, .unboxing__shot img');
    gsap.set(shopImages, { scale: 1.12, opacity: 0 });
    ScrollTrigger.batch(shopImages, {
      start: 'top 92%',
      onEnter: function (batch) {
        gsap.to(batch, {
          scale: 1,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
          stagger: 0.07,
          clearProps: 'transform'
        });
      },
      once: true
    });

    // Gentle scroll-linked drift on the product & lookbook cards themselves,
    // alternating direction per card so scrolling through the grid feels
    // like it has real depth. Uses the x-axis specifically so it never
    // fights the card's own y-axis reveal-on-enter tween above.
    document.querySelectorAll('.product-card, .lookbook__item').forEach(function (card, i) {
      gsap.to(card, {
        x: i % 2 === 0 ? -10 : 10,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8
        }
      });
    });
  } else {
    // No GSAP / reduced motion: ensure reveal targets are simply visible.
    document.documentElement.classList.remove('js-ready');
  }
})();
