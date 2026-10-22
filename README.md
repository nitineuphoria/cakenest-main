# cakenest.in — CakeNest main site

The public home of CakeNest: a women-led movement helping India's home bakers learn, showcase, earn and scale.
This folder is the single source for **cakenest.in** and is kept separate from Orders (order.cakenest.in),
Pro (cakenestpro.com) and Marketing (marketing.cakenest.in).

## Folder layout
- `public/`  — the built site that is live on cakenest.in. Do not edit by hand; it is regenerated.
- `src/`     — the source: `pages/*.html` (one per page), `site.css`, `site.js`, `partials.py` (nav, footer, shared blocks).
- `assets/img/` — images used by the site.
- `build.py` — builds `public/` from `src/` (Python 3, no packages needed).
- `archive/` — earlier versions (May 2026 prototype, V1, first V2 copy). Not deployed.

## Update the live site
1. Edit files in `src/` (or swap images in `assets/img/`).
2. `python3 build.py`            → rebuilds `public/`
3. `npx wrangler pages deploy`   → uploads `public/` to the Cloudflare Pages project **cakenest-main** (settings in `wrangler.toml`)

## Hosting
- Cloudflare Pages project: `cakenest-main` (account Nitineuphoria@gmail.com), custom domains cakenest.in and www.cakenest.in.
- Main address is **www.cakenest.in** (same as the old WordPress site, so Google's index and visitors' saved links carry over).
  A Cloudflare Redirect Rule ("Root to www") sends cakenest.in/* to https://www.cakenest.in/* with a 301.
- `public/_redirects` sends old WordPress URLs (blog, categories, listings, accounts) to the closest new page.
- `public/_headers` sets security headers and image caching.
- Email DNS (MX, mail.*, SPF/DKIM) is untouched and still served by the Namecheap host.

## Rollback to the old WordPress site
In Cloudflare: delete the "Root to www" redirect rule, remove the two Pages custom domains, then in DNS restore
`cakenest.in  A  198.54.121.188  (Proxied)` and `www.cakenest.in  CNAME  cakenest.in  (Proxied)`.
The WordPress files on the Namecheap server were not changed.

## Forms
Join and Partner forms validate, then open WhatsApp (+91 88377 59003) with the details filled in.
To also store enquiries, set `FORM_ENDPOINT` in `src/site.js` to an endpoint that accepts a JSON POST, then rebuild.

## Image credits
Lifestyle photos from Pexels (free licence, no attribution required): IDs 15675903, 18067562, 8837767, 3983663,
7580821, 7525181, 8837770, 8837749, 7580637, 8853398, 16583022, 39678617.
Cakes: CakeNest marketplace photography. Baker portraits: frames from CakeNest testimonial videos.
