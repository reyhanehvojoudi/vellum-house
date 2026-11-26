# Integrated layout repair — verification

Date: 2026-11-26. This is a complete review build, not a visually certified release.

Passed:
- `python tools/check.py`: 23 HTML entry points, asset references, bilingual form and six journey endpoints, manual journey and navigation structure.
- `node tools/test-backend.cjs`: 59 isolated API calls (not live Google integration tests).
- `node tools/test-navigation.cjs`: seven isolated route transitions including home → journey, direct milestone, founders, contact, returning home and animation failure fallback. Mocked DOM, not browser hit testing.
- `node --check assets/house.js`: JavaScript syntax.
- CSS parsed with tinycss2: no parse errors. This does not certify browser compatibility or layout.
- Exact public-page text preservation compared with the latest layout revision.
- Byte-for-byte preservation of backend files, media, fonts, admin, booking, education, API files and endpoint configuration.

Not verified:
- Actual browser layout, clicks, animations, viewport fitting, mobile rendering and playback. Chromium navigation returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` in this environment; no policy bypass attempted.
- Live Google services, production endpoint and real booking transactions.
- Approved English fonts and commercial Dana are still not supplied. Local fallback fonts remain active.
- New Lighthouse or real-user performance metrics.

Review locally before publishing. Extremely short viewports or enlarged text may need internal overflow to preserve readability rather than clip content. Existing video sources remain unchanged; full-bleed cover sizing can crop outer frame edges at differing viewport ratios.
