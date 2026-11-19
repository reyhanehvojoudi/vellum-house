# Vellum House — V5 conversion website

A complete bilingual static website designed around the **Point A → Point B** positioning, full or modular support, and an enquiry-first booking funnel.

**Publishing:** Copy these files over the existing GitHub Pages root. Preserve the existing repository’s `.github/` configuration, any media files you are actively using, and fonts already hosted under `assets/`. The archive intentionally contains no font files or client data. Run `python tools/build.py` to regenerate HTML from the version-controlled site source; this source supersedes the old `content.json` and old generator.

**Forms:** The static site alone cannot write private Google Sheets or send email. Install `backend/Code.gs` in a Sheet-bound Google Apps Script owned by `vellumhouse.edu@gmail.com`, run `setup()`, deploy as a Web App and paste the `/exec` endpoint into `assets/config.js`. Do **not** put credentials, spreadsheets, private links or tokens in GitHub. Until the endpoint is configured, the form honestly displays an unavailable message instead of claiming to collect enquiries.

**Booking:** Only after a unique enquiry has been saved and confirmed does the browser navigate to `https://cal.com/vhouse/30min?overlayCalendar=true&layout=month_view`. The acknowledgement email includes the link as a fallback. Booking status is initially **Not booked**, and **does not update automatically** without separate Cal.com webhook/booking reconciliation.

**Media:** Black frames are deliberate editable slots for later founder/team photography, videos, documented case studies and permissioned testimonials. No invented reviews, metrics or admission outcomes have been added.

**Privacy:** Parent or guardian should enquire for under-18s. Please confirm legal jurisdiction, retention schedule, data access and policies before making the form live; the included public policy has deliberately not asserted unverified arrangements.

See `docs/DEPLOYMENT.md` and `docs/CONTENT_TO_COMPLETE.md`.
