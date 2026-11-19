# Deployment checklist — Vellum House V5

## Step 1 — Preserve the current live site
1. In https://github.com/reyhanehvojoudi/vellum-house choose **Code → Download ZIP** for a backup.
2. Confirm GitHub Pages is deployed from `main` / root under **Settings → Pages** (or follow your current workflow). Keep the domain `vhouse.ir` and your DNS settings.
3. Use a new branch or PR for review. Replace the HTML, CSS, JS and `tools/build.py` with the V5 files. Keep existing unrelated folders and assets as needed. **Do not publish the ZIP itself as the site.**

## Step 2 — Create the private Google Sheet
1. Sign into `vellumhouse.edu@gmail.com`.
2. Go to https://sheets.google.com, create **Vellum House — Enquiry Pipeline**, and keep **General access → Restricted**.
3. Open **Extensions → Apps Script** and replace the starter script with the entire contents of `backend/Code.gs`.
4. Save, choose function `setup`, and click **Run**. Authorise Sheets, Mail and triggers under this account.
5. Return to the spreadsheet; confirm the `Enquiries` tab has 19 columns. Lead Status and Booking Status have dropdowns.
6. Confirm that `retryEmails` exists under **Triggers**, running every 5 minutes. This retries transient Gmail delivery errors, within Google quotas.

## Step 3 — Publish the Apps Script endpoint
1. In Apps Script choose **Deploy → New deployment → Web app**.
2. Set **Execute as: Me**, **Who has access: Anyone** (the Sheet itself remains private), then **Deploy**.
3. Copy the `https://script.google.com/macros/s/.../exec` URL.
4. Open `assets/config.js`; set `formEndpoint` to that public `/exec` URL. Leave the Cal.com booking URL unchanged or update it there only.
5. **Never publish credentials or the private Sheet URL in client-side code.**
6. If the Google account does not permit anonymous Apps Script web apps, use a compatible hosted form backend instead; do not silently deploy a Google-login-only endpoint.

## Step 4 — Test the entire conversion journey BEFORE going live
1. Submit an English test enquiry from `contact.html` with a valid email address.
2. Check the private Sheet: one **New** lead, **Not booked** initially, interest, source and email details present.
3. Check notification inbox of `vellumhouse.edu@gmail.com` and the test applicant’s automatic acknowledgement.
4. Confirm the website takes you automatically to Cal.com **only after the Sheet receipt is verified**. Check the acknowledgement email’s booking link too.
5. Choose a test time, verify the Cal.com booking email and calendar invite; manually change Booking Status to **Booked** on the correct row.
6. Repeat in Persian at `contact-fa.html` (including Persian message text) and on a mobile screen. Test a failed endpoint, invalid email, blank required field, and repeated submission. No successful submission should be shown when the Sheet did not confirm it.
7. Test a disabled-JavaScript browser to ensure form information never appears in a URL.
8. Test form accessibility with keyboard and screen reader. Check Google’s sending quota and whether Apps Script permissions remain valid.

## Step 5 — Publish to GitHub Pages
1. Merge the tested branch, or upload the extracted V5 **files and folders**, not the ZIP, to the repo root.
2. Keep `index.html`, `en.html`, `assets/`, `backend/`, `tools/`, `CNAME`, `robots.txt`, `sitemap.xml` at the same root level.
3. Wait for GitHub Pages deployment status and verify https://vhouse.ir and https://vhouse.ir/en.html.
4. Re-run the journey on the public domain. Verify the Cal.com calendar is live and actually offers free slots.

## Step 6 — Operations and growth
- Each new enquiry begins as **New / Not booked**. Assign an owner and update the row after a call is booked, attended, proposal sent or won/lost.
- Booking status is **manual** for now; add a signed Cal.com webhook or a secure reconciliation flow in a later iteration if desired.
- Avoid publishing student names or photos without verifiable consent. Add documented case studies and actual team profiles to the reserved media slots.
- Establish a privacy retention period and a deletion workflow; limit access to those who need it and enforce 2FA on the Google account.
- Review funnel performance: website visitors → enquiry submits → booked calls → attended calls → qualified proposals → paying clients; use a privacy-conscious analytics plan with legal review.

**Remaining live activation:** The Google Apps Script endpoint cannot be filled in until the owner has authorised and deployed it. No live enquiry saving/email sending has been verified in this local package.
