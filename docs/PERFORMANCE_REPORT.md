# Vellum House performance revision

Full master IMG_7228.MP4: 48 seconds, 1280×704, H.264, 30 fps, 17,889,653 bytes; no audio stream. Both derivatives preserve all 48 seconds and the complete frame (no crop, trim or crossfade). Full frame is contained within a navy full-bleed background, so letterboxing is expected on portrait screens. The master is supplied separately, not in the deployable ZIP.

| Item | Root cause and change | Evidence / limitation |
|---|---|---|
| 1 Hero | Old large video replaced with baked-blur H.264 faststart, poster and load-gated playback. Navy overlay, contain framing, visibility and slow-connection safeguards. | Desktop 9.94 MB approx → 1,369,366 bytes; mobile 3.81 MB approx → 620,479 bytes; poster 1,194 bytes. No crop or trim. Loop seam and playback not visually verified. |
| 2 Performance | Deferred scripts retained; hashed media and fonts, cache-busted JS/CSS, lazy founder portraits. | Conservative local source inventory (all six font files, both crests, poster, English HTML, shared CSS and three JS files) 286,295 bytes before minor final changes; not a measured network transfer. Lighthouse unavailable. |
| 3 Navigation | Existing in-document view cache retained, booking module warmed on hover/touch. | No full HTML reload for hash routes; speed and viewport prefetch not measured. |
| 4 Language | Session-only preference replaced with localStorage and 12-month cookie; direct language URLs persist, hash preserved, native modal and current selection. | Code inspection only; browser acceptance blocked. Root / is neutral, explicit /index.html is Persian. |
| 5 Form | Global wheel interception restricted to home; form scroll enabled and 16px input sizing. Existing email fallback retained. | Physical iOS/Android keyboard tests not performed. |
| 6 Mobile | Shrinkable children, logical gutters, flexible type and wrapped navigation; home scenes allow internal scrolling if content exceeds screen. | Seven-width visual test blocked. Navigation wraps rather than a new hamburger. |
| 7 English margins | Hero copy constrained to 70ch and paragraphs to 66ch. | Code inspection only. |
| 8 Heading | One explicit family and color across heading and emphasized phrase, no hero entrance animation, font preload. | Computed style and font shift not browser verified. |
| 9 Fonts | Retained licensed local Instrument Serif and DM Sans in English, Vazirmatn for Persian headings/body. | No font comparison renders or metric-matched fallback calibration completed. Retaining existing files minimizes design changes. |
| 10 Copy | Corrected brand lockup and stage 3 to Implementation / اجرا. | Exact phrase scan passed after admin fix. |

## Verification
- `python tools/check.py`: 23 HTML entry points, required controls, assets and links passed.
- `node --check assets/house.js`: passed.
- `node tools/test-backend.cjs`: 59 isolated booking API calls passed. No live deployment or real booking attempted.
- ffprobe: both video derivatives exactly 48.000 seconds.
- Browser test attempted with Chromium/Playwright; managed browser policy blocked navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`). No Lighthouse installed. Therefore no baseline or after LCP/TBT/CLS/score, actual video request traces, horizontal-scroll or computed-style claims.

## Hosting
Existing GitHub Pages does not expose custom response header configuration in this archive. HTTP range support, cache lifetimes, gzip/Brotli and live performance must be verified at deployment. Google Apps Script remains the existing external booking endpoint (not a render-blocking asset); unchanged. Do not upload master video to the public site. Remove old introduction media from the publishing repository as well as replacing the HTML and assets. No new framework. No backend configuration changes.

## Changed files
index.html, en.html, admin.html, redirect HTML icon references where applicable, assets/house.js, assets/house.css, hashed WebP/MP4/WOFF2 filenames, tools/check.py, docs/PERFORMANCE_REPORT.md. Original introduction videos and poster removed. Existing founders, booking, dashboard and backend retained.
