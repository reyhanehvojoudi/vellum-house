# Vellum House V6 — Minimal Website

A bilingual, accessible static site for Vellum House, redesigned from the uploaded GitHub repository on 20 November 2026. It emphasises a single clear proposition and a consistent free-initial-consultation CTA.

## Go live
Read **`docs/GITHUB_UPLOAD_FA.md`** for detailed instructions. GitHub Pages publishes from the repository root. Preserve the two existing Vazirmatn font files from your current repository; they are not duplicated in this distribution.

## Pages
Persian homepage: `index.html`; English homepage: `en.html`; additional bilingual pages: services, approach, pathways, about, resources, contact, privacy, terms. `fa.html` remains a Persian alias.

## Where to edit
- `tools/build.py`: bilingual copy, menus, HTML templates, sitemap, metadata. Regenerate via `python tools/build.py`.
- `assets/style.css`: layout, typography, branding, responsive design.
- `assets/config.js`: live Google Apps Script endpoint and Cal.com link. **The endpoint is configured.**
- `assets/main.js`: enquiry form validation, confirmation receipt and redirect, menu and interactions.
- `backend/Code.gs`: Google Sheets backend and acknowledgement email, separately deployed in Google Apps Script.

The form retains the original required field names, prevents unconfirmed redirect, and retains the existing lead pipeline schema. Changes to `backend/Code.gs` in GitHub **do not** automatically update the Google Apps Script deployment.

## Quality checks
Run `python tools/check.py`, `node --check assets/main.js`, `node --check < backend/Code.gs`, and `node tools/test-backend.cjs`.

## Reviews
- `docs/REVIEW_40_PERSPECTIVES_FA.md`: 40 distinct heuristic perspectives, not real interview participants.
- `docs/GITHUB_UPLOAD_FA.md`: step-by-step deployment, live-endpoint and backend email updates.

## Content and compliance
No synthetic reviews, fabricated team members or guaranteed admission claims. Privacy/terms drafts must be approved for the relevant jurisdiction before handling real user data. Under-18 enquiries should be made by a parent or guardian, with parent/guardian attendance at the consultation.
