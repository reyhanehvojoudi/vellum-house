# Vellum House 7.1 — Interactive Atlas release

### New ScreenSpace-inspired interactions
- Five interactive map destinations now change the contextual story panel, with an accurate route progress line and animated point of light moving along a custom SVG path.
- New previous/next chapter navigation and a clear `01 / 05` chapter counter; controls are disabled at the appropriate endpoints.
- Keyboard access (Tab, arrows, Home/End), visible active state and focus, screen-reader announcements, reduced-motion support.
- Desktop-only pointer-responsive map illumination; meaningful vertical layout on mobile.
- Thin reading-progress indicator across the website and subtle opt-in reveal effects on editorial content.
- Existing persistent consultation CTA (desktop header/mobile bottom bar) and scroll-to-top button retained.

### Retained and protected
- Original VH circular mark and English wordmark; deep navy + muted gold identity.
- Natural Persian and English copy, smaller menu, founders/team presentation areas, honest results and testimonial placeholders.
- Exact Persian CTA: **درخواست جلسه مشاوره رایگان اولیه**.
- Existing Google Apps Script endpoint and Cal.com **https://cal.com/vhouse/consultation** link.
- Original lead pipeline schema and form-submission confirmation check.
- Preserved licensed Vazirmatn fonts and the existing brochure.

### Maintenance and QA
- Corrected the English acknowledgement email duplicate 'free'. Updating live email copy requires re-deploying Apps Script. For the visual changes only, no backend redeploy is needed.
- Moved obsolete V6 generation scripts to `tools/legacy` and replaced `tools/build.py` with a safety message so the new experience cannot be accidentally overwritten.
- Static checks, JS syntax, mock backend tests, in-memory Chromium interaction tests passed. **No live production integration test was performed.**
