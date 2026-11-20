# Vellum House V8 — change log

- Replaced multi-page, scrolling educational site with one viewport-bound interactive experience.
- Added initial English | فارسی language choice, retained for the browser tab session, with manual language switch in the header.
- Designed original editorial dark-navy-and-gold atlas artwork using lightweight SVG and CSS contour geometry; 5 clickable educational milestones and animated moving route.
- Added five full-screen chapters reached via the compact menu or previous/next buttons: student journey, approach, founders, verified evidence placeholders, consultation.
- Restored circular VH mark with VELLUM HOUSE / PRIVATE ACADEMIC MANAGEMENT wordmark.
- Added dedicated editorial founder portrait slots and specialist network area, with clearly marked placeholders instead of invented headshots.
- Added spaces for authenticated outcomes and consented testimonials, without fabricated claims.
- Ensured persistent desktop consultation CTA and mobile floating CTA in all exploration views; the consultation form itself supplies the CTA on the final view.
- Made the small-screen enquiry a two-step guided interaction; the body never scrolls to another section.
- Preserved the supplied Google Apps Script `/exec` endpoint and current Cal.com `/consultation` URL; enquiry success requires a backend UUID receipt.
- Made old marketing URLs redirect to the appropriate in-app chapter, including legacy privacy and terms URLs opening legal overlays.
- Implemented keyboard focus states, `aria-live` feedback, semantic dialogs, reduced-motion support and back/forth stage controls.
- Included new deployment instructions and browser/backend test scripts.
