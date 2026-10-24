(function(){
  var root = document.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Floating nav: hide on scroll down, show on scroll up ---------- */
  var nav = document.querySelector('.nav'), lastY = window.scrollY, ticking = false;
  function onScroll(){
    var y = window.scrollY;
    if (nav) {
      if (y > 220 && y > lastY + 4) nav.classList.add('is-hidden');
      else if (y < lastY - 4 || y < 220) nav.classList.remove('is-hidden');
    }
    lastY = y; ticking = false;
    parallax(); lit();
  }
  window.addEventListener('scroll', function(){ if (!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, {passive:true});

  /* ---------- Mobile menu ---------- */
  var mm = document.getElementById('mmenu'), mb = document.getElementById('menu-btn');
  if (mm && mb){
    var closeBtn = mm.querySelector('.mmenu-close');
    function setMenu(open){
      mm.classList.toggle('is-open', open);
      mm.setAttribute('aria-hidden', String(!open));
      mb.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) closeBtn.focus(); else mb.focus();
    }
    mb.addEventListener('click', function(){ setMenu(true); });
    closeBtn.addEventListener('click', function(){ setMenu(false); });
    mm.addEventListener('click', function(e){ if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && mm.classList.contains('is-open')) setMenu(false); });
  }

  /* ---------- Rise / mask reveals (elements start visible; below-fold ones get a gentle rise) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-rise],[data-mask]'));
  if (!reduce && 'IntersectionObserver' in window){
    var vh = window.innerHeight;
    revealEls.forEach(function(el){ if (el.getBoundingClientRect().top > vh * 0.92) el.classList.add('pre'); });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.remove('pre'); io.unobserve(en.target); } });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.01});
    revealEls.forEach(function(el){ if (el.classList.contains('pre')) io.observe(el); });
  }

  /* ---------- Parallax images ---------- */
  var pEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  function parallax(){
    if (reduce) return;
    var vh = window.innerHeight;
    pEls.forEach(function(el){
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      var amt = parseFloat(el.getAttribute('data-parallax')) || 40;
      el.style.transform = 'translate3d(0,' + (p * amt).toFixed(1) + 'px,0)';
    });
  }

  /* ---------- Scroll-lit paragraph ---------- */
  var lits = Array.prototype.slice.call(document.querySelectorAll('.lit'));
  lits.forEach(function(el){
    var html = '';
    el.textContent.trim().split(/\s+/).forEach(function(w){ html += '<span class="w">' + w + '</span> '; });
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = html;
    if (reduce) el.classList.add('is-static');
  });
  function lit(){
    if (reduce) return;
    var vh = window.innerHeight;
    lits.forEach(function(el){
      var r = el.getBoundingClientRect();
      var start = vh * 0.88, end = vh * 0.38;
      var p = (start - r.top) / (start - end + r.height * 0.6);
      p = Math.max(0, Math.min(1, p));
      var ws = el.querySelectorAll('.w'), n = Math.round(p * ws.length);
      for (var i = 0; i < ws.length; i++) ws[i].classList.toggle('on', i < n);
    });
  }

  /* ---------- Counters (show final value at rest; count up once when seen) ---------- */
  var nf = new Intl.NumberFormat('en-IN');
  function fmt(v, d){ return d ? v.toFixed(d) : nf.format(Math.round(v)); }
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
  if (!reduce && 'IntersectionObserver' in window){
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, to = parseFloat(el.getAttribute('data-count')), d = parseInt(el.getAttribute('data-dec') || '0', 10);
        var pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '', t0 = null, dur = 1700;
        function step(t){
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(2, -10 * k);
          el.textContent = pre + fmt(to * (k === 1 ? 1 : e), d) + suf;
          if (k < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, {threshold:0.4});
    counters.forEach(function(c){ cio.observe(c); });
  }

  /* ---------- Hero slider ---------- */
  var hero = document.querySelector('.hero');
  if (hero){
    var slides = hero.querySelectorAll('.slide'), tabs = hero.querySelectorAll('.hero-tab'), cur = 0, dur = 7000;
    hero.style.setProperty('--dur', dur + 'ms');
    function go(i){
      cur = (i + slides.length) % slides.length;
      slides.forEach(function(s, k){ s.classList.toggle('is-active', k === cur); s.setAttribute('aria-hidden', String(k !== cur)); });
      tabs.forEach(function(t, k){
        t.classList.remove('is-active'); t.setAttribute('aria-selected', String(k === cur));
        if (k === cur){ void t.offsetWidth; t.classList.add('is-active'); }
      });
    }
    tabs.forEach(function(t, k){
      t.addEventListener('click', function(){ go(k); });
      var bar = t.querySelector('i');
      bar.addEventListener('animationend', function(){ if (k === cur) go(cur + 1); });
    });
    document.addEventListener('visibilitychange', function(){ hero.classList.toggle('is-paused', document.hidden); });
    go(0);
  }

  /* ---------- Rotating word ---------- */
  document.querySelectorAll('.rotator').forEach(function(r){
    var track = r.querySelector('.rotator-track'), items = track.children, i = 0;
    function size(){ r.style.width = items[i].getBoundingClientRect().width + 'px'; }
    function next(){
      i = (i + 1) % items.length;
      track.style.transform = 'translateY(' + (-i * 1.06) + 'em)';
      size();
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size); else size();
    window.addEventListener('resize', size);
    if (!reduce) setInterval(function(){ if (!document.hidden) next(); }, 2800);
  });

  /* ---------- Carousels ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function(c){
    var track = c.querySelector('.track'), prev = c.querySelector('[data-prev]'), next = c.querySelector('[data-next]'), bar = c.querySelector('.progress i');
    function step(){ var card = track.querySelector('.pcard'); return card ? card.getBoundingClientRect().width + 16 : 300; }
    function update(){
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 4;
      if (next) next.disabled = track.scrollLeft >= max - 4;
      if (bar){
        var vis = track.clientWidth / track.scrollWidth;
        bar.style.width = (vis * 100) + '%';
        bar.style.transform = 'translateX(' + ((max > 0 ? track.scrollLeft / max : 0) * (1 / vis - 1) * 100) + '%)';
      }
    }
    if (prev) prev.addEventListener('click', function(){ track.scrollBy({left:-step(), behavior: reduce ? 'auto' : 'smooth'}); });
    if (next) next.addEventListener('click', function(){ track.scrollBy({left:step(), behavior: reduce ? 'auto' : 'smooth'}); });
    track.addEventListener('scroll', function(){ requestAnimationFrame(update); }, {passive:true});
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Programs page: highlight section in side nav ---------- */
  var pnav = document.querySelectorAll('.prog-nav a');
  if (pnav.length && 'IntersectionObserver' in window){
    var pio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting){
          pnav.forEach(function(a){ a.classList.toggle('is-on', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, {rootMargin:'-40% 0px -55% 0px'});
    document.querySelectorAll('.prog[id]').forEach(function(s){ pio.observe(s); });
  }

  /* ---------- Forms: validate, then hand off to WhatsApp ---------- */
  var WA = '918837759003';
  // When live on cakenest.in, set this to a form API (e.g. a Cloudflare Worker) to also store enquiries.
  var FORM_ENDPOINT = '';
  function setErr(el, msg){
    var f = el.closest('.field'); if (!f) return;
    f.classList.toggle('bad', !!msg);
    var e = f.querySelector('.err'); if (e) e.textContent = msg || '';
  }
  function validate(form){
    var first = null;
    form.querySelectorAll('input[required],select[required],textarea[required]').forEach(function(el){
      var v = el.value.trim(), msg = '';
      if (!v) msg = el.tagName === 'SELECT' ? 'Please choose one.' : (el.getAttribute('data-msg') || 'Please fill this in.');
      else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Please check the email address.';
      else if (el.type === 'tel' && v.replace(/\D/g, '').length < 10) msg = 'Please enter a 10-digit number.';
      setErr(el, msg); if (msg && !first) first = el;
    });
    form.querySelectorAll('input[type="tel"]:not([required])').forEach(function(el){
      var v = el.value.trim(), msg = (v && v.replace(/\D/g, '').length < 10) ? 'Please enter a 10-digit number, or leave it empty.' : '';
      setErr(el, msg); if (msg && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }
  function copyText(text, btn, holder){
    var label = btn.textContent;
    function ok(){ btn.textContent = 'Copied'; setTimeout(function(){ btn.textContent = label; }, 1600); }
    function fallback(){
      if (holder){ var r = document.createRange(); r.selectNodeContents(holder); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      btn.textContent = 'Selected, press copy'; setTimeout(function(){ btn.textContent = label; }, 2200);
    }
    try { navigator.clipboard.writeText(text).then(ok, fallback); } catch (e) { fallback(); }
  }
  document.querySelectorAll('form[data-kind]').forEach(function(form){
    var card = form.closest('.fcard'), body = card.querySelector('.form-body'), done = card.querySelector('.done');
    form.addEventListener('input', function(e){ if (e.target.closest('.field.bad')) setErr(e.target, ''); });
    form.addEventListener('change', function(e){ if (e.target.closest('.field.bad')) setErr(e.target, ''); });
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!validate(form)) return;
      var kind = form.getAttribute('data-kind'), fields = {}, lines = [];
      form.querySelectorAll('[data-label]').forEach(function(el){
        var v;
        if (el.tagName === 'FIELDSET') v = Array.prototype.slice.call(el.querySelectorAll('input:checked')).map(function(i){ return i.value; }).join(', ');
        else v = el.value.trim();
        fields[el.name || el.id] = v;
        if (v) lines.push(el.getAttribute('data-label') + ': ' + v);
      });
      var intro = kind === 'brand' ? 'Hello CakeNest, a brand collaboration enquiry:' : 'Hello CakeNest, I would like to start my journey with you.';
      var text = intro + '\n\n' + lines.join('\n');
      var name = (form.querySelector('[name="name"]') || {}).value || '';
      done.querySelector('[data-fill="name"]').textContent = name.trim().split(' ')[0] || 'there';
      done.querySelector('pre').textContent = text;
      done.querySelector('[data-fill="wa"]').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text);
      body.hidden = true; done.hidden = false; done.focus();
      if (FORM_ENDPOINT){ try { fetch(FORM_ENDPOINT, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({kind:kind, fields:fields, submittedAt:new Date().toISOString()})}).catch(function(){}); } catch (err) {} }
    });
    done.querySelector('[data-edit]').addEventListener('click', function(){ done.hidden = true; body.hidden = false; form.querySelector('input').focus(); });
    done.querySelector('[data-copy]').addEventListener('click', function(e){ copyText(done.querySelector('pre').textContent, e.currentTarget, done.querySelector('pre')); });
  });

  /* Preselect a need on the join form from ?need-like hash tokens (#learn, #grow ...) */
  var needMap = {learn:'Learn a skill', upgrade:'Upgrade my skills', showcase:'Grow on Instagram', earn:'Get more orders', run:'Manage my bakery better', scale:'Open a studio, bakery or café'};
  var sel = document.getElementById('j-need');
  if (sel){
    var h = (location.hash || '').replace('#', '');
    if (needMap[h]) for (var k = 0; k < sel.options.length; k++) if (sel.options[k].text === needMap[h]) sel.selectedIndex = k;
  }

  onScroll();
  window.addEventListener('resize', function(){ parallax(); lit(); });
})();

/* ---------- CMS content loader ---------- */
(function(){
  var els = [].slice.call(document.querySelectorAll('[data-cn]'));
  if (!els.length) return;
  fetch('/api/content').then(function(r){ return r.json(); }).then(function(d){
    var c = d.content || {};
    els.forEach(function(el){
      var v = c[el.dataset.cn];
      if (!v) return;
      if (el.tagName === 'IMG') {
        el.src = (v[0]==='/'||v.slice(0,4)==='http') ? v : '/assets/img/'+v+'.webp';
      } else if (el.tagName==='H1'||el.tagName==='H2'||el.tagName==='H3') {
        el.innerHTML = v.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/\*([^*]+)\*/g,'<span class="serif">$1</span>');
      } else {
        el.textContent = v;
      }
    });
  }).catch(function(){});
})();
