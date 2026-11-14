(function () {
  'use strict';

  /* Mobile drawer */
  var burger = document.querySelector('.nav__burger');
  var drawer = document.getElementById('drawer');
  function setDrawer(open) {
    drawer.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () {
    setDrawer(burger.getAttribute('aria-expanded') !== 'true');
  });
  drawer.addEventListener('click', function (e) { if (e.target.closest('a')) setDrawer(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) { setDrawer(false); burger.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
    if (e.matches) setDrawer(false);
  });

  /* Fixed call bar: visible only while the hero is on screen */
  var callbar = document.getElementById('callbar');
  var sentinel = document.getElementById('hero-sentinel');

  /* Scroll reveals, once */
  var targets = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window)) {
    callbar.classList.add('is-visible');
    targets.forEach(function (t) { t.classList.add('is-in'); });
    return;
  }

  new IntersectionObserver(function (entries) {
    var entry = entries[0];
    // Visible while the bottom edge of the hero has not yet left through the top of the viewport
    var heroVisible = entry.isIntersecting || entry.boundingClientRect.top > 0;
    callbar.classList.toggle('is-visible', heroVisible);
  }, { threshold: 0 }).observe(sentinel);

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -60px 0px', threshold: 0 });
  targets.forEach(function (t) { io.observe(t); });
})();
