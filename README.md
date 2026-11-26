# Royal Academia — review build

Start with [Persian deployment guide](docs/DEPLOYMENT_GUIDE_FA.md), [Design](docs/DESIGN.md), [Test report](docs/TEST_REPORT.md), [Performance](docs/PERFORMANCE_REPORT.md), [Changelog](docs/CHANGELOG.md), and [Rollback](docs/ROLLBACK_GUIDE.md). The legacy setup instructions below remain relevant for the unchanged Apps Script backend; prior design reports in docs/archive are historical, not current verification.

# Vellum House website

The ZIP contains the complete bilingual GitHub Pages site, the staff dashboard and the Google Apps Script booking service. Start with the Google setup, then upload the site. Persian instructions are in [START_HERE_FA.md](docs/START_HERE_FA.md).

## Activate Google Calendar and booking

1. Sign in as the owner of the existing private Vellum House enquiry spreadsheet. Open **Extensions → Apps Script**. Replace the existing **Code.gs** with the file from `backend/`. Add two script files named **Schedule** and **Meetings**, and paste in their respective `.gs` contents.
2. In **Project Settings**, enable **Show “appsscript.json” manifest file in editor**. The included `backend/appsscript.json` declares **Google Calendar API v3** and the required permissions. For the original Vellum House project, copy this manifest into the editor. In a shared script project that also hosts other integrations, merge the listed service and scopes into its existing manifest. If it uses a standard Google Cloud project, enable **Google Calendar API** in that project as well. [Google advanced services](https://developers.google.com/apps-script/guides/services/advanced)
3. The default destination is the owner's primary calendar. To use a particular team calendar, set the script property **VH_CALENDAR_ID** to that calendar’s ID before running setup. The deploying account needs edit access and Google Meet support. Optionally, **VH_BUSY_CALENDARS** accepts a comma-separated list of other accessible calendar IDs whose busy time should also block appointments.
4. In the editor select **setup**, click **Run**, and authorize the requested Google permissions. Setup prepares the sheet tabs and creates a five-minute trigger for outstanding emails, pending Meet links and calendar changes. Find **VH_ADMIN_KEY** in **Project Settings → Script properties**. Keep the value with staff who manage consultations.
5. Go to **Deploy → Manage deployments → Edit** on the existing web app. Select **New version**, set **Execute as me** and **Who has access → Anyone**, then deploy. Updating that deployment keeps the existing `/exec` address in `assets/config.js`. If Google gives you a different URL, update the `formEndpoint` value before uploading GitHub files. [Google web app deployment](https://developers.google.com/apps-script/guides/web)
6. Extract the ZIP and upload its contents to the existing GitHub Pages publishing root with `index.html` and `CNAME` at the top level. The supplied `CNAME` is `vhouse.ir`. Commit the files. The public site uses plain HTML, CSS and JavaScript and needs no build step.
7. Open **/admin.html** on your domain and sign in with the staff key. Publish a weekly time range or a specific date at least 48 hours and within 14 days ahead. Use an email address you control to submit a test enquiry and book one time. Verify its rows in **Enquiries** and **Bookings**, the calendar event and guest, and the confirmation email containing the same Meet URL. The attendee's calendar settings control whether they must accept the invitation.

## Set availability

| Control | Effect |
| --- | --- |
| Weekly hours | Pick a weekday and save its recurring hours. |
| One date | Set hours for one Gregorian date in Tehran. This overrides the weekly rule for that date. |
| Selected hours | Enter one or more time ranges, for example 09:00–12:00 and 14:00–17:00. An end time of 00:00 means the following midnight. |
| All day / unavailable all day | Open the complete local day or close it. Existing bookings and Google Calendar busy time still block overlapping starts. |
| Remove this rule | Remove the selected exception or weekday rule. A date without an exception follows the weekly schedule, or any existing V10 times if there is no weekly rule. |
| Meeting duration | Length of each new appointment. |
| Offer a start time every | Spacing between offered starts. A 45-minute meeting every 15 minutes in a 10:00–11:00 window offers 10:00 and 10:15. |
| Published schedule | Choose **Edit** beside a date or weekday to change it. |

To reschedule a website booking, move its existing **timed event** in the organizer’s Google Calendar. The service checks upcoming events in batches and updates the booking and emails the revised date, Tehran time and Meet link. An explicit Calendar cancellation releases the website reservation when the service receives the change.

## Records and delivery

| Sheet | Contents |
| --- | --- |
| **Enquiries** | One record per submitted form, including contact details, education stage, grade or year, service, consent and any optional birthday, institution or major. A family can submit without finishing a booking. |
| **Bookings** | One row per reservation, linked by enquiry ID. Includes the student, start and end, status, organizer calendar, event ID, Meet link and email delivery state. |
| **Availability rules** | Weekly hours and date overrides set by staff. |
| **Consultation times** | Legacy V10 slots. Setup carries previous reservations into Bookings as **Imported**. Review any upcoming imported meetings against the existing diary. New Google invitations and links are created for new website bookings. |

The private calendar link lets the student return after leaving the site. Enquiry receipts and booking confirmations are separate. A booking moves from **Reserved** to **Confirmed** once its Google Meet link exists. The event invites the student's submitted email. The branded email includes the date, Tehran time, platform, clickable link and the under-18 attendance note where applicable. Google service or email quota delays remain queued for retry. Check **Bookings** and **Apps Script → Executions** when diagnosing delayed delivery.

## Site content and checks

`index.html` holds the Persian copy and `en.html` the English copy. Both use the tab title **Vellum House** and the displayed wordmark **Vellume House · Academic Management**. The film, video poster, founder portraits and logo variants are in `assets/media/`. The supplied footage has no audio track. It plays muted after language selection, pauses when out of view and offers a play button when autoplay is restricted. Visitors who prefer reduced motion can start it manually.

Run the included source checks with `python3 tools/check.py` and the isolated booking regression suite with `node tools/test-backend.cjs`. The live Google Calendar, Sheet and inbox acceptance check is step 7 above.
