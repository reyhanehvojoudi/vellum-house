# Vellum House V8 — The Living Atlas

**Single-screen bilingual website for `vhouse.ir`.** No long scrolling pages: the central experience changes in place, through the menu or section arrows. A language selection dialog is shown once per browser tab session (English / فارسی). The menu language control can reopen it at any time.

## Launch

1. Back up your existing GitHub repository: `https://github.com/reyhanehvojoudi/vellum-house` → Code → Download ZIP.
2. Extract this release ZIP and upload the **contents of the folder** to the **GitHub Pages publishing root** (normally the `main` branch root), replacing matching files. **Do not delete existing unrelated assets.**
3. Preserve the **existing licensed Persian font files** in your repo: `assets/Vazirmatn-Regular.woff2` and `assets/Vazirmatn-Bold.woff2`. They are **not distributed in this ZIP**. CSS will use system fonts if they're absent.
4. Commit as `Publish Vellum House V8 single-screen atlas` and check Settings → Pages → successful deployment.
5. Test both languages, all five views, consultation form (private Google Sheet + Gmail receipt), booking redirect, and mobile devices.

## Live integrations — configured in `assets/config.js`

- Google Apps Script endpoint: the exact `/exec` URL previously provided by the owner.
- Confirmed booking link: `https://cal.com/vhouse/consultation`.
- The Google Sheet remains private. Frontend submits via POST and checks a UUID receipt before redirecting. **Never assume a no-cors response means saved.**
- `backend/Code.gs` is included as a reference for the connected Google Sheet. If the live deployment is already correct, **do not redeploy the script simply to upload this frontend**. If you change backend code, update the existing deployed version in Apps Script separately.
- Cal.com appointments do not automatically update booking status in the Google Sheet. That remains a manual CRM step.

## Structure

- `index.html` and `en.html`: same single-screen app shell, with Persian/English defaults.
- `assets/experience.css`: navy, champagne gold, responsive design; no external CSS framework.
- `assets/experience.js`: bilingual copy, five interactive screens, route, modal, menu, mobile form wizard, enquiry receipt.
- `assets/config.js`: public, non-secret integration URLs.
- Other `.html` pages: backward-compatible redirects to relevant screens in this app, keeping old shared links useful.
- `backend/Code.gs`: the previously tested Google Apps Script implementation.
- `docs/` includes screenshots, QA notes and content-replacement instructions.

## Content intentionally not invented

The founder portrait images are editorial placeholders. Results and testimonials are reserved for verified, permissioned material. The privacy/terms in-app notices require your legal/editorial review before public launch. No education results, admission outcomes or endorsements were invented.

## Browser/runtime notes

The `body` is fixed to one viewport with `overflow:hidden` and the five screens are navigated without scrolling. Very short landscape screens or an on-screen keyboard may require limited scrolling **inside the consultation panel** so inputs remain usable. This is preferable to clipping content.

For local preview you can open `index.html` in a modern browser, or serve the folder with `python -m http.server 8000` and open `http://localhost:8000/`. Remote Google integration must be tested from the live HTTPS domain.

## Tests

```bash
node --check assets/experience.js
node tools/test-backend.cjs
python tools/test_browser.py
```

The browser script uses an isolated in-memory browser because localhost navigation was blocked by the testing environment. This verifies the frontend interactions **but not the live Google services**.
