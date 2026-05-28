/* ===========================================================
   CakeNest Master — interactions
   =========================================================== */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // Render all Lucide icons
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }

    initHeader();
    initMobileMenu();
    initStatCountUp();
  });

  /* ---------- Stat count-up (animate once on scroll) ---------- */
  function initStatCountUp() {
    var grid = document.getElementById('stat-grid');
    if (!grid) return;
    var nums = grid.querySelectorAll('.stat-num');

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var animate = function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduce) { el.textContent = target.toLocaleString('en-IN') + suffix; return; }

      var duration = 1600;
      var start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        var val = Math.round(eased * target);
        el.textContent = val.toLocaleString('en-IN') + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      nums.forEach(animate);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          nums.forEach(animate);
          io.disconnect();
        }
      });
    }, { threshold: 0.35 });
    io.observe(grid);
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  function initHeader() {
    var header = document.getElementById('header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile hamburger menu ---------- */
  function initMobileMenu() {
    var btn = document.getElementById('hamburger');
    var panel = document.getElementById('mobile-panel');
    if (!btn || !panel) return;

    var close = function () {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
    };
    var open = function () {
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close menu');
    };

    btn.addEventListener('click', function () {
      if (panel.hidden) { open(); } else { close(); }
    });

    // Close on link click + on Escape
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { close(); btn.focus(); }
    });
  }
})();
