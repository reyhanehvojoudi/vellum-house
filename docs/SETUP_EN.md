# Publish the revised website and activate enquiries

The ZIP contains a complete static website. You do not need to install software to upload it. The Google connection is a one-time setup in your own account.

## 1. Back up the current website

1. Open your existing Vellum House repository in GitHub.
2. Choose **Code → Download ZIP** and keep it as a backup.
3. Note the current publishing configuration under **Settings → Pages**: the branch and folder, or any existing GitHub Actions workflow.
4. Keep any existing `CNAME`, `.github` directory, DNS settings and custom-domain configuration. This update does not require changing your domain.

If the repository also hosts your personal site, put this package only inside the existing Vellum House folder. Do not replace your personal site's root files.

## 2. Create the enquiry spreadsheet

1. Sign in to the Google account that should own the enquiries and send email, ideally `reyhaneh.vojoudi@gmail.com`.
2. Create a blank **Google Sheet** and name it **Vellum House — Enquiries**.
3. Keep general access **Restricted**. The website does not need a public spreadsheet.
4. To let Kasra review the records, use **Share**, enter `kasra01@gmail.com`, choose the access you want, and send the invitation. Email notifications work even if you do not share sheet access.
5. Keep this sheet open. You do not need to create columns manually.

This is a live Google spreadsheet, not a live Microsoft Excel workbook. For an Excel copy later, use **File → Download → Microsoft Excel (.xlsx)**. That downloaded copy is a snapshot.

## 3. Install the connection code

1. In the new Google Sheet, select **Extensions → Apps Script**.
2. Name the script **Vellum House Enquiries**.
3. Open the package's `backend/Code.gs` in a text editor. Copy its entire contents.
4. In Apps Script, replace the starter code in `Code.gs` with the copied code and save.
5. In the function selector near the top, select **setup** and click **Run**.
6. Review Google's authorization request for your own project and grant the required spreadsheet, email and trigger permissions. These allow the script to save enquiries and send messages from the owner account.
7. Return to the sheet. You should see an **Enquiries** tab with headers including name, grade, city, phone, email, message and three email-status columns.
8. In Apps Script's **Triggers** section, check there is one `retryEmails` trigger, running every five minutes. Running `setup` again will not create a second matching trigger.

Both notification addresses are already set in the script:

- reyhaneh.vojoudi@gmail.com
- kasra01@gmail.com

Messages are sent from the Google account that deploys the script. Applicant replies go to Reyhaneh; replies to the admin notification go to the applicant. Kasra is not exposed in the applicant acknowledgement.

## 4. Deploy the form endpoint

1. In Apps Script, select **Deploy → New deployment**.
2. Under deployment type, choose **Web app**.
3. Description: `Vellum House enquiry form`.
4. **Execute as: Me**.
5. **Who has access: Anyone**. This permits visitors to submit without a Google login. The sheet itself stays private.
6. Select **Deploy** and complete any project authorization.
7. Copy the **Web app URL** ending in `/exec`. Do not use the editor URL or a `/dev` test URL.

If your organization's Google account does not offer **Anyone**, its policy may prevent anonymous web apps. Do not select “Anyone with a Google account” and assume the public form works; ask your administrator or use an account that permits the intended deployment.

## 5. Add the URL to the website

1. Extract the website ZIP on your computer.
2. Open `assets/config.js` in Notepad or another plain-text editor.
3. Paste your real `/exec` URL between the quotes after `formEndpoint`:

```js
window.VELLUM_CONFIG = {
  formEndpoint: 'PASTE_YOUR_REAL_WEB_APP_URL_HERE'
};
```

4. Save the file. Keep the quotes and comma / braces intact. This is a public submission endpoint, not a password. Do not paste passwords, tokens or a private spreadsheet export into the website.

## 6. Upload the revised website to GitHub

1. Open the **Code** tab of your existing Vellum House repository and go to its publishing folder.
2. Select **Add file → Upload files**.
3. Drag in the **contents of the extracted package**, including the `assets`, `backend`, `docs` and `tools` folders and all the HTML files. Do not drag in an enclosing folder that would put everything one level too deep. Do not upload the ZIP itself.
4. The upload should include `index.html` at the publishing folder's top level and `assets/config.js` inside `assets/`.
5. Make sure the updated files are listed. Existing files with the same paths will be updated. Preserve your current `CNAME` and hosting configuration.
6. Use this commit message:

   `Redesign Vellum House and add free consultation enquiries`

7. Select **Commit changes** to the existing publishing branch. If GitHub requires a pull request, create it and merge it when ready.
8. If `.nojekyll` was hidden by your computer, keep the existing one. If missing, use **Add file → Create new file**, name it `.nojekyll`, add a short comment such as `Static website`, and commit.

There are fewer than 100 files and no npm build step is needed. `backend/Code.gs` is safe to include as source because it contains no credentials, but it only runs in Apps Script. Uploading it to GitHub does not activate the backend.

## 7. Confirm GitHub Pages

For an existing working GitHub Pages site, preserve its working publishing arrangement.

If you need to configure branch publishing:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose the branch you updated, usually **main**.
4. Choose **/ (root)** if `index.html` is at the repository root. Use **/docs** only if your actual site is intentionally inside that folder; this package's own `docs` folder contains instructions, not the website.
5. Save and check the deployment under **Actions**.
6. When deployment succeeds, open the site's URL shown in Pages settings. Refresh with **Ctrl + F5** if you see the old design.

If the site already uses a custom GitHub Actions workflow or another host, retain that setup instead of switching blindly to branch publishing.

## 8. Send one real test before promoting the site

Use your own contact information for this test.

1. Open `contact.html` on the published site, preferably in an incognito window.
2. Fill in every field and submit once.
3. Wait for the received message. The website confirms only after the backend can find a saved row; it does not mistake an unreadable network response for success.
4. Check the private **Enquiries** tab: one row should contain the correct values and a unique request ID.
5. Check Reyhaneh's inbox and Kasra's inbox, including spam: each should receive the enquiry.
6. Check the applicant address used for the test: it should receive an acknowledgement explaining that scheduling details will follow by email.
7. Check the three email columns: **Sent** means Google's mail service accepted the send; it does not prove inbox delivery. **Pending** is retried by the trigger. See **Last email error** for failures.
8. Repeat with the Persian form at `contact-fa.html`; its applicant acknowledgement should be Persian.
9. Check the phone-sized layout and language switch. The same enquiry form is used in both languages.

Do not start promoting the form until that end-to-end test passes. A consultation time and meeting link still need to be agreed and emailed by your team.

## Troubleshooting

- **Form unavailable message:** `formEndpoint` is blank or not the correct `/exec` URL. Fix `assets/config.js`, upload that file again and commit.
- **Could not confirm receipt:** the row may still have saved. Check the sheet and acknowledgement first. Try the same unchanged form again to reuse the request ID and avoid a second row. Leaving / reloading the page or changing details creates a new request reference.
- **No row:** confirm `setup` ran in the intended sheet, deployment access is **Anyone**, and the endpoint is current. Check Apps Script **Executions** for errors. Required fields, a valid phone number with country code and email, and consent are enforced on the server. Three new enquiries per email per rolling cached hour are allowed by the basic throttle.
- **Row saved, email pending:** inspect **Last email error**, account quota and trigger permissions. Run `retryEmails` manually after fixing the cause or let the five-minute trigger retry. Google account mail quotas apply; a busy public service may need a dedicated email platform and stronger anti-spam protection.
- **An email arrived twice:** send-and-status operations cannot be atomic across Google's mail and sheet services. A rare interruption after sending but before recording `Sent` can cause a retry to send twice. Request IDs keep the spreadsheet row deduplicated.
- **Changed Apps Script code but no effect:** save the script, then **Deploy → Manage deployments → Edit → New version → Deploy**. Editing the existing deployment preserves the `/exec` URL. A separate new deployment needs a config update.
- **Google scripts blocked by browser / network:** receipt confirmation depends on `script.google.com` and `script.googleusercontent.com`. Try a normal browser without blocking extensions. The form never claims success if confirmation is blocked.
- **Wrong fonts or old logo:** upload the full `assets` folder and hard refresh.
- **Rollback:** restore the earlier commit using GitHub Desktop's revert feature or your normal git workflow. Keep the original downloaded ZIP as a separate backup.

## Useful official references

- Google Apps Script web apps: https://developers.google.com/apps-script/guides/web
- Content Service / cross-origin receipt mechanism: https://developers.google.com/apps-script/guides/content
- Google MailApp: https://developers.google.com/apps-script/reference/mail/mail-app
- GitHub Pages publishing: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Google Sheets sharing: https://support.google.com/docs/answer/9331169
