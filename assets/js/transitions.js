/* ==========================================================================
   VELOURE — Cinematic page-transition overlay. A single ink curtain wipes
   away on every page load (doubling as the hero's cinematic entrance) and
   wipes back in before internal navigation. Pure progressive enhancement:
   the overlay is only created when GSAP is available and motion isn't
   reduced, so a slow/failed script load never blocks navigation.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  if (!hasGSAP || prefersReducedMotion) return;

  var overlay = document.createElement('div');
  overlay.className = 'page-curtain';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '<span class="page-curtain__mark">V</span>';
  document.documentElement.appendChild(overlay);

  function revealPage() {
    gsap.to(overlay, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 0.9,
      ease: 'power3.inOut',
      delay: 0.05,
      onComplete: function () {
        overlay.style.display = 'none';
      }
    });
    gsap.fromTo(overlay.querySelector('.page-curtain__mark'),
      { opacity: 1, scale: 1 },
      { opacity: 0, scale: 0.8, duration: 0.5, ease: 'power2.in' }
    );
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    requestAnimationFrame(revealPage);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      requestAnimationFrame(revealPage);
    });
  }

  // Restore the curtain instantly (no animation) if the page is served from
  // the back/forward cache, so a returning visit never re-plays the intro.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      overlay.style.display = 'none';
    }
  });

  function isQualifyingLink(link) {
    if (!link || !link.href) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;
    if (link.origin !== window.location.origin) return false;
    if (link.getAttribute('href').charAt(0) === '#') return false;
    var linkPath = link.pathname.replace(/\/index\.html$/, '/');
    var currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
    if (linkPath === currentPath) return false; // same-page anchors with different hash
    return true;
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest('a[href]');
    if (!isQualifyingLink(link)) return;

    e.preventDefault();
    var dest = link.href;
    overlay.style.display = 'block';
    gsap.set(overlay, { clipPath: 'inset(0 0 0 0)' });
    gsap.fromTo(overlay.querySelector('.page-curtain__mark'),
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' }
    );
    gsap.fromTo(overlay,
      { clipPath: 'inset(100% 0 0 0)' },
      {
        clipPath: 'inset(0 0 0 0)',
        duration: 0.55,
        ease: 'power3.inOut',
        onComplete: function () { window.location.href = dest; }
      }
    );
  });
})();
