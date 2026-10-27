# CakeNest main site — www.cakenest.in

Static site, built with plain Python (no packages) and hosted on Cloudflare Pages (project `cakenest-main`).

## Where to edit
- Edit only `src/` and `assets/img/`. Never hand-edit `public/` — `python3 build.py` regenerates it.
- `src/pages/*.html` — one file per page (index, about, impact, programs, stories, partner, join, careers, privacy, terms, admin, 404).
  Front matter at the top: `<!--title: ...-->`, `<!--deploytitle: ...-->`, `<!--desc: ...-->`, `<!--active: ...-->`.
- `src/partials.py` — shared blocks: nav, footer, brand strip, word marquee, closing CTA, icons.
  Placeholders in pages: `{{nav}}`, `{{footer}}`, `{{brands}}`, `{{words}}`, `{{cta}}` or `{{cta:image-name|alt text}}`, `{{ic}}` (arrow chip), `{{i:icon-name}}`.
- `src/site.css` — whole design system. `src/site.js` — nav, slider, reveals, counters, carousels, forms.
- In `src`, link pages as `about.html`, `join.html#learn`; the build turns them into `/about`, `/join#learn`.
- New page: add `src/pages/<name>.html`, add `<name>` to `PAGES` in `build.py` (sitemap) and to the nav in `partials.py`.
- Old WordPress URLs → new pages: `OLD_REDIRECTS` in `build.py` (written to `public/_redirects`).
- `functions/` — Cloudflare Pages Functions (careers API, admin API). Shared security code lives in `lib/` (outside `functions/` so it never becomes a route).
- Business details for /privacy and /terms: `LEGAL` in `build.py` (pages use `{{legal:key}}`). The live build refuses to run while any is blank.

## Security (do not weaken)
- `/admin` and `/api/admin/*` sit behind Cloudflare Access (Zero Trust → Access → Applications, one-time code to approved emails).
  `functions/api/admin/_middleware.js` also verifies the Access token (`ACCESS_TEAM_DOMAIN`, `ACCESS_AUD` in `wrangler.toml`), then the admin password token. Fails closed.
- Careers form: Cloudflare Turnstile. Site key = `TURNSTILE_SITEKEY` in `build.py`; secret = `TURNSTILE_SECRET_KEY` (set with `npx wrangler pages secret put TURNSTILE_SECRET_KEY`, never in code).
  CVs are checked by their real file signature (PDF/DOC/DOCX), stored under safe names, and deleted after 12 months (see /privacy).
- Local dev (`localhost`) skips Access and Turnstile so you can test; production never does.
- Never commit `.dev.vars` or any secret.

## Brand rules
- White / warm grey (#F6F4F0) base, ink #15130F, gold #C9973F / #8A6424. Fonts: Mona Sans, Instrument Serif italic for accent words, Geist Mono for small labels.
- Lots of breathing space, little text, real photography only (no AI images). Images as .webp, max ~1600px wide for full-bleed, ~900px for cards.
- Women-empowerment framing. Only verified claims and numbers (source: marketing.cakenest.in).
- Main address is `https://www.cakenest.in` (`SITE` in `build.py`). Keep it on www — a Cloudflare rule redirects cakenest.in to www.

## Workflow for every change
1. Edit files in `src/` (or images in `assets/img/`).
2. `python3 build.py`
3. Preview: `npx wrangler pages dev public` → http://localhost:8788 (clean URLs and redirects work here).
4. Check desktop and a 390px-wide mobile view: no horizontal scroll, no console errors, images load.
5. `git add -A && git commit -m "<what changed>"`
6. Deploy: `npx wrangler pages deploy --branch=main` (first time only: `npx wrangler login`).
7. Open https://www.cakenest.in and confirm the change is live.

## Never from this folder
- Change Cloudflare DNS, email records, redirect rules or other zones.
- Touch the other CakeNest projects (Orders, Pro, Marketing).
- Deploy without building and previewing first.

Hosting, DNS and rollback details: see README.md.
