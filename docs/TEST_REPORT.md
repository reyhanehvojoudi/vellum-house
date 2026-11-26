# Final content revision — test report

- PASS: `python tools/check.py` — 23 HTML entry points, all six milestone coordinates for both languages and SVG layouts, three credibility indicators, three contact icons, no automatic journey controls or timer, updated CTA, required inquiry fields and links.
- PASS: `node --check assets/house.js`.
- PASS: `node tools/test-backend.cjs` — 59 isolated API calls, including availability, validation and overlapping reservation protection.
- PASS: 12 critical existing files byte-identical to Vellum-House-Revised.zip, including all backend files, configuration, booking, dashboard and shared styles.
- PASS: original supplied desktop derivative preserved exactly; portrait source remuxed without encoding changes (identical SHA-256 of copied video stream).
- BLOCKED: actual Chromium navigation to local preview returned `net::ERR_BLOCKED_BY_ADMINISTRATOR`. No real browser screenshots or verified pixel measurements. Run `tools/visual-qa.py` locally as described in that file.
- NOT PERFORMED: live booking, Google Calendar/Meet/email integrations or Lighthouse; production unchanged.
- UNVERIFIED: exact one-viewport layout at all sizes, font rendering, video startup, hover/tap and keyboard behavior. Short screens or text enlargement may require natural internal overflow to retain the full supplied copy at readable sizes. Existing fallback font assets remain until approved fonts are installed.

Before publication confirm the three owner-supplied achievement figures and both biographies are accurate and appropriately attributed. The owner should visually review both languages, including the longest journey step and portrait overlays, and verify booking using authorized test data.

## Homepage polish verification
- PASS: 23 HTML entry points and 59 isolated backend API calls; JS syntax checks.
- PASS: root-entry language flag checked with and without saved preferences using a simulated startup environment; footer links removed; founder names and titles checked; three contact grid columns and cover sizing checked statically.
- PASS: both video files and all unmodified backend/booking/dashboard files identical to the preceding ZIP.
- BLOCKED: Chromium local navigation again failed with net::ERR_BLOCKED_BY_ADMINISTRATOR. Actual rendered spacing, autoplay, gate interaction, and viewport fit remain unverified. Longer copy can still require internal scrolling on short screens. No production deployment or live booking was attempted.
- PASS: updated 1000×230 mobile SVG geometry and milestone coordinate assertions for both language pages; both paths are horizontal. Browser rendering of the horizontal labels and exact alignment remains unverified.
