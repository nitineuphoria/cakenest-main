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
  });
})();
