# Vellum House V7.1 — The Interactive Atlas

A complete bilingual (Persian-first) static website ready for GitHub Pages. The experience is built around an interactive five-stage educational journey, inspired by the **explore-by-doing storytelling approach** seen in ScreenSpace showcases (not a copy of their branding, assets, or effects).

## Key files
- `index.html`: Persian homepage (canonical); `en.html`: English homepage; `fa.html`: Persian alias.
- `approach-fa.html` / `approach.html`: full interactive atlas in both languages.
- `contact-fa.html` / `contact.html`: enquiry forms with the original Google Sheets workflow.
- `assets/style.css`: responsive navy-and-gold visual system, illustrations, interactive states and animations.
- `assets/main.js`: five-stop interaction, motion marker, scroll progress, reveal effects, keyboard controls, mobile navigation, enquiry form validation and redirect.
- `assets/config.js`: configured Google Apps Script Web app `/exec` endpoint and `https://cal.com/vhouse/consultation`.
- `backend/Code.gs`: optional Google Apps Script backend update for the automatic acknowledgement email. Uploading it to GitHub does not update a live Apps Script deployment.
- `docs/START_HERE_FA.md`: Persian launch guide.
- `docs/INTERACTIVE_EXPERIENCE.md`: interaction and accessibility details.

## Brand and user experience
Restored original V/H mark and **VELLUM HOUSE / PRIVATE ACADEMIC MANAGEMENT** wordmark. Navy and antique gold lead the visual composition. Visitors choose one of five meaningful stops on an atlas; animated route, glowing traveler, chapter controls and detailed information respond instantly to their choices. CTA is persistently available in the desktop header and mobile bottom bar. Scroll-to-top button appears once scrolling.

The Persian CTA is **درخواست جلسه مشاوره رایگان اولیه**, exactly as specified. Technical education acronyms are not presented without explanation. Portraits, outcomes and testimonials are *clearly identified as empty content areas*: no false quotes, results, credentials, or photos have been fabricated.

## QA and deployment
Run from this directory:

```
python tools/check.py
node --check assets/main.js
node --check < backend/Code.gs
node tools/test-backend.cjs
```

The interactive components were exercised in Chromium from in-memory local pages, including 320, 390, 768 and 1440px viewports. **The live GitHub/Google Sheets/Cal.com integration has not been tested**; that requires a post-deployment form submission.

**Warning about legacy source generator:** `tools/build.py` predates this V7 visual redesign. The deployed HTML files are the source of truth for this release. Do not run the old builder on these files or it may overwrite the interactive design. Edit the current HTML, CSS and JS directly until the generator is migrated to V7.

## Privacy
The Google Sheet remains restricted and the Web app endpoint is a public form submission URL, not a credential. Do not put secrets into `config.js`. Review privacy/terms and guardian-consent language before use with minors. Cal.com booking status is not automatically reconciled with the Sheet.
