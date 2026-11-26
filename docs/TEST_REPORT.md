# Release verification

| Test | Result | Evidence |
|---|---|---|
| Original baseline static checks | PASS | 23 HTML entry points; original four-stage journey |
| Final static integrity | PASS | tools/check.py: 23 HTML entry points, 6 stage nodes and details, pause/vertical and horizontal SVG, video before gold CTA, required form fields, local references, profiles, links, manifest |
| JavaScript parse | PASS | node --check assets/house.js; remaining JS checked separately |
| Backend isolated regression | PASS | node tools/test-backend.cjs: 59 isolated API calls; validation, sheets, booking limits, overlaps, retry, cancellation, staff authorization |
| Backend/config preservation | PASS | SHA-256 byte comparison against original archive; no backend, booking, education, dashboard or endpoint edits |
| Video metadata | PASS | ffprobe: both 48.000 s, same 20:11 aspect, optimized H.264 |
| Sample media comparison | PASS (sampled) | 13 grayscale SSIM frames; see PERFORMANCE_REPORT.md |
| Browser navigation / screenshots | BLOCKED | Chromium launched, but file:/// and http://127.0.0.1 navigation returned net::ERR_BLOCKED_BY_ADMINISTRATOR. No screenshots or browser motion evidence claimed. |
| Browser responsive geometry, keyboard, contrast, playback and transitions | NOT PERFORMED | Requires authorized local browser. Run tools/visual-qa.py and manual checks. |
| Actual approved font rendering | NOT PERFORMED | Selected font assets missing. Local fallback active; installer and licensed Dana procedure provided. |
| Live Google Sheets, Calendar, Meet, mail, staff dashboard | NOT PERFORMED | No live writes authorized; isolated backend tests are not live integration proof. |
| Lighthouse / field Web Vitals | NOT PERFORMED | Browser policy blocker; no scores claimed. |

## Owner pre-publication acceptance
Review home EN/FA at 360×640, 390×844, 430×932, 768×1024, 1024×768, 1280×720, 1440×900 and 1920×1080. Verify actual approved fonts, no unwanted wrapping/clipping, full frame and duration, CTA below film, play/pause, slow network, language gate/switcher, sliding drawer and Esc/focus, swipe and scroll chapter transitions, all six milestones, 10-second automatic progression and pause/replay, Persian alignment, founders, contact, all consultation fields visible in a single scrollable page, validation, calendar and admin login. Test Chrome, Safari/WebKit, Firefox and Edge where available; reduced motion and keyboard only. Verify published availability and true booking with owner-authorized test data only. Never expose personal records in screenshots. Review source founder experience/student-count claims before publication.

Result: reviewable build; not certified production-ready until browser, typography and live integration acceptance is completed.
