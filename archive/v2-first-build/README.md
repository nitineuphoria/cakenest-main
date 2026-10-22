# CakeNest V2 — women-led ecosystem site

Seven static pages: index (Home), about, impact, programs, stories, partner, join.
Plain HTML with inlined CSS/JS and images in assets/img. No build step needed to host it.
Deploy as static assets on its own Cloudflare project, separate from Orders, Pro and Marketing.

## Editing
The source lives in the session workspace as src/ + build.py; this folder is the built output.
Shared nav and footer are repeated in every page, so change them on all seven pages.

## Forms
Join and Partner forms validate, then open WhatsApp (+91 88377 59003) with the details filled in.
To also store enquiries, set FORM_ENDPOINT in the script at the bottom of each page to a URL that accepts a JSON POST.

## Before going live
- Confirm all numbers (98% women, 5,000+ bakers, 100+ cities, 1.5B+ views, 7.6L+ community, 8+ years).
- Replace og:image with an absolute URL once the domain is live.
- Brand names appear as text; add logos only with each brand's permission.

## Image credits
Lifestyle photos: Pexels (free licence, no attribution required): photo IDs 15675903, 18067562, 8837767,
3983663, 7580821, 7525181, 8837770, 8837749, 7580637, 8853398, 16583022, 39678617.
Cakes: CakeNest marketplace photography. Baker portraits: frames from CakeNest testimonial videos.
