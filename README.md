# Vellum House website and consultation calendar

This release runs on the existing GitHub Pages site at vhouse.ir. The public pages, enquiry, calendar and staff dashboard use the same domain. The existing private Google Sheet stores enquiries, shared availability and reservations.

The illustrated home page includes the supplied English introduction and its Persian adaptation. English reading order is left to right and Persian reading order is right to left. Both founders have their own portrait and LinkedIn profile.

## Activate the booking service

1. Open the existing private Vellum House enquiry spreadsheet with its owner account. Choose **Extensions → Apps Script**. Copy the contents of the included `backend/Code.gs` into the existing `Code.gs` file and save.
2. In the Apps Script editor, select **setup** and click **Run**. Authorize spreadsheet access, sending mail and the timed trigger when requested. Setup adds a private booking-key column to the original `Enquiries` tab and creates `Consultation times`. It also creates the staff access key and the email delivery trigger. You can run setup again. If you used column T for a custom field, move that field to another unused column before running setup.
3. Open **Project Settings → Script Properties**. Copy the generated value of `VH_ADMIN_KEY` into the staff password manager. This key gives access to family contact details and availability management. To rotate it, replace it there with a new randomly generated value of at least 24 characters.
4. Open **Deploy → Manage deployments**, select the existing web app, choose **Edit**, select **New version** and deploy. The web app runs as the owner and needs to be accessible to **Anyone** so prospective families can book. The spreadsheet itself stays private. Updating the existing deployment keeps its URL in `assets/config.js`. If a different deployment is used, change only `formEndpoint` to its actual HTTPS `/exec` URL.
5. Extract the release ZIP. In the Pages publishing root of `reyhanehvojoudi/vellum-house`, upload the extracted files and folders with `index.html` at the root. Keep the existing `CNAME` value of `vhouse.ir`. Commit the update and wait for the Pages deployment.
6. Open `https://vhouse.ir/admin.html` and sign in using the staff key. Publish your first available date and time range. The public calendar starts empty. Open only times that are free in your current diary, including any appointments already arranged through Cal.com or Google Calendar.
7. Check the public flow from a separate browser session with an address you control. Submit the enquiry, reserve one published time and verify that the same booking appears in the staff dashboard and that both confirmation emails arrive.

Google documents the deployment settings in its [web app guide](https://developers.google.com/apps-script/guides/web) and [deployment guide](https://developers.google.com/apps-script/concepts/deployments).

## Using the dashboard

- **Open times.** Select a Gregorian date and the start and end of a free period in Tehran time. Opening 15:00–16:30 publishes 15:00, 15:30 and 16:00. A range can be published ahead of the public booking window.
- **Change availability.** Use **Close slot** beside an open time. To move an opening, close the original and publish the new time. A booked meeting stays reserved when a staff member edits overlapping availability.
- **See meetings.** Filter by upcoming, past or all meetings. Each entry includes the scheduled time, the applicant's name, contact details and consultation topic. Refresh to pick up changes made by another staff member.
- **Provide the joining details.** The website reserves the appointment. Staff send the meeting link before the consultation. The calendar download on a confirmed booking adds the event to the family's preferred calendar.
- **Use either language.** Dates appear in the Persian calendar on the Persian site and in the Gregorian calendar on the English site. All displayed times use Asia/Tehran.

## Booking behavior

Appointments last 30 minutes. Families can select times from 48 hours to 14 days ahead, with both limits checked when a reservation is written. The booking ledger is authoritative. A shared server lock protects each write, and a repeated submission returns the original reservation. The original CRM receives the booked status. Dates in raw Sheet cells display in that spreadsheet's configured time zone.

Families receive a private link to resume the calendar or reopen their confirmation. New-enquiry and booking emails are queued for the existing five-minute Apps Script trigger and sent subject to the owner's Google mail quota. Staff manage the availability of this calendar independently. Existing Cal.com or external Google Calendar appointments are not imported or synchronized.

## Editing the site

The Persian and English copy lives in `index.html` and `en.html`. Both files include the section templates. Layout and local typefaces are in `assets/house.css`. The page navigation, calendar and staff interface use `assets/house.js`, `assets/booking.js`, `assets/calendar-api.js` and `assets/admin.js`. No package installation or front-end build is required.

The home photograph has responsive AVIF and WebP sizes. Founder portraits load when their page opens. Calendar code loads on demand. All fonts and production images ship with the website.

## Verification

Run `node tools/test-backend.cjs` for the offline booking regression suite and `python3 tools/check.py` for the site integrity checks. Verification in this release used isolated test records, without modifying the live spreadsheet or sending mail. The live-domain check in step 7 verifies your deployment and Google account permissions.

راهنمای گام‌به‌گام فارسی در [راهنمای انتشار و راه‌اندازی](docs/START_HERE_FA.md) آمده است.
