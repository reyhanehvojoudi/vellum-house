# Vellum House — revised website

Minimal bilingual website, prepared 22 October 2026. All website pages are already built; GitHub Pages needs no Node, npm, Python or paid hosting service to publish them.

**Start with docs/SETUP_EN.md or docs/SETUP_FA.md.**

## What is included

- English and Persian versions of the home, services, approach, pathways, about, resources, consultation, privacy and terms pages.
- New editable SVG VH monogram, full logo and matching favicon.
- Responsive layouts, mobile navigation, local Persian fonts, keyboard focus styles and reduced-motion support.
- A short consultation form: full name, grade / study level, city, phone, email and message; consent checkbox.
- `backend/Code.gs`: Google Apps Script that stores enquiries in a private Google Sheet, sends each enquiry separately to Reyhaneh and Kasra, and acknowledges the applicant in the form's language.
- Email delivery tracking and a five-minute retry trigger; unique request references avoid repeat rows on a retry with unchanged details.

## Connection status

The design and connection code are complete. **No live Google Sheet or Apps Script deployment has been created for you.** `assets/config.js` intentionally has an empty `formEndpoint`. Until you complete setup, submitting shows an honest unavailable message and the email address; it does not claim success.

This implementation uses **Google Sheets**, which can be exported to `.xlsx`. It does not update a local Excel file or a Microsoft 365 workbook automatically. If you specifically need a live Microsoft Excel workbook, a separate Microsoft integration is required.

Consultation times are coordinated by email. The system sends an automatic acknowledgement, not an automatic calendar booking or meeting link.

## Upload to GitHub

Upload the contents of this package into the existing website's publishing folder. `index.html`, `fa.html` and `assets/` must be alongside each other. Do not upload the ZIP as your website. Preserve any existing `CNAME` and GitHub configuration. Full instructions are in the setup guides.

## Editing later

- Basic connection setting: `assets/config.js`.
- Styling: `assets/style.css`.
- Form and menu behavior: `assets/main.js`.
- Logo: `assets/logo-mark.svg`, `assets/logo.svg`, `assets/favicon.svg`.
- Copy and page structure: `tools/build.py` and the content keys it uses in `content.json`. Run `python tools/build.py` after source edits. Some older unused content keys remain for reference; only the generated HTML is published to visitors.
- Alternatively edit generated HTML directly, but a later rebuild will overwrite those direct edits.
- The retained brochure is the original supplied brochure; it has not been rewritten. The website's current free-consultation description takes precedence for this form.

## Verification

Passed: all 19 HTML pages' local links and anchors, unique IDs and primary headings, both forms' fields / labels; JavaScript syntax checks; local backend behavior tests for storage, recipients, validation, duplicate requests, spreadsheet formula protection, private receipts and email retry. Desktop English and mobile Persian / English pages were visually reviewed; the mobile menu and unconfigured-form error were exercised.

Live Google permissions, delivery, quota availability and a real published form submission remain to be verified after deployment. No real email was sent during local tests.

Developer checks (optional):

```sh
python tools/build.py
python tools/check.py
node --check assets/main.js
node tools/test-backend.cjs
```
