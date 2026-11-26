# Revision 2 — verification

| Test | Result |
|---|---|
| Static site checks | PASS — 23 HTML entry points; required fields, routes, 6 milestones, 2 founder overlays, linked assets, responsive portrait media |
| JavaScript syntax | PASS — changed house.js checked with Node |
| Golden Path geometry | PASS — six cubic endpoints match all six static node positions for both SVG variants and both languages; animation now paints actual per-segment paths |
| Backend isolated regression | PASS — 59 API calls, including booking conflict protection and validation |
| Preservation | PASS — 12 critical files byte-identical to prior release (backend, config, booking, education, calendar API, admin scripts/page, shared CSS, desktop film) |
| New mobile film metadata | PASS — source 720×1280, delivered 540×960, full 24.033333 s, 1,465,819 bytes |
| Actual browser visual checks | BLOCKED — Chromium http://127.0.0.1:8765/en.html returned net::ERR_BLOCKED_BY_ADMINISTRATOR |
| Actual pixel alignment, viewport fit, overlay and responsive video interaction | UNVERIFIED — run updated tools/visual-qa.py and inspect manually |
| Actual selected font rendering | UNVERIFIED — fonts not supplied; fallbacks remain |
| Live Google integrations and Lighthouse | NOT PERFORMED — no production writes authorized; no browser metrics |

Before publication: open both languages locally and check home, journey, About Us and contact on typical phones and desktops; test actual video startup, portrait/landscape selection, all six path endpoints and no overshoot, hover/tap/keyboard biography interaction and compact header. Check that normal cinematic scenes fit the viewport; accessibility or unusually compact screens may use internal overflow. Test form/calendar using authorized test data only. The browser QA runner records main overflow and asserts milestone light-to-marker center error ≤1.5 CSS px for each stage. No genuine screenshots are claimed. This is a review build, not a production-certified release.
