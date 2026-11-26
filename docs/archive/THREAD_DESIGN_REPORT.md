# Vellum House — The Thread

## Concept
A private academic folio: deep ink, vellum ivory, a gold hairline, a persistent crest/header, a numbered spine and a continuous progress thread. The four primary leaves are Home, Approach, Founders and Consultation; contact, privacy and appointment calendar are companion states of the final leaf. Existing bilingual hash URLs and legacy redirect files are preserved. The admin remains functional and deliberately uses its existing layout. The stage is framed by a three-row dynamic-viewport grid. On small screens, a top progress rule replaces the spine. The sweep uses a gold line and directional navy clip-path wipe, swaps content at 395 ms, then reveals the next heading; reduced-motion uses a short fade. Because the site already uses in-document hash routes, cross-document View Transitions are unnecessary for these routes.

## Defect log (source audit, not live screenshots)
| Problem | Root cause in previous archive | Implementation |
|---|---|---|
| Persian type looked heavy | Vazirmatn Bold used for virtually every display heading | Noto Naskh Arabic 400 for headings, Vazirmatn 400/700 for body/UI; preload Naskh, explicit consistent font and color |
| Zoomed / poor film | `object-fit: cover` on 1.37 MB / 620 KB low-resolution encodes | Native-aspect `contain` over matching static background, no transform, two fresh 48-second master encodes |
| Pages scroll | Natural-flow page minimum heights plus large page padding and header overlay | 100dvh three-row folio, stage-sized layouts, explicit compact leaves and form steps, native stage overflow as accessibility safety net |
| No motion between sections | Existing hash router directly replaced DOM | Persistent shell, 800 ms directional thread sweep, CSS transforms/clip-path/opacity, no library; same-index state changes use simple fade |
| Generic appearance | Large independent card and section styles | Shared folio tokens, numbered spine, asymmetric 7:5 hero, numbered journey, gold thread and rules, quiet outlined controls |

## Type and color tokens
| Token | Value |
|---|---|
| Navy / deep | #102637 / #0B1B28 |
| Ivory / paper | #F6F1E7 / #FBF8F2 |
| Gold / bronze | #F3D08C (sampled crest pixel) / #76572B (for readable light-ground accents) |
| English display / body | Instrument Serif / DM Sans (existing OFL fonts) |
| Persian display / body | Noto Naskh Arabic / Vazirmatn (existing OFL fonts) |
| Body | 16–19 px EN, 16–20 px FA; 15 px only on short landscape |
| Display | viewport-dependent; typically 30–76 px |
| Motion | 800 ms sweep; 150 ms reduced-motion fade |

## Font evidence
The accompanying raster samples were shaped with Pillow/RAQM using the actual supplied WOFF2 faces converted temporarily for inspection. They are NOT browser screenshots. Three available pairings were compared: Naskh display + Vazirmatn body, Vazirmatn Bold display + Naskh body, Vazirmatn alone. The Naskh display is lighter in texture, reduces headline wrapping and establishes a manuscript-like editorial identity. Vazirmatn preserves familiar, clean Persian UI and form legibility. Estedad/Newsreader were not supplied; no external font fetched. All chosen faces include پ چ ژ گ ک ی, ۰۱۲۳۴۵۶۷۸۹, ZWNJ, ، ؛ ؟ and all Arabic-range glyphs used in the Persian source copy. The actual rendered browser fonts, fallback metric calibration and no-visible-swap behavior remain unverified.

## Video report (measured)
Master IMG_7228.MP4: H.264, 1280×704, 30 fps, 48.000 seconds, video bitrate 2,978,371 bps, aspect 20:11. It is not full HD. Both web versions are H.264 High, yuv420p, faststart, no audio, light baked Gaussian blur sigma=1, 1,440 frames, 48.000 seconds. Two-pass capped bitrate encoding was used to satisfy full-duration file budgets; CRF 19/20 trials were 15.7/9.47 MB and exceeded the requested caps. No content trimming, no crop, no upscale, no added audio. Desktop 1280×704, 7,560,247 bytes; mobile 960×528, 3,768,950 bytes. Poster 81,484 bytes, ambient still 10,778 bytes. Poster uses the 24-second frame because the first frame is nearly black; matching aspect, representative image. The video still plays from 0s and loops through the full 48s. For portrait or wide mismatches the complete image sits on the full-bleed blurred still; there is no zoom. No WebM was generated. Original master is outside the public tree. SSIM over all frames against the blurred master: desktop 0.988558; mobile 0.980010 against a matching 960×528 reference. SSIM is not VMAF; libvmaf is unavailable. Frame strips are in the evidence archive. The 24s sample retains visible classroom detail in both versions. Navy overlay provides high contrast by construction; browser WCAG audit remains pending.

## QA / limits
- Static checker: PASS, 23 HTML entry points, linked assets and required form controls. JavaScript syntax: PASS. Simulated booking backend: PASS, 59 isolated API calls. This is not a live booking test.
- Live site retrieval failed. Playwright's standard managed Chromium returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` for local HTTP. No override of the managed policy was attempted. Lighthouse and libvmaf are not installed. Browser screenshots, scrollHeight measurements, axe, transition videos, FPS, Lighthouse, real keyboard testing and live HTTP range/cache checks could not be completed. No measured scores or fit claims are fabricated.
- `tools/visual-qa.py` runs two complete viewport/state passes and produces measured CSV, screenshots and motion recordings on an unrestricted local browser. The included `ONE_SCREEN_STATUS.csv` is an explicit unmeasured matrix, not results. Stage height is checked as well as root height, so scrollable content cannot be mistaken for a full fit.

## Decisions I made
1. Prioritized the earlier explicit instruction to preserve the full duration and framing over the conflicting 8–12s / portrait crop defaults. The full-bleed ambient still fills otherwise uncovered space. No promise of native Full HD.
2. At 320/360-width short screens and short landscape screens the unchanged home copy is split into two explicit leaves. Founder profiles use selectable leaves on compact phones. Other screens show the existing full copy. This prioritizes no copy loss and readable text; exact fit remains unverified. Stage scrolling is a safety net for keyboard, magnification, and unusually long states.
3. Consultation steps are five groups on compact devices, all fields preserved, native validation and backend submission retained. Full form on larger screens. Existing contact route retained as a consultation companion.
4. Kept current English font assets; chose a new Persian display face from the supplied fonts. Footer language control opens the same persistent chooser as the header, as requested for the rail.
5. Existing URLs, brand assets, site config, booking backend and API untouched. No deployment performed. GitHub Pages controls cache headers and range delivery, which must be verified after deployment. No live credentials were accessed.
