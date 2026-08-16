(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ----------------------------------------------------------------------
     Footer year
     ---------------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------------------
     Sticky header state on scroll
     ---------------------------------------------------------------------- */
  var header = document.getElementById('site-header');
  if (header) {
    var updateHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

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
      document.body.style.overflow = !expanded ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ----------------------------------------------------------------------
     Service card 3D tilt (pointer-fine devices only)
     ---------------------------------------------------------------------- */
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var bounds;
      card.addEventListener('pointerenter', function () { bounds = card.getBoundingClientRect(); });
      card.addEventListener('pointermove', function (e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        var px = (e.clientX - bounds.left) / bounds.width - 0.5;
        var py = (e.clientY - bounds.top) / bounds.height - 0.5;
        card.style.transform = 'perspective(700px) rotateX(' + (py * -7) + 'deg) rotateY(' + (px * 9) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
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
      .to('.hero__title', { opacity: 1, y: 0, duration: 0.7 }, 0.2)
      .to('.hero__copy', { opacity: 1, y: 0, duration: 0.6 }, 0.4)
      .to('.hero__actions', { opacity: 1, y: 0, duration: 0.6 }, 0.5)
      .to('.hero__meta', { opacity: 1, y: 0, duration: 0.6 }, 0.6)
      .to('.hero__visual', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.3);

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

    // Subtle parallax on hero background layer
    document.querySelectorAll('[data-parallax-layer]').forEach(function (layer) {
      gsap.to(layer, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: layer.closest('section'),
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6
        }
      });
    });

    // Draw-in animation for the process step connector lines
    gsap.utils.toArray('.step__line').forEach(function (line) {
      gsap.fromTo(line, { scaleX: 0 }, {
        scaleX: 1,
        transformOrigin: 'left center',
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: line, start: 'top 85%' }
      });
    });

    // Marquee: slow down subtly on scroll for a bit of scroll-linked motion
    var marqueeTrack = document.querySelector('.marquee__track');
    if (marqueeTrack) {
      ScrollTrigger.create({
        trigger: '.marquee',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: function (self) {
          marqueeTrack.style.animationDuration = (32 + self.getVelocity() / 400) + 's';
        }
      });
    }
  } else {
    // No GSAP / reduced motion: ensure reveal targets are simply visible.
    document.documentElement.classList.remove('js-ready');
  }
})();
