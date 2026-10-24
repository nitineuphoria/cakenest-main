"""Build the CakeNest main site (cakenest.in).

  python3 build.py            -> public/   production site for Cloudflare Pages (clean URLs, SEO files, redirects)
  python3 build.py artifact   -> dist/     claude.ai artifact preview (relative .html links)

Edit the source in src/ (pages, site.css, site.js, partials.py) and assets/img, then rebuild.
"""
import re, pathlib, shutil, sys, json, datetime
ROOT = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'src'))
from partials import icon, IC, nav, brands, words, cta, footer

SITE = 'https://www.cakenest.in'
PAGES = ['index', 'about', 'impact', 'programs', 'stories', 'partner', 'join', 'careers']
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wdth,wght@0,75..125,200..900;1,75..125,200..900&family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@400;500&display=swap">\n')
CSS = (ROOT / 'src/site.css').read_text()
JS = (ROOT / 'src/site.js').read_text()
RESET = ':root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}'

ORG_SCHEMA = {
    "@context": "https://schema.org", "@type": "Organization", "name": "CakeNest", "url": SITE,
    "logo": SITE + "/assets/img/logo-ink.png",
    "description": "A women-led movement helping India's home bakers learn, showcase, earn and build businesses from home.",
    "sameAs": ["https://www.instagram.com/cakenest.in/"],
    "contactPoint": {"@type": "ContactPoint", "telephone": "+91-88377-59003", "email": "help@cakenest.in", "contactType": "customer support", "areaServed": "IN"},
}

# Old WordPress URLs on cakenest.in -> closest new page (301). Paths are matched with and without a trailing slash.
OLD_REDIRECTS = {
    '/blog': '/stories', '/explore': '/stories', '/category/homebaker': '/stories',
    '/category/workshop_events': '/programs', '/category/bakery-supplies': '/partner', '/category/florists': '/partner',
    '/add-listing': '/join', '/my-account': '/join', '/post-category': '/', '/post-tag': '/', '/feed': '/', '/comments': '/',
    '/how-to-make-custom-cookies': '/programs', '/top-7-desserts-for-holi-season': '/programs',
    '/best-fluffy-japanese-cheesecake-recipe': '/programs', '/common-cake-mistakes-to-avoid': '/programs',
    '/how-to-make-cinnamon-rolls': '/programs', '/how-to-make-condensed-milk-at-home': '/programs',
    '/8-ways-to-decorate-cakes': '/programs', '/how-to-make-immunity-boosting-desserts': '/programs',
    '/how-to-make-moist-and-fluffy-cupcakes': '/programs', '/7-tips-every-cake-photographer-must-know-about': '/programs',
    '/how-to-grow-a-home-bakery': '/impact', '/how-home-bakers-are-turning-their-passion-into-business': '/impact',
    '/wp-admin': '/', '/wp-login.php': '/',
}

HEADERS = """/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/assets/*
  Cache-Control: public, max-age=2592000
"""

def render(path):
    src = path.read_text()
    meta = dict(re.findall(r'<!--(\w+): (.*?)-->', src))
    body = re.sub(r'<!--\w+: .*?-->\n', '', src)
    body = body.replace('{{nav}}', nav(meta.get('active', '')))
    body = body.replace('{{brands}}', brands()).replace('{{words}}', words()).replace('{{footer}}', footer())
    body = re.sub(r'\{\{cta:?([^}]*)\}\}', lambda m: cta(*m.group(1).split('|')) if m.group(1) else cta(), body)
    body = body.replace('{{ic}}', IC)
    body = re.sub(r'\{\{i:(\w+)\}\}', lambda m: icon(m.group(1)), body)
    assert '{{' not in body, re.findall(r'\{\{.*?\}\}', body)[:3]
    return meta, body

def clean_links(html):
    """about.html -> /about, index.html -> /, keep #hash; relative assets -> root-absolute."""
    def rep(m):
        name, hsh = m.group(1), m.group(2) or ''
        return 'href="' + ('/' if name == 'index' else '/' + name) + hsh + '"'
    html = re.sub(r'href="(\w+)\.html(#[\w-]+)?"', rep, html)
    return html.replace('src="assets/', 'src="/assets/').replace('href="assets/', 'href="/assets/')

def page_url(name):
    return SITE + ('/' if name in ('index',) else '/' + name)

def prod_doc(name, meta, body):
    title = meta.get('deploytitle', meta['title'])
    desc = meta['desc']
    url = page_url(name)
    head = [
        '<!doctype html>', '<html lang="en-IN">', '<head>', '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        f'<title>{title}</title>', f'<meta name="description" content="{desc}">',
        f'<link rel="canonical" href="{url}">',
        '<meta name="theme-color" content="#FFFFFF">',
        '<link rel="icon" type="image/png" href="/assets/img/favicon.png">',
        '<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">',
        '<meta property="og:type" content="website">', '<meta property="og:site_name" content="CakeNest">',
        f'<meta property="og:title" content="{title}">', f'<meta property="og:description" content="{desc}">',
        f'<meta property="og:url" content="{url}">', f'<meta property="og:image" content="{SITE}/assets/img/og.jpg">',
        '<meta property="og:locale" content="en_IN">', '<meta name="twitter:card" content="summary_large_image">',
    ]
    if name in ('404', 'admin'):
        head = [h for h in head if 'canonical' not in h and 'og:url' not in h] + ['<meta name="robots" content="noindex">']
    if name == 'index':
        head.append('<script type="application/ld+json">' + json.dumps(ORG_SCHEMA) + '</script>')
    head += [FONTS.strip(), f'<style>{RESET}</style>', f'<style>\n{CSS}</style>', '</head>', '<body>']
    return '\n'.join(head) + '\n' + clean_links(body) + f'\n<script>\n{JS}</script>\n</body>\n</html>\n'

def artifact_doc(name, meta, body):
    if name == 'index':
        return (f'<title>{meta["title"]}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n'
                f'<meta name="description" content="{meta["desc"]}">\n' + FONTS + f'<style>\n{CSS}</style>\n{body}\n<script>\n{JS}</script>\n')
    return ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            f'<title>{meta["title"]}</title>\n<meta name="description" content="{meta["desc"]}">\n' + FONTS +
            f'<style>{RESET}</style>\n<style>\n{CSS}</style>\n</head>\n<body>\n{body}\n<script>\n{JS}</script>\n</body>\n</html>\n')

def build(mode='prod', fonts=None):
    global FONTS
    if fonts: FONTS = fonts
    out = ROOT / ('public' if mode == 'prod' else 'dist' if mode == 'artifact' else mode)
    if out.exists(): shutil.rmtree(out)
    (out / 'assets').mkdir(parents=True)
    shutil.copytree(ROOT / 'assets/img', out / 'assets/img')
    for p in sorted((ROOT / 'src/pages').glob('*.html')):
        name = p.stem
        if mode == 'artifact' and name == '404': continue
        meta, body = render(p)
        doc = artifact_doc(name, meta, body) if mode == 'artifact' else prod_doc(name, meta, body)
        (out / p.name).write_text(doc)
    if mode != 'artifact':
        today = datetime.date.today().isoformat()
        urls = ''.join(f'  <url><loc>{page_url(n)}</loc><lastmod>{today}</lastmod><priority>{"1.0" if n == "index" else "0.8"}</priority></url>\n' for n in PAGES)
        (out / 'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
        (out / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n')
        lines = []
        for src, dst in OLD_REDIRECTS.items():
            lines.append(f'{src} {dst} 301')
            if not src.endswith(('.php', '.html')):
                lines.append(f'{src}/* {dst} 301')
        (out / '_redirects').write_text('# Old WordPress URLs -> new pages\n' + '\n'.join(lines) + '\n')
        (out / '_headers').write_text(HEADERS)
    return out

if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'prod'
    fonts = None
    if mode == 'preview':  # local screenshot preview with locally installed fonts (optional, dev only)
        P = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else None
        if P:
            css = ''
            for f in ['@fontsource-variable/mona-sans/wdth.css', '@fontsource-variable/mona-sans/wdth-italic.css', '@fontsource/instrument-serif/latin-400.css', '@fontsource/instrument-serif/latin-400-italic.css', '@fontsource/geist-mono/latin-400.css', '@fontsource/geist-mono/latin-500.css']:
                fp = P / f
                css += fp.read_text().replace('url(./files/', f'url(file://{fp.parent}/files/').replace("'Mona Sans Variable'", "'Mona Sans'")
            fonts = f'<style>{css}</style>\n'
    out = build(mode, fonts)
    print('built', out.relative_to(ROOT), sorted(x.name for x in out.iterdir()))
