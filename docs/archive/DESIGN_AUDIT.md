# Vellum House — design revision

## Scope and baseline
Baseline: the supplied Vellum-House-Updated.zip, not a fresh reconstruction. Actual views are intro, four-step journey, founders, contact, enquiry, privacy disclosure, calendar, language dialog, staff login/dashboard and 404. The legacy HTML entry points redirect to these existing routes; no URLs were renamed. The live domain could not be retrieved by the web tool. Local Chromium returned ERR_BLOCKED_BY_ADMINISTRATOR; no visual baseline or post-change screenshots can be honestly supplied. Lighthouse and axe-core are not installed. The following log is a source-level audit, not a measured viewport defect log.

| Area | Source-level root cause | Change |
|---|---|---|
| Hero, both languages | contain framing caused letterboxing; fixed main height and nested scroll containers could constrain content | Full-bleed cover, viewport minimum height, natural page scroll for long content, header overlays top; same 48-second media |
| Type | Cascading competing hero and breakpoint rules; inconsistent sizing | Consolidated editorial tokens and explicit hero family/color; responsive headline/body sizing, Persian weight 700 and no slant |
| Layout | Several fixed sizes, rigid mobile header and narrow stage-detail columns | Logical gutters, shrinkable grid tracks, mobile menu, single-column form and cards; journey arrows below text on phones |
| Journey | Busy gradient/grid map and small touch targets | Four numbered stops on one gold hairline; existing stage content and arrow controls preserved |
| Founders/contact | Inconsistent density and alignment | Unified section grid, portrait treatment, hairline rules, readable text measures |
| Form/calendar | Old home scroll interception and small controls | Native document scrolling outside home, 16px fields, 48px controls, flexible layout; existing validation and booking preserved |
| Dialog | Heavy backdrop and inconsistent spacing | Solid navy backdrop, ivory panel, clear current choice and 48px buttons; native dialog retained |
| 404 | Immediate redirect without explanation | Bilingual not-found state with home links |
| Footer | No consistent footer on inner pages | Minimal brand and existing email link |

## Tokens
| Token | Value |
|---|---|
| Ink / deep ink | #102637 / #0B1B28 |
| Ivory / paper | #F6F1E7 / #FBF8F2 |
| Gold / dark bronze | #F3D08C (sampled recurring gold pixel in existing crest) / #76572B |
| Muted text | #4A5A68 |
| Body EN / FA | 17–19px / 18–20px |
| Lead EN / FA | 19–22px / 20–23px |
| H1 / H2 / H3 | 36–72 / 28–44 / 20–24px (mobile Persian hero 32–44px) |
| Small | 13–15px |
| Body line height EN / FA | 1.62 / 1.95 |
| Container / gutters | 1248px content, 20–48px + safe areas |
| Spacing / radius | 8, 16, 24, 32, 48px; 3px |

## Decisions and limitations
- New full-screen request takes precedence over previous no-crop framing: object-fit:cover fills the hero and crops edges at differing aspect ratios. Both encoded files retain original duration and uncropped source framing. No new portrait-specific encode or shortened loop was made, respecting the earlier explicit full-duration instruction. Original master remains separate. Desktop 1,369,366 bytes; mobile 620,479 bytes; poster 1,194 bytes.
- Kept the existing local Instrument Serif/DM Sans and Vazirmatn because Newsreader/Instrument Sans were not in the supplied assets. No visual comparison, optical size tuning, metric-matched fallback or no-swap visual proof. Four font faces remain referenced in shared CSS; no external font requests.
- Existing content retained apart from new menu/footer/404 navigation text. Mobile text is start-aligned; selected wide body blocks are justified. Original one-scene journey retained with natural vertical scrolling when needed. No new framework. Legacy redirects and backend configuration preserved.
- Source inspection does not establish zero horizontal overflow, universal AA, LCP, CLS, Lighthouse >=90, keyboard behavior, or autoplay. Screenshot requirement and two full browser passes are NOT completed. The included QA script is a reproducible starting point for running the viewport sweep on a normal browser. No deployment was attempted.
- GitHub Pages cache/HTTP range response headers are host-controlled; not verified or changed.

## Verified checks (local)
- tools/check.py: PASS, 23 HTML entry points and linked assets.
- node --check assets/house.js and assets/education.js: PASS.
- tools/test-backend.cjs: PASS, 59 isolated simulated API calls.
- ffprobe: both video versions exactly 48.000 seconds; sizes as above.
- Archive CRC check: performed when packaging.
