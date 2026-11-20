# V8 Quality Assurance and Open Items

## Verified locally

- JavaScript source syntax: `node --check assets/experience.js` — passed.
- Google Apps Script mock integration: `node tools/test-backend.cjs` — passed saving, validation, duplicate detection, two outgoing messages, private receipt, formula safety.
- Browser tests using isolated in-memory Chromium: initial language dialog, bilingual rendering, all five interactive atlas destinations, mobile menu, founder cards, consultation form, privacy overlay and mobile two-step enquiry — passed.
- At 1440×900, 390×844, 320×640, 768×1024 and 1280×720 in both languages, document scroll width matched viewport width and document scroll height matched viewport height. No horizontal overflow or body-level scrolling was observed.
- Viewports shorter than typical phones can have **internal** consultation-panel scrolling to keep controls reachable instead of clipping forms.
- Design respects reduced-motion preference and uses keyboard-focusable buttons, dialog labels and live regions for form feedback.

## Must verify after actual GitHub deployment

- The precise appearance with your repo's **existing** licensed Persian fonts (font files not distributed in this package).
- End-to-end external submission from HTTPS `vhouse.ir` to the private Google Sheet via the supplied Apps Script `/exec` endpoint, successful receipt confirmation, Gmail notifications and Cal.com navigation.
- Cal.com/Google Meet calendar availability and creation of a real test booking.
- Final legal review of privacy/terms copy, and replacing founder/result/testimonial placeholders with approved material.

## Implementation considerations

The whole marketing experience is a JavaScript-powered one-screen application, using hashes for in-place sections. JS is required for interaction. Metadata, canonical and language alternates are included, but the dynamically rendered main content should be checked for search indexing in Google Search Console after publication. The static fallback gives an email address for people with JS disabled.

This is not a live website deployment. No connected account was modified. No genuine payment, reservation or family enquiry was submitted in local testing.
