# CakeNest ecosystem homepage

The main cakenest.in homepage: India's No. 1 home-baker platform, the Learn / Earn / Grow / Run / Scale ecosystem, the A-to-Z journey, baker stories, and enquiry forms for bakers and brands.

A plain static site: `index.html` plus `assets/img/`. No build step. Deploy it as static assets on Cloudflare (Pages, or a Worker with static assets) on its own project, kept separate from the Orders, Pro and Marketing infrastructure.

## Themes
Light and dark themes share one token set at the top of the stylesheet. The page follows the visitor's system setting until they use the sun/moon toggle in the header; their choice is remembered in localStorage (`cn-theme`).

## Forms
Both forms (brand collaboration and "Start your journey") validate in the browser, then hand the visitor a prefilled WhatsApp message to +91 88377 59003.
To also store enquiries, set `FORM_ENDPOINT` at the top of the script in `index.html` to a URL that accepts a JSON POST
(`{ kind: "brand" | "baker", fields: {...}, submittedAt }`), for example a small Cloudflare Worker that writes to D1 or emails help@cakenest.in.

## Before going live
- Confirm the numbers in the stats ledger (taken from marketing.cakenest.in on 19 Oct 2026, years set to 8+).
- Replace `og:image` with an absolute URL (https://cakenest.in/assets/img/og.jpg) once the domain is live.
- The Academy has no site yet, so its links open the join form with "Learn baking" preselected.

## Image sources
- Scenes (hero baker, online class, studio owner, workshop, packing, brand kit, young and senior bakers, phone): generated with ChatGPT for CakeNest.
- Cakes: CakeNest marketplace photography (cakenest-platform/public/images).
- Baker portraits: frames from the testimonial videos on marketing.cakenest.in/testimonials.
