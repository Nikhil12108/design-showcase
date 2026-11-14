(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Navbar: solid after scrolling */
  var nav = document.getElementById('nav');
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  var menu = document.getElementById('menu');
  var menuBtn = nav.querySelector('.nav__menu-btn');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', open);
  }
  menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', function (e) {
    if (e.matches) setMenu(false);
  });

  /* Hero: settle the image once it has loaded */
  var hero = document.querySelector('.hero');
  var heroImg = hero.querySelector('img');
  function heroReady() { hero.classList.add('is-ready'); }
  if (heroImg.complete) requestAnimationFrame(heroReady);
  else {
    heroImg.addEventListener('load', heroReady, { once: true });
    heroImg.addEventListener('error', heroReady, { once: true });
    setTimeout(heroReady, 2500);
  }

  /* Count up, once */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion) { el.textContent = target; return; }
    var duration = 1800;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if (!reduceMotion) counters.forEach(function (el) { el.textContent = '0'; });

  /* Scroll reveals */
  var targets = document.querySelectorAll('.reveal, .dev, .figure');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        var num = entry.target.querySelector('[data-count]');
        if (num) countUp(num);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('is-in'); });
    counters.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* Completed list: image follows the cursor (desktop, fine pointer only) */
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)');
  var cursor = document.querySelector('.cursor-img');
  var cursorImg = cursor.querySelector('img');
  var schemes = document.querySelectorAll('.scheme');

  schemes.forEach(function (row) {
    var pre = new Image();
    pre.src = row.getAttribute('data-img');
  });

  var x = 0, y = 0, cx = 0, cy = 0, rafId = null, active = false;
  function loop() {
    var ease = reduceMotion ? 1 : 0.16;
    cx += (x - cx) * ease;
    cy += (y - cy) * ease;
    var w = cursor.offsetWidth, h = cursor.offsetHeight;
    var left = cx + 28 + w > window.innerWidth - 16 ? cx - 28 - w : cx + 28;
    cursor.style.transform = 'translate3d(' + left + 'px,' + (cy - h / 2) + 'px,0)';
    if (active || Math.abs(x - cx) > 0.5 || Math.abs(y - cy) > 0.5) rafId = requestAnimationFrame(loop);
    else rafId = null;
  }
  function track(e) {
    x = e.clientX; y = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(loop);
  }
  function enter(row, e) {
    if (!finePointer.matches) return;
    var src = row.getAttribute('data-img');
    if (cursorImg.getAttribute('src') !== src) cursorImg.setAttribute('src', src);
    if (!active) { cx = x = e.clientX; cy = y = e.clientY; }
    active = true;
    cursor.classList.add('is-visible');
    track(e);
  }
  schemes.forEach(function (row) {
    row.addEventListener('mouseenter', function (e) { enter(row, e); });
    row.addEventListener('mousemove', function (e) { if (active) track(e); else enter(row, e); });
    row.addEventListener('mouseleave', function () {
      active = false;
      cursor.classList.remove('is-visible');
    });
  });
  window.addEventListener('scroll', function () {
    if (active) { active = false; cursor.classList.remove('is-visible'); }
  }, { passive: true });

  /* Register form: show a thank you message */
  var form = document.getElementById('register-form');
  var thanks = document.getElementById('form-thanks');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;
    form.hidden = true;
    thanks.hidden = false;
    thanks.focus();
  });
})();
