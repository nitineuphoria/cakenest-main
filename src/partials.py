S = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{}</svg>'
ICONS = {
  'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrowUR': '<path d="M7 17 17 7M8 7h9v9"/>',
  'left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  'plus': '<path d="M12 5v14M5 12h14"/>',
  'menu': '<path d="M4 9h16M4 15h16"/>',
  'close': '<path d="M6 6l12 12M18 6 6 18"/>',
  'play': '<path d="M7 4.5v15l13-7.5z" fill="currentColor" stroke="none"/>',
  'check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  'book': '<path d="M3 5.5A1.5 1.5 0 0 1 4.5 4H10a2 2 0 0 1 2 2v14a1.5 1.5 0 0 0-1.5-1.5h-6A1.5 1.5 0 0 1 3 17V5.5z"/><path d="M21 5.5A1.5 1.5 0 0 0 19.5 4H14a2 2 0 0 0-2 2v14a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 0 21 17V5.5z"/>',
  'trend': '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  'camera': '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  'rupee': '<path d="M7 4h11M7 8.5h11"/><path d="M11 4c3.2 0 5 1.7 5 4.5S14.2 13 11 13H7l8.5 7"/>',
  'dash': '<rect x="3" y="3" width="7.5" height="9" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="5" rx="1.5"/><rect x="13.5" y="11" width="7.5" height="10" rx="1.5"/><rect x="3" y="15" width="7.5" height="6" rx="1.5"/>',
  'store': '<path d="M4 10v10h16V10"/><path d="M3 10l2-6h14l2 6"/><path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M10 20v-5h4v5"/>',
  'heart': '<path d="M12 20s-7.5-4.6-9-9.3C2 7.4 4.2 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.8 1.1-1.7 2.7-2.8 4.7-2.8 3.1 0 5.3 2.9 4.3 6.2-1.5 4.7-9 9.3-9 9.3z"/>',
  'users': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  'shield': '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5-4.3-1.3-7.5-4.9-7.5-9.5V6L12 3z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
  'sprout': '<path d="M12 21v-8"/><path d="M12 13c0-4-3-7-8-7 0 4 3 7 8 7z"/><path d="M12 13c0-3 2.2-6 7-6 0 3.5-2.5 6-7 6z"/>',
  'spark': '<path d="M12 2c.8 5.6 4.4 9.2 10 10-5.6.8-9.2 4.4-10 10-.8-5.6-4.4-9.2-10-10 5.6-.8 9.2-4.4 10-10z" fill="currentColor" stroke="none"/>',
  'megaphone': '<path d="M3 10v4a1 1 0 0 0 1 1h2l5 4V5L6 9H4a1 1 0 0 0-1 1z"/><path d="M15 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"/>',
  'gift': '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12"/><path d="M12 8S10.5 3.5 8 4.5 9 8 12 8zm0 0s1.5-4.5 4-3.5S15 8 12 8z"/>',
  'box': '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  'calendar': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  'link': '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
  'home': '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  'grad': '<path d="M2 9l10-5 10 5-10 5-10-5z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/>',
  'briefcase': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
  'wallet': '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="15" r="1.2" fill="currentColor"/>',
  'person': '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  'key': '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
  'pin': '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
}
def icon(n): return S.format(ICONS[n])
IC = '<span class="ic" aria-hidden="true">' + icon('arrowUR') + icon('arrowUR') + '</span>'

PAGES = [('about.html','About','about'),('impact.html','Impact','impact'),('programs.html','Programs','programs'),('stories.html','Stories','stories'),('partner.html','Partners','partner'),('careers.html','Careers','careers')]

def nav(active):
    links = ''.join('<a href="{}"{}>{}</a>'.format(h, ' aria-current="page"' if k == active else '', t) for h, t, k in PAGES)
    mlinks = ''.join('<a href="{}"><small>0{}</small>{}</a>'.format(h, i + 1, t) for i, (h, t, k) in enumerate([('index.html','Home','home')] + PAGES))
    return f'''<header class="nav" aria-label="Main">
  <a class="nav-logo" href="index.html" aria-label="CakeNest home"><img src="assets/img/logo-ink.png" alt="CakeNest" width="540" height="101"></a>
  <nav class="nav-links" aria-label="Primary">{links}</nav>
  <a class="btn btn--dark nav-cta" href="join.html">Join the movement {IC}</a>
  <button class="menu-btn" id="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mmenu">{icon('menu')}</button>
</header>
<div class="mmenu" id="mmenu" aria-hidden="true">
  <button class="mmenu-close" type="button" aria-label="Close menu">{icon('close')}</button>
  <nav aria-label="Mobile">{mlinks}</nav>
  <div style="display:grid; gap:10px">
    <a class="btn btn--dark" href="join.html" style="justify-content:space-between">Join the movement {IC}</a>
    <a class="btn btn--line" href="partner.html" style="justify-content:space-between">Partner with us {IC}</a>
  </div>
</div>'''

def brands():
    names = ['Tata','Yes Bank','Salesforce','Big FM','Google','YouTube','<em>IPL players</em>','<em>Ministers</em>','<em>RJs &amp; VJs</em>']
    row = ''.join(f'<span class="brand-item">{n}</span>' for n in names)
    return f'''<section class="brands" aria-label="Brands we have worked with">
  <div class="wrap"><p>Brands, stars and leaders who have worked with CakeNest</p></div>
  <div class="marquee" style="--speed:46s"><div class="marquee-track">{row}<span aria-hidden="true" style="display:contents">{row}</span></div></div>
</section>'''

def words():
    ws = ['Learn','Upgrade','Showcase','Earn','Scale']
    row = ''.join(f'<span class="word-item">{w}{icon("spark")}</span>' for w in ws)
    return f'''<section class="words" aria-label="Learn, upgrade, showcase, earn, scale">
  <div class="marquee" style="--speed:34s"><div class="marquee-track">{row}<span aria-hidden="true" style="display:contents">{row}</span></div></div>
</section>'''

def cta(img='meeting-smile', alt='A smiling woman during a planning session'):
    return f'''<section class="section--tight">
  <div class="wrap">
    <div class="cta">
      <div class="cta-img" data-mask>
        <img src="assets/img/{img}.webp" alt="{alt}" loading="lazy" width="1500" height="1000">
        <h3>Be the reason a home kitchen becomes a <span class="serif">business.</span></h3>
      </div>
      <div class="cta-card" data-rise>
        <div>
          <span class="tag tag--dark">Join the movement</span>
          <strong data-count="5000" data-suf="+">5,000+</strong>
          <p>home bakers across 100+ cities already grow with CakeNest. Most of them started exactly where you are.</p>
        </div>
        <div class="btns">
          <a class="btn btn--gold" href="join.html">Start your journey {IC}</a>
          <a class="btn btn--glass" href="partner.html">Partner with us {IC}</a>
        </div>
      </div>
    </div>
  </div>
</section>'''

def footer():
    return f'''<footer class="footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <img src="assets/img/logo-cream.png" alt="CakeNest" width="540" height="101" loading="lazy">
        <h3>Helping India's women turn a skill into a <span class="serif">livelihood.</span></h3>
        <div class="row"><a class="btn btn--gold" href="join.html">Join the movement {IC}</a></div>
      </div>
      <div>
        <h4>Explore</h4>
        <ul><li><a href="about.html">About us</a></li><li><a href="impact.html">Our impact</a></li><li><a href="programs.html">Programs</a></li><li><a href="stories.html">Stories</a></li><li><a href="partner.html">Partner with us</a></li><li><a href="careers.html">Careers</a></li></ul>
      </div>
      <div>
        <h4>Ecosystem</h4>
        <ul><li><a href="programs.html#learn">CakeNest Academy</a></li><li><a href="https://order.cakenest.in" target="_blank" rel="noopener">CakeNest Orders ↗</a></li><li><a href="https://marketing.cakenest.in" target="_blank" rel="noopener">CakeNest Marketing ↗</a></li><li><a href="https://cakenestpro.com" target="_blank" rel="noopener">CakeNest Pro ↗</a></li><li><a href="programs.html#scale">Studio services</a></li></ul>
      </div>
      <div>
        <h4>Contact</h4>
        <ul><li><span>+91 88377 59003</span></li><li><span>help@cakenest.in</span></li><li><a href="https://instagram.com/cakenest.in" target="_blank" rel="noopener">Instagram ↗</a></li><li><a href="https://wa.me/918837759003" target="_blank" rel="noopener">WhatsApp ↗</a></li></ul>
      </div>
    </div>
    <div class="footer-base"><span>© 2026 CakeNest. All rights reserved. <a href="privacy.html">Privacy Policy</a> <a href="terms.html">Terms of Use</a></span><span>98% women. 100+ cities. One movement.</span></div>
  </div>
  <div class="footer-mark" aria-hidden="true">cakenest</div>
</footer>'''
