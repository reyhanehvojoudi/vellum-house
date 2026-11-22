# Vellum House — Production Website

A premium, one-viewport, bilingual experience, built in plain HTML, CSS and JavaScript for GitHub Pages at https://vhouse.ir/.

## Visitor experience

1. The language selection dialog appears on a visitor's first visit in each browser-tab session.
2. After choosing English or Persian, visitors see a short introduction defining Vellum House and a button to explore the journey.
3. The five-stage journey occupies the full central screen; clicking a stage precisely highlights the connecting route up to that stage, and its explanation appears beneath the route.
4. A compact menu opens the method, both founders, consultation and contact views—all within one screen. No page-level scrolling is required in normal use.
5. The consultation enquiry is completed in two small steps, saved to a private Google Sheet and independently confirmed before the booking page is opened.

## Important public configuration

The `assets/config.js` file contains the Google Apps Script `/exec` URL already supplied by the owner and the booking destination `https://cal.com/vhouse/consultation`. Do not overwrite it with placeholders or add secrets to this file.

## Files

- `index.html`: Persian first-visit experience
- `en.html`: English first-visit experience
- `assets/atelier.css`: responsive visual design and font references
- `assets/atelier.js`: bilingual copy, navigation, interactive journey and enquiry handling
- `assets/vh-monogram.webp`: optimised version of the user-supplied logo, transparent
- `assets/config.js`: endpoint and booking URL
- `backend/Code.gs`: Google Apps Script backend; must also be redeployed in Apps Script
- Legacy URLs (contact, about, approach, services, etc.) redirect to the corresponding new single-screen view.

## Existing font assets

The website references the Vazirmatn font files *already present* in the existing GitHub repository:

- `assets/Vazirmatn-Regular.woff2`
- `assets/Vazirmatn-Bold.woff2`

**Keep those existing font files when uploading.** They are not bundled into this release. Persian fallback fonts are used if they are missing.

## Publish

Read `docs/START_HERE_FA.md` for the full Persian step-by-step GitHub, Apps Script, and Cal.com deployment instructions.

## Important limitations

- Browser/source tests and a mocked backend test passed locally. The real Google Sheets/Gmail/Cal.com connection must be verified after deployment using a genuine, consenting test address.
- Consultation booking status in Google Sheets is still manual unless separately integrated with Cal.com.
- The founder experience and 3,000+ / 8,000+ figures were supplied by Vellum House; confirm authorisation and accuracy before publishing.
- Privacy policy, regulatory disclosures and student data processing obligations need owner review before publication.
